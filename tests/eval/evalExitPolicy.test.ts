import { describe, expect, test } from "vitest";

import {
  resolveStrictMode,
  shouldFailMultisourceMergeGate,
  shouldFailServiceQualityGate
} from "../../src/eval/evalExitPolicy.js";

describe("evaluation exit policy", () => {
  test("strict mode resolves from argv or env", () => {
    expect(resolveStrictMode(["--strict"], {})).toBe(true);
    expect(resolveStrictMode([], { EVAL_STRICT: "true" })).toBe(true);
    expect(resolveStrictMode([], { EVAL_STRICT: "1" })).toBe(true);
    expect(resolveStrictMode([], {})).toBe(false);
  });

  test("service-quality strict gate fails on any soft_fail or fail", () => {
    expect(shouldFailServiceQualityGate({ pass: 100, softFail: 0, fail: 0 }, true)).toBe(false);
    expect(shouldFailServiceQualityGate({ pass: 99, softFail: 1, fail: 0 }, true)).toBe(true);
    expect(shouldFailServiceQualityGate({ pass: 98, softFail: 0, fail: 2 }, true)).toBe(true);
    expect(shouldFailServiceQualityGate({ pass: 98, softFail: 1, fail: 1 }, false)).toBe(false);
  });

  test("multisource merge strict gate fails only on fail counts", () => {
    expect(shouldFailMultisourceMergeGate({ pass: 7, fail: 0 }, true)).toBe(false);
    expect(shouldFailMultisourceMergeGate({ pass: 6, fail: 1 }, true)).toBe(true);
    expect(shouldFailMultisourceMergeGate({ pass: 6, fail: 1 }, false)).toBe(false);
  });
});
