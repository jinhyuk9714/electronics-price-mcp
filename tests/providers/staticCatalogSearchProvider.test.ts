import { describe, expect, test } from "vitest";

import { StaticCatalogSearchProvider } from "../../src/providers/staticCatalogSearchProvider.js";

describe("StaticCatalogSearchProvider", () => {
  test("maps catalog offers into provider offers for exact queries", async () => {
    const provider = new StaticCatalogSearchProvider({
      datasetName: "test-dataset",
      records: [
        {
          id: "gpu-5070",
          category: "graphics-card",
          normalizedModel: "RTX 5070",
          title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
          brand: "ZOTAC",
          keywords: ["RTX 5070", "5070", "게이밍 그래픽카드"],
          offers: [
            {
              sourceProductId: "static-5070-a",
              mallName: "전자랜드",
              price: 799000,
              link: "https://static.example.com/5070-a",
              image: "https://static.example.com/5070-a.jpg"
            },
            {
              sourceProductId: "static-5070-b",
              mallName: "컴퓨존",
              price: 819000,
              link: "https://static.example.com/5070-b",
              image: null
            }
          ]
        }
      ]
    });

    const result = await provider.searchProducts({
      query: "RTX 5070",
      category: "graphics-card",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.query).toBe("RTX 5070");
    expect(result.offers).toHaveLength(2);
    expect(result.offers[0]).toMatchObject({
      source: "static-catalog",
      sourceProductId: "static-5070-a",
      mallName: "전자랜드",
      price: 799000
    });
  });

  test("keeps broad matches conservative and category-aware", async () => {
    const provider = new StaticCatalogSearchProvider({
      datasetName: "test-dataset",
      records: [
        {
          id: "keyboard-office",
          category: "keyboard",
          normalizedModel: "LOGITECH MX MECHANICAL MINI",
          title: "Logitech MX Mechanical Mini",
          brand: "Logitech",
          keywords: ["로지텍", "기계식", "무선", "저소음 사무용 키보드"],
          offers: [
            {
              sourceProductId: "mx-mini-a",
              mallName: "네이버 스마트스토어",
              price: 149000,
              link: "https://static.example.com/mx-mini-a",
              image: null
            }
          ]
        },
        {
          id: "gpu-5070",
          category: "graphics-card",
          normalizedModel: "RTX 5070",
          title: "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
          brand: "ZOTAC",
          keywords: ["게이밍 그래픽카드", "RTX 5070"],
          offers: [
            {
              sourceProductId: "static-5070-a",
              mallName: "전자랜드",
              price: 799000,
              link: "https://static.example.com/5070-a",
              image: null
            }
          ]
        }
      ]
    });

    const result = await provider.searchProducts({
      query: "저소음 사무용 키보드",
      category: "keyboard",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.sourceProductId).toBe("mx-mini-a");
  });

  test("sorts price ascending when requested", async () => {
    const provider = new StaticCatalogSearchProvider({
      datasetName: "test-dataset",
      records: [
        {
          id: "monitor-27gr93u",
          category: "monitor",
          normalizedModel: "LG 27GR93U",
          title: "LG 울트라기어 27GR93U",
          brand: "LG전자",
          keywords: ["27인치", "4K", "게이밍 모니터"],
          offers: [
            {
              sourceProductId: "27gr93u-b",
              mallName: "몰B",
              price: 829000,
              link: "https://static.example.com/27gr93u-b",
              image: null
            },
            {
              sourceProductId: "27gr93u-a",
              mallName: "몰A",
              price: 799000,
              link: "https://static.example.com/27gr93u-a",
              image: null
            }
          ]
        }
      ]
    });

    const result = await provider.searchProducts({
      query: "27GR93U",
      category: "monitor",
      sort: "price_asc",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers.map((offer) => offer.price)).toEqual([799000, 829000]);
  });

  test("throws a clear error for invalid catalog records", () => {
    expect(
      () =>
        new StaticCatalogSearchProvider({
          datasetName: "broken-dataset",
          records: [
            {
              id: "broken",
              category: "monitor",
              normalizedModel: "LG 27GR93U",
              title: "LG 울트라기어 27GR93U",
              brand: "LG전자",
              keywords: ["27인치"],
              offers: [
                {
                  sourceProductId: "",
                  mallName: "몰A",
                  price: 0,
                  link: "not-a-real-link",
                  image: null
                }
              ]
            }
          ]
        })
    ).toThrow("정적 카탈로그 데이터셋");
  });

  test("supports canary-eval-v1 exact keyboard and monitor records", async () => {
    const provider = new StaticCatalogSearchProvider({
      datasetName: "canary-eval-v1"
    });

    const k660Result = await provider.searchProducts({
      query: "앱코 K660",
      category: "keyboard",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    const a75Result = await provider.searchProducts({
      query: "DrunkDeer A75",
      category: "keyboard",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    const s27dg500Result = await provider.searchProducts({
      query: "삼성 S27DG500",
      category: "monitor",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(k660Result.offers[0]?.title).toContain("앱코");
    expect(k660Result.offers[0]?.brand).toBe("ABKO");
    expect(k660Result.offers[0]?.title).toContain("K660");
    expect(a75Result.offers[0]?.title).toContain("DrunkDeer");
    expect(a75Result.offers[0]?.title).toContain("A75");
    expect(s27dg500Result.offers[0]?.brand).toBe("Samsung");
    expect(s27dg500Result.offers[0]?.title).toContain("S27DG500");
  });

  test("supports canary-eval-v1 broad pc-part prompts conservatively", async () => {
    const provider = new StaticCatalogSearchProvider({
      datasetName: "canary-eval-v1"
    });

    const result = await provider.searchProducts({
      query: "DDR5 32GB 메모리",
      category: "pc-part",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers.length).toBeGreaterThanOrEqual(2);
    expect(result.offers.every((offer) => offer.title.includes("DDR5"))).toBe(true);
    expect(result.offers.every((offer) => offer.title.includes("32GB"))).toBe(true);
  });
});
