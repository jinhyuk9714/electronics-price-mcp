# Electronics Price MCP

한국 쇼핑몰 기준으로 전자기기와 PC 부품을 찾고, 같은 모델끼리만 가격을 비교해 주는 원격 MCP 서버입니다.

현재 공개 배포본은 공식 [네이버 쇼핑 검색 API](https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md)를 기본 소스로 사용합니다.
Danawa는 `canary-first`로 운영하며, production은 계속 Naver-only를 유지하고 `danawa-canary` 환경에서만 먼저 `ENABLE_DANAWA=true`로 검증합니다.
Danawa 회신 전 canary/dev 검증을 이어가기 위해 `static-catalog` provider도 준비돼 있으며, 이것도 기본값은 비활성입니다. `danawa-canary`는 정적 fallback dataset `canary-eval-v1`를 써서 baseline/advanced 평가를 계속 돌릴 수 있게 유지합니다. 추가로 `static-canary-local` 오프라인 타깃이 있어, live endpoint 없이도 같은 품질 게이트를 CI에서 결정적으로 검증할 수 있습니다.

## AI 앱에서 바로 연결하기

원격 MCP 주소:

```text
https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp
```

공개 배포본을 그대로 쓰는 사용자는 환경변수를 설정할 필요가 없습니다. 위 주소만 등록하면 됩니다.

### ChatGPT

ChatGPT에서 원격 MCP 서버를 추가할 수 있는 화면이 보이면 위 MCP 주소를 그대로 넣으면 됩니다.
화면 이름은 버전에 따라 조금 다를 수 있으니 `MCP`, `Connector`, `Server` 같은 항목을 찾으면 됩니다.

### Claude Desktop

원격 MCP를 직접 추가할 수 있는 환경이라면 같은 주소를 사용하면 됩니다.

### Claude Code

```bash
claude mcp add electronics-price-mcp https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp --transport http
```

### Codex

가장 간단한 방법은 아래 명령으로 원격 MCP를 등록하는 것입니다.

```bash
codex mcp add electronics-price-mcp --url https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp
```

등록 후 확인:

```bash
codex mcp list
codex mcp get electronics-price-mcp
```

## 바로 써볼 질문

- `그램 16 검색해 줘`
- `RTX 5070 가격 비교해 줘`
- `무선 기계식 키보드 검색해 줘`
- `이 모델 지금 바로 사도 괜찮은 가격대인지 설명해 줘`

## 고급 사용

MCP를 직접 붙일 수 없는 환경에서는 아래 주소만 있으면 됩니다.

- 프롬프트 페이지: `https://electronics-price-mcp.jinhyuk9714.workers.dev/prompt`
- 검색 API: `https://electronics-price-mcp.jinhyuk9714.workers.dev/api/search?query=그램 16`
- 비교 API: `https://electronics-price-mcp.jinhyuk9714.workers.dev/api/compare?query=rtx 5070`

현재 공개 엔드포인트 성격:

- `/mcp`: MCP 클라이언트용 원격 엔드포인트
- `/api/search`: 브라우저나 `curl`로 바로 확인할 수 있는 읽기 전용 검색 API
- `/api/compare`: 브라우저나 `curl`로 바로 확인할 수 있는 읽기 전용 비교 API
- `/health`: 단순 헬스 체크
- `/prompt`: MCP를 직접 못 붙이는 환경을 위한 안내 페이지
- `/privacy`: 데이터 출처와 읽기 전용 성격 안내
- `/openapi.json`, `/openapi.yaml`: HTTP API 문서

운영 관련 세부 내용은 [OPERATIONS.md](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/docs/OPERATIONS.md)에 정리되어 있습니다.

## 환경 변수

`.dev.vars.example`을 참고해 `.dev.vars` 파일을 만들면 됩니다.

이 섹션은 로컬 실행이나 직접 배포하는 경우에만 필요합니다. 공개 배포본을 원격 MCP로 붙여 쓰는 경우에는 설정하지 않아도 됩니다.

```env
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
ENABLE_DANAWA=false
ENABLE_STATIC_CATALOG=false
STATIC_CATALOG_DATASET=core-exact-v1
DANAWA_CLIENT_ID=your_danawa_client_id
DANAWA_CLIENT_SECRET=your_danawa_client_secret
DANAWA_API_BASE_URL=http://api.danawa.com
REQUEST_TIMEOUT_MS=8000
CACHE_TTL_MS=300000
PUBLIC_BASE_URL=https://electronics-price-mcp.jinhyuk9714.workers.dev
CHATGPT_APP_URL=
```

필수 값

- 실제 요청을 처리하려면 아래 둘 중 하나가 필요합니다.
- `NAVER_CLIENT_ID` + `NAVER_CLIENT_SECRET`
- `ENABLE_DANAWA=true` + `DANAWA_CLIENT_ID` + `DANAWA_CLIENT_SECRET`

선택 값

