# Electronics Price MCP

한국 쇼핑몰 기준으로 전자기기와 PC 부품을 찾고, 같은 모델끼리만 가격을 비교해 주는 원격 MCP 서버입니다.
노트북, 키보드, 그래픽카드, 모니터, PC 부품처럼 검색량이 많고 모델명이 중요한 카테고리를 우선 대상으로 잡았습니다.

현재 v1은 공식 [네이버 쇼핑 검색 API](https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md)만 사용합니다.

## 바로 연결하기

배포된 원격 MCP 주소:

```text
https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp
```

체험용 HTTP API:

```text
https://electronics-price-mcp.jinhyuk9714.workers.dev/api/search?query=그램 16
https://electronics-price-mcp.jinhyuk9714.workers.dev/api/compare?query=rtx 5070
```

문서형 엔드포인트:

```text
https://electronics-price-mcp.jinhyuk9714.workers.dev/prompt
https://electronics-price-mcp.jinhyuk9714.workers.dev/openapi.json
https://electronics-price-mcp.jinhyuk9714.workers.dev/openapi.yaml
https://electronics-price-mcp.jinhyuk9714.workers.dev/privacy
```

## 앱별 가이드

### ChatGPT

ChatGPT에서 원격 MCP 서버를 추가할 수 있는 화면이 보이면 위 MCP 주소를 그대로 넣으면 됩니다.
화면 이름은 버전에 따라 조금 다를 수 있으니 `MCP`, `Connector`, `Server` 같은 항목을 찾으면 됩니다.

ChatGPT 앱으로 따로 공개할 계획이라면, 이 저장소 아래쪽의 `ChatGPT 앱 등록용 문구` 섹션을 그대로 참고하면 됩니다.
지금은 원격 MCP 주소로 연결하는 방식이 가장 빠릅니다.

### Claude Desktop

원격 MCP를 직접 추가할 수 있는 환경이라면 같은 주소를 사용하면 됩니다.

### Claude Code

```bash
claude mcp add electronics-price-mcp https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp --transport http
```

### MCP를 못 쓰는 환경

`/prompt` 페이지를 읽게 한 뒤, `GET /api/search` 또는 `GET /api/compare`를 호출하게 하면 됩니다.

## 바로 써볼 질문

- `그램 16 검색해 줘`
- `RTX 5070 가격 비교해 줘`
- `무선 기계식 키보드 검색해 줘`
- `이 모델 지금 바로 사도 괜찮은 가격대인지 설명해 줘`

## ChatGPT 앱 등록용 문구

ChatGPT 앱을 직접 만들 때 바로 붙여 넣기 좋은 초안입니다.
현재 서버 성격에 맞춰 `읽기 전용 가격 검색 앱` 기준으로 정리했습니다.

### 앱 이름

```text
전자기기 가격비교
```

### 한 줄 소개

```text
한국 쇼핑몰 기준으로 전자기기와 PC 부품의 현재 가격을 찾고, 같은 모델끼리만 안전하게 비교해 줍니다.
```

### 상세 설명

```text
노트북, 그래픽카드, 모니터, 키보드, PC 부품을 검색할 수 있습니다.
같은 모델로 확인되는 경우에만 가격 비교를 진행합니다.
비슷하지만 다른 모델이 섞이면 억지로 비교하지 않고 더 구체적인 검색어를 안내합니다.
현재 검색 결과 안에서 최저가와 판매처 수를 바탕으로 지금 살 만한지 간단히 설명해 줍니다.
재고, 역대 최저가, 배송 예정일은 다루지 않습니다.
```

### 앱 지침

```text
이 앱은 한국 쇼핑몰 기준 전자기기 가격 검색과 비교를 돕는 읽기 전용 앱이다.

항상 사용자의 검색어에서 핵심 모델명을 먼저 파악한다.
같은 모델인지 확실할 때만 가격 비교를 수행한다.
다른 모델이 섞였거나 모델명이 애매하면 비교를 멈추고, 더 구체적인 검색어를 짧게 제안한다.
답변은 과장 없이 간결하게 작성한다.

가능하면 아래 순서로 설명한다.
1. 무엇을 찾았는지
2. 최저가와 판매처 수
3. 비교 가능 여부
4. 지금 살 만한지에 대한 짧은 해석

재고, 역대 최저가, 공식 출시가, 배송일은 확실한 데이터가 없으면 추정하지 않는다.
구매를 강하게 유도하지 말고, 현재 검색 결과 범위 안에서만 판단한다.
```

### 스타터 질문

- `그램 16 검색해 줘`
- `RTX 5070 가격 비교해 줘`
- `무선 기계식 키보드 찾아줘`
- `이 모델 지금 사도 괜찮은 가격대야?`
- `RTX 5070이랑 5070 Ti가 섞였는지 확인해 줘`

## 이 MCP로 할 수 있는 일

- `search_products`
  - 전자기기 상품을 검색합니다.
  - 판매처별 가격과 모델별 묶음 결과를 함께 보여줍니다.
- `compare_product_prices`
  - 정확히 같은 모델만 골라 현재 가격대를 비교합니다.
  - 검색 결과에 다른 모델이 섞이면 비교를 멈추고 더 구체적인 검색어를 안내합니다.
- `explain_purchase_options`
  - 지금 검색된 결과 안에서 최저가 기준으로 어떤 선택이 유리한지 짧게 설명합니다.

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
- 체험용 HTTP API는 읽기 전용이며 `search`, `compare`만 공개합니다.
- ChatGPT 앱 링크는 별도 운영 단계에서 추가할 예정입니다.
