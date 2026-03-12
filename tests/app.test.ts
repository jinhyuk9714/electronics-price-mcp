import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { describe, expect, test } from "vitest";

import { createApp } from "../src/index.js";
import type {
  CompareProductPricesResult,
  ExplainPurchaseOptionsResult,
  SearchProductsResult
} from "../src/domain/types.js";

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
      service: createService()
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
    expect(healthResponse.status).toBe(200);
    expect(await healthResponse.json()).toEqual({
      status: "ok"
    });
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
    const body = await response.json();

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

  test("returns a friendly message when Naver credentials are missing", async () => {
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
    expect(typedResult.content[0]?.text).toContain("NAVER_CLIENT_ID");

    await client.close();
  });

  test("returns a friendly http error payload when Naver credentials are missing", async () => {
    const app = createApp({
      env: {}
    });

    const response = await app.request("https://example.com/api/search?query=%EA%B7%B8%EB%9E%A816");
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      success: false,
      error: {
        message: expect.stringContaining("NAVER_CLIENT_ID")
      }
    });
  });
});
