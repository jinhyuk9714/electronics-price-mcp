import { normalizeBrand, stripHtml } from "../domain/normalize.js";
import type { SearchProvider, SearchProviderInput, SearchProviderResult } from "../domain/types.js";

export class NaverShoppingClient implements SearchProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly fetchFn: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: {
    clientId: string;
    clientSecret: string;
    fetchFn?: typeof fetch;
    timeoutMs?: number;
  }) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.fetchFn =
      options.fetchFn ??
      ((input, init) => globalThis.fetch(input, init));
    this.timeoutMs = options.timeoutMs ?? 8000;
  }

  async searchProducts(input: SearchProviderInput): Promise<SearchProviderResult> {
    const url = new URL("https://openapi.naver.com/v1/search/shop.json");
    url.searchParams.set("query", appendCategoryKeyword(input.query, input.category));
    url.searchParams.set("display", String(Math.min(Math.max(input.limit, 1), 100)));
    url.searchParams.set("start", "1");
    url.searchParams.set("sort", toNaverSort(input.sort));

    if (input.excludeUsed) {
      url.searchParams.set("exclude", "used:rental");
    }

    let response: Response;

    try {
      response = await this.fetchFn(url, {
        method: "GET",
        headers: {
          "X-Naver-Client-Id": this.clientId,
          "X-Naver-Client-Secret": this.clientSecret
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("네이버 쇼핑 API 요청 시간이 초과되었습니다.");
      }

      throw error;
    }

    if (response.status === 401) {
      throw new Error("NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 설정을 확인해 주세요.");
    }

    if (response.status === 429) {
      throw new Error("네이버 쇼핑 API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.");
    }

    if (!response.ok) {
      throw new Error(`네이버 쇼핑 API 요청에 실패했습니다. (${response.status})`);
    }

    const payload = (await response.json()) as {
      items?: Array<{
        productId?: string;
        title?: string;
        link?: string;
        image?: string;
        lprice?: string;
        mallName?: string;
        brand?: string;
        maker?: string;
      }>;
    };

    return {
      query: input.query,
      offers: (payload.items ?? [])
        .map((item) => ({
          source: "naver-shopping" as const,
          sourceProductId: item.productId ?? "",
          title: stripHtml(item.title ?? ""),
          brand: normalizeBrand(item.brand ?? item.maker ?? null),
          mallName: item.mallName ?? "이름 없는 판매처",
          price: Number.parseInt(item.lprice ?? "0", 10),
          link: item.link ?? "",
          image: item.image ?? null
        }))
        .filter((item) => item.sourceProductId && item.title && Number.isFinite(item.price) && item.price > 0)
    };
  }
}

function toNaverSort(sort: SearchProviderInput["sort"]): string {
  switch (sort) {
    case "price_asc":
      return "asc";
    case "price_desc":
      return "dsc";
    case "relevance":
    default:
      return "sim";
  }
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
