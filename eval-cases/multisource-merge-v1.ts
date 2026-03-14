import type { MultisourceMergeEvalCase, MultisourceMergeProviderSpec } from "../src/eval/multisourceMergeHarness.ts";
import type { ProviderOffer, SearchSource } from "../src/domain/types.ts";

function offer(
  source: SearchSource,
  sourceProductId: string,
  title: string,
  mallName: string,
  price: number,
  link: string,
  brand: string | null = null,
  image: string | null = null
): ProviderOffer {
  return {
    source,
    sourceProductId,
    title,
    brand,
    mallName,
    price,
    link,
    image
  };
}

function provider(source: SearchSource, offers: ProviderOffer[]): MultisourceMergeProviderSpec {
  return {
    source,
    mode: "success",
    offers
  };
}

export const MULTISOURCE_MERGE_CASES: MultisourceMergeEvalCase[] = [
  {
    id: "merge-same-mall-alias-dedupe",
    description: "same exact model + same mall alias dedupes to one kept offer",
    action: "search",
    query: "27GR93U",
    category: "monitor",
    providers: [
      provider("naver-shopping", [
        offer(
          "naver-shopping",
          "nv-27gr93u-11st",
          "LG 울트라기어 27GR93U",
          "11ST",
          789000,
          "https://naver.example.com/27gr93u-11st",
          "LG전자",
          "https://naver.example.com/27gr93u-11st.jpg"
        )
      ]),
      provider("static-catalog", [
        offer(
          "static-catalog",
          "st-27gr93u-11st",
          "LG 울트라기어 27GR93U",
          "11번가",
          789000,
          "https://static.example.com/27gr93u-11st",
          "LG전자"
        )
      ])
    ],
    expected: {
      offerCount: 1,
      groupCount: 1,
      keptSources: ["naver-shopping"],
      droppedSources: ["static-catalog"],
      providerStatuses: {
        "naver-shopping": "success",
        "static-catalog": "success"
      },
      providerOfferCounts: {
        "naver-shopping": 1,
        "static-catalog": 1
      },
      partialProviderFailure: false,
      canonicalMallDedupeHits: 1,
      crossSourceDuplicateDrops: 1,
      summaryMustContain: ["1개 모델", "1개 판매처"]
    }
  },
  {
    id: "merge-different-mall-keep-both",
    description: "same exact model + different mall keeps both offers",
    action: "search",
    query: "27GR93U",
    category: "monitor",
    providers: [
      provider("naver-shopping", [
        offer(
          "naver-shopping",
          "nv-27gr93u-11st",
          "LG 울트라기어 27GR93U",
          "11ST",
          789000,
          "https://naver.example.com/27gr93u-11st",
          "LG전자",
          "https://naver.example.com/27gr93u-11st.jpg"
        )
      ]),
      provider("static-catalog", [
        offer(
          "static-catalog",
          "st-27gr93u-gmarket",
          "LG 울트라기어 27GR93U",
          "G마켓",
          788000,
          "https://static.example.com/27gr93u-gmarket",
          "LG전자"
        )
      ])
    ],
    expected: {
      offerCount: 2,
      groupCount: 1,
      keptSources: ["naver-shopping", "static-catalog"],
      providerStatuses: {
        "naver-shopping": "success",
        "static-catalog": "success"
      },
      providerOfferCounts: {
        "naver-shopping": 1,
        "static-catalog": 1
      },
      partialProviderFailure: false,
      canonicalMallDedupeHits: 0,
      crossSourceDuplicateDrops: 0,
      summaryMustContain: ["1개 모델", "2개 판매처"]
    }
  },
  {
    id: "merge-same-mall-large-price-gap",
    description: "same mall alias but abnormal price gap keeps both offers",
    action: "search",
    query: "27GR93U",
    category: "monitor",
    providers: [
      provider("naver-shopping", [
        offer(
          "naver-shopping",
          "nv-27gr93u-11st",
          "LG 울트라기어 27GR93U",
          "11ST",
          789000,
          "https://naver.example.com/27gr93u-11st",
          "LG전자",
          "https://naver.example.com/27gr93u-11st.jpg"
        )
      ]),
      provider("danawa", [
        offer(
          "danawa",
          "dw-27gr93u-11st",
          "LG 울트라기어 27GR93U",
          "11번가",
          999000,
          "https://danawa.example.com/27gr93u-11st",
          "LG전자"
        )
      ])
    ],
    expected: {
      offerCount: 2,
      groupCount: 1,
      keptSources: ["naver-shopping", "danawa"],
      providerStatuses: {
        "naver-shopping": "success",
        danawa: "success"
      },
      providerOfferCounts: {
        "naver-shopping": 1,
        danawa: 1
      },
      partialProviderFailure: false,
      canonicalMallDedupeHits: 0,
      crossSourceDuplicateDrops: 0
    }
  },
  {
    id: "merge-source-priority-tiebreak",
    description: "same mall alias across all sources keeps naver first on tie",
    action: "search",
    query: "27GR93U",
    category: "monitor",
    providers: [
      provider("naver-shopping", [
        offer(
          "naver-shopping",
          "nv-27gr93u-smartstore",
          "LG 울트라기어 27GR93U",
          "smartstore",
          789000,
          "https://naver.example.com/27gr93u-smartstore",
          "LG전자",
          "https://naver.example.com/27gr93u-smartstore.jpg"
        )
      ]),
      provider("danawa", [
        offer(
          "danawa",
          "dw-27gr93u-smartstore",
          "LG 울트라기어 27GR93U",
          "네이버 스마트스토어",
          789000,
          "https://danawa.example.com/27gr93u-smartstore",
          "LG전자"
        )
      ]),
      provider("static-catalog", [
        offer(
          "static-catalog",
          "st-27gr93u-smartstore",
          "LG 울트라기어 27GR93U",
          "스마트스토어",
          789000,
          "https://static.example.com/27gr93u-smartstore",
          "LG전자"
        )
      ])
    ],
    expected: {
      offerCount: 1,
      groupCount: 1,
      keptSources: ["naver-shopping"],
      droppedSources: ["danawa", "static-catalog"],
      providerStatuses: {
        "naver-shopping": "success",
        danawa: "success",
        "static-catalog": "success"
      },
      providerOfferCounts: {
        "naver-shopping": 1,
        danawa: 1,
        "static-catalog": 1
      },
      partialProviderFailure: false,
      canonicalMallDedupeHits: 2,
      crossSourceDuplicateDrops: 2
    }
  },
  {
    id: "merge-partial-provider-failure",
    description: "one provider failure still returns exact compare result from another source",
    action: "compare",
    query: "RTX 5070 가격 비교해 줘",
    providers: [
      provider("naver-shopping", [
        offer(
          "naver-shopping",
          "nv-rtx5070-11st",
          "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
          "11번가",
          919000,
          "https://naver.example.com/rtx5070-11st",
          "ZOTAC",
          "https://naver.example.com/rtx5070-11st.jpg"
        ),
        offer(
          "naver-shopping",
          "nv-rtx5070-gmarket",
          "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
          "G마켓",
          929000,
          "https://naver.example.com/rtx5070-gmarket",
          "ZOTAC",
          "https://naver.example.com/rtx5070-gmarket.jpg"
        )
      ]),
      {
        source: "danawa",
        mode: "error"
      }
    ],
    expected: {
      actualStatus: "ok",
      offerCount: 2,
      keptSources: ["naver-shopping"],
      droppedSources: ["danawa"],
      providerStatuses: {
        "naver-shopping": "success",
        danawa: "error"
      },
      providerOfferCounts: {
        "naver-shopping": 2,
        danawa: 0
      },
      partialProviderFailure: true,
      canonicalMallDedupeHits: 0,
      crossSourceDuplicateDrops: 0,
      summaryMustContain: ["RTX 5070"]
    }
  },
  {
    id: "merge-broad-query-safety",
    description: "broad compare stays ambiguous even with multiple exact offers across sources",
    action: "compare",
    query: "B650 메인보드 가격 비교해 줘",
    providers: [
      provider("naver-shopping", [
        offer(
          "naver-shopping",
          "nv-b650m-plus",
          "ASUS TUF B650M-PLUS",
          "11번가",
          239000,
          "https://naver.example.com/b650m-plus",
          "ASUS",
          "https://naver.example.com/b650m-plus.jpg"
        ),
        offer(
          "naver-shopping",
          "nv-b650m-a",
          "MSI PRO B650M-A WIFI",
          "G마켓",
          219000,
          "https://naver.example.com/b650m-a",
          "MSI",
          "https://naver.example.com/b650m-a.jpg"
        )
      ]),
      provider("static-catalog", [
        offer(
          "static-catalog",
          "st-b650-eagle",
          "GIGABYTE B650 EAGLE AX",
          "옥션",
          229000,
          "https://static.example.com/b650-eagle",
          "GIGABYTE"
        )
      ])
    ],
    expected: {
      actualStatus: "ambiguous",
      offerCount: 3,
      keptSources: ["naver-shopping", "static-catalog"],
      providerStatuses: {
        "naver-shopping": "success",
        "static-catalog": "success"
      },
      providerOfferCounts: {
        "naver-shopping": 2,
        "static-catalog": 1
      },
      partialProviderFailure: false,
      canonicalMallDedupeHits: 0,
      crossSourceDuplicateDrops: 0,
      needsSuggestedQueries: true,
      summaryMustContain: ["정확한 모델"]
    }
  },
  {
    id: "merge-danawa-static-alias-dedupe",
    description: "danawa and static-catalog same mall alias dedupes with danawa priority",
    action: "search",
    query: "RTX 5070",
    category: "graphics-card",
    providers: [
      provider("danawa", [
        offer(
          "danawa",
          "dw-rtx5070-11st",
          "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
          "11번가",
          919000,
          "https://danawa.example.com/rtx5070-11st",
          "ZOTAC"
        )
      ]),
      provider("static-catalog", [
        offer(
          "static-catalog",
          "st-rtx5070-11st",
          "ZOTAC GAMING GeForce RTX 5070 Twin Edge",
          "11ST",
          919000,
          "https://static.example.com/rtx5070-11st",
          "ZOTAC"
        )
      ])
    ],
    expected: {
      offerCount: 1,
      groupCount: 1,
      keptSources: ["danawa"],
      droppedSources: ["static-catalog"],
      providerStatuses: {
        danawa: "success",
        "static-catalog": "success"
      },
      providerOfferCounts: {
        danawa: 1,
        "static-catalog": 1
      },
      partialProviderFailure: false,
      canonicalMallDedupeHits: 1,
      crossSourceDuplicateDrops: 1
    }
  }
];
