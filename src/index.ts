import { Hono } from "hono";
import { cors } from "hono/cors";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { createMcpServer } from "./server/createMcpServer.js";
import { createPriceService, type PriceServiceLike } from "./server/createPriceService.js";
import { readConfig, type RuntimeEnv } from "./config.js";
import type { ProductCategory, SearchSort } from "./domain/types.js";
import { createOpenApiDocument, createOpenApiYaml } from "./pages/openapi.js";
import { generatePromptText } from "./pages/prompt.js";
import { getPrivacyText } from "./pages/privacy.js";

const SERVER_NAME = "electronics-price-mcp";
const SERVER_VERSION = "0.1.0";
const TOOL_NAMES = ["search_products", "compare_product_prices", "explain_purchase_options"];
const EXAMPLE_QUESTIONS = ["그램 16 검색해 줘", "RTX 5070 가격 비교해 줘", "무선 기계식 키보드 검색해 줘"];

type AppOptions = {
  service?: PriceServiceLike;
  env?: RuntimeEnv;
};

export function createApp(options?: AppOptions) {
  const app = new Hono<{ Bindings: RuntimeEnv }>();

  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "mcp-session-id", "Last-Event-ID", "mcp-protocol-version"],
      exposeHeaders: ["mcp-session-id", "mcp-protocol-version"]
    })
  );

  app.get("/", (c) =>
    c.json(createRootMetadata(options?.env ?? c.env))
  );

  app.get("/prompt", (c) =>
    c.text(generatePromptText(new URL(c.req.url).origin), 200, {
      "content-type": "text/markdown; charset=utf-8"
    })
  );

  app.get("/privacy", (c) =>
    c.text(getPrivacyText(), 200, {
      "content-type": "text/markdown; charset=utf-8"
    })
  );

  app.get("/openapi.json", (c) =>
    c.json(createOpenApiDocument(new URL(c.req.url).origin))
  );

  app.get("/openapi.yaml", (c) =>
    c.text(createOpenApiYaml(new URL(c.req.url).origin), 200, {
      "content-type": "application/yaml; charset=utf-8"
    })
  );

  app.get("/api/search", async (c) => {
    const env = options?.env ?? c.env;
    const config = readConfig(env);
    const service = options?.service ?? createPriceService(env);

    if (!options?.service && !hasRequiredApiConfig(config.naverClientId, config.naverClientSecret)) {
      return c.json(createUnavailableResponse(), 503);
    }

    const query = c.req.query("query")?.trim();
    if (!query) {
      return c.json(createBadRequestResponse("query 파라미터를 입력해 주세요."), 400);
    }

    const result = await service.searchProducts({
      query,
      category: parseCategory(c.req.query("category")),
      budgetMax: parseOptionalNumber(c.req.query("budgetMax")),
      sort: parseSort(c.req.query("sort")),
      excludeUsed: parseBoolean(c.req.query("excludeUsed"), true),
      limit: parseOptionalNumber(c.req.query("limit")) ?? 10
    });

    return c.json({
      success: true,
      data: result,
      meta: {
        tool: "search_products",
        baseUrl: new URL(c.req.url).origin
      }
    });
  });

  app.get("/api/compare", async (c) => {
    const env = options?.env ?? c.env;
    const config = readConfig(env);
    const service = options?.service ?? createPriceService(env);

    if (!options?.service && !hasRequiredApiConfig(config.naverClientId, config.naverClientSecret)) {
      return c.json(createUnavailableResponse(), 503);
    }

    const query = c.req.query("query")?.trim();
    const productId = c.req.query("productId")?.trim();
    if (!query && !productId) {
      return c.json(createBadRequestResponse("query 또는 productId 중 하나는 필요합니다."), 400);
    }

    const result = await service.compareProductPrices({
      query,
      productId,
      maxOffers: parseOptionalNumber(c.req.query("maxOffers")) ?? undefined
    });

    return c.json({
      success: true,
      data: result,
      meta: {
        tool: "compare_product_prices",
        baseUrl: new URL(c.req.url).origin
      }
    });
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.all("/mcp", async (c) => {
    const transport = new WebStandardStreamableHTTPServerTransport();
    const env = options?.env ?? c.env;
    const service = options?.service ?? createPriceService(env);
    const server = await createMcpServer({
      env,
      service
    });

    await server.connect(transport);
    return transport.handleRequest(c.req.raw);
  });

  return app;
}

function createRootMetadata(env?: RuntimeEnv) {
  const config = readConfig(env);

  return {
      name: SERVER_NAME,
      version: SERVER_VERSION,
      description: "한국 전자기기 검색과 현재 가격 비교를 위한 원격 MCP 서버",
      endpoints: {
        mcp: "/mcp",
        health: "/health",
        prompt: "/prompt",
        openapi: "/openapi.json",
        privacy: "/privacy"
      },
      links: {
        homepage: config.publicBaseUrl,
        mcp: `${config.publicBaseUrl}/mcp`,
        prompt: `${config.publicBaseUrl}/prompt`,
        openapi: `${config.publicBaseUrl}/openapi.json`,
        privacy: `${config.publicBaseUrl}/privacy`,
        ...(config.chatgptAppUrl ? { chatgptApp: config.chatgptAppUrl } : {})
      },
      tools: TOOL_NAMES,
      exampleQuestions: EXAMPLE_QUESTIONS
    };
}

function parseSort(value: string | undefined): SearchSort {
  if (value === "price_asc" || value === "price_desc") {
    return value;
  }

  return "relevance";
}

function parseCategory(value: string | undefined): ProductCategory | undefined {
  if (
    value === "laptop" ||
    value === "keyboard" ||
    value === "graphics-card" ||
    value === "monitor" ||
    value === "pc-part"
  ) {
    return value;
  }

  return undefined;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  return value !== "false";
}

function hasRequiredApiConfig(clientId?: string, clientSecret?: string) {
  return Boolean(clientId && clientSecret);
}

function createUnavailableResponse() {
  return {
    success: false,
    error: {
      message: "NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 설정한 뒤 다시 시도해 주세요."
    }
  };
}

function createBadRequestResponse(message: string) {
  return {
    success: false,
    error: {
      message
    }
  };
}

const app = createApp();

export default {
  fetch(request: Request, env: RuntimeEnv, executionContext: ExecutionContext) {
    void executionContext;
    return createApp({ env }).fetch(request, env);
  }
};
