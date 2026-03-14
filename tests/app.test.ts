import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { describe, expect, test } from "vitest";

import { createApp } from "../src/index.js";
import type {
  CompareProductPricesResult,
  ExplainPurchaseOptionsResult,
  SearchProductsResult
} from "../src/domain/types.js";
import { InMemoryRateLimiter } from "../src/runtime/rateLimit.js";

type ToolCallResult = {
  content: Array<{ type: string; text: string }>;
};

function createService() {
  return {
    async searchProducts(): Promise<SearchProductsResult> {
      return {
        query: "그램 16",
        summary: "그램 16 기준 1개 모델, 2개 판매처를 찾았습니다.",
        offers: [
          {
            productId: "gram-16z90t-ga5ck",
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG 그램 16 16Z90T-GA5CK",
            brand: "LG",
            mallName: "몰A",
            price: 1499000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg",
            normalizedModel: "16Z90T-GA5CK",
            matchConfidence: 1
          }
        ],
        groups: [
          {
            productId: "gram-16z90t-ga5ck",
            normalizedModel: "16Z90T-GA5CK",
            title: "LG 그램 16 16Z90T-GA5CK",
            brand: "LG",
            minPrice: 1499000,
            maxPrice: 1549000,
            offerCount: 2,
            matchConfidence: 1
          }
        ]
      };
    },
    async compareProductPrices(): Promise<CompareProductPricesResult> {
      return {
        query: "rtx 5070",
        status: "ambiguous",
        summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
        warning: "정확한 모델이 여러 개 섞여 있어 바로 판단할 수 없습니다. 모델 코드나 변형명까지 포함해 다시 검색해 주세요. 아래 추천 검색어를 바로 써보세요.",
        suggestedQueries: ["RTX 5070 가격 비교해 줘", "RTX 5070 TI 가격 비교해 줘"],
        selectedProductId: null,
        offers: []
      };
    },
    async explainPurchaseOptions(): Promise<ExplainPurchaseOptionsResult> {
      return {
        query: "그램 16",
        status: "ok",
        summary: "현재 최저가는 1499000원입니다.",
        selectedProductId: "gram-16z90t-ga5ck",
        offers: [],
        insight: {
          focus: "lowest_price",
          message: "현재 최저가는 1499000원이고 최고가와의 차이는 50000원입니다."
        }
      };
    }
  };
}

