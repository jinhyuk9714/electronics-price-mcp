# Electronics Price MCP

한국 쇼핑몰 기준으로 전자기기와 PC 부품을 검색하고, 정확히 같은 모델의 현재 가격대를 비교해 주는 원격 MCP 서버입니다.  
v1은 공식 [네이버 쇼핑 검색 API](https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md)를 단일 데이터 소스로 사용합니다.

## 주요 기능

- `search_products`
  - 노트북, 키보드, 그래픽카드, 모니터, PC 부품 검색
  - 판매처별 현재 가격과 모델 그룹 요약
- `compare_product_prices`
  - 정확히 같은 모델만 가격 비교
  - 모델이 섞이면 비교를 거부하고 더 구체적인 검색어를 안내
- `explain_purchase_options`
  - 현재 검색 결과 안에서 최저가 중심 해석 제공

## 기술 스택

- TypeScript
- Cloudflare Workers
- Hono
- `@modelcontextprotocol/sdk`
- Vitest

## 환경 변수

`.dev.vars.example`을 참고해 `.dev.vars`를 만드세요.

```env
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
REQUEST_TIMEOUT_MS=8000
CACHE_TTL_MS=300000
```

필수 값:

- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

선택 값:

- `REQUEST_TIMEOUT_MS`
- `CACHE_TTL_MS`

## 로컬 실행

```bash
npm install
npm test
npm run typecheck
npm run dev
```

기본 MCP 엔드포인트는 `http://127.0.0.1:8787/mcp`입니다.

## 배포

Cloudflare Workers에 로그인한 뒤 배포합니다.

```bash
npm run deploy
```

배포 후 Worker URL의 `/mcp` 경로를 원격 MCP 주소로 사용하면 됩니다.

## 도구 입력 예시

### `search_products`

```json
{
  "query": "그램 16",
  "sort": "relevance",
  "excludeUsed": true,
  "limit": 10
}
```

### `compare_product_prices`

```json
{
  "query": "rtx 5070"
}
```

### `explain_purchase_options`

```json
{
  "query": "그램 16",
  "focus": "lowest_price"
}
```

## 현재 제한 사항

- v1은 네이버 쇼핑 검색 결과 안에서만 가격을 비교합니다.
- 역대 최저가, 실시간 재고, 배송 예정일은 다루지 않습니다.
- 상세 스펙 표를 만들지 않고, 제목에서 읽히는 모델명만 사용합니다.
- 검색 결과에 `RTX 5070`과 `RTX 5070 Ti`처럼 다른 모델이 섞이면 비교를 거부합니다.
