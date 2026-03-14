import { AggregateSearchProvider } from "../src/providers/aggregateSearchProvider.ts";
import { createSearchProviders } from "../src/server/createPriceService.ts";
import type { ProductCategory, SearchProviderInput } from "../src/domain/types.ts";
import type { RuntimeEnv } from "../src/config.ts";

const DEFAULT_QUERY = "RTX 5070";

async function main() {
  const args = new Map<string, string>();

  for (let index = 2; index < process.argv.length; index += 1) {
    const current = process.argv[index];
    const next = process.argv[index + 1];

    if (current?.startsWith("--") && next && !next.startsWith("--")) {
      args.set(current.slice(2), next);
      index += 1;
    }
  }

  const query = args.get("query") ?? DEFAULT_QUERY;
  const category = parseCategory(args.get("category"));
  const limit = Number.parseInt(args.get("limit") ?? "10", 10) || 10;
  const env = process.env as unknown as RuntimeEnv;

  const scenarios: Array<{ name: string; env: RuntimeEnv }> = [
    {
      name: "static-only",
      env: {
        ENABLE_STATIC_CATALOG: "true",
        STATIC_CATALOG_DATASET: env.STATIC_CATALOG_DATASET || "core-exact-v1"
      }
    }
  ];

  if (env.NAVER_CLIENT_ID && env.NAVER_CLIENT_SECRET) {
    scenarios.push({
      name: "naver+static",
      env: {
        ...env,
        ENABLE_STATIC_CATALOG: "true",
        STATIC_CATALOG_DATASET: env.STATIC_CATALOG_DATASET || "core-exact-v1"
      }
    });
  }

  if (env.ENABLE_DANAWA === "true" && env.DANAWA_CLIENT_ID && env.DANAWA_CLIENT_SECRET) {
    scenarios.push({
      name: "danawa+static",
      env: {
        ...env,
        ENABLE_STATIC_CATALOG: "true",
        STATIC_CATALOG_DATASET: env.STATIC_CATALOG_DATASET || "core-exact-v1"
      }
    });
  }

  for (const scenario of scenarios) {
    const providers = createSearchProviders(scenario.env);
    const aggregateProvider = new AggregateSearchProvider(providers);
    const input: SearchProviderInput = {
      query,
      category,
      sort: "relevance",
      excludeUsed: true,
      limit
    };

    console.log(`\n[${scenario.name}] providers=${providers.map((provider) => provider.source).join(", ")}`);

    const result = await aggregateProvider.searchProducts(input);

    console.log(`[${scenario.name}] reports=${JSON.stringify(result.providerReports ?? [], null, 2)}`);
    console.log(`[${scenario.name}] offers=${result.offers.length}`);

    for (const offer of result.offers.slice(0, 5)) {
      console.log(`- [${offer.source}] ${offer.mallName} | ${offer.price}원 | ${offer.title}`);
    }
  }
}

function parseCategory(value: string | undefined): ProductCategory | undefined {
  if (
    value === "laptop" ||
    value === "keyboard" ||
    value === "graphics-card" ||
    value === "monitor" ||
    value === "pc-part"
  ) {
    return value;
  }

  return undefined;
}

void main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
