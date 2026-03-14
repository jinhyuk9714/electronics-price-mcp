# Operations

이 문서는 `electronics-price-mcp` 공개 서비스 운영자를 위한 메모입니다.

## 개요

- 런타임: Cloudflare Workers
- 데이터 소스: 네이버 쇼핑 검색 API
- 선택 소스: Danawa provider
- 전자기기 가격 비교 로직: Worker 내부 `PriceService`
- 운영 가드레일:
  - `ELECTRONICS_RATE_LIMITER` Durable Object
  - `X-Request-Id`
  - 구조화된 JSON 로그

공개 서비스 주소:

- 홈페이지: `https://electronics-price-mcp.jinhyuk9714.workers.dev`
- MCP: `https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp`

최신 품질 리포트:

- baseline: [service-quality-100-latest.md](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/reports/service-quality-100-latest.md)
- advanced: [service-quality-advanced-100-latest.md](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/reports/service-quality-advanced-100-latest.md)

## 배포 구조

- Worker 엔트리포인트: [src/index.ts](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/src/index.ts)
- Durable Object binding: `ELECTRONICS_RATE_LIMITER`
- Wrangler 설정: [wrangler.toml](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/wrangler.toml)

Durable Object는 Wrangler binding으로 주입됩니다. `.dev.vars`에 직접 넣지 않습니다.

필수 비밀값:

- 아래 둘 중 하나는 반드시 필요합니다.
- `NAVER_CLIENT_ID` + `NAVER_CLIENT_SECRET`
- `DANAWA_CLIENT_ID` + `DANAWA_CLIENT_SECRET`

선택 설정:

- `ENABLE_DANAWA`
- `DANAWA_API_BASE_URL`
- `REQUEST_TIMEOUT_MS`
- `CACHE_TTL_MS`
- `PUBLIC_BASE_URL`
- `CHATGPT_APP_URL`

공개 배포본은 현재 네이버 중심으로 운영됩니다. Danawa는 자격 증명이 있는 self-host 환경에서만 선택적으로 활성화되며, secret이 있어도 `ENABLE_DANAWA=true`일 때만 registry에 들어갑니다.

## Rate Limit 정책

| Route Group | 대상 경로 | 제한 |
| --- | --- | --- |
| `api-search` | `/api/search` | 분당 60회 |
| `api-compare` | `/api/compare` | 분당 60회 |
| `mcp` | `/mcp` | 분당 120회 |

제한 제외 경로:

- `/`
- `/health`
- `/prompt`
- `/privacy`
- `/openapi.json`
- `/openapi.yaml`

제한 초과 응답:

- HTTP status: `429`
- Header: `Retry-After: 60`
- Header: `X-Request-Id`
- JSON:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    "requestId": "..."
  }
}
```

## Request ID와 로그

모든 응답에는 `X-Request-Id`가 포함됩니다.

우선순위:

1. `cf-ray`
2. Worker에서 생성한 UUID

로그는 Cloudflare Workers Observability를 그대로 사용하고, 코드에서 JSON 한 줄 로그를 남깁니다.

주요 로그 필드:

- `requestId`
- `method`
- `path`
- `routeGroup`
- `statusCode`
- `latencyMs`
- `rateLimited`
- `tool`
- `resultStatus`
- `upstreamError`
- `providerStatuses`
- `providerOfferCounts`
- `partialProviderFailure`

성공 요청은 `console.log`, upstream 오류나 uncaught error는 `console.error`로 남깁니다.

멀티소스가 켜진 환경에서는 위 세 필드로 source별 성공/실패와 offer 개수를 바로 확인할 수 있습니다.

## 배포 후 Smoke Check

```bash
curl -i https://electronics-price-mcp.<subdomain>.workers.dev/
curl -i https://electronics-price-mcp.<subdomain>.workers.dev/health
curl -i "https://electronics-price-mcp.<subdomain>.workers.dev/api/search?query=그램%2016"
curl -i "https://electronics-price-mcp.<subdomain>.workers.dev/api/compare?query=RTX%205070"
curl -i https://electronics-price-mcp.<subdomain>.workers.dev/prompt
```

확인 포인트:

- `/health`가 `200 {"status":"ok"}` 인지
- `/api/search`, `/api/compare` 응답에 `X-Request-Id`가 붙는지
- `429` 테스트 시 `Retry-After: 60`과 `RATE_LIMITED` 코드가 보이는지

Danawa rollout smoke check:

```bash
npm run smoke:danawa -- --query "RTX 5070" --category graphics-card
```

이 스크립트는 `DANAWA_CLIENT_ID`, `DANAWA_CLIENT_SECRET`이 없으면 skip하고, 있으면 `danawa-only`와 `naver+danawa` 시나리오를 각각 확인합니다.

## 흔한 장애 대응

### 1. 네이버 인증 관련 오류

증상:

- `503`
- 메시지에 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` 언급

