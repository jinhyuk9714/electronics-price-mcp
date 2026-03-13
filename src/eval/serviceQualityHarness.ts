export type ServiceQualityCategory =
  | "laptop"
  | "graphics-card"
  | "keyboard"
  | "monitor"
  | "pc-part";

export type ServiceQualityIntent =
  | "broad-search"
  | "exact-ish-search"
  | "exact-compare"
  | "broad-ambiguous-safety"
  | "purchase-explain";

export type ServiceQualityExecutor = "search-api" | "compare-api" | "explain-mcp";
export type ServiceQualityStatus = "pass" | "soft_fail" | "fail";
export type ExpectedToolStatus = "ok" | "ambiguous" | "not_found";

export interface ServiceQualityEvalCase {
  id: string;
  prompt: string;
  category: ServiceQualityCategory;
  intent: ServiceQualityIntent;
  executor: ServiceQualityExecutor;
  expectedStatus?: ExpectedToolStatus;
  mustContain: string[];
  mustNotContain: string[];
  needsSuggestedQueries: boolean;
  expectedBehavior: string;
  notes: string;
}

export interface ServiceQualityObservation {
  summary: string;
  haystack: string;
  actualStatus?: string;
  suggestedQueries: string[];
  error?: string;
}

export interface ServiceQualityCaseResult {
  id: string;
  prompt: string;
  category: ServiceQualityCategory;
  intent: ServiceQualityIntent;
  executor: ServiceQualityExecutor;
  status: ServiceQualityStatus;
  expectedBehavior: string;
  observedSummary: string;
  notes: string;
}

export interface ServiceQualityAggregateRow {
  key: string;
  total: number;
  pass: number;
  softFail: number;
  fail: number;
  passRate: number;
}

export interface ServiceQualityPatternCount {
  pattern: string;
  count: number;
}

export interface ServiceQualityTotals {
  total: number;
  pass: number;
  softFail: number;
  fail: number;
  passRate: number;
  byCategory: ServiceQualityAggregateRow[];
  byIntent: ServiceQualityAggregateRow[];
  failurePatterns: ServiceQualityPatternCount[];
  nextImprovementPriorities: string[];
}

export interface ServiceQualityReport {
  title?: string;
  generatedAt: string;
  baseUrl: string;
  mcpUrl: string;
  totals: ServiceQualityTotals;
  results: ServiceQualityCaseResult[];
}

const ALL_CATEGORIES: ServiceQualityCategory[] = [
  "laptop",
  "graphics-card",
  "keyboard",
  "monitor",
  "pc-part"
];
const ALL_INTENTS: ServiceQualityIntent[] = [
  "broad-search",
  "exact-ish-search",
  "exact-compare",
  "broad-ambiguous-safety",
  "purchase-explain"
];
const CATEGORY_LABELS: Record<ServiceQualityCategory, string> = {
  laptop: "노트북",
  "graphics-card": "그래픽카드",
  keyboard: "키보드",
  monitor: "모니터",
  "pc-part": "PC 부품"
};
const INTENT_LABELS: Record<ServiceQualityIntent, string> = {
  "broad-search": "broad search",
  "exact-ish-search": "exact-ish search",
  "exact-compare": "exact compare",
  "broad-ambiguous-safety": "broad ambiguous safety",
  "purchase-explain": "purchase/explain"
};

