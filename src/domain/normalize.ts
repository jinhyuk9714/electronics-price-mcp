const BRAND_ALIASES: Record<string, string> = {
  "lg": "LG",
  "엘지": "LG",
  "lg전자": "LG",
  "samsung": "Samsung",
  "삼성": "Samsung",
  "삼성전자": "Samsung",
  "asus": "ASUS",
  "아수스": "ASUS",
  "에이수스": "ASUS",
  "msi": "MSI",
  "엠에스아이": "MSI",
  "hp": "HP",
  "dell": "Dell",
  "lenovo": "Lenovo",
  "레노버": "Lenovo",
  "logitech": "Logitech",
  "zotac": "ZOTAC"
};

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": "\"",
  "&#39;": "'"
};

const DASH_CHARACTERS = /[‐‑‒–—−]/g;

const NOTEBOOK_MODEL_PATTERNS = [
  /\b(\d{2}Z[A-Z0-9]{3,})\s*[- ]\s*([A-Z0-9]{4,})\b/g,
  /\b(\d{2})\s*[- ]\s*([A-Z]{1,2}\d{4}[A-Z]{2})\b/g,
  /\b([A-Z]{1,3}\d{3,}[A-Z0-9]{2,})\s*[- ]\s*([A-Z0-9]{3,})\b/g
] as const;

const NOTEBOOK_STANDALONE_MODEL_PATTERNS = [/\b([A-Z]{2}\d{4}[A-Z]{2})\b/g, /\b(\d{2}[A-Z]{3}\d{1,2})\b/g] as const;

const BROAD_QUERY_CUES = ["시리즈", "SERIES", "전부", "전체", "모델들", "라인업"] as const;

const NOTEBOOK_QUERY_CUES = [
  "노트북",
  "그램",
  "GALAXYBOOK",
  "갤럭시북",
  "MACBOOK",
  "맥북",
  "VIVOBOOK",
  "ZENBOOK",
  "THINKPAD",
  "IDEAPAD",
  "INSPIRON",
  "PAVILION"
] as const;

const GRAPHICS_QUERY_CUES = [
  "RTX",
  "RX",
  "GEFORCE",
  "RADEON",
  "그래픽카드",
  "그래픽 카드",
  "GPU"
] as const;

const NOTEBOOK_ACCESSORY_KEYWORDS = [
  "키스킨",
  "키커버",
  "케이스",
  "보호필름",
  "필름",
  "어댑터",
  "충전기",
  "케이블",
  "파우치",
  "가방",
  "커버",
  "덮개"
] as const;

const GPU_ACCESSORY_KEYWORDS = ["브라켓", "지지대", "안티 새깅", "라이저", "수직 거치", "쿨러"] as const;

const COMPLETE_PC_KEYWORDS = [
  "조립PC",
  "게이밍PC",
  "게이밍 컴퓨터",
  "게이밍컴퓨터",
  "컴퓨터 본체",
  "컴퓨터본체",
  "완본체",
  "데스크탑",
  "데스크톱",
  "PC본체"
] as const;

const RENTAL_KEYWORDS = ["렌탈", "대여", "임대", "월렌탈", "월 렌탈"] as const;

const TRAILING_INTENT_PATTERNS = [
  /\s*(?:가격\s*비교(?:해)?\s*줘|비교(?:해)?\s*줘)\s*$/i,
  /\s*(?:가격\s*설명(?:해)?\s*줘|설명(?:해)?\s*줘)\s*$/i,
  /\s*(?:지금\s*사도\s*괜찮은?\s*가격대야|지금\s*사도\s*괜찮아|지금\s*사도\s*돼)\s*$/i
] as const;

type NotebookFamilyLinePattern = {
  line: string;
  patterns: readonly RegExp[];
  brands?: readonly string[];
};

