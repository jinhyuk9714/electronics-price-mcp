import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import {
  evaluateServiceQualityCase,
  parseApiEnvelope,
  parseMcpToolResult,
  renderServiceQualityMarkdownReport,
  summarizeServiceQualityResults,
  validateServiceQualityCaseSet,
  type ServiceQualityEvalCase,
  type ServiceQualityObservation,
  type ServiceQualityReport
} from "../src/eval/serviceQualityHarness.ts";
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

type ExplainClientState = {
  client: Client;
  transport: StreamableHTTPClientTransport;
};

async function main() {
  const suiteName = resolveServiceQualitySuiteName();
  const suite = getServiceQualitySuiteConfig(suiteName);
  validateServiceQualityCaseSet(suite.cases);

  const { target, baseUrl, mcpUrl } = resolveServiceQualityExecutionConfig();
  const reportFiles = resolveServiceQualityReportFiles(target, {
    jsonReportFile: suite.jsonReportFile,
    markdownReportFile: suite.markdownReportFile
  });
  const explainState = createExplainClientFactory(mcpUrl);
  const results = [];

  for (const item of suite.cases) {
    const observation = await executeCase(item, baseUrl, explainState);
    results.push(evaluateServiceQualityCase(item, observation));
  }

  await explainState.close();

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
}

async function executeCase(
  item: ServiceQualityEvalCase,
  baseUrl: string,
  explainState: ReturnType<typeof createExplainClientFactory>
): Promise<ServiceQualityObservation> {
  try {
    if (item.executor === "search-api") {
      const query = normalizePromptForApi(item.prompt, "search-api");
      const url = new URL("/api/search", baseUrl);
      url.searchParams.set("query", query);

      const response = await fetch(url, {
        signal: AbortSignal.timeout(20_000)
      });
      return parseApiEnvelope(await response.json());
    }

    if (item.executor === "compare-api") {
      const query = normalizePromptForApi(item.prompt, "compare-api");
      const url = new URL("/api/compare", baseUrl);
      url.searchParams.set("query", query);

      const response = await fetch(url, {
        signal: AbortSignal.timeout(20_000)
      });
      return parseApiEnvelope(await response.json());
    }

    const { client } = await explainState.get();
    const result = await client.callTool({
      name: "explain_purchase_options",
      arguments: {
        query: item.prompt
      }
    });

    return parseMcpToolResult(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 평가 오류";
    return {
      summary: message,
      haystack: message,
      suggestedQueries: [],
      error: message
    };
  }
}

function normalizePromptForApi(
  prompt: string,
  executor: "search-api" | "compare-api"
): string {
  const trimmed = prompt.trim();

  if (executor === "search-api") {
    return trimmed
      .replace(/\s*(검색해\s*줘|검색해줘|검색\s*해\s*줘|찾아\s*줘|찾아줘|보여\s*줘|보여줘)\s*$/iu, "")
      .trim();
  }

  return trimmed
    .replace(/\s*(가격\s*비교해\s*줘|가격비교해줘|최저가\s*비교해\s*줘|최저가비교해줘|비교해\s*줘|비교해줘)\s*$/iu, "")
    .trim();
}

function createExplainClientFactory(mcpUrl: string) {
  let statePromise: Promise<ExplainClientState> | undefined;

  return {
    async get() {
      if (!statePromise) {
        statePromise = (async () => {
          const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));
          const client = new Client({
            name: "service-quality-eval",
            version: "0.1.0"
          });

          await client.connect(transport);

          return {
            client,
            transport
          };
        })();
      }

      return statePromise;
    },
    async close() {
      if (!statePromise) {
        return;
      }

      const state = await statePromise;

      try {
        await state.transport.terminateSession();
      } catch {
        // Some servers may not support explicit termination.
      }

      await state.transport.close();
    }
  };
}

void main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
