import { describe, expect, test } from "vitest";

import { AggregateSearchProvider } from "../../src/providers/aggregateSearchProvider.js";
import { DanawaSearchProvider } from "../../src/providers/danawaSearchProvider.js";
import { NaverShoppingClient } from "../../src/providers/naverShoppingClient.js";
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
});
