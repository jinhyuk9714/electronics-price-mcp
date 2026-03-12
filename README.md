# Electronics Price MCP

한국 쇼핑몰 기준으로 전자기기와 PC 부품을 찾고, 같은 모델끼리만 가격을 비교해 주는 원격 MCP 서버입니다.
노트북, 키보드, 그래픽카드, 모니터, PC 부품처럼 검색량이 많고 모델명이 중요한 카테고리를 우선 대상으로 잡았습니다.

현재 v1은 공식 [네이버 쇼핑 검색 API](https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md)만 사용합니다.

## 이 MCP로 할 수 있는 일

- `search_products`
  - 전자기기 상품을 검색합니다.
  - 판매처별 가격과 모델별 묶음 결과를 함께 보여줍니다.
- `compare_product_prices`
  - 정확히 같은 모델만 골라 현재 가격대를 비교합니다.
  - 검색 결과에 다른 모델이 섞이면 비교를 멈추고 더 구체적인 검색어를 안내합니다.
- `explain_purchase_options`
  - 지금 검색된 결과 안에서 최저가 기준으로 어떤 선택이 유리한지 짧게 설명합니다.

## 예시 질문

- `그램 16 지금 얼마에 팔아?`
- `RTX 5070 최저가 비교해 줘`
- `무선 기계식 키보드 검색해 줘`
- `이 모델 지금 바로 사도 괜찮은 가격대인지 설명해 줘`

## 환경 변수

`.dev.vars.example`을 참고해 `.dev.vars` 파일을 만들면 됩니다.

```env
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
REQUEST_TIMEOUT_MS=8000
CACHE_TTL_MS=300000
```

필수 값

- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

선택 값

- `REQUEST_TIMEOUT_MS`
- `CACHE_TTL_MS`

## 로컬에서 실행하기

```bash
npm install
npm test
npm run typecheck
npm run dev
```

기본 MCP 주소는 `http://127.0.0.1:8787/mcp`입니다.

## 바로 연결하기

배포된 원격 MCP 주소는 아래와 같습니다.

```text
https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp
```

### ChatGPT

ChatGPT에서 원격 MCP 서버를 추가할 수 있는 화면이 보이면 위 주소를 그대로 넣으면 됩니다.
화면 이름은 제품 버전에 따라 조금 달라질 수 있으니, `MCP`, `Connector`, `Server` 같은 항목을 찾으면 됩니다.

### Claude Desktop

원격 MCP를 직접 추가할 수 있는 환경이라면 같은 주소를 사용하면 됩니다.

### Claude Code

```bash
claude mcp add electronics-price-mcp https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp --transport http
```

### 연결 확인용 질문

- `그램 16 검색해 줘`
- `RTX 5070 가격 비교해 줘`
- `무선 기계식 키보드 중에서 현재 가격대 보여 줘`

## 배포하기

Cloudflare Workers 인증이 되어 있다면 아래 명령으로 바로 배포할 수 있습니다.

```bash
npm run deploy
```

배포가 끝나면 Worker URL 뒤에 `/mcp`를 붙인 주소를 원격 MCP 엔드포인트로 사용하면 됩니다.

예:

```text
https://electronics-price-mcp.<subdomain>.workers.dev/mcp
```

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

## 현재 범위와 제한

- v1은 네이버 쇼핑 검색 결과 안에서만 가격을 비교합니다.
- 역대 최저가, 실시간 재고, 배송 예정일은 다루지 않습니다.
- 상세 스펙 표를 만들지 않고, 상품 제목에서 읽히는 모델명만 사용합니다.
- `RTX 5070`과 `RTX 5070 Ti`처럼 다른 모델이 섞이면 비교를 거부합니다.
