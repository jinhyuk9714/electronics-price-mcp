import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { SERVICE_QUALITY_ADVANCED_100_CASES } from "../../eval-cases/service-quality-advanced-100.js";
import { validateServiceQualityCaseSet } from "../../src/eval/serviceQualityHarness.js";
import {
  getServiceQualitySuiteConfig,
  resolveServiceQualitySuiteName
} from "../../src/eval/serviceQualitySuites.js";
import {
  getServiceQualityTargetConfig,
  resolveServiceQualityReportFiles,
  resolveServiceQualityExecutionConfig,
  resolveServiceQualityTargetName
} from "../../src/eval/serviceQualityTargets.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

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

  test("service quality target config exposes production and canary endpoints", () => {
    expect(getServiceQualityTargetConfig("production")).toMatchObject({
      name: "production",
      baseUrl: "https://electronics-price-mcp.jinhyuk9714.workers.dev",
      mcpUrl: "https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp"
    });

    expect(getServiceQualityTargetConfig("danawa-canary")).toMatchObject({
      name: "danawa-canary",
      baseUrl: "https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev",
      mcpUrl: "https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev/mcp"
    });

    expect(getServiceQualityTargetConfig("static-canary-local")).toMatchObject({
      name: "static-canary-local",
      baseUrl: "static-canary-local://local",
      mcpUrl: "static-canary-local://local/mcp"
    });
  });

  test("service quality target resolver supports argv and environment overrides", () => {
    expect(resolveServiceQualityTargetName(["--target", "danawa-canary"], {})).toBe("danawa-canary");
    expect(resolveServiceQualityTargetName(["--target", "static-canary-local"], {})).toBe(
      "static-canary-local"
    );
    expect(resolveServiceQualityTargetName([], { SERVICE_QUALITY_TARGET: "danawa-canary" })).toBe(
      "danawa-canary"
    );
    expect(resolveServiceQualityTargetName([], {})).toBe("production");
  });

  test("execution config uses target defaults but lets explicit URLs win", () => {
    expect(resolveServiceQualityExecutionConfig(["--target", "danawa-canary"], {})).toMatchObject({
      target: "danawa-canary",
      baseUrl: "https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev",
      mcpUrl: "https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev/mcp"
    });

    expect(resolveServiceQualityExecutionConfig(["--target", "static-canary-local"], {})).toMatchObject({
      target: "static-canary-local",
      baseUrl: "static-canary-local://local",
      mcpUrl: "static-canary-local://local/mcp"
    });

    expect(
      resolveServiceQualityExecutionConfig([], {
        SERVICE_QUALITY_TARGET: "danawa-canary",
        SERVICE_QUALITY_BASE_URL: "https://override.example.com",
        SERVICE_QUALITY_MCP_URL: "https://override.example.com/custom-mcp"
      })
    ).toMatchObject({
      target: "danawa-canary",
      baseUrl: "https://override.example.com",
      mcpUrl: "https://override.example.com/custom-mcp"
    });
  });

  test("report filenames stay separate for canary evaluations", () => {
    expect(
      resolveServiceQualityReportFiles("production", {
        jsonReportFile: "service-quality-100-latest.json",
        markdownReportFile: "service-quality-100-latest.md"
      })
    ).toEqual({
      jsonReportFile: "service-quality-100-latest.json",
      markdownReportFile: "service-quality-100-latest.md"
    });

    expect(
      resolveServiceQualityReportFiles("danawa-canary", {
        jsonReportFile: "service-quality-100-latest.json",
        markdownReportFile: "service-quality-100-latest.md"
      })
    ).toEqual({
      jsonReportFile: "danawa-canary-service-quality-100-latest.json",
      markdownReportFile: "danawa-canary-service-quality-100-latest.md"
    });

    expect(
      resolveServiceQualityReportFiles("static-canary-local", {
        jsonReportFile: "service-quality-100-latest.json",
        markdownReportFile: "service-quality-100-latest.md"
      })
    ).toEqual({
      jsonReportFile: "static-canary-service-quality-100-latest.json",
      markdownReportFile: "static-canary-service-quality-100-latest.md"
    });
  });

  test("package exposes strict service-quality scripts for gates", () => {
    const packageJson = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["eval:service-quality:strict"]).toBe(
      "EVAL_STRICT=true tsx scripts/run-service-quality-eval.ts"
    );
    expect(packageJson.scripts?.["eval:service-quality:advanced:strict"]).toBe(
      "EVAL_STRICT=true tsx scripts/run-service-quality-eval.ts --suite service-quality-advanced-100"
    );
    expect(packageJson.scripts?.["eval:service-quality:canary:strict"]).toBe(
      "EVAL_STRICT=true SERVICE_QUALITY_TARGET=danawa-canary tsx scripts/run-service-quality-eval.ts"
    );
    expect(packageJson.scripts?.["eval:service-quality:advanced:canary:strict"]).toBe(
      "EVAL_STRICT=true SERVICE_QUALITY_TARGET=danawa-canary tsx scripts/run-service-quality-eval.ts --suite service-quality-advanced-100"
    );
    expect(packageJson.scripts?.["eval:service-quality:static:strict"]).toBe(
      "EVAL_STRICT=true SERVICE_QUALITY_TARGET=static-canary-local tsx scripts/run-service-quality-eval.ts"
    );
    expect(packageJson.scripts?.["eval:service-quality:advanced:static:strict"]).toBe(
      "EVAL_STRICT=true SERVICE_QUALITY_TARGET=static-canary-local tsx scripts/run-service-quality-eval.ts --suite service-quality-advanced-100"
    );
  });
});
