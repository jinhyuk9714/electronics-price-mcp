import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

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
    const packageJson = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["eval:multisource-merge"]).toBe(
      "tsx scripts/run-multisource-merge-eval.ts"
    );
  });
});
