import { readProviderDiagnostics, type ProviderRequestDiagnostics } from "../domain/providerDiagnostics.ts";
import { PriceService } from "../domain/priceService.ts";
import { normalizeQuery } from "../domain/normalize.ts";
import type {
  CompareProductPricesResult,
  ExplainPurchaseOptionsResult,
  ProductCategory,
  ProviderExecutionStatus,
  ProviderOffer,
  SearchProductsResult,
  SearchProvider,
  SearchSort,
  SearchSource
} from "../domain/types.ts";
import { AggregateSearchProvider } from "../providers/aggregateSearchProvider.ts";

export type MultisourceMergeAction = "search" | "compare" | "explain";
export type MultisourceMergeStatus = "pass" | "fail";

export interface MultisourceMergeProviderSpec {
  source: SearchSource;
  mode: "success" | "error";
  offers?: ProviderOffer[];
}

export interface MultisourceMergeExpectations {
  actualStatus?: "ok" | "ambiguous" | "not_found";
  offerCount?: number;
  groupCount?: number;
  keptSources?: SearchSource[];
  droppedSources?: SearchSource[];
  providerStatuses?: Partial<Record<SearchSource, ProviderExecutionStatus>>;
  providerOfferCounts?: Partial<Record<SearchSource, number>>;
  partialProviderFailure?: boolean;
  canonicalMallDedupeHits?: number;
  crossSourceDuplicateDrops?: number;
  needsSuggestedQueries?: boolean;
  summaryMustContain?: string[];
  summaryMustNotContain?: string[];
}

export interface MultisourceMergeEvalCase {
  id: string;
  description: string;
  action: MultisourceMergeAction;
  query: string;
  category?: ProductCategory;
  sort?: SearchSort;
  providers: MultisourceMergeProviderSpec[];
  expected: MultisourceMergeExpectations;
}

export interface MultisourceMergeObservation {
  summary: string;
  actualStatus?: string;
  offerCount: number;
  groupCount?: number;
  keptSources: SearchSource[];
  suggestedQueries: string[];
  diagnostics?: ProviderRequestDiagnostics;
  error?: string;
}

export interface MultisourceMergeCaseResult {
  id: string;
  description: string;
  sourceCombination: string;
  action: MultisourceMergeAction;
  status: MultisourceMergeStatus;
  observedSummary: string;
  notes: string;
  diagnostics?: ProviderRequestDiagnostics;
}

export interface MultisourceMergeAggregateRow {
  key: string;
  total: number;
  pass: number;
  fail: number;
  passRate: number;
}

export interface MultisourceMergePatternCount {
  pattern: string;
  count: number;
}

export interface MultisourceMergeTotals {
  total: number;
  pass: number;
  fail: number;
  passRate: number;
  canonicalMallDedupeHits: number;
  crossSourceDuplicateDrops: number;
  bySourceCombination: MultisourceMergeAggregateRow[];
  failurePatterns: MultisourceMergePatternCount[];
}

export interface MultisourceMergeReport {
  title: string;
  generatedAt: string;
  totals: MultisourceMergeTotals;
  results: MultisourceMergeCaseResult[];
}

