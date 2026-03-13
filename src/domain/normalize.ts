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
  "asrock": "ASRock",
  "애즈락": "ASRock",
  "biostar": "BIOSTAR",
  "바이오스타": "BIOSTAR",
  "gigabyte": "GIGABYTE",
  "기가바이트": "GIGABYTE",
  "coolermaster": "CoolerMaster",
  "쿨러마스터": "CoolerMaster",
  "msi": "MSI",
  "엠에스아이": "MSI",
  "hp": "HP",
  "dell": "Dell",
  "amd": "AMD",
  "wd": "WD",
  "wd_black": "WD",
  "wd black": "WD",
  "키크론": "Keychron",
  "keychron": "Keychron",
  "앱코": "ABKO",
  "abko": "ABKO",
  "drunkdeer": "DrunkDeer",
  "클레브": "KLEVV",
  "klevv": "KLEVV",
  "에센코어": "KLEVV",
  "superflower": "SuperFlower",
  "lenovo": "Lenovo",
  "레노버": "Lenovo",
  "logitech": "Logitech",
  "로지텍": "Logitech",
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

const BROAD_QUERY_CUES = ["시리즈", "SERIES", "전부", "전체", "모델들", "라인업", "계열"] as const;

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
  "NVIDIA",
  "엔비디아",
  "지포스",
  "라데온",
  "그래픽카드",
  "그래픽 카드",
  "GPU"
] as const;

const KEYBOARD_QUERY_CUES = [
  "키보드",
  "KEYBOARD",
  "기계식",
  "MECHANICAL",
  "무선",
  "WIRELESS",
  "KEYCHRON",
  "키크론",
  "LOGITECH",
  "로지텍",
  "ABKO",
  "앱코",
  "DRUNKDEER"
] as const;

const MONITOR_QUERY_CUES = [
  "모니터",
  "MONITOR",
  "4K",
  "UHD",
  "QHD",
  "FHD",
  "울트라와이드",
  "ULTRAWIDE"
] as const;

const PC_PART_QUERY_CUES = [
  "메인보드",
  "MOTHERBOARD",
  "파워",
  "PSU",
  "메모리",
  "MEMORY",
  "램",
  "RAM",
  "DDR5",
  "DDR4",
  "SSD",
  "NVME",
  "RYZEN",
  "INTEL",
  "B650"
] as const;

const MONITOR_DEVICE_CUES = ["모니터", "MONITOR", "인치", "QHD", "UHD", "4K", "FHD", "OLED"] as const;

const CANONICAL_BRAND_CUES = [
  { canonical: "KEYCHRON", cues: ["KEYCHRON", "키크론"] },
  { canonical: "LOGITECH", cues: ["LOGITECH", "로지텍"] },
  { canonical: "ABKO", cues: ["ABKO", "앱코"] },
  { canonical: "DRUNKDEER", cues: ["DRUNKDEER"] },
  { canonical: "LG", cues: ["LG", "엘지"] },
  { canonical: "DELL", cues: ["DELL"] },
  { canonical: "MSI", cues: ["MSI", "엠에스아이"] },
  { canonical: "SAMSUNG", cues: ["SAMSUNG", "삼성"] },
  { canonical: "ASUS", cues: ["ASUS", "아수스", "에이수스"] },
  { canonical: "ASROCK", cues: ["ASROCK", "애즈락"] },
  { canonical: "BIOSTAR", cues: ["BIOSTAR", "바이오스타"] },
  { canonical: "GIGABYTE", cues: ["GIGABYTE", "기가바이트"] },
  { canonical: "COOLERMASTER", cues: ["COOLERMASTER", "쿨러마스터"] },
  { canonical: "SUPERFLOWER", cues: ["SUPERFLOWER"] },
  { canonical: "WD", cues: ["WD", "WD BLACK", "WD_BLACK"] },
  { canonical: "KLEVV", cues: ["KLEVV", "클레브", "에센코어"] }
] as const;

const GPU_VENDOR_OR_FAMILY_CUES = ["NVIDIA", "엔비디아", "GEFORCE", "지포스", "RADEON", "라데온"] as const;

const GRAPHICS_DEVICE_CUES = ["그래픽카드", "그래픽 카드", "VGA", "지포스", "GEFORCE", "라데온", "RADEON"] as const;

