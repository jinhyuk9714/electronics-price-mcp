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

const NOTEBOOK_MODEL_PATTERNS = [
  /\b(\d{2}Z[A-Z0-9]{3,})\s*[- ]\s*([A-Z0-9]{4,})\b/g,
  /\b([A-Z]{1,3}\d{3,}[A-Z0-9]{2,})\s*[- ]\s*([A-Z0-9]{3,})\b/g
] as const;

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

  const notebookModelCode = extractNotebookModelCode(normalized);
  if (notebookModelCode) {
    return notebookModelCode;
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

function extractNotebookModelCode(value: string): string | null {
  for (const pattern of NOTEBOOK_MODEL_PATTERNS) {
    for (const match of value.matchAll(pattern)) {
      const prefix = normalizeModelPart(match[1]);
      const suffix = normalizeModelPart(match[2]);

      if (isNotebookModelPart(prefix) && isNotebookModelPart(suffix)) {
        return `${prefix}-${suffix}`;
      }
    }
  }

  return null;
}

function normalizeModelPart(value: string): string {
  return value.replace(/[^A-Z0-9]/g, "");
}

function isNotebookModelPart(value: string): boolean {
  return value.length >= 4 && /[A-Z]/.test(value) && /\d/.test(value);
}
