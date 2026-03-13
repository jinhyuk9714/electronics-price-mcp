import {
  classifyOfferTitle,
  detectBroadQueryKind,
  extractExactQueryModel,
  extractGpuModel,
  extractNotebookFamilyKey,
  extractRequestedNotebookGpuModel,
  isAmbiguousComparison,
  isBroadExploratoryQuery,
  normalizeBrand,
  normalizeQuery,
  resolvePrimaryModelForQuery,
  simplifyIntentQuery,
  stripHtml
} from "./normalize.js";
import type {
  CompareProductPricesInput,
  CompareProductPricesResult,
  ExplainPurchaseOptionsInput,
  ExplainPurchaseOptionsResult,
  ExplainFocus,
  ProductGroup,
  ProductOffer,
  SearchProviderInput,
  SearchProductsInput,
  SearchProductsResult,
  SearchProvider
} from "./types.js";

interface CacheEntry {
  expiresAt: number;
  query: string;
  group: ProductGroup;
  offers: ProductOffer[];
}

interface NormalizedSearchResult {
  query: string;
  offers: ProductOffer[];
}

interface SearchSelection {
  offers: ProductOffer[];
  warning?: string;
}

const SUGGESTION_QUERY_STOPWORDS = new Set(["시리즈", "SERIES", "가격", "비교", "설명", "노트북", "LAPTOP"]);

type ComparisonTarget =
  | {
      status: "ok";
      query: string;
      group: ProductGroup;
      offers: ProductOffer[];
    }
  | {
      status: "ambiguous";
      query: string;
      summary: string;
      warning: string;
      offers: ProductOffer[];
    };

export class PriceService {
  private readonly provider: SearchProvider;
  private readonly cacheTtlMs: number;
  private readonly now: () => number;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(options: { provider: SearchProvider; cacheTtlMs?: number; now?: () => number }) {
    this.provider = options.provider;
    this.cacheTtlMs = options.cacheTtlMs ?? 5 * 60 * 1000;
    this.now = options.now ?? (() => Date.now());
  }

  async searchProducts(input: SearchProductsInput): Promise<SearchProductsResult> {
    const providerResult = await this.fetchNormalizedOffers({
      query: input.query,
      category: input.category,
      sort: input.sort,
      excludeUsed: input.excludeUsed,
      limit: input.limit
    });

    const searchSelection = selectSearchOffers(providerResult.query, providerResult.offers);
    const offers = searchSelection.offers.filter((offer) =>
      typeof input.budgetMax === "number" ? offer.price <= input.budgetMax : true
    );
    const groups = buildGroups(offers);
    const warning = offers.length === 0 && searchSelection.offers.length === 0 ? searchSelection.warning : undefined;

    for (const group of groups) {
      const relatedOffers = offers.filter((offer) => offer.productId === group.productId);
      this.cache.set(group.productId, {
        expiresAt: this.now() + this.cacheTtlMs,
        query: providerResult.query,
        group,
        offers: relatedOffers
      });
    }

    return {
      query: providerResult.query,
      summary:
        groups.length === 0
          ? `검색 결과가 없습니다: ${providerResult.query}`
          : `${providerResult.query} 기준 ${groups.length}개 모델, ${offers.length}개 판매처를 찾았습니다.`,
      ...(warning ? { warning } : {}),
      offers,
      groups
    };
  }

