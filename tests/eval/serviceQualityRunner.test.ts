import { describe, expect, test } from "vitest";

import { SERVICE_QUALITY_ADVANCED_100_CASES } from "../../eval-cases/service-quality-advanced-100.js";
import { validateServiceQualityCaseSet } from "../../src/eval/serviceQualityHarness.js";
import {
  getServiceQualitySuiteConfig,
  resolveServiceQualitySuiteName
} from "../../src/eval/serviceQualitySuites.js";

describe("service quality suite runner", () => {
  test("advanced service quality case set stays balanced at 100 cases", () => {
    expect(() => validateServiceQualityCaseSet(SERVICE_QUALITY_ADVANCED_100_CASES)).not.toThrow();
    expect(SERVICE_QUALITY_ADVANCED_100_CASES).toHaveLength(100);
  });

  test("suite config returns separate advanced report paths", () => {
    const baseSuite = getServiceQualitySuiteConfig("service-quality-100");
    const advancedSuite = getServiceQualitySuiteConfig("service-quality-advanced-100");

    expect(baseSuite.name).toBe("service-quality-100");
    expect(baseSuite.jsonReportFile).toBe("service-quality-100-latest.json");
    expect(baseSuite.markdownReportFile).toBe("service-quality-100-latest.md");

    expect(advancedSuite.name).toBe("service-quality-advanced-100");
    expect(advancedSuite.jsonReportFile).toBe("service-quality-advanced-100-latest.json");
    expect(advancedSuite.markdownReportFile).toBe("service-quality-advanced-100-latest.md");
    expect(advancedSuite.cases).toHaveLength(100);
  });

  test("suite resolver supports argv and environment overrides", () => {
    expect(resolveServiceQualitySuiteName(["--suite", "service-quality-advanced-100"], {})).toBe(
      "service-quality-advanced-100"
    );
    expect(resolveServiceQualitySuiteName([], { SERVICE_QUALITY_SUITE: "service-quality-advanced-100" })).toBe(
      "service-quality-advanced-100"
    );
    expect(resolveServiceQualitySuiteName([], {})).toBe("service-quality-100");
  });

  test("advanced suite can override expectations for mismatched prompts", () => {
    const boardCompare = SERVICE_QUALITY_ADVANCED_100_CASES.find((item) => item.id === "pc-part-exact-compare-1");
    const powerExplain = SERVICE_QUALITY_ADVANCED_100_CASES.find((item) => item.id === "pc-part-purchase-explain-2");
    const cpuExplain = SERVICE_QUALITY_ADVANCED_100_CASES.find((item) => item.id === "pc-part-purchase-explain-3");
    const ssdExplain = SERVICE_QUALITY_ADVANCED_100_CASES.find((item) => item.id === "pc-part-purchase-explain-4");

    expect(boardCompare).toMatchObject({
      prompt: "ASUS TUF B650M-PLUS는 정확 모델 기준으로 가격 비교해줘",
      expectedStatus: "ok"
    });
    expect(boardCompare?.mustContain).toEqual(expect.arrayContaining(["B650M-PLUS", "ASUS"]));

    expect(powerExplain).toMatchObject({
      expectedStatus: "ambiguous",
      needsSuggestedQueries: true
    });
    expect(powerExplain?.mustContain).toEqual(expect.arrayContaining(["정확히 같은 모델"]));

    expect(cpuExplain).toMatchObject({
      expectedStatus: "ok",
      needsSuggestedQueries: false
    });
    expect(cpuExplain?.mustContain).toEqual(expect.arrayContaining(["9800X3D", "Ryzen"]));

    expect(ssdExplain).toMatchObject({
      expectedStatus: "ok",
      needsSuggestedQueries: false
    });
    expect(ssdExplain?.mustContain).toEqual(expect.arrayContaining(["SN850X", "2TB"]));
  });
});