export function validateServiceQualityCaseSet(cases: ServiceQualityEvalCase[]) {
  if (cases.length !== 100) {
    throw new Error(`평가셋은 100문장이어야 합니다. 현재 ${cases.length}개입니다.`);
  }

  const seenIds = new Set<string>();
  const categoryCounts = new Map<ServiceQualityCategory, number>();
  const intentCounts = new Map<ServiceQualityIntent, number>();
  const matrixCounts = new Map<string, number>();

  for (const category of ALL_CATEGORIES) {
    categoryCounts.set(category, 0);
  }

  for (const intent of ALL_INTENTS) {
    intentCounts.set(intent, 0);
    for (const category of ALL_CATEGORIES) {
      matrixCounts.set(`${category}:${intent}`, 0);
    }
  }

  for (const item of cases) {
    if (seenIds.has(item.id)) {
      throw new Error(`중복 케이스 id가 있습니다: ${item.id}`);
    }

    seenIds.add(item.id);

    if (item.mustContain.length === 0 && item.mustNotContain.length === 0) {
      throw new Error(`검사 기준이 비어 있는 케이스가 있습니다: ${item.id}`);
    }

    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
    intentCounts.set(item.intent, (intentCounts.get(item.intent) ?? 0) + 1);

    const matrixKey = `${item.category}:${item.intent}`;
    matrixCounts.set(matrixKey, (matrixCounts.get(matrixKey) ?? 0) + 1);
  }

  for (const [category, count] of categoryCounts) {
    if (count !== 20) {
      throw new Error(`${category} 카테고리는 20문장이어야 합니다. 현재 ${count}개입니다.`);
    }
  }

  for (const [intent, count] of intentCounts) {
    if (count !== 20) {
      throw new Error(`${intent} 의도는 20문장이어야 합니다. 현재 ${count}개입니다.`);
    }
  }

  for (const [matrixKey, count] of matrixCounts) {
    if (count !== 4) {
      throw new Error(`${matrixKey} 조합은 4문장이어야 합니다. 현재 ${count}개입니다.`);
    }
  }
}

export function evaluateServiceQualityCase(
  testCase: ServiceQualityEvalCase,
  observation: ServiceQualityObservation
): ServiceQualityCaseResult {
  const failReasons: string[] = [];
  const softReasons: string[] = [];
  const haystack = normalizeForMatch(observation.haystack);

  if (observation.error) {
    failReasons.push(`error: ${observation.error}`);
  }

  if (testCase.expectedStatus && observation.actualStatus !== testCase.expectedStatus) {
    failReasons.push(
      `expected_status: ${testCase.expectedStatus} -> ${observation.actualStatus ?? "undefined"}`
    );
  }

  for (const needle of testCase.mustContain) {
    if (!matchesNeedle(haystack, needle)) {
      failReasons.push(`must_contain_missing: ${needle}`);
    }
  }

  for (const needle of testCase.mustNotContain) {
    if (haystack.includes(normalizeForMatch(needle))) {
      softReasons.push(`must_not_contain: ${needle}`);
    }
  }

  if (testCase.needsSuggestedQueries && observation.suggestedQueries.length === 0) {
    softReasons.push("missing_suggested_queries");
  }

  const status: ServiceQualityStatus =
    failReasons.length > 0 ? "fail" : softReasons.length > 0 ? "soft_fail" : "pass";

  return {
    id: testCase.id,
    prompt: testCase.prompt,
    category: testCase.category,
    intent: testCase.intent,
    executor: testCase.executor,
    status,
    expectedBehavior: testCase.expectedBehavior,
    observedSummary: observation.summary,
    notes: [...failReasons, ...softReasons].join("; ")
  };
}

export function parseApiEnvelope(payload: unknown): ServiceQualityObservation {
  const envelope = asRecord(payload);
  const success = envelope?.success;

  if (success !== true) {
    const message = pickString(envelope?.error, "message") ?? "API 요청이 실패했습니다.";
    return {
      summary: message,
      haystack: message,
      suggestedQueries: [],
      error: message
    };
  }

  const data = asRecord(envelope.data) ?? {};
  const summary = pickString(data, "summary") ?? "요약이 없습니다.";
  const warning = pickString(data, "warning");

  return {
    summary,
    haystack: buildStructuredResponseHaystack(data),
    actualStatus: pickString(data, "status"),
    suggestedQueries: pickStringArray(data, "suggestedQueries")
  };
}

export function parseMcpToolResult(payload: unknown): ServiceQualityObservation {
  const result = asRecord(payload) ?? {};
  const structuredContent = asRecord(result.structuredContent) ?? {};
  const summary =
    pickString(structuredContent, "summary") ??
    pickFirstContentText(result.content) ??
    "요약이 없습니다.";
  const isError = result.isError === true;

  return {
    summary,
    haystack: buildMcpResponseHaystack(result.content, structuredContent),
    actualStatus: pickString(structuredContent, "status"),
    suggestedQueries: pickStringArray(structuredContent, "suggestedQueries"),
    ...(isError ? { error: summary } : {})
  };
}

