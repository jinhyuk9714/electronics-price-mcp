import { describe, expect, test } from "vitest";

import { PriceService } from "../../src/domain/priceService.js";
import type { SearchProvider, SearchProviderResult } from "../../src/domain/types.js";

function createProvider(result: SearchProviderResult): SearchProvider {
  return {
    async searchProducts() {
      return result;
    }
  };
}

describe("PriceService", () => {
  test("searchProducts deduplicates duplicate offers and groups exact same models", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "rtx 5070",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
            brand: "ZOTAC",
            mallName: "몰A",
            price: 799000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
            brand: "ZOTAC",
            mallName: "몰A",
            price: 799000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
            brand: "ZOTAC",
            mallName: "몰B",
            price: 819000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "rtx 5070",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(2);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({
      normalizedModel: "RTX 5070",
      minPrice: 799000,
      maxPrice: 819000,
      offerCount: 2
    });
    expect(result.offers[0]?.productId).toBeTruthy();
  });

  test("compareProductPrices rejects ambiguous comparisons", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "rtx 5070",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
            brand: "ZOTAC",
            mallName: "몰A",
            price: 799000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "200",
            title: "MSI GeForce RTX 5070 Ti Ventus 2X OC D7 12GB",
            brand: "MSI",
            mallName: "몰B",
            price: 999000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "rtx 5070"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.warning).toContain("정확히 같은 모델");
  });

  test("explainPurchaseOptions summarizes current price spread for the lowest price focus", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "그램 16",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG 그램 16 16Z90T-GA5CK",
            brand: "LG",
            mallName: "몰A",
            price: 1499000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG 그램 16 16Z90T-GA5CK",
            brand: "LG",
            mallName: "몰B",
            price: 1549000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "그램 16",
      focus: "lowest_price"
    });

    expect(result.status).toBe("ok");
    expect(result.insight?.focus).toBe("lowest_price");
    expect(result.summary).toContain("1499000");
  });
});