  async compareProductPrices(input: CompareProductPricesInput): Promise<CompareProductPricesResult> {
    const target = await this.resolveTarget(input.productId, input.query);

    if (!target) {
      return {
        query: input.query ?? "",
        status: "not_found",
        summary: "비교할 제품을 찾지 못했습니다. 검색어를 더 구체적으로 입력해 주세요.",
        selectedProductId: null,
        offers: []
      };
    }

    if (target.status === "ambiguous") {
      const suggestedQueries = createSuggestedQueries(target.query, target.offers, "compare");

      return {
        query: target.query,
        status: "ambiguous",
        summary: target.summary,
        warning: withSuggestedQueryHint(target.warning, suggestedQueries),
        ...(suggestedQueries ? { suggestedQueries } : {}),
        selectedProductId: null,
        offers: target.offers
      };
    }

    const offers = applyMaxOffers(target.offers, input.maxOffers);
    const minPrice = Math.min(...offers.map((offer) => offer.price));
    const maxPrice = Math.max(...offers.map((offer) => offer.price));

    return {
      query: target.query,
      status: "ok",
      summary: `${target.group.title} 기준 최저가 ${minPrice}원, 최고가 ${maxPrice}원, 판매처 ${offers.length}곳입니다.`,
      selectedProductId: target.group.productId,
      offers,
      comparison: {
        normalizedModel: target.group.normalizedModel,
        minPrice,
        maxPrice,
        mallCount: offers.length,
        spread: maxPrice - minPrice
      }
    };
  }

  async explainPurchaseOptions(input: ExplainPurchaseOptionsInput): Promise<ExplainPurchaseOptionsResult> {
    const comparison = await this.compareProductPrices({
      productId: input.productId,
      query: input.query
    });

    if (comparison.status !== "ok" || !comparison.comparison) {
      const suggestedQueries =
        comparison.status === "ambiguous"
          ? createSuggestedQueries(comparison.query, comparison.offers, "explain")
          : undefined;

      return {
        query: comparison.query,
        status: comparison.status,
        summary:
          comparison.status === "ambiguous" && suggestedQueries
            ? "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요."
            : comparison.summary,
        warning: withSuggestedQueryHint(comparison.warning, suggestedQueries),
        ...(suggestedQueries ? { suggestedQueries } : {}),
        selectedProductId: comparison.selectedProductId,
        offers: comparison.offers
      };
    }

    const focus = input.focus ?? "lowest_price";
    const insight = createInsight(focus, comparison.comparison.minPrice, comparison.comparison.maxPrice, comparison.offers.length);

    return {
      query: comparison.query,
      status: "ok",
      summary: `${comparison.summary} ${insight.message}`,
      selectedProductId: comparison.selectedProductId,
      offers: comparison.offers,
      insight
    };
  }

  private async fetchNormalizedOffers(input: SearchProviderInput): Promise<NormalizedSearchResult> {
    const providerResult = await this.provider.searchProducts(input);

    return {
      query: providerResult.query,
      offers: dedupeOffers(this.normalizeOffers(providerResult.query, providerResult.offers))
    };
  }

  private normalizeOffers(query: string, offers: ProductOffer[]): ProductOffer[];
  private normalizeOffers(query: string, offers: Array<Omit<ProductOffer, "productId" | "normalizedModel" | "matchConfidence">>): ProductOffer[];
  private normalizeOffers(query: string, offers: Array<Omit<ProductOffer, "productId" | "normalizedModel" | "matchConfidence">>): ProductOffer[] {
    const normalizedQuery = normalizeQuery(query);

    return offers.map((offer) => {
      const brand = normalizeBrand(offer.brand);
      const normalizedModel = resolvePrimaryModelForQuery(query, offer.title);
      const notebookFamilyKey = normalizedModel ? null : extractNotebookFamilyKey(query, offer.title, brand);
      const productId = createProductId(normalizedModel ?? notebookFamilyKey ?? offer.title);

      return {
        ...offer,
        title: stripHtml(offer.title),
        brand,
        productId,
        normalizedModel,
        matchConfidence: calculateMatchConfidence(normalizedQuery, normalizedModel, offer.title)
      };
    });
  }

  private getCached(productId: string): CacheEntry | null {
    const cached = this.cache.get(productId);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < this.now()) {
      this.cache.delete(productId);
      return null;
    }

