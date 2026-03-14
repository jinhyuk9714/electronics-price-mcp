import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateServiceQualityCase,
  renderServiceQualityMarkdownReport,
  summarizeServiceQualityResults,
  validateServiceQualityCaseSet,
  type ServiceQualityReport
} from "../src/eval/serviceQualityHarness.ts";
import {
  resolveStrictMode,
  shouldFailServiceQualityGate
} from "../src/eval/evalExitPolicy.ts";
import { createServiceQualityExecutor } from "../src/eval/serviceQualityExecution.ts";
import {
  getServiceQualitySuiteConfig,
  resolveServiceQualitySuiteName
} from "../src/eval/serviceQualitySuites.ts";
import {
  resolveServiceQualityExecutionConfig,
  resolveServiceQualityReportFiles
} from "../src/eval/serviceQualityTargets.ts";
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = resolve(SCRIPT_DIR, "../reports");

async function main() {
  const strict = resolveStrictMode();
  const suiteName = resolveServiceQualitySuiteName();
  const suite = getServiceQualitySuiteConfig(suiteName);
  validateServiceQualityCaseSet(suite.cases);

  const executionConfig = resolveServiceQualityExecutionConfig();
  const { target, baseUrl, mcpUrl } = executionConfig;
  const reportFiles = resolveServiceQualityReportFiles(target, {
    jsonReportFile: suite.jsonReportFile,
    markdownReportFile: suite.markdownReportFile
  });
  const executor = createServiceQualityExecutor(executionConfig);
  const results = [];

  for (const item of suite.cases) {
    const observation = await executor.executeCase(item);
    results.push(evaluateServiceQualityCase(item, observation));
  }

  await executor.close();

  const report: ServiceQualityReport = {
    title: suite.title,
    generatedAt: new Date().toISOString(),
    baseUrl,
    mcpUrl,
    totals: summarizeServiceQualityResults(results),
    results
  };

  const serializedReport = {
    ...report,
    results: report.results.map((item) => ({
      ...item,
      expected_behavior: item.expectedBehavior,
      observed_summary: item.observedSummary
    }))
  };

  const jsonReportPath = resolve(REPORTS_DIR, reportFiles.jsonReportFile);
  const markdownReportPath = resolve(REPORTS_DIR, reportFiles.markdownReportFile);

  await mkdir(REPORTS_DIR, { recursive: true });
  await writeFile(jsonReportPath, `${JSON.stringify(serializedReport, null, 2)}\n`, "utf8");
  await writeFile(markdownReportPath, `${renderServiceQualityMarkdownReport(report)}\n`, "utf8");

  console.log(`Saved JSON report to ${jsonReportPath}`);
  console.log(`Saved Markdown report to ${markdownReportPath}`);
  console.log(
    `Summary: ${report.totals.pass} pass / ${report.totals.softFail} soft_fail / ${report.totals.fail} fail`
  );

  if (shouldFailServiceQualityGate(report.totals, strict)) {
    console.error("Strict service-quality gate failed.");
    process.exitCode = 1;
  }
}

void main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
