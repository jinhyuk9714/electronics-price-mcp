import { describe, expect, test } from "vitest";

import {
  condenseNaturalLanguageQuery,
  extractGpuModel,
  extractExactQueryModel,
  extractNotebookFamilyKey,
  extractNormalizedModel,
  extractNotebookModelCode,
  extractRequestedNotebookGpuModel,
  isGraphicsDeviceLikeTitle,
  resolvePrimaryModelForQuery,
  isAmbiguousComparison,
  normalizeBrand,
  stripHtml
} from "../../src/domain/normalize.js";

describe("normalize helpers", () => {
  test("stripHtml removes tags and html entities", () => {
    expect(stripHtml("<b>LG</b> 그램 16&nbsp;2025")).toBe("LG 그램 16 2025");
  });

  test("normalizeBrand trims whitespace and normalizes common Korean electronics brands", () => {
    expect(normalizeBrand("  lg전자  ")).toBe("LG");
    expect(normalizeBrand("SAMSUNG")).toBe("Samsung");
    expect(normalizeBrand("")).toBeNull();
  });

  test("extractNormalizedModel keeps GPU variants distinct", () => {
    expect(extractNormalizedModel("MSI GeForce RTX 5070 Ti Ventus 2X OC D7 12GB")).toBe("RTX 5070 TI");
    expect(extractNormalizedModel("ZOTAC GAMING GeForce RTX 5070 Twin Edge")).toBe("RTX 5070");
  });

  test("extractNormalizedModel normalizes notebook model codes with or without hyphens", () => {
    expect(extractNormalizedModel("LG 그램 16 16Z90T GA5CK")).toBe("16Z90T-GA5CK");
    expect(extractNormalizedModel("LG 그램 16 16Z90T - GA5CK")).toBe("16Z90T-GA5CK");
    expect(extractNormalizedModel("삼성 갤럭시북4 프로 NT960XGQ-A51A")).toBe("NT960XGQ-A51A");
    expect(extractNormalizedModel("삼성 갤럭시북4 프로 NT960XGQ - A51A")).toBe("NT960XGQ-A51A");
  });

  test("extractNotebookModelCode recognizes additional broad notebook model families", () => {
    expect(extractNotebookModelCode("HP 빅터스 15-fb2061AX 윈도우11 16GB")).toBe("15-FB2061AX");
    expect(extractNotebookModelCode("HP OMEN 16-xf0052ax 16GB, 512GB")).toBe("16-XF0052AX");
    expect(extractNotebookModelCode("레노버 리전 5i 15IRX9 코어i7 인텔 13세대")).toBe("15IRX9");
  });

  test("extractGpuModel can infer bare notebook GPU generations from broad titles", () => {
    expect(extractGpuModel("레노버 리전 5i 15IRX9 i7 4060 24GB, 1TB")).toBe("RTX 4060");
    expect(extractGpuModel("HP Victus Gaming Laptop RTX 4050")).toBe("RTX 4050");
  });

  test("resolvePrimaryModelForQuery prefers notebook model codes for broad notebook queries", () => {
    expect(resolvePrimaryModelForQuery("4060 노트북", "HP OMEN 16-xf0052ax RTX 4060 16GB, 512GB")).toBe("16-XF0052AX");
    expect(resolvePrimaryModelForQuery("4060 노트북", "HP 빅터스 게이밍 노트북 RTX 4060 영상편집")).toBeNull();
    expect(resolvePrimaryModelForQuery("RTX 5070 시리즈", "ZOTAC GAMING GeForce RTX 5070 Twin Edge")).toBe("RTX 5070");
  });

  test("extractRequestedNotebookGpuModel normalizes bare GPU generations in notebook queries", () => {
    expect(extractRequestedNotebookGpuModel("4060 노트북")).toBe("RTX 4060");
    expect(extractRequestedNotebookGpuModel("RTX 4070 노트북")).toBe("RTX 4070");
    expect(extractRequestedNotebookGpuModel("그램 16")).toBeNull();
  });

  test("extractNotebookFamilyKey creates safe fallback groups for broad notebook queries", () => {
    expect(
      extractNotebookFamilyKey("4060 노트북", "HP 빅터스 15 게이밍 노트북 라이젠7 RTX 4060 영상편집", "HP")
    ).toBe("NOTEBOOK_FAMILY|HP|VICTUS|15|RTX 4060");
    expect(
      extractNotebookFamilyKey("4060 노트북", "HP 빅터스 16 게이밍 노트북 라이젠7 RTX 4060 영상편집", "HP")
    ).toBe("NOTEBOOK_FAMILY|HP|VICTUS|16|RTX 4060");
    expect(
      extractNotebookFamilyKey("그램 16", "LG 그램 프로 16 윈도우11 사무용 노트북", "LG")
    ).toBe("NOTEBOOK_FAMILY|LG|GRAM PRO|16");
    expect(
      extractNotebookFamilyKey("그램 16", "2026 LG그램 프로 16 윈도우11 엘지 사무용 노트북", "그램16")
    ).toBe("NOTEBOOK_FAMILY|LG|GRAM PRO|16");
    expect(
      extractNotebookFamilyKey("갤럭시북4 프로 16", "삼성 갤럭시북4 프로 360 16 크리에이터 노트북", "Samsung")
    ).toBe("NOTEBOOK_FAMILY|SAMSUNG|GALAXYBOOK4 PRO 360|16");
    expect(
      extractNotebookFamilyKey("4060 노트북", "MSI 게이밍 노트북 RTX 4060 윈11 영상편집", "MSI")
    ).toBeNull();
  });

  test("extractNotebookFamilyKey keeps generic notebook family fallbacks stable without forcing a size", () => {
    expect(
      extractNotebookFamilyKey("4060 노트북", "HP 빅터스 게이밍 노트북 라이젠7 RTX 4060 영상편집", "HP")
    ).toBe("NOTEBOOK_FAMILY|HP|VICTUS|RTX 4060");
    expect(
      extractNotebookFamilyKey("4060 노트북", "레노버 리전 고성능 게이밍 노트북 RTX 4060 대학생", "Lenovo")
    ).toBe("NOTEBOOK_FAMILY|LENOVO|LEGION|RTX 4060");
  });

  test("extractNotebookFamilyKey recognizes additional MSI, ASUS, ROG, and LOQ families", () => {
    expect(
      extractNotebookFamilyKey("4060 노트북", "MSI Cyborg 15 게이밍 노트북 RTX 4060", "MSI")
    ).toBe("NOTEBOOK_FAMILY|MSI|CYBORG|15|RTX 4060");
    expect(
      extractNotebookFamilyKey("4060 노트북", "MSI Katana 17 고성능 게이밍 노트북 RTX 4060", "MSI")
    ).toBe("NOTEBOOK_FAMILY|MSI|KATANA|17|RTX 4060");
    expect(
      extractNotebookFamilyKey("4060 노트북", "ASUS TUF Gaming A15 RTX 4060 게이밍 노트북", "ASUS")
    ).toBe("NOTEBOOK_FAMILY|ASUS|TUF|15|RTX 4060");
    expect(
      extractNotebookFamilyKey("4060 노트북", "ASUS ROG Strix G16 RTX 4060 게이밍 노트북", "ASUS")
    ).toBe("NOTEBOOK_FAMILY|ASUS|ROG STRIX|16|RTX 4060");
    expect(
      extractNotebookFamilyKey("4060 노트북", "ASUS ROG Zephyrus G16 RTX 4060 크리에이터 노트북", "ASUS")
    ).toBe("NOTEBOOK_FAMILY|ASUS|ROG ZEPHYRUS|16|RTX 4060");
    expect(
      extractNotebookFamilyKey("4060 노트북", "레노버 LOQ 게이밍 노트북 RTX 4060 대학생", "Lenovo")
    ).toBe("NOTEBOOK_FAMILY|LENOVO|LOQ|RTX 4060");
  });

  test("extractNormalizedModel does not treat line names as exact notebook models", () => {
    expect(extractNormalizedModel("LG 그램 16 2025")).toBeNull();
    expect(extractNormalizedModel("삼성 갤럭시북4 프로 16")).toBeNull();
  });

  test("extractNormalizedModel recognizes exact keyboard, monitor, and pc-part models", () => {
    expect(extractNormalizedModel("Keychron K2 Pro 무선 기계식 키보드")).toBe("KEYCHRON K2 PRO");
    expect(extractNormalizedModel("로지텍 MX Mechanical Mini 무선 키보드")).toBe(
      "LOGITECH MX MECHANICAL MINI"
    );
    expect(extractNormalizedModel("앱코 K660 카일 광축 키보드")).toBe("ABKO K660");
    expect(extractNormalizedModel("DrunkDeer A75 래피드트리거 키보드")).toBe("DRUNKDEER A75");

    expect(extractNormalizedModel("LG 울트라기어 27GR93U 27인치 4K 모니터")).toBe("LG 27GR93U");
    expect(extractNormalizedModel("Dell UltraSharp U2723QE 27형 4K 모니터")).toBe("DELL U2723QE");
    expect(extractNormalizedModel("MSI MPG 321URX QD-OLED 게이밍 모니터")).toBe("MSI 321URX");
    expect(extractNormalizedModel("삼성 오디세이 S27DG500 QHD 게이밍 모니터")).toBe("SAMSUNG S27DG500");

    expect(extractNormalizedModel("ASUS TUF B650M-PLUS WIFI 메인보드")).toBe("ASUS TUF B650M-PLUS");
    expect(extractNormalizedModel("AMD Ryzen 7 9800X3D 정품 멀티팩")).toBe("RYZEN 7 9800X3D");
    expect(extractNormalizedModel("WD_BLACK SN850X 2TB NVMe SSD")).toBe("WD SN850X 2TB");
    expect(extractNormalizedModel("SuperFlower SF-850F14XG LEADEX VII GOLD ATX3.1")).toBe(
      "SUPERFLOWER SF-850F14XG"
    );
  });

  test("extractNormalizedModel keeps storage capacity and keyboard variants distinct", () => {
    expect(extractNormalizedModel("WD_BLACK SN850X 1TB NVMe SSD")).toBe("WD SN850X 1TB");
    expect(extractNormalizedModel("WD_BLACK SN850X 2TB NVMe SSD")).toBe("WD SN850X 2TB");
    expect(extractNormalizedModel("Logitech MX Mechanical 무선 키보드")).toBe("LOGITECH MX MECHANICAL");
    expect(extractNormalizedModel("Logitech MX Mechanical Mini 무선 키보드")).toBe(
      "LOGITECH MX MECHANICAL MINI"
    );
  });

  test("extractExactQueryModel only marks exact-model queries", () => {
    expect(extractExactQueryModel("RTX 5070")).toBe("RTX 5070");
    expect(extractExactQueryModel("16Z90T GA5CK 최저가 비교")).toBe("16Z90T-GA5CK");
    expect(extractExactQueryModel("Keychron K2 Pro 가격 비교")).toBe("KEYCHRON K2 PRO");
    expect(extractExactQueryModel("LG 27GR93U 가격 비교")).toBe("LG 27GR93U");
    expect(extractExactQueryModel("Ryzen 7 9800X3D 가격 비교")).toBe("RYZEN 7 9800X3D");
    expect(extractExactQueryModel("WD SN850X 2TB 가격 비교")).toBe("WD SN850X 2TB");
    expect(extractExactQueryModel("RTX 5070 시리즈 가격 비교")).toBeNull();
    expect(extractExactQueryModel("RX 9070 시리즈 가격 비교")).toBeNull();
    expect(extractExactQueryModel("RX 9070 계열 지금 사도 괜찮아?")).toBeNull();
    expect(extractExactQueryModel("엔비디아 5070 그래픽카드 비교")).toBeNull();
    expect(extractExactQueryModel("RTX 5070 그래픽카드 비교")).toBe("RTX 5070");
    expect(extractExactQueryModel("LG 그램 16")).toBeNull();
  });

  test("condenseNaturalLanguageQuery extracts baseQuery, exclusions, hints, and aliases from long prompts", () => {
    const galaxybook = condenseNaturalLanguageQuery(
      "갤북4 프로 16 쪽으로 알아보는 중이라 파우치나 필름 같은 건 빼고 본체만 찾아줘"
    );
    const notebook = condenseNaturalLanguageQuery(
      "4060 들어간 노트북을 보는 중인데 렌탈이나 다른 급 그래픽 섞지 말고 대충 후보가 뭐가 있나 좀 볼래"
    );
    const keyboard = condenseNaturalLanguageQuery(
      "로지텍 기계식 키보드 지금 사도 될 가격인지 보고 싶은데 애매하면 재질문도 같이 줘"
    );
    const monitor = condenseNaturalLanguageQuery(
      "27인치 4K 모니터 전체를 바로 비교하는 건 넓을 수 있으니까 가능 여부 먼저 봐줘"
    );

    expect(galaxybook.baseQuery).toBe("갤럭시북4 프로 16");
    expect(galaxybook.excludedTerms).toEqual(["파우치", "필름"]);
    expect(galaxybook.normalizedAliases).toContain("갤럭시북");
    expect(galaxybook.categoryHints.laptop).toBe(true);

    expect(notebook.baseQuery).toBe("4060 노트북");
    expect(notebook.intentHints.broad).toBe(true);
    expect(notebook.categoryHints.laptop).toBe(true);

    expect(keyboard.baseQuery).toBe("로지텍 기계식 키보드");
    expect(keyboard.intentHints.explain).toBe(true);
    expect(keyboard.categoryHints.keyboard).toBe(true);

    expect(monitor.baseQuery).toBe("27인치 4K 모니터");
    expect(monitor.intentHints.compare).toBe(true);
    expect(monitor.intentHints.broad).toBe(true);
    expect(monitor.categoryHints.monitor).toBe(true);
  });

  test("condenseNaturalLanguageQuery preserves exact models inside long natural-language prompts", () => {
    expect(
      condenseNaturalLanguageQuery("NT960XGQ-A51A 이건 지금 사도 괜찮은 가격대인지 한번 설명해줘").baseQuery
    ).toBe("NT960XGQ-A51A");
    expect(condenseNaturalLanguageQuery("15IRX9 보는데 지금 들어가도 될 가격인지 너무 길지 않게 봐줘").baseQuery).toBe(
      "15IRX9"
    );
    expect(condenseNaturalLanguageQuery("Keychron K2 Pro 이건 정확히 같은 모델끼리 가격 비교해줘").baseQuery).toBe(
      "Keychron K2 Pro"
    );
    expect(condenseNaturalLanguageQuery("U2723QE 이 모델은 지금 들어가도 될 가격인지 좀 봐줘").baseQuery).toBe(
      "U2723QE"
    );
    expect(condenseNaturalLanguageQuery("9800X3D 가격 차이만 정확히 비교해줘").baseQuery).toBe("9800X3D");
    expect(
      condenseNaturalLanguageQuery("MX Mechanical Mini는 마우스 같은 거 섞지 말고 키보드 본체끼리만 비교해줘").baseQuery
    ).toBe("MX Mechanical Mini");
    expect(condenseNaturalLanguageQuery("9800X3D 가격 차이만 정확히 보고 싶어").baseQuery).toBe("9800X3D");
  });

  test("extractExactQueryModel preserves exact models inside longer prompts but keeps explicit family prompts broad", () => {
    expect(extractExactQueryModel("그램 16 중에서도 16Z90T GA5CK 이거 가격 비교만 딱 해줘")).toBe("16Z90T-GA5CK");
    expect(extractExactQueryModel("RTX 5070은 정확히 그 모델끼리만 가격 비교해줘")).toBe("RTX 5070");
    expect(extractExactQueryModel("MX Mechanical Mini는 마우스 같은 거 섞지 말고 키보드 본체끼리만 비교해줘")).toBe(
      "LOGITECH MX MECHANICAL MINI"
    );
    expect(extractExactQueryModel("9800X3D 가격 차이만 정확히 보고 싶어")).toBe("RYZEN 7 9800X3D");
    expect(extractExactQueryModel("그램 16 라인으로 보긴 하는데 모델이 많을 것 같아서, 바로 비교 말고 가능 여부부터 봐줘")).toBeNull();
    expect(extractExactQueryModel("B650 메인보드 전체 가격 비교는 너무 넓을 것 같은데 일단 가능 여부만 봐줘")).toBeNull();
  });

  test("isGraphicsDeviceLikeTitle excludes non-device graphics false positives", () => {
    expect(isGraphicsDeviceLikeTitle("RX 3i 시리즈 프로그래밍 다운로드 라 IC690USB901과 호환")).toBe(false);
    expect(isGraphicsDeviceLikeTitle("ZOTAC GAMING GeForce RTX 5070 Twin Edge OC 12GB")).toBe(true);
  });

  test("isAmbiguousComparison flags mixed model families", () => {
    expect(
      isAmbiguousComparison("rtx 5070", [
        { normalizedModel: "RTX 5070" },
        { normalizedModel: "RTX 5070 TI" }
      ])
    ).toBe(true);
  });
});
