export interface RuntimeConfig {
  naverClientId?: string;
  naverClientSecret?: string;
  requestTimeoutMs: number;
  cacheTtlMs: number;
  publicBaseUrl: string;
  chatgptAppUrl?: string;
}

export interface RuntimeEnv {
  NAVER_CLIENT_ID?: string;
  NAVER_CLIENT_SECRET?: string;
  REQUEST_TIMEOUT_MS?: string;
  CACHE_TTL_MS?: string;
  PUBLIC_BASE_URL?: string;
  CHATGPT_APP_URL?: string;
  ELECTRONICS_RATE_LIMITER?: DurableObjectNamespace;
  [key: string]: string | DurableObjectNamespace | undefined;
}

export const DEFAULT_PUBLIC_BASE_URL = "https://electronics-price-mcp.jinhyuk9714.workers.dev";

export function readConfig(env?: RuntimeEnv): RuntimeConfig {
  return {
    naverClientId: env?.NAVER_CLIENT_ID,
    naverClientSecret: env?.NAVER_CLIENT_SECRET,
    requestTimeoutMs: readNumber(env?.REQUEST_TIMEOUT_MS, 8000),
    cacheTtlMs: readNumber(env?.CACHE_TTL_MS, 5 * 60 * 1000),
    publicBaseUrl: env?.PUBLIC_BASE_URL || DEFAULT_PUBLIC_BASE_URL,
    chatgptAppUrl: env?.CHATGPT_APP_URL
  };
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
