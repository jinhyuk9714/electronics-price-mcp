import type {
  SearchProvider,
  SearchProviderInput,
  SearchProviderResult
} from "../domain/types.js";

export class AggregateSearchProvider implements SearchProvider {
  readonly source = "naver-shopping" as const;

  constructor(private readonly providers: SearchProvider[]) {}

  async searchProducts(input: SearchProviderInput): Promise<SearchProviderResult> {
    const results = await Promise.allSettled(
      this.providers.map((provider) => provider.searchProducts(input))
    );
    const providerReports = results.map((result, index) => {
      const provider = this.providers[index]!;

      if (result.status === "fulfilled") {
        return {
          source: provider.source,
          status: "success" as const,
          offerCount: result.value.offers.length
        };
      }

      return {
        source: provider.source,
        status: "error" as const,
        offerCount: 0
      };
    });
    const successfulResults = results.filter(
      (result): result is PromiseFulfilledResult<SearchProviderResult> => result.status === "fulfilled"
    );

    if (successfulResults.length === 0) {
      const firstFailure = results.find(
        (result): result is PromiseRejectedResult => result.status === "rejected"
      );

      if (firstFailure?.reason instanceof Error) {
        throw firstFailure.reason;
      }

      throw new Error("검색 provider 요청에 모두 실패했습니다.");
    }

    return {
      query: input.query,
      offers: successfulResults.flatMap((result) => result.value.offers),
      providerReports
    };
  }
}
