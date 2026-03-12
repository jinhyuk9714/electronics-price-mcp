import { afterEach, describe, expect, test, vi } from "vitest";

import { NaverShoppingClient } from "../../src/providers/naverShoppingClient.js";

describe("NaverShoppingClient", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  test("maps Naver shopping results into provider offers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          lastBuildDate: "Thu, 12 Mar 2026 10:00:00 +0900",
          total: 1,
          start: 1,
          display: 1,
          items: [
            {
              productId: "12345",
              title: "<b>LG</b> 그램 16 16Z90T-GA5CK",
              link: "https://example.com/product",
              image: "https://example.com/product.jpg",
              lprice: "1499000",
              mallName: "몰A",
              brand: "LG전자"
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

    const client = new NaverShoppingClient({
      clientId: "client-id",
      clientSecret: "client-secret",
      fetchFn: fetchMock
    });

    const result = await client.searchProducts({
      query: "그램 16",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.offers[0]).toMatchObject({
      source: "naver-shopping",
      sourceProductId: "12345",
      title: "LG 그램 16 16Z90T-GA5CK",
      brand: "LG",
      mallName: "몰A",
      price: 1499000
    });
  });

  test("throws a helpful error when upstream rejects credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("unauthorized", {
        status: 401
      })
    );

    const client = new NaverShoppingClient({
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
    ).rejects.toThrow(/NAVER_CLIENT_ID|NAVER_CLIENT_SECRET/);
  });

  test("uses global fetch with the correct this binding in worker-like environments", async () => {
    const workerLikeFetch = vi.fn(function (this: typeof globalThis) {
      if (this !== globalThis) {
        throw new TypeError("Illegal invocation");
      }

      return Promise.resolve(
        new Response(
          JSON.stringify({
            items: [
              {
                productId: "12345",
                title: "LG 그램 16 16Z90T-GA5CK",
                link: "https://example.com/product",
                image: "https://example.com/product.jpg",
                lprice: "1499000",
                mallName: "몰A",
                brand: "LG전자"
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
    });

    globalThis.fetch = workerLikeFetch as typeof fetch;

    const client = new NaverShoppingClient({
      clientId: "client-id",
      clientSecret: "client-secret"
    });

    const result = await client.searchProducts({
      query: "그램 16",
      sort: "relevance",
      excludeUsed: true,
      limit: 10
    });

    expect(workerLikeFetch).toHaveBeenCalledOnce();
    expect(result.offers).toHaveLength(1);
  });
});
