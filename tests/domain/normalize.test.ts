import { describe, expect, test } from "vitest";

import {
  extractGpuModel,
  extractExactQueryModel,
  extractNotebookFamilyKey,
  extractNormalizedModel,
  extractNotebookModelCode,
  extractRequestedNotebookGpuModel,
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

  test("extractExactQueryModel only marks exact-model queries", () => {
    expect(extractExactQueryModel("RTX 5070")).toBe("RTX 5070");
    expect(extractExactQueryModel("16Z90T GA5CK 최저가 비교")).toBe("16Z90T-GA5CK");
    expect(extractExactQueryModel("RTX 5070 시리즈 가격 비교")).toBeNull();
    expect(extractExactQueryModel("LG 그램 16")).toBeNull();
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