export function summarizeServiceQualityResults(
  results: ServiceQualityCaseResult[]
): ServiceQualityTotals {
  const total = results.length;
  const pass = results.filter((item) => item.status === "pass").length;
  const softFail = results.filter((item) => item.status === "soft_fail").length;
  const fail = results.filter((item) => item.status === "fail").length;
  const passRate = total === 0 ? 0 : pass / total;

  const byCategory = ALL_CATEGORIES.map((category) =>
    summarizeGroup(
      CATEGORY_LABELS[category],
      results.filter((item) => item.category === category)
    )
  );
  const byIntent = ALL_INTENTS.map((intent) =>
    summarizeGroup(
      INTENT_LABELS[intent],
      results.filter((item) => item.intent === intent)
    )
  );

  const failurePatterns = summarizeFailurePatterns(results);

  return {
    total,
    pass,
    softFail,
    fail,
    passRate,
    byCategory,
    byIntent,
    failurePatterns,
    nextImprovementPriorities: deriveNextImprovementPriorities(failurePatterns)
  };
}

export function renderServiceQualityMarkdownReport(report: ServiceQualityReport): string {
  const lines: string[] = [];

  lines.push(`# ${report.title ?? "Service Quality 100 Evaluation"}`);
  lines.push("");
  lines.push(`- 생성 시각: ${report.generatedAt}`);
  lines.push(`- base URL: ${report.baseUrl}`);
  lines.push(`- MCP URL: ${report.mcpUrl}`);
  lines.push(`- 전체 결과: ${report.totals.pass} pass / ${report.totals.softFail} soft_fail / ${report.totals.fail} fail`);
  lines.push(`- 통과율: ${formatPercent(report.totals.passRate)}`);
  lines.push("");
  lines.push("## 카테고리별 통과율");
  lines.push("");
  lines.push("| 카테고리 | total | pass | soft_fail | fail | pass_rate |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.totals.byCategory) {
    lines.push(
      `| ${row.key} | ${row.total} | ${row.pass} | ${row.softFail} | ${row.fail} | ${formatPercent(row.passRate)} |`
    );
  }

  lines.push("");
  lines.push("## 의도별 통과율");
  lines.push("");
  lines.push("| 의도 | total | pass | soft_fail | fail | pass_rate |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const row of report.totals.byIntent) {
    lines.push(
      `| ${row.key} | ${row.total} | ${row.pass} | ${row.softFail} | ${row.fail} | ${formatPercent(row.passRate)} |`
    );
  }

  lines.push("");
  lines.push("## 실패 패턴 상위 5개");
  lines.push("");
  if (report.totals.failurePatterns.length === 0) {
    lines.push("- 특이 실패 패턴이 없습니다.");
  } else {
    for (const pattern of report.totals.failurePatterns.slice(0, 5)) {
      lines.push(`- ${pattern.pattern}: ${pattern.count}`);
    }
  }

  lines.push("");
  lines.push("## 다음 개선 우선순위");
  lines.push("");
  for (const item of report.totals.nextImprovementPriorities) {
    lines.push(`- ${item}`);
  }

  lines.push("");
  lines.push("## 문장별 결과");
  lines.push("");
  for (const item of report.results) {
    lines.push(`### ${item.id} · ${item.status}`);
    lines.push(`- prompt: ${item.prompt}`);
    lines.push(`- expected_behavior: ${item.expectedBehavior}`);
    lines.push(`- observed_summary: ${item.observedSummary || "(empty)"}`);
    lines.push(`- notes: ${item.notes || "(none)"}`);
    lines.push("");
  }

  return lines.join("\n");
}

function summarizeGroup(key: string, items: ServiceQualityCaseResult[]): ServiceQualityAggregateRow {
  const total = items.length;
  const pass = items.filter((item) => item.status === "pass").length;
  const softFail = items.filter((item) => item.status === "soft_fail").length;
  const fail = items.filter((item) => item.status === "fail").length;

  return {
    key,
    total,
    pass,
    softFail,
    fail,
    passRate: total === 0 ? 0 : pass / total
  };
}

