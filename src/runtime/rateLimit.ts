export type RateLimitRouteGroup = "api-search" | "api-compare" | "mcp";

export interface RateLimitInput {
  key: string;
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(input: RateLimitInput): Promise<RateLimitDecision>;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export function createRateLimitKey(clientIp: string, routeGroup: RateLimitRouteGroup) {
  return `${clientIp}:${routeGroup}`;
}

export function evaluateRateLimitWindow(
  existing: RateLimitRecord | undefined,
  now: number,
  maxRequests: number,
  windowMs: number
) {
  const activeRecord =
    !existing || existing.resetAt <= now
      ? {
          count: 0,
          resetAt: now + windowMs
        }
      : existing;

  if (activeRecord.count >= maxRequests) {
    return {
      next: activeRecord,
      decision: {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((activeRecord.resetAt - now) / 1000))
      } satisfies RateLimitDecision
    };
  }

  const next: RateLimitRecord = {
    count: activeRecord.count + 1,
    resetAt: activeRecord.resetAt
  };

  return {
    next,
    decision: {
      allowed: true,
      retryAfterSeconds: Math.max(1, Math.ceil((next.resetAt - now) / 1000))
    } satisfies RateLimitDecision
  };
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly store = new Map<string, RateLimitRecord>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  async check(input: RateLimitInput): Promise<RateLimitDecision> {
    const { next, decision } = evaluateRateLimitWindow(
      this.store.get(input.key),
      this.now(),
      input.maxRequests,
      input.windowMs
    );

    this.store.set(input.key, next);
    return decision;
  }
}

export class DurableObjectRateLimiter implements RateLimiter {
  constructor(private readonly namespace: DurableObjectNamespace) {}

  async check(input: RateLimitInput): Promise<RateLimitDecision> {
    const stub = this.namespace.get(this.namespace.idFromName(input.key));
    const response = await stub.fetch("https://rate-limiter.internal/check", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error("Rate limiter request failed.");
    }

    return (await response.json()) as RateLimitDecision;
  }
}

export class RateLimiterDurableObject {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405
      });
    }

    const input = (await request.json()) as RateLimitInput;
    const record = await this.state.storage.get<RateLimitRecord>(input.key);
    const { next, decision } = evaluateRateLimitWindow(record, Date.now(), input.maxRequests, input.windowMs);

    await this.state.storage.put(input.key, next);

    return Response.json(decision);
  }
}
