import { readConfig, type RuntimeEnv } from "../config.js";
import { PriceService } from "../domain/priceService.js";
import type {
  CompareProductPricesInput,
  CompareProductPricesResult,
  ExplainPurchaseOptionsInput,
  ExplainPurchaseOptionsResult,
  SearchProductsInput,
  SearchProductsResult
} from "../domain/types.js";
import { NaverShoppingClient } from "../providers/naverShoppingClient.js";

export interface PriceServiceLike {
  searchProducts(input: SearchProductsInput): Promise<SearchProductsResult>;
  compareProductPrices(input: CompareProductPricesInput): Promise<CompareProductPricesResult>;
  explainPurchaseOptions(input: ExplainPurchaseOptionsInput): Promise<ExplainPurchaseOptionsResult>;
}

const sharedServices = new Map<string, PriceServiceLike>();

export function createPriceService(env?: RuntimeEnv): PriceServiceLike {
  const config = readConfig(env);

  if (!config.naverClientId || !config.naverClientSecret) {
    return createUnavailableService(
      "NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 설정한 뒤 다시 시도해 주세요."
    );
  }

  const cacheKey = [
    config.naverClientId,
    config.naverClientSecret,
    config.requestTimeoutMs,
    config.cacheTtlMs
  ].join("|");

  const existing = sharedServices.get(cacheKey);
  if (existing) {
    return existing;
  }

  const service = new PriceService({
    provider: new NaverShoppingClient({
      clientId: config.naverClientId,
      clientSecret: config.naverClientSecret,
      timeoutMs: config.requestTimeoutMs
    }),
    cacheTtlMs: config.cacheTtlMs
  });

  sharedServices.set(cacheKey, service);
  return service;
}

function createUnavailableService(message: string): PriceServiceLike {
  return {
    async searchProducts(input) {
      return {
        query: input.query,
        summary: message,
        offers: [],
        groups: []
      };
    },
    async compareProductPrices(input) {
      return {
        query: input.query ?? "",
        status: "not_found",
        summary: message,
        warning: message,
        selectedProductId: null,
        offers: []
      };
    },
    async explainPurchaseOptions(input) {
      return {
        query: input.query ?? "",
        status: "not_found",
        summary: message,
        warning: message,
        selectedProductId: null,
        offers: []
      };
    }
  };
}
