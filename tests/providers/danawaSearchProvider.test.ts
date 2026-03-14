import { afterEach, describe, expect, test, vi } from "vitest";

import { DanawaSearchProvider } from "../../src/providers/danawaSearchProvider.js";

describe("DanawaSearchProvider", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  test("maps Danawa JSON results into provider offers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          products: [
            {
              productCode: "DW-12345",
              productName: "LG 울트라기어 27GR93U",
              brand: "LG전자",
              mallName: "몰A",
              lowestPrice: "799000",
              productUrl: "https://example.com/product",
              imageUrl: "https://example.com/product.jpg"
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );

    const client = new DanawaSearchProvider({
      clientId: "danawa-id",
      clientSecret: "danawa-secret",
      fetchFn: fetchMock,
      apiBaseUrl: "https://api.example.com"
    });

    const result = await client.searchProducts({
      query: "27GR93U",
      category: "monitor",
      sort: "price_asc",
      excludeUsed: true,
      limit: 10
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.offers[0]).toMatchObject({
      source: "danawa",
      sourceProductId: "DW-12345",
      title: "LG 울트라기어 27GR93U",
      brand: "LG",
      mallName: "몰A",
      price: 799000
    });
  });

  test("maps Danawa XML results into provider offers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        [
          "<?xml version=\"1.0\" encoding=\"utf-8\"?>",
          "<products>",
          "  <product>",
          "    <productCode>DW-67890</productCode>",
          "    <productName>Dell U2723QE</productName>",
          "    <brand>Dell</brand>",
          "    <shopName>몰B</shopName>",
          "    <price>629000</price>",
          "    <productUrl>https://example.com/dell</productUrl>",
          "    <image>https://example.com/dell.jpg</image>",
          "  </product>",
          "</products>"
        ].join(""),
        {
          status: 200,
          headers: {
            "content-type": "application/xml"
          }
        }
      )
    );

    const client = new DanawaSearchProvider({
      clientId: "danawa-id",
      clientSecret: "danawa-secret",
      fetchFn: fetchMock,
      apiBaseUrl: "https://api.example.com"
    });

    const result = await client.searchProducts({
      query: "U2723QE",
      category: "monitor",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(result.offers[0]).toMatchObject({
      source: "danawa",
      sourceProductId: "DW-67890",
      title: "Dell U2723QE",
      brand: "Dell",
      mallName: "몰B",
      price: 629000
    });
  });

  test("throws a helpful error when upstream rejects credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("unauthorized", {
        status: 401
      })
    );

    const client = new DanawaSearchProvider({
      clientId: "bad-id",
      clientSecret: "bad-secret",
      fetchFn: fetchMock
    });

    await expect(
      client.searchProducts({
        query: "rtx 5070",
        sort: "relevance",
        excludeUsed: true,
        limit: 10
      })
    ).rejects.toThrow(/DANAWA_CLIENT_ID|DANAWA_CLIENT_SECRET/);
  });

  test("throws a helpful error when the upstream payload cannot be parsed", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{broken-json", {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );

    const client = new DanawaSearchProvider({
      clientId: "danawa-id",
      clientSecret: "danawa-secret",
      fetchFn: fetchMock
    });

    await expect(
      client.searchProducts({
        query: "그램 16",
        sort: "relevance",
        excludeUsed: true,
        limit: 10
      })
    ).rejects.toThrow("다나와 API 응답을 해석하지 못했습니다.");
  });
});
