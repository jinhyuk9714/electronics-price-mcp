const BRAND_ALIASES: Record<string, string> = {
  "lg": "LG",
  "lg전자": "LG",
  "samsung": "Samsung",
  "삼성": "Samsung",
  "삼성전자": "Samsung",
  "asus": "ASUS",
  "msi": "MSI",
  "hp": "HP",
  "dell": "Dell",
  "lenovo": "Lenovo",
  "logitech": "Logitech",
  "zotac": "ZOTAC"
};

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": "\"",
  "&#39;": "'"
};

export function stripHtml(value: string): string {
  const withoutTags = value.replace(/<[^>]+>/g, " ");
  const decoded = Object.entries(HTML_ENTITIES).reduce(
    (text, [entity, replacement]) => text.split(entity).join(replacement),
    withoutTags
  );

  return decoded.replace(/\s+/g, " ").trim();
}

export function normalizeBrand(value: string | null | undefined): string | null {
  const normalized = stripHtml(value ?? "").trim();

  if (!normalized) {
    return null;
  }

  const key = normalized.toLowerCase();
  const alias = BRAND_ALIASES[key];

  if (alias) {
    return alias;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

export function extractNormalizedModel(value: string): string | null {
  const normalized = stripHtml(value).toUpperCase();

  const rtxMatch = normalized.match(/\bRTX\s*(\d{4})(?:\s*(TI|SUPER))?\b/);
  if (rtxMatch) {
    const variant = rtxMatch[2] ? ` ${rtxMatch[2]}` : "";
    return `RTX ${rtxMatch[1]}${variant}`;
  }

  const rxMatch = normalized.match(/\bRX\s*(\d{4})(?:\s*(XT|GRE))?\b/);
  if (rxMatch) {
    const variant = rxMatch[2] ? ` ${rxMatch[2]}` : "";
    return `RX ${rxMatch[1]}${variant}`;
  }

  const modelCodeMatch = normalized.match(/\b[0-9]{2}[A-Z0-9]{3,}-[A-Z0-9]{4,}\b/);
  if (modelCodeMatch) {
    return modelCodeMatch[0];
  }

  return null;
}

export function isAmbiguousComparison(
  query: string,
  offers: Array<{ normalizedModel: string | null }>
): boolean {
  const models = new Set(
    offers
      .map((offer) => offer.normalizedModel)
      .filter((model): model is string => Boolean(model))
  );

  if (models.size > 1) {
    return true;
  }

  if (models.size === 0) {
    return offers.length > 1 && stripHtml(query).trim().length > 0;
  }

  return false;
}

export function normalizeQuery(value: string): string {
  return stripHtml(value).toUpperCase().replace(/\s+/g, " ").trim();
}
