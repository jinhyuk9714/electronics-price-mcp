import type {
  ProviderExecutionReport,
  ProviderExecutionStatus,
  SearchSource
} from "./types.js";

export interface ProviderRequestDiagnostics {
  providerStatuses: Partial<Record<SearchSource, ProviderExecutionStatus>>;
  providerOfferCounts: Partial<Record<SearchSource, number>>;
  partialProviderFailure: boolean;
  canonicalMallDedupeHits: number;
  crossSourceDuplicateDrops: number;
}

const providerDiagnosticsByResult = new WeakMap<object, ProviderRequestDiagnostics>();

export function attachProviderDiagnostics<T extends object>(
  result: T,
  diagnostics: ProviderRequestDiagnostics | undefined
): T {
  if (!diagnostics) {
    return result;
  }

  providerDiagnosticsByResult.set(result, diagnostics);

  return result;
}

export function readProviderDiagnostics(value: unknown): ProviderRequestDiagnostics | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return providerDiagnosticsByResult.get(value);
}

export function createProviderDiagnostics(
  reports: ProviderExecutionReport[] | undefined,
  mergeDiagnostics?: {
    canonicalMallDedupeHits: number;
    crossSourceDuplicateDrops: number;
  }
): ProviderRequestDiagnostics | undefined {
  const canonicalMallDedupeHits = mergeDiagnostics?.canonicalMallDedupeHits ?? 0;
  const crossSourceDuplicateDrops = mergeDiagnostics?.crossSourceDuplicateDrops ?? 0;

  if ((!reports || reports.length === 0) && canonicalMallDedupeHits === 0 && crossSourceDuplicateDrops === 0) {
    return undefined;
  }

  const providerStatuses: Partial<Record<SearchSource, ProviderExecutionStatus>> = {};
  const providerOfferCounts: Partial<Record<SearchSource, number>> = {};

  for (const report of reports ?? []) {
    providerStatuses[report.source] = report.status;
    providerOfferCounts[report.source] = report.offerCount;
  }

  return {
    providerStatuses,
    providerOfferCounts,
    partialProviderFailure:
      (reports ?? []).some((report) => report.status === "error") &&
      (reports ?? []).some((report) => report.status === "success"),
    canonicalMallDedupeHits,
    crossSourceDuplicateDrops
  };
}
