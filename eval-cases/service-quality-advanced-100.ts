import { SERVICE_QUALITY_100_CASES } from "./service-quality-100.ts";
import type { ServiceQualityEvalCase } from "../src/eval/serviceQualityHarness.js";

interface AdvancedPromptOverride {
  prompt: string;
}

const ADVANCED_PROMPT_OVERRIDES: Record<string, AdvancedPromptOverride> = {
  // laptop
  "laptop-broad-search-1": {
    prompt:
      "게임도 좀 할 거라 게이밍 노트북 쪽으로 보고 싶은데, 사무용 느낌 나는 건 빼고 요즘 뭐가 잡히는지 정리해줘"
  },
  "laptop-broad-search-2": {
    prompt:
      "4060 들어간 노트북을 보는 중인데 렌탈이나 다른 급 그래픽 섞지 말고 대충 후보가 뭐가 있나 좀 볼래"
  },
  "laptop-broad-search-3": {
    prompt:
      "그램 16 생각 중인데 키스킨 같은 거 말고 본체 위주로만 뭐가 뜨는지 보여줘"
  },
  "laptop-broad-search-4": {
    prompt:
      "갤북4 프로 16 쪽으로 알아보는 중이라 파우치나 필름 같은 건 빼고 본체만 찾아줘"
  },
  "laptop-exact-ish-search-1": {
    prompt:
      "LG 그램 쪽에서 16Z90T GA5CK로 보이는 본체들만 가능하면 깔끔하게 정리해줘"
  },
  "laptop-exact-ish-search-2": {
    prompt:
      "삼성 쪽은 NT960XGQ-A51A 이 모델로 찾고 싶은데 액세서리 말고 본체 위주로 보여줘"
  },
  "laptop-exact-ish-search-3": {
    prompt:
      "레노버는 15IRX9로 보는 거라 다른 비슷한 급 말고 이 모델 검색 좀 해줘"
  },
  "laptop-exact-ish-search-4": {
    prompt:
      "빅터스 쪽에서 15-FB2061AX 이걸 보는 거라 모델 맞는 것들만 한번 찾아봐줘"
  },
  "laptop-exact-compare-1": {
    prompt:
      "그램 16 중에서도 16Z90T GA5CK 이거 가격 비교만 딱 해줘"
  },
  "laptop-exact-compare-2": {
    prompt:
      "NT960XGQ-A51A 이 모델은 지금 판매처별로 얼마 차이 나는지 비교해줘"
  },
  "laptop-exact-compare-3": {
    prompt:
      "15IRX9 하나 보고 있는데 같은 모델끼리 최저가 비교 좀 해줘"
  },
  "laptop-exact-compare-4": {
    prompt:
      "15-FB2061AX 이거는 다른 거 섞지 말고 정확히 같은 모델만 비교해줘"
  },
  "laptop-broad-ambiguous-safety-1": {
    prompt:
      "그램 16 라인으로 보긴 하는데 모델이 많을 것 같아서, 바로 비교 말고 가능 여부부터 봐줘"
  },
  "laptop-broad-ambiguous-safety-2": {
    prompt:
      "갤북4 프로 16이라고만 보면 여러 모델일 것 같은데 일단 가격 비교가 되는 수준인지 봐줘"
  },
  "laptop-broad-ambiguous-safety-3": {
    prompt:
      "4060 들어간 노트북 전부를 한 번에 비교하는 건 무리일 것 같긴 한데, 그래도 어떻게 나오는지 봐줘"
  },
  "laptop-broad-ambiguous-safety-4": {
    prompt:
      "게이밍 노트북 통으로 비교해달라는 건 좀 넓은 것 같은데, 멈춰야 하면 멈추고 알려줘"
  },
  "laptop-purchase-explain-1": {
    prompt:
      "그램 16 쪽을 보는 중인데, 모델이 여러 개면 멈춰도 되니까 지금 사도 되는 가격대인지 같이 봐줘"
  },
  "laptop-purchase-explain-2": {
    prompt:
      "4060 노트북 알아보는 중인데 너무 막연하면 멈추고, 다음에 뭘 물어보면 좋을지도 알려줘"
  },
  "laptop-purchase-explain-3": {
    prompt:
      "NT960XGQ-A51A 이건 지금 사도 괜찮은 가격대인지 한번 설명해줘"
  },
  "laptop-purchase-explain-4": {
    prompt:
      "15IRX9 보는데 지금 들어가도 될 가격인지 너무 길지 않게 봐줘"
  },

  // graphics-card
  "graphics-card-broad-search-1": {
    prompt:
      "5070급 그래픽카드 보는 중인데 브라켓이나 완본체 같은 건 빼고 본품 위주로 뭐가 뜨는지 보여줘"
  },
  "graphics-card-broad-search-2": {
    prompt:
      "RTX 5070 시리즈를 넓게 훑어보고 싶은데 조립PC 말고 카드 본체만 정리해줘"
  },
  "graphics-card-broad-search-3": {
    prompt:
      "라데온 9070 쪽 보는 중이라 브라켓이나 완본체 섞지 말고 카드만 찾아줘"
  },
  "graphics-card-broad-search-4": {
    prompt:
      "5070 Ti 라인 보는데 지지대나 완본체 말고 본품만 검색 좀 해줘"
  },
  "graphics-card-exact-ish-search-1": {
    prompt:
      "조탁 5070 Twin Edge 쪽이 궁금해서 ZOTAC RTX 5070 Twin Edge로 보이는 것만 찾아줘"
  },
  "graphics-card-exact-ish-search-2": {
    prompt:
      "ASUS TUF 5070 Ti 쪽으로 보는데 그 모델명 기준으로 검색해줘"
  },
  "graphics-card-exact-ish-search-3": {
    prompt:
      "Sapphire RX 9070 XT Pulse 이 라인만 보고 싶으니 다른 거 말고 그쪽만 찾아줘"
  },
  "graphics-card-exact-ish-search-4": {
    prompt:
      "PowerColor RX 9070 Hellhound 이 모델로 뜨는 것들만 한번 정리해줘"
  },
  "graphics-card-exact-compare-1": {
    prompt:
      "RTX 5070은 정확히 그 모델끼리만 가격 비교해줘"
  },
  "graphics-card-exact-compare-2": {
    prompt:
      "RTX 5070 Ti는 다른 급 섞지 말고 같은 모델만 비교해줘"
  },
  "graphics-card-exact-compare-3": {
    prompt:
      "RX 9070 이건 XT 말고 일반형끼리만 비교해줘"
  },
  "graphics-card-exact-compare-4": {
    prompt:
      "RX 9070 XT는 정확히 XT끼리만 가격 비교해줘"
  },
  "graphics-card-broad-ambiguous-safety-1": {
    prompt:
      "RTX 5070 시리즈 전체를 한 번에 비교해달라는 건 넓을 수 있으니까, 안 되면 안전하게 멈춰줘"
  },
  "graphics-card-broad-ambiguous-safety-2": {
    prompt:
      "RX 9070 시리즈 통으로 가격 비교가 되는지 보고, 아니면 왜 안 되는지 알려줘"
  },
  "graphics-card-broad-ambiguous-safety-3": {
    prompt:
      "엔비디아 5070 그래픽카드 정도로만 말하면 애매할 것 같은데 그래도 비교 요청을 넣어볼게"
  },
  "graphics-card-broad-ambiguous-safety-4": {
    prompt:
      "라데온 9070 계열 전체로 보면 넓은데, 멈춰야 하면 멈추고 다음 검색어 좀 줘"
  },
  "graphics-card-purchase-explain-1": {
    prompt:
      "RTX 5070 지금 들어가도 되는 가격인지 짧게 설명해줘"
  },
  "graphics-card-purchase-explain-2": {
    prompt:
      "RX 9070 XT는 지금 사도 괜찮은 가격대인지 한번 봐줘"
  },
  "graphics-card-purchase-explain-3": {
    prompt:
      "RTX 5070 시리즈 쪽으로 보는 중인데 너무 넓으면 멈추고 다음 질문을 추천해줘"
  },
  "graphics-card-purchase-explain-4": {
    prompt:
      "라데온 9070 계열이 지금 살 만한지 보려는데, 애매하면 정확한 모델로 다시 묻게 해줘"
  },

  // keyboard
  "keyboard-broad-search-1": {
    prompt:
      "게이밍 키보드 찾는 중인데 사무용 느낌 강한 거나 오피스용은 빼고 뭐가 뜨는지 볼래"
  },
  "keyboard-broad-search-2": {
    prompt:
      "무선 기계식 키보드 보고 있는데 마우스나 사무용 키보드 같은 건 빼고 정리해줘"
  },
  "keyboard-broad-search-3": {
    prompt:
      "텐키리스 게이밍 키보드 쪽으로 보고 싶어서 풀배열 오피스용 말고 맞는 것만 보여줘"
  },
  "keyboard-broad-search-4": {
    prompt:
      "저소음 사무용 키보드 찾는 중인데 RGB 번쩍이는 게이밍 느낌은 빼고 보여줘"
  },
  "keyboard-exact-ish-search-1": {
    prompt:
      "키크론 K2 Pro 생각 중이라 정확히 그 모델로 뜨는 것들만 검색해줘"
  },
  "keyboard-exact-ish-search-2": {
    prompt:
      "로지텍 mx mini라고들 하던데 정확히는 MX Mechanical Mini잖아, 그걸로 찾아줘"
  },
  "keyboard-exact-ish-search-3": {
    prompt:
      "앱코 K660 하나 보는데 키캡 같은 액세서리 말고 본체만 검색해줘"
  },
  "keyboard-exact-ish-search-4": {
    prompt:
      "DrunkDeer A75 이 모델 궁금해서 정확히 맞는 것만 한번 찾아봐줘"
  },
  "keyboard-exact-compare-1": {
    prompt:
      "Keychron K2 Pro 이건 정확히 같은 모델끼리 가격 비교해줘"
  },
  "keyboard-exact-compare-2": {
    prompt:
      "MX Mechanical Mini는 마우스 같은 거 섞지 말고 키보드 본체끼리만 비교해줘"
  },
  "keyboard-exact-compare-3": {
    prompt:
      "앱코 K660 가격 차이만 깔끔하게 비교해줘"
  },
  "keyboard-exact-compare-4": {
    prompt:
      "DrunkDeer A75는 정확히 같은 제품 기준으로 얼마 차이 나는지 보고 싶어"
  },
  "keyboard-broad-ambiguous-safety-1": {
    prompt:
      "게이밍 키보드 전체를 바로 비교하는 건 넓을 수 있으니까 안 되면 멈추고 알려줘"
  },
  "keyboard-broad-ambiguous-safety-2": {
    prompt:
      "무선 키보드 통으로 가격 비교하면 애매할 것 같은데, 가능 여부부터 봐줘"
  },
  "keyboard-broad-ambiguous-safety-3": {
    prompt:
      "로지텍 기계식 키보드 정도로만 말하면 여러 개일 텐데 그래도 비교 요청 넣어볼게"
  },
  "keyboard-broad-ambiguous-safety-4": {
    prompt:
      "저소음 사무용 키보드도 모델이 많으니 정확히 못 고르면 멈추고 다음 질문을 추천해줘"
  },
  "keyboard-purchase-explain-1": {
    prompt:
      "Keychron 키보드 중에 하나 사려는데 너무 막연하면 멈추고 다음 검색어를 줘"
  },
  "keyboard-purchase-explain-2": {
    prompt:
      "로지텍 기계식 키보드 지금 사도 될 가격인지 보고 싶은데 애매하면 재질문도 같이 줘"
  },
  "keyboard-purchase-explain-3": {
    prompt:
      "MX Mechanical Mini는 지금 들어가도 괜찮은 가격대인지 설명해줘"
  },
  "keyboard-purchase-explain-4": {
    prompt:
      "앱코 K660 이거 지금 사도 무난한 가격인지 간단히 봐줘"
  },

  // monitor
  "monitor-broad-search-1": {
    prompt:
      "27인치 4K 모니터 찾는 중인데 TV나 이상한 액세서리 말고 본체 위주로 정리해줘"
  },
  "monitor-broad-search-2": {
    prompt:
      "32인치 QHD 모니터 보려는데 너무 엉뚱한 해상도는 빼고 대충 뭐가 있는지 보여줘"
  },
  "monitor-broad-search-3": {
    prompt:
      "울트라와이드 모니터 쪽으로 보는데 본체 말고 암이나 케이블 같은 건 빼고 찾아줘"
  },
  "monitor-broad-search-4": {
    prompt:
      "고주사율 게이밍 모니터 보는 중인데 TV나 다른 기기 말고 모니터만 보여줘"
  },
  "monitor-exact-ish-search-1": {
    prompt:
      "LG 27GR93U 이 모델로 검색 좀 해줘, 비슷한 다른 모델 말고"
  },
  "monitor-exact-ish-search-2": {
    prompt:
      "DELL U2723QE 하나 보는 중인데 정확한 모델명으로 뜨는 것만 찾아줘"
  },
  "monitor-exact-ish-search-3": {
    prompt:
      "MSI 321URX 생각 중이라 그 모델 기준 결과만 보여줘"
  },
  "monitor-exact-ish-search-4": {
    prompt:
      "삼성 S27DG500 이 모델로 검색해줘"
  },
  "monitor-exact-compare-1": {
    prompt:
      "27GR93U는 정확히 같은 모델끼리 가격 비교해줘"
  },
  "monitor-exact-compare-2": {
    prompt:
      "U2723QE 판매처별 차이 좀 비교해줘"
  },
  "monitor-exact-compare-3": {
    prompt:
      "321URX 이건 정확 모델 기준으로 최저가 비교해줘"
  },
  "monitor-exact-compare-4": {
    prompt:
      "S27DG500 가격 비교 좀 해줘, 다른 비슷한 모델 섞지 말고"
  },
  "monitor-broad-ambiguous-safety-1": {
    prompt:
      "27인치 4K 모니터 전체를 바로 비교하는 건 넓을 수 있으니까 가능 여부 먼저 봐줘"
  },
  "monitor-broad-ambiguous-safety-2": {
    prompt:
      "32인치 QHD 모니터 통으로 가격 비교해달라면 애매할 것 같은데 그래도 한번 넣어볼게"
  },
  "monitor-broad-ambiguous-safety-3": {
    prompt:
      "게이밍 모니터라고만 하면 모델이 많으니 안 되면 멈추고 다시 물을 만한 걸 추천해줘"
  },
  "monitor-broad-ambiguous-safety-4": {
    prompt:
      "울트라와이드 모니터 가격 비교하고 싶은데 너무 넓으면 멈추고 정리해줘"
  },
  "monitor-purchase-explain-1": {
    prompt:
      "27인치 4K 모니터 지금 사도 될 가격인지 보고 싶은데, 애매하면 재질문도 같이 줘"
  },
  "monitor-purchase-explain-2": {
    prompt:
      "32인치 QHD 모니터 쪽이 요즘 살 만한지 보려는데 너무 넓으면 멈춰줘"
  },
  "monitor-purchase-explain-3": {
    prompt:
      "27GR93U는 지금 사도 괜찮은 가격대인지 설명해줘"
  },
  "monitor-purchase-explain-4": {
    prompt:
      "U2723QE 이 모델은 지금 들어가도 될 가격인지 좀 봐줘"
  },

  // pc-part
  "pc-part-broad-search-1": {
    prompt:
      "B650 메인보드 보는 중인데 메인보드 말고 다른 완본체나 엉뚱한 건 빼고 보여줘"
  },
  "pc-part-broad-search-2": {
    prompt:
      "850W 파워 찾는 중이라 파워 본체 위주로만 정리해줘"
  },
  "pc-part-broad-search-3": {
    prompt:
      "DDR5 32GB 메모리 보려는데 규격 안 맞는 거나 엉뚱한 주변기기 말고 찾아줘"
  },
  "pc-part-broad-search-4": {
    prompt:
      "2TB NVMe SSD 쪽으로 보는 중인데 외장 케이스 같은 건 빼고 본체만 보여줘"
  },
  "pc-part-exact-ish-search-1": {
    prompt:
      "ASUS TUF B650M-PLUS 이 보드로 검색해줘"
  },
  "pc-part-exact-ish-search-2": {
    prompt:
      "Ryzen 7 9800X3D 이 CPU로 뜨는 것만 찾아줘"
  },
  "pc-part-exact-ish-search-3": {
    prompt:
      "WD SN850X 2TB 이 모델로 검색해줘"
  },
  "pc-part-exact-ish-search-4": {
    prompt:
      "SuperFlower SF-850F14XG 이 파워 검색해줘"
  },
  "pc-part-exact-compare-1": {
    prompt:
      "B650M-PLUS는 정확 모델 기준으로 가격 비교해줘"
  },
  "pc-part-exact-compare-2": {
    prompt:
      "9800X3D 가격 차이만 정확히 비교해줘"
  },
  "pc-part-exact-compare-3": {
    prompt:
      "SN850X 2TB는 용량까지 맞는 것끼리만 비교해줘"
  },
  "pc-part-exact-compare-4": {
    prompt:
      "SF-850F14XG는 같은 파워 모델끼리만 가격 비교해줘"
  },
  "pc-part-broad-ambiguous-safety-1": {
    prompt:
      "B650 메인보드 전체 가격 비교는 넓을 테니 안 되면 멈추고 추천 검색어를 줘"
  },
  "pc-part-broad-ambiguous-safety-2": {
    prompt:
      "850W 파워를 한 번에 비교하면 모델이 많을 것 같은데 가능 여부부터 봐줘"
  },
  "pc-part-broad-ambiguous-safety-3": {
    prompt:
      "DDR5 32GB 메모리 통으로 가격 비교하려는데, 너무 넓으면 멈추고 다시 물을 걸 추천해줘"
  },
  "pc-part-broad-ambiguous-safety-4": {
    prompt:
      "2TB NVMe SSD 가격 비교하고 싶은데 모델이 많으면 안전하게 멈춰줘"
  },
  "pc-part-purchase-explain-1": {
    prompt:
      "B650 메인보드 쪽을 지금 사도 되는 가격인지 보고 싶은데 막연하면 멈추고 재질문 추천해줘"
  },
  "pc-part-purchase-explain-2": {
    prompt:
      "850W 파워 지금 들어가도 될 가격대인지 같이 봐줘, 애매하면 정확 모델도 알려줘"
  },
  "pc-part-purchase-explain-3": {
    prompt:
      "9800X3D는 요즘 사도 괜찮은 가격인지 봐줘"
  },
  "pc-part-purchase-explain-4": {
    prompt:
      "SN850X 2TB 지금 사도 무난한 가격인지 설명해줘"
  }
};

