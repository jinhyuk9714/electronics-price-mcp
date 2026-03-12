import { DEFAULT_PUBLIC_BASE_URL } from "../config.js";

type OpenApiDocument = Record<string, unknown>;

export function createOpenApiDocument(baseUrl = DEFAULT_PUBLIC_BASE_URL): OpenApiDocument {
  return {
    openapi: "3.1.0",
    info: {
      title: "Electronics Price MCP Public API",
      version: "0.1.0",
      description: "전자기기 검색과 가격 비교를 위한 읽기 전용 HTTP API"
    },
    servers: [
      {
        url: baseUrl
      }
    ],
    paths: {
      "/health": {
        get: {
          summary: "헬스 체크",
          responses: {
            "200": {
              description: "정상 응답"
            }
          }
        }
      },
      "/api/search": {
        get: {
          summary: "상품 검색",
          parameters: [
            parameter("query", "query", true, "검색어"),
            parameter("category", "query", false, "카테고리"),
            parameter("budgetMax", "query", false, "최대 예산"),
            parameter("sort", "query", false, "정렬 방식"),
            parameter("excludeUsed", "query", false, "중고 제외 여부"),
            parameter("limit", "query", false, "결과 수")
          ],
          responses: {
            "200": {
              description: "검색 성공"
            },
            "400": {
              description: "잘못된 요청"
            },
            "503": {
              description: "외부 API 설정 누락"
            }
          }
        }
      },
      "/api/compare": {
        get: {
          summary: "같은 모델 가격 비교",
          parameters: [
            parameter("query", "query", false, "검색어"),
            parameter("productId", "query", false, "search 결과의 productId"),
            parameter("maxOffers", "query", false, "반환할 판매처 수")
          ],
          responses: {
            "200": {
              description: "비교 성공"
            },
            "400": {
              description: "잘못된 요청"
            },
            "503": {
              description: "외부 API 설정 누락"
            }
          }
        }
      }
    }
  };
}

export function createOpenApiYaml(baseUrl = DEFAULT_PUBLIC_BASE_URL): string {
  return toYaml(createOpenApiDocument(baseUrl));
}

function parameter(name: string, location: string, required: boolean, description: string) {
  return {
    name,
    in: location,
    required,
    description,
    schema: {
      type: "string"
    }
  };
}

function toYaml(value: unknown, indent = 0): string {
  const padding = " ".repeat(indent);

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (isScalar(item)) {
          return `${padding}- ${formatScalar(item)}`;
        }

        const nested = toYaml(item, indent + 2);
        const nestedLines = nested.split("\n");
        return `${padding}- ${nestedLines[0]}\n${nestedLines.slice(1).map((line) => `${padding}  ${line}`).join("\n")}`;
      })
      .join("\n");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, entry]) => {
        if (isScalar(entry)) {
          return `${padding}${key}: ${formatScalar(entry)}`;
        }

        return `${padding}${key}:\n${toYaml(entry, indent + 2)}`;
      })
      .join("\n");
  }

  return `${padding}${formatScalar(value)}`;
}

function isScalar(value: unknown): value is string | number | boolean | null {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function formatScalar(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (value === null) {
    return "null";
  }

  return String(value);
}
