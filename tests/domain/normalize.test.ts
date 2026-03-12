import { describe, expect, test } from "vitest";

import {
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

  test("isAmbiguousComparison flags mixed model families", () => {
    expect(
      isAmbiguousComparison("rtx 5070", [
        { normalizedModel: "RTX 5070" },
        { normalizedModel: "RTX 5070 TI" }
      ])
    ).toBe(true);
  });
});