const NOTEBOOK_FAMILY_LINE_PATTERNS: readonly NotebookFamilyLinePattern[] = [
  {
    line: "GALAXYBOOK4 PRO 360",
    patterns: [/갤럭시북4\s*프로\s*360/i, /GALAXYBOOK\s*4\s*PRO\s*360/i]
  },
  { line: "GALAXYBOOK4 PRO", patterns: [/갤럭시북4\s*프로/i, /GALAXYBOOK\s*4\s*PRO/i] },
  { line: "GRAM PRO", patterns: [/그램\s*프로/i, /GRAM\s*PRO/i] },
  { line: "ROG ZEPHYRUS", patterns: [/ROG\s*ZEPHYRUS/i], brands: ["ASUS"] },
  { line: "ROG STRIX", patterns: [/ROG\s*STRIX/i], brands: ["ASUS"] },
  { line: "GRAM", patterns: [/그램/i, /GRAM/i] },
  { line: "CYBORG", patterns: [/\bCYBORG\b/i], brands: ["MSI"] },
  { line: "KATANA", patterns: [/\bKATANA\b/i], brands: ["MSI"] },
  { line: "SWORD", patterns: [/\bSWORD\b/i], brands: ["MSI"] },
  { line: "THIN", patterns: [/\bTHIN\b/i, /\bGF63\s*THIN\b/i], brands: ["MSI"] },
  { line: "VICTUS", patterns: [/빅터스/i, /VICTUS/i], brands: ["HP"] },
  { line: "OMEN", patterns: [/OMEN/i], brands: ["HP"] },
  { line: "TUF", patterns: [/\bTUF(?:\s*GAMING)?\b/i], brands: ["ASUS"] },
  { line: "LOQ", patterns: [/\bLOQ\b/i], brands: ["LENOVO"] },
  { line: "LEGION", patterns: [/리전/i, /LEGION/i], brands: ["LENOVO"] }
];

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
  const gpuModel = extractGpuModel(value);
  if (gpuModel) {
    return gpuModel;
  }

  const notebookModelCode = extractNotebookModelCode(value);
  if (notebookModelCode) {
    return notebookModelCode;
  }

  return null;
}

export function extractExactQueryModel(value: string): string | null {
  const simplifiedQuery = simplifyIntentQuery(value);
  const normalizedQuery = normalizeQuery(simplifiedQuery);
  if (BROAD_QUERY_CUES.some((cue) => normalizedQuery.includes(cue))) {
    return null;
  }

  if (detectBroadQueryKind(simplifiedQuery) === "laptop") {
    return extractNotebookModelCode(simplifiedQuery);
  }

  return extractNormalizedModel(simplifiedQuery);
}

export function isBroadExploratoryQuery(value: string): boolean {
  return extractExactQueryModel(simplifyIntentQuery(value)) === null;
}

export function detectBroadQueryKind(value: string): "graphics-card" | "laptop" | "other" {
  const normalizedQuery = normalizeQuery(simplifyIntentQuery(value));

  if (NOTEBOOK_QUERY_CUES.some((cue) => normalizedQuery.includes(cue))) {
    return "laptop";
  }

  if (GRAPHICS_QUERY_CUES.some((cue) => normalizedQuery.includes(cue))) {
    return "graphics-card";
  }

  return "other";
}

export function extractGpuModel(value: string): string | null {
  const normalized = normalizeModelText(value);

  const rtxMatch = normalized.match(/\bRTX\s*(\d{4})(?:\s*(TI|SUPER))?\b/);
  if (rtxMatch) {
    const variant = rtxMatch[2] ? ` ${rtxMatch[2]}` : "";
    return `RTX ${rtxMatch[1]}${variant}`;
  }

  const bareRtxMatch = normalized.match(/\b([4-5]0[5-9]0)(?:\s*(TI|SUPER))?\b/);
  if (bareRtxMatch) {
    const variant = bareRtxMatch[2] ? ` ${bareRtxMatch[2]}` : "";
    return `RTX ${bareRtxMatch[1]}${variant}`;
  }

  const rxMatch = normalized.match(/\bRX\s*(\d{4})(?:\s*(XT|GRE))?\b/);
  if (rxMatch) {
    const variant = rxMatch[2] ? ` ${rxMatch[2]}` : "";
    return `RX ${rxMatch[1]}${variant}`;
  }

  return null;
}

