import {
  extractNormalizedModel,
  isAmbiguousComparison,
  normalizeBrand,
  normalizeQuery,
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
    const providerResult = await this.provider.searchProducts({
      query: input.query,
      category: input.category,
      sort: input.sort,
      excludeUsed: input.excludeUsed,
      limit: input.limit
    });

    const offers = this.normalizeOffers(providerResult.query, providerResult.offers).filter((offer) =>
      typeof input.budgetMax === "number" ? offer.price <= input.budgetMax : true
    );
    const dedupedOffers = dedupeOffers(offers);
    const groups = buildGroups(dedupedOffers);

    for (const group of groups) {
      const relatedOffers = dedupedOffers.filter((offer) => offer.productId === group.productId);
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
          : `${providerResult.query} 기준 ${groups.length}개 모델, ${dedupedOffers.length}개 판매처를 찾았습니다.`,
      offers: dedupedOffers,
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
      return {
        query: target.query,
        status: "ambiguous",
        summary: "정확히 같은 모델만 비교할 수 있습니다.",
        warning: "정확히 같은 모델이 섞이지 않도록 더 구체적인 모델명을 입력해 주세요.",
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
      return {
        query: comparison.query,
        status: comparison.status,
        summary: comparison.summary,
        warning: comparison.warning,
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

  private normalizeOffers(query: string, offers: ProductOffer[]): ProductOffer[];
  private normalizeOffers(query: string, offers: Array<Omit<ProductOffer, "productId" | "normalizedModel" | "matchConfidence">>): ProductOffer[];
  private normalizeOffers(query: string, offers: Array<Omit<ProductOffer, "productId" | "normalizedModel" | "matchConfidence">>): ProductOffer[] {
    const normalizedQuery = normalizeQuery(query);

    return offers.map((offer) => {
      const normalizedModel = extractNormalizedModel(offer.title);
      const productId = createProductId(normalizedModel ?? offer.title);

      return {
        ...offer,
        title: stripHtml(offer.title),
        brand: normalizeBrand(offer.brand),
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

  private async resolveTarget(productId?: string, query?: string): Promise<
    | {
        status: "ok";
        query: string;
        group: ProductGroup;
        offers: ProductOffer[];
      }
    | {
        status: "ambiguous";
        query: string;
        offers: ProductOffer[];
      }
    | null
  > {
    if (productId) {
      const cached = this.getCached(productId);
      if (cached) {
        return {
          status: "ok",
          query: cached.query,
          group: cached.group,
          offers: cached.offers
        };
      }
    }

    if (!query) {
      return null;
    }

    const search = await this.searchProducts({
      query,
      sort: "relevance",
      excludeUsed: true,
      limit: 20
    });

    if (search.offers.length === 0) {
      return null;
    }

    if (isAmbiguousComparison(query, search.offers) || search.groups.length !== 1) {
      return {
        status: "ambiguous",
        query,
        offers: search.offers
      };
    }

    const group = search.groups[0];
    return {
      status: "ok",
      query,
      group,
      offers: search.offers.filter((offer) => offer.productId === group.productId)
    };
  }
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
      const representative = bucket[0]!;

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
    .sort((left, right) => left.minPrice - right.minPrice);
}

function calculateMatchConfidence(query: string, normalizedModel: string | null, title: string): number {
  if (normalizedModel && query.includes(normalizedModel)) {
    return 1;
  }

  if (normalizedModel) {
    const compactQuery = query.replace(/\s+/g, "");
    const compactModel = normalizedModel.replace(/\s+/g, "");
    if (compactModel.includes(compactQuery) || compactQuery.includes(compactModel)) {
      return 0.95;
    }

    return 0.8;
  }

  const normalizedTitle = normalizeQuery(title);
  return normalizedTitle.includes(query) ? 0.6 : 0.4;
}

function createProductId(seed: string): string {
  const normalized = normalizeQuery(seed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "unclassified-product";
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
