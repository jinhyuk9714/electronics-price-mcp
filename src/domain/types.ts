export type ProductCategory =
  | "laptop"
  | "keyboard"
  | "graphics-card"
  | "monitor"
  | "pc-part";

export type SearchSort = "relevance" | "price_asc" | "price_desc";
export type ExplainFocus = "lowest_price" | "seller_variety" | "brand";

export interface SearchProviderInput {
  query: string;
  category?: ProductCategory;
  sort: SearchSort;
  excludeUsed: boolean;
  limit: number;
}

export interface ProviderOffer {
  source: "naver-shopping";
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
}

export interface SearchProvider {
  searchProducts(input: SearchProviderInput): Promise<SearchProviderResult>;
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
  selectedProductId: string | null;
  offers: ProductOffer[];
  insight?: {
    focus: ExplainFocus;
    message: string;
  };
}
