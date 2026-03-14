import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { createMcpServer } from "./server/createMcpServer.js";
import { createPriceService, type PriceServiceLike } from "./server/createPriceService.js";
import { readConfig, type RuntimeEnv } from "./config.js";
import type { ProviderRequestDiagnostics } from "./domain/providerDiagnostics.js";
import { readProviderDiagnostics } from "./domain/providerDiagnostics.js";
import type {
  CompareProductPricesInput,
  CompareProductPricesResult,
  ExplainPurchaseOptionsInput,
  ExplainPurchaseOptionsResult,
  ProductCategory,
  SearchProductsInput,
  SearchProductsResult,
  SearchSort
} from "./domain/types.js";
import { createOpenApiDocument, createOpenApiYaml } from "./pages/openapi.js";
import { generatePromptText } from "./pages/prompt.js";
import { getPrivacyText } from "./pages/privacy.js";
import {
  DurableObjectRateLimiter,
  RateLimiterDurableObject,
  type RateLimitRouteGroup,
  type RateLimiter,
  createRateLimitKey
} from "./runtime/rateLimit.js";

const SERVER_NAME = "electronics-price-mcp";
const SERVER_VERSION = "0.1.0";
const TOOL_NAMES = ["search_products", "compare_product_prices", "explain_purchase_options"];
const EXAMPLE_QUESTIONS = ["그램 16 검색해 줘", "RTX 5070 가격 비교해 줘", "무선 기계식 키보드 검색해 줘"];
const DEFAULT_RETRY_AFTER_SECONDS = 60;

const RATE_LIMIT_POLICIES: Record<RateLimitRouteGroup, { maxRequests: number; windowMs: number }> = {
  "api-search": {
    maxRequests: 60,
    windowMs: 60_000
  },
  "api-compare": {
    maxRequests: 60,
    windowMs: 60_000
  },
  mcp: {
    maxRequests: 120,
    windowMs: 60_000
  }
};

type AppOptions = {
  service?: PriceServiceLike;
  env?: RuntimeEnv;
  rateLimiter?: RateLimiter;
  requestIdFactory?: (request: Request) => string;
  logger?: Pick<Console, "log" | "error">;
};

type AppVariables = {
  requestId: string;
  routeGroup: RateLimitRouteGroup | "none";
  tool: string;
  resultStatus: string;
  rateLimited: boolean;
  upstreamError: boolean;
  providerStatuses: Record<string, string> | null;
  providerOfferCounts: Record<string, number> | null;
  partialProviderFailure: boolean;
};