- `ENABLE_DANAWA`
- `ENABLE_STATIC_CATALOG`
- `STATIC_CATALOG_DATASET`
- `DANAWA_API_BASE_URL`
- `REQUEST_TIMEOUT_MS`
- `CACHE_TTL_MS`
- `PUBLIC_BASE_URL`
- `CHATGPT_APP_URL`

Danawa를 실제로 활성화하려면 아래 두 조건이 모두 필요합니다.

- `ENABLE_DANAWA=true`
- `DANAWA_CLIENT_ID` + `DANAWA_CLIENT_SECRET`

즉 secret만 넣어 두어도 자동으로 켜지지는 않고, rollout gate인 `ENABLE_DANAWA=true`를 별도로 설정해야 합니다.

정적 피드는 canary/dev 검증용 fallback입니다.

- `ENABLE_STATIC_CATALOG=true`
- `STATIC_CATALOG_DATASET=core-exact-v1`

production은 기본적으로 `ENABLE_STATIC_CATALOG=false`를 유지합니다.
`danawa-canary`는 기본적으로 `ENABLE_STATIC_CATALOG=true`, `STATIC_CATALOG_DATASET=canary-eval-v1`를 사용합니다.

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

배포 후 기본 점검:

```bash
curl -i https://electronics-price-mcp.<subdomain>.workers.dev/health
curl -i "https://electronics-price-mcp.<subdomain>.workers.dev/api/search?query=그램%2016"
curl -i "https://electronics-price-mcp.<subdomain>.workers.dev/api/compare?query=RTX%205070"
```

모든 응답에는 `X-Request-Id`가 포함됩니다.

Danawa를 self-host 환경에서 켠 경우에는 아래 smoke check를 추가로 사용할 수 있습니다.

```bash
npm run smoke:danawa -- --query "RTX 5070" --category graphics-card
```

Danawa 회신 전 canary/dev에서 멀티소스 merge와 exact compare를 계속 검증하려면 정적 카탈로그 smoke check를 사용할 수 있습니다.

```bash
npm run smoke:static-catalog -- --query "RTX 5070" --category graphics-card
```

Danawa canary 배포와 검증:

```bash
npm run deploy:danawa-canary
npm run eval:service-quality:canary
npm run eval:service-quality:advanced:canary
```

GitHub Actions 기준 자동 검증:

```bash
npm run verify:ci
npm run eval:service-quality:static
npm run eval:service-quality:advanced:static
```

- CI는 mock-based multisource merge와 `static-canary-local` baseline/advanced를 자동 실행합니다.
- `verify:ci`와 GitHub Actions workflow는 strict gate로 동작해서, 평가 결과가 `100 / 0 / 0`이 아니면 실패 종료합니다.
- live service-quality 평가는 수동 workflow로만 돌립니다.
- `eval:service-quality*`와 `eval:multisource-merge` 기본 스크립트는 exploratory run 용도라 리포트를 남기고 종료합니다.
- Danawa rollout 전에는 canary workflow 결과를 기준으로 승격 여부를 판단합니다.
- `deploy-worker.yml`은 canary 검증을 거친 뒤 production으로 올릴 때 쓰는 수동 승격 workflow입니다.
- 권장 순서는 `ci.yml` green -> canary deploy + `both` -> artifact와 smoke 확인 -> production deploy + baseline 입니다.

기본 canary URL:

```text
https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev
```

## 현재 범위와 제한

- 공개 배포본 production은 현재 네이버 중심으로 동작합니다.
- Danawa는 `danawa-canary` 환경에서 먼저 검증하고, production 승격은 별도 라운드에서 진행합니다.
- self-host 환경에서는 `ENABLE_DANAWA=true`일 때만 Danawa provider를 함께 활성화할 수 있습니다.
- `static-catalog`는 canary/dev fallback용 보조 source이며 production 기본값은 비활성입니다.
- GitHub Actions `ci.yml`은 deterministic 검증을 strict gate로 자동 실행합니다.
- GitHub Actions `canary-eval.yml`은 production/canary live 평가를 strict gate로 수동 실행하는 운영 workflow입니다.
- GitHub Actions `deploy-worker.yml`은 canary와 production 배포를 수동 승격 흐름으로 실행하고, post-deploy 평가도 strict gate로 실행하는 운영 workflow입니다.
- 역대 최저가, 실시간 재고, 배송 예정일은 다루지 않습니다.
- 상세 스펙 표를 만들지 않고, 상품 제목에서 읽히는 모델명만 사용합니다.
- `RTX 5070`과 `RTX 5070 Ti`처럼 다른 모델이 섞이면 비교를 거부합니다.
- 체험용 HTTP API는 읽기 전용이며 `search`, `compare`만 공개합니다.
- 공개 엔드포인트에는 운영 가드레일이 적용됩니다.
  - `/api/search`: 분당 60회
  - `/api/compare`: 분당 60회
  - `/mcp`: 분당 120회
  - 제한 초과 시 `429`, `error.code=RATE_LIMITED`, `Retry-After: 60`
