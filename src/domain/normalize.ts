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
  "cooler master": "CoolerMaster",
  "쿨러마스터": "CoolerMaster",
  "msi": "MSI",
  "엠에스아이": "MSI",
  "hp": "HP",
  "dell": "Dell",
  "amd": "AMD",
  "intel": "Intel",
  "인텔": "Intel",
  "wd": "WD",
  "wd_black": "WD",
  "wd black": "WD",
  "crucial": "Crucial",
  "마이크론": "Crucial",
  "micron": "Crucial",
  "sk hynix": "SK HYNIX",
  "sk하이닉스": "SK HYNIX",
  "하이닉스": "SK HYNIX",
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

const CANONICAL_MALL_ALIASES = [
  {
    canonical: "11ST",
    aliases: ["11번가", "11ST", "11st"]
  },
  {
    canonical: "SMARTSTORE",
    aliases: ["네이버 스마트스토어", "스마트스토어", "smartstore", "네이버스마트스토어"]
  },
  {
    canonical: "GMARKET",
    aliases: ["G마켓", "gmarket"]
  },
  {
    canonical: "AUCTION",
    aliases: ["옥션", "auction"]
  },
  {
    canonical: "COUPANG",
    aliases: ["쿠팡", "coupang"]
  },
  {
    canonical: "SSG",
    aliases: ["SSG", "SSG.COM", "신세계몰"]
  },
  {
    canonical: "LOTTEON",
    aliases: ["롯데온", "lotteon"]
  }
] as const;

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
  { canonical: "KLEVV", cues: ["KLEVV", "클레브", "에센코어"] },
  { canonical: "INTEL", cues: ["INTEL", "인텔"] },
  { canonical: "CRUCIAL", cues: ["CRUCIAL", "MICRON", "마이크론"] },
  { canonical: "SK HYNIX", cues: ["SK HYNIX", "SK하이닉스", "하이닉스"] }
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

const TRAILING_SEARCH_PATTERNS = [
  /\s*(?:검색(?:해)?\s*줘|검색\s*좀\s*해\s*줘|찾아(?:\s*줘)?|보여(?:\s*줘)?|정리해줘|추천해줘|알려줘|봐줘|골라줘|볼래)\s*$/i
] as const;

const NATURAL_LANGUAGE_FILLER_PATTERNS = [
  /알아보는\s*중인데/giu,
  /알아보는\s*중이라/giu,
  /찾는\s*중인데/giu,
  /찾는\s*중이라/giu,
  /게임도\s*좀\s*할\s*거라/giu,
  /영상편집도\s*할\s*거라/giu,
  /보는\s*중인데/giu,
  /보는\s*중이라/giu,
  /생각\s*중인데/giu,
  /생각\s*중이라/giu,
  /하나\s*보는데/giu,
  /궁금해서/giu,
  /보긴\s*하는데/giu,
  /하고\s*싶은데/giu,
  /하려는데/giu,
  /바로/giu,
  /쪽으로/giu,
  /가능하면/giu,
  /한번/giu,
  /좀/giu,
  /대충/giu,
  /요즘\s*뭐가\s*잡히는지/giu,
  /후보가\s*뭐가\s*있나/giu,
  /본체\s*(?:위주로|위주|만)/giu,
  /본품\s*(?:위주로|위주|만)/giu,
  /가능\s*여부(?:부터|먼저)?/giu,
  /정확히/giu,
  /무리일\s*것\s*같긴\s*한데/giu,
  /그래도\s*어떻게\s*나오는지/giu,
  /애매하면/giu,
  /안\s*되면/giu,
  /너무\s*막연하면/giu,
  /멈추고/giu,
  /너무\s*길지\s*않게/giu,
  /가격\s*차이만\s*깔끔하게/giu,
  /가격\s*차이만/giu,
  /판매처별로/giu,
  /판매처별로\s*얼마\s*차이\s*나는지/giu,
  /얼마\s*차이\s*나는지/giu,
  /정확히\s*같은\s*(?:모델|제품)(?:끼리|기준(?:으로)?)?(?:만)?/giu,
  /같은\s*(?:모델|제품)(?:끼리|기준(?:으로)?)?(?:만)?/giu,
  /그\s*모델(?:끼리|기준(?:으로)?)?(?:만)?/giu,
  /본체끼리(?:만)?/giu,
  /키보드\s*본체끼리(?:만)?/giu,
  /본체만/giu,
  /중에서도/giu,
  /정확\s*모델\s*기준(?:으로)?/giu,
  /최저가(?:만)?/giu,
  /용량까지\s*맞는\s*것(?:들)?끼리(?:만)?/giu,
  /다른\s*비슷한\s*모델\s*섞지\s*말고/giu,
  /비슷한\s*모델\s*섞지\s*말고/giu,
  /로\s*뜨는\s*것들만/giu,
  /다음에\s*뭘\s*물어보면\s*좋을지(?:도)?/giu,
  /보고\s*싶어/giu,
  /\b이건\b/giu,
  /\b이거는\b/giu,
  /\b이거\b/giu,
  /\b이\s*모델은\b/giu,
  /\b이\s*모델\b/giu
] as const;

