export type ServiceQualityTargetName = "production" | "danawa-canary" | "static-canary-local";
export type ServiceQualityTargetMode = "live" | "static-local";

export interface ServiceQualityTargetConfig {
  name: ServiceQualityTargetName;
  mode: ServiceQualityTargetMode;
  baseUrl: string;
  mcpUrl: string;
  reportPrefix?: string;
  localEnv?: Record<string, string>;
}

export interface ServiceQualityExecutionConfig {
  target: ServiceQualityTargetName;
  mode: ServiceQualityTargetMode;
  baseUrl: string;
  mcpUrl: string;
  localEnv?: Record<string, string>;
}

export interface ServiceQualityReportFileConfig {
  jsonReportFile: string;
  markdownReportFile: string;
}

const TARGET_CONFIGS: Record<ServiceQualityTargetName, ServiceQualityTargetConfig> = {
  production: {
    name: "production",
    mode: "live",
    baseUrl: "https://electronics-price-mcp.jinhyuk9714.workers.dev",
    mcpUrl: "https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp"
  },
  "danawa-canary": {
    name: "danawa-canary",
    mode: "live",
    baseUrl: "https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev",
    mcpUrl: "https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev/mcp",
    reportPrefix: "danawa-canary"
  },
  "static-canary-local": {
    name: "static-canary-local",
    mode: "static-local",
    baseUrl: "static-canary-local://local",
    mcpUrl: "static-canary-local://local/mcp",
    reportPrefix: "static-canary",
    localEnv: {
      ENABLE_STATIC_CATALOG: "true",
      STATIC_CATALOG_DATASET: "canary-eval-v1"
    }
  }
};

export function getServiceQualityTargetConfig(
  name: ServiceQualityTargetName = "production"
): ServiceQualityTargetConfig {
  return TARGET_CONFIGS[name];
}

export function resolveServiceQualityTargetName(
  argv: string[] = process.argv.slice(2),
  env: Record<string, string | undefined> = process.env
): ServiceQualityTargetName {
  const inlineArg = argv.find((item) => item.startsWith("--target="));
  const inlineValue = inlineArg?.split("=")[1]?.trim();

  const flagIndex = argv.findIndex((item) => item === "--target");
  const nextValue = flagIndex >= 0 ? argv[flagIndex + 1]?.trim() : undefined;

  const requestedTarget = inlineValue || nextValue || env.SERVICE_QUALITY_TARGET?.trim() || "production";

  if (
    requestedTarget !== "production" &&
    requestedTarget !== "danawa-canary" &&
    requestedTarget !== "static-canary-local"
  ) {
    throw new Error(`지원하지 않는 평가 타깃입니다: ${requestedTarget}`);
  }

  return requestedTarget;
}

export function resolveServiceQualityExecutionConfig(
  argv: string[] = process.argv.slice(2),
  env: Record<string, string | undefined> = process.env
): ServiceQualityExecutionConfig {
  const target = resolveServiceQualityTargetName(argv, env);
  const targetConfig = getServiceQualityTargetConfig(target);

  return {
    target,
    mode: targetConfig.mode,
    baseUrl:
      targetConfig.mode === "live"
        ? env.SERVICE_QUALITY_BASE_URL?.trim() || targetConfig.baseUrl
        : targetConfig.baseUrl,
    mcpUrl:
      targetConfig.mode === "live"
        ? env.SERVICE_QUALITY_MCP_URL?.trim() || targetConfig.mcpUrl
        : targetConfig.mcpUrl,
    ...(targetConfig.localEnv ? { localEnv: targetConfig.localEnv } : {})
  };
}

export function resolveServiceQualityReportFiles(
  target: ServiceQualityTargetName,
  files: ServiceQualityReportFileConfig
): ServiceQualityReportFileConfig {
  const targetConfig = getServiceQualityTargetConfig(target);
  const prefix = targetConfig.reportPrefix;

  if (!prefix) {
    return files;
  }

  return {
    jsonReportFile: `${prefix}-${files.jsonReportFile}`,
    markdownReportFile: `${prefix}-${files.markdownReportFile}`
  };
}
