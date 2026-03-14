import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { MULTISOURCE_MERGE_CASES } from "../eval-cases/multisource-merge-v1.ts";
import {
  evaluateMultisourceMergeCase,
  executeMultisourceMergeCase,
  renderMultisourceMergeMarkdownReport,
  summarizeMultisourceMergeResults,
  type MultisourceMergeReport
} from "../src/eval/multisourceMergeHarness.ts";
import {
  resolveStrictMode,
  shouldFailMultisourceMergeGate
} from "../src/eval/evalExitPolicy.ts";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = resolve(SCRIPT_DIR, "../reports");
const JSON_REPORT_FILE = "multisource-merge-latest.json";
const MARKDOWN_REPORT_FILE = "multisource-merge-latest.md";

async function main() {
  const strict = resolveStrictMode();
  const results = [];

  for (const item of MULTISOURCE_MERGE_CASES) {
    const observation = await executeMultisourceMergeCase(item);
    results.push(evaluateMultisourceMergeCase(item, observation));
  }

  const report: MultisourceMergeReport = {
    title: "Multisource Merge Evaluation",
    generatedAt: new Date().toISOString(),
    totals: summarizeMultisourceMergeResults(results),
    results
  };

  await mkdir(REPORTS_DIR, { recursive: true });

  const jsonReportPath = resolve(REPORTS_DIR, JSON_REPORT_FILE);
  const markdownReportPath = resolve(REPORTS_DIR, MARKDOWN_REPORT_FILE);

  await writeFile(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(markdownReportPath, `${renderMultisourceMergeMarkdownReport(report)}\n`, "utf8");

  console.log(`Saved JSON report to ${jsonReportPath}`);
  console.log(`Saved Markdown report to ${markdownReportPath}`);
  console.log(`Summary: ${report.totals.pass} pass / ${report.totals.fail} fail`);

  if (shouldFailMultisourceMergeGate(report.totals, strict)) {
    console.error("Strict multisource-merge gate failed.");
    process.exitCode = 1;
  }
}

void main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