const NATURAL_LANGUAGE_TAIL_PATTERNS = [
  /\s*(?:한\s*번에\s*)?비교하는\s*건.*$/iu,
  /\s*(?:바로\s*)?비교하는\s*건[^,]*$/iu,
  /\s*도?\s*모델이\s*많으니.*$/iu,
  /\s*모델이\s*많을\s*것\s*같아서.*$/iu,
  /\s*모델이\s*많을\s*것\s*같은데.*$/iu,
  /\s*정확히\s*못\s*고르면.*$/iu,
  /\s*(?:를\s*)?한\s*번에\s*비교하면.*$/iu,
  /\s*가격\s*비교(?:는|를)?[^,]*$/iu,
  /\s*비교(?:를)?[^,]*$/iu,
  /\s*지금\s*사도\s*될\s*가격인지.*$/iu,
  /\s*지금\s*사도\s*(?:될|돼|괜찮(?:아|은?\s*가격대야?))[^,]*$/iu,
  /\s*지금\s*들어가도\s*될\s*가격(?:대)?인지.*$/iu,
  /\s*가격대인지.*$/iu,
  /\s*설명(?:해)?\s*줘?[^,]*$/iu
] as const;

const NATURAL_LANGUAGE_BROAD_TRUNCATION_PATTERNS = [
  /\s*이라고만\s*(?:보면|말하면|하면).*$/iu,
  /\s*라고만\s*(?:보면|말하면|하면).*$/iu,
  /\s*정도로만\s*말하면.*$/iu,
  /\s*통으로.*$/iu,
  /\s*전체(?:를)?\s.*$/iu,
  /\s*전부(?:를)?\s.*$/iu,
  /\s*쪽(?:으로|을)?(?:\s|$).*$/iu
] as const;

const NATURAL_LANGUAGE_ALIAS_REPLACEMENTS = [
  { pattern: /갤북(?=\d|\s|$)/giu, replacement: "갤럭시북", alias: "갤럭시북" },
  { pattern: /키크론/giu, replacement: "Keychron", alias: "Keychron" },
  { pattern: /앱코/giu, replacement: "ABKO", alias: "ABKO" }
] as const;

const NATURAL_LANGUAGE_ALIAS_HINTS = [
  { pattern: /빅터스/iu, alias: "VICTUS" },
  { pattern: /라데온/iu, alias: "RX" },
  { pattern: /엔비디아|지포스/iu, alias: "RTX" }
] as const;

const EXCLUSION_CUE_PATTERN = /(빼고|말고|제외(?:하고|해)?|섞지\s*말고)/iu;

