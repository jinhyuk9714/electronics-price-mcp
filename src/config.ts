export interface RuntimeConfig {
  naverClientId?: string;
  naverClientSecret?: string;
  requestTimeoutMs: number;
  cacheTtlMs: number;
}

export type RuntimeEnv = Record<string, string | undefined>;

export function readConfig(env?: RuntimeEnv): RuntimeConfig {
  return {
    naverClientId: env?.NAVER_CLIENT_ID,
    naverClientSecret: env?.NAVER_CLIENT_SECRET,
    requestTimeoutMs: readNumber(env?.REQUEST_TIMEOUT_MS, 8000),
    cacheTtlMs: readNumber(env?.CACHE_TTL_MS, 5 * 60 * 1000)
  };
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
