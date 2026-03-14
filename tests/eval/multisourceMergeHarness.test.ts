import { describe, expect, test } from "vitest";

describe("multisource merge harness", () => {
  test("same-mall alias dedupe case passes with canonical mall diagnostics", async () => {
    const [{ MULTISOURCE_MERGE_CASES }, harness] = await Promise.all([
      import("../../eval-cases/multisource-merge-v1.js"),
      import("../../src/eval/multisourceMergeHarness.js")
    ]);

    const testCase = MULTISOURCE_MERGE_CASES.find((item) => item.id === "merge-same-mall-alias-dedupe");

    expect(testCase).toBeTruthy();

    const observation = await harness.executeMultisourceMergeCase(testCase!);
    const result = harness.evaluateMultisourceMergeCase(testCase!, observation);

    expect(result.status).toBe("pass");
    expect(observation.diagnostics?.canonicalMallDedupeHits).toBe(1);
    expect(observation.diagnostics?.crossSourceDuplicateDrops).toBe(1);
  });

  test("partial provider failure case stays pass with diagnostics attached", async () => {
    const [{ MULTISOURCE_MERGE_CASES }, harness] = await Promise.all([
      import("../../eval-cases/multisource-merge-v1.js"),
      import("../../src/eval/multisourceMergeHarness.js")
    ]);

    const testCase = MULTISOURCE_MERGE_CASES.find((item) => item.id === "merge-partial-provider-failure");

    expect(testCase).toBeTruthy();

    const observation = await harness.executeMultisourceMergeCase(testCase!);
    const result = harness.evaluateMultisourceMergeCase(testCase!, observation);

    expect(result.status).toBe("pass");
    expect(observation.diagnostics?.partialProviderFailure).toBe(true);
    expect(observation.diagnostics?.providerStatuses).toMatchObject({
      "naver-shopping": "success",
      danawa: "error"
    });
  });

  test("markdown report includes source combination and dedupe totals", async () => {
    const harness = await import("../../src/eval/multisourceMergeHarness.js");

    const summary = harness.summarizeMultisourceMergeResults([
      {
        id: "merge-same-mall-alias-dedupe",
        description: "same mall alias dedupe",
        sourceCombination: "naver-shopping+static-catalog",
        action: "search",
        status: "pass",
        observedSummary: "27GR93U exact model search returned 1 offer.",
        notes: "",
        diagnostics: {
          providerStatuses: {
            "naver-shopping": "success",
            "static-catalog": "success"
          },
          providerOfferCounts: {
            "naver-shopping": 1,
            "static-catalog": 1
          },
          partialProviderFailure: false,
          canonicalMallDedupeHits: 1,
          crossSourceDuplicateDrops: 1
        }
      }
    ]);

    const markdown = harness.renderMultisourceMergeMarkdownReport({
      title: "Multisource Merge Evaluation",
      generatedAt: "2026-03-14T00:00:00.000Z",
      totals: summary,
      results: [
        {
          id: "merge-same-mall-alias-dedupe",
          description: "same mall alias dedupe",
          sourceCombination: "naver-shopping+static-catalog",
          action: "search",
          status: "pass",
          observedSummary: "27GR93U exact model search returned 1 offer.",
          notes: "",
          diagnostics: {
            providerStatuses: {
              "naver-shopping": "success",
              "static-catalog": "success"
            },
            providerOfferCounts: {
              "naver-shopping": 1,
              "static-catalog": 1
            },
            partialProviderFailure: false,
            canonicalMallDedupeHits: 1,
            crossSourceDuplicateDrops: 1
          }
        }
      ]
    });

    expect(markdown).toContain("# Multisource Merge Evaluation");
    expect(markdown).toContain("source 조합별 결과");
    expect(markdown).toContain("canonical mall dedupe hits");
    expect(markdown).toContain("cross-source duplicate drops");
  });
});
