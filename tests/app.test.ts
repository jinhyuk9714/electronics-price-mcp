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
        summary: "정확히 같은 모델만 비교할 수 있습니다.",
        warning: "정확히 같은 모델이 섞이지 않도록 더 구체적인 모델명을 입력해 주세요.",
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
  test("serves root metadata and health endpoints", async () => {
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
        health: "/health"
      }
    });
    expect(healthResponse.status).toBe(200);
    expect(await healthResponse.json()).toEqual({
      status: "ok"
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
      text: "정확히 같은 모델만 비교할 수 있습니다."
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
});
