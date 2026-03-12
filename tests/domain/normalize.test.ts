import { describe, expect, test } from "vitest";

import {
  extractExactQueryModel,
  extractNormalizedModel,
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
