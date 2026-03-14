import { describe, expect, test } from "vitest";

import { PriceService } from "../../src/domain/priceService.js";
import type { SearchProvider, SearchProviderResult } from "../../src/domain/types.js";

function createProvider(result: SearchProviderResult): SearchProvider {
  return {
    source: "naver-shopping",
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

  test("searchProducts groups the same exact model across multiple sources", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "27GR93U",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG 울트라기어 27GR93U",
            brand: "LG전자",
            mallName: "몰A",
            price: 799000,
            link: "https://example.com/naver-a",
            image: "https://example.com/naver-a.jpg"
          },
          {
            source: "danawa",
            sourceProductId: "dw-100",
            title: "LG 울트라기어 27GR93U",
            brand: "LG전자",
            mallName: "몰B",
            price: 789000,
            link: "https://example.com/danawa-b",
            image: "https://example.com/danawa-b.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "27GR93U",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(2);
    expect(result.offers.map((offer) => offer.source)).toEqual(["danawa", "naver-shopping"]);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({
      normalizedModel: "LG 27GR93U",
      offerCount: 2
    });
  });

  test("searchProducts deduplicates same-mall exact model offers across multiple sources", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "27GR93U",
        offers: [
          {
            source: "danawa",
            sourceProductId: "dw-100",
            title: "LG 울트라기어 27GR93U",
            brand: "LG전자",
            mallName: "전자랜드",
            price: 789000,
            link: "https://example.com/danawa-27gr93u",
            image: null
          },
          {
            source: "naver-shopping",
            sourceProductId: "nv-100",
            title: "LG 울트라기어 27GR93U",
            brand: "LG전자",
            mallName: "전자랜드",
            price: 789000,
            link: "https://example.com/naver-27gr93u",
            image: "https://example.com/naver-27gr93u.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "27GR93U",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]).toMatchObject({
      source: "naver-shopping",
      mallName: "전자랜드",
      normalizedModel: "LG 27GR93U"
    });
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({
      normalizedModel: "LG 27GR93U",
      offerCount: 1
    });
  });

  test("searchProducts deduplicates same-mall exact model offers across naver and static catalog", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "27GR93U",
        offers: [
          {
            source: "static-catalog",
            sourceProductId: "static-27gr93u",
            title: "LG 울트라기어 27GR93U",
            brand: "LG전자",
            mallName: "전자랜드",
            price: 789000,
            link: "https://static.example.com/27gr93u",
            image: null
          },
          {
            source: "naver-shopping",
            sourceProductId: "nv-100",
            title: "LG 울트라기어 27GR93U",
            brand: "LG전자",
            mallName: "전자랜드",
            price: 789000,
            link: "https://naver.example.com/27gr93u",
            image: "https://naver.example.com/27gr93u.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "27GR93U",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]).toMatchObject({
      source: "naver-shopping",
      mallName: "전자랜드",
      normalizedModel: "LG 27GR93U"
    });
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

  test("searchProducts removes rental products from broad notebook searches", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "[대여] 노트북 렌탈 게이밍 MSI GF76 i7 RTX 4060 임대 대여 7일",
            brand: "MSI",
            mallName: "몰A",
            price: 39000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "HP 빅터스 16 게이밍 노트북 RTX 4060",
            brand: "HP",
            mallName: "몰B",
            price: 1479000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "레노버 리전 5 게이밍 노트북 RTX 4060",
            brand: "Lenovo",
            mallName: "몰C",
            price: 1649000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.warning).toBeUndefined();
    expect(result.offers).toHaveLength(2);
    expect(result.offers.some((offer) => offer.title.includes("렌탈"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("대여"))).toBe(false);
  });

  test("searchProducts groups broad notebook searches by notebook model code instead of GPU name", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 15-fb2061AX 윈도우11 16GB 라이젠5 8000 시리즈 지포스 RTX 4060 게이밍 노트북",
            brand: "HP",
            mallName: "몰A",
            price: 1480000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "HP OMEN 16-xf0052ax 16GB, 512GB RTX 4060",
            brand: "HP",
            mallName: "몰B",
            price: 1859000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "레노버 리전 5i 15IRX9 i7 4060 24GB, 1TB",
            brand: "Lenovo",
            mallName: "몰C",
            price: 1644000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "103",
            title: "HP 빅터스 게이밍 노트북 라이젠7 RTX 4060 영상편집 코딩 배틀그라운드 포토샵 8GB 512GB",
            brand: "HP",
            mallName: "몰D",
            price: 1549000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.groups.map((group) => group.normalizedModel)).toEqual([
      "15-FB2061AX",
      "15IRX9",
      "16-XF0052AX",
      null
    ]);
    expect(result.offers.filter((offer) => offer.normalizedModel === "RTX 4060")).toHaveLength(0);
  });

  test("searchProducts excludes other GPU generations from broad notebook queries with a requested GPU", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 15-fb2061AX 윈도우11 16GB 지포스 RTX 4060 게이밍 노트북",
            brand: "HP",
            mallName: "몰A",
            price: 1480000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "HP 빅터스 15 게이밍 노트북 인텔i5 RTX4050 대학생 고사양",
            brand: "HP",
            mallName: "몰B",
            price: 1280000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "HP OMEN 16-xf0052ax 16GB, 512GB RTX 4060",
            brand: "HP",
            mallName: "몰C",
            price: 1859000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(2);
    expect(result.offers.some((offer) => offer.title.includes("RTX4050"))).toBe(false);
  });

  test("searchProducts keeps broad notebook marketing titles exploratory without forcing GPU-only normalized models", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 게이밍 노트북 라이젠7 RTX 4060 영상편집 코딩 배틀그라운드 포토샵 8GB 512GB",
            brand: "HP",
            mallName: "몰A",
            price: 1549000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.normalizedModel).toBeNull();
    expect(result.groups[0]?.normalizedModel).toBeNull();
  });

  test("searchProducts groups notebook marketing titles by family fallback while keeping exact codes separate", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 15 게이밍 노트북 라이젠7 RTX 4060 영상편집",
            brand: "HP",
            mallName: "몰A",
            price: 1499000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "HP 빅터스 15 고성능 게이밍 노트북 RTX 4060 대학생",
            brand: "HP",
            mallName: "몰B",
            price: 1529000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "HP 빅터스 16 게이밍 노트북 라이젠7 RTX 4060 영상편집",
            brand: "HP",
            mallName: "몰C",
            price: 1599000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "103",
            title: "레노버 리전 5i 15IRX9 i7 4060 24GB, 1TB",
            brand: "Lenovo",
            mallName: "몰D",
            price: 1644000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "104",
            title: "MSI 게이밍 노트북 RTX 4060 윈11 영상편집 포토샵",
            brand: "MSI",
            mallName: "몰E",
            price: 1699000,
            link: "https://example.com/e",
            image: "https://example.com/e.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.groups).toHaveLength(4);
    expect(result.groups.map((group) => group.offerCount)).toEqual([1, 2, 1, 1]);
    expect(result.groups.map((group) => group.normalizedModel)).toEqual(["15IRX9", null, null, null]);
    expect(result.groups[0]?.normalizedModel).toBe("15IRX9");
    expect(result.groups[1]?.title).toContain("빅터스 15");
    expect(result.groups[2]?.title).toContain("빅터스 16");
    expect(result.groups[3]?.title).toContain("MSI");
    expect(result.offers.filter((offer) => offer.title.includes("빅터스 15")).map((offer) => offer.productId)).toHaveLength(2);
    expect(new Set(result.offers.filter((offer) => offer.title.includes("빅터스 15")).map((offer) => offer.productId)).size).toBe(1);
  });

  test("searchProducts keeps size-less notebook family fallbacks separate from sized families", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 게이밍 노트북 라이젠7 RTX 4060 영상편집",
            brand: "HP",
            mallName: "몰A",
            price: 1449000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "HP 빅터스 고성능 노트북 RTX 4060 대학생 입문용",
            brand: "HP",
            mallName: "몰B",
            price: 1479000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "HP 빅터스 15 게이밍 노트북 RTX 4060",
            brand: "HP",
            mallName: "몰C",
            price: 1499000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "103",
            title: "HP 빅터스 16 게이밍 노트북 RTX 4060",
            brand: "HP",
            mallName: "몰D",
            price: 1599000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.groups).toHaveLength(3);
    expect(result.groups.map((group) => group.offerCount).sort((left, right) => right - left)).toEqual([2, 1, 1]);
    expect(result.groups.some((group) => group.offerCount === 2 && group.title.includes("빅터스"))).toBe(true);

    const genericVictusIds = result.offers
      .filter((offer) => offer.title.includes("빅터스 게이밍") || offer.title.includes("빅터스 고성능"))
      .map((offer) => offer.productId);

    expect(new Set(genericVictusIds).size).toBe(1);
    expect(result.offers.find((offer) => offer.title.includes("빅터스 15"))?.productId).not.toBe(genericVictusIds[0]);
    expect(result.offers.find((offer) => offer.title.includes("빅터스 16"))?.productId).not.toBe(genericVictusIds[0]);
  });

  test("searchProducts keeps gram and gram pro families separate for broad notebook queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "그램 16",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG 그램 16 가벼운 사무용 노트북",
            brand: "LG",
            mallName: "몰A",
            price: 1499000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG 그램 프로 16 고성능 크리에이터 노트북",
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

    expect(result.groups).toHaveLength(2);
    expect(result.groups[0]?.title).toContain("그램 16");
    expect(result.groups[1]?.title).toContain("그램 프로 16");
    expect(result.groups.every((group) => group.normalizedModel === null)).toBe(true);
  });

  test("searchProducts keeps galaxybook4 pro and pro 360 families separate for broad notebook queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "갤럭시북4 프로 16",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "삼성 갤럭시북4 프로 16 크리에이터 노트북",
            brand: "Samsung",
            mallName: "몰A",
            price: 1899000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "삼성 갤럭시북4 프로 360 16 대학생 노트북",
            brand: "Samsung",
            mallName: "몰B",
            price: 2099000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "갤럭시북4 프로 16",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.groups).toHaveLength(2);
    expect(result.groups[0]?.title).toContain("갤럭시북4 프로 16");
    expect(result.groups[1]?.title).toContain("갤럭시북4 프로 360 16");
    expect(result.groups.every((group) => group.normalizedModel === null)).toBe(true);
  });

  test("searchProducts orders broad notebook groups as exact codes, then family fallbacks, then unknown titles", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 게이밍 노트북 라이젠7 RTX 4060 영상편집",
            brand: "HP",
            mallName: "몰A",
            price: 1449000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "MSI 게이밍 노트북 RTX 4060 윈11 영상편집 포토샵",
            brand: "MSI",
            mallName: "몰B",
            price: 1499000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "레노버 리전 5i 15IRX9 i7 4060 24GB, 1TB",
            brand: "Lenovo",
            mallName: "몰C",
            price: 1644000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.groups).toHaveLength(3);
    expect(result.groups[0]?.normalizedModel).toBe("15IRX9");
    expect(result.groups[1]?.title).toContain("빅터스");
    expect(result.groups[1]?.normalizedModel).toBeNull();
    expect(result.groups[2]?.title).toContain("MSI");
    expect(result.groups[2]?.normalizedModel).toBeNull();
  });

  test("searchProducts groups MSI and ASUS marketing titles by their notebook families", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "MSI Cyborg 15 게이밍 노트북 RTX 4060 대학생 입문용",
            brand: "MSI",
            mallName: "몰A",
            price: 1449000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "MSI Cyborg 15 고성능 게이밍 노트북 RTX 4060 영상편집",
            brand: "MSI",
            mallName: "몰B",
            price: 1499000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "MSI Katana 17 게이밍 노트북 RTX 4060 윈도우11",
            brand: "MSI",
            mallName: "몰C",
            price: 1699000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "103",
            title: "ASUS TUF Gaming A15 RTX 4060 게이밍 노트북",
            brand: "ASUS",
            mallName: "몰D",
            price: 1749000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "104",
            title: "ASUS TUF Gaming RTX 4060 노트북 영상편집",
            brand: "ASUS",
            mallName: "몰E",
            price: 1799000,
            link: "https://example.com/e",
            image: "https://example.com/e.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.groups).toHaveLength(4);
    expect(result.groups.map((group) => group.offerCount).sort((left, right) => right - left)).toEqual([2, 1, 1, 1]);
    expect(result.groups.some((group) => group.offerCount === 2 && group.title.includes("Cyborg 15"))).toBe(true);

    const cyborgIds = result.offers
      .filter((offer) => offer.title.includes("Cyborg 15"))
      .map((offer) => offer.productId);

    expect(new Set(cyborgIds).size).toBe(1);
    expect(result.offers.find((offer) => offer.title.includes("Katana 17"))?.productId).not.toBe(cyborgIds[0]);

    const tufIds = result.offers
      .filter((offer) => offer.title.includes("ASUS TUF"))
      .map((offer) => offer.productId);

    expect(new Set(tufIds).size).toBe(2);
  });

  test("searchProducts removes office noise from broad gaming keyboard searches", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "게이밍 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "DrunkDeer A75 PRO 게이밍 키보드 래피드트리거",
            brand: "DrunkDeer",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "로지텍 사무용 오피스 무선 키보드 저소음",
            brand: "Logitech",
            mallName: "몰B",
            price: 59000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "인체공학 오피스 키보드 손목보호",
            brand: null,
            mallName: "몰C",
            price: 39000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "게이밍 키보드 찾아줘",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.title).toContain("게이밍");
    expect(result.offers.some((offer) => offer.title.includes("사무용"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("오피스"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("인체공학"))).toBe(false);
  });

  test("searchProducts removes gaming noise from broad office keyboard searches", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "저소음 사무용 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "로지텍 저소음 사무용 무선 키보드",
            brand: "Logitech",
            mallName: "몰A",
            price: 69000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "RGB 게이밍 기계식 키보드 104키",
            brand: null,
            mallName: "몰B",
            price: 89000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "저소음 사무용 키보드 검색해 줘",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.title).toContain("사무용");
    expect(result.offers.some((offer) => offer.title.includes("게이밍"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("RGB"))).toBe(false);
  });

  test("searchProducts removes office and study noise from broad gaming laptop searches", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "게이밍 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 16 게이밍 노트북 RTX 4060",
            brand: "HP",
            mallName: "몰A",
            price: 1599000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG 그램 16 사무용 노트북 가벼운 업무용",
            brand: "LG",
            mallName: "몰B",
            price: 1499000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "삼성 갤럭시북 인강용 학생용 노트북",
            brand: "Samsung",
            mallName: "몰C",
            price: 1199000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "게이밍 노트북 검색해 줘",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.title).toContain("게이밍");
    expect(result.offers.some((offer) => offer.title.includes("사무용"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("업무용"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("인강용"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("학생용"))).toBe(false);
  });

  test("searchProducts keeps ROG sub-lines and LOQ exact codes separate", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "ASUS ROG Strix G16 RTX 4060 게이밍 노트북",
            brand: "ASUS",
            mallName: "몰A",
            price: 2049000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "ASUS ROG Zephyrus G16 RTX 4060 크리에이터 노트북",
            brand: "ASUS",
            mallName: "몰B",
            price: 2149000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "레노버 LOQ 게이밍 노트북 RTX 4060 대학생 입문용",
            brand: "레노버",
            mallName: "몰C",
            price: 1549000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "103",
            title: "레노버 LOQ 15ARP9 R7 4060 12GB, 512GB",
            brand: "레노버",
            mallName: "몰D",
            price: 1916900,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "4060 노트북",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.groups).toHaveLength(4);
    expect(result.groups.some((group) => group.title.includes("ROG Strix"))).toBe(true);
    expect(result.groups.some((group) => group.title.includes("ROG Zephyrus"))).toBe(true);
    expect(result.groups.some((group) => group.normalizedModel === "15ARP9")).toBe(true);
    expect(result.groups.some((group) => group.title.includes("LOQ 게이밍"))).toBe(true);
  });

  test("searchProducts removes GPU accessories and complete PCs from broad graphics searches", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RTX 5070 시리즈",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "ACIDALIE 레드 안티 새깅 GPU 브라켓 - RTX 5070 /40/30 시리즈",
            brand: null,
            mallName: "몰A",
            price: 115150,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "인텔 울트라7 265KF RTX5070 고사양 게이밍컴퓨터 조립PC",
            brand: "포유컴",
            mallName: "몰B",
            price: 2829000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge OC 12GB",
            brand: "ZOTAC",
            mallName: "몰C",
            price: 919000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "103",
            title: "MSI GeForce RTX 5070 Ti Ventus 3X OC 16GB",
            brand: "MSI",
            mallName: "몰D",
            price: 1069000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const result = await service.searchProducts({
      query: "RTX 5070 시리즈",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.warning).toBeUndefined();
    expect(result.offers).toHaveLength(2);
    expect(result.offers.some((offer) => offer.title.includes("브라켓"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("조립PC"))).toBe(false);
    expect(result.groups.map((group) => group.normalizedModel)).toEqual(["RTX 5070", "RTX 5070 TI"]);
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
    expect(result.summary).toContain("정확히 같은 모델");
    expect(result.warning).toContain("시리즈/계열");
    expect(result.suggestedQueries).toEqual(["RX 9070 가격 비교해 줘", "RX 9070 XT 가격 비교해 줘"]);
  });

  test("compareProductPrices builds suggested queries from cleaned broad graphics results only", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RTX 5070 시리즈",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "ACIDALIE 레드 안티 새깅 GPU 브라켓 - RTX 5070 /40/30 시리즈",
            brand: null,
            mallName: "몰A",
            price: 115150,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "인텔 울트라7 265KF RTX5070 고사양 게이밍컴퓨터 조립PC",
            brand: "포유컴",
            mallName: "몰B",
            price: 2829000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge OC 12GB",
            brand: "ZOTAC",
            mallName: "몰C",
            price: 919000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "103",
            title: "MSI GeForce RTX 5070 Ti Ventus 3X OC 16GB",
            brand: "MSI",
            mallName: "몰D",
            price: 1069000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "RTX 5070 시리즈 가격 비교해 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual(["RTX 5070 가격 비교해 줘", "RTX 5070 TI 가격 비교해 줘"]);
    expect(result.offers.some((offer) => offer.title.includes("브라켓"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("조립PC"))).toBe(false);
  });

  test("compareProductPrices keeps broad RX series queries ambiguous and filters non-device titles", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RX 9070 시리즈",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "1 GE 90-70/90-30/ RX 3i 시리즈 프로그래밍 다운로드 라 IC690USB901과 호환",
            brand: null,
            mallName: "몰A",
            price: 50660,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "SAPPHIRE PULSE Radeon RX 9070 D6 16GB",
            brand: "SAPPHIRE",
            mallName: "몰B",
            price: 899000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "SAPPHIRE PULSE Radeon RX 9070 XT D6 16GB",
            brand: "SAPPHIRE",
            mallName: "몰C",
            price: 999000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "RX 9070 시리즈 가격 비교해 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("정확히 같은 모델");
    expect(result.warning).toContain("시리즈/계열");
    expect(result.suggestedQueries).toEqual(["RX 9070 가격 비교해 줘", "RX 9070 XT 가격 비교해 줘"]);
    expect(result.offers.some((offer) => offer.title.includes("프로그래밍"))).toBe(false);
  });

  test("compareProductPrices falls back to GPU family suggestions when broad RX series results clean down to empty", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RX 9070 시리즈",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "1 GE 90-70/90-30/ RX 3i 시리즈 프로그래밍 다운로드 라 IC690USB901과 호환",
            brand: null,
            mallName: "몰A",
            price: 50660,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "RX 9070 시리즈 가격 비교해 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.offers).toHaveLength(0);
    expect(result.suggestedQueries).toEqual(["RX 9070 가격 비교해 줘", "RX 9070 XT 가격 비교해 줘"]);
  });

  test("compareProductPrices keeps bare vendor GPU queries ambiguous instead of promoting rental matches", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "엔비디아 5070 그래픽카드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "[렌탈] RTX 5070 그래픽카드 렌탈 대여 30일",
            brand: null,
            mallName: "몰A",
            price: 88000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge OC 12GB",
            brand: "ZOTAC",
            mallName: "몰B",
            price: 919000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "엔비디아 5070 그래픽카드 비교해 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("정확히 같은 모델");
    expect(result.warning).toContain("정확한 모델");
    expect(result.suggestedQueries).toEqual(["RTX 5070 가격 비교해 줘"]);
    expect(result.offers.some((offer) => offer.title.includes("렌탈"))).toBe(false);
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

  test("compareProductPrices suggests notebook model-code follow-ups for broad notebook queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 15-fb2061AX 윈도우11 16GB 지포스 RTX 4060 게이밍 노트북",
            brand: "HP",
            mallName: "몰A",
            price: 1480000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "레노버 리전 5i 15IRX9 i7 4060 24GB, 1TB",
            brand: "Lenovo",
            mallName: "몰B",
            price: 1644000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "HP 빅터스 게이밍 노트북 라이젠7 RTX 4060 영상편집 코딩 배틀그라운드 포토샵 8GB 512GB",
            brand: "HP",
            mallName: "몰C",
            price: 1549000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "4060 노트북 지금 사도 돼?"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual(["15-FB2061AX 가격 비교해 줘", "15IRX9 가격 비교해 줘"]);
    expect(result.suggestedQueries?.some((query) => query.includes("RTX 4060"))).toBe(false);
  });

  test("compareProductPrices stays ambiguous even when broad notebook family fallback groups collapse results", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 15 게이밍 노트북 라이젠7 RTX 4060 영상편집",
            brand: "HP",
            mallName: "몰A",
            price: 1499000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "HP 빅터스 15 고성능 게이밍 노트북 RTX 4060 대학생",
            brand: "HP",
            mallName: "몰B",
            price: 1529000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "4060 노트북 지금 사도 돼?"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toBeUndefined();
  });

  test("compareProductPrices removes office noise from broad gaming keyboard comparisons", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "게이밍 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "DrunkDeer A75 PRO 게이밍 키보드 래피드트리거",
            brand: "DrunkDeer",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "로지텍 사무용 오피스 무선 키보드 저소음",
            brand: "Logitech",
            mallName: "몰B",
            price: 59000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "게이밍 키보드 가격 비교해 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.title).toContain("게이밍");
    expect(result.offers.some((offer) => offer.title.includes("사무용"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("오피스"))).toBe(false);
  });

  test("explainPurchaseOptions removes office noise from broad gaming keyboard explanations", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "게이밍 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "DrunkDeer A75 PRO 게이밍 키보드 래피드트리거",
            brand: "DrunkDeer",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "로지텍 사무용 오피스 무선 키보드 저소음",
            brand: "Logitech",
            mallName: "몰B",
            price: 59000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "게이밍 키보드 지금 사도 돼?",
      focus: "lowest_price"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.title).toContain("게이밍");
    expect(result.offers.some((offer) => offer.title.includes("사무용"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("오피스"))).toBe(false);
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
        query: "16Z90T-GA5CK",
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
      query: "16Z90T-GA5CK",
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
    expect(result.summary).toContain("정확히 같은 모델");
    expect(result.warning).toContain("추천 검색어");
    expect(result.suggestedQueries).toEqual([
      "RTX 5070 가격 비교해 줘",
      "RTX 5070 TI 가격 비교해 줘"
    ]);
  });

  test("compareProductPrices suggests exact keyboard follow-ups for broad Keychron queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "Keychron 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "키크론 B1 PRO 레트로 그린 팬터그래프 키보드",
            brand: "키크론",
            mallName: "몰A",
            price: 59000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "키크론 K5 SE 블루투스 무선 슬림 기계식 키보드",
            brand: "키크론",
            mallName: "몰B",
            price: 99000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "앱코 K660 카일 광축 키보드",
            brand: "앱코",
            mallName: "몰C",
            price: 49000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "Keychron 키보드 가격 비교해 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("정확한 모델");
    expect(result.warning).toContain("추천 검색어");
    expect(result.suggestedQueries).toEqual([
      "KEYCHRON B1 PRO 가격 비교해 줘",
      "KEYCHRON K5 SE 가격 비교해 줘"
    ]);
  });

  test("explainPurchaseOptions suggests exact keyboard follow-ups for broad Keychron queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "Keychron 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "키크론 B1 PRO 레트로 그린 팬터그래프 키보드",
            brand: "키크론",
            mallName: "몰A",
            price: 59000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "키크론 K5 SE 블루투스 무선 슬림 기계식 키보드",
            brand: "키크론",
            mallName: "몰B",
            price: 99000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "Keychron 키보드 지금 사도 괜찮아?"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("정확한 모델");
    expect(result.warning).toContain("추천 검색어");
    expect(result.suggestedQueries).toEqual([
      "KEYCHRON B1 PRO 지금 사도 괜찮은 가격대야?",
      "KEYCHRON K5 SE 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("compareProductPrices excludes mouse noise and suggests exact Logitech keyboard models", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "로지텍 기계식 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "로지텍 MX Mechanical Mini 무선 키보드",
            brand: "로지텍",
            mallName: "몰A",
            price: 169000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "Logitech MX Mechanical tactile 무선 키보드",
            brand: "Logitech",
            mallName: "몰B",
            price: 179000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "로지텍 MX Master 3S 무선 마우스",
            brand: "로지텍",
            mallName: "몰C",
            price: 129000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "로지텍 기계식 키보드 가격 비교해 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "LOGITECH MX MECHANICAL MINI 가격 비교해 줘",
      "LOGITECH MX MECHANICAL 가격 비교해 줘"
    ]);
    expect(result.suggestedQueries?.some((query) => query.includes("마우스"))).toBe(false);
  });

  test("compareProductPrices suggests notebook model codes for broad Galaxy Book prompts written in natural language", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "갤럭시북4 프로 16",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "삼성전자 갤럭시북4 프로 NT960XGQ-A51A 16GB 512GB",
            brand: "삼성전자",
            mallName: "몰A",
            price: 1899000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "삼성전자 갤럭시북4 프로 NT960XGQ-A71A 32GB 1TB",
            brand: "삼성전자",
            mallName: "몰B",
            price: 2399000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "갤북4 프로 16이라고만 보면 여러 모델일 것 같은데 일단 가격 비교가 되는 수준인지 봐줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "NT960XGQ-A51A 가격 비교해 줘",
      "NT960XGQ-A71A 가격 비교해 줘"
    ]);
  });

  test("explainPurchaseOptions suggests notebook model codes for broad Gram prompts written in natural language", async () => {
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
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "그램 16 쪽을 보는 중인데, 모델이 여러 개면 멈춰도 되니까 지금 사도 되는 가격대인지 같이 봐줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "16ZD90Q-GX36K 지금 사도 괜찮은 가격대야?",
      "16ZD90RU-GX54K 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("compareProductPrices suggests exact Logitech keyboard models for broad natural-language prompts", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "로지텍 기계식 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "로지텍 MX Mechanical Mini 무선 키보드",
            brand: "로지텍",
            mallName: "몰A",
            price: 169000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "Logitech MX Mechanical tactile 무선 키보드",
            brand: "Logitech",
            mallName: "몰B",
            price: 179000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "로지텍 MX Master 3S 무선 마우스",
            brand: "로지텍",
            mallName: "몰C",
            price: 129000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "로지텍 기계식 키보드 정도로만 말하면 여러 개일 텐데 그래도 비교 요청 넣어볼게"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "LOGITECH MX MECHANICAL MINI 가격 비교해 줘",
      "LOGITECH MX MECHANICAL 가격 비교해 줘"
    ]);
  });

  test("explainPurchaseOptions suggests office-oriented keyboard models for broad natural-language prompts", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "저소음 사무용 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "로지텍 MX Mechanical Mini 무선 키보드",
            brand: "로지텍",
            mallName: "몰A",
            price: 169000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "Logitech MX Mechanical tactile 무선 키보드",
            brand: "Logitech",
            mallName: "몰B",
            price: 179000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "DrunkDeer A75 PRO 게이밍 키보드 래피드트리거",
            brand: "DrunkDeer",
            mallName: "몰C",
            price: 129000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "저소음 사무용 키보드도 모델이 많으니 정확히 못 고르면 멈추고 다음 질문을 추천해줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "LOGITECH MX MECHANICAL MINI 지금 사도 괜찮은 가격대야?",
      "LOGITECH MX MECHANICAL 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("compareProductPrices suggests office-oriented keyboard models for broad natural-language prompts", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "저소음 사무용 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "로지텍 MX Mechanical Mini 무선 키보드",
            brand: "로지텍",
            mallName: "몰A",
            price: 169000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "Logitech MX Mechanical tactile 무선 키보드",
            brand: "Logitech",
            mallName: "몰B",
            price: 179000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "DrunkDeer A75 PRO 게이밍 키보드 래피드트리거",
            brand: "DrunkDeer",
            mallName: "몰C",
            price: 129000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "저소음 사무용 키보드도 모델이 많으니 정확히 못 고르면 멈추고 다음 질문을 추천해줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "LOGITECH MX MECHANICAL MINI 가격 비교해 줘",
      "LOGITECH MX MECHANICAL 가격 비교해 줘"
    ]);
  });

  test("compareProductPrices suggests office keyboard model codes from broad office queries when search results are generic", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "저소음 사무용 키보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "로지텍 K120 NEW Keyboard 블랙, 멤브레인",
            brand: "로지텍",
            mallName: "몰A",
            price: 11400,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "앱코 MK108 저소음 멤브레인 키보드 오트밀, 멤브레인",
            brand: "앱코",
            mallName: "몰B",
            price: 22900,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "저소음 사무용 키보드도 모델이 많으니 정확히 못 고르면 멈추고 다음 질문을 추천해줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "LOGITECH K120 NEW 가격 비교해 줘",
      "ABKO MK108 가격 비교해 줘"
    ]);
  });

  test("compareProductPrices suggests exact monitor models for size and resolution broad queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "27인치 4K 모니터",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "MSI MD271UL 68~69cm(27인치) 4K UHD 모니터",
            brand: "MSI",
            mallName: "몰A",
            price: 359000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG전자 27US550 68~69cm(27인치) UHD 모니터",
            brand: "LG",
            mallName: "몰B",
            price: 329000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "MSI MPG 321URX QD-OLED 32인치 게이밍 모니터",
            brand: "MSI",
            mallName: "몰C",
            price: 1499000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "27인치 4K 모니터 가격 비교해 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "LG 27US550 가격 비교해 줘",
      "MSI MD271UL 가격 비교해 줘"
    ]);
    expect(result.suggestedQueries?.some((query) => query.includes("321URX"))).toBe(false);
  });

  test("explainPurchaseOptions suggests exact monitor models for broad gaming-monitor prompts written in natural language", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "게이밍 모니터",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "MSI MPG 321URX QD-OLED 32인치 게이밍 모니터",
            brand: "MSI",
            mallName: "몰A",
            price: 1499000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "삼성전자 오디세이 G5 S27DG500 27인치 게이밍 모니터",
            brand: "삼성전자",
            mallName: "몰B",
            price: 339000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "게이밍 모니터라고만 하면 모델이 많으니 안 되면 멈추고 다시 물을 만한 걸 추천해줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "SAMSUNG S27DG500 지금 사도 괜찮은 가격대야?",
      "MSI 321URX 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("explainPurchaseOptions suggests exact monitor models for broad natural-language size and resolution prompts", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "27인치 4K 모니터",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "MSI MD271UL 68~69cm(27인치) 4K UHD 모니터",
            brand: "MSI",
            mallName: "몰A",
            price: 359000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG전자 27US550 68~69cm(27인치) UHD 모니터",
            brand: "LG",
            mallName: "몰B",
            price: 329000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "MSI MPG 321URX QD-OLED 32인치 게이밍 모니터",
            brand: "MSI",
            mallName: "몰C",
            price: 1499000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "27인치 4K 모니터 지금 사도 될 가격인지 보고 싶은데, 애매하면 재질문도 같이 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "LG 27US550 지금 사도 괜찮은 가격대야?",
      "MSI MD271UL 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("compareProductPrices keeps RX 9070 exact prompts on the non-XT model", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RX 9070",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "PowerColor Radeon RX 9070 Hellhound 16GB",
            brand: "PowerColor",
            mallName: "몰A",
            price: 799000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "PowerColor Radeon RX 9070 XT Hellhound 16GB",
            brand: "PowerColor",
            mallName: "몰B",
            price: 899000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "RX 9070 이건 XT 말고 일반형끼리만 비교해줘"
    });

    expect(result.status).toBe("ok");
    expect(result.query).toBe("RX 9070");
    expect(result.summary).toContain("RX 9070");
    expect(result.summary).not.toContain("RX 9070 XT");
    expect(result.offers.some((offer) => offer.title.includes("XT"))).toBe(false);
  });

  test("compareProductPrices suggests exact pc-part models for motherboard and memory spec queries", async () => {
    const boardService = new PriceService({
      provider: createProvider({
        query: "B650 메인보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "바이오스타 B650 MT-E PRO 제이씨현",
            brand: "바이오스타",
            mallName: "몰A",
            price: 139000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "ASRock B650 M PRO RS 대원씨티에스",
            brand: "ASRock",
            mallName: "몰B",
            price: 189000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "ASUS TUF B650M-PLUS WIFI 메인보드",
            brand: "ASUS",
            mallName: "몰C",
            price: 219000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const memoryService = new PriceService({
      provider: createProvider({
        query: "DDR5 32GB 메모리",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "200",
            title: "삼성전자 삼성 DDR5 PC5-44800 32GB , 1개",
            brand: "삼성전자",
            mallName: "몰D",
            price: 114000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "201",
            title: "에센코어 클레브 DDR5 PC5-44800 KLEVV CL46 32GB , 1개",
            brand: "클레브",
            mallName: "몰E",
            price: 109000,
            link: "https://example.com/e",
            image: "https://example.com/e.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "202",
            title: "삼성전자 삼성 DDR5 PC5-44800 16GB , 1개",
            brand: "삼성전자",
            mallName: "몰F",
            price: 59000,
            link: "https://example.com/f",
            image: "https://example.com/f.jpg"
          }
        ]
      })
    });

    const board = await boardService.compareProductPrices({
      query: "B650 메인보드 가격 비교해 줘"
    });
    const memory = await memoryService.compareProductPrices({
      query: "DDR5 32GB 메모리 가격 비교해 줘"
    });

    expect(board.status).toBe("ambiguous");
    expect(board.suggestedQueries).toEqual([
      "BIOSTAR B650MT-E PRO 가격 비교해 줘",
      "ASROCK B650M PRO RS 가격 비교해 줘",
      "ASUS TUF B650M-PLUS 가격 비교해 줘"
    ]);

    expect(memory.status).toBe("ambiguous");
    expect(memory.suggestedQueries).toEqual([
      "KLEVV DDR5 PC5-44800 32GB 가격 비교해 줘",
      "SAMSUNG DDR5 PC5-44800 32GB 가격 비교해 줘"
    ]);
  });

  test("compareProductPrices suggests exact motherboard models for broad natural-language prompts", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "B650 메인보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "바이오스타 B650 MT-E PRO 제이씨현",
            brand: "바이오스타",
            mallName: "몰A",
            price: 139000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "ASRock B650 M PRO RS 대원씨티에스",
            brand: "ASRock",
            mallName: "몰B",
            price: 189000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "ASUS TUF B650M-PLUS WIFI 메인보드",
            brand: "ASUS",
            mallName: "몰C",
            price: 219000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "B650 메인보드 전체 가격 비교는 너무 넓을 것 같은데 일단 가능 여부만 봐줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "BIOSTAR B650MT-E PRO 가격 비교해 줘",
      "ASROCK B650M PRO RS 가격 비교해 줘",
      "ASUS TUF B650M-PLUS 가격 비교해 줘"
    ]);
  });

  test("explainPurchaseOptions suggests exact motherboard models for broad natural-language prompts", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "B650 메인보드",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "바이오스타 B650 MT-E PRO 제이씨현",
            brand: "바이오스타",
            mallName: "몰A",
            price: 139000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "ASRock B650 M PRO RS 대원씨티에스",
            brand: "ASRock",
            mallName: "몰B",
            price: 189000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "ASUS TUF B650M-PLUS WIFI 메인보드",
            brand: "ASUS",
            mallName: "몰C",
            price: 219000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "B650 메인보드 지금 사도 될 가격인지 애매하면 다음 검색어도 같이 줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "BIOSTAR B650MT-E PRO 지금 사도 괜찮은 가격대야?",
      "ASROCK B650M PRO RS 지금 사도 괜찮은 가격대야?",
      "ASUS TUF B650M-PLUS 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("explainPurchaseOptions suggests exact pc-part models for broad power queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "850W 파워",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "기가바이트 UD850GM PG5 80PLUS GOLD 풀모듈러 ATX 3.0",
            brand: "기가바이트",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "쿨러마스터 MWE GOLD 850 V3 ATX3.1 850W 화이트",
            brand: "쿨러마스터",
            mallName: "몰B",
            price: 139000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "SuperFlower SF-850F14XG LEADEX VII GOLD ATX3.1",
            brand: "SuperFlower",
            mallName: "몰C",
            price: 179000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "850W 파워 지금 사도 괜찮은 가격대야?"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("정확한 모델");
    expect(result.warning).toContain("추천 검색어");
    expect(result.suggestedQueries).toEqual([
      "GIGABYTE UD850GM PG5 지금 사도 괜찮은 가격대야?",
      "COOLERMASTER MWE GOLD 850 V3 지금 사도 괜찮은 가격대야?",
      "SUPERFLOWER SF-850F14XG 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("compareProductPrices keeps complete-PC noise out of broad power comparisons", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "850W 파워",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "기가바이트 UD850GM PG5 80PLUS GOLD 풀모듈러 ATX 3.0",
            brand: "기가바이트",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "조립PC 850W 파워 포함 완본체 RTX 5070",
            brand: "Custom",
            mallName: "몰B",
            price: 2199000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "SuperFlower SF-850F14XG LEADEX VII GOLD ATX3.1",
            brand: "SuperFlower",
            mallName: "몰C",
            price: 179000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "850W 파워를 한 번에 비교하면 모델이 많을 것 같은데 가능 여부부터 봐줘"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.offers.some((offer) => offer.title.includes("조립PC"))).toBe(false);
    expect(result.offers.some((offer) => offer.title.includes("완본체"))).toBe(false);
    expect(result.suggestedQueries).toEqual([
      "GIGABYTE UD850GM PG5 가격 비교해 줘",
      "SUPERFLOWER SF-850F14XG 가격 비교해 줘"
    ]);
  });

  test("explainPurchaseOptions keeps broad GPU family queries ambiguous and suggests exact models", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RX 9070 계열",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "기가바이트 라데온 RX 9070 GAMING OC D6 16GB 피씨디렉트",
            brand: "GIGABYTE",
            mallName: "몰A",
            price: 908670,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "파워컬러 헬하운드 AMD 라데온 RX 9070 XT 16GB GDDR6",
            brand: "PowerColor",
            mallName: "몰B",
            price: 997000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "RX 9070 계열 지금 사도 괜찮아?"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("정확히 같은 모델");
    expect(result.warning).toContain("시리즈/계열");
    expect(result.suggestedQueries).toEqual(["RX 9070 지금 사도 괜찮은 가격대야?", "RX 9070 XT 지금 사도 괜찮은 가격대야?"]);
  });

  test("explainPurchaseOptions falls back to GPU family suggestions when broad RX series results clean down to empty", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "RX 9070 시리즈",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "1 GE 90-70/90-30/ RX 3i 시리즈 프로그래밍 다운로드 라 IC690USB901과 호환",
            brand: null,
            mallName: "몰A",
            price: 50660,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "RX 9070 계열 지금 사도 괜찮아?"
    });

    expect(result.status).toBe("ambiguous");
    expect(result.offers).toHaveLength(0);
    expect(result.suggestedQueries).toEqual(["RX 9070 지금 사도 괜찮은 가격대야?", "RX 9070 XT 지금 사도 괜찮은 가격대야?"]);
  });

  test("compareProductPrices supports exact keyboard model queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "Keychron K2 Pro",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "Keychron K2 Pro 무선 기계식 키보드 갈축",
            brand: "Keychron",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "KEYCHRON K2 PRO RGB 알루미늄 핫스왑",
            brand: "Keychron",
            mallName: "몰B",
            price: 139000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "Keychron K2 Pro 전용 키캡",
            brand: "Keychron",
            mallName: "몰C",
            price: 39000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({ query: "Keychron K2 Pro 가격 비교해 줘" });

    expect(result.status).toBe("ok");
    expect(result.comparison?.normalizedModel).toBe("KEYCHRON K2 PRO");
    expect(result.offers).toHaveLength(2);
    expect(result.offers.every((offer) => offer.normalizedModel === "KEYCHRON K2 PRO")).toBe(true);
  });

  test("compareProductPrices supports exact monitor model queries", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "LG 27GR93U",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG 울트라기어 27GR93U 27인치 4K 게이밍 모니터",
            brand: "LG",
            mallName: "몰A",
            price: 689000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG 27GR93U IPS UHD HDMI 2.1 모니터",
            brand: "LG",
            mallName: "몰B",
            price: 719000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({ query: "LG 27GR93U 가격 비교해 줘" });

    expect(result.status).toBe("ok");
    expect(result.comparison?.normalizedModel).toBe("LG 27GR93U");
    expect(result.offers).toHaveLength(2);
  });

  test("compareProductPrices supports exact pc-part model queries and keeps capacity variants distinct", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "WD SN850X 2TB",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "WD_BLACK SN850X 2TB NVMe SSD",
            brand: "WD",
            mallName: "몰A",
            price: 219000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "WD BLACK SN850X 2TB PCIe 4.0 SSD",
            brand: "WD",
            mallName: "몰B",
            price: 229000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "102",
            title: "WD_BLACK SN850X 1TB NVMe SSD",
            brand: "WD",
            mallName: "몰C",
            price: 149000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({ query: "WD SN850X 2TB 가격 비교해 줘" });

    expect(result.status).toBe("ok");
    expect(result.comparison?.normalizedModel).toBe("WD SN850X 2TB");
    expect(result.offers).toHaveLength(2);
    expect(result.offers.some((offer) => offer.title.includes("1TB"))).toBe(false);
  });

  test("compareProductPrices handles live-like exact monitor and motherboard results", async () => {
    const monitorService = new PriceService({
      provider: createProvider({
        query: "27GR93U",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG 울트라기어 27GR93U 27.0W9 598X337mm 정보 보안기 프라이버시 필터",
            brand: null,
            mallName: "노트킹",
            price: 61740,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG전자 울트라기어 27GR93U",
            brand: "울트라기어",
            mallName: "브랜드총판매점",
            price: 634990,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const boardService = new PriceService({
      provider: createProvider({
        query: "ASUS TUF B650M-PLUS",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "200",
            title: "ASUS TUF Gaming B650M-PLUS STCOM",
            brand: "ASUS",
            mallName: "네이버",
            price: 206930,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "201",
            title: "ASUS TUF Gaming B650M-PLUS STCOM AMD 소켓 메인보드",
            brand: "ASUS",
            mallName: "LKZONE",
            price: 219000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const monitorResult = await monitorService.compareProductPrices({
      query: "27GR93U는 정확히 같은 모델끼리 가격 비교해줘"
    });
    const boardResult = await boardService.compareProductPrices({
      query: "ASUS TUF B650M-PLUS 가격 비교해 줘"
    });

    expect(monitorResult.query).toBe("LG 27GR93U");
    expect(monitorResult.status).toBe("ok");
    expect(monitorResult.offers).toHaveLength(1);
    expect(monitorResult.offers[0]?.title).not.toContain("프라이버시 필터");

    expect(boardResult.query).toBe("ASUS TUF B650M-PLUS");
    expect(boardResult.status).toBe("ok");
    expect(boardResult.offers.every((offer) => offer.normalizedModel === "ASUS TUF B650M-PLUS")).toBe(true);
  });

  test("searchProducts keeps expanded exact-ish model families grouped by exact normalized models", async () => {
    const cases = [
      {
        query: "Keychron Q1 Max 검색해 줘",
        providerQuery: "Keychron Q1 Max",
        expectedModel: "KEYCHRON Q1 MAX",
        expectedGroupCount: 1,
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "Keychron Q1 Max 무선 커스텀 키보드 노브",
            brand: "Keychron",
            mallName: "몰A",
            price: 239000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "KEYCHRON Q1 MAX 알루미늄 무선 기계식 키보드",
            brand: "Keychron",
            mallName: "몰B",
            price: 249000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      },
      {
        query: "LG 32GS95UE 검색해 줘",
        providerQuery: "LG 32GS95UE",
        expectedModel: "LG 32GS95UE",
        expectedGroupCount: 1,
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "200",
            title: "LG 울트라기어 32GS95UE OLED 게이밍 모니터",
            brand: "LG",
            mallName: "몰A",
            price: 1899000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "201",
            title: "LG 32GS95UE 32형 OLED UHD 모니터",
            brand: "LG",
            mallName: "몰B",
            price: 1949000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      },
      {
        query: "Samsung 990 PRO 2TB 검색해 줘",
        providerQuery: "Samsung 990 PRO 2TB",
        expectedModel: "SAMSUNG 990 PRO 2TB",
        expectedGroupCount: 1,
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "300",
            title: "삼성전자 990 PRO 2TB NVMe SSD",
            brand: "삼성전자",
            mallName: "몰A",
            price: 269000,
            link: "https://example.com/e",
            image: "https://example.com/e.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "301",
            title: "Samsung 990 PRO Heatsink 2TB SSD",
            brand: "Samsung",
            mallName: "몰B",
            price: 289000,
            link: "https://example.com/f",
            image: "https://example.com/f.jpg"
          }
        ]
      },
      {
        query: "GIGABYTE UD850GM PG5 검색해 줘",
        providerQuery: "GIGABYTE UD850GM PG5",
        expectedModel: "GIGABYTE UD850GM PG5",
        expectedGroupCount: 1,
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "400",
            title: "기가바이트 UD850GM PG5 80PLUS GOLD 파워",
            brand: "기가바이트",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/g",
            image: "https://example.com/g.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "401",
            title: "GIGABYTE UD850GM PG5 ATX 3.0 풀모듈러",
            brand: "GIGABYTE",
            mallName: "몰B",
            price: 139000,
            link: "https://example.com/h",
            image: "https://example.com/h.jpg"
          }
        ]
      }
    ] as const;

    for (const testCase of cases) {
      const service = new PriceService({
        provider: createProvider({
          query: testCase.providerQuery,
          offers: [...testCase.offers]
        })
      });

      const result = await service.searchProducts({
        query: testCase.query,
        sort: "relevance",
        excludeUsed: true,
        limit: 10
      });

      expect(result.query).toBe(testCase.providerQuery);
      expect(result.groups).toHaveLength(testCase.expectedGroupCount);
      expect(result.groups[0]?.normalizedModel).toBe(testCase.expectedModel);
      expect(result.offers.every((offer) => offer.normalizedModel === testCase.expectedModel)).toBe(true);
    }
  });

  test("compareProductPrices supports expanded exact model families across keyboards monitors and pc-parts", async () => {
    const cases = [
      {
        query: "Keychron Q1 Max 가격 비교해 줘",
        providerQuery: "Keychron Q1 Max",
        expectedModel: "KEYCHRON Q1 MAX",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "Keychron Q1 Max 무선 커스텀 키보드 노브",
            brand: "Keychron",
            mallName: "몰A",
            price: 239000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "KEYCHRON Q1 MAX 알루미늄 무선 기계식 키보드",
            brand: "Keychron",
            mallName: "몰B",
            price: 249000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      },
      {
        query: "Logitech G Pro X TKL 가격 비교해 줘",
        providerQuery: "Logitech G Pro X TKL",
        expectedModel: "LOGITECH G PRO X TKL",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "200",
            title: "로지텍 G Pro X TKL Lightspeed 무선 게이밍 키보드",
            brand: "로지텍",
            mallName: "몰A",
            price: 229000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "201",
            title: "LOGITECH G PRO X TKL LIGHTSPEED 화이트",
            brand: "Logitech",
            mallName: "몰B",
            price: 239000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      },
      {
        query: "LG 32GS95UE 가격 비교해 줘",
        providerQuery: "LG 32GS95UE",
        expectedModel: "LG 32GS95UE",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "300",
            title: "LG 울트라기어 32GS95UE OLED 게이밍 모니터",
            brand: "LG",
            mallName: "몰A",
            price: 1899000,
            link: "https://example.com/e",
            image: "https://example.com/e.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "301",
            title: "LG 32GS95UE 32형 OLED UHD 모니터",
            brand: "LG",
            mallName: "몰B",
            price: 1949000,
            link: "https://example.com/f",
            image: "https://example.com/f.jpg"
          }
        ]
      },
      {
        query: "Dell AW2725DF 가격 비교해 줘",
        providerQuery: "Dell AW2725DF",
        expectedModel: "DELL AW2725DF",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "400",
            title: "Dell Alienware AW2725DF QD-OLED 게이밍 모니터",
            brand: "Dell",
            mallName: "몰A",
            price: 999000,
            link: "https://example.com/g",
            image: "https://example.com/g.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "401",
            title: "DELL ALIENWARE AW2725DF 360Hz QD-OLED",
            brand: "Dell",
            mallName: "몰B",
            price: 1049000,
            link: "https://example.com/h",
            image: "https://example.com/h.jpg"
          }
        ]
      },
      {
        query: "ASUS TUF B850M-PLUS 가격 비교해 줘",
        providerQuery: "ASUS TUF B850M-PLUS",
        expectedModel: "ASUS TUF B850M-PLUS",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "500",
            title: "ASUS TUF B850M-PLUS WIFI 메인보드",
            brand: "ASUS",
            mallName: "몰A",
            price: 269000,
            link: "https://example.com/i",
            image: "https://example.com/i.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "501",
            title: "아수스 TUF B850M-PLUS 보드",
            brand: "아수스",
            mallName: "몰B",
            price: 279000,
            link: "https://example.com/j",
            image: "https://example.com/j.jpg"
          }
        ]
      },
      {
        query: "Ryzen 9 9950X 가격 비교해 줘",
        providerQuery: "Ryzen 9 9950X",
        expectedModel: "RYZEN 9 9950X",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "600",
            title: "AMD Ryzen 9 9950X 정품 멀티팩",
            brand: "AMD",
            mallName: "몰A",
            price: 849000,
            link: "https://example.com/k",
            image: "https://example.com/k.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "601",
            title: "AMD 라이젠9 9950X 정품 박스",
            brand: "AMD",
            mallName: "몰B",
            price: 859000,
            link: "https://example.com/l",
            image: "https://example.com/l.jpg"
          }
        ]
      },
      {
        query: "Samsung 990 PRO 2TB 가격 비교해 줘",
        providerQuery: "Samsung 990 PRO 2TB",
        expectedModel: "SAMSUNG 990 PRO 2TB",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "700",
            title: "삼성전자 990 PRO 2TB NVMe SSD",
            brand: "삼성전자",
            mallName: "몰A",
            price: 269000,
            link: "https://example.com/m",
            image: "https://example.com/m.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "701",
            title: "Samsung 990 PRO Heatsink 2TB SSD",
            brand: "Samsung",
            mallName: "몰B",
            price: 289000,
            link: "https://example.com/n",
            image: "https://example.com/n.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "702",
            title: "Samsung 990 PRO 1TB SSD",
            brand: "Samsung",
            mallName: "몰C",
            price: 179000,
            link: "https://example.com/o",
            image: "https://example.com/o.jpg"
          }
        ]
      },
      {
        query: "GIGABYTE UD850GM PG5 가격 비교해 줘",
        providerQuery: "GIGABYTE UD850GM PG5",
        expectedModel: "GIGABYTE UD850GM PG5",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "800",
            title: "기가바이트 UD850GM PG5 80PLUS GOLD 파워",
            brand: "기가바이트",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/p",
            image: "https://example.com/p.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "801",
            title: "GIGABYTE UD850GM PG5 ATX 3.0 풀모듈러",
            brand: "GIGABYTE",
            mallName: "몰B",
            price: 139000,
            link: "https://example.com/q",
            image: "https://example.com/q.jpg"
          }
        ]
      }
    ] as const;

    for (const testCase of cases) {
      const service = new PriceService({
        provider: createProvider({
          query: testCase.providerQuery,
          offers: [...testCase.offers]
        })
      });

      const result = await service.compareProductPrices({ query: testCase.query });

      expect(result.status).toBe("ok");
      expect(result.comparison?.normalizedModel).toBe(testCase.expectedModel);
      expect(result.offers.every((offer) => offer.normalizedModel === testCase.expectedModel)).toBe(true);
    }
  });

  test("explainPurchaseOptions supports expanded exact model prompts across new families", async () => {
    const cases = [
      {
        query: "Keychron V1 Max 지금 사도 괜찮은 가격대야?",
        providerQuery: "Keychron V1 Max",
        expectedModel: "KEYCHRON V1 MAX",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "Keychron V1 Max 무선 커스텀 키보드",
            brand: "Keychron",
            mallName: "몰A",
            price: 159000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "KEYCHRON V1 MAX 핫스왑 기계식 키보드",
            brand: "Keychron",
            mallName: "몰B",
            price: 169000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      },
      {
        query: "MSI 274URFW 지금 사도 괜찮은 가격대야?",
        providerQuery: "MSI 274URFW",
        expectedModel: "MSI 274URFW",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "200",
            title: "MSI MAG 274URFW 27인치 4K 화이트 게이밍 모니터",
            brand: "MSI",
            mallName: "몰A",
            price: 479000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "201",
            title: "MSI 274URFW Rapid IPS UHD 모니터",
            brand: "MSI",
            mallName: "몰B",
            price: 489000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      },
      {
        query: "Core Ultra 7 265K 지금 사도 괜찮은 가격대야?",
        providerQuery: "Core Ultra 7 265K",
        expectedModel: "INTEL CORE ULTRA 7 265K",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "300",
            title: "인텔 코어 Ultra 7 265K 정품 박스",
            brand: "Intel",
            mallName: "몰A",
            price: 579000,
            link: "https://example.com/e",
            image: "https://example.com/e.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "301",
            title: "Intel Core Ultra 7 265K 벌크",
            brand: "Intel",
            mallName: "몰B",
            price: 569000,
            link: "https://example.com/f",
            image: "https://example.com/f.jpg"
          }
        ]
      },
      {
        query: "Crucial T500 1TB 지금 사도 괜찮은 가격대야?",
        providerQuery: "Crucial T500 1TB",
        expectedModel: "CRUCIAL T500 1TB",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "400",
            title: "Crucial T500 1TB PCIe Gen4 NVMe SSD",
            brand: "Crucial",
            mallName: "몰A",
            price: 129000,
            link: "https://example.com/g",
            image: "https://example.com/g.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "401",
            title: "마이크론 Crucial T500 1TB NVMe SSD",
            brand: "Crucial",
            mallName: "몰B",
            price: 135000,
            link: "https://example.com/h",
            image: "https://example.com/h.jpg"
          }
        ]
      }
    ] as const;

    for (const testCase of cases) {
      const service = new PriceService({
        provider: createProvider({
          query: testCase.providerQuery,
          offers: [...testCase.offers]
        })
      });

      const result = await service.explainPurchaseOptions({ query: testCase.query });

      expect(result.status).toBe("ok");
      expect(result.summary.toUpperCase()).toContain(testCase.expectedModel.split(" ").slice(-1)[0]!.toUpperCase());
      expect(result.offers.every((offer) => offer.normalizedModel === testCase.expectedModel)).toBe(true);
    }
  });

  test("explainPurchaseOptions supports exact keyboard monitor and pc-part queries", async () => {
    const keyboardService = new PriceService({
      provider: createProvider({
        query: "MX Mechanical Mini",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "로지텍 MX Mechanical Mini 무선 키보드",
            brand: "Logitech",
            mallName: "몰A",
            price: 169000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LOGITECH MX Mechanical Mini Linear",
            brand: "Logitech",
            mallName: "몰B",
            price: 179000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const monitorService = new PriceService({
      provider: createProvider({
        query: "Dell U2723QE",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "200",
            title: "Dell UltraSharp U2723QE 27형 4K 모니터",
            brand: "Dell",
            mallName: "몰A",
            price: 589000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "201",
            title: "DELL U2723QE USB-C 허브 모니터",
            brand: "Dell",
            mallName: "몰B",
            price: 619000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const partService = new PriceService({
      provider: createProvider({
        query: "Ryzen 7 9800X3D",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "300",
            title: "AMD Ryzen 7 9800X3D 정품 멀티팩",
            brand: "AMD",
            mallName: "몰A",
            price: 689000,
            link: "https://example.com/e",
            image: "https://example.com/e.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "301",
            title: "AMD 라이젠7 9800X3D 정품 박스",
            brand: "AMD",
            mallName: "몰B",
            price: 705000,
            link: "https://example.com/f",
            image: "https://example.com/f.jpg"
          }
        ]
      })
    });

    const keyboard = await keyboardService.explainPurchaseOptions({
      query: "로지텍 MX Mechanical Mini 지금 사도 괜찮은 가격대야?"
    });
    const monitor = await monitorService.explainPurchaseOptions({
      query: "Dell U2723QE 지금 사도 돼?"
    });
    const part = await partService.explainPurchaseOptions({
      query: "Ryzen 7 9800X3D 지금 사도 괜찮아?"
    });

    expect(keyboard.status).toBe("ok");
    expect(keyboard.summary).toContain("최저가");
    expect(keyboard.summary).toContain("MX Mechanical Mini");

    expect(monitor.status).toBe("ok");
    expect(monitor.summary).toContain("U2723QE");

    expect(part.status).toBe("ok");
    expect(part.summary).toContain("9800X3D");
  });

  test("compareProductPrices trims comparison phrasing before calling the provider", async () => {
    let receivedQuery = "";

    const service = new PriceService({
      provider: {
        source: "naver-shopping",
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
        source: "naver-shopping",
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

  test("searchProducts condenses long natural-language broad queries before calling the provider", async () => {
    let receivedQuery = "";

    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          receivedQuery = input.query;
          return {
            query: input.query,
            offers: []
          };
        }
      }
    });

    await service.searchProducts({
      query: "갤북4 프로 16 쪽으로 알아보는 중이라 파우치나 필름 같은 건 빼고 본체만 찾아줘",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(receivedQuery).toBe("갤럭시북4 프로 16");
  });

  test("searchProducts preserves exact-ish keyboard queries while stripping narrative tails", async () => {
    let receivedQuery = "";

    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          receivedQuery = input.query;
          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "Keychron K2 Pro 무선 기계식 키보드",
                brand: "Keychron",
                mallName: "몰A",
                price: 149000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.searchProducts({
      query: "키크론 K2 Pro 생각 중이라 정확히 그 모델로 뜨는 것들만 검색해줘",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(receivedQuery).toBe("Keychron K2 Pro");
    expect(result.summary).toContain("Keychron K2 Pro");
    expect(result.groups[0]?.normalizedModel).toBe("KEYCHRON K2 PRO");
  });

  test("searchProducts removes accessory exclusions from exact-ish keyboard queries", async () => {
    let receivedQuery = "";

    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          receivedQuery = input.query;
          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "앱코 K660 카일 광축 키보드",
                brand: "앱코",
                mallName: "몰A",
                price: 39000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "101",
                title: "앱코 K660 전용 PBT 키캡 세트",
                brand: "앱코",
                mallName: "몰B",
                price: 18000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.searchProducts({
      query: "앱코 K660 하나 보는데 키캡 같은 액세서리 말고 본체만 검색해줘",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(receivedQuery).toBe("ABKO K660");
    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.title).not.toContain("키캡");
  });

  test("searchProducts preserves office-keyboard intent and removes gaming exclusions from broad prompts", async () => {
    let receivedQuery = "";

    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          receivedQuery = input.query;
          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "저소음 사무용 무선 키보드",
                brand: "Logitech",
                mallName: "몰A",
                price: 59000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "101",
                title: "RGB 게이밍 기계식 키보드",
                brand: "ABKO",
                mallName: "몰B",
                price: 79000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.searchProducts({
      query: "저소음 사무용 키보드 찾는 중인데 RGB 번쩍이는 게이밍 느낌은 빼고 보여줘",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(receivedQuery).toBe("저소음 사무용 키보드");
    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.title).toContain("키보드");
    expect(result.offers[0]?.title).not.toContain("게이밍");
  });

  test("searchProducts preserves gaming monitor intent while excluding TVs and other devices", async () => {
    let receivedQuery = "";

    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          receivedQuery = input.query;
          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "32인치 240Hz 고주사율 게이밍 모니터",
                brand: "MSI",
                mallName: "몰A",
                price: 329000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "101",
                title: "55인치 스마트 TV 게이밍 모드 지원",
                brand: "Samsung",
                mallName: "몰B",
                price: 649000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.searchProducts({
      query: "고주사율 게이밍 모니터 보는 중인데 TV나 다른 기기 말고 모니터만 보여줘",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(receivedQuery).toBe("고주사율 게이밍 모니터");
    expect(result.offers).toHaveLength(1);
    expect(result.groups[0]?.title).toContain("32");
    expect(result.offers[0]?.title).toContain("모니터");
  });

  test("compareProductPrices condenses broad Galaxy Book prompts enough to recover follow-up suggestions", async () => {
    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          if (input.query !== "갤럭시북4 프로 16") {
            return {
              query: input.query,
              offers: []
            };
          }

          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "삼성전자 갤럭시북4 프로 NT960XGQ-A51A 16GB 512GB",
                brand: "삼성전자",
                mallName: "몰A",
                price: 1899000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "101",
                title: "삼성전자 갤럭시북4 프로 NT960XGQ-A71A 32GB 1TB",
                brand: "삼성전자",
                mallName: "몰B",
                price: 2399000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.compareProductPrices({
      query: "갤북4 프로 16이라고만 보면 여러 모델일 것 같은데 일단 가격 비교가 되는 수준인지 봐줘"
    });

    expect(result.query).toBe("갤럭시북4 프로 16");
    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "NT960XGQ-A51A 가격 비교해 줘",
      "NT960XGQ-A71A 가격 비교해 줘"
    ]);
  });

  test("compareProductPrices condenses broad keyboard prompts enough to recover follow-up suggestions", async () => {
    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          if (input.query !== "로지텍 기계식 키보드") {
            return {
              query: input.query,
              offers: []
            };
          }

          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "로지텍 MX Mechanical Mini 무선 키보드",
                brand: "로지텍",
                mallName: "몰A",
                price: 169000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "101",
                title: "Logitech MX Mechanical tactile 무선 키보드",
                brand: "Logitech",
                mallName: "몰B",
                price: 179000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "102",
                title: "로지텍 MX Master 3S 무선 마우스",
                brand: "로지텍",
                mallName: "몰C",
                price: 129000,
                link: "https://example.com/c",
                image: "https://example.com/c.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.compareProductPrices({
      query: "로지텍 기계식 키보드 정도로만 말하면 여러 개일 텐데 그래도 비교 요청 넣어볼게"
    });

    expect(result.query).toBe("로지텍 기계식 키보드");
    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "LOGITECH MX MECHANICAL MINI 가격 비교해 줘",
      "LOGITECH MX MECHANICAL 가격 비교해 줘"
    ]);
  });

  test("compareProductPrices condenses broad monitor prompts enough to recover follow-up suggestions", async () => {
    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          if (input.query !== "게이밍 모니터") {
            return {
              query: input.query,
              offers: []
            };
          }

          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "MSI MPG 321URX QD-OLED 32인치 게이밍 모니터",
                brand: "MSI",
                mallName: "몰A",
                price: 1499000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "101",
                title: "삼성전자 오디세이 G5 S27DG500 27인치 게이밍 모니터",
                brand: "삼성전자",
                mallName: "몰B",
                price: 339000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.compareProductPrices({
      query: "게이밍 모니터라고만 하면 모델이 많으니 안 되면 멈추고 다시 물을 만한 걸 추천해줘"
    });

    expect(result.query).toBe("게이밍 모니터");
    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "SAMSUNG S27DG500 가격 비교해 줘",
      "MSI 321URX 가격 비교해 줘"
    ]);
  });

  test("compareProductPrices condenses broad pc-part prompts enough to recover follow-up suggestions", async () => {
    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          if (input.query !== "DDR5 32GB 메모리") {
            return {
              query: input.query,
              offers: []
            };
          }

          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "200",
                title: "삼성전자 삼성 DDR5 PC5-44800 32GB , 1개",
                brand: "삼성전자",
                mallName: "몰D",
                price: 114000,
                link: "https://example.com/d",
                image: "https://example.com/d.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "201",
                title: "에센코어 클레브 DDR5 PC5-44800 KLEVV CL46 32GB , 1개",
                brand: "클레브",
                mallName: "몰E",
                price: 109000,
                link: "https://example.com/e",
                image: "https://example.com/e.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "202",
                title: "삼성전자 삼성 DDR5 PC5-44800 16GB , 1개",
                brand: "삼성전자",
                mallName: "몰F",
                price: 59000,
                link: "https://example.com/f",
                image: "https://example.com/f.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.compareProductPrices({
      query: "DDR5 32GB 메모리 통으로 가격 비교하려는데, 너무 넓으면 멈추고 다시 물을 걸 추천해줘"
    });

    expect(result.query).toBe("DDR5 32GB 메모리");
    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "KLEVV DDR5 PC5-44800 32GB 가격 비교해 줘",
      "SAMSUNG DDR5 PC5-44800 32GB 가격 비교해 줘"
    ]);
  });

  test("explainPurchaseOptions condenses broad Gram prompts enough to recover follow-up suggestions", async () => {
    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          if (input.query !== "그램 16") {
            return {
              query: input.query,
              offers: []
            };
          }

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

    const result = await service.explainPurchaseOptions({
      query: "그램 16 쪽을 보는 중인데, 모델이 여러 개면 멈춰도 되니까 지금 사도 되는 가격대인지 같이 봐줘"
    });

    expect(result.query).toBe("그램 16");
    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "16ZD90Q-GX36K 지금 사도 괜찮은 가격대야?",
      "16ZD90RU-GX54K 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("explainPurchaseOptions condenses broad motherboard prompts enough to recover follow-up suggestions", async () => {
    const service = new PriceService({
      provider: {
        source: "naver-shopping",
        async searchProducts(input) {
          if (input.query !== "B650 메인보드") {
            return {
              query: input.query,
              offers: []
            };
          }

          return {
            query: input.query,
            offers: [
              {
                source: "naver-shopping",
                sourceProductId: "100",
                title: "바이오스타 B650 MT-E PRO 제이씨현",
                brand: "바이오스타",
                mallName: "몰A",
                price: 139000,
                link: "https://example.com/a",
                image: "https://example.com/a.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "101",
                title: "ASRock B650 M PRO RS 대원씨티에스",
                brand: "ASRock",
                mallName: "몰B",
                price: 189000,
                link: "https://example.com/b",
                image: "https://example.com/b.jpg"
              },
              {
                source: "naver-shopping",
                sourceProductId: "102",
                title: "ASUS TUF B650M-PLUS WIFI 메인보드",
                brand: "ASUS",
                mallName: "몰C",
                price: 219000,
                link: "https://example.com/c",
                image: "https://example.com/c.jpg"
              }
            ]
          };
        }
      }
    });

    const result = await service.explainPurchaseOptions({
      query: "B650 메인보드 쪽을 지금 사도 되는 가격인지 보고 싶은데 막연하면 멈추고 재질문 추천해줘"
    });

    expect(result.query).toBe("B650 메인보드");
    expect(result.status).toBe("ambiguous");
    expect(result.suggestedQueries).toEqual([
      "BIOSTAR B650MT-E PRO 지금 사도 괜찮은 가격대야?",
      "ASROCK B650M PRO RS 지금 사도 괜찮은 가격대야?",
      "ASUS TUF B650M-PLUS 지금 사도 괜찮은 가격대야?"
    ]);
  });

  test("compareProductPrices keeps long broad notebook prompts ambiguous instead of collapsing to not_found", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "4060 노트북",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "HP 빅터스 15-fb2061AX 윈도우11 16GB 지포스 RTX 4060 게이밍 노트북",
            brand: "HP",
            mallName: "몰A",
            price: 1480000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "레노버 리전 5i 15IRX9 i7 4060 24GB, 1TB",
            brand: "Lenovo",
            mallName: "몰B",
            price: 1644000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "4060 들어간 노트북 전부를 한 번에 비교하는 건 무리일 것 같긴 한데, 그래도 어떻게 나오는지 봐줘"
    });

    expect(result.query).toBe("4060 노트북");
    expect(result.status).toBe("ambiguous");
    expect(result.summary).toContain("정확");
    expect(result.suggestedQueries?.length).toBeGreaterThan(0);
  });

  test("compareProductPrices supports exact keyboard models embedded in long natural-language prompts", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "Keychron K2 Pro",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "Keychron K2 Pro 무선 기계식 키보드",
            brand: "Keychron",
            mallName: "몰A",
            price: 149000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "Keychron K2 Pro RGB 기계식 키보드",
            brand: "Keychron",
            mallName: "몰B",
            price: 159000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.compareProductPrices({
      query: "Keychron K2 Pro 이건 정확히 같은 모델끼리 가격 비교해줘"
    });

    expect(result.query).toBe("KEYCHRON K2 PRO");
    expect(result.status).toBe("ok");
    expect(result.summary).toContain("Keychron K2 Pro");
  });

  test("compareProductPrices rescues exact notebook and GPU models from longer natural-language prompts", async () => {
    const notebookService = new PriceService({
      provider: createProvider({
        query: "16Z90T-GA5CK",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "100",
            title: "LG전자 그램 16Z90T-GA5CK 16GB, 256GB",
            brand: "LG",
            mallName: "몰A",
            price: 1999000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "101",
            title: "LG전자 그램 16Z90T-GA5CK 16GB, 512GB",
            brand: "LG",
            mallName: "몰B",
            price: 2199000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const gpuService = new PriceService({
      provider: createProvider({
        query: "RTX 5070",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "200",
            title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
            brand: "ZOTAC",
            mallName: "몰A",
            price: 931000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "201",
            title: "MSI GeForce RTX 5070 Gaming Trio",
            brand: "MSI",
            mallName: "몰B",
            price: 999000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const notebookResult = await notebookService.compareProductPrices({
      query: "그램 16 중에서도 16Z90T GA5CK 이거 가격 비교만 딱 해줘"
    });
    const gpuResult = await gpuService.compareProductPrices({
      query: "RTX 5070은 정확히 그 모델끼리만 가격 비교해줘"
    });

    expect(notebookResult.query).toBe("16Z90T-GA5CK");
    expect(notebookResult.status).toBe("ok");
    expect(notebookResult.summary).toContain("16Z90T-GA5CK");

    expect(gpuResult.query).toBe("RTX 5070");
    expect(gpuResult.status).toBe("ok");
    expect(gpuResult.summary).toContain("RTX 5070");
  });

  test("compareProductPrices rescues bare exact monitor keyboard and pc-part prompts", async () => {
    const keyboardService = new PriceService({
      provider: createProvider({
        query: "LOGITECH MX MECHANICAL MINI",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "300",
            title: "로지텍 MX Mechanical Mini 갈축",
            brand: "Logitech",
            mallName: "몰A",
            price: 116500,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "301",
            title: "로지텍 MX Mechanical Mini 적축",
            brand: "Logitech",
            mallName: "몰B",
            price: 129000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const monitorService = new PriceService({
      provider: createProvider({
        query: "DELL U2723QE",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "400",
            title: "DELL U2723QE 27인치 4K UHD IPS",
            brand: "Dell",
            mallName: "몰A",
            price: 429000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "401",
            title: "DELL U2723QE USB-C 허브 모니터",
            brand: "Dell",
            mallName: "몰B",
            price: 519000,
            link: "https://example.com/d",
            image: "https://example.com/d.jpg"
          }
        ]
      })
    });

    const pcPartService = new PriceService({
      provider: createProvider({
        query: "RYZEN 7 9800X3D",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "500",
            title: "AMD Ryzen 7 9800X3D 정품 멀티팩",
            brand: "AMD",
            mallName: "몰A",
            price: 817430,
            link: "https://example.com/e",
            image: "https://example.com/e.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "501",
            title: "AMD Ryzen 7 9800X3D 벌크",
            brand: "AMD",
            mallName: "몰B",
            price: 845000,
            link: "https://example.com/f",
            image: "https://example.com/f.jpg"
          }
        ]
      })
    });

    const keyboardResult = await keyboardService.compareProductPrices({
      query: "MX Mechanical Mini는 마우스 같은 거 섞지 말고 키보드 본체끼리만 비교해줘"
    });
    const monitorResult = await monitorService.compareProductPrices({
      query: "U2723QE 판매처별 차이 좀 비교해줘"
    });
    const pcPartResult = await pcPartService.compareProductPrices({
      query: "9800X3D 가격 차이만 정확히 보고 싶어"
    });

    expect(keyboardResult.query).toBe("LOGITECH MX MECHANICAL MINI");
    expect(keyboardResult.status).toBe("ok");
    expect(keyboardResult.summary).toContain("MX Mechanical Mini");

    expect(monitorResult.query).toBe("DELL U2723QE");
    expect(monitorResult.status).toBe("ok");
    expect(monitorResult.summary).toContain("U2723QE");

    expect(pcPartResult.query).toBe("RYZEN 7 9800X3D");
    expect(pcPartResult.status).toBe("ok");
    expect(pcPartResult.summary).toContain("9800X3D");
  });

  test("explainPurchaseOptions supports exact notebook models embedded in long natural-language prompts", async () => {
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
            title: "삼성전자 갤럭시북4 프로 NT960XGQ-A51A 16GB, 2TB",
            brand: "Samsung",
            mallName: "몰B",
            price: 2510000,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          }
        ]
      })
    });

    const result = await service.explainPurchaseOptions({
      query: "NT960XGQ-A51A 이건 지금 사도 괜찮은 가격대인지 한번 설명해줘"
    });

    expect(result.query).toBe("NT960XGQ-A51A");
    expect(result.status).toBe("ok");
    expect(result.summary).toContain("NT960XGQ");
  });

  test("explainPurchaseOptions rescues exact monitor and pc-part prompts embedded in natural language", async () => {
    const service = new PriceService({
      provider: createProvider({
        query: "DELL U2723QE",
        offers: [
          {
            source: "naver-shopping",
            sourceProductId: "600",
            title: "DELL U2723QE 27인치 4K UHD IPS",
            brand: "Dell",
            mallName: "몰A",
            price: 429000,
            link: "https://example.com/a",
            image: "https://example.com/a.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "601",
            title: "AMD Ryzen 7 9800X3D 정품 멀티팩",
            brand: "AMD",
            mallName: "몰B",
            price: 817430,
            link: "https://example.com/b",
            image: "https://example.com/b.jpg"
          },
          {
            source: "naver-shopping",
            sourceProductId: "602",
            title: "AMD Ryzen 7 9800X3D 벌크",
            brand: "AMD",
            mallName: "몰C",
            price: 845000,
            link: "https://example.com/c",
            image: "https://example.com/c.jpg"
          }
        ]
      })
    });

    const monitorResult = await service.explainPurchaseOptions({
      query: "U2723QE 이 모델은 지금 들어가도 될 가격인지 좀 봐줘"
    });
    const cpuResult = await service.explainPurchaseOptions({
      query: "9800X3D 가격 차이만 정확히 보고 싶어"
    });

    expect(monitorResult.query).toBe("DELL U2723QE");
    expect(monitorResult.status).toBe("ok");
    expect(monitorResult.summary).toContain("U2723QE");

    expect(cpuResult.query).toBe("RYZEN 7 9800X3D");
    expect(cpuResult.status).toBe("ok");
    expect(cpuResult.summary).toContain("9800X3D");
  });
});
