export function generatePromptText(baseUrl: string): string {
  return `# Electronics Price MCP API

한국 쇼핑몰 기준으로 전자기기 가격을 조회하는 읽기 전용 API입니다.
모든 요청은 GET 방식이며 결과는 JSON으로 반환됩니다.

Base URL: ${baseUrl}

## 사용 가능한 기능

### 1. 상품 검색

설명: 전자기기 상품을 검색하고 판매처별 가격을 확인합니다.

URL: ${baseUrl}/api/search?query={검색어}

선택 파라미터:
- category: laptop | keyboard | graphics-card | monitor | pc-part
- budgetMax: 최대 예산
- sort: relevance | price_asc | price_desc
- excludeUsed: true | false
- limit: 결과 수

예시:
- ${baseUrl}/api/search?query=그램 16
- ${baseUrl}/api/search?query=rtx 5070&sort=price_asc&limit=5

### 2. 가격 비교

설명: 정확히 같은 모델만 현재 가격대를 비교합니다.

URL: ${baseUrl}/api/compare?query={검색어}

선택 파라미터:
- productId: search 결과의 productId
- maxOffers: 반환할 판매처 수

예시:
- ${baseUrl}/api/compare?query=rtx 5070

주의:
- 검색 결과에 다른 모델이 섞이면 비교를 거부합니다.
- 이 API는 읽기 전용이며 구매를 대신 진행하지 않습니다.
`;
}