const NON_GRAPHICS_DEVICE_KEYWORDS = [
  "호환",
  "PROGRAMMING",
  "프로그래밍",
  "DOWNLOAD",
  "다운로드",
  "MODULE",
  "모듈",
  "PLC",
  "CONTROL",
  "컨트롤",
  "산업"
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

const KEYBOARD_MOUSE_KEYWORDS = ["마우스", "MOUSE", "마우스패드", "MOUSEPAD"] as const;
const KEYBOARD_OFFICE_TITLE_KEYWORDS = ["사무용", "오피스", "OFFICE", "저소음 사무용"] as const;
const KEYBOARD_ERGONOMIC_KEYWORDS = ["인체공학", "ERGONOMIC"] as const;
const KEYBOARD_GAMING_TITLE_KEYWORDS = ["게이밍", "GAMING", "RGB", "RAPIDTRIGGER", "RAPID TRIGGER"] as const;
const KEYBOARD_MEMBRANE_KEYWORDS = ["멤브레인", "MEMBRANE"] as const;
const KEYBOARD_FULLSIZE_KEYWORDS = ["풀배열", "104키", "108키", "110키", "NUMPAD", "숫자키", "키패드"] as const;
const KEYBOARD_OFFICE_QUERY_CUES = ["사무용", "오피스", "OFFICE", "업무용"] as const;
const KEYBOARD_TENKEYLESS_QUERY_CUES = ["텐키리스", "TKL"] as const;
const KEYBOARD_MECHANICAL_QUERY_CUES = ["기계식", "MECHANICAL"] as const;
const KEYBOARD_WIRELESS_QUERY_CUES = ["무선", "WIRELESS"] as const;
const KEYBOARD_GAMING_QUERY_CUES = ["게이밍", "GAMING"] as const;

const LAPTOP_GAMING_QUERY_CUES = ["게이밍", "GAMING"] as const;
const LAPTOP_OFFICE_TITLE_KEYWORDS = ["사무용", "인강용", "학생용", "업무용"] as const;

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

export type BroadQueryIntentProfile =
  | {
      category: "keyboard";
      gaming: boolean;
      office: boolean;
      mechanical: boolean;
      wireless: boolean;
      tenkeyless: boolean;
    }
  | {
      category: "laptop";
      gaming: boolean;
    }
  | {
      category: "other";
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

  return extractNonLaptopExactModel(value);
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

  const notebookModelCode = extractNotebookModelCode(simplifiedQuery);
  if (notebookModelCode) {
    return notebookModelCode;
  }

  const gpuQueryModel = extractGpuQueryModel(simplifiedQuery);
  if (gpuQueryModel) {
    if (gpuQueryModel.specificity === "bare" && hasBroadGpuFamilyCue(simplifiedQuery)) {
      return null;
    }

    return gpuQueryModel.model;
  }

  return extractNonLaptopExactModel(simplifiedQuery);
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

export function detectSupplementalQueryKind(value: string): "keyboard" | "monitor" | "pc-part" | "other" {
  const normalizedQuery = normalizeQuery(simplifyIntentQuery(value));

  if (KEYBOARD_QUERY_CUES.some((cue) => normalizedQuery.includes(cue))) {
    return "keyboard";
  }

  if (
    MONITOR_QUERY_CUES.some((cue) => normalizedQuery.includes(cue)) ||
    /\b(24|27|29|32|34|38|40|43)\s*(인치|형)\b/.test(normalizedQuery)
  ) {
    return "monitor";
  }

  if (
    PC_PART_QUERY_CUES.some((cue) => normalizedQuery.includes(cue)) ||
    /\b\d{3,4}W\b/.test(normalizedQuery) ||
    /\b(16GB|32GB|64GB|1TB|2TB|4TB)\b/.test(normalizedQuery)
  ) {
    return "pc-part";
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

export function extractBroadGpuSuggestionModels(value: string): string[] {
  const simplifiedQuery = simplifyIntentQuery(value);

  if (extractExactQueryModel(simplifiedQuery) || detectBroadQueryKind(simplifiedQuery) !== "graphics-card") {
    return [];
  }

  const queryModel = extractGpuQueryModel(simplifiedQuery);
  if (!queryModel) {
    return [];
  }

  const normalizedQuery = normalizeQuery(simplifiedQuery);
  const suggestions = [queryModel.model];
  const hasSeriesCue = BROAD_QUERY_CUES.some((cue) => normalizedQuery.includes(cue));

  if (hasSeriesCue) {
    if (
      queryModel.model.startsWith("RTX ") &&
      !queryModel.model.includes(" TI") &&
      !queryModel.model.includes(" SUPER")
    ) {
      suggestions.push(`${queryModel.model} TI`);
    }

    if (
      queryModel.model.startsWith("RX ") &&
      !queryModel.model.includes(" XT") &&
      !queryModel.model.includes(" GRE")
    ) {
      suggestions.push(`${queryModel.model} XT`);
    }
  }

  return Array.from(new Set(suggestions));
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
  const supplementalQueryKind = detectSupplementalQueryKind(simplifiedQuery);
  const notebookModelCode = extractNotebookModelCode(title);
  const gpuModel = extractGpuModel(title);
  const nonLaptopExactModel = extractNonLaptopExactModel(title);

  if (exactQueryModel) {
    if (isGpuModel(exactQueryModel)) {
      return gpuModel;
    }

    return notebookModelCode ?? nonLaptopExactModel;
  }

  if (broadQueryKind === "laptop") {
    return notebookModelCode;
  }

  if (broadQueryKind === "graphics-card") {
    return gpuModel;
  }

  if (supplementalQueryKind === "keyboard") {
    return nonLaptopExactModel ?? extractBroadKeyboardModel(title);
  }

  if (supplementalQueryKind === "monitor") {
    return nonLaptopExactModel ?? extractBroadMonitorModel(title);
  }

  if (supplementalQueryKind === "pc-part") {
    return nonLaptopExactModel ?? extractBroadPcPartModel(simplifiedQuery, title);
  }

  return nonLaptopExactModel ?? notebookModelCode ?? gpuModel;
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

export function getBroadQueryIntentProfile(value: string): BroadQueryIntentProfile {
  const simplifiedQuery = simplifyIntentQuery(value);
  const normalizedQuery = normalizeQuery(simplifiedQuery);

  if (detectSupplementalQueryKind(simplifiedQuery) === "keyboard") {
    return {
      category: "keyboard",
      gaming: KEYBOARD_GAMING_QUERY_CUES.some((cue) => normalizedQuery.includes(cue)),
      office: KEYBOARD_OFFICE_QUERY_CUES.some((cue) => normalizedQuery.includes(cue)),
      mechanical: KEYBOARD_MECHANICAL_QUERY_CUES.some((cue) => normalizedQuery.includes(cue)),
      wireless: KEYBOARD_WIRELESS_QUERY_CUES.some((cue) => normalizedQuery.includes(cue)),
      tenkeyless: KEYBOARD_TENKEYLESS_QUERY_CUES.some((cue) => normalizedQuery.includes(cue))
    };
  }

  if (detectBroadQueryKind(simplifiedQuery) === "laptop") {
    return {
      category: "laptop",
      gaming: LAPTOP_GAMING_QUERY_CUES.some((cue) => normalizedQuery.includes(cue))
    };
  }

  return {
    category: "other"
  };
}

export function isQueryIntentMismatch(query: string, title: string): boolean {
  const profile = getBroadQueryIntentProfile(query);
  const normalizedTitle = normalizeQuery(title);

  if (profile.category === "keyboard") {
    if (KEYBOARD_MOUSE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) {
      return true;
    }

    if (profile.gaming) {
      if (KEYBOARD_OFFICE_TITLE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) {
        return true;
      }

      if (KEYBOARD_ERGONOMIC_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) {
        return true;
      }
    }

    if (profile.office) {
      if (KEYBOARD_GAMING_TITLE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) {
        return true;
      }
    }

    if (profile.mechanical) {
      if (KEYBOARD_MEMBRANE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) {
        return true;
      }

      if (KEYBOARD_OFFICE_TITLE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) {
        return true;
      }
    }

    if (profile.tenkeyless && KEYBOARD_FULLSIZE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) {
      return true;
    }

    return false;
  }

  if (profile.category === "laptop" && profile.gaming) {
    return LAPTOP_OFFICE_TITLE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword));
  }

  return false;
}

export function isGraphicsDeviceLikeTitle(value: string): boolean {
  const normalizedTitle = normalizeQuery(value);

  if (NON_GRAPHICS_DEVICE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) {
    return false;
  }

  if (extractGpuModel(value)) {
    return true;
  }

  return GRAPHICS_DEVICE_CUES.some((cue) => normalizedTitle.includes(cue));
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

function extractGpuQueryModel(value: string): { model: string; specificity: "explicit" | "bare" } | null {
  const normalized = normalizeModelText(value);

  const explicitRtxMatch = normalized.match(/\bRTX\s*(\d{4})(?:\s*(TI|SUPER))?\b/);
  if (explicitRtxMatch) {
    const variant = explicitRtxMatch[2] ? ` ${explicitRtxMatch[2]}` : "";
    return {
      model: `RTX ${explicitRtxMatch[1]}${variant}`,
      specificity: "explicit"
    };
  }

  const bareRtxMatch = normalized.match(/\b([4-5]0[5-9]0)(?:\s*(TI|SUPER))?\b/);
  if (bareRtxMatch) {
    const variant = bareRtxMatch[2] ? ` ${bareRtxMatch[2]}` : "";
    return {
      model: `RTX ${bareRtxMatch[1]}${variant}`,
      specificity: "bare"
    };
  }

  const explicitRxMatch = normalized.match(/\bRX\s*(\d{4})(?:\s*(XT|GRE))?\b/);
  if (explicitRxMatch) {
    const variant = explicitRxMatch[2] ? ` ${explicitRxMatch[2]}` : "";
    return {
      model: `RX ${explicitRxMatch[1]}${variant}`,
      specificity: "explicit"
    };
  }

  const bareRxMatch = normalized.match(/\b(9\d{3})(?:\s*(XT|GRE))?\b/);
  if (bareRxMatch) {
    const variant = bareRxMatch[2] ? ` ${bareRxMatch[2]}` : "";
    return {
      model: `RX ${bareRxMatch[1]}${variant}`,
      specificity: "bare"
    };
  }

  return null;
}

function hasBroadGpuFamilyCue(value: string): boolean {
  const normalized = normalizeQuery(value);

  return GPU_VENDOR_OR_FAMILY_CUES.some((cue) => normalized.includes(cue));
}

function extractBroadKeyboardModel(value: string): string | null {
  const normalized = normalizeQuery(value);

  if (!(normalized.includes("KEYCHRON") || normalized.includes("키크론"))) {
    return null;
  }

  const modelMatch = normalized.match(/\b([A-Z]\d{1,2})(?:\s*(PRO|MAX|SE2|SE|HE|PLUS))?\b/);
  if (!modelMatch) {
    return null;
  }

  const suffix = modelMatch[2] ? ` ${modelMatch[2]}` : "";
  return `KEYCHRON ${modelMatch[1]}${suffix}`;
}

function extractBroadMonitorModel(value: string): string | null {
  const normalized = normalizeQuery(value);

  if (!MONITOR_DEVICE_CUES.some((cue) => normalized.includes(cue))) {
    return null;
  }

  const candidates = [
    ...normalized.matchAll(/\b([A-Z]{1,3}\d{2,3}[A-Z]{1,4}\d{0,3}[A-Z]?)\b/g),
    ...normalized.matchAll(/\b(\d{2,3}[A-Z]{1,4}\d{0,3}[A-Z]?)\b/g)
  ]
    .map((match) => match[1])
    .filter((candidate) => isLikelyMonitorModelCode(candidate));

  const candidate = candidates[0];
  if (!candidate) {
    return null;
  }

  const brand = extractCanonicalBrandFromText(normalized);
  return brand ? `${brand} ${candidate}` : candidate;
}

function extractBroadPcPartModel(query: string, value: string): string | null {
  const normalizedQuery = normalizeQuery(query);
  const normalizedTitle = normalizeQuery(value);

  if (normalizedQuery.includes("B650") || normalizedQuery.includes("메인보드")) {
    return extractBroadMotherboardModel(normalizedTitle);
  }

  if (
    normalizedQuery.includes("파워") ||
    normalizedQuery.includes("PSU") ||
    /\b\d{3,4}W\b/.test(normalizedQuery)
  ) {
    return extractBroadPowerModel(normalizedTitle);
  }

  if (normalizedQuery.includes("DDR5") || normalizedQuery.includes("DDR4") || normalizedQuery.includes("메모리")) {
    return extractBroadMemoryModel(normalizedTitle);
  }

  return null;
}

function extractBroadMotherboardModel(normalizedTitle: string): string | null {
  const tokens = normalizedTitle.split(" ");
  const index = tokens.findIndex((token) => token === "B650" || token.startsWith("B650"));
  if (index === -1) {
    return null;
  }

  const modelTokens: string[] = [];

  for (let current = index; current < tokens.length && modelTokens.length < 4; current += 1) {
    const token = tokens[current]!;
    if (!/^[A-Z0-9-]+$/.test(token)) {
      break;
    }

    modelTokens.push(token);
  }

  if (modelTokens.length === 0) {
    return null;
  }

  const brand = extractCanonicalBrandFromText(normalizedTitle);
  const model = modelTokens
    .join(" ")
    .replace(/^B650 M\b/, "B650M")
    .replace(/^B650 M-/, "B650M-")
    .replace(/^B650 MT-E\b/, "B650MT-E");

  return brand ? `${brand} ${model}` : model;
}

function extractBroadPowerModel(normalizedTitle: string): string | null {
  const brand = extractCanonicalBrandFromText(normalizedTitle);
  const patterns = [
    /\b(UD850GM(?:\s+PG5)?)\b/,
    /\b(MWE\s+GOLD\s+850(?:\s+V\d+)?)\b/,
    /\b(WIZMAX\s+850W)\b/,
    /\b(MASTERX(?:\s+[A-Z])?\s+850W)\b/,
    /\b(SF-850F14XG)\b/
  ] as const;

  for (const pattern of patterns) {
    const match = normalizedTitle.match(pattern);
    if (match?.[1]) {
      return brand ? `${brand} ${match[1]}` : match[1];
    }
  }

  return null;
}

function extractBroadMemoryModel(normalizedTitle: string): string | null {
  const brand = extractCanonicalBrandFromText(normalizedTitle);
  const ddrMatch = normalizedTitle.match(/\b(DDR4|DDR5)\b/);
  const speedMatch = normalizedTitle.match(/\b(PC5-\d{4,5}|PC4-\d{4,5})\b/);
  const capacityMatch = normalizedTitle.match(/\b(16GB|32GB|64GB)\b/);

  if (!brand || !ddrMatch?.[1] || !capacityMatch?.[1]) {
    return null;
  }

  const parts = [brand, ddrMatch[1]];
  if (speedMatch?.[1]) {
    parts.push(speedMatch[1]);
  }
  parts.push(capacityMatch[1]);

  return parts.join(" ");
}

function extractCanonicalBrandFromText(normalizedTitle: string): string | null {
  for (const entry of CANONICAL_BRAND_CUES) {
    if (entry.cues.some((cue) => normalizedTitle.includes(cue))) {
      return entry.canonical;
    }
  }

  return null;
}

function isLikelyMonitorModelCode(candidate: string): boolean {
  if (candidate.length < 5 || candidate.length > 10) {
    return false;
  }

  if (!/[A-Z]/.test(candidate) || !/\d/.test(candidate)) {
    return false;
  }

  return !["HDR", "HDMI", "OLED", "IPS", "UHD", "QHD", "FHD", "USB", "TYPE"].includes(candidate);
}

function extractNonLaptopExactModel(value: string): string | null {
  const normalized = normalizeQuery(value);

  if (normalized.includes("KEYCHRON") && /\bK2\s+PRO\b/.test(normalized)) {
    return "KEYCHRON K2 PRO";
  }

  if ((normalized.includes("LOGITECH") || normalized.includes("로지텍")) && /\bMX\s+MECHANICAL\s+MINI\b/.test(normalized)) {
    return "LOGITECH MX MECHANICAL MINI";
  }

  if ((normalized.includes("LOGITECH") || normalized.includes("로지텍")) && /\bMX\s+MECHANICAL\b/.test(normalized)) {
    return "LOGITECH MX MECHANICAL";
  }

  if ((normalized.includes("ABKO") || normalized.includes("앱코")) && /\bK660\b/.test(normalized)) {
    return "ABKO K660";
  }

  if (normalized.includes("DRUNKDEER") && /\bA75\b/.test(normalized)) {
    return "DRUNKDEER A75";
  }

  if (/\b27GR93U\b/.test(normalized)) {
    return "LG 27GR93U";
  }

  if (/\bU2723QE\b/.test(normalized)) {
    return "DELL U2723QE";
  }

  if (/\b321URX\b/.test(normalized)) {
    return "MSI 321URX";
  }

  if (/\bS27DG500\b/.test(normalized)) {
    return "SAMSUNG S27DG500";
  }

  if ((normalized.includes("ASUS") || normalized.includes("아수스") || normalized.includes("에이수스")) && /\bTUF\b/.test(normalized) && /\bB650M-PLUS\b/.test(normalized)) {
    return "ASUS TUF B650M-PLUS";
  }

  if (/\bRYZEN\s*7\s*9800X3D\b/.test(normalized)) {
    return "RYZEN 7 9800X3D";
  }

  const sn850xMatch = normalized.match(/\bSN850X\b.*\b(1TB|2TB|4TB)\b|\b(1TB|2TB|4TB)\b.*\bSN850X\b/);
  if (sn850xMatch) {
    const capacity = sn850xMatch[1] ?? sn850xMatch[2];
    if (capacity) {
      return `WD SN850X ${capacity}`;
    }
  }

  if (/\bSF-850F14XG\b/.test(normalized)) {
    return "SUPERFLOWER SF-850F14XG";
  }

  return null;
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