export function extractNotebookModelCode(value: string): string | null {
  const normalized = normalizeModelText(value);

  for (const pattern of NOTEBOOK_MODEL_PATTERNS) {
    for (const match of normalized.matchAll(pattern)) {
      const prefix = normalizeModelPart(match[1]);
      const suffix = normalizeModelPart(match[2]);

      if ((isNotebookModelPart(prefix) || isNotebookSizePrefix(prefix)) && isNotebookModelPart(suffix)) {
        return `${prefix}-${suffix}`;
      }
    }
  }

  for (const pattern of NOTEBOOK_STANDALONE_MODEL_PATTERNS) {
    for (const match of normalized.matchAll(pattern)) {
      const standaloneModel = normalizeModelPart(match[1]);

      if (isNotebookModelPart(standaloneModel)) {
        return standaloneModel;
      }
    }
  }

  return null;
}

export function extractRequestedNotebookGpuModel(value: string): string | null {
  const simplifiedQuery = simplifyIntentQuery(value);

  if (detectBroadQueryKind(simplifiedQuery) !== "laptop") {
    return null;
  }

  return extractGpuModel(simplifiedQuery);
}

export function extractNotebookFamilyKey(query: string, title: string, brand?: string | null): string | null {
  const simplifiedQuery = simplifyIntentQuery(query);

  if (detectBroadQueryKind(simplifiedQuery) !== "laptop") {
    return null;
  }

  if (extractNotebookModelCode(title)) {
    return null;
  }

  const line = extractNotebookFamilyLine(title, brand);
  if (!line) {
    return null;
  }

  const familyBrand = resolveNotebookFamilyBrand(brand, title, line);
  if (!familyBrand) {
    return null;
  }

  const size = extractNotebookFamilySize(title, simplifiedQuery, line);
  const requestedGpuModel = extractRequestedNotebookGpuModel(simplifiedQuery);
  const parts = ["NOTEBOOK_FAMILY", familyBrand, line];

  if (size) {
    parts.push(size);
  }

  if (requestedGpuModel) {
    parts.push(requestedGpuModel);
  }

  return parts.join("|");
}

export function resolvePrimaryModelForQuery(query: string, title: string): string | null {
  const simplifiedQuery = simplifyIntentQuery(query);
  const exactQueryModel = extractExactQueryModel(simplifiedQuery);
  const broadQueryKind = detectBroadQueryKind(simplifiedQuery);
  const notebookModelCode = extractNotebookModelCode(title);
  const gpuModel = extractGpuModel(title);

  if (exactQueryModel) {
    return isGpuModel(exactQueryModel) ? gpuModel : notebookModelCode;
  }

  if (broadQueryKind === "laptop") {
    return notebookModelCode;
  }

  if (broadQueryKind === "graphics-card") {
    return gpuModel;
  }

  return notebookModelCode ?? gpuModel;
}

export function classifyOfferTitle(value: string): {
  isRental: boolean;
  isDesktopPc: boolean;
  isGpuAccessory: boolean;
  isNotebookAccessory: boolean;
} {
  const normalizedTitle = normalizeQuery(value);

  return {
    isRental:
      RENTAL_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword)) ||
      ((normalizedTitle.includes("7일") || normalizedTitle.includes("30일")) &&
        RENTAL_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))),
    isDesktopPc: COMPLETE_PC_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword)),
    isGpuAccessory: GPU_ACCESSORY_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword)),
    isNotebookAccessory: NOTEBOOK_ACCESSORY_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))
  };
}

