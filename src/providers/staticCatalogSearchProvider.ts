import coreExactV1Records from "../../data/static-catalog/core-exact-v1.json";
import canaryEvalV1Records from "../../data/static-catalog/canary-eval-v1.json";
import {
  extractExactQueryModel,
  normalizeBrand,
  normalizeQuery
} from "../domain/normalize.js";
import type {
  ProductCategory,
  ProviderOffer,
  SearchProvider,
  SearchProviderInput,
  SearchProviderResult
} from "../domain/types.js";

export type StaticCatalogDatasetName = "core-exact-v1" | "canary-eval-v1";

export interface StaticCatalogOfferRecord {
  sourceProductId: string;
  mallName: string;
  price: number;
  link: string;
  image: string | null;
}

export interface StaticCatalogRecord {
  id: string;
  category: ProductCategory;
  normalizedModel: string;
  title: string;
  brand: string | null;
  keywords: string[];
  offers: StaticCatalogOfferRecord[];
}

const BUILTIN_DATASETS: Record<StaticCatalogDatasetName, StaticCatalogRecord[]> = {
  "core-exact-v1": validateStaticCatalogRecords(coreExactV1Records, "core-exact-v1"),
  "canary-eval-v1": mergeStaticCatalogRecords(
    validateStaticCatalogRecords(coreExactV1Records, "core-exact-v1"),
    validateStaticCatalogRecords(canaryEvalV1Records, "canary-eval-v1")
  )
};

export class StaticCatalogSearchProvider implements SearchProvider {
  readonly source = "static-catalog" as const;
  private readonly datasetName: string;
  private readonly records: StaticCatalogRecord[];

  constructor(options?: {
    datasetName?: string;
    records?: unknown;
  }) {
    this.datasetName = options?.datasetName ?? "core-exact-v1";
    this.records = validateStaticCatalogRecords(
      options?.records ?? getStaticCatalogDatasetRecords(this.datasetName),
      this.datasetName
    );
  }

  async searchProducts(input: SearchProviderInput): Promise<SearchProviderResult> {
    const exactQueryModel = extractExactQueryModel(input.query);
    const candidates = this.records
      .filter((record) => !input.category || record.category === input.category)
      .map((record) => ({
        record,
        score: scoreCatalogRecord(input.query, exactQueryModel, record)
      }))
      .filter((candidate) => candidate.score > 0);

    const sortedOffers = candidates
      .sort((left, right) => compareCatalogCandidates(left, right, input.sort))
      .flatMap(({ record, score }) =>
        [...record.offers]
          .sort((left, right) => compareCatalogOfferRecords(left, right, input.sort))
          .map((offer) => mapCatalogOffer(record, offer, score))
      )
      .slice(0, input.limit);

    return {
      query: input.query,
      offers: sortedOffers
    };
  }
}

export function getStaticCatalogDatasetRecords(datasetName: string): StaticCatalogRecord[] {
  if (datasetName === "core-exact-v1" || datasetName === "canary-eval-v1") {
    return BUILTIN_DATASETS[datasetName];
  }

  throw new Error(`지원하지 않는 정적 카탈로그 데이터셋입니다: ${datasetName}`);
}

function mergeStaticCatalogRecords(
  baseRecords: StaticCatalogRecord[],
  overrideRecords: StaticCatalogRecord[]
): StaticCatalogRecord[] {
  const merged = new Map(baseRecords.map((record) => [record.id, record] as const));

  for (const record of overrideRecords) {
    merged.set(record.id, record);
  }

  return Array.from(merged.values());
}

function validateStaticCatalogRecords(records: unknown, datasetName: string): StaticCatalogRecord[] {
  if (!Array.isArray(records)) {
    throw new Error(`정적 카탈로그 데이터셋 형식이 올바르지 않습니다: ${datasetName}`);
  }

  return records.map((record, index) => validateStaticCatalogRecord(record, datasetName, index));
}

function validateStaticCatalogRecord(record: unknown, datasetName: string, index: number): StaticCatalogRecord {
  if (!record || typeof record !== "object") {
    throw new Error(`정적 카탈로그 데이터셋 항목이 올바르지 않습니다: ${datasetName}#${index + 1}`);
  }

  const candidate = record as Partial<StaticCatalogRecord>;
  const normalizedModel = asNonEmptyString(candidate.normalizedModel);
  const title = asNonEmptyString(candidate.title);
  const id = asNonEmptyString(candidate.id);
  const category = candidate.category;
  const brand = candidate.brand == null ? null : asNonEmptyString(candidate.brand);
  const keywords = Array.isArray(candidate.keywords)
    ? candidate.keywords
        .map((keyword) => asNonEmptyString(keyword))
        .filter((keyword): keyword is string => Boolean(keyword))
    : [];
  const offers = Array.isArray(candidate.offers)
    ? candidate.offers.map((offer, offerIndex) => validateStaticCatalogOffer(offer, datasetName, index, offerIndex))
    : [];

  if (
    !id ||
    !title ||
    !normalizedModel ||
    !category ||
    !isProductCategory(category) ||
    keywords.length === 0 ||
    offers.length === 0
  ) {
    throw new Error(`정적 카탈로그 데이터셋 형식이 올바르지 않습니다: ${datasetName}#${index + 1}`);
  }

  return {
    id,
    category,
    normalizedModel,
    title,
    brand,
    keywords,
    offers
  };
}

