import {
  canonicalizeMallName,
  classifyOfferTitle,
  condenseNaturalLanguageQuery,
  detectBroadQueryKind,
  detectSupplementalQueryKind,
  extractExactQueryModel,
  extractBroadGpuSuggestionModels,
  extractGpuModel,
  extractNotebookFamilyKey,
  extractRequestedNotebookGpuModel,
  isGraphicsDeviceLikeTitle,
  isAmbiguousComparison,
  isBroadExploratoryQuery,
  isQueryIntentMismatch,
  normalizeBrand,
  normalizeQuery,
  resolvePrimaryModelForQuery,
  simplifyIntentQuery,
  stripHtml
} from "./normalize.js";
import {
  attachProviderDiagnostics,
  createProviderDiagnostics,
  readProviderDiagnostics,
  type ProviderRequestDiagnostics
} from "./providerDiagnostics.js";
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
  diagnostics?: ProviderRequestDiagnostics;
}

interface SearchSelection {
  offers: ProductOffer[];
  warning?: string;
}

interface OfferDedupeResult {
  offers: ProductOffer[];
  canonicalMallDedupeHits: number;
  crossSourceDuplicateDrops: number;
}

const SUGGESTION_QUERY_STOPWORDS = new Set([
  "시리즈",
  "SERIES",
  "계열",
  "라인업",
  "라인",
  "전체",
  "전부",
  "통으로",
  "가격",
  "비교",
  "설명",
  "노트북",
  "LAPTOP",
  "그래픽카드",
  "그래픽",
  "카드",
  "NVIDIA",
  "엔비디아",
  "GEFORCE",
  "지포스",
  "RADEON",
  "라데온"
]);

const KEYBOARD_NOISE_KEYWORDS = ["마우스", "MOUSE", "마우스패드", "MOUSEPAD"] as const;
const OFFICE_KEYWORDS = ["사무용", "오피스", "OFFICE"] as const;