    return cached;
  }

  private async resolveTarget(productId?: string, query?: string): Promise<ComparisonTarget | null> {
    if (productId) {
      const cached = this.getCached(productId);
      if (cached) {
        return resolveComparisonTarget({
          query: cached.query,
          offers: cached.offers,
          forcedExactModel: cached.group.normalizedModel
        });
      }
    }

    if (!query) {
      return null;
    }

    const providerQuery = simplifyIntentQuery(query);

    const search = await this.fetchNormalizedOffers({
      query: providerQuery,
      sort: "relevance",
      excludeUsed: true,
      limit: 20
    });

    if (search.offers.length === 0) {
      return null;
    }

    return resolveComparisonTarget({
      query: providerQuery,
      offers: search.offers
    });
  }
}

function resolveComparisonTarget(options: {
  query: string;
  offers: ProductOffer[];
  forcedExactModel?: string | null;
}): ComparisonTarget | null {
  const dedupedOffers = dedupeOffers(options.offers);
  if (dedupedOffers.length === 0) {
    return null;
  }

  const exactQueryModel = options.forcedExactModel ?? extractExactQueryModel(options.query);
  const scopedOffers = exactQueryModel ? dedupedOffers : filterBroadSearchOffers(options.query, dedupedOffers);

  if (!exactQueryModel && scopedOffers.length === 0) {
    return {
      status: "ambiguous",
      query: options.query,
      summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
      warning: "렌탈, 액세서리, 완본체 같은 다른 상품군만 확인되어 비교를 중단했습니다. 더 구체적인 제품명으로 다시 검색해 주세요.",
      offers: []
    };
  }

  const comparisonOffers = filterComparisonCandidates(options.query, scopedOffers, exactQueryModel);
  const groups = buildGroups(comparisonOffers);

  if (comparisonOffers.length === 0) {
    const accessoryOnlyExactQuery = exactQueryModel
      ? hasOnlyUnsafeExactModelOffers(dedupedOffers, exactQueryModel)
      : false;

    return {
      status: "ambiguous",
      query: options.query,
      summary: accessoryOnlyExactQuery
        ? "본체가 아닌 액세서리나 구성변형이 섞여 있어 비교를 중단했습니다."
        : "정확히 같은 모델만 비교할 수 있습니다.",
      warning: accessoryOnlyExactQuery
        ? "본체가 아닌 액세서리나 구성변형이 섞여 있어 비교를 중단했습니다. 정확한 본체 상품명으로 다시 검색해 주세요."
        : createAmbiguousWarning(scopedOffers),
      offers: scopedOffers
    };
  }

  if (!exactQueryModel && detectBroadQueryKind(options.query) === "laptop") {
    return {
      status: "ambiguous",
      query: options.query,
      summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
      warning: createAmbiguousWarning(comparisonOffers),
      offers: comparisonOffers
    };
  }

  if ((!exactQueryModel && (isAmbiguousComparison(options.query, comparisonOffers) || groups.length !== 1)) || groups.length !== 1) {
    return {
      status: "ambiguous",
      query: options.query,
      summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
      warning: createAmbiguousWarning(comparisonOffers),
      offers: comparisonOffers
    };
  }

  const group = groups[0]!;

  return {
    status: "ok",
    query: options.query,
    group,
    offers: comparisonOffers.filter((offer) => offer.productId === group.productId)
  };
}

function selectSearchOffers(query: string, offers: ProductOffer[]): SearchSelection {
  const exactQueryModel = extractExactQueryModel(query);

  if (!exactQueryModel) {
    const broadOffers = filterBroadSearchOffers(query, offers);

    return {
      offers: broadOffers,
      ...(offers.length > 0 && broadOffers.length === 0
        ? {
            warning: "렌탈, 액세서리, 완본체 같은 다른 상품군만 확인되어 검색 결과를 비웠습니다. 더 구체적인 제품명으로 다시 검색해 주세요."
          }
        : {})
    };
  }

  const exactModelOffers = offers.filter((offer) => offer.normalizedModel === exactQueryModel);
  const filteredOffers = filterComparisonCandidates(query, offers, exactQueryModel);

  if (filteredOffers.length > 0) {
    return {
      offers: filteredOffers
    };
  }

  if (exactModelOffers.length > 0) {
    return {
      offers: [],
      warning: "본체가 아닌 액세서리나 구성변형만 확인되어 검색 결과를 비웠습니다. 정확한 본체 상품명으로 다시 검색해 주세요."
    };
  }

  if (hasCompetingExactModelOffers(offers, exactQueryModel)) {
    return {
      offers: [],
      warning: "정확한 모델과 일치하지 않는 변형이나 다른 세대가 섞여 검색 결과를 비웠습니다. 모델 코드나 변형명까지 포함해 다시 검색해 주세요."
    };
  }

  return {
    offers: [],
    warning: "정확한 모델과 일치하는 본체 상품을 찾지 못했습니다. 모델 코드나 변형명까지 포함해 다시 검색해 주세요."
  };
}

