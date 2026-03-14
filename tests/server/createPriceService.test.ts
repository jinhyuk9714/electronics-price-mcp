import { describe, expect, test } from "vitest";

import { AggregateSearchProvider } from "../../src/providers/aggregateSearchProvider.js";
import { DanawaSearchProvider } from "../../src/providers/danawaSearchProvider.js";
import { NaverShoppingClient } from "../../src/providers/naverShoppingClient.js";
import { StaticCatalogSearchProvider } from "../../src/providers/staticCatalogSearchProvider.js";
import {
  createPriceService,
  createSearchProvider,
  createSearchProviders
} from "../../src/server/createPriceService.js";

describe("createPriceService", () => {
  test("returns Naver-backed providers through the registry when credentials exist", () => {
    const providers = createSearchProviders({
      NAVER_CLIENT_ID: "naver-id",
      NAVER_CLIENT_SECRET: "naver-secret"
    });

    expect(providers).toHaveLength(1);
    expect(providers[0]).toBeInstanceOf(NaverShoppingClient);
  });

  test("does not return Danawa-backed providers when the rollout gate is disabled", () => {
    const providers = createSearchProviders({
      ENABLE_DANAWA: "false",
      DANAWA_CLIENT_ID: "danawa-id",
      DANAWA_CLIENT_SECRET: "danawa-secret"
    });

    expect(providers).toHaveLength(0);
  });

  test("returns Danawa-backed providers through the registry when the rollout gate is enabled", () => {
    const providers = createSearchProviders({
      ENABLE_DANAWA: "true",
      DANAWA_CLIENT_ID: "danawa-id",
      DANAWA_CLIENT_SECRET: "danawa-secret"
    });

    expect(providers).toHaveLength(1);
    expect(providers[0]).toBeInstanceOf(DanawaSearchProvider);
  });

  test("returns both providers when Naver credentials exist and Danawa is explicitly enabled", () => {
    const providers = createSearchProviders({
      NAVER_CLIENT_ID: "naver-id",
      NAVER_CLIENT_SECRET: "naver-secret",
      ENABLE_DANAWA: "true",
      DANAWA_CLIENT_ID: "danawa-id",
      DANAWA_CLIENT_SECRET: "danawa-secret"
    });

    expect(providers).toHaveLength(2);
    expect(providers[0]).toBeInstanceOf(NaverShoppingClient);
    expect(providers[1]).toBeInstanceOf(DanawaSearchProvider);
  });

  test("wraps active providers in an aggregate provider", () => {
    const provider = createSearchProvider({
      NAVER_CLIENT_ID: "naver-id",
      NAVER_CLIENT_SECRET: "naver-secret"
    });

    expect(provider).toBeInstanceOf(AggregateSearchProvider);
  });

  test("returns static catalog providers when explicitly enabled", () => {
    const providers = createSearchProviders({
      ENABLE_STATIC_CATALOG: "true",
      STATIC_CATALOG_DATASET: "core-exact-v1"
    } as never);

    expect(providers).toHaveLength(1);
    expect(providers[0]).toBeInstanceOf(StaticCatalogSearchProvider);
  });

  test("returns static catalog alongside active providers", () => {
    const providers = createSearchProviders({
      NAVER_CLIENT_ID: "naver-id",
      NAVER_CLIENT_SECRET: "naver-secret",
      ENABLE_STATIC_CATALOG: "true",
      STATIC_CATALOG_DATASET: "core-exact-v1"
    } as never);

    expect(providers).toHaveLength(2);
    expect(providers[0]).toBeInstanceOf(NaverShoppingClient);
    expect(providers[1]).toBeInstanceOf(StaticCatalogSearchProvider);
  });

  test("still returns an unavailable service when every provider credential is missing", async () => {
    const service = createPriceService();

    const result = await service.searchProducts({
      query: "그램 16",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result).toMatchObject({
      query: "그램 16",
      summary: expect.stringContaining("DANAWA_CLIENT_ID")
    });
  });

  test("uses static catalog as a canary/dev fallback when enabled without real provider credentials", async () => {
    const service = createPriceService({
      ENABLE_STATIC_CATALOG: "true",
      STATIC_CATALOG_DATASET: "core-exact-v1"
    } as never);

    const searchResult = await service.searchProducts({
      query: "RTX 5070",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(searchResult.offers.length).toBeGreaterThan(0);
    expect(searchResult.offers[0]?.source).toBe("static-catalog");

    const compareResult = await service.compareProductPrices({
      query: "RTX 5070 가격 비교해 줘"
    });

    expect(compareResult.status).toBe("ok");
    expect(compareResult.offers.every((offer) => offer.source === "static-catalog")).toBe(true);
  });

  test("keeps broad compare ambiguous when only static catalog results are available", async () => {
    const service = createPriceService({
      ENABLE_STATIC_CATALOG: "true",
      STATIC_CATALOG_DATASET: "core-exact-v1"
    } as never);

    const compareResult = await service.compareProductPrices({
      query: "B650 메인보드 가격 비교해 줘"
    });

    expect(compareResult.status).toBe("ambiguous");
    expect(compareResult.offers.every((offer) => offer.source === "static-catalog")).toBe(true);
  });

  test("supports canary-eval-v1 as a static-only canary fallback for exact compare and broad suggestions", async () => {
    const service = createPriceService({
      ENABLE_STATIC_CATALOG: "true",
      STATIC_CATALOG_DATASET: "canary-eval-v1"
    } as never);

    const k660Search = await service.searchProducts({
      query: "앱코 K660",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });
    const a75Compare = await service.compareProductPrices({
      query: "DrunkDeer A75 가격 비교해 줘"
    });
    const s27dg500Compare = await service.compareProductPrices({
      query: "삼성 S27DG500 가격 비교해 줘"
    });
    const ddr5Compare = await service.compareProductPrices({
      query: "DDR5 32GB 메모리 가격 비교해 줘"
    });

    expect(k660Search.offers[0]?.title).toContain("앱코");
    expect(a75Compare.status).toBe("ok");
    expect(a75Compare.summary).toContain("DrunkDeer");
    expect(s27dg500Compare.status).toBe("ok");
    expect(s27dg500Compare.summary).toContain("S27DG500");
    expect(ddr5Compare.status).toBe("ambiguous");
    expect(ddr5Compare.suggestedQueries?.length).toBeGreaterThan(0);
  });
});
