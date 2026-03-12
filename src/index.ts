import { Hono } from "hono";
import { cors } from "hono/cors";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { createMcpServer } from "./server/createMcpServer.js";
import { createPriceService, type PriceServiceLike } from "./server/createPriceService.js";
import type { RuntimeEnv } from "./config.js";

const SERVER_NAME = "electronics-price-mcp";
const SERVER_VERSION = "0.1.0";
const TOOL_NAMES = ["search_products", "compare_product_prices", "explain_purchase_options"];

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
    c.json({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      description: "한국 전자기기 검색과 현재 가격 비교를 위한 원격 MCP 서버",
      endpoints: {
        mcp: "/mcp",
        health: "/health"
      },
      tools: TOOL_NAMES
    })
  );

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

const app = createApp();

export default {
  fetch(request: Request, env: RuntimeEnv, executionContext: ExecutionContext) {
    void executionContext;
    return createApp({ env }).fetch(request, env);
  }
};