function summarizeFailurePatterns(results: ServiceQualityCaseResult[]): ServiceQualityPatternCount[] {
  const counts = new Map<string, number>();

  for (const result of results) {
    if (!result.notes) {
      continue;
    }

    const pieces = result.notes
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);

    for (const piece of pieces) {
      counts.set(piece, (counts.get(piece) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((left, right) => right.count - left.count || left.pattern.localeCompare(right.pattern));
}

function deriveNextImprovementPriorities(
  patterns: ServiceQualityPatternCount[]
): string[] {
  const priorities: string[] = [];
  const haystack = patterns.map((item) => item.pattern).join("\n");

  if (haystack.includes("must_not_contain")) {
    priorities.push("검색 의도 대비 노이즈 제거 규칙을 더 촘촘하게 다듬기");
  }

  if (haystack.includes("missing_suggested_queries")) {
    priorities.push("ambiguous 응답에서 suggestedQueries 생성 커버리지를 늘리기");
  }

  if (haystack.includes("expected_status") || haystack.includes("must_contain_missing")) {
    priorities.push("정확 모델 추출과 exact compare 성공 범위를 확대하기");
  }

  const defaults = [
    "카테고리별 broad 검색 필터를 다시 점검하기",
    "exact-ish 검색에서 모델 코드 인식률을 높이기",
    "설명형 응답 요약과 추천 문구를 더 자연스럽게 다듬기"
  ];

  for (const fallback of defaults) {
    if (priorities.length >= 3) {
      break;
    }

    if (!priorities.includes(fallback)) {
      priorities.push(fallback);
    }
  }

  return priorities.slice(0, 3);
}

function buildHaystack(values: unknown[]): string {
  return values.flatMap(collectStrings).join("\n");
}

function buildStructuredResponseHaystack(value: Record<string, unknown>): string {
  return buildHaystack([
    value.summary,
    value.warning,
    value.status,
    value.suggestedQueries,
    value.offers,
    value.groups,
    value.comparison,
    value.insight
  ]);
}

function buildMcpResponseHaystack(
  content: unknown,
  structuredContent: Record<string, unknown>
): string {
  return buildHaystack([
    extractTextContentBlocks(content),
    structuredContent.summary,
    structuredContent.warning,
    structuredContent.status,
    structuredContent.suggestedQueries,
    structuredContent.offers,
    structuredContent.groups,
    structuredContent.comparison,
    structuredContent.insight
  ]);
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  return Object.values(value).flatMap(collectStrings);
}

function normalizeForMatch(value: string): string {
  return value.toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim();
}

function matchesNeedle(haystack: string, needle: string): boolean {
  const normalizedNeedle = normalizeForMatch(needle);
  if (haystack.includes(normalizedNeedle)) {
    return true;
  }

  const alternates = getAlternateNeedles(normalizedNeedle);
  return alternates.some((item) => haystack.includes(item));
}

function getAlternateNeedles(needle: string): string[] {
  if (needle === normalizeForMatch("정확히 같은 모델")) {
    return [normalizeForMatch("정확한 모델"), normalizeForMatch("같은 모델")];
  }

  return [];
}

function pickString(value: unknown, key: string): string | undefined {
  const record = asRecord(value);
  const field = record?.[key];
  return typeof field === "string" ? field : undefined;
}

function pickStringArray(value: unknown, key: string): string[] {
  const record = asRecord(value);
  const field = record?.[key];
  if (!Array.isArray(field)) {
    return [];
  }

  return field.filter((item): item is string => typeof item === "string");
}

function pickFirstContentText(content: unknown): string | undefined {
  return extractTextContentBlocks(content)[0];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined;
}

function extractTextContentBlocks(content: unknown): string[] {
  if (!Array.isArray(content)) {
    return [];
  }

  const texts: string[] = [];
  for (const item of content) {
    const record = asRecord(item);
    if (record?.type === "text" && typeof record.text === "string") {
      texts.push(record.text);
    }
  }

  return texts;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
