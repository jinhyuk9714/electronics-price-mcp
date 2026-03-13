# Electronics Price MCP

한국 쇼핑몰 기준으로 전자기기와 PC 부품을 찾고, 같은 모델끼리만 가격을 비교해 주는 원격 MCP 서버입니다.

현재 v1은 공식 [네이버 쇼핑 검색 API](https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md)만 사용합니다.

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
REQUEST_TIMEOUT_MS=8000
CACHE_TTL_MS=300000
PUBLIC_BASE_URL=https://electronics-price-mcp.jinhyuk9714.workers.dev
CHATGPT_APP_URL=
```

필수 값

- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

선택 값

- `REQUEST_TIMEOUT_MS`
- `CACHE_TTL_MS`
- `PUBLIC_BASE_URL`
- `CHATGPT_APP_URL`

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

## 현재 범위와 제한

- v1은 네이버 쇼핑 검색 결과 안에서만 가격을 비교합니다.
- 역대 최저가, 실시간 재고, 배송 예정일은 다루지 않습니다.
- 상세 스펙 표를 만들지 않고, 상품 제목에서 읽히는 모델명만 사용합니다.
- `RTX 5070`과 `RTX 5070 Ti`처럼 다른 모델이 섞이면 비교를 거부합니다.
- 체험용 HTTP API는 읽기 전용이며 `search`, `compare`만 공개합니다.
- 공개 엔드포인트에는 운영 가드레일이 적용됩니다.
  - `/api/search`: 분당 60회
  - `/api/compare`: 분당 60회
  - `/mcp`: 분당 120회
  - 제한 초과 시 `429`, `error.code=RATE_LIMITED`, `Retry-After: 60`