function dedupeOffers(offers: ProductOffer[]): ProductOffer[] {
  const seen = new Set<string>();
  const deduped: ProductOffer[] = [];

  for (const offer of offers) {
    const key = [offer.productId, offer.mallName, offer.price, offer.link].join("|");
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(offer);
  }

  return deduped.sort((left, right) => left.price - right.price);
}

function buildGroups(offers: ProductOffer[]): ProductGroup[] {
  const grouped = new Map<string, ProductOffer[]>();

  for (const offer of offers) {
    const bucket = grouped.get(offer.productId) ?? [];
    bucket.push(offer);
    grouped.set(offer.productId, bucket);
  }

  return Array.from(grouped.entries())
    .map(([productId, bucket]) => {
      const minPrice = Math.min(...bucket.map((offer) => offer.price));
      const maxPrice = Math.max(...bucket.map((offer) => offer.price));
      const representative = pickRepresentativeOffer(bucket);

      return {
        productId,
        normalizedModel: representative.normalizedModel,
        title: representative.title,
        brand: representative.brand,
        minPrice,
        maxPrice,
        offerCount: bucket.length,
        matchConfidence: Math.max(...bucket.map((offer) => offer.matchConfidence))
      };
    })
    .sort((left, right) => {
      const leftRank = getGroupSortRank(left);
      const rightRank = getGroupSortRank(right);

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      if (left.minPrice !== right.minPrice) {
        return left.minPrice - right.minPrice;
      }

      return left.title.localeCompare(right.title);
    });
}

function createSuggestedQueries(
  query: string,
  offers: ProductOffer[],
  mode: "compare" | "explain"
): string[] | undefined {
  const simplifiedQuery = simplifyIntentQuery(query);
  if (extractExactQueryModel(simplifiedQuery)) {
    return undefined;
  }

  const candidates = buildGroups(offers)
    .filter((group): group is ProductGroup & { normalizedModel: string } => Boolean(group.normalizedModel))
    .filter((group) =>
      detectBroadQueryKind(simplifiedQuery) === "laptop" ? !isGpuLikeModel(group.normalizedModel) : true
    )
    .filter((group) => isSuggestedGroupRelevant(simplifiedQuery, group))
    .sort((left, right) => {
      if (right.matchConfidence !== left.matchConfidence) {
        return right.matchConfidence - left.matchConfidence;
      }

      return left.minPrice - right.minPrice;
    });

  const suggestions: string[] = [];
  const seen = new Set<string>();

  for (const group of candidates) {
    const suggestion =
      mode === "compare"
        ? `${group.normalizedModel} 가격 비교해 줘`
        : `${group.normalizedModel} 지금 사도 괜찮은 가격대야?`;

    if (seen.has(suggestion)) {
      continue;
    }

    seen.add(suggestion);
    suggestions.push(suggestion);

    if (suggestions.length === 3) {
      break;
    }
  }

  return suggestions.length > 0 ? suggestions : undefined;
}

function isSuggestedGroupRelevant(query: string, group: ProductGroup): boolean {
  const tokens = normalizeQuery(query)
    .split(" ")
    .filter((token) => token.length > 1 && !SUGGESTION_QUERY_STOPWORDS.has(token));

  if (tokens.length === 0) {
    return true;
  }

  const haystack = normalizeQuery(`${group.title} ${group.normalizedModel ?? ""}`);
  const matchCount = tokens.filter((token) => haystack.includes(token)).length;

  return matchCount >= Math.min(2, tokens.length);
}