확인 순서:

1. Worker secret이 둘 다 설정돼 있는지 확인
2. 네이버 앱 상태와 secret 재발급 여부 확인
3. 필요하면 `wrangler secret put`으로 다시 설정

### 1-1. Danawa 인증 관련 오류

증상:

- `503`
- 메시지에 `DANAWA_CLIENT_ID`, `DANAWA_CLIENT_SECRET` 언급

확인 순서:

1. Worker secret이 둘 다 설정돼 있는지 확인
2. Danawa API base URL override를 쓰는 경우 URL이 올바른지 확인
3. 필요하면 `wrangler secret put`으로 다시 설정

### 1-2. Danawa rollout gate 미적용

증상:

- Danawa secret은 있는데 응답 source에 `danawa`가 전혀 안 보임
- 로그에도 Danawa provider status가 남지 않음

확인 순서:

1. `ENABLE_DANAWA=true`가 실제 배포 환경에 설정돼 있는지 확인
2. 배포 후 `npm run smoke:danawa`로 `danawa-only`, `naver+danawa` 시나리오를 각각 확인
3. 의도적으로 rollout을 멈춘 상태가 아니라면 `wrangler deploy` 후 다시 점검

### 2. 네이버 upstream rate limit 또는 timeout

증상:

- 검색/비교 응답 실패
- 로그에서 upstream error 또는 timeout 흔적

확인 순서:

1. `requestId`로 로그 조회
2. 같은 시각의 네이버 API 응답 상태 확인
3. 필요하면 `REQUEST_TIMEOUT_MS` 조정 검토
4. 멀티소스 환경이면 `providerStatuses`, `providerOfferCounts`, `partialProviderFailure`로 Danawa fallback이 정상 동작했는지 확인

### 3. 과호출 이슈

증상:

- `429 RATE_LIMITED`

확인 순서:

1. 응답의 `X-Request-Id`와 `Retry-After` 확인
2. 특정 IP 또는 특정 route-group에서 집중 호출이 있었는지 로그 확인
3. 정상 사용자인지, 자동화 호출인지 구분

## Danawa rollout 절차

1. `wrangler secret put DANAWA_CLIENT_ID`
2. `wrangler secret put DANAWA_CLIENT_SECRET`
3. 필요하면 `ENABLE_DANAWA=true`를 배포 환경에 설정
4. `npm run deploy`
5. `npm run smoke:danawa -- --query "RTX 5070" --category graphics-card`
6. 로그에서 `providerStatuses`, `providerOfferCounts`, `partialProviderFailure`를 확인

권장 순서:

- 먼저 secret을 넣고 `ENABLE_DANAWA=false` 상태로 배포
- smoke 경로와 로그 준비가 끝난 뒤 `ENABLE_DANAWA=true`로 rollout

### 4. 배포 후 Durable Object 오류

증상:

- rate limiter 관련 예외
- 새 배포 직후 `/api/*` 또는 `/mcp` 접근 실패

확인 순서:

1. `wrangler.toml`의 binding과 migration tag 확인
2. 배포 로그에 DO binding 노출 여부 확인
3. 필요하면 같은 브랜치에서 다시 `npm run deploy`
