export interface ServiceQualityGateTotals {
  pass: number;
  softFail: number;
  fail: number;
}

export interface MultisourceMergeGateTotals {
  pass: number;
  fail: number;
}

export function resolveStrictMode(
  argv: string[] = process.argv.slice(2),
  env: Record<string, string | undefined> = process.env
): boolean {
  if (argv.includes("--strict")) {
    return true;
  }

  const inlineArg = argv.find((item) => item.startsWith("--strict="));
  const inlineValue = inlineArg?.split("=")[1]?.trim();
  const envValue = env.EVAL_STRICT?.trim();

  return isTruthy(inlineValue ?? envValue);
}

export function shouldFailServiceQualityGate(
  totals: ServiceQualityGateTotals,
  strict: boolean
): boolean {
  return strict && (totals.softFail > 0 || totals.fail > 0);
}

export function shouldFailMultisourceMergeGate(
  totals: MultisourceMergeGateTotals,
  strict: boolean
): boolean {
  return strict && totals.fail > 0;
}

function isTruthy(value?: string): boolean {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