function validateStaticCatalogOffer(
  offer: unknown,
  datasetName: string,
  recordIndex: number,
  offerIndex: number
): StaticCatalogOfferRecord {
  if (!offer || typeof offer !== "object") {
    throw new Error(
      `정적 카탈로그 데이터셋 offer 형식이 올바르지 않습니다: ${datasetName}#${recordIndex + 1}.${offerIndex + 1}`
    );
  }

  const candidate = offer as Partial<StaticCatalogOfferRecord>;
  const sourceProductId = asNonEmptyString(candidate.sourceProductId);
  const mallName = asNonEmptyString(candidate.mallName);
  const link = asNonEmptyString(candidate.link);
  const image = candidate.image == null ? null : asNonEmptyString(candidate.image);
  const price =
    typeof candidate.price === "number" && Number.isFinite(candidate.price) && candidate.price > 0
      ? candidate.price
      : 0;

  if (!sourceProductId || !mallName || !link || price <= 0) {
    throw new Error(
      `정적 카탈로그 데이터셋 offer 형식이 올바르지 않습니다: ${datasetName}#${recordIndex + 1}.${offerIndex + 1}`
    );
  }

  return {
    sourceProductId,
    mallName,
    price,
    link,
    image
  };
}

function isProductCategory(value: unknown): value is ProductCategory {
  return (
    value === "laptop" ||
    value === "keyboard" ||
    value === "graphics-card" ||
    value === "monitor" ||
    value === "pc-part"
  );
}

function scoreCatalogRecord(query: string, exactQueryModel: string | null, record: StaticCatalogRecord): number {
  const normalizedQuery = normalizeQuery(query);
  const normalizedModel = normalizeQuery(record.normalizedModel);
  const haystack = normalizeQuery(
    [record.title, record.brand ?? "", record.normalizedModel, ...record.keywords].join(" ")
  );

  if (exactQueryModel) {
    return normalizedModel === exactQueryModel ? 1000 : 0;
  }

  if (haystack.includes(normalizedQuery)) {
    return 500 + countTokenMatches(normalizedQuery, haystack) * 10;
  }

  const tokenMatches = countTokenMatches(normalizedQuery, haystack);
  const requiredMatches = getRequiredTokenMatches(normalizedQuery);

  if (tokenMatches < requiredMatches) {
    return 0;
  }

  return tokenMatches * 10;
}

function countTokenMatches(normalizedQuery: string, haystack: string): number {
  return extractSearchTokens(normalizedQuery).filter((token) => haystack.includes(token)).length;
}

function getRequiredTokenMatches(normalizedQuery: string): number {
  const tokens = extractSearchTokens(normalizedQuery);
  if (tokens.length <= 1) {
    return 1;
  }

  return Math.min(2, tokens.length);
}

function extractSearchTokens(normalizedQuery: string): string[] {
  return Array.from(
    new Set(
      normalizedQuery
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length > 1)
    )
  );
}

function compareCatalogCandidates(
  left: { record: StaticCatalogRecord; score: number },
  right: { record: StaticCatalogRecord; score: number },
  sort: SearchProviderInput["sort"]
): number {
  if (sort === "price_asc") {
    return getCatalogMinPrice(left.record) - getCatalogMinPrice(right.record);
  }

  if (sort === "price_desc") {
    return getCatalogMinPrice(right.record) - getCatalogMinPrice(left.record);
  }

  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return getCatalogMinPrice(left.record) - getCatalogMinPrice(right.record);
}

function compareCatalogOfferRecords(
  left: StaticCatalogOfferRecord,
  right: StaticCatalogOfferRecord,
  sort: SearchProviderInput["sort"]
): number {
  if (sort === "price_desc") {
    return right.price - left.price;
  }

  return left.price - right.price;
}

function mapCatalogOffer(
  record: StaticCatalogRecord,
  offer: StaticCatalogOfferRecord,
  _score: number
): ProviderOffer {
  return {
    source: "static-catalog",
    sourceProductId: offer.sourceProductId,
    title: record.title,
    brand: normalizeBrand(record.brand),
    mallName: offer.mallName,
    price: offer.price,
    link: offer.link,
    image: offer.image
  };
}

function getCatalogMinPrice(record: StaticCatalogRecord): number {
  return Math.min(...record.offers.map((offer) => offer.price));
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