type ComparisonTarget =
  | {
      status: "ok";
      query: string;
      group: ProductGroup;
      offers: ProductOffer[];
      diagnostics?: ProviderRequestDiagnostics;
    }
  | {
      status: "ambiguous";
      query: string;
      summary: string;
      warning: string;
      offers: ProductOffer[];
      diagnostics?: ProviderRequestDiagnostics;
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
    const condensedQuery = condenseNaturalLanguageQuery(input.query);
    const providerResult = await this.fetchNormalizedOffers({
      query: condensedQuery.baseQuery,
      category: input.category,
      sort: input.sort,
      excludeUsed: input.excludeUsed,
      limit: input.limit
    });

    const searchSelection = selectSearchOffers(input.query, providerResult.offers);
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

    return attachProviderDiagnostics({
      query: providerResult.query,
      summary:
        groups.length === 0
          ? `검색 결과가 없습니다: ${providerResult.query}`
          : `${providerResult.query} 기준 ${groups.length}개 모델, ${offers.length}개 판매처를 찾았습니다.`,
      ...(warning ? { warning } : {}),
      offers,
      groups
    }, providerResult.diagnostics);
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

      return attachProviderDiagnostics({
        query: target.query,
        status: "ambiguous",
        summary: target.summary,
        warning: withSuggestedQueryHint(target.warning, suggestedQueries),
        ...(suggestedQueries ? { suggestedQueries } : {}),
        selectedProductId: null,
        offers: target.offers
      }, target.diagnostics);
    }

    const offers = applyMaxOffers(target.offers, input.maxOffers);
    const minPrice = Math.min(...offers.map((offer) => offer.price));
    const maxPrice = Math.max(...offers.map((offer) => offer.price));

    return attachProviderDiagnostics({
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
    }, target.diagnostics);
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
      const broadQueryKind = comparison.status === "ambiguous" ? detectBroadQueryKind(comparison.query) : "other";

      return attachProviderDiagnostics({
        query: comparison.query,
        status: comparison.status,
        summary:
          comparison.status === "ambiguous" && broadQueryKind === "graphics-card"
            ? "정확히 같은 모델만 비교할 수 있습니다."
            : comparison.status === "ambiguous" && suggestedQueries
              ? "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요."
            : comparison.summary,
        warning: withSuggestedQueryHint(comparison.warning, suggestedQueries),
        ...(suggestedQueries ? { suggestedQueries } : {}),
        selectedProductId: comparison.selectedProductId,
        offers: comparison.offers
      }, readDiagnosticsFromResult(comparison));
    }

    const focus = input.focus ?? "lowest_price";
    const insight = createInsight(focus, comparison.comparison.minPrice, comparison.comparison.maxPrice, comparison.offers.length);

    return attachProviderDiagnostics({
      query: comparison.query,
      status: "ok",
      summary: `${comparison.summary} ${insight.message}`,
      selectedProductId: comparison.selectedProductId,
      offers: comparison.offers,
      insight
    }, readDiagnosticsFromResult(comparison));
  }

  private async fetchNormalizedOffers(input: SearchProviderInput): Promise<NormalizedSearchResult> {
    const providerResult = await this.provider.searchProducts(input);
    const dedupeResult = dedupeOffers(this.normalizeOffers(providerResult.query, providerResult.offers));

    return {
      query: providerResult.query,
      offers: dedupeResult.offers,
      diagnostics: createProviderDiagnostics(providerResult.providerReports, {
        canonicalMallDedupeHits: dedupeResult.canonicalMallDedupeHits,
        crossSourceDuplicateDrops: dedupeResult.crossSourceDuplicateDrops
      })
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

    const condensedQuery = condenseNaturalLanguageQuery(query);
    const exactQueryModel = extractExactQueryModel(query);
    const providerQuery = exactQueryModel ?? condensedQuery.baseQuery;

    const search = await this.fetchNormalizedOffers({
      query: providerQuery,
      sort: "relevance",
      excludeUsed: true,
      limit: 20
    });

    if (search.offers.length === 0) {
      const broadQueryKind = detectBroadQueryKind(providerQuery);
      const supplementalQueryKind = detectSupplementalQueryKind(providerQuery);

      if (condensedQuery.intentHints.broad || broadQueryKind !== "other" || supplementalQueryKind !== "other") {
        return {
          status: "ambiguous",
          query: providerQuery,
          summary:
            broadQueryKind === "graphics-card"
              ? "정확히 같은 모델만 비교할 수 있습니다."
              : "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
          warning:
            broadQueryKind === "graphics-card"
              ? createBroadGpuAmbiguousWarning()
              : "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명까지 포함해 다시 검색해 주세요.",
          offers: [],
          diagnostics: search.diagnostics
        };
      }

      return null;
    }

    return resolveComparisonTarget({
      query,
      offers: search.offers,
      diagnostics: search.diagnostics
    });
  }
}

