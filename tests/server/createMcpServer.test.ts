import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, test } from "vitest";

import { createMcpServer } from "../../src/server/createMcpServer.js";
import type {
  CompareProductPricesResult,
  ExplainPurchaseOptionsResult,
  SearchProductsResult
} from "../../src/domain/types.js";

type ToolCallResult = {
  content: Array<{ type: string; text: string }>;
  structuredContent: SearchProductsResult;
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

describe("createMcpServer", () => {
  afterEach(async () => {
    // no-op placeholder to keep hook symmetry if future tests connect extra servers
  });

  test("registers all planned tools", async () => {
    const server = await createMcpServer({
      service: createService()
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({
      name: "test-client",
      version: "1.0.0"
    });

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.listTools();

    expect(result.tools.map((tool) => tool.name)).toEqual([
      "search_products",
      "compare_product_prices",
      "explain_purchase_options"
    ]);

    await client.close();
    await server.close();
  });

  test("returns text and structuredContent from tool handlers", async () => {
    const server = await createMcpServer({
      service: createService()
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({
      name: "test-client",
      version: "1.0.0"
    });

    await server.connect(serverTransport);
    await client.connect(clientTransport);

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
      type: "text",
      text: "그램 16 기준 1개 모델, 2개 판매처를 찾았습니다."
    });
    expect(typedResult.structuredContent.groups[0]?.productId).toBe("gram-16z90t-ga5ck");

    await client.close();
    await server.close();
  });
});