export function createApp(options?: AppOptions) {
  const logger = options?.logger ?? console;
  const app = new Hono<{ Bindings: RuntimeEnv; Variables: AppVariables }>();

  app.use("*", async (c, next) => {
    const startedAt = Date.now();
    const requestId = createRequestId(c.req.raw, options?.requestIdFactory);

    c.set("requestId", requestId);
    c.set("routeGroup", "none");
    c.set("tool", "http-api");
    c.set("resultStatus", "ok");
    c.set("rateLimited", false);
    c.set("upstreamError", false);
    c.set("providerStatuses", null);
    c.set("providerOfferCounts", null);
    c.set("partialProviderFailure", false);

    let response: Response;

    try {
      await next();
      response = c.res;
    } catch (error) {
      c.set("resultStatus", "error");
      c.set("upstreamError", true);
      response = c.json(
        createErrorEnvelope(
          "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          requestId
        ),
        500
      );
      c.res = response;
    }

    response.headers.set("X-Request-Id", requestId);
    logRequest(c, response.status, startedAt, logger);

    return response;
  });

  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "mcp-session-id", "Last-Event-ID", "mcp-protocol-version"],
      exposeHeaders: ["mcp-session-id", "mcp-protocol-version", "X-Request-Id", "Retry-After"]
    })
  );

  app.use("*", async (c, next) => {
    const routeGroup = getRateLimitRouteGroup(new URL(c.req.url).pathname);
    c.set("routeGroup", routeGroup ?? "none");

    if (!routeGroup) {
      return next();
    }

    const rateLimiter = resolveRateLimiter(options?.rateLimiter, options?.env ?? c.env);
    if (!rateLimiter) {
      return next();
    }

    const clientIp = getClientIp(c.req.raw.headers);
    const policy = RATE_LIMIT_POLICIES[routeGroup];
    const decision = await rateLimiter.check({
      key: createRateLimitKey(clientIp, routeGroup),
      maxRequests: policy.maxRequests,
      windowMs: policy.windowMs
    });

    if (decision.allowed) {
      return next();
    }

    c.set("rateLimited", true);
    c.set("resultStatus", "error");

    const response = c.json(
      createErrorEnvelope(
        "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
        c.get("requestId"),
        "RATE_LIMITED"
      ),
      429
    );
    response.headers.set("Retry-After", String(decision.retryAfterSeconds || DEFAULT_RETRY_AFTER_SECONDS));
    return response;
  });

  app.get("/", (c) => c.json(createRootMetadata(options?.env ?? c.env)));

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

  app.get("/openapi.json", (c) => c.json(createOpenApiDocument(new URL(c.req.url).origin)));

  app.get("/openapi.yaml", (c) =>
    c.text(createOpenApiYaml(new URL(c.req.url).origin), 200, {
      "content-type": "application/yaml; charset=utf-8"
    })
  );

  app.get("/api/search", async (c) => {
    c.set("tool", "search_products");

    const env = options?.env ?? c.env;
    const config = readConfig(env);
    const baseService = options?.service ?? createPriceService(env);
    const service = createInstrumentedService(baseService, c);

    if (!options?.service && !hasRequiredApiConfig(config)) {
      c.set("resultStatus", "error");
      return c.json(createUnavailableResponse(c.get("requestId")), 503);
    }

    const query = c.req.query("query")?.trim();
    if (!query) {
      c.set("resultStatus", "error");
      return c.json(createBadRequestResponse("query 파라미터를 입력해 주세요.", c.get("requestId")), 400);
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
    c.set("tool", "compare_product_prices");

    const env = options?.env ?? c.env;
    const config = readConfig(env);
    const baseService = options?.service ?? createPriceService(env);
    const service = createInstrumentedService(baseService, c);

    if (!options?.service && !hasRequiredApiConfig(config)) {
      c.set("resultStatus", "error");
      return c.json(createUnavailableResponse(c.get("requestId")), 503);
    }

    const query = c.req.query("query")?.trim();
    const productId = c.req.query("productId")?.trim();
    if (!query && !productId) {
      c.set("resultStatus", "error");
      return c.json(
        createBadRequestResponse("query 또는 productId 중 하나는 필요합니다.", c.get("requestId")),
        400
      );
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
    const env = options?.env ?? c.env;
    const baseService = options?.service ?? createPriceService(env);
    const service = createInstrumentedService(baseService, c);
    const transport = new WebStandardStreamableHTTPServerTransport();
    const server = await createMcpServer({
      env,
      service
    });

    await server.connect(transport);
    return transport.handleRequest(c.req.raw);
  });

  return app;
}

function createInstrumentedService(
  service: PriceServiceLike,
  c: Context<{ Bindings: RuntimeEnv; Variables: AppVariables }>
): PriceServiceLike {
  return {
    async searchProducts(input: SearchProductsInput): Promise<SearchProductsResult> {
      c.set("tool", "search_products");

      try {
        const result = await service.searchProducts(input);
        applyProviderDiagnostics(c, service, result);
        c.set("resultStatus", result.offers.length > 0 ? "ok" : "not_found");
        return result;
      } catch (error) {
        c.set("resultStatus", "error");
        c.set("upstreamError", true);
        throw error;
      }
    },
    async compareProductPrices(input: CompareProductPricesInput): Promise<CompareProductPricesResult> {
      c.set("tool", "compare_product_prices");

      try {
        const result = await service.compareProductPrices(input);
        applyProviderDiagnostics(c, service, result);
        c.set("resultStatus", result.status);
        return result;
      } catch (error) {
        c.set("resultStatus", "error");
        c.set("upstreamError", true);
        throw error;
      }
    },
    async explainPurchaseOptions(input: ExplainPurchaseOptionsInput): Promise<ExplainPurchaseOptionsResult> {
      c.set("tool", "explain_purchase_options");

      try {
        const result = await service.explainPurchaseOptions(input);
        applyProviderDiagnostics(c, service, result);
        c.set("resultStatus", result.status);
        return result;
      } catch (error) {
        c.set("resultStatus", "error");
        c.set("upstreamError", true);
        throw error;
      }
    }
  };
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

function applyProviderDiagnostics(
  c: Context<{ Bindings: RuntimeEnv; Variables: AppVariables }>,
  service: PriceServiceLike,
  result: { [key: string]: unknown }
) {
  const diagnostics =
    service.getLastProviderDiagnostics?.() ??
    readProviderDiagnostics(result) ??
    null;

  c.set("providerStatuses", diagnostics?.providerStatuses ?? null);
  c.set("providerOfferCounts", diagnostics?.providerOfferCounts ?? null);
  c.set("partialProviderFailure", diagnostics?.partialProviderFailure ?? false);
}

function resolveRateLimiter(customRateLimiter: RateLimiter | undefined, env?: RuntimeEnv) {
  if (customRateLimiter) {
    return customRateLimiter;
  }

  if (env?.ELECTRONICS_RATE_LIMITER) {
    return new DurableObjectRateLimiter(env.ELECTRONICS_RATE_LIMITER);
  }

  return undefined;
}

function getRateLimitRouteGroup(pathname: string): RateLimitRouteGroup | null {
  if (pathname === "/api/search") {
    return "api-search";
  }

  if (pathname === "/api/compare") {
    return "api-compare";
  }

  if (pathname === "/mcp") {
    return "mcp";
  }

  return null;
}

function createRequestId(request: Request, requestIdFactory?: (request: Request) => string) {
  return requestIdFactory?.(request) ?? request.headers.get("cf-ray") ?? crypto.randomUUID();
}

function getClientIp(headers: Headers) {
  const cfConnectingIp = headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded) {
    return "unknown";
  }

  return forwarded.split(",")[0]?.trim() || "unknown";
}

function logRequest(
  c: Context<{ Bindings: RuntimeEnv; Variables: AppVariables }>,
  statusCode: number,
  startedAt: number,
  logger: Pick<Console, "log" | "error">
) {
  const entry = {
    requestId: c.get("requestId"),
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    routeGroup: c.get("routeGroup"),
    statusCode,
    latencyMs: Date.now() - startedAt,
    rateLimited: c.get("rateLimited"),
    tool: c.get("tool"),
    resultStatus: c.get("resultStatus"),
    upstreamError: c.get("upstreamError"),
    providerStatuses: c.get("providerStatuses"),
    providerOfferCounts: c.get("providerOfferCounts"),
    partialProviderFailure: c.get("partialProviderFailure")
  };

  const serialized = JSON.stringify(entry);
  if (entry.upstreamError || statusCode >= 500) {
    logger.error(serialized);
    return;
  }

  logger.log(serialized);
}

function createErrorEnvelope(message: string, requestId: string, code?: string) {
  return {
    success: false,
    error: {
      ...(code ? { code } : {}),
      message,
      requestId
    }
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

function hasRequiredApiConfig(config: {
  naverClientId?: string;
  naverClientSecret?: string;
  enableDanawa?: boolean;
  enableStaticCatalog?: boolean;
  danawaClientId?: string;
  danawaClientSecret?: string;
}) {
  return Boolean(
    (config.naverClientId && config.naverClientSecret) ||
      (config.enableDanawa && config.danawaClientId && config.danawaClientSecret) ||
      config.enableStaticCatalog
  );
}

function createUnavailableResponse(requestId: string) {
  return createErrorEnvelope(
    "NAVER_CLIENT_ID/NAVER_CLIENT_SECRET 또는 ENABLE_DANAWA=true와 DANAWA_CLIENT_ID/DANAWA_CLIENT_SECRET을 설정한 뒤 다시 시도해 주세요.",
    requestId
  );
}

function createBadRequestResponse(message: string, requestId: string) {
  return createErrorEnvelope(message, requestId);
}

const app = createApp();

export { RateLimiterDurableObject };

export default {
  fetch(request: Request, env: RuntimeEnv, executionContext: ExecutionContext) {
    void executionContext;
    return createApp({ env }).fetch(request, env);
  }
};
