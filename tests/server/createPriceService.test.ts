import { describe, expect, test } from "vitest";

import { AggregateSearchProvider } from "../../src/providers/aggregateSearchProvider.js";
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

  test("wraps active providers in an aggregate provider", () => {
    const provider = createSearchProvider({
      NAVER_CLIENT_ID: "naver-id",
      NAVER_CLIENT_SECRET: "naver-secret"
    });

    expect(provider).toBeInstanceOf(AggregateSearchProvider);
  });

  test("still returns an unavailable service when credentials are missing", async () => {
    const service = createPriceService();

    const result = await service.searchProducts({
      query: "그램 16",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result).toMatchObject({
      query: "그램 16",
      summary: expect.stringContaining("NAVER_CLIENT_ID")
    });
  });
});
