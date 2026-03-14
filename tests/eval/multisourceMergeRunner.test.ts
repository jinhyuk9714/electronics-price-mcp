import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

describe("multisource merge runner", () => {
  test("suite includes the expected source combination scenarios", async () => {
    const { MULTISOURCE_MERGE_CASES } = await import("../../eval-cases/multisource-merge-v1.js");

    expect(MULTISOURCE_MERGE_CASES.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "merge-same-mall-alias-dedupe",
        "merge-different-mall-keep-both",
        "merge-same-mall-large-price-gap",
        "merge-source-priority-tiebreak",
        "merge-partial-provider-failure",
        "merge-broad-query-safety"
      ])
    );
  });

  test("package script exposes a dedicated multisource merge evaluation command", () => {
    const packageJson = JSON.parse(
      readFileSync("/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/package.json", "utf8")
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["eval:multisource-merge"]).toBe(
      "tsx scripts/run-multisource-merge-eval.ts"
    );
  });
});
