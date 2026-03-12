import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createPriceService, type PriceServiceLike } from "./createPriceService.js";
import type { RuntimeEnv } from "../config.js";
import type {
  CompareProductPricesResult,
  ExplainPurchaseOptionsResult,
  SearchProductsResult
} from "../domain/types.js";

const SERVER_NAME = "electronics-price-mcp";
const SERVER_VERSION = "0.1.0";

export async function createMcpServer(options?: {
  service?: PriceServiceLike;
  env?: RuntimeEnv;
}) {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });
  const service = options?.service ?? createPriceService(options?.env);

  server.registerTool(
    "search_products",
    {
      description: "한국 쇼핑몰 기준으로 전자기기 상품을 검색하고 현재 가격대를 정리합니다.",
      inputSchema: z.object({
        query: z.string().min(1),
        category: z.enum(["laptop", "keyboard", "graphics-card", "monitor", "pc-part"]).optional(),
        budgetMax: z.number().optional(),
        sort: z.enum(["relevance", "price_asc", "price_desc"]).optional(),
        excludeUsed: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional()
      })
    },
    async (args) => {
      try {
        const result = await service.searchProducts({
          query: args.query,
          category: args.category,
          budgetMax: args.budgetMax,
          sort: args.sort ?? "relevance",
          excludeUsed: args.excludeUsed ?? true,
          limit: args.limit ?? 10
        });

        return toToolResult(result);
      } catch (error) {
        return toErrorResult(error);
      }
    }
  );

  server.registerTool(
    "compare_product_prices",
    {
      description: "정확히 같은 모델만 현재 최저가와 판매처 수를 비교합니다.",
      inputSchema: z.object({
        productId: z.string().optional(),
        query: z.string().optional(),
        maxOffers: z.number().int().min(1).max(20).optional()
      })
    },
    async (args) => {
      try {
        const result = await service.compareProductPrices({
          productId: args.productId,
          query: args.query,
          maxOffers: args.maxOffers
        });

        return toToolResult(result);
      } catch (error) {
        return toErrorResult(error);
      }
    }
  );

  server.registerTool(
    "explain_purchase_options",
    {
      description: "현재 검색 결과 안에서 어떤 가격대가 유리한지 간단히 설명합니다.",
      inputSchema: z.object({
        productId: z.string().optional(),
        query: z.string().optional(),
        focus: z.enum(["lowest_price", "seller_variety", "brand"]).optional()
      })
    },
    async (args) => {
      try {
        const result = await service.explainPurchaseOptions({
          productId: args.productId,
          query: args.query,
          focus: args.focus
        });

        return toToolResult(result);
      } catch (error) {
        return toErrorResult(error);
      }
    }
  );

  return server;
}

function toToolResult(
  result: SearchProductsResult | CompareProductPricesResult | ExplainPurchaseOptionsResult
) {
  return {
    content: [
      {
        type: "text" as const,
        text: result.summary
      }
    ],
    structuredContent: result
  };
}

function toErrorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

  return {
    content: [
      {
        type: "text" as const,
        text: message
      }
    ],
    structuredContent: {
      status: "error",
      summary: message
    },
    isError: true
  };
}
