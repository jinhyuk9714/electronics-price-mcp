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

  test("searchProducts excludes accessory-like titles from device comparisons", async () => {
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
            title: "ZOTAC GAMING GeForce RTX 5070 전용 케이스",
            brand: "ZOTAC",
            mallName: "몰B",
            price: 29000,
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

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.title).not.toContain("케이스");
    expect(result.groups).toHaveLength(1);
  });

  test("searchProducts keeps only exact GPU model matches for exact queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RTX 5070",
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
            title: "MSI GeForce RTX 5070 Gaming Trio",
            brand: "MSI",
            mallName: "몰B",
            price: 829000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "ASUS PRIME GeForce RTX 5060 OC 8GB",
            brand: "ASUS",
            mallName: "몰C",
            price: 699000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "103",
            title: "GIGABYTE GeForce RTX 5070 Ti Windforce OC",
            brand: "GIGABYTE",
            mallName: "몰D",
            price: 999000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "RTX 5070",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.warning).toBeUndefined();
    expect(result.offers).toHaveLength(2);
    expect(result.offers.every((offer) => offer.normalizedModel === "RTX 5070")).toBe(true);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]?.normalizedModel).toBe("RTX 5070");
  });

  test("searchProducts removes config variants but keeps exact notebook device offers", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "NT960XGQ-A51A",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "삼성전자 갤럭시북4 프로 NT960XGQ-A51A 16GB, 2TB",
            brand: "Samsung",
            mallName: "몰A",
            price: 2498900,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "삼성전자 갤럭시북4 프로 NT960XGQ - A51A 16GB, 2TB",
            brand: "Samsung",
            mallName: "몰B",
            price: 2510000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "FINE NT960XGQ-A51A + NVME 1TB 추가 (무선광+파우치)",
            brand: "Samsung",
            mallName: "몰C",
            price: 3800000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "NT960XGQ-A51A",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.warning).toBeUndefined();
    expect(result.offers).toHaveLength(2);
    expect(result.offers.some((offer) => offer.title.includes("추가"))).toBe(false);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]?.normalizedModel).toBe("NT960XGQ-A51A");
  });

  test("searchProducts returns an empty result with a warning when exact notebook queries only match accessories", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "LG 그램 16 16Z90T-GA5CK",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG그램 AI 16Z90T-GA5CK 노트북 키스킨 키커버",
            brand: "LG",
            mallName: "몰A",
            price: 8000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG그램 AI 16Z90T-GA5CK 노트북 키스킨 커버 덮개",
            brand: "LG",
            mallName: "몰B",
            price: 13000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "LG 그램 16 16Z90T-GA5CK",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.summary).toBe("검색 결과가 없습니다: LG 그램 16 16Z90T-GA5CK");
    expect(result.warning).toContain("액세서리");
    expect(result.offers).toHaveLength(0);
    expect(result.groups).toHaveLength(0);
  });

  test("searchProducts returns an empty result with a warning when exact GPU queries only match other variants", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RTX 5070",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "ASUS PRIME GeForce RTX 5060 OC 8GB",
            brand: "ASUS",
            mallName: "몰A",
            price: 699000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "GIGABYTE GeForce RTX 5070 Ti Windforce OC",
            brand: "GIGABYTE",
            mallName: "몰B",
            price: 999000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "RTX 5070",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.summary).toBe("검색 결과가 없습니다: RTX 5070");
    expect(result.warning).toContain("변형");
    expect(result.offers).toHaveLength(0);
    expect(result.groups).toHaveLength(0);
  });

  test("searchProducts normalizes spaced notebook model queries before exact filtering", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "16Z90T GA5CK",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG전자 그램 16Z90T - GA5CK 16GB, 256GB",
            brand: "LG",
            mallName: "몰A",
            price: 1999000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG전자 그램 16Z90T-GA5CK 16GB, 256GB",
            brand: "LG",
            mallName: "몰B",
            price: 2050000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "LG그램 16Z90T-GA5CK 키스킨 키커버",
            brand: "LG",
            mallName: "몰C",
            price: 9000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "16Z90T GA5CK",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.warning).toBeUndefined();
    expect(result.offers).toHaveLength(2);
    expect(result.offers.every((offer) => offer.normalizedModel === "16Z90T-GA5CK")).toBe(true);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]?.normalizedModel).toBe("16Z90T-GA5CK");
  });

  test("searchProducts keeps broad notebook queries exploratory", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "그램 16",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG전자 그램16 16ZD90Q-GX36K RAM 16GB, 256GB",
            brand: "LG",
            mallName: "몰A",
            price: 1399000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "160만+ LG 그램 16 인텔 루나레이크 U5 영상편집 가벼운 노트북",
            brand: "LG",
            mallName: "몰B",
            price: 1999000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "그램 16",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.warning).toBeUndefined();
    expect(result.offers).toHaveLength(2);
    expect(result.groups).toHaveLength(2);
  });

  test("compareProductPrices keeps only exact GPU model matches for exact model queries", async () => {
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
            sourceProductId: "150",
            title: "ASUS PRIME GeForce RTX 5060 OC 8GB",
            brand: "ASUS",
            mallName: "몰C",
            price: 699000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
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
          },
          {
            source: "naver-shopping",
            sourceProductId: "201",
            title: "GIGABYTE GeForce RTX 5070 Eagle OC SFF 12GB",
            brand: "GIGABYTE",
            mallName: "몰D",
            price: 889000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "rtx 5070"
    });

    expect(result.status).toBe("ok");
    expect(result.comparison?.normalizedModel).toBe("RTX 5070");
    expect(result.comparison?.mallCount).toBe(2);
    expect(result.offers.every((offer) => offer.normalizedModel === "RTX 5070")).toBe(true);
  });

  test("compareProductPrices rejects mixed RX variants for broad series queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "rx 9070 시리즈",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "SAPPHIRE PULSE Radeon RX 9070 D6 16GB",
            brand: "SAPPHIRE",
            mallName: "몰A",
            price: 899000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "SAPPHIRE PULSE Radeon RX 9070 XT D6 16GB",
            brand: "SAPPHIRE",
            mallName: "몰B",
            price: 999000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "rx 9070 시리즈"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.warning).toContain("모델 코드");
    expect(result.suggestedQueries).toEqual(["RX 9070 가격 비교해 줘", "RX 9070 XT 가격 비교해 줘"]);
  });

  test("compareProductPrices keeps notebook line-name searches ambiguous when exact models are mixed", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "LG 그램 16",
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
            title: "LG 그램 16 16Z90S-GA5CK",
            brand: "LG",
            mallName: "몰B",
            price: 1549000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "LG 그램 16"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.warning).toContain("모델 코드");
  });

  test("searchProducts normalizes notebook model codes and prefers the highest-confidence group title", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "16Z90T-GA5CK",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG 그램 16 16Z90T GA5CK",
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

    const search = await service.searchProducts({
      query: "16Z90T-GA5CK",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });
    const compare = await service.compareProductPrices({
      query: "16Z90T-GA5CK"
    });

    expect(search.groups).toHaveLength(1);
    expect(search.groups[0]).toMatchObject({
      normalizedModel: "16Z90T-GA5CK",
      title: "LG 그램 16 16Z90T-GA5CK"
    });
    expect(compare.status).toBe("ok");
    expect(compare.comparison?.mallCount).toBe(2);
  });

  test("compareProductPrices stops when only accessory results exist for an exact notebook model query", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "LG 그램 16 16Z90T-GA5CK",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG그램 AI 16Z90T-GA5CK 노트북 키스킨 키커버",
            brand: "LG",
            mallName: "몰A",
            price: 8000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG그램 AI 16Z90T-GA5CK 노트북 키스킨 커버 덮개",
            brand: "LG",
            mallName: "몰B",
            price: 13000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "LG 그램 16 16Z90T-GA5CK"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("비교를 중단");
    expect(result.warning).toContain("액세서리");
    expect(result.suggestedQueries).toBeUndefined();
  });

  test("compareProductPrices filters config bundles but keeps base notebook offers", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "NT960XGQ-A51A",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "삼성전자 갤럭시북4 프로 NT960XGQ-A51A 16GB, 2TB",
            brand: "Samsung",
            mallName: "몰A",
            price: 2498900,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "삼성전자 갤럭시북4 프로 NT960XGQ - A51A 16GB, 2TB",
            brand: "Samsung",
            mallName: "몰B",
            price: 2510000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "FINE NT960XGQ-A51A + NVME 1TB 추가 (무선광+파우치)",
            brand: "Samsung",
            mallName: "몰C",
            price: 3800000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "NT960XGQ-A51A"
    });

    expect(result.status).toBe("ok");
    expect(result.comparison?.normalizedModel).toBe("NT960XGQ-A51A");
    expect(result.comparison?.mallCount).toBe(2);
    expect(result.offers.some((offer) => offer.title.includes("추가"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("파우치"))).toBe(false);
  });

  test("compareProductPrices normalizes spaced notebook model queries before filtering comparison candidates", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "16Z90T GA5CK",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG전자 그램 16Z90T - GA5CK 16GB, 256GB",
            brand: "LG",
            mallName: "몰A",
            price: 1999000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG전자 그램 16Z90T-GA5CK 16GB, 256GB",
            brand: "LG",
            mallName: "몰B",
            price: 2050000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "LG그램 16Z90T-GA5CK 키스킨 키커버",
            brand: "LG",
            mallName: "몰C",
            price: 9000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "16Z90T GA5CK"
    });

    expect(result.status).toBe("ok");
    expect(result.comparison?.normalizedModel).toBe("16Z90T-GA5CK");
    expect(result.comparison?.mallCount).toBe(2);
    expect(result.offers.every((offer) => offer.normalizedModel === "16Z90T-GA5CK")).toBe(true);
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
    expect(result.suggestedQueries).toBeUndefined();
  });

  test("explainPurchaseOptions surfaces the accessory/config warning for exact-model queries without clean device offers", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "LG 그램 16 16Z90T-GA5CK",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG그램 AI 16Z90T-GA5CK 노트북 키스킨 키커버",
            brand: "LG",
            mallName: "몰A",
            price: 8000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "LG 그램 16 16Z90T-GA5CK",
      focus: "lowest_price"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("비교를 중단");
    expect(result.warning).toContain("액세서리");
    expect(result.suggestedQueries).toBeUndefined();
  });

  test("explainPurchaseOptions suggests more specific follow-up queries for ambiguous broad notebook searches", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "그램 16",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG전자 그램16 16ZD90Q-GX36K RAM 16GB, 256GB",
            brand: "LG",
            mallName: "몰A",
            price: 1399000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG전자 그램16 16ZD90RU-GX54K RAM 16GB, 256GB",
            brand: "LG",
            mallName: "몰B",
            price: 1499000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "2026 LG그램 프로 16 윈도우11 엘지 사무용 노트북",
            brand: "LG",
            mallName: "몰C",
            price: 2433000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "그램 16",
      focus: "lowest_price"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("바로 판단할 수 없습니다");
    expect(result.warning).toContain("추천 검색어");
    expect(result.suggestedQueries).toEqual([
      "16ZD90Q-GX36K 지금 사도 괜찮은 가격대야?",
      "16ZD90RU-GX54K 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("compareProductPrices suggests more specific follow-up queries for ambiguous broad GPU searches", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RTX 5070 시리즈",
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
            title: "MSI GeForce RTX 5070 Ti Ventus 2X OC D7 12GB",
            brand: "MSI",
            mallName: "몰B",
            price: 999000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "세탁기 부품 AP5781465-PS8690623",
            brand: null,
            mallName: "몰C",
            price: 15000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "RTX 5070 시리즈"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("바로 판단할 수 없습니다");
    expect(result.warning).toContain("추천 검색어");
    expect(result.suggestedQueries).toEqual([
      "RTX 5070 가격 비교해 줘",
      "RTX 5070 TI 가격 비교해 줘"
    ]);
  });

  test("compareProductPrices trims comparison phrasing before calling the provider", async () => {
    let receivedQuery = "";

    const service = new PriceService({
      provider: {
        async searchProducts(input) {
          receivedQuery = input.query;
          return {
            query: input.query,
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
                title: "MSI GeForce RTX 5070 Ti Ventus 2X OC D7 12GB",
                brand: "MSI",
                mallName: "몰B",
                price: 999000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              }
            ]
          };
        }
      }
    });

    await service.compareProductPrices({
      query: "RTX 5070 시리즈 가격 비교해 줘"
    });

    expect(receivedQuery).toBe("RTX 5070 시리즈");
  });

  test("explainPurchaseOptions trims purchase-intent phrasing before calling the provider", async () => {
    let receivedQuery = "";

    const service = new PriceService({
      provider: {
        async searchProducts(input) {
          receivedQuery = input.query;
          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "LG전자 그램16 16ZD90Q-GX36K RAM 16GB, 256GB",
                brand: "LG",
                mallName: "몰A",
                price: 1399000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "101",
                title: "LG전자 그램16 16ZD90RU-GX54K RAM 16GB, 256GB",
                brand: "LG",
                mallName: "몰B",
                price: 1499000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              }
            ]
          };
        }
      }
    });

    await service.explainPurchaseOptions({
      query: "그램 16 지금 사도 괜찮아?"
    });

    expect(receivedQuery).toBe("그램 16");
  });
});
