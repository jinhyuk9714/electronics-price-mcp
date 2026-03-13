import { describe, expect, test } from "vitest";

import { SERVICE_QUALITY_100_CASES } from "../../eval-cases/service-quality-100.js";
import {
  evaluateServiceQualityCase,
  parseApiEnvelope,
  parseMcpToolResult,
  renderServiceQualityMarkdownReport,
  summarizeServiceQualityResults,
  validateServiceQualityCaseSet,
  type ServiceQualityEvalCase
} from "../../src/eval/serviceQualityHarness.js";

const SEARCH_CASE: ServiceQualityEvalCase = {
  id: "laptop-broad-search-1",
  prompt: "게이밍 노트북 검색해 줘",
  category: "laptop",
  intent: "broad-search",
  executor: "search-api",
  mustContain: ["게이밍", "노트북"],
  mustNotContain: ["사무용", "인강용"],
  needsSuggestedQueries: false,
  expectedBehavior: "게이밍 노트북 검색에서 비게이밍 노트북이 크게 섞이지 않아야 한다.",
  notes: "게이밍 의도 검색 노이즈 확인"
};

describe("service quality harness", () => {
  test("service quality case set stays balanced at 100 cases", () => {
    expect(() => validateServiceQualityCaseSet(SERVICE_QUALITY_100_CASES)).not.toThrow();
    expect(SERVICE_QUALITY_100_CASES).toHaveLength(100);
  });

  test("evaluateServiceQualityCase marks noisy search results as soft_fail", () => {
    const result = evaluateServiceQualityCase(SEARCH_CASE, {
      summary: "게이밍 노트북 기준 2개 모델, 3개 판매처를 찾았습니다.",
      haystack: "게이밍 노트북 사무용 노트북 대학생",
      actualStatus: undefined,
      suggestedQueries: []
    });

    expect(result.status).toBe("soft_fail");
    expect(result.notes).toContain("must_not_contain");
  });

  test("evaluateServiceQualityCase marks unexpected compare status as fail", () => {
    const result = evaluateServiceQualityCase(
      {
        id: "graphics-exact-compare-1",
        prompt: "RTX 5070 가격 비교해 줘",
        category: "graphics-card",
        intent: "exact-compare",
        executor: "compare-api",
        expectedStatus: "ok",
        mustContain: ["RTX 5070"],
        mustNotContain: [],
        needsSuggestedQueries: false,
        expectedBehavior: "정확한 모델 비교는 ok 상태로 반환되어야 한다.",
        notes: "exact compare status check"
      },
      {
        summary: "정확한 모델이 여러 개라 바로 판단할 수 없습니다.",
        haystack: "정확한 모델이 여러 개라 바로 판단할 수 없습니다.",
        actualStatus: "ambiguous",
        suggestedQueries: ["RTX 5070 가격 비교해 줘"]
      }
    );

    expect(result.status).toBe("fail");
    expect(result.notes).toContain("expected_status");
  });

  test("parseApiEnvelope extracts summary, status, suggestions, and haystack", () => {
    const observation = parseApiEnvelope({
      success: true,
      data: {
        summary: "RTX 5070 기준 2개 모델, 3개 판매처를 찾았습니다.",
        status: "ambiguous",
        warning: "정확한 모델이 여러 개 섞여 있습니다.",
        suggestedQueries: ["RTX 5070 가격 비교해 줘"],
        offers: [{ title: "ZOTAC RTX 5070 Twin Edge" }],
        groups: [{ title: "RTX 5070", normalizedModel: "RTX 5070" }]
      }
    });

    expect(observation.summary).toContain("RTX 5070");
    expect(observation.actualStatus).toBe("ambiguous");
    expect(observation.suggestedQueries).toEqual(["RTX 5070 가격 비교해 줘"]);
    expect(observation.haystack).toContain("ZOTAC RTX 5070 Twin Edge");
  });

  test("parseMcpToolResult extracts structured content from explain tool results", () => {
    const observation = parseMcpToolResult({
      content: [{ type: "text", text: "지금 사도 괜찮은 가격대입니다." }],
      structuredContent: {
        summary: "지금 사도 괜찮은 가격대입니다.",
        status: "ok",
        suggestedQueries: ["15IRX9 지금 사도 괜찮은 가격대야?"],
        offers: [{ title: "레노버 리전 5i 15IRX9" }]
      }
    });

    expect(observation.summary).toBe("지금 사도 괜찮은 가격대입니다.");
    expect(observation.actualStatus).toBe("ok");
    expect(observation.suggestedQueries).toHaveLength(1);
    expect(observation.haystack).toContain("15IRX9");
  });

  test("renderServiceQualityMarkdownReport includes aggregate sections and next priorities", () => {
    const summary = summarizeServiceQualityResults([
      {
        id: SEARCH_CASE.id,
        prompt: SEARCH_CASE.prompt,
        category: SEARCH_CASE.category,
        intent: SEARCH_CASE.intent,
        executor: SEARCH_CASE.executor,
        status: "soft_fail",
        expectedBehavior: SEARCH_CASE.expectedBehavior,
        observedSummary: "게이밍 노트북 기준 2개 모델, 3개 판매처를 찾았습니다.",
        notes: "must_not_contain: 사무용"
      },
      {
        id: "graphics-exact-compare-1",
        prompt: "RTX 5070 가격 비교해 줘",
        category: "graphics-card",
        intent: "exact-compare",
        executor: "compare-api",
        status: "pass",
        expectedBehavior: "정확 비교는 ok여야 한다.",
        observedSummary: "RTX 5070 기준 최저가 919000원, 최고가 1069000원입니다.",
        notes: ""
      }
    ]);

    const markdown = renderServiceQualityMarkdownReport({
      title: "Service Quality Advanced 100 Evaluation",
      generatedAt: "2026-03-13T00:00:00.000Z",
      baseUrl: "https://example.com",
      mcpUrl: "https://example.com/mcp",
      totals: summary,
      results: [
        {
          id: SEARCH_CASE.id,
          prompt: SEARCH_CASE.prompt,
          category: SEARCH_CASE.category,
          intent: SEARCH_CASE.intent,
          executor: SEARCH_CASE.executor,
          status: "soft_fail",
          expectedBehavior: SEARCH_CASE.expectedBehavior,
          observedSummary: "게이밍 노트북 기준 2개 모델, 3개 판매처를 찾았습니다.",
          notes: "must_not_contain: 사무용"
        }
      ]
    });

    expect(markdown).toContain("# Service Quality Advanced 100 Evaluation");
    expect(markdown).toContain("카테고리별 통과율");
    expect(markdown).toContain("의도별 통과율");
    expect(markdown).toContain("다음 개선 우선순위");
  });
});