function resolveComparisonTarget(options: {
  query: string;
  offers: ProductOffer[];
  forcedExactModel?: string | null;
  diagnostics?: ProviderRequestDiagnostics;
}): ComparisonTarget | null {
  const dedupedOffers = dedupeOffers(options.offers).offers;
  if (dedupedOffers.length === 0) {
    return null;
  }

    const condensedQuery = condenseNaturalLanguageQuery(options.query);
    const baseQuery = options.forcedExactModel ? simplifyIntentQuery(options.query) : condensedQuery.baseQuery;
    const exactQueryModel = options.forcedExactModel ?? extractExactQueryModel(options.query);
    const resolvedQuery = exactQueryModel ?? baseQuery;
    const broadQueryKind = exactQueryModel ? "other" : detectBroadQueryKind(baseQuery);
    const supplementalQueryKind = exactQueryModel ? "other" : detectSupplementalQueryKind(baseQuery);
  const scopedOffers = exactQueryModel ? dedupedOffers : filterBroadSearchOffers(options.query, dedupedOffers);

  if (!exactQueryModel && scopedOffers.length === 0) {
    return {
      status: "ambiguous",
      query: resolvedQuery,
      summary:
        broadQueryKind === "graphics-card"
          ? "정확히 같은 모델만 비교할 수 있습니다."
          : "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
      warning:
        broadQueryKind === "graphics-card"
          ? createBroadGpuAmbiguousWarning()
          : "렌탈, 액세서리, 완본체 같은 다른 상품군만 확인되어 비교를 중단했습니다. 더 구체적인 제품명으로 다시 검색해 주세요.",
      offers: [],
      diagnostics: options.diagnostics
    };
  }

  const comparisonOffers = filterComparisonCandidates(options.query, scopedOffers, exactQueryModel);
  const groups = buildGroups(comparisonOffers);

  if (comparisonOffers.length === 0) {
    const accessoryOnlyExactQuery = exactQueryModel
      ? hasOnlyUnsafeExactModelOffers(dedupedOffers, exactQueryModel)
      : false;
    const broadGpuQuery = !exactQueryModel && broadQueryKind === "graphics-card";

    return {
      status: "ambiguous",
      query: resolvedQuery,
      summary:
        accessoryOnlyExactQuery && !broadGpuQuery
          ? "본체가 아닌 액세서리나 구성변형이 섞여 있어 비교를 중단했습니다."
          : "정확히 같은 모델만 비교할 수 있습니다.",
      warning:
        accessoryOnlyExactQuery && !broadGpuQuery
          ? "본체가 아닌 액세서리나 구성변형이 섞여 있어 비교를 중단했습니다. 정확한 본체 상품명으로 다시 검색해 주세요."
          : broadGpuQuery
            ? createBroadGpuAmbiguousWarning()
            : createAmbiguousWarning(scopedOffers),
      offers: scopedOffers,
      diagnostics: options.diagnostics
    };
  }

  if (!exactQueryModel && broadQueryKind === "laptop") {
    return {
      status: "ambiguous",
      query: resolvedQuery,
      summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
      warning: createAmbiguousWarning(comparisonOffers),
      offers: comparisonOffers,
      diagnostics: options.diagnostics
    };
  }

  if (!exactQueryModel && supplementalQueryKind === "keyboard") {
    return {
      status: "ambiguous",
      query: resolvedQuery,
      summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
      warning: createAmbiguousWarning(comparisonOffers),
      offers: comparisonOffers,
      diagnostics: options.diagnostics
    };
  }

  if (!exactQueryModel && broadQueryKind === "graphics-card") {
    return {
      status: "ambiguous",
      query: resolvedQuery,
      summary: "정확히 같은 모델만 비교할 수 있습니다.",
      warning: createBroadGpuAmbiguousWarning(),
      offers: comparisonOffers,
      diagnostics: options.diagnostics
    };
  }

  if (!exactQueryModel && hasOnlyStaticCatalogOffers(comparisonOffers)) {
    return {
      status: "ambiguous",
      query: resolvedQuery,
      summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
      warning: createAmbiguousWarning(comparisonOffers),
      offers: comparisonOffers,
      diagnostics: options.diagnostics
    };
  }

  if ((!exactQueryModel && (isAmbiguousComparison(baseQuery, comparisonOffers) || groups.length !== 1)) || groups.length !== 1) {
    return {
      status: "ambiguous",
      query: resolvedQuery,
      summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
      warning: createAmbiguousWarning(comparisonOffers),
      offers: comparisonOffers,
      diagnostics: options.diagnostics
    };
  }

  const group = groups[0]!;

  return {
    status: "ok",
    query: resolvedQuery,
    group,
    offers: comparisonOffers.filter((offer) => offer.productId === group.productId),
    diagnostics: options.diagnostics
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

function dedupeOffers(offers: ProductOffer[]): OfferDedupeResult {
  const seen = new Set<string>();
  const deduped: ProductOffer[] = [];
  let canonicalMallDedupeHits = 0;
  let crossSourceDuplicateDrops = 0;

  for (const offer of [...offers].sort(compareOffersForRetention)) {
    const key = [offer.productId, offer.mallName, offer.price, offer.link].join("|");
    if (seen.has(key)) {
      continue;
    }

    const duplicate = findCrossSourceDuplicate(deduped, offer);
    if (duplicate) {
      crossSourceDuplicateDrops += 1;
      if (didCanonicalMallMatch(duplicate.mallName, offer.mallName)) {
        canonicalMallDedupeHits += 1;
      }
      continue;
    }

    seen.add(key);
    deduped.push(offer);
  }

  return {
    offers: deduped.sort(compareOffersForDisplay),
    canonicalMallDedupeHits,
    crossSourceDuplicateDrops
  };
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

  const suggestionCategory = detectSuggestionCategory(simplifiedQuery);
  const exactGroups = buildGroups(offers)
    .filter((group): group is ProductGroup & { normalizedModel: string } => Boolean(group.normalizedModel))
    .filter((group) =>
      detectBroadQueryKind(simplifiedQuery) === "laptop" ? !isGpuLikeModel(group.normalizedModel) : true
    )
    .filter((group) => isSuggestionCategoryCompatible(suggestionCategory, simplifiedQuery, group));

  const relevantGroups = exactGroups.filter((group) =>
    isSuggestedGroupRelevant(simplifiedQuery, group, suggestionCategory)
  );
  const fallbackGroups = getSuggestedFallbackGroups(simplifiedQuery, suggestionCategory, exactGroups);
  const candidates = Array.from(
    new Map(
      [...relevantGroups, ...fallbackGroups].map((group) => [group.normalizedModel, group] as const)
    ).values()
  ).sort((left, right) => {
      if (right.matchConfidence !== left.matchConfidence) {
        return right.matchConfidence - left.matchConfidence;
      }

      return left.minPrice - right.minPrice;
    });

  const suggestionModels = candidates.map((group) => group.normalizedModel);
  const graphicsFallbackModels =
    suggestionCategory === "graphics-card"
      ? getSuggestedGraphicsFallbackModels(simplifiedQuery, exactGroups)
      : [];

  return formatSuggestedQueries(mode, suggestionModels.length > 0 ? suggestionModels : graphicsFallbackModels);
}

function getSuggestedGraphicsFallbackModels(
  query: string,
  exactGroups: Array<ProductGroup & { normalizedModel: string }>
): string[] {
  const queryFallbackModels = extractBroadGpuSuggestionModels(query);
  if (queryFallbackModels.length === 0) {
    return [];
  }

  const familyStem = getGpuFamilyStem(queryFallbackModels[0]!);
  if (!familyStem) {
    return queryFallbackModels;
  }

  const exactFamilyModels = exactGroups
    .map((group) => group.normalizedModel)
    .filter((model) => getGpuFamilyStem(model) === familyStem);

  if (exactFamilyModels.length > 0) {
    const ordered = queryFallbackModels.filter((model) => exactFamilyModels.includes(model));
    const extra = exactFamilyModels.filter((model) => !ordered.includes(model));
    return Array.from(new Set([...ordered, ...extra])).slice(0, 3);
  }

  return queryFallbackModels;
}

function getGpuFamilyStem(model: string): string | null {
  const match = model.match(/^(RTX|RX)\s+(\d{4})/);
  if (!match?.[1] || !match[2]) {
    return null;
  }

  return `${match[1]} ${match[2]}`;
}

function formatSuggestedQueries(mode: "compare" | "explain", models: string[]): string[] | undefined {
  const suggestions: string[] = [];
  const seen = new Set<string>();

  for (const model of models) {
    const suggestion =
      mode === "compare" ? `${model} 가격 비교해 줘` : `${model} 지금 사도 괜찮은 가격대야?`;

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

function isSuggestedGroupRelevant(
  query: string,
  group: ProductGroup,
  suggestionCategory: "laptop" | "graphics-card" | "keyboard" | "monitor" | "pc-part" | "other" = detectSuggestionCategory(
    query
  )
): boolean {
  const tokens = extractSuggestedTokens(query, suggestionCategory);

  if (tokens.length === 0) {
    return true;
  }

  const haystack = normalizeQuery(`${group.title} ${group.normalizedModel ?? ""} ${group.brand ?? ""}`);
  const matchCount = tokens.filter((token) => haystack.includes(token)).length;

  return matchCount >= (suggestionCategory === "keyboard" || suggestionCategory === "monitor" || suggestionCategory === "pc-part" ? 1 : Math.min(2, tokens.length));
}

function detectSuggestionCategory(query: string): "laptop" | "graphics-card" | "keyboard" | "monitor" | "pc-part" | "other" {
  const broadQueryKind = detectBroadQueryKind(query);
  if (broadQueryKind !== "other") {
    return broadQueryKind;
  }

  return detectSupplementalQueryKind(query);
}

function extractSuggestedTokens(
  query: string,
  category: "laptop" | "graphics-card" | "keyboard" | "monitor" | "pc-part" | "other"
): string[] {
  const normalizedQuery = normalizeQuery(query);
  const tokens = normalizedQuery
    .split(" ")
    .filter((token) => token.length > 1 && !SUGGESTION_QUERY_STOPWORDS.has(token));

  if (category === "keyboard") {
    return uniqueSuggestionTokens([
      ...extractBrandHintTokens(normalizedQuery),
      ...(normalizedQuery.includes("기계식") || normalizedQuery.includes("MECHANICAL") ? ["MECHANICAL"] : []),
      ...(normalizedQuery.includes("무선") || normalizedQuery.includes("WIRELESS") ? ["WIRELESS"] : []),
      ...(normalizedQuery.includes("게이밍") || normalizedQuery.includes("GAMING") ? ["GAMING"] : []),
      ...tokens
    ]);
  }

  if (category === "monitor") {
    return uniqueSuggestionTokens([
      ...extractBrandHintTokens(normalizedQuery),
      ...extractMonitorHintTokens(normalizedQuery),
      ...tokens
    ]);
  }

  if (category === "pc-part") {
    return uniqueSuggestionTokens([
      ...extractBrandHintTokens(normalizedQuery),
      ...extractPcPartHintTokens(normalizedQuery),
      ...tokens
    ]);
  }

  return uniqueSuggestionTokens(tokens);
}

function extractBrandHintTokens(normalizedQuery: string): string[] {
  const aliasEntries = [
    { canonical: "KEYCHRON", cues: ["KEYCHRON", "키크론"] },
    { canonical: "LOGITECH", cues: ["LOGITECH", "로지텍"] },
    { canonical: "ABKO", cues: ["ABKO", "앱코"] },
    { canonical: "DRUNKDEER", cues: ["DRUNKDEER"] },
    { canonical: "LG", cues: ["LG", "엘지"] },
    { canonical: "DELL", cues: ["DELL"] },
    { canonical: "MSI", cues: ["MSI", "엠에스아이"] },
    { canonical: "SAMSUNG", cues: ["SAMSUNG", "삼성"] },
    { canonical: "ASUS", cues: ["ASUS", "아수스", "에이수스"] },
    { canonical: "ASROCK", cues: ["ASROCK", "애즈락"] },
    { canonical: "BIOSTAR", cues: ["BIOSTAR", "바이오스타"] },
    { canonical: "GIGABYTE", cues: ["GIGABYTE", "기가바이트"] },
    { canonical: "COOLERMASTER", cues: ["COOLERMASTER", "쿨러마스터"] },
    { canonical: "SUPERFLOWER", cues: ["SUPERFLOWER"] },
    { canonical: "KLEVV", cues: ["KLEVV", "클레브", "에센코어"] },
    { canonical: "WD", cues: ["WD"] },
    { canonical: "AMD", cues: ["AMD"] }
  ] as const;

  return aliasEntries
    .filter((entry) => entry.cues.some((cue) => normalizedQuery.includes(cue)))
    .map((entry) => entry.canonical);
}

function extractMonitorHintTokens(normalizedQuery: string): string[] {
  const hints: string[] = [];
  const sizeMatch = normalizedQuery.match(/\b(24|27|29|32|34|38|40|43)\s*(인치|형)?\b/);
  if (sizeMatch?.[1]) {
    hints.push(sizeMatch[1]);
  }

  if (normalizedQuery.includes("4K") || normalizedQuery.includes("UHD")) {
    hints.push("4K");
    hints.push("UHD");
  }

  if (normalizedQuery.includes("QHD")) {
    hints.push("QHD");
  }

  if (normalizedQuery.includes("FHD")) {
    hints.push("FHD");
  }

  if (normalizedQuery.includes("울트라와이드") || normalizedQuery.includes("ULTRAWIDE")) {
    hints.push("울트라와이드");
    hints.push("ULTRAWIDE");
  }

  return hints;
}

function extractPcPartHintTokens(normalizedQuery: string): string[] {
  const hints: string[] = [];

  for (const match of normalizedQuery.matchAll(/\b(B\d{3,4}M?)\b/g)) {
    hints.push(match[1]);
  }

  for (const match of normalizedQuery.matchAll(/\b(\d{3,4})W\b/g)) {
    hints.push(`${match[1]}W`);
    hints.push(match[1]);
  }

  for (const match of normalizedQuery.matchAll(/\b(16GB|32GB|64GB|1TB|2TB|4TB)\b/g)) {
    hints.push(match[1]);
  }

  for (const hint of ["DDR5", "DDR4", "NVME", "SSD", "RYZEN", "INTEL"]) {
    if (normalizedQuery.includes(hint)) {
      hints.push(hint);
    }
  }

  return hints;
}

function uniqueSuggestionTokens(tokens: string[]): string[] {
  return Array.from(new Set(tokens.filter((token) => token.length > 0)));
}

function getSuggestedFallbackGroups(
  query: string,
  category: "laptop" | "graphics-card" | "keyboard" | "monitor" | "pc-part" | "other",
  groups: Array<ProductGroup & { normalizedModel: string }>
): Array<ProductGroup & { normalizedModel: string }> {
  if (category !== "keyboard" && category !== "monitor" && category !== "pc-part") {
    return [];
  }

  const normalizedQuery = normalizeQuery(query);
  const brandHints = extractBrandHintTokens(normalizedQuery);

  return groups.filter((group) => {
    const haystack = normalizeQuery(`${group.title} ${group.normalizedModel} ${group.brand ?? ""}`);

    if (brandHints.length > 0 && !brandHints.some((hint) => haystack.includes(hint))) {
      return false;
    }

    return isSuggestionCategoryCompatible(category, query, group);
  });
}

function isSuggestionCategoryCompatible(
  category: "laptop" | "graphics-card" | "keyboard" | "monitor" | "pc-part" | "other",
  query: string,
  group: ProductGroup
): boolean {
  const normalizedQuery = normalizeQuery(query);
  const haystack = normalizeQuery(`${group.title} ${group.normalizedModel ?? ""} ${group.brand ?? ""}`);

  if (category === "keyboard") {
    if (KEYBOARD_NOISE_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
      return false;
    }

    if (
      (normalizedQuery.includes("게이밍") || normalizedQuery.includes("GAMING")) &&
      OFFICE_KEYWORDS.some((keyword) => haystack.includes(keyword))
    ) {
      return false;
    }

    const brandHints = extractBrandHintTokens(normalizedQuery);
    return brandHints.length === 0 || brandHints.some((hint) => haystack.includes(hint));
  }

  if (category === "monitor") {
    const querySize = extractMonitorHintTokens(normalizedQuery).find((token) => /^\d{2}$/.test(token));
    const haystackSize = extractMonitorHintTokens(haystack).find((token) => /^\d{2}$/.test(token));

    if (querySize && haystackSize && querySize !== haystackSize) {
      return false;
    }

    const queryHasQhd = normalizedQuery.includes("QHD");
    const queryHasUhd = normalizedQuery.includes("4K") || normalizedQuery.includes("UHD");

    if (queryHasQhd && (haystack.includes("4K") || haystack.includes("UHD"))) {
      return false;
    }

    if (queryHasUhd && haystack.includes("QHD")) {
      return false;
    }
  }

  if (category === "pc-part") {
    for (const chipset of extractPcPartHintTokens(normalizedQuery).filter((token) => /^B\d{3,4}M?$/.test(token))) {
      if (!haystack.includes(chipset)) {
        return false;
      }
    }

    for (const capacity of extractPcPartHintTokens(normalizedQuery).filter((token) => /(GB|TB)$/.test(token))) {
      if (!haystack.includes(capacity)) {
        return false;
      }
    }

    if (normalizedQuery.includes("DDR5") && !haystack.includes("DDR5")) {
      return false;
    }

    const wattHint = extractPcPartHintTokens(normalizedQuery).find((token) => token.endsWith("W"));
    if (wattHint) {
      const numericWatt = wattHint.replace("W", "");
      if (!haystack.includes(wattHint) && !haystack.includes(numericWatt)) {
        return false;
      }
    }
  }

  return true;
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
  "프라이버시 필터",
  "PRIVACY FILTER",
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
  "보안기",
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
  return (
    isExcludedByPromptTerms(query, offer) ||
    isAccessoryLikeOffer(query, offer) ||
    isConfigVariantOffer(offer.title)
  );
}

function isBroadSearchExcludedOffer(
  query: string,
  offer: ProductOffer,
  broadQueryKind: "graphics-card" | "laptop" | "other"
): boolean {
  if (isExcludedByPromptTerms(query, offer)) {
    return true;
  }

  if (isQueryIntentMismatch(query, offer.title)) {
    return true;
  }

  if (isComparisonExcludedOffer(query, offer)) {
    return true;
  }

  const keywordFlags = classifyOfferTitle(offer.title);
  const supplementalQueryKind = detectSupplementalQueryKind(query);

  if (keywordFlags.isRental) {
    return true;
  }

  if (broadQueryKind === "graphics-card") {
    return keywordFlags.isGpuAccessory || keywordFlags.isDesktopPc || !isGraphicsDeviceLikeTitle(offer.title);
  }

  if (broadQueryKind === "laptop") {
    const requestedGpuModel = extractRequestedNotebookGpuModel(query);
    const offerGpuModel = extractGpuModel(offer.title);

    if (requestedGpuModel && offerGpuModel && requestedGpuModel !== offerGpuModel) {
      return true;
    }

    return keywordFlags.isNotebookAccessory;
  }

  if (supplementalQueryKind === "pc-part") {
    return keywordFlags.isDesktopPc;
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

function isExcludedByPromptTerms(query: string, offer: ProductOffer): boolean {
  const excludedTerms = condenseNaturalLanguageQuery(query).excludedTerms;
  if (excludedTerms.length === 0) {
    return false;
  }

  const normalizedTitle = normalizeQuery(offer.title);
  return excludedTerms.some((term) => normalizedTitle.includes(normalizeQuery(term)));
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

function createBroadGpuAmbiguousWarning(): string {
  return "시리즈/계열 검색이라 동일상품 비교를 중단했습니다. RTX 5070, RTX 5070 Ti처럼 정확한 모델로 다시 검색해 주세요.";
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

    const displaySort = compareOffersForDisplay(left, right);
    if (displaySort !== 0) {
      return displaySort;
    }

    return left.title.localeCompare(right.title);
  })[0]!;
}

function readDiagnosticsFromResult(result: { [key: string]: unknown }): ProviderRequestDiagnostics | undefined {
  return readProviderDiagnostics(result);
}

function compareOffersForRetention(left: ProductOffer, right: ProductOffer): number {
  if (left.price !== right.price) {
    return left.price - right.price;
  }

  const leftInfoScore = calculateOfferInfoScore(left);
  const rightInfoScore = calculateOfferInfoScore(right);
  if (leftInfoScore !== rightInfoScore) {
    return rightInfoScore - leftInfoScore;
  }

  const sourcePriority = compareSourcePriority(left.source, right.source);
  if (sourcePriority !== 0) {
    return sourcePriority;
  }

  return left.title.localeCompare(right.title);
}

function compareOffersForDisplay(left: ProductOffer, right: ProductOffer): number {
  if (left.price !== right.price) {
    return left.price - right.price;
  }

  const sourcePriority = compareSourcePriority(left.source, right.source);
  if (sourcePriority !== 0) {
    return sourcePriority;
  }

  return left.title.localeCompare(right.title);
}

function compareSourcePriority(
  left: ProductOffer["source"],
  right: ProductOffer["source"]
): number {
  return getSourcePriority(left) - getSourcePriority(right);
}

function hasOnlyStaticCatalogOffers(offers: ProductOffer[]): boolean {
  return offers.length > 0 && offers.every((offer) => offer.source === "static-catalog");
}

function getSourcePriority(source: ProductOffer["source"]): number {
  if (source === "naver-shopping") {
    return 0;
  }

  if (source === "danawa") {
    return 1;
  }

  return 2;
}

function calculateOfferInfoScore(offer: ProductOffer): number {
  return [offer.brand, offer.image, offer.link].filter(Boolean).length;
}

function createCrossSourceDuplicateKey(offer: ProductOffer): string | null {
  const canonicalMallKey = getCanonicalMallKey(offer.mallName);
  if (!offer.normalizedModel || !canonicalMallKey) {
    return null;
  }

  const identityKey =
    normalizeDuplicateToken(offer.link) ||
    normalizeDuplicateToken(offer.title) ||
    normalizeDuplicateToken(offer.sourceProductId);

  if (!identityKey) {
    return null;
  }

  return [offer.normalizedModel, canonicalMallKey, identityKey].join("|");
}

function normalizeDuplicateToken(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return normalizeQuery(value.replace(/^https?:\/\//i, "").replace(/\?.*$/, ""));
}

function findCrossSourceDuplicate(existingOffers: ProductOffer[], candidate: ProductOffer): ProductOffer | null {
  if (!candidate.normalizedModel) {
    return null;
  }

  const candidateMallKey = getCanonicalMallKey(candidate.mallName);
  if (!candidateMallKey) {
    return null;
  }

  for (const existing of existingOffers) {
    if (existing.source === candidate.source) {
      continue;
    }

    if (existing.normalizedModel !== candidate.normalizedModel) {
      continue;
    }

    if (getCanonicalMallKey(existing.mallName) !== candidateMallKey) {
      continue;
    }

    if (!isReasonableDuplicatePriceGap(existing.price, candidate.price)) {
      continue;
    }

    if (createCrossSourceDuplicateKey(existing) && createCrossSourceDuplicateKey(existing) === createCrossSourceDuplicateKey(candidate)) {
      return existing;
    }

    if (normalizeDuplicateToken(existing.title) === normalizeDuplicateToken(candidate.title)) {
      return existing;
    }
  }

  return null;
}

function getCanonicalMallKey(mallName: string | null | undefined): string {
  return canonicalizeMallName(mallName) ?? "";
}

function didCanonicalMallMatch(leftMallName: string, rightMallName: string): boolean {
  const leftCanonical = getCanonicalMallKey(leftMallName);
  const rightCanonical = getCanonicalMallKey(rightMallName);
  if (!leftCanonical || leftCanonical !== rightCanonical) {
    return false;
  }

  return normalizeDuplicateToken(leftMallName) !== normalizeDuplicateToken(rightMallName);
}

function isReasonableDuplicatePriceGap(leftPrice: number, rightPrice: number): boolean {
  const minPrice = Math.min(leftPrice, rightPrice);
  const maxAllowedGap = Math.max(5000, Math.round(minPrice * 0.05));
  return Math.abs(leftPrice - rightPrice) <= maxAllowedGap;
}