function buildAdvancedNotes(prompt: string): string {
  const features = new Set<string>(["구어체"]);

  if (/(빼고|말고|제외)/u.test(prompt)) {
    features.add("제외 조건");
  }

  if (/(가능하면|너무|같이|요즘|대충|한번|통으로|전체로|전체를)/u.test(prompt)) {
    features.add("복합 제약");
  }

  if (/(갤북|빅터스|mx mini|라데온|조탁|키크론)/iu.test(prompt)) {
    features.add("별칭 또는 브랜드 축약");
  }

  if (/(지금 사도|가격대인지|같이 봐줘|설명해줘)/u.test(prompt)) {
    features.add("비교/설명 혼합");
  }

  if (/(멈추고|추천해줘|알려줘|정리해줘|봐줘|볼래)/u.test(prompt)) {
    features.add("재질문 유도");
  }

  return `고난도 자연어: ${[...features].join(", ")}`;
}

function validateOverrides() {
  const baseIds = new Set(SERVICE_QUALITY_100_CASES.map((item) => item.id));
  const overrideIds = Object.keys(ADVANCED_PROMPT_OVERRIDES);
  const missingIds = [...baseIds].filter((id) => !(id in ADVANCED_PROMPT_OVERRIDES));
  const extraIds = overrideIds.filter((id) => !baseIds.has(id));

  if (missingIds.length > 0 || extraIds.length > 0) {
    throw new Error(
      `advanced 평가셋 override 불일치: missing=${missingIds.join(", ") || "none"}, extra=${extraIds.join(", ") || "none"}`
    );
  }
}

validateOverrides();

export const SERVICE_QUALITY_ADVANCED_100_CASES: ServiceQualityEvalCase[] =
  SERVICE_QUALITY_100_CASES.map((item) => {
    const override = ADVANCED_PROMPT_OVERRIDES[item.id];

    return {
      ...item,
      prompt: override.prompt,
      notes: `${item.notes}; ${buildAdvancedNotes(override.prompt)}`
    };
  });