export async function executeMultisourceMergeCase(
  testCase: MultisourceMergeEvalCase
): Promise<MultisourceMergeObservation> {
  const service = new PriceService({
    provider: new AggregateSearchProvider(testCase.providers.map(createMockProvider))
  });

  try {
    if (testCase.action === "search") {
      const result = await service.searchProducts({
        query: testCase.query,
        category: testCase.category,
        sort: testCase.sort ?? "relevance",
        excludeUsed: true,
        limit: 20
      });

      return {
        summary: result.summary,
        offerCount: result.offers.length,
        groupCount: result.groups.length,
        keptSources: collectSources(result.offers.map((offer) => offer.source)),
        suggestedQueries: [],
        diagnostics: readProviderDiagnostics(result)
      };
    }

    if (testCase.action === "compare") {
      const result = await service.compareProductPrices({
        query: testCase.query
      });

      return createComparisonObservation(result);
    }

    const result = await service.explainPurchaseOptions({
      query: testCase.query
    });

    return createComparisonObservation(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 merge 평가 오류";

    return {
      summary: message,
      offerCount: 0,
      keptSources: [],
      suggestedQueries: [],
      error: message
    };
  }
}

export function evaluateMultisourceMergeCase(
  testCase: MultisourceMergeEvalCase,
  observation: MultisourceMergeObservation
): MultisourceMergeCaseResult {
  const failReasons: string[] = [];

  if (observation.error) {
    failReasons.push(`error: ${observation.error}`);
  }

  if (
    testCase.expected.actualStatus !== undefined &&
    observation.actualStatus !== testCase.expected.actualStatus
  ) {
    failReasons.push(
      `expected_status: ${testCase.expected.actualStatus} -> ${observation.actualStatus ?? "undefined"}`
    );
  }

  if (testCase.expected.offerCount !== undefined && observation.offerCount !== testCase.expected.offerCount) {
    failReasons.push(`expected_offer_count: ${testCase.expected.offerCount} -> ${observation.offerCount}`);
  }

  if (testCase.expected.groupCount !== undefined && observation.groupCount !== testCase.expected.groupCount) {
    failReasons.push(`expected_group_count: ${testCase.expected.groupCount} -> ${observation.groupCount ?? 0}`);
  }

  for (const source of testCase.expected.keptSources ?? []) {
    if (!observation.keptSources.includes(source)) {
      failReasons.push(`missing_kept_source: ${source}`);
    }
  }

  for (const source of testCase.expected.droppedSources ?? []) {
    if (observation.keptSources.includes(source)) {
      failReasons.push(`unexpected_source: ${source}`);
    }
  }

  if (testCase.expected.needsSuggestedQueries && observation.suggestedQueries.length === 0) {
    failReasons.push("missing_suggested_queries");
  }

  const summaryHaystack = normalizeQuery(observation.summary);

  for (const needle of testCase.expected.summaryMustContain ?? []) {
    if (!summaryHaystack.includes(normalizeQuery(needle))) {
      failReasons.push(`summary_missing: ${needle}`);
    }
  }

  for (const needle of testCase.expected.summaryMustNotContain ?? []) {
    if (summaryHaystack.includes(normalizeQuery(needle))) {
      failReasons.push(`summary_contains: ${needle}`);
    }
  }

  const diagnostics = observation.diagnostics;

  if (
    needsDiagnostics(testCase.expected) &&
    !diagnostics
  ) {
    failReasons.push("missing_diagnostics");
  }

  for (const [source, expectedStatus] of Object.entries(testCase.expected.providerStatuses ?? {})) {
    if (diagnostics?.providerStatuses[source as SearchSource] !== expectedStatus) {
      failReasons.push(
        `provider_status: ${source} -> ${diagnostics?.providerStatuses[source as SearchSource] ?? "undefined"}`
      );
    }
  }

  for (const [source, expectedCount] of Object.entries(testCase.expected.providerOfferCounts ?? {})) {
    if (diagnostics?.providerOfferCounts[source as SearchSource] !== expectedCount) {
      failReasons.push(
        `provider_offer_count: ${source} -> ${diagnostics?.providerOfferCounts[source as SearchSource] ?? "undefined"}`
      );
    }
  }

  if (
    testCase.expected.partialProviderFailure !== undefined &&
    diagnostics?.partialProviderFailure !== testCase.expected.partialProviderFailure
  ) {
    failReasons.push(
      `partial_provider_failure: ${testCase.expected.partialProviderFailure} -> ${diagnostics?.partialProviderFailure ?? "undefined"}`
    );
  }

  if (
    testCase.expected.canonicalMallDedupeHits !== undefined &&
    diagnostics?.canonicalMallDedupeHits !== testCase.expected.canonicalMallDedupeHits
  ) {
    failReasons.push(
      `canonical_mall_dedupe_hits: ${testCase.expected.canonicalMallDedupeHits} -> ${diagnostics?.canonicalMallDedupeHits ?? "undefined"}`
    );
  }

  if (
    testCase.expected.crossSourceDuplicateDrops !== undefined &&
    diagnostics?.crossSourceDuplicateDrops !== testCase.expected.crossSourceDuplicateDrops
  ) {
    failReasons.push(
      `cross_source_duplicate_drops: ${testCase.expected.crossSourceDuplicateDrops} -> ${diagnostics?.crossSourceDuplicateDrops ?? "undefined"}`
    );
  }

  return {
    id: testCase.id,
    description: testCase.description,
    sourceCombination: formatSourceCombination(testCase.providers.map((provider) => provider.source)),
    action: testCase.action,
    status: failReasons.length === 0 ? "pass" : "fail",
    observedSummary: observation.summary,
    notes: failReasons.join("; "),
    diagnostics
  };
}

export function summarizeMultisourceMergeResults(
  results: MultisourceMergeCaseResult[]
): MultisourceMergeTotals {
  const total = results.length;
  const pass = results.filter((item) => item.status === "pass").length;
  const fail = total - pass;
  const bySourceCombination = aggregateBySourceCombination(results);
  const failurePatterns = aggregateFailurePatterns(results);
  const canonicalMallDedupeHits = results.reduce(
    (sum, item) => sum + (item.diagnostics?.canonicalMallDedupeHits ?? 0),
    0
  );
  const crossSourceDuplicateDrops = results.reduce(
    (sum, item) => sum + (item.diagnostics?.crossSourceDuplicateDrops ?? 0),
    0
  );

  return {
    total,
    pass,
    fail,
    passRate: total === 0 ? 0 : Number(((pass / total) * 100).toFixed(1)),
    canonicalMallDedupeHits,
    crossSourceDuplicateDrops,
    bySourceCombination,
    failurePatterns
  };
}

export function renderMultisourceMergeMarkdownReport(report: MultisourceMergeReport): string {
  const lines: string[] = [
    `# ${report.title}`,
    "",
    `- generatedAt: ${report.generatedAt}`,
    `- total: ${report.totals.total}`,
    `- pass/fail: ${report.totals.pass} / ${report.totals.fail}`,
    `- passRate: ${report.totals.passRate}%`,
    `- canonical mall dedupe hits: ${report.totals.canonicalMallDedupeHits}`,
    `- cross-source duplicate drops: ${report.totals.crossSourceDuplicateDrops}`,
    "",
    "## source 조합별 결과",
    "",
    "| source combination | total | pass | fail | passRate |",
    "| --- | ---: | ---: | ---: | ---: |"
  ];

  for (const row of report.totals.bySourceCombination) {
    lines.push(`| ${row.key} | ${row.total} | ${row.pass} | ${row.fail} | ${row.passRate}% |`);
  }

  lines.push("", "## failure patterns", "");

  if (report.totals.failurePatterns.length === 0) {
    lines.push("- none");
  } else {
    for (const pattern of report.totals.failurePatterns) {
      lines.push(`- ${pattern.pattern}: ${pattern.count}`);
    }
  }

  lines.push("", "## cases", "");

  for (const result of report.results) {
    lines.push(`### ${result.id}`);
    lines.push(`- action: ${result.action}`);
    lines.push(`- sourceCombination: ${result.sourceCombination}`);
    lines.push(`- status: ${result.status}`);
    lines.push(`- observedSummary: ${result.observedSummary}`);
    if (result.notes) {
      lines.push(`- notes: ${result.notes}`);
    }
    if (result.diagnostics) {
      lines.push(
        `- diagnostics: dedupe=${result.diagnostics.canonicalMallDedupeHits}, drops=${result.diagnostics.crossSourceDuplicateDrops}, partialFailure=${result.diagnostics.partialProviderFailure}`
      );
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function createMockProvider(spec: MultisourceMergeProviderSpec): SearchProvider {
  return {
    source: spec.source,
    async searchProducts(input) {
      if (spec.mode === "error") {
        throw new Error(`${spec.source} provider failed`);
      }

      return {
        query: input.query,
        offers: (spec.offers ?? []).slice(0, input.limit)
      };
    }
  };
}

function createComparisonObservation(
  result: CompareProductPricesResult | ExplainPurchaseOptionsResult
): MultisourceMergeObservation {
  return {
    summary: result.summary,
    actualStatus: result.status,
    offerCount: result.offers.length,
    keptSources: collectSources(result.offers.map((offer) => offer.source)),
    suggestedQueries: result.suggestedQueries ?? [],
    diagnostics: readProviderDiagnostics(result)
  };
}

function collectSources(sources: SearchSource[]): SearchSource[] {
  return Array.from(new Set(sources)).sort((left, right) => getSourcePriority(left) - getSourcePriority(right));
}

function formatSourceCombination(sources: SearchSource[]): string {
  return collectSources(sources).join("+");
}

function getSourcePriority(source: SearchSource): number {
  if (source === "naver-shopping") {
    return 0;
  }

  if (source === "danawa") {
    return 1;
  }

  return 2;
}

function needsDiagnostics(expected: MultisourceMergeExpectations): boolean {
  return Boolean(
    expected.providerStatuses ||
      expected.providerOfferCounts ||
      expected.partialProviderFailure !== undefined ||
      expected.canonicalMallDedupeHits !== undefined ||
      expected.crossSourceDuplicateDrops !== undefined
  );
}

function aggregateBySourceCombination(
  results: MultisourceMergeCaseResult[]
): MultisourceMergeAggregateRow[] {
  const rows = new Map<string, { total: number; pass: number; fail: number }>();

  for (const result of results) {
    const bucket = rows.get(result.sourceCombination) ?? { total: 0, pass: 0, fail: 0 };
    bucket.total += 1;
    bucket[result.status] += 1;
    rows.set(result.sourceCombination, bucket);
  }

  return Array.from(rows.entries())
    .map(([key, value]) => ({
      key,
      total: value.total,
      pass: value.pass,
      fail: value.fail,
      passRate: value.total === 0 ? 0 : Number(((value.pass / value.total) * 100).toFixed(1))
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function aggregateFailurePatterns(results: MultisourceMergeCaseResult[]): MultisourceMergePatternCount[] {
  const counts = new Map<string, number>();

  for (const result of results) {
    if (!result.notes) {
      continue;
    }

    for (const pattern of result.notes.split("; ").filter(Boolean)) {
      counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((left, right) => right.count - left.count || left.pattern.localeCompare(right.pattern));
}
