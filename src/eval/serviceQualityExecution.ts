import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import {
  parseApiEnvelope,
  parseMcpToolResult,
  type ServiceQualityEvalCase,
  type ServiceQualityObservation
} from "./serviceQualityHarness.js";
import type { ServiceQualityExecutionConfig } from "./serviceQualityTargets.js";
import { createPriceService, type PriceServiceLike } from "../server/createPriceService.js";

type ExplainClientState = {
  client: Client;
  transport: StreamableHTTPClientTransport;
};

export interface ServiceQualityExecutor {
  executeCase(item: ServiceQualityEvalCase): Promise<ServiceQualityObservation>;
  close(): Promise<void>;
}

export function createServiceQualityExecutor(
  config: ServiceQualityExecutionConfig
): ServiceQualityExecutor {
  if (config.mode === "static-local") {
    const service = createPriceService(config.localEnv as never);

    return {
      async executeCase(item) {
        return executeLocalCase(item, service);
      },
      async close() {}
    };
  }

  const explainState = createExplainClientFactory(config.mcpUrl);

  return {
    async executeCase(item) {
      return executeLiveCase(item, config.baseUrl, explainState);
    },
    async close() {
      await explainState.close();
    }
  };
}

async function executeLocalCase(
  item: ServiceQualityEvalCase,
  service: PriceServiceLike
): Promise<ServiceQualityObservation> {
  try {
    if (item.executor === "search-api") {
      const result = await service.searchProducts({
        query: normalizePromptForApi(item.prompt, "search-api"),
        sort: "relevance",
        excludeUsed: true,
        limit: 50
      });

      return parseApiEnvelope({
        success: true,
        data: result
      });
    }

    if (item.executor === "compare-api") {
      const result = await service.compareProductPrices({
        query: normalizePromptForApi(item.prompt, "compare-api")
      });

      return parseApiEnvelope({
        success: true,
        data: result
      });
    }

    const result = await service.explainPurchaseOptions({
      query: item.prompt
    });

    return parseApiEnvelope({
      success: true,
      data: result
    });
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

async function executeLiveCase(
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
