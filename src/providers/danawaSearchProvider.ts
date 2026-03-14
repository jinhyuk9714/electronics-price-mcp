import { normalizeBrand, stripHtml } from "../domain/normalize.js";
import type { ProviderOffer, SearchProvider, SearchProviderInput, SearchProviderResult } from "../domain/types.js";

export class DanawaSearchProvider implements SearchProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly fetchFn: typeof fetch;
  private readonly timeoutMs: number;
  private readonly apiBaseUrl: string;

  constructor(options: {
    clientId: string;
    clientSecret: string;
    apiBaseUrl?: string;
    fetchFn?: typeof fetch;
    timeoutMs?: number;
  }) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.apiBaseUrl = options.apiBaseUrl ?? "http://api.danawa.com";
    this.fetchFn = options.fetchFn ?? ((input, init) => globalThis.fetch(input, init));
    this.timeoutMs = options.timeoutMs ?? 8000;
  }

  async searchProducts(input: SearchProviderInput): Promise<SearchProviderResult> {
    const url = new URL("/api/search/product/list", this.apiBaseUrl);
    url.searchParams.set("keyword", appendCategoryKeyword(input.query, input.category));
    url.searchParams.set("limit", String(Math.min(Math.max(input.limit, 1), 100)));
    url.searchParams.set("display", String(Math.min(Math.max(input.limit, 1), 100)));
    url.searchParams.set("sort", input.sort);

    if (input.excludeUsed) {
      url.searchParams.set("excludeUsed", "Y");
      url.searchParams.set("includeRental", "N");
    }

    let response: Response;

    try {
      response = await this.fetchFn(url, {
        method: "GET",
        headers: {
          Accept: "application/json, application/xml;q=0.9, text/xml;q=0.8",
          "X-Danawa-Client-Id": this.clientId,
          "X-Danawa-Client-Secret": this.clientSecret
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("다나와 API 요청 시간이 초과되었습니다.");
      }

      throw error;
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error("DANAWA_CLIENT_ID 또는 DANAWA_CLIENT_SECRET 설정을 확인해 주세요.");
    }

    if (response.status === 429) {
      throw new Error("다나와 API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (!response.ok) {
      throw new Error(`다나와 API 요청에 실패했습니다. (${response.status})`);
    }

    const body = await response.text();

    return {
      query: input.query,
      offers: parseDanawaOffers(body, response.headers.get("content-type"))
    };
  }
}

function parseDanawaOffers(body: string, contentType: string | null): ProviderOffer[] {
  const trimmedBody = body.trim();
  if (!trimmedBody) {
    return [];
  }

  const normalizedContentType = (contentType ?? "").toLowerCase();

  if (normalizedContentType.includes("json") || trimmedBody.startsWith("{") || trimmedBody.startsWith("[")) {
    try {
      const payload = JSON.parse(trimmedBody) as unknown;
      return extractDanawaJsonRecords(payload).map(mapDanawaRecord).filter(isProviderOffer);
    } catch {
      throw new Error("다나와 API 응답을 해석하지 못했습니다.");
    }
  }

  if (
    normalizedContentType.includes("xml") ||
    normalizedContentType.includes("html") ||
    trimmedBody.startsWith("<")
  ) {
    const offers = extractDanawaXmlRecords(trimmedBody).map(mapDanawaRecord).filter(isProviderOffer);
    if (offers.length === 0 && trimmedBody.includes("<")) {
      throw new Error("다나와 API 응답을 해석하지 못했습니다.");
    }

    return offers;
  }

  throw new Error("다나와 API 응답을 해석하지 못했습니다.");
}

function extractDanawaJsonRecords(payload: unknown): DanawaRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(isDanawaRecord);
  }

  if (!isDanawaRecord(payload)) {
    return [];
  }

  const candidateCollections = [
    payload.products,
    payload.productList,
    payload.items,
    payload.data,
    payload.result
  ];

  for (const candidate of candidateCollections) {
    if (Array.isArray(candidate)) {
      return candidate.filter(isDanawaRecord);
    }

    if (isDanawaRecord(candidate)) {
      const nestedCollections = [candidate.products, candidate.productList, candidate.items];
      for (const nestedCandidate of nestedCollections) {
        if (Array.isArray(nestedCandidate)) {
          return nestedCandidate.filter(isDanawaRecord);
        }
      }
    }
  }

  return [];
}

