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
});