export function simplifyIntentQuery(value: string): string {
  const original = stripHtml(value).replace(DASH_CHARACTERS, "-").trim();
  let simplified = original.replace(/[?？!]+$/g, "").trim();

  while (true) {
    const next = TRAILING_INTENT_PATTERNS.reduce(
      (current, pattern) => current.replace(pattern, "").trim(),
      simplified
    ).replace(/[?？!]+$/g, "").trim();

    if (next === simplified) {
      break;
    }

    simplified = next;
  }

  return simplified || original;
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
  return stripHtml(value)
    .replace(DASH_CHARACTERS, "-")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeModelPart(value: string): string {
  return value.replace(/[^A-Z0-9]/g, "");
}

function isNotebookModelPart(value: string): boolean {
  return value.length >= 4 && /[A-Z]/.test(value) && /\d/.test(value);
}

function isNotebookSizePrefix(value: string): boolean {
  return /^\d{2}$/.test(value);
}

function isGpuModel(value: string): boolean {
  return value.startsWith("RTX ") || value.startsWith("RX ");
}

function extractNotebookFamilyLine(value: string, brand?: string | null): string | null {
  const normalizedTitle = normalizeQuery(value);
  const normalizedBrand = normalizeBrand(brand);
  const canonicalBrand = normalizedBrand ? normalizeQuery(normalizedBrand) : null;

  for (const entry of NOTEBOOK_FAMILY_LINE_PATTERNS) {
    if (!entry.patterns.some((pattern) => pattern.test(value))) {
      continue;
    }

    if (
      entry.brands &&
      !entry.brands.some((requiredBrand) => requiredBrand === canonicalBrand || normalizedTitle.includes(requiredBrand))
    ) {
      continue;
    }

      return entry.line;
  }

  return null;
}

function resolveNotebookFamilyBrand(brand: string | null | undefined, title: string, line: string): string | null {
  const normalizedBrand = normalizeBrand(brand);
  const canonicalBrand = normalizedBrand ? normalizeQuery(normalizedBrand) : null;
  if (canonicalBrand && ["LG", "SAMSUNG", "HP", "LENOVO", "MSI", "ASUS", "DELL"].includes(canonicalBrand)) {
    return canonicalBrand;
  }

  const normalizedTitle = normalizeQuery(title);

  if (normalizedTitle.includes("HP") || line === "VICTUS" || line === "OMEN") {
    return "HP";
  }

  if (normalizedTitle.includes("LENOVO") || normalizedTitle.includes("레노버") || line === "LEGION" || line === "LOQ") {
    return "LENOVO";
  }

  if (normalizedTitle.includes("LG") || normalizedTitle.includes("엘지") || line === "GRAM" || line === "GRAM PRO") {
    return "LG";
  }

  if (normalizedTitle.includes("SAMSUNG") || line.startsWith("GALAXYBOOK")) {
    return "SAMSUNG";
  }

  if (
    normalizedTitle.includes("ASUS") ||
    normalizedTitle.includes("아수스") ||
    normalizedTitle.includes("에이수스") ||
    line === "TUF" ||
    line === "ROG STRIX" ||
    line === "ROG ZEPHYRUS"
  ) {
    return "ASUS";
  }

  if (
    normalizedTitle.includes("MSI") ||
    normalizedTitle.includes("엠에스아이") ||
    line === "CYBORG" ||
    line === "KATANA" ||
    line === "SWORD" ||
    line === "THIN"
  ) {
    return "MSI";
  }

  return null;
}

function extractNotebookFamilySize(title: string, query: string, line: string): string | null {
  const titleSize = extractFamilySizeFromText(title, line);
  if (titleSize) {
    return titleSize;
  }

  return extractFamilySizeFromText(query, line);
}

function extractFamilySizeFromText(value: string, line: string): string | null {
  const normalizedValue = normalizeQuery(value);
  const linePattern = line
    .replace(/\s+/g, "\\s*")
    .replace("GRAM\\s*PRO", "GRAM\\s*PRO")
    .replace("GALAXYBOOK4\\s*PRO\\s*360", "GALAXYBOOK\\s*4\\s*PRO\\s*360")
    .replace("GALAXYBOOK4\\s*PRO", "GALAXYBOOK\\s*4\\s*PRO");

  const sizeMatch = normalizedValue.match(new RegExp(`${linePattern}\\s*(13|14|15|16|17|18)`));
  if (sizeMatch?.[1]) {
    return sizeMatch[1];
  }

  const bareSizeMatch = normalizedValue.match(/(?:^|[^0-9])(13|14|15|16|17|18)(?![0-9])/);
  if (bareSizeMatch?.[1]) {
    return bareSizeMatch[1];
  }

  return null;
}

function normalizeModelText(value: string): string {
  return stripHtml(value)
    .replace(DASH_CHARACTERS, "-")
    .replace(/\s*-\s*/g, "-")
    .toUpperCase();
}