const EXCLUDED_TERM_DEFINITIONS = [
  "사무용",
  "오피스",
  "인강용",
  "학생용",
  "업무용",
  "인체공학",
  "게이밍",
  "마우스",
  "마우스패드",
  "키캡",
  "액세서리",
  "브라켓",
  "완본체",
  "조립PC",
  "게이밍PC",
  "컴퓨터 본체",
  "데스크탑",
  "데스크톱",
  "렌탈",
  "대여",
  "임대",
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
  "거치대",
  "스탠드",
  "외장",
  "TV",
  "다른 기기"
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

export interface NaturalLanguageQueryCondensation {
  originalQuery: string;
  baseQuery: string;
  excludedTerms: string[];
  intentHints: {
    compare: boolean;
    explain: boolean;
    broad: boolean;
    exactIsh: boolean;
  };
  categoryHints: {
    laptop: boolean;
    graphicsCard: boolean;
    keyboard: boolean;
    monitor: boolean;
    pcPart: boolean;
  };
  normalizedAliases: string[];
}

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

export function canonicalizeMallName(value: string | null | undefined): string | null {
  const normalized = stripHtml(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  const aliasToken = normalizeMallAliasToken(normalized);
  if (!aliasToken) {
    return null;
  }

  for (const entry of CANONICAL_MALL_ALIASES) {
    if (entry.aliases.some((alias) => normalizeMallAliasToken(alias) === aliasToken)) {
      return entry.canonical;
    }
  }

  return aliasToken;
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
  const looksLikeMonitorContext = MONITOR_DEVICE_CUES.some((cue) => normalized.includes(cue));
  const hasMonitorBrandContext =
    normalized.includes("DELL") ||
    normalized.includes("ALIENWARE") ||
    normalized.includes("LG") ||
    normalized.includes("SAMSUNG") ||
    normalized.includes("MSI");

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

      if ((looksLikeMonitorContext || hasMonitorBrandContext) && isLikelyMonitorModelCode(standaloneModel)) {
        continue;
      }

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

export function condenseNaturalLanguageQuery(value: string): NaturalLanguageQueryCondensation {
  const originalQuery = stripHtml(value).replace(DASH_CHARACTERS, "-").trim();
  const aliasResult = applyNaturalLanguageAliases(originalQuery);
  const excludedTerms = extractExcludedTerms(aliasResult.text);
  let baseQuery = aliasResult.text;

  baseQuery = stripTrailingIntentPhrases(baseQuery);
  baseQuery = removeExcludedClauses(baseQuery, excludedTerms);
  baseQuery = normalizeNaturalLanguageShapes(baseQuery);
  baseQuery = stripBroadNarrativeTail(baseQuery);

  for (const pattern of NATURAL_LANGUAGE_TAIL_PATTERNS) {
    baseQuery = baseQuery.replace(pattern, " ").trim();
  }

  for (const pattern of NATURAL_LANGUAGE_FILLER_PATTERNS) {
    baseQuery = baseQuery.replace(pattern, " ").trim();
  }

  baseQuery = stripTrailingIntentPhrases(baseQuery);
  baseQuery = normalizeNaturalLanguageShapes(baseQuery);
  baseQuery = stripBroadNarrativeTail(baseQuery);
  baseQuery = cleanupNaturalLanguageArtifacts(baseQuery);
  let finalBaseQuery = baseQuery || stripTrailingIntentPhrases(aliasResult.text) || originalQuery;
  const preliminaryExactModel =
    extractNotebookModelCode(finalBaseQuery) ||
    extractGpuQueryModel(finalBaseQuery)?.model ||
    extractNonLaptopExactModel(finalBaseQuery);
  if (preliminaryExactModel) {
    finalBaseQuery = trimTrailingGenericProductNouns(finalBaseQuery);
  }
  const categoryHints = {
    laptop: hasAnyCue(finalBaseQuery, NOTEBOOK_QUERY_CUES),
    graphicsCard: hasAnyCue(finalBaseQuery, GRAPHICS_QUERY_CUES),
    keyboard: hasAnyCue(finalBaseQuery, KEYBOARD_QUERY_CUES),
    monitor:
      hasAnyCue(finalBaseQuery, MONITOR_QUERY_CUES) ||
      /\b(24|27|29|32|34|38|40|43)\s*(인치|형)\b/i.test(finalBaseQuery),
    pcPart:
      hasAnyCue(finalBaseQuery, PC_PART_QUERY_CUES) ||
      /\b\d{3,4}W\b/i.test(finalBaseQuery) ||
      /\b(16GB|32GB|64GB|1TB|2TB|4TB)\b/i.test(finalBaseQuery)
  };
  const exactModel =
    extractNotebookModelCode(finalBaseQuery) ||
    extractGpuQueryModel(finalBaseQuery)?.model ||
    extractNonLaptopExactModel(finalBaseQuery);
  const normalizedFinalQuery = normalizeQuery(finalBaseQuery);
  const broadNotebookGpuQuery =
    categoryHints.laptop && finalBaseQuery.includes("노트북") && !extractNotebookModelCode(finalBaseQuery);

  return {
    originalQuery,
    baseQuery: finalBaseQuery,
    excludedTerms,
    intentHints: {
      compare: /비교/u.test(originalQuery),
      explain: /설명|지금\s*사도|가격대|들어가도/u.test(originalQuery),
      broad:
        BROAD_QUERY_CUES.some((cue) => normalizedFinalQuery.includes(cue)) ||
        broadNotebookGpuQuery ||
        /모델이\s*여러\s*개|통으로|전체/u.test(originalQuery) ||
        !exactModel,
      exactIsh: Boolean(exactModel)
    },
    categoryHints,
    normalizedAliases: aliasResult.normalizedAliases
  };
}

export function simplifyIntentQuery(value: string): string {
  return condenseNaturalLanguageQuery(value).baseQuery;
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
  const brand = extractCanonicalBrandFromText(normalized);

  if (!(normalized.includes("KEYCHRON") || normalized.includes("키크론"))) {
    const genericPatterns = [
      /\b(K120(?:\s+NEW)?)\b/,
      /\b(MK\d{3})\b/,
      /\b(PL\d{3}[A-Z]?)\b/,
      /\b(SPK\d{2,3})\b/
    ] as const;

    for (const pattern of genericPatterns) {
      const match = normalized.match(pattern);
      if (match?.[1]) {
        return brand ? `${brand} ${match[1]}` : match[1];
      }
    }

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

type ExactModelMatcher = {
  brandCues?: readonly string[];
  allowBrandless?: boolean;
  pattern: RegExp;
  build: (match: RegExpMatchArray, normalized: string) => string | null;
};

const KEYBOARD_EXACT_MODEL_MATCHERS: readonly ExactModelMatcher[] = [
  {
    brandCues: ["KEYCHRON", "키크론"],
    pattern: /\b([KQVCMA]\d{1,2})(?:\s+(AIR|PRO|MAX|HE|SE2?|PLUS))?\b/,
    build: (match) => `KEYCHRON ${match[1]}${match[2] ? ` ${normalizeMatcherToken(match[2])}` : ""}`
  },
  {
    brandCues: ["LOGITECH", "로지텍"],
    allowBrandless: true,
    pattern: /\bMX\s+MECHANICAL\s+MINI\b/,
    build: () => "LOGITECH MX MECHANICAL MINI"
  },
  {
    brandCues: ["LOGITECH", "로지텍"],
    allowBrandless: true,
    pattern: /\bMX\s+MECHANICAL\b/,
    build: () => "LOGITECH MX MECHANICAL"
  },
  {
    brandCues: ["LOGITECH", "로지텍"],
    allowBrandless: true,
    pattern: /\bMX\s+KEYS\s+S\b/,
    build: () => "LOGITECH MX KEYS S"
  },
  {
    brandCues: ["LOGITECH", "로지텍"],
    pattern: /\bG\s+PRO\s+X\s+TKL\b/,
    build: () => "LOGITECH G PRO X TKL"
  },
  {
    brandCues: ["LOGITECH", "로지텍"],
    pattern: /\b(G913|G715|G515)\b/,
    build: (match) => `LOGITECH ${normalizeMatcherToken(match[1])}`
  },
  {
    brandCues: ["ABKO", "앱코"],
    pattern: /\b(K\d{3}|MK\d{3})\b/,
    build: (match) => `ABKO ${normalizeMatcherToken(match[1])}`
  },
  {
    brandCues: ["DRUNKDEER"],
    pattern: /\b([A-Z]\d{2,3})(?:\s+(PRO|MAX))?\b/,
    build: (match) => `DRUNKDEER ${match[1]}${match[2] ? ` ${normalizeMatcherToken(match[2])}` : ""}`
  }
] as const;

const MONITOR_EXACT_MODEL_MATCHERS: readonly ExactModelMatcher[] = [
  {
    brandCues: ["LG", "엘지"],
    allowBrandless: true,
    pattern: /\b(\d{2}[A-Z]{2}\d{2}[A-Z]{1,3})\b/,
    build: (match) => `LG ${normalizeMatcherToken(match[1])}`
  },
  {
    brandCues: ["DELL", "ALIENWARE"],
    allowBrandless: true,
    pattern: /\b((?:U|AW)\d{4,5}[A-Z]{1,3})\b/,
    build: (match) => `DELL ${normalizeMatcherToken(match[1])}`
  },
  {
    brandCues: ["MSI", "엠에스아이"],
    allowBrandless: true,
    pattern: /\b(\d{3}[A-Z]{3,5})\b/,
    build: (match) => `MSI ${normalizeMatcherToken(match[1])}`
  },
  {
    brandCues: ["SAMSUNG", "삼성"],
    allowBrandless: true,
    pattern: /\b(S\d{2}[A-Z]{2}\d{2,3}[A-Z]?)\b/,
    build: (match) => `SAMSUNG ${normalizeMatcherToken(match[1])}`
  }
] as const;

const PC_PART_EXACT_MODEL_MATCHERS: readonly ExactModelMatcher[] = [
  {
    brandCues: ["ASUS", "아수스", "에이수스"],
    pattern: /\b(TUF(?:\s+GAMING)?|PRIME|ROG\s+STRIX)\s+((?:B|X|Z)\d{3,4}[A-Z]?(?:-[A-Z0-9]+)*)\b/,
    build: (match) =>
      `ASUS ${normalizeMatcherToken(match[1]).replace("TUF GAMING", "TUF")} ${normalizeMatcherToken(match[2])}`
  },
  {
    brandCues: ["MSI", "엠에스아이"],
    pattern: /\b(PRO|MAG|MPG)\s+((?:B|X|Z)\d{3,4}[A-Z]?(?:-[A-Z0-9]+)*)\b/,
    build: (match) => `MSI ${normalizeMatcherToken(match[1])} ${normalizeMatcherToken(match[2])}`
  },
  {
    brandCues: ["GIGABYTE", "기가바이트"],
    pattern: /\b((?:B|X|Z)\d{3,4}[A-Z]?)\s+(EAGLE|AORUS|GAMING|ELITE)\b/,
    build: (match) => `GIGABYTE ${normalizeMatcherToken(match[1])} ${normalizeMatcherToken(match[2])}`
  },
  {
    brandCues: ["ASROCK", "애즈락"],
    pattern: /\b((?:B|X|Z)\d{3,4}[A-Z]?(?:-[A-Z0-9]+)?)\s+(PRO\s+RS|STEEL\s+LEGEND|RIPTIDE|LIVEMIXER)\b/,
    build: (match) => `ASROCK ${normalizeMatcherToken(match[1])} ${normalizeMatcherToken(match[2])}`
  },
  {
    brandCues: ["BIOSTAR", "바이오스타"],
    pattern: /\b((?:B|X|Z)\d{3,4}[A-Z]{0,2}(?:-[A-Z0-9]+)?)\s+(PRO|VALKYRIE|RACING)\b/,
    build: (match) => `BIOSTAR ${normalizeMatcherToken(match[1])} ${normalizeMatcherToken(match[2])}`
  },
  {
    pattern: /\bRYZEN\s+([3579])\s+(\d{4,5}(?:X3D|X|G|F)?)\b/,
    build: (match) => `RYZEN ${normalizeMatcherToken(match[1])} ${normalizeMatcherToken(match[2])}`
  },
  {
    brandCues: ["AMD", "RYZEN"],
    allowBrandless: true,
    pattern: /\b(\d{4,5}(?:X3D|X|G|F))\b/,
    build: (match) => {
      const tier = inferRyzenTier(match[1]);
      return tier ? `RYZEN ${tier} ${normalizeMatcherToken(match[1])}` : null;
    }
  },
  {
    brandCues: ["INTEL", "인텔"],
    pattern: /(?:\bCORE\b|코어)\s+ULTRA\s+([3579])\s+(\d{3}[A-Z]?)/,
    build: (match) => `INTEL CORE ULTRA ${normalizeMatcherToken(match[1])} ${normalizeMatcherToken(match[2])}`
  },
  {
    brandCues: ["INTEL", "인텔"],
    pattern: /\b(I[3579]-\d{5}[A-Z]?)\b/,
    build: (match) => `INTEL ${normalizeMatcherToken(match[1])}`
  },
  {
    brandCues: ["WD", "WD BLACK", "WD_BLACK"],
    allowBrandless: true,
    pattern: /\bSN850X\b.*\b(1TB|2TB|4TB)\b|\b(1TB|2TB|4TB)\b.*\bSN850X\b/,
    build: (match) => {
      const capacity = match[1] ?? match[2];
      return capacity ? `WD SN850X ${normalizeMatcherToken(capacity)}` : null;
    }
  },
  {
    brandCues: ["SAMSUNG", "삼성"],
    allowBrandless: true,
    pattern: /\b990\s+PRO\b.*\b(1TB|2TB|4TB)\b|\b(1TB|2TB|4TB)\b.*\b990\s+PRO\b/,
    build: (match) => {
      const capacity = match[1] ?? match[2];
      return capacity ? `SAMSUNG 990 PRO ${normalizeMatcherToken(capacity)}` : null;
    }
  },
  {
    brandCues: ["SK HYNIX", "SK하이닉스", "하이닉스"],
    allowBrandless: true,
    pattern: /\bP41\b.*\b(1TB|2TB)\b|\b(1TB|2TB)\b.*\bP41\b/,
    build: (match) => {
      const capacity = match[1] ?? match[2];
      return capacity ? `SK HYNIX P41 ${normalizeMatcherToken(capacity)}` : null;
    }
  },
  {
    brandCues: ["CRUCIAL", "MICRON", "마이크론"],
    allowBrandless: true,
    pattern: /\bT500\b.*\b(1TB|2TB|4TB)\b|\b(1TB|2TB|4TB)\b.*\bT500\b/,
    build: (match) => {
      const capacity = match[1] ?? match[2];
      return capacity ? `CRUCIAL T500 ${normalizeMatcherToken(capacity)}` : null;
    }
  },
  {
    brandCues: ["GIGABYTE", "기가바이트"],
    pattern: /\b(UD850GM(?:\s+PG5)?)\b/,
    build: (match) => `GIGABYTE ${normalizeMatcherToken(match[1])}`
  },
  {
    brandCues: ["COOLERMASTER", "COOLER MASTER", "쿨러마스터"],
    pattern: /\b(MWE\s+GOLD\s+850(?:\s+V\d+)?)\b/,
    build: (match) => `COOLERMASTER ${normalizeMatcherToken(match[1])}`
  },
  {
    pattern: /\b(SF-850F14XG)\b/,
    build: (match) => `SUPERFLOWER ${normalizeMatcherToken(match[1])}`
  },
  {
    pattern: /\b(DDR4|DDR5)\b.*\b(PC[45]-\d{4,5})\b.*\b(16GB|32GB|64GB)\b|\b(16GB|32GB|64GB)\b.*\b(DDR4|DDR5)\b.*\b(PC[45]-\d{4,5})\b/,
    build: (match, normalized) => {
      const brand = extractCanonicalBrandFromText(normalized);
      const ddr = match[1] ?? match[5];
      const speed = match[2] ?? match[6];
      const capacity = match[3] ?? match[4];

      if (!brand || !ddr || !speed || !capacity) {
        return null;
      }

      return `${brand} ${normalizeMatcherToken(ddr)} ${normalizeMatcherToken(speed)} ${normalizeMatcherToken(capacity)}`;
    }
  }
] as const;

function extractNonLaptopExactModel(value: string): string | null {
  const normalized = normalizeQuery(value);
  return (
    matchExactModelRegistry(normalized, KEYBOARD_EXACT_MODEL_MATCHERS) ??
    matchExactModelRegistry(normalized, MONITOR_EXACT_MODEL_MATCHERS) ??
    matchExactModelRegistry(normalized, PC_PART_EXACT_MODEL_MATCHERS)
  );
}

function matchExactModelRegistry(normalized: string, matchers: readonly ExactModelMatcher[]): string | null {
  for (const matcher of matchers) {
    if (
      matcher.brandCues &&
      !matcher.brandCues.some((cue) => normalized.includes(cue)) &&
      !matcher.allowBrandless
    ) {
      continue;
    }

    const match = normalized.match(matcher.pattern);
    if (!match) {
      continue;
    }

    const model = matcher.build(match, normalized);
    if (model) {
      return model;
    }
  }

  return null;
}

function normalizeMatcherToken(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().toUpperCase();
}

function inferRyzenTier(code: string | undefined): string | null {
  if (!code) {
    return null;
  }

  const normalizedCode = normalizeMatcherToken(code);
  if (normalizedCode.startsWith("99")) {
    return "9";
  }

  if (normalizedCode.startsWith("98") || normalizedCode.startsWith("97")) {
    return "7";
  }

  if (normalizedCode.startsWith("96") || normalizedCode.startsWith("95")) {
    return "5";
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

function applyNaturalLanguageAliases(value: string): { text: string; normalizedAliases: string[] } {
  let text = value;
  const normalizedAliases = new Set<string>();

  for (const entry of NATURAL_LANGUAGE_ALIAS_REPLACEMENTS) {
    if (entry.pattern.test(text)) {
      text = text.replace(entry.pattern, entry.replacement);
      normalizedAliases.add(entry.alias);
    }
  }

  for (const entry of NATURAL_LANGUAGE_ALIAS_HINTS) {
    if (entry.pattern.test(text)) {
      normalizedAliases.add(entry.alias);
    }
  }

  return {
    text,
    normalizedAliases: Array.from(normalizedAliases)
  };
}

function stripTrailingIntentPhrases(value: string): string {
  let simplified = value.replace(/[?？!]+$/g, "").trim();

  while (true) {
    const next = [...TRAILING_INTENT_PATTERNS, ...TRAILING_SEARCH_PATTERNS]
      .reduce((current, pattern) => current.replace(pattern, "").trim(), simplified)
      .replace(/[?？!]+$/g, "")
      .trim();

    if (next === simplified) {
      break;
    }

    simplified = next;
  }

  return simplified;
}

function extractExcludedTerms(value: string): string[] {
  if (!EXCLUSION_CUE_PATTERN.test(value)) {
    return [];
  }

  const matches = Array.from(value.matchAll(new RegExp(EXCLUSION_CUE_PATTERN.source, "giu")));
  const terms = new Map<string, number>();

  for (const match of matches) {
    const cueIndex = match.index ?? 0;
    const beforeWindow = value.slice(Math.max(0, cueIndex - 20), cueIndex);
    const afterWindow = value.slice(cueIndex + match[0].length, cueIndex + match[0].length + 20);
    const normalizedBeforeWindow = normalizeQuery(beforeWindow);
    const normalizedAfterWindow = normalizeQuery(afterWindow);

    for (const term of EXCLUDED_TERM_DEFINITIONS) {
      const normalizedTerm = normalizeQuery(term);
      const termIndex = value.indexOf(term);

      if (
        normalizedBeforeWindow.includes(normalizedTerm) ||
        normalizedAfterWindow.includes(normalizedTerm)
      ) {
        terms.set(term, termIndex >= 0 ? termIndex : cueIndex);
      }
    }
  }

  return Array.from(terms.entries())
    .sort((left, right) => left[1] - right[1])
    .map(([term]) => term);
}

function removeExcludedClauses(value: string, excludedTerms: string[]): string {
  let cleaned = value;

  for (const term of excludedTerms) {
    const escaped = escapeRegExp(term);
    cleaned = cleaned
      .replace(new RegExp(`${escaped}[^,.!?]{0,50}?(?:빼고|말고|제외(?:하고|해)?|섞지\\s*말고)`, "giu"), " ")
      .replace(new RegExp(`(?:와|과|나|이나)?\\s*${escaped}[^,.!?]{0,50}?(?:빼고|말고|제외(?:하고|해)?|섞지\\s*말고)`, "giu"), " ");
  }

  return cleaned;
}

function normalizeNaturalLanguageShapes(value: string): string {
  return value
    .replace(/갤럭시북\s*4/giu, "갤럭시북4")
    .replace(/\b(RTX\s*\d{4}(?:\s*(?:TI|SUPER))?|RX\s*\d{4}(?:\s*(?:XT|GRE))?|\d{4})\s*들어간\s*노트북/giu, "$1 노트북")
    .replace(/\b(\d{4})\s*급\s*그래픽카드/giu, "$1 그래픽카드")
    .replace(/\b((?:RTX|RX)\s*\d{4})\s*(?:이건|이거는|이거)?\s*(?:XT|TI|SUPER|GRE)\s*말고\s*일반형(?:끼리만?)?/giu, "$1")
    .replace(/\b((?:RTX|RX)\s*\d{4})\s*(?:이건|이거는|이거)?\s*(?:XT|TI|SUPER|GRE)\s*말고/giu, "$1")
    .replace(/\b(RTX\s*\d{4}|RX\s*\d{4})\s*(?:XT|TI|SUPER|GRE)\s*말고/giu, "$1 ")
    .replace(/전체를/giu, "전체")
    .replace(/라인으로/giu, "라인")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBroadNarrativeTail(value: string): string {
  let cleaned = value.trim();

  for (const pattern of NATURAL_LANGUAGE_BROAD_TRUNCATION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "").trim();
  }

  return cleaned;
}

function cleanupNaturalLanguageArtifacts(value: string): string {
  return value
    .replace(/\b(나|이나|같은\s*건|같은건|느낌\s*나는\s*건|느낌나는건)\b/giu, " ")
    .replace(/(키보드|모니터|노트북|메인보드|파워|메모리|SSD|CPU)\s*도/giu, "$1")
    .replace(/\b(보고\s*싶은데|가능\s*여부|가능\s*여부부터|가능\s*여부먼저)\b/giu, " ")
    .replace(/RGB\s*번쩍이는/giu, " ")
    .replace(/보는데/giu, " ")
    .replace(/(키보드|모니터|노트북)\s*만/giu, "$1")
    .replace(/(키보드|모니터|노트북)(?:\s+\1)+/giu, "$1")
    .replace(/\b하나\b/giu, " ")
    .replace(/(?:^|\s)(이건|이거는|이거|이\s*모델은|이\s*모델)(?=\s|$)/gu, " ")
    .replace(/(전부|전체|라인)(를|은|는|이|가)/gu, "$1")
    .replace(/([A-Za-z0-9-]+)(은|는|이|가)(?=\s|$)/gu, "$1")
    .replace(/([가-힣A-Za-z0-9-]+)(을|를)(?=\s|$)/gu, "$1")
    .replace(/(?:^|\s)(알아|봐)(?=\s|$)/gu, " ")
    .replace(/\s*,\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimTrailingGenericProductNouns(value: string): string {
  return value
    .replace(/\s*(키보드|모니터|그래픽카드|그래픽 카드|메인보드|파워|메모리|SSD|CPU|프로세서)\s*$/iu, "")
    .trim();
}

function hasAnyCue(value: string, cues: readonly string[]): boolean {
  const normalized = normalizeQuery(value);
  return cues.some((cue) => normalized.includes(cue));
}

function normalizeMallAliasToken(value: string): string {
  return normalizeQuery(value).replace(/[^A-Z0-9가-힣]/g, "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
