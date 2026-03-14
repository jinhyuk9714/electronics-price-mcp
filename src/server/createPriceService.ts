import { readConfig, type RuntimeEnv } from "../config.js";
import type { ProviderRequestDiagnostics } from "../domain/providerDiagnostics.js";
import { PriceService } from "../domain/priceService.js";
import type {
  CompareProductPricesInput,
  CompareProductPricesResult,
  SearchProvider,
  ExplainPurchaseOptionsInput,
  ExplainPurchaseOptionsResult,
  SearchProductsInput,
  SearchProductsResult
} from "../domain/types.js";
import { AggregateSearchProvider } from "../providers/aggregateSearchProvider.js";
import { DanawaSearchProvider } from "../providers/danawaSearchProvider.js";
import { NaverShoppingClient } from "../providers/naverShoppingClient.js";
import { StaticCatalogSearchProvider } from "../providers/staticCatalogSearchProvider.js";

export interface PriceServiceLike {
  searchProducts(input: SearchProductsInput): Promise<SearchProductsResult>;
  compareProductPrices(input: CompareProductPricesInput): Promise<CompareProductPricesResult>;
  explainPurchaseOptions(input: ExplainPurchaseOptionsInput): Promise<ExplainPurchaseOptionsResult>;
  getLastProviderDiagnostics?(): ProviderRequestDiagnostics | null;
}

const sharedServices = new Map<string, PriceServiceLike>();

export function createSearchProviders(env?: RuntimeEnv): SearchProvider[] {
  const config = readConfig(env);
  const providers: SearchProvider[] = [];

  if (config.naverClientId && config.naverClientSecret) {
    providers.push(
      new NaverShoppingClient({
        clientId: config.naverClientId,
        clientSecret: config.naverClientSecret,
        timeoutMs: config.requestTimeoutMs
      })
    );
  }

  if (config.enableDanawa && config.danawaClientId && config.danawaClientSecret) {
    providers.push(
      new DanawaSearchProvider({
        clientId: config.danawaClientId,
        clientSecret: config.danawaClientSecret,
        apiBaseUrl: config.danawaApiBaseUrl,
        timeoutMs: config.requestTimeoutMs
      })
    );
  }

  if (config.enableStaticCatalog) {
    providers.push(
      new StaticCatalogSearchProvider({
        datasetName: config.staticCatalogDataset
      })
    );
  }

  return providers;
}

export function createSearchProvider(env?: RuntimeEnv): SearchProvider {
  return new AggregateSearchProvider(createSearchProviders(env));
}

export function createPriceService(env?: RuntimeEnv): PriceServiceLike {
  const config = readConfig(env);
  const providers = createSearchProviders(env);

  if (providers.length === 0) {
    return createUnavailableService(UNAVAILABLE_PROVIDER_MESSAGE);
  }

  const cacheKey = [
    "aggregate-provider",
    config.naverClientId ?? "",
    config.naverClientSecret ?? "",
    config.enableDanawa ? "danawa-enabled" : "danawa-disabled",
    config.danawaClientId ?? "",
    config.danawaClientSecret ?? "",
    config.danawaApiBaseUrl,
    config.enableStaticCatalog ? "static-enabled" : "static-disabled",
    config.staticCatalogDataset,
    config.requestTimeoutMs,
    config.cacheTtlMs
  ].join("|");

  const existing = sharedServices.get(cacheKey);
  if (existing) {
    return existing;
  }

  const service = new PriceService({
    provider: new AggregateSearchProvider(providers),
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
    },
    getLastProviderDiagnostics() {
      return null;
    }
  };
}

const UNAVAILABLE_PROVIDER_MESSAGE =
  "NAVER_CLIENT_ID/NAVER_CLIENT_SECRET 또는 ENABLE_DANAWA=true와 DANAWA_CLIENT_ID/DANAWA_CLIENT_SECRET을 설정한 뒤 다시 시도해 주세요.";