function calculateMatchConfidence(query: string, normalizedModel: string | null, title: string): number {
  const normalizedTitle = normalizeQuery(title);

  if (normalizedModel && query.includes(normalizedModel)) {
    return normalizedTitle.includes(normalizedModel) ? 1 : 0.98;
  }

  if (normalizedModel) {
    const compactQuery = query.replace(/\s+/g, "");
    const compactModel = normalizedModel.replace(/\s+/g, "");
    if (compactModel.includes(compactQuery) || compactQuery.includes(compactModel)) {
      return 0.95;
    }

    return 0.8;
  }

  return normalizedTitle.includes(query) ? 0.6 : 0.4;
}

function createProductId(seed: string): string {
  const normalized = normalizeQuery(seed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "unclassified-product";
}

function getGroupSortRank(group: ProductGroup): number {
  if (group.normalizedModel) {
    return 0;
  }

  if (group.productId.startsWith("notebook-family-")) {
    return 1;
  }

  return 2;
}

function applyMaxOffers(offers: ProductOffer[], maxOffers?: number): ProductOffer[] {
  if (!maxOffers || maxOffers <= 0) {
    return offers;
  }

  return offers.slice(0, maxOffers);
}

function createInsight(focus: ExplainFocus, minPrice: number, maxPrice: number, mallCount: number) {
  const spread = maxPrice - minPrice;

  switch (focus) {
    case "seller_variety":
      return {
        focus,
        message: `현재 확인된 판매처는 ${mallCount}곳이며 가격 차이는 ${spread}원입니다.`
      };
    case "brand":
      return {
        focus,
        message: `같은 모델 기준으로 판매처별 가격 차이는 ${spread}원입니다. 브랜드보다 모델 일치 여부를 우선 확인하세요.`
      };
    case "lowest_price":
    default:
      return {
        focus: "lowest_price" as const,
        message: `현재 최저가는 ${minPrice}원이고 최고가와의 차이는 ${spread}원입니다.`
      };
  }
}

const ACCESSORY_KEYWORDS = [
  "케이스",
  "보호필름",
  "필름",
  "어댑터",
  "충전기",
  "케이블",
  "파우치",
  "가방",
  "거치대",
  "스탠드",
  "커버",
  "키커버",
  "키스킨",
  "키캡",
  "덮개",
  "번들",
  "패키지",
  "BUNDLE"
] as const;

const CONFIG_VARIANT_KEYWORDS = [
  "추가",
  "교체",
  "업그레이드",
  "사은품",
  "증정",
  "무선광"
] as const;

const DEVICE_SERIES_CUES = [
  "그램",
  "GALAXYBOOK",
  "갤럭시북",
  "MACBOOK",
  "맥북",
  "VIVOBOOK",
  "ZENBOOK",
  "THINKPAD",
  "IDEAPAD",
  "INSPIRON",
  "PAVILION",
  "RTX",
  "RX",
  "GEFORCE",
  "RADEON"
] as const;

function filterBroadSearchOffers(query: string, offers: ProductOffer[]): ProductOffer[] {
  if (!isBroadExploratoryQuery(query)) {
    return offers;
  }

  const broadQueryKind = detectBroadQueryKind(query);

  return offers.filter((offer) => !isBroadSearchExcludedOffer(query, offer, broadQueryKind));
}

function filterComparisonCandidates(
  query: string,
  offers: ProductOffer[],
  exactQueryModel: string | null
): ProductOffer[] {
  return offers.filter((offer) => {
    if (exactQueryModel && offer.normalizedModel !== exactQueryModel) {
      return false;
    }

    return !isComparisonExcludedOffer(query, offer);
  });
}

function isAccessoryLikeOffer(query: string, offer: ProductOffer): boolean {
  const normalizedTitle = normalizeQuery(offer.title);
  const normalizedQuery = normalizeQuery(query);

  const hasAccessoryKeyword = ACCESSORY_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword));
  if (!hasAccessoryKeyword) {
    return false;
  }

  if (offer.normalizedModel) {
    return true;
  }

  return DEVICE_SERIES_CUES.some(
    (cue) => normalizedTitle.includes(cue) || normalizedQuery.includes(cue)
  );
}

