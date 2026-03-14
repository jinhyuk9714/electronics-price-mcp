export type ProductCategory =
  | "laptop"
  | "keyboard"
  | "graphics-card"
  | "monitor"
  | "pc-part";

export type SearchSort = "relevance" | "price_asc" | "price_desc";
export type ExplainFocus = "lowest_price" | "seller_variety" | "brand";
export type SearchSource = "naver-shopping" | "danawa" | "static-catalog";
export type ProviderExecutionStatus = "success" | "error";

export interface SearchProviderInput {
  query: string;
  category?: ProductCategory;
  sort: SearchSort;
  excludeUsed: boolean;
  limit: number;
}

export interface ProviderOffer {
  source: SearchSource;
  sourceProductId: string;
  title: string;
  brand: string | null;
  mallName: string;
  price: number;
  link: string;
  image: string | null;
}

export interface SearchProviderResult {
  query: string;
  offers: ProviderOffer[];
  providerReports?: ProviderExecutionReport[];
}

export interface SearchProvider {
  source: SearchSource;
  searchProducts(input: SearchProviderInput): Promise<SearchProviderResult>;
}

export interface ProviderExecutionReport {
  source: SearchSource;
  status: ProviderExecutionStatus;
  offerCount: number;
}

export interface ProductOffer extends ProviderOffer {
  productId: string;
  normalizedModel: string | null;
  matchConfidence: number;
}

export interface ProductGroup {
  productId: string;
  normalizedModel: string | null;
  title: string;
  brand: string | null;
  minPrice: number;
  maxPrice: number;
  offerCount: number;
  matchConfidence: number;
}

export interface SearchProductsInput extends SearchProviderInput {
  budgetMax?: number;
}

export interface SearchProductsResult {
  [key: string]: unknown;
  query: string;
  summary: string;
  warning?: string;
  offers: ProductOffer[];
  groups: ProductGroup[];
}

export interface CompareProductPricesInput {
  productId?: string;
  query?: string;
  maxOffers?: number;
}

export interface CompareProductPricesResult {
  [key: string]: unknown;
  query: string;
  status: "ok" | "ambiguous" | "not_found";
  summary: string;
  warning?: string;
  suggestedQueries?: string[];
  selectedProductId: string | null;
  offers: ProductOffer[];
  comparison?: {
    normalizedModel: string | null;
    minPrice: number;
    maxPrice: number;
    mallCount: number;
    spread: number;
  };
}

export interface ExplainPurchaseOptionsInput {
  productId?: string;
  query?: string;
  focus?: ExplainFocus;
}

export interface ExplainPurchaseOptionsResult {
  [key: string]: unknown;
  query: string;
  status: "ok" | "ambiguous" | "not_found";
  summary: string;
  warning?: string;
  suggestedQueries?: string[];
  selectedProductId: string | null;
  offers: ProductOffer[];
  insight?: {
    focus: ExplainFocus;
    message: string;
  };
}
