export type ServiceQualityTargetName = "production" | "danawa-canary";

export interface ServiceQualityTargetConfig {
  name: ServiceQualityTargetName;
  baseUrl: string;
  mcpUrl: string;
}

export interface ServiceQualityExecutionConfig {
  target: ServiceQualityTargetName;
  baseUrl: string;
  mcpUrl: string;
}

export interface ServiceQualityReportFileConfig {
  jsonReportFile: string;
  markdownReportFile: string;
}

const TARGET_CONFIGS: Record<ServiceQualityTargetName, ServiceQualityTargetConfig> = {
  production: {
    name: "production",
    baseUrl: "https://electronics-price-mcp.jinhyuk9714.workers.dev",
    mcpUrl: "https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp"
  },
  "danawa-canary": {
    name: "danawa-canary",
    baseUrl: "https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev",
    mcpUrl: "https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev/mcp"
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

  if (requestedTarget !== "production" && requestedTarget !== "danawa-canary") {
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
    baseUrl: env.SERVICE_QUALITY_BASE_URL?.trim() || targetConfig.baseUrl,
    mcpUrl: env.SERVICE_QUALITY_MCP_URL?.trim() || targetConfig.mcpUrl
  };
}

export function resolveServiceQualityReportFiles(
  target: ServiceQualityTargetName,
  files: ServiceQualityReportFileConfig
): ServiceQualityReportFileConfig {
  if (target === "production") {
    return files;
  }

  return {
    jsonReportFile: `${target}-${files.jsonReportFile}`,
    markdownReportFile: `${target}-${files.markdownReportFile}`
  };
}