describe("createApp", () => {
  test("serves expanded root metadata and health endpoints", async () => {
    const app = createApp({
      service: createService(),
      requestIdFactory: () => "req-root"
    });

    const rootResponse = await app.request("https://example.com/");
    const healthResponse = await app.request("https://example.com/health");

    expect(rootResponse.status).toBe(200);
    expect(await rootResponse.json()).toMatchObject({
      name: "electronics-price-mcp",
      endpoints: {
        mcp: "/mcp",
        health: "/health",
        prompt: "/prompt",
        openapi: "/openapi.json",
        privacy: "/privacy"
      },
      exampleQuestions: expect.arrayContaining(["그램 16 검색해 줘", "RTX 5070 가격 비교해 줘"]),
      links: {
        homepage: "https://electronics-price-mcp.jinhyuk9714.workers.dev",
        mcp: "https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp",
        prompt: "https://electronics-price-mcp.jinhyuk9714.workers.dev/prompt"
      }
    });
    expect(rootResponse.headers.get("x-request-id")).toBe("req-root");
    expect(healthResponse.status).toBe(200);
    expect(await healthResponse.json()).toEqual({
      status: "ok"
    });
    expect(healthResponse.headers.get("x-request-id")).toBe("req-root");
  });

  test("serves a prompt page with base-url-specific HTTP instructions", async () => {
    const app = createApp({
      service: createService()
    });

    const response = await app.request("https://example.com/prompt");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("https://example.com/api/search?query={검색어}");
    expect(body).toContain("https://example.com/api/compare?query={검색어}");
    expect(body).toContain("GET 방식");
  });

  test("serves openapi and privacy documents", async () => {
    const app = createApp({
      service: createService()
    });

    const openApiResponse = await app.request("https://example.com/openapi.json");
    const openApi = (await openApiResponse.json()) as { paths: Record<string, unknown> };
    const openApiYamlResponse = await app.request("https://example.com/openapi.yaml");
    const openApiYaml = await openApiYamlResponse.text();
    const privacyResponse = await app.request("https://example.com/privacy");
    const privacyText = await privacyResponse.text();

    expect(openApiResponse.status).toBe(200);
    expect((openApi as { servers?: Array<{ url: string }> }).servers?.[0]?.url).toBe("https://example.com");
    expect(openApi.paths).toMatchObject({
      "/api/search": expect.any(Object),
      "/api/compare": expect.any(Object),
      "/health": expect.any(Object)
    });
    expect(openApi.paths["/mcp"]).toBeUndefined();
    expect(openApiYamlResponse.status).toBe(200);
    expect(openApiYaml).toContain('/api/search');
    expect(openApiYaml).toContain('"https://example.com"');
    expect(privacyResponse.status).toBe(200);
    expect(privacyText).toContain("네이버 쇼핑 검색 API");
    expect(privacyText).toContain("읽기 전용");
  });

  test("serves a public search api with reader-friendly wrapping", async () => {
    const app = createApp({
      service: createService()
    });

    const response = await app.request(
      "https://example.com/api/search?query=%EA%B7%B8%EB%9E%A816&sort=relevance&excludeUsed=true&limit=10"
    );
    const body = (await response.json()) as {
      success: boolean;
      data: {
        query: string;
        summary: string;
        providerStatuses?: unknown;
      };
    };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        query: "그램 16",
        summary: "그램 16 기준 1개 모델, 2개 판매처를 찾았습니다."
      },
      meta: {
        tool: "search_products"
      }
    });
  });

  test("preserves optional search warnings through the public search api", async () => {
    const app = createApp({
      service: {
        ...createService(),
        async searchProducts(): Promise<SearchProductsResult> {
          return {
            query: "LG 그램 16 16Z90T-GA5CK",
            summary: "검색 결과가 없습니다: LG 그램 16 16Z90T-GA5CK",
            warning: "본체가 아닌 액세서리나 구성변형만 확인되어 검색 결과를 비웠습니다. 정확한 본체 상품명으로 다시 검색해 주세요.",
            offers: [],
            groups: []
          };
        }
      }
    });

    const response = await app.request(
      "https://example.com/api/search?query=LG%20%EA%B7%B8%EB%9E%A8%2016%2016Z90T-GA5CK&sort=relevance&excludeUsed=true&limit=10"
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        query: "LG 그램 16 16Z90T-GA5CK",
        summary: "검색 결과가 없습니다: LG 그램 16 16Z90T-GA5CK",
        warning: "본체가 아닌 액세서리나 구성변형만 확인되어 검색 결과를 비웠습니다. 정확한 본체 상품명으로 다시 검색해 주세요.",
        offers: [],
        groups: []
      }
    });
  });

  test("serves a public compare api and preserves ambiguity warnings", async () => {
    const app = createApp({
      service: createService()
    });

    const response = await app.request("https://example.com/api/compare?query=rtx%205070");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        status: "ambiguous",
        summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.",
        suggestedQueries: ["RTX 5070 가격 비교해 줘", "RTX 5070 TI 가격 비교해 줘"]
      },
      meta: {
        tool: "compare_product_prices"
      }
    });
  });

  test("supports streamable HTTP MCP calls end to end", async () => {
    const app = createApp({
      service: createService()
    });
    const transport = new StreamableHTTPClientTransport(new URL("https://example.com/mcp"), {
      fetch: async (input, init) => app.request(input instanceof Request ? input : new Request(input, init))
    });
    const client = new Client({
      name: "http-test-client",
      version: "1.0.0"
    });

    await client.connect(transport);

    const tools = await client.listTools();
    const compare = await client.callTool({
      name: "compare_product_prices",
      arguments: {
        query: "rtx 5070"
      }
    });
    const typedCompare = compare as unknown as ToolCallResult;

    expect(tools.tools.map((tool) => tool.name)).toContain("search_products");
    expect(typedCompare.content[0]).toMatchObject({
      type: "text",
      text: "정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요."
    });

    await client.close();
  });

  test("returns a friendly message when search provider credentials are missing", async () => {
    const app = createApp({
      env: {}
    });
    const transport = new StreamableHTTPClientTransport(new URL("https://example.com/mcp"), {
      fetch: async (input, init) => app.request(input instanceof Request ? input : new Request(input, init))
    });
    const client = new Client({
      name: "http-test-client",
      version: "1.0.0"
    });

    await client.connect(transport);

    const result = await client.callTool({
      name: "search_products",
      arguments: {
        query: "그램 16",
        sort: "relevance",
        excludeUsed: true,
        limit: 10
      }
    });
    const typedResult = result as unknown as ToolCallResult;

    expect(typedResult.content[0]).toMatchObject({
      type: "text"
    });
    expect(typedResult.content[0]?.text).toContain("DANAWA_CLIENT_ID");

    await client.close();
  });

  test("returns a friendly http error payload when search provider credentials are missing", async () => {
    const app = createApp({
      env: {}
    });

    const response = await app.request("https://example.com/api/search?query=%EA%B7%B8%EB%9E%A816");
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      success: false,
      error: {
        message: expect.stringContaining("DANAWA_CLIENT_ID")
      }
    });
  });

  test("allows static catalog fallback through the public http api when explicitly enabled", async () => {
    const app = createApp({
      env: {
        ENABLE_STATIC_CATALOG: "true",
        STATIC_CATALOG_DATASET: "core-exact-v1"
      }
    });

    const response = await app.request("https://example.com/api/search?query=RTX%205070");
    const body = (await response.json()) as {
      success: boolean;
      data: {
        query: string;
        offers: Array<{ source: string }>;
      };
    };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        query: "RTX 5070"
      }
    });
    expect(body.data.offers.length).toBeGreaterThan(0);
    expect(body.data.offers.every((offer: { source: string }) => offer.source === "static-catalog")).toBe(true);
  });

  test("includes request ids in bad-request error envelopes", async () => {
    const app = createApp({
      service: createService(),
      requestIdFactory: () => "req-bad-request"
    });

    const response = await app.request("https://example.com/api/search");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(response.headers.get("x-request-id")).toBe("req-bad-request");
    expect(body).toEqual({
      success: false,
      error: {
        message: "query 파라미터를 입력해 주세요.",
        requestId: "req-bad-request"
      }
    });
  });

  test("rate limits api search independently from api compare", async () => {
    const now = 1_763_000_000_000;
    const app = createApp({
      service: createService(),
      requestIdFactory: () => "req-search-limit",
      rateLimiter: new InMemoryRateLimiter(() => now)
    });

    for (let index = 0; index < 60; index += 1) {
      const response = await app.request("https://example.com/api/search?query=%EA%B7%B8%EB%9E%A816", {
        headers: {
          "cf-connecting-ip": "203.0.113.10"
        }
      });

      expect(response.status).toBe(200);
    }

    const limitedSearch = await app.request("https://example.com/api/search?query=%EA%B7%B8%EB%9E%A816", {
      headers: {
        "cf-connecting-ip": "203.0.113.10"
      }
    });
    const limitedSearchBody = await limitedSearch.json();

    expect(limitedSearch.status).toBe(429);
    expect(limitedSearch.headers.get("retry-after")).toBe("60");
    expect(limitedSearch.headers.get("x-request-id")).toBe("req-search-limit");
    expect(limitedSearchBody).toEqual({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
        requestId: "req-search-limit"
      }
    });

    const compareResponse = await app.request("https://example.com/api/compare?query=rtx%205070", {
      headers: {
        "cf-connecting-ip": "203.0.113.10"
      }
    });

    expect(compareResponse.status).toBe(200);
  });

  test("rate limits api compare requests using x-forwarded-for fallback", async () => {
    const now = 1_763_000_000_000;
    const app = createApp({
      service: createService(),
      requestIdFactory: () => "req-compare-limit",
      rateLimiter: new InMemoryRateLimiter(() => now)
    });

    for (let index = 0; index < 60; index += 1) {
      const response = await app.request("https://example.com/api/compare?query=rtx%205070", {
        headers: {
          "x-forwarded-for": "198.51.100.8, 198.51.100.1"
        }
      });

      expect(response.status).toBe(200);
    }

    const limitedResponse = await app.request("https://example.com/api/compare?query=rtx%205070", {
      headers: {
        "x-forwarded-for": "198.51.100.8, 198.51.100.1"
      }
    });
    const limitedBody = await limitedResponse.json();

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers.get("retry-after")).toBe("60");
    expect(limitedBody).toEqual({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
        requestId: "req-compare-limit"
      }
    });
  });

  test("rate limits mcp requests before transport setup", async () => {
    const now = 1_763_000_000_000;
    const app = createApp({
      service: createService(),
      requestIdFactory: () => "req-mcp-limit",
      rateLimiter: new InMemoryRateLimiter(() => now)
    });

    for (let index = 0; index < 120; index += 1) {
      const response = await app.request("https://example.com/mcp", {
        method: "POST",
        headers: {
          "cf-connecting-ip": "203.0.113.55",
          "content-type": "application/json"
        },
        body: "{}"
      });

      expect(response.status).not.toBe(429);
    }

    const limitedResponse = await app.request("https://example.com/mcp", {
      method: "POST",
      headers: {
        "cf-connecting-ip": "203.0.113.55",
        "content-type": "application/json"
      },
      body: "{}"
    });
    const limitedBody = await limitedResponse.json();

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers.get("retry-after")).toBe("60");
    expect(limitedBody).toEqual({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
        requestId: "req-mcp-limit"
      }
    });
  });

  test("skips rate limiting for public docs and health routes", async () => {
    let limiterCalls = 0;
    const app = createApp({
      service: createService(),
      rateLimiter: {
        async check() {
          limiterCalls += 1;
          return {
            allowed: true,
            retryAfterSeconds: 60
          };
        }
      }
    });

    const healthResponse = await app.request("https://example.com/health");
    const promptResponse = await app.request("https://example.com/prompt");
    const openApiResponse = await app.request("https://example.com/openapi.json");

    expect(healthResponse.status).toBe(200);
    expect(promptResponse.status).toBe(200);
    expect(openApiResponse.status).toBe(200);
    expect(limiterCalls).toBe(0);
  });

  test("includes provider diagnostics in structured request logs without exposing them in the response body", async () => {
    const logLines: string[] = [];
    const app = createApp({
      service: {
        async searchProducts(): Promise<SearchProductsResult> {
          return {
            query: "27GR93U",
            summary: "27GR93U 기준 1개 모델, 1개 판매처를 찾았습니다.",
            offers: [],
            groups: []
          };
        },
        async compareProductPrices(): Promise<CompareProductPricesResult> {
          throw new Error("unused");
        },
        async explainPurchaseOptions(): Promise<ExplainPurchaseOptionsResult> {
          throw new Error("unused");
        },
        getLastProviderDiagnostics() {
          return {
            providerStatuses: {
              "naver-shopping": "success" as const,
              danawa: "error" as const
            },
            providerOfferCounts: {
              "naver-shopping": 1,
              danawa: 0
            },
            partialProviderFailure: true,
            canonicalMallDedupeHits: 2,
            crossSourceDuplicateDrops: 1
          };
        }
      },
      logger: {
        log(line: string) {
          logLines.push(line);
        },
        error(line: string) {
          logLines.push(line);
        }
      }
    });

    const response = await app.request("https://example.com/api/search?query=27GR93U");
    const body = (await response.json()) as {
      success: boolean;
      data: {
        query: string;
        summary: string;
        providerStatuses?: unknown;
      };
    };
    const logEntry = JSON.parse(logLines.at(-1) ?? "{}");

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        query: "27GR93U",
        summary: "27GR93U 기준 1개 모델, 1개 판매처를 찾았습니다."
      }
    });
    expect(body.data.providerStatuses).toBeUndefined();
    expect(logEntry).toMatchObject({
      providerStatuses: {
        "naver-shopping": "success",
        danawa: "error"
      },
      providerOfferCounts: {
        "naver-shopping": 1,
        danawa: 0
      },
      partialProviderFailure: true,
      canonicalMallDedupeHits: 2,
      crossSourceDuplicateDrops: 1
    });
  });
});