function isComparisonExcludedOffer(query: string, offer: ProductOffer): boolean {
  return isAccessoryLikeOffer(query, offer) || isConfigVariantOffer(offer.title);
}

function isBroadSearchExcludedOffer(
  query: string,
  offer: ProductOffer,
  broadQueryKind: "graphics-card" | "laptop" | "other"
): boolean {
  if (isComparisonExcludedOffer(query, offer)) {
    return true;
  }

  const keywordFlags = classifyOfferTitle(offer.title);

  if (keywordFlags.isRental) {
    return true;
  }

  if (broadQueryKind === "graphics-card") {
    return keywordFlags.isGpuAccessory || keywordFlags.isDesktopPc;
  }

  if (broadQueryKind === "laptop") {
    const requestedGpuModel = extractRequestedNotebookGpuModel(query);
    const offerGpuModel = extractGpuModel(offer.title);

    if (requestedGpuModel && offerGpuModel && requestedGpuModel !== offerGpuModel) {
      return true;
    }

    return keywordFlags.isNotebookAccessory;
  }

  return false;
}

function isConfigVariantOffer(title: string): boolean {
  const normalizedTitle = normalizeQuery(title);

  return (
    /\+\s*(?:NVME|SSD|RAM|메모리|저장|추가|교체|업그레이드|사은품|증정|무선광|파우치|케이스|키스킨|키커버|마우스|키보드)/.test(
      normalizedTitle
    ) || CONFIG_VARIANT_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))
  );
}

function isGpuLikeModel(value: string): boolean {
  return value.startsWith("RTX ") || value.startsWith("RX ");
}

function hasOnlyUnsafeExactModelOffers(offers: ProductOffer[], exactQueryModel: string): boolean {
  const matchingOffers = offers.filter((offer) => offer.normalizedModel === exactQueryModel);

  return matchingOffers.length > 0 && matchingOffers.every((offer) => isComparisonExcludedOffer(exactQueryModel, offer));
}

function hasCompetingExactModelOffers(offers: ProductOffer[], exactQueryModel: string): boolean {
  return offers.some((offer) => offer.normalizedModel && offer.normalizedModel !== exactQueryModel);
}

function createAmbiguousWarning(offers: ProductOffer[]): string {
  const hasGpuVariant = offers.some(
    (offer) =>
      offer.normalizedModel?.includes(" TI") ||
      offer.normalizedModel?.includes(" SUPER") ||
      offer.normalizedModel?.includes(" XT") ||
      offer.normalizedModel?.includes(" GRE")
  );

  if (hasGpuVariant) {
    return "정확한 모델이 여러 개 섞여 있어 바로 판단할 수 없습니다. 모델 코드나 변형명(Ti, SUPER, XT 등)을 포함해 다시 검색해 주세요.";
  }

  return "정확한 모델이 여러 개 섞여 있어 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명까지 포함해 다시 검색해 주세요.";
}

function withSuggestedQueryHint(warning: string | undefined, suggestedQueries: string[] | undefined): string | undefined {
  if (!warning) {
    return undefined;
  }

  if (!suggestedQueries || suggestedQueries.length === 0 || warning.includes("추천 검색어")) {
    return warning;
  }

  return `${warning} 아래 추천 검색어를 바로 써보세요.`;
}

function pickRepresentativeOffer(offers: ProductOffer[]): ProductOffer {
  return [...offers].sort((left, right) => {
    if (right.matchConfidence !== left.matchConfidence) {
      return right.matchConfidence - left.matchConfidence;
    }

    if (left.price !== right.price) {
      return left.price - right.price;
    }

    return left.title.localeCompare(right.title);
  })[0]!;
}
