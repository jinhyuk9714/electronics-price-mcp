import type {
  ExpectedToolStatus,
  ServiceQualityCategory,
  ServiceQualityEvalCase,
  ServiceQualityExecutor,
  ServiceQualityIntent
} from "../src/eval/serviceQualityHarness.ts";

type CaseDefinition = Omit<ServiceQualityEvalCase, "id" | "category" | "intent" | "executor">;

function buildCases(
  category: ServiceQualityCategory,
  intent: ServiceQualityIntent,
  executor: ServiceQualityExecutor,
  definitions: CaseDefinition[]
): ServiceQualityEvalCase[] {
  return definitions.map((definition, index) => ({
    id: `${category}-${intent}-${index + 1}`,
    category,
    intent,
    executor,
    ...definition
  }));
}

function caseDef(definition: CaseDefinition): CaseDefinition {
  return definition;
}

const laptopCases = [
  ...buildCases("laptop", "broad-search", "search-api", [
    caseDef({
      prompt: "게이밍 노트북 검색해 줘",
      mustContain: ["게이밍", "노트북"],
      mustNotContain: ["사무용", "인강용", "렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "게이밍 노트북 broad search에서 비게이밍/렌탈 노이즈가 크게 섞이지 않아야 한다.",
      notes: "게이밍 의도 노이즈 확인"
    }),
    caseDef({
      prompt: "4060 노트북 찾아줘",
      mustContain: ["노트북"],
      mustNotContain: ["RTX 4050", "RTX 4070", "렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "4060 노트북 검색에서 다른 GPU 변형과 렌탈 결과가 줄어들어야 한다.",
      notes: "노트북 broad GPU mismatch 확인"
    }),
    caseDef({
      prompt: "그램 16 검색해 줘",
      mustContain: ["그램"],
      mustNotContain: ["키스킨", "키커버", "렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "그램 16 검색에서는 노트북 본체 위주 결과가 남아야 한다.",
      notes: "그램 broad accessory noise 확인"
    }),
    caseDef({
      prompt: "갤럭시북4 프로 16 찾아줘",
      mustContain: ["갤럭시북"],
      mustNotContain: ["보호필름", "파우치", "렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "갤럭시북 broad search에서 액세서리 노이즈가 크게 줄어야 한다.",
      notes: "갤럭시북 accessory noise 확인"
    })
  ]),
  ...buildCases("laptop", "exact-ish-search", "search-api", [
    caseDef({
      prompt: "16Z90T GA5CK 검색해 줘",
      mustContain: ["16Z90T", "GA5CK"],
      mustNotContain: ["키스킨", "키커버"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 그램 모델 검색은 모델 코드가 살아 있는 결과를 보여줘야 한다.",
      notes: "그램 exact-ish search"
    }),
    caseDef({
      prompt: "NT960XGQ-A51A 찾아줘",
      mustContain: ["NT960XGQ", "A51A"],
      mustNotContain: ["보호필름", "파우치"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 갤럭시북 모델 검색은 모델 코드와 본체 위주 결과를 유지해야 한다.",
      notes: "갤럭시북 exact-ish search"
    }),
    caseDef({
      prompt: "15IRX9 노트북 검색해 줘",
      mustContain: ["15IRX9"],
      mustNotContain: ["RTX 4050", "RTX 4070"],
      needsSuggestedQueries: false,
      expectedBehavior: "Lenovo exact-ish search는 다른 GPU 변형이 크게 끼지 않아야 한다.",
      notes: "Lenovo exact-ish search"
    }),
    caseDef({
      prompt: "15-FB2061AX 검색해 줘",
      mustContain: ["15-FB2061AX"],
      mustNotContain: ["RTX 4050", "RTX 4070"],
      needsSuggestedQueries: false,
      expectedBehavior: "HP exact-ish search는 동일 모델 중심으로 정리되어야 한다.",
      notes: "HP exact-ish search"
    })
  ]),
  ...buildCases("laptop", "exact-compare", "compare-api", [
    caseDef({
      prompt: "16Z90T GA5CK 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["16Z90T", "GA5CK"],
      mustNotContain: ["키스킨", "키커버"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 그램 모델 비교는 ok 상태여야 한다.",
      notes: "그램 exact compare"
    }),
    caseDef({
      prompt: "NT960XGQ-A51A 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["NT960XGQ", "A51A"],
      mustNotContain: ["보호필름", "파우치"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 갤럭시북 모델 비교는 ok 상태여야 한다.",
      notes: "갤럭시북 exact compare"
    }),
    caseDef({
      prompt: "15IRX9 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["15IRX9"],
      mustNotContain: ["RTX 4050", "RTX 4070"],
      needsSuggestedQueries: false,
      expectedBehavior: "Lenovo exact compare는 모델 코드 기준으로 ok가 되어야 한다.",
      notes: "Lenovo exact compare"
    }),
    caseDef({
      prompt: "15-FB2061AX 최저가 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["15-FB2061AX"],
      mustNotContain: ["RTX 4050", "RTX 4070"],
      needsSuggestedQueries: false,
      expectedBehavior: "HP exact compare는 모델 코드 기준으로 ok가 되어야 한다.",
      notes: "HP exact compare"
    })
  ]),
  ...buildCases("laptop", "broad-ambiguous-safety", "compare-api", [
    caseDef({
      prompt: "그램 16 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: [],
      needsSuggestedQueries: true,
      expectedBehavior: "그램 16 broad compare는 안전하게 ambiguous로 멈추고 follow-up query를 제안해야 한다.",
      notes: "그램 broad compare safety"
    }),
    caseDef({
      prompt: "갤럭시북4 프로 16 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: [],
      needsSuggestedQueries: true,
      expectedBehavior: "갤럭시북 broad compare는 ambiguous로 멈추고 모델 코드 재질문을 유도해야 한다.",
      notes: "갤럭시북 broad compare safety"
    }),
    caseDef({
      prompt: "4060 노트북 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["RTX 4060 가격 비교해 줘"],
      needsSuggestedQueries: true,
      expectedBehavior: "4060 노트북 broad compare는 ambiguous로 멈추고 GPU-only 추천 없이 모델 코드 중심 제안을 해야 한다.",
      notes: "노트북 broad compare should avoid GPU-only suggestions"
    }),
    caseDef({
      prompt: "게이밍 노트북 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: [],
      needsSuggestedQueries: false,
      expectedBehavior: "게이밍 노트북 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.",
      notes: "게이밍 노트북 broad compare safety"
    })
  ]),
  ...buildCases("laptop", "purchase-explain", "explain-mcp", [
    caseDef({
      prompt: "그램 16 지금 사도 괜찮아?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: [],
      needsSuggestedQueries: true,
      expectedBehavior: "그램 16 explain은 ambiguous로 멈추고 다음 질문을 제안해야 한다.",
      notes: "그램 broad explain"
    }),
    caseDef({
      prompt: "4060 노트북 지금 사도 돼?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["RTX 4060 지금 사도 괜찮은 가격대야?"],
      needsSuggestedQueries: true,
      expectedBehavior: "4060 노트북 explain은 노트북 모델 코드 기준 추천을 줘야 한다.",
      notes: "노트북 broad explain should avoid GPU-only suggestions"
    }),
    caseDef({
      prompt: "NT960XGQ-A51A 지금 사도 괜찮은 가격대야?",
      expectedStatus: "ok",
      mustContain: ["NT960XGQ", "A51A"],
      mustNotContain: ["보호필름", "파우치"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 갤럭시북 explain은 ok 상태로 가격대 해석을 줘야 한다.",
      notes: "갤럭시북 exact explain"
    }),
    caseDef({
      prompt: "15IRX9 지금 사도 괜찮아?",
      expectedStatus: "ok",
      mustContain: ["15IRX9"],
      mustNotContain: ["RTX 4050", "RTX 4070"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 Lenovo explain은 ok 상태로 가격 해석을 줘야 한다.",
      notes: "Lenovo exact explain"
    })
  ])
];

const graphicsCardCases = [
  ...buildCases("graphics-card", "broad-search", "search-api", [
    caseDef({
      prompt: "RTX 5070 제품 찾아줘",
      mustContain: ["RTX", "5070"],
      mustNotContain: ["브라켓", "완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "5070 broad search는 부속품과 완본체 노이즈를 크게 줄여야 한다.",
      notes: "GPU broad search noise"
    }),
    caseDef({
      prompt: "RTX 5070 시리즈 검색해 줘",
      mustContain: ["RTX", "5070"],
      mustNotContain: ["브라켓", "완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "5070 시리즈 broad search는 GPU 계열 중심으로 정리되어야 한다.",
      notes: "GPU series search noise"
    }),
    caseDef({
      prompt: "RX 9070 그래픽카드 찾아줘",
      mustContain: ["RX", "9070"],
      mustNotContain: ["브라켓", "완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "라데온 broad search는 부속품과 완본체를 줄여야 한다.",
      notes: "Radeon broad search noise"
    }),
    caseDef({
      prompt: "5070 Ti 그래픽카드 검색해 줘",
      mustContain: ["5070", "TI"],
      mustNotContain: ["브라켓", "완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "5070 Ti broad search는 그래픽카드 본품 중심이어야 한다.",
      notes: "GPU broad Ti search"
    })
  ]),
  ...buildCases("graphics-card", "exact-ish-search", "search-api", [
    caseDef({
      prompt: "ZOTAC RTX 5070 Twin Edge 검색해 줘",
      mustContain: ["ZOTAC", "5070", "Twin Edge"],
      mustNotContain: ["브라켓", "지지대"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 GPU 모델 검색은 부속품 없이 모델명이 살아 있어야 한다.",
      notes: "ZOTAC exact-ish search"
    }),
    caseDef({
      prompt: "ASUS TUF RTX 5070 Ti 찾아줘",
      mustContain: ["ASUS", "5070", "TUF"],
      mustNotContain: ["브라켓", "지지대"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 ASUS GPU 검색은 모델 계열이 유지되어야 한다.",
      notes: "ASUS exact-ish search"
    }),
    caseDef({
      prompt: "Sapphire RX 9070 XT Pulse 검색해 줘",
      mustContain: ["Sapphire", "9070", "Pulse"],
      mustNotContain: ["브라켓", "지지대"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 Sapphire 검색은 XT 변형을 유지해야 한다.",
      notes: "Sapphire exact-ish search"
    }),
    caseDef({
      prompt: "PowerColor RX 9070 Hellhound 찾아줘",
      mustContain: ["PowerColor", "9070", "Hellhound"],
      mustNotContain: ["브라켓", "지지대"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 PowerColor 검색은 브랜드/모델명이 살아 있어야 한다.",
      notes: "PowerColor exact-ish search"
    })
  ]),
  ...buildCases("graphics-card", "exact-compare", "compare-api", [
    caseDef({
      prompt: "RTX 5070 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["RTX 5070"],
      mustNotContain: ["RTX 5060", "브라켓", "완본체"],
      needsSuggestedQueries: false,
      expectedBehavior: "RTX 5070 exact compare는 ok 상태여야 한다.",
      notes: "RTX 5070 exact compare"
    }),
    caseDef({
      prompt: "RTX 5070 Ti 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["RTX 5070 TI"],
      mustNotContain: ["RTX 5060", "브라켓", "완본체"],
      needsSuggestedQueries: false,
      expectedBehavior: "RTX 5070 Ti exact compare는 ok 상태여야 한다.",
      notes: "RTX 5070 Ti exact compare"
    }),
    caseDef({
      prompt: "RX 9070 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["RX 9070"],
      mustNotContain: ["RX 9070 XT", "브라켓", "완본체"],
      needsSuggestedQueries: false,
      expectedBehavior: "RX 9070 exact compare는 XT와 섞이지 않고 ok여야 한다.",
      notes: "RX 9070 exact compare"
    }),
    caseDef({
      prompt: "RX 9070 XT 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["RX 9070 XT"],
      mustNotContain: ["브라켓", "완본체"],
      needsSuggestedQueries: false,
      expectedBehavior: "RX 9070 XT exact compare는 ok 상태여야 한다.",
      notes: "RX 9070 XT exact compare"
    })
  ]),
  ...buildCases("graphics-card", "broad-ambiguous-safety", "compare-api", [
    caseDef({
      prompt: "RTX 5070 시리즈 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["브라켓", "완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "5070 시리즈 broad compare는 ambiguous로 멈추고 follow-up query를 제안해야 한다.",
      notes: "GPU broad compare safety"
    }),
    caseDef({
      prompt: "RX 9070 시리즈 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["브라켓", "완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "9070 시리즈 broad compare는 ambiguous로 멈춰야 한다.",
      notes: "Radeon broad compare safety"
    }),
    caseDef({
      prompt: "엔비디아 5070 그래픽카드 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["브라켓", "완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "브랜드+세대 broad compare는 동일상품 비교를 시도하지 않아야 한다.",
      notes: "NVIDIA broad compare safety"
    }),
    caseDef({
      prompt: "라데온 9070 계열 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["브라켓", "완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "라데온 계열 broad compare는 ambiguous로 멈추고 추천 질의를 줘야 한다.",
      notes: "Radeon family compare safety"
    })
  ]),
  ...buildCases("graphics-card", "purchase-explain", "explain-mcp", [
    caseDef({
      prompt: "RTX 5070 지금 사도 돼?",
      expectedStatus: "ok",
      mustContain: ["RTX 5070"],
      mustNotContain: ["완본체", "브라켓"],
      needsSuggestedQueries: false,
      expectedBehavior: "RTX 5070 explain은 ok 상태로 가격 해석을 줘야 한다.",
      notes: "RTX 5070 exact explain"
    }),
    caseDef({
      prompt: "RX 9070 XT 지금 사도 괜찮은 가격대야?",
      expectedStatus: "ok",
      mustContain: ["RX 9070 XT"],
      mustNotContain: ["완본체", "브라켓"],
      needsSuggestedQueries: false,
      expectedBehavior: "RX 9070 XT explain은 ok 상태로 가격 해석을 줘야 한다.",
      notes: "RX 9070 XT exact explain"
    }),
    caseDef({
      prompt: "RTX 5070 시리즈 지금 사도 돼?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["브라켓", "완본체"],
      needsSuggestedQueries: true,
      expectedBehavior: "GPU 시리즈 explain은 ambiguous로 멈추고 재질문을 유도해야 한다.",
      notes: "GPU series explain safety"
    }),
    caseDef({
      prompt: "RX 9070 계열 지금 사도 괜찮아?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["브라켓", "완본체"],
      needsSuggestedQueries: true,
      expectedBehavior: "라데온 계열 explain은 ambiguous로 멈추고 suggestedQueries를 줘야 한다.",
      notes: "Radeon family explain safety"
    })
  ])
];

const keyboardCases = [
  ...buildCases("keyboard", "broad-search", "search-api", [
    caseDef({
      prompt: "게이밍 키보드 찾아줘",
      mustContain: ["키보드"],
      mustNotContain: ["사무용", "오피스"],
      needsSuggestedQueries: false,
      expectedBehavior: "게이밍 키보드 broad search에 오피스 키보드가 과하게 섞이지 않아야 한다.",
      notes: "keyboard gaming noise"
    }),
    caseDef({
      prompt: "무선 기계식 키보드 검색해 줘",
      mustContain: ["키보드"],
      mustNotContain: ["마우스", "사무용"],
      needsSuggestedQueries: false,
      expectedBehavior: "무선 기계식 키보드 검색은 키보드 본체 중심이어야 한다.",
      notes: "wireless mechanical keyboard noise"
    }),
    caseDef({
      prompt: "텐키리스 게이밍 키보드 찾아줘",
      mustContain: ["키보드"],
      mustNotContain: ["오피스", "인체공학"],
      needsSuggestedQueries: false,
      expectedBehavior: "TKL 게이밍 키보드 검색은 게이밍/텐키리스 의도와 크게 어긋나지 않아야 한다.",
      notes: "TKL gaming keyboard noise"
    }),
    caseDef({
      prompt: "저소음 사무용 키보드 검색해 줘",
      mustContain: ["키보드"],
      mustNotContain: ["게이밍"],
      needsSuggestedQueries: false,
      expectedBehavior: "사무용 키보드 검색은 게이밍 키워드가 과하게 섞이지 않아야 한다.",
      notes: "office keyboard noise"
    })
  ]),
  ...buildCases("keyboard", "exact-ish-search", "search-api", [
    caseDef({
      prompt: "Keychron K2 Pro 검색해 줘",
      mustContain: ["Keychron", "K2 Pro"],
      mustNotContain: ["키캡", "마우스"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 Keychron 검색은 모델명이 유지되어야 한다.",
      notes: "Keychron exact-ish search"
    }),
    caseDef({
      prompt: "로지텍 MX Mechanical Mini 찾아줘",
      mustContain: ["MX Mechanical"],
      mustNotContain: ["마우스", "키스킨"],
      needsSuggestedQueries: false,
      expectedBehavior: "MX Mechanical Mini 검색은 키보드 본체 중심이어야 한다.",
      notes: "MX Mechanical exact-ish search"
    }),
    caseDef({
      prompt: "앱코 K660 검색해 줘",
      mustContain: ["앱코", "K660"],
      mustNotContain: ["마우스", "키캡"],
      needsSuggestedQueries: false,
      expectedBehavior: "앱코 K660 검색은 모델명을 유지해야 한다.",
      notes: "ABKO exact-ish search"
    }),
    caseDef({
      prompt: "DrunkDeer A75 찾아줘",
      mustContain: ["DrunkDeer", "A75"],
      mustNotContain: ["마우스", "키캡"],
      needsSuggestedQueries: false,
      expectedBehavior: "DrunkDeer A75 검색은 키보드 본체 중심이어야 한다.",
      notes: "DrunkDeer exact-ish search"
    })
  ]),
  ...buildCases("keyboard", "exact-compare", "compare-api", [
    caseDef({
      prompt: "Keychron K2 Pro 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["Keychron", "K2 Pro"],
      mustNotContain: ["마우스", "키캡"],
      needsSuggestedQueries: false,
      expectedBehavior: "Keychron K2 Pro exact compare는 가능하면 ok 상태여야 한다.",
      notes: "Keychron exact compare"
    }),
    caseDef({
      prompt: "로지텍 MX Mechanical Mini 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["MX Mechanical"],
      mustNotContain: ["마우스", "키캡"],
      needsSuggestedQueries: false,
      expectedBehavior: "MX Mechanical Mini exact compare는 가능하면 ok 상태여야 한다.",
      notes: "MX Mechanical exact compare"
    }),
    caseDef({
      prompt: "앱코 K660 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["앱코", "K660"],
      mustNotContain: ["마우스", "키캡"],
      needsSuggestedQueries: false,
      expectedBehavior: "앱코 K660 exact compare는 가능하면 ok 상태여야 한다.",
      notes: "ABKO exact compare"
    }),
    caseDef({
      prompt: "DrunkDeer A75 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["DrunkDeer", "A75"],
      mustNotContain: ["마우스", "키캡"],
      needsSuggestedQueries: false,
      expectedBehavior: "DrunkDeer A75 exact compare는 가능하면 ok 상태여야 한다.",
      notes: "DrunkDeer exact compare"
    })
  ]),
  ...buildCases("keyboard", "broad-ambiguous-safety", "compare-api", [
    caseDef({
      prompt: "게이밍 키보드 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["오피스", "사무용"],
      needsSuggestedQueries: false,
      expectedBehavior: "게이밍 키보드 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.",
      notes: "gaming keyboard compare safety"
    }),
    caseDef({
      prompt: "무선 키보드 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["마우스"],
      needsSuggestedQueries: false,
      expectedBehavior: "무선 키보드 broad compare는 ambiguous로 멈춰야 한다.",
      notes: "wireless keyboard compare safety"
    }),
    caseDef({
      prompt: "Keychron 키보드 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["마우스"],
      needsSuggestedQueries: true,
      expectedBehavior: "브랜드 단위 Keychron compare는 ambiguous로 멈추고 모델 추천을 주는 편이 좋다.",
      notes: "Keychron family compare safety"
    }),
    caseDef({
      prompt: "로지텍 기계식 키보드 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["마우스"],
      needsSuggestedQueries: true,
      expectedBehavior: "브랜드 단위 로지텍 기계식 키보드 compare는 ambiguous여야 한다.",
      notes: "Logitech family compare safety"
    })
  ]),
  ...buildCases("keyboard", "purchase-explain", "explain-mcp", [
    caseDef({
      prompt: "게이밍 키보드 지금 사도 돼?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["오피스", "사무용"],
      needsSuggestedQueries: false,
      expectedBehavior: "게이밍 키보드 explain은 동일상품이 아니면 멈춰야 한다.",
      notes: "gaming keyboard explain safety"
    }),
    caseDef({
      prompt: "Keychron 키보드 지금 사도 괜찮아?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["마우스"],
      needsSuggestedQueries: true,
      expectedBehavior: "Keychron 브랜드 explain은 ambiguous로 멈추고 follow-up query를 줘야 한다.",
      notes: "Keychron family explain"
    }),
    caseDef({
      prompt: "로지텍 MX Mechanical Mini 지금 사도 괜찮은 가격대야?",
      expectedStatus: "ok",
      mustContain: ["MX Mechanical"],
      mustNotContain: ["마우스", "키캡"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 MX Mechanical explain은 ok 상태로 가격 해석을 줘야 한다.",
      notes: "MX Mechanical exact explain"
    }),
    caseDef({
      prompt: "앱코 K660 지금 사도 돼?",
      expectedStatus: "ok",
      mustContain: ["앱코", "K660"],
      mustNotContain: ["마우스", "키캡"],
      needsSuggestedQueries: false,
      expectedBehavior: "앱코 K660 explain은 ok 상태를 목표로 한다.",
      notes: "ABKO exact explain"
    })
  ])
];

const monitorCases = [
  ...buildCases("monitor", "broad-search", "search-api", [
    caseDef({
      prompt: "27인치 4K 모니터 검색해 줘",
      mustContain: ["27", "4K", "모니터"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "27인치 4K 모니터 broad search는 모니터 본품 중심이어야 한다.",
      notes: "4K monitor broad search"
    }),
    caseDef({
      prompt: "게이밍 모니터 찾아줘",
      mustContain: ["모니터"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "게이밍 모니터 broad search는 렌탈 노이즈를 크게 줄여야 한다.",
      notes: "gaming monitor broad search"
    }),
    caseDef({
      prompt: "울트라와이드 모니터 검색해 줘",
      mustContain: ["모니터"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "울트라와이드 모니터 broad search는 모니터 본체 위주여야 한다.",
      notes: "ultrawide monitor broad search"
    }),
    caseDef({
      prompt: "32인치 QHD 모니터 찾아줘",
      mustContain: ["32", "모니터"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "32인치 QHD 모니터 broad search는 과도하게 흩어지지 않아야 한다.",
      notes: "32 inch QHD monitor broad search"
    })
  ]),
  ...buildCases("monitor", "exact-ish-search", "search-api", [
    caseDef({
      prompt: "LG 27GR93U 검색해 줘",
      mustContain: ["27GR93U"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 LG 모니터 검색은 모델 코드가 유지되어야 한다.",
      notes: "LG exact-ish search"
    }),
    caseDef({
      prompt: "Dell U2723QE 찾아줘",
      mustContain: ["U2723QE"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 Dell 모니터 검색은 모델 코드가 유지되어야 한다.",
      notes: "Dell exact-ish search"
    }),
    caseDef({
      prompt: "MSI MPG 321URX 검색해 줘",
      mustContain: ["321URX"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 MSI 모니터 검색은 모델 코드가 살아 있어야 한다.",
      notes: "MSI monitor exact-ish search"
    }),
    caseDef({
      prompt: "삼성 S27DG500 찾아줘",
      mustContain: ["S27DG500"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 삼성 모니터 검색은 모델 코드가 유지되어야 한다.",
      notes: "Samsung monitor exact-ish search"
    })
  ]),
  ...buildCases("monitor", "exact-compare", "compare-api", [
    caseDef({
      prompt: "LG 27GR93U 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["27GR93U"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "LG 27GR93U exact compare는 ok 상태를 목표로 한다.",
      notes: "LG monitor exact compare"
    }),
    caseDef({
      prompt: "Dell U2723QE 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["U2723QE"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "Dell U2723QE exact compare는 ok 상태를 목표로 한다.",
      notes: "Dell monitor exact compare"
    }),
    caseDef({
      prompt: "MSI MPG 321URX 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["321URX"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "MSI 321URX exact compare는 ok 상태를 목표로 한다.",
      notes: "MSI monitor exact compare"
    }),
    caseDef({
      prompt: "삼성 S27DG500 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["S27DG500"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "삼성 S27DG500 exact compare는 ok 상태를 목표로 한다.",
      notes: "Samsung monitor exact compare"
    })
  ]),
  ...buildCases("monitor", "broad-ambiguous-safety", "compare-api", [
    caseDef({
      prompt: "27인치 4K 모니터 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: true,
      expectedBehavior: "27인치 4K 모니터 broad compare는 ambiguous로 멈추고 모델 추천을 줘야 한다.",
      notes: "4K monitor broad compare"
    }),
    caseDef({
      prompt: "게이밍 모니터 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "게이밍 모니터 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.",
      notes: "gaming monitor broad compare"
    }),
    caseDef({
      prompt: "32인치 QHD 모니터 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: true,
      expectedBehavior: "32인치 QHD broad compare는 ambiguous로 멈추고 follow-up query를 줘야 한다.",
      notes: "32 QHD monitor broad compare"
    }),
    caseDef({
      prompt: "울트라와이드 모니터 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "울트라와이드 broad compare는 ambiguous로 멈춰야 한다.",
      notes: "ultrawide monitor broad compare"
    })
  ]),
  ...buildCases("monitor", "purchase-explain", "explain-mcp", [
    caseDef({
      prompt: "27인치 4K 모니터 지금 사도 돼?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: true,
      expectedBehavior: "27인치 4K monitor explain은 ambiguous로 멈추고 follow-up query를 줘야 한다.",
      notes: "4K monitor explain"
    }),
    caseDef({
      prompt: "게이밍 모니터 지금 사도 괜찮아?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "게이밍 모니터 explain은 broad query이면 멈춰야 한다.",
      notes: "gaming monitor explain"
    }),
    caseDef({
      prompt: "LG 27GR93U 지금 사도 괜찮은 가격대야?",
      expectedStatus: "ok",
      mustContain: ["27GR93U"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "LG 27GR93U explain은 ok 상태를 목표로 한다.",
      notes: "LG monitor exact explain"
    }),
    caseDef({
      prompt: "Dell U2723QE 지금 사도 돼?",
      expectedStatus: "ok",
      mustContain: ["U2723QE"],
      mustNotContain: ["렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "Dell U2723QE explain은 ok 상태를 목표로 한다.",
      notes: "Dell monitor exact explain"
    })
  ])
];

const pcPartCases = [
  ...buildCases("pc-part", "broad-search", "search-api", [
    caseDef({
      prompt: "B650 메인보드 검색해 줘",
      mustContain: ["B650", "메인보드"],
      mustNotContain: ["완본체", "조립PC", "렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "B650 메인보드 broad search는 완본체와 렌탈 노이즈를 줄여야 한다.",
      notes: "motherboard broad search"
    }),
    caseDef({
      prompt: "850W 파워 찾아줘",
      mustContain: ["850", "파워"],
      mustNotContain: ["완본체", "조립PC", "렌탈"],
      needsSuggestedQueries: false,
      expectedBehavior: "850W 파워 broad search는 파워 본품 중심이어야 한다.",
      notes: "power supply broad search"
    }),
    caseDef({
      prompt: "DDR5 32GB 메모리 검색해 줘",
      mustContain: ["DDR5", "32GB"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "DDR5 32GB 메모리 broad search는 메모리 본품 중심이어야 한다.",
      notes: "memory broad search"
    }),
    caseDef({
      prompt: "NVMe SSD 2TB 찾아줘",
      mustContain: ["SSD", "2TB"],
      mustNotContain: ["외장", "완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "NVMe SSD broad search는 외장 저장장치나 완본체 노이즈를 줄여야 한다.",
      notes: "SSD broad search"
    })
  ]),
  ...buildCases("pc-part", "exact-ish-search", "search-api", [
    caseDef({
      prompt: "ASUS TUF B650M-PLUS 검색해 줘",
      mustContain: ["B650M-PLUS", "ASUS"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 메인보드 검색은 모델명을 유지해야 한다.",
      notes: "motherboard exact-ish search"
    }),
    caseDef({
      prompt: "Ryzen 7 9800X3D 찾아줘",
      mustContain: ["9800X3D", "Ryzen"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 CPU 검색은 모델명을 유지해야 한다.",
      notes: "CPU exact-ish search"
    }),
    caseDef({
      prompt: "WD SN850X 2TB 검색해 줘",
      mustContain: ["SN850X", "2TB"],
      mustNotContain: ["외장", "완본체"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 SSD 검색은 외장 SSD와 과도하게 섞이지 않아야 한다.",
      notes: "SSD exact-ish search"
    }),
    caseDef({
      prompt: "SuperFlower SF-850F14XG 찾아줘",
      mustContain: ["SF-850F14XG"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "정확한 파워 검색은 모델명을 유지해야 한다.",
      notes: "PSU exact-ish search"
    })
  ]),
  ...buildCases("pc-part", "exact-compare", "compare-api", [
    caseDef({
      prompt: "ASUS TUF B650M-PLUS 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["B650M-PLUS", "ASUS"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "메인보드 exact compare는 ok 상태를 목표로 한다.",
      notes: "motherboard exact compare"
    }),
    caseDef({
      prompt: "Ryzen 7 9800X3D 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["9800X3D", "Ryzen"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "CPU exact compare는 ok 상태를 목표로 한다.",
      notes: "CPU exact compare"
    }),
    caseDef({
      prompt: "WD SN850X 2TB 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["SN850X", "2TB"],
      mustNotContain: ["외장", "완본체"],
      needsSuggestedQueries: false,
      expectedBehavior: "SSD exact compare는 ok 상태를 목표로 한다.",
      notes: "SSD exact compare"
    }),
    caseDef({
      prompt: "SuperFlower SF-850F14XG 가격 비교해 줘",
      expectedStatus: "ok",
      mustContain: ["SF-850F14XG"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "파워 exact compare는 ok 상태를 목표로 한다.",
      notes: "PSU exact compare"
    })
  ]),
  ...buildCases("pc-part", "broad-ambiguous-safety", "compare-api", [
    caseDef({
      prompt: "B650 메인보드 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "B650 broad compare는 ambiguous로 멈추고 모델 재질문을 유도해야 한다.",
      notes: "motherboard broad compare"
    }),
    caseDef({
      prompt: "850W 파워 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "파워 broad compare는 ambiguous로 멈추고 follow-up query를 제안해야 한다.",
      notes: "PSU broad compare"
    }),
    caseDef({
      prompt: "DDR5 32GB 메모리 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "메모리 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.",
      notes: "memory broad compare"
    }),
    caseDef({
      prompt: "NVMe SSD 2TB 가격 비교해 줘",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["외장", "완본체"],
      needsSuggestedQueries: true,
      expectedBehavior: "SSD broad compare는 ambiguous로 멈추고 모델 재질문을 유도해야 한다.",
      notes: "SSD broad compare"
    })
  ]),
  ...buildCases("pc-part", "purchase-explain", "explain-mcp", [
    caseDef({
      prompt: "B650 메인보드 지금 사도 돼?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "B650 explain은 broad query면 ambiguous로 멈추고 follow-up query를 줘야 한다.",
      notes: "motherboard broad explain"
    }),
    caseDef({
      prompt: "Ryzen 7 9800X3D 지금 사도 괜찮아?",
      expectedStatus: "ok",
      mustContain: ["9800X3D", "Ryzen"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: false,
      expectedBehavior: "CPU exact explain은 ok 상태를 목표로 한다.",
      notes: "CPU exact explain"
    }),
    caseDef({
      prompt: "WD SN850X 2TB 지금 사도 돼?",
      expectedStatus: "ok",
      mustContain: ["SN850X", "2TB"],
      mustNotContain: ["외장", "완본체"],
      needsSuggestedQueries: false,
      expectedBehavior: "SSD exact explain은 ok 상태를 목표로 한다.",
      notes: "SSD exact explain"
    }),
    caseDef({
      prompt: "850W 파워 지금 사도 괜찮은 가격대야?",
      expectedStatus: "ambiguous",
      mustContain: ["정확히 같은 모델"],
      mustNotContain: ["완본체", "조립PC"],
      needsSuggestedQueries: true,
      expectedBehavior: "파워 broad explain은 ambiguous로 멈추고 재질문을 유도해야 한다.",
      notes: "PSU broad explain"
    })
  ])
];

export const SERVICE_QUALITY_100_CASES: ServiceQualityEvalCase[] = [
  ...laptopCases,
  ...graphicsCardCases,
  ...keyboardCases,
  ...monitorCases,
  ...pcPartCases
];

export const SERVICE_QUALITY_EXPECTED_STATUS_COUNTS: Record<ExpectedToolStatus, number> = {
  ok: SERVICE_QUALITY_100_CASES.filter((item) => item.expectedStatus === "ok").length,
  ambiguous: SERVICE_QUALITY_100_CASES.filter((item) => item.expectedStatus === "ambiguous").length,
  not_found: SERVICE_QUALITY_100_CASES.filter((item) => item.expectedStatus === "not_found").length
};
