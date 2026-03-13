import { describe, expect, test } from "vitest";

import { InMemoryRateLimiter, createRateLimitKey } from "../../src/runtime/rateLimit.js";

describe("rateLimit", () => {
  test("accumulates counts for the same ip and route group", async () => {
    const limiter = new InMemoryRateLimiter(() => 1_700_000_000_000);
    const key = createRateLimitKey("203.0.113.10", "api-search");

    const first = await limiter.check({
      key,
      maxRequests: 2,
      windowMs: 60_000
    });
    const second = await limiter.check({
      key,
      maxRequests: 2,
      windowMs: 60_000
    });
    const third = await limiter.check({
      key,
      maxRequests: 2,
      windowMs: 60_000
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third).toEqual({
      allowed: false,
      retryAfterSeconds: 60
    });
  });

  test("does not share counters across route groups", async () => {
    const limiter = new InMemoryRateLimiter(() => 1_700_000_000_000);

    const searchKey = createRateLimitKey("203.0.113.10", "api-search");
    const compareKey = createRateLimitKey("203.0.113.10", "api-compare");

    await limiter.check({
      key: searchKey,
      maxRequests: 1,
      windowMs: 60_000
    });

    const compareDecision = await limiter.check({
      key: compareKey,
      maxRequests: 1,
      windowMs: 60_000
    });

    expect(compareDecision.allowed).toBe(true);
  });

  test("resets counters after the window elapses", async () => {
    let now = 1_700_000_000_000;
    const limiter = new InMemoryRateLimiter(() => now);
    const key = createRateLimitKey("203.0.113.10", "mcp");

    await limiter.check({
      key,
      maxRequests: 1,
      windowMs: 60_000
    });

    const limited = await limiter.check({
      key,
      maxRequests: 1,
      windowMs: 60_000
    });

    expect(limited.allowed).toBe(false);

    now += 60_001;

    const reset = await limiter.check({
      key,
      maxRequests: 1,
      windowMs: 60_000
    });

    expect(reset.allowed).toBe(true);
  });
});
