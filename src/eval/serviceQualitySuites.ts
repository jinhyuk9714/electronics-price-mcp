import { SERVICE_QUALITY_100_CASES } from "../../eval-cases/service-quality-100.ts";
import { SERVICE_QUALITY_ADVANCED_100_CASES } from "../../eval-cases/service-quality-advanced-100.ts";
import type { ServiceQualityEvalCase } from "./serviceQualityHarness.js";

export type ServiceQualitySuiteName = "service-quality-100" | "service-quality-advanced-100";

export interface ServiceQualitySuiteConfig {
  name: ServiceQualitySuiteName;
  title: string;
  cases: ServiceQualityEvalCase[];
  jsonReportFile: string;
  markdownReportFile: string;
}

const SUITE_CONFIGS: Record<ServiceQualitySuiteName, ServiceQualitySuiteConfig> = {
  "service-quality-100": {
    name: "service-quality-100",
    title: "Service Quality 100 Evaluation",
    cases: SERVICE_QUALITY_100_CASES,
    jsonReportFile: "service-quality-100-latest.json",
    markdownReportFile: "service-quality-100-latest.md"
  },
  "service-quality-advanced-100": {
    name: "service-quality-advanced-100",
    title: "Service Quality Advanced 100 Evaluation",
    cases: SERVICE_QUALITY_ADVANCED_100_CASES,
    jsonReportFile: "service-quality-advanced-100-latest.json",
    markdownReportFile: "service-quality-advanced-100-latest.md"
  }
};

export function getServiceQualitySuiteConfig(
  name: ServiceQualitySuiteName = "service-quality-100"
): ServiceQualitySuiteConfig {
  return SUITE_CONFIGS[name];
}

export function resolveServiceQualitySuiteName(
  argv: string[] = process.argv.slice(2),
  env: Record<string, string | undefined> = process.env
): ServiceQualitySuiteName {
  const inlineArg = argv.find((item) => item.startsWith("--suite="));
  const inlineValue = inlineArg?.split("=")[1]?.trim();

  const flagIndex = argv.findIndex((item) => item === "--suite");
  const nextValue = flagIndex >= 0 ? argv[flagIndex + 1]?.trim() : undefined;

  const requestedSuite =
    inlineValue || nextValue || env.SERVICE_QUALITY_SUITE?.trim() || "service-quality-100";

  if (requestedSuite !== "service-quality-100" && requestedSuite !== "service-quality-advanced-100") {
    throw new Error(`지원하지 않는 평가셋입니다: ${requestedSuite}`);
  }

  return requestedSuite;
}
