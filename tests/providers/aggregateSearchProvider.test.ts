import { describe, expect, test, vi } from "vitest";

import { AggregateSearchProvider } from "../../src/providers/aggregateSearchProvider.js";
import type {
  ProviderOffer,
  SearchProvider,
  SearchProviderInput,
  SearchProviderResult
} from "../../src/domain/types.js";

function createOffer(id: string, title = `상품 ${id}`): ProviderOffer {
  return {
    source: "naver-shopping",
    sourceProductId: id,
    title,
    brand: null,
    mallName: `몰${id}`,
    price: 1000,
    link: `https://example.com/${id}`,
    image: null
  };
}

function createProvider(result: SearchProviderResult, source: ProviderOffer["source"] = "naver-shopping"): SearchProvider {
  return {
    source,
    async searchProducts() {
      return result;
    }
  };
}

describe("AggregateSearchProvider", () => {
  test("merges offers from every successful provider", async () => {
    const provider = new AggregateSearchProvider([
      createProvider({
        query: "그램 16",
        offers: [createOffer("100", "LG 그램 16")]
      }),
      createProvider({
        query: "그램 16",
        offers: [createOffer("101", "LG 그램 프로 16")]
      })
    ]);

    const result = await provider.searchProducts({
      query: "그램 16",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result).toMatchObject({
      query: "그램 16"
    });
    expect(result.offers.map((offer) => offer.sourceProductId)).toEqual(["100", "101"]);
  });

  test("keeps successful offers when one provider fails", async () => {
    const provider = new AggregateSearchProvider([
      {
        source: "danawa",
        async searchProducts() {
          throw new Error("upstream exploded");
        }
      },
      createProvider({
        query: "RTX 5070",
        offers: [createOffer("200", "RTX 5070")]
      })
    ]);

    const result = await provider.searchProducts({
      query: "RTX 5070",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.sourceProductId).toBe("200");
  });

  test("throws when every provider fails", async () => {
    const provider = new AggregateSearchProvider([
      {
        source: "naver-shopping",
        async searchProducts() {
          throw new Error("first failure");
        }
      },
      {
        source: "danawa",
        async searchProducts() {
          throw new Error("second failure");
        }
      }
    ]);

    await expect(
      provider.searchProducts({
        query: "B650 메인보드",
        sort: "relevance",
        excludeUsed: true,
        limit: 10
      })
    ).rejects.toThrow("first failure");
  });

  test("forwards the same search input to every provider", async () => {
    const seenInputs: SearchProviderInput[] = [];
    const searchProducts = vi.fn(async (input: SearchProviderInput) => {
      seenInputs.push(input);
      return {
        query: input.query,
        offers: []
      };
    });
    const provider = new AggregateSearchProvider([
      {
        source: "naver-shopping",
        searchProducts
      },
      {
        source: "danawa",
        searchProducts
      }
    ]);

    const input: SearchProviderInput = {
      query: "U2723QE",
      category: "monitor",
      sort: "price_asc",
      excludeUsed: false,
      limit: 5
    };

    await provider.searchProducts(input);

    expect(searchProducts).toHaveBeenCalledTimes(2);
    expect(seenInputs).toEqual([input, input]);
  });

  test("reports per-provider statuses and offer counts when one provider fails", async () => {
    const provider = new AggregateSearchProvider([
      createProvider(
        {
          query: "27GR93U",
          offers: [createOffer("100", "LG 울트라기어 27GR93U")]
        },
        "naver-shopping"
      ),
      {
        source: "danawa",
        async searchProducts() {
          throw new Error("danawa upstream exploded");
        }
      }
    ]);

    const result = await provider.searchProducts({
      query: "27GR93U",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.providerReports).toEqual([
      {
        source: "naver-shopping",
        status: "success",
        offerCount: 1
      },
      {
        source: "danawa",
        status: "error",
        offerCount: 0
      }
    ]);
  });
});