function extractDanawaXmlRecords(xml: string): DanawaRecord[] {
  const blocks = [
    ...xml.matchAll(/<(product|item)\b[^>]*>([\s\S]*?)<\/\1>/gi)
  ];

  return blocks
    .map((match) => blockToDanawaRecord(match[2] ?? ""))
    .filter((record) => Object.keys(record).length > 0);
}

function blockToDanawaRecord(block: string): DanawaRecord {
  return {
    productCode: firstXmlValue(block, ["productCode", "prodCode", "productId", "id", "code"]),
    productName: firstXmlValue(block, ["productName", "name", "title", "prodName"]),
    brand: firstXmlValue(block, ["brand", "maker", "manufacturer"]),
    mallName: firstXmlValue(block, ["mallName", "shopName", "sellerName", "companyName"]),
    lowestPrice: firstXmlValue(block, ["lowestPrice", "minPrice", "price", "salePrice"]),
    productUrl: firstXmlValue(block, ["productUrl", "link", "url"]),
    imageUrl: firstXmlValue(block, ["imageUrl", "image", "thumbUrl", "thumb"])
  };
}

function firstXmlValue(block: string, tags: string[]): string | null {
  for (const tag of tags) {
    const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
    if (!match) {
      continue;
    }

    const rawValue = match[1]
      ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .trim();

    if (rawValue) {
      return rawValue;
    }
  }

  return null;
}

function mapDanawaRecord(record: DanawaRecord): ProviderOffer | null {
  const sourceProductId = asString(
    record.productCode ?? record.prodCode ?? record.productId ?? record.id ?? record.code
  );
  const title = stripHtml(
    asString(record.productName ?? record.name ?? record.title ?? record.prodName) ?? ""
  );
  const brand = normalizeBrand(
    asString(record.brand ?? record.maker ?? record.manufacturer)
  );
  const mallName =
    asString(record.mallName ?? record.shopName ?? record.sellerName ?? record.companyName) ??
    "이름 없는 판매처";
  const price = parsePositivePrice(
    record.lowestPrice ?? record.minPrice ?? record.price ?? record.salePrice
  );
  const link =
    asString(record.productUrl ?? record.link ?? record.url) ?? "";
  const image = asString(record.imageUrl ?? record.image ?? record.thumbUrl ?? record.thumb);

  if (!sourceProductId || !title || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  return {
    source: "danawa",
    sourceProductId,
    title,
    brand,
    mallName,
    price,
    link,
    image
  };
}

function isProviderOffer(value: ProviderOffer | null): value is ProviderOffer {
  return value !== null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = stripHtml(value).trim();
  return normalized ? normalized : null;
}

function parsePositivePrice(value: unknown): number {
  if (typeof value !== "string" && typeof value !== "number") {
    return 0;
  }

  const digitsOnly = String(value).replace(/[^\d]/g, "");
  if (!digitsOnly) {
    return 0;
  }

  const parsed = Number.parseInt(digitsOnly, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function appendCategoryKeyword(query: string, category?: SearchProviderInput["category"]): string {
  if (!category) {
    return query;
  }

  const suffix = CATEGORY_KEYWORDS[category];
  if (!suffix) {
    return query;
  }

  return query.includes(suffix) ? query : `${query} ${suffix}`;
}

const CATEGORY_KEYWORDS: Record<NonNullable<SearchProviderInput["category"]>, string> = {
  laptop: "노트북",
  keyboard: "키보드",
  "graphics-card": "그래픽카드",
  monitor: "모니터",
  "pc-part": "PC 부품"
};

type DanawaRecord = Record<string, unknown>;

function isDanawaRecord(value: unknown): value is DanawaRecord {
  return typeof value === "object" && value !== null;
}
