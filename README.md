# Electronics Price MCP

한국 쇼핑몰 기준으로 전자기기와 PC 부품을 찾고, 같은 모델끼리만 가격을 비교해 주는 원격 MCP 서버입니다.

공개 production은 공식 [네이버 쇼핑 검색 API](https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md)를 기본 소스로 사용합니다. Danawa는 `canary-first`로 검증하고 있고, canary/dev에서는 `static-catalog` fallback으로 품질 게이트를 계속 돌릴 수 있게 유지합니다.

## 빠른 연결

원격 MCP 주소:

```text
https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp
```

공개 배포본을 그대로 쓰는 경우에는 환경변수가 필요 없습니다. 위 주소만 등록하면 됩니다.

### ChatGPT

원격 MCP 서버를 추가할 수 있는 화면이 보이면 위 주소를 그대로 넣으면 됩니다. UI 이름은 버전에 따라 `MCP`, `Connector`, `Server`처럼 다를 수 있습니다.

### Claude Desktop

원격 MCP를 직접 추가할 수 있는 환경이라면 같은 주소를 사용하면 됩니다.

### Claude Code

```bash
claude mcp add electronics-price-mcp https://electronics-price-mcp.jinhyuk9714.workers.dev/mcp --transport http
```

### Codex

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

## HTTP로 바로 확인하기

MCP를 직접 붙일 수 없는 환경에서는 HTTP 엔드포인트로 바로 확인할 수 있습니다.

- 프롬프트 안내: `https://electronics-price-mcp.jinhyuk9714.workers.dev/prompt`
- 검색 API: `https://electronics-price-mcp.jinhyuk9714.workers.dev/api/search?query=그램 16`
- 비교 API: `https://electronics-price-mcp.jinhyuk9714.workers.dev/api/compare?query=RTX 5070`
- 헬스 체크: `https://electronics-price-mcp.jinhyuk9714.workers.dev/health`

공개 HTTP API는 읽기 전용이며 `search`, `compare`만 제공합니다.

## Self-host 최소 가이드

직접 실행하거나 배포할 때만 환경변수가 필요합니다. 공개 원격 MCP를 쓰는 경우에는 이 섹션을 건너뛰면 됩니다.

1. [.dev.vars.example](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/.dev.vars.example)를 참고해 `.dev.vars`를 만듭니다.
2. 최소한 아래 값 하나는 준비합니다.
   - `NAVER_CLIENT_ID` + `NAVER_CLIENT_SECRET`
   - 또는 `ENABLE_DANAWA=true` + `DANAWA_CLIENT_ID` + `DANAWA_CLIENT_SECRET`
3. 로컬 실행:

```bash
npm install
npm test
npm run typecheck
npm run dev
```

기본 로컬 MCP 주소:

```text
http://127.0.0.1:8787/mcp
```

배포:

```bash
npm run deploy
```

canary 배포:

```bash
npm run deploy:danawa-canary
```

운영용 smoke, canary 평가, GitHub Actions 승격 흐름은 [OPERATIONS.md](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/docs/OPERATIONS.md)에 정리돼 있습니다.

## 현재 상태와 제한

- production은 현재 `Naver-only`입니다.
- Danawa는 `danawa-canary`에서 먼저 검증합니다.
- `static-catalog`는 canary/dev fallback용 보조 source이며 production 기본값은 비활성입니다.
- 다른 모델이 섞이면 비교를 거부합니다. 예를 들어 `RTX 5070`과 `RTX 5070 Ti`는 같은 비교 대상으로 취급하지 않습니다.
- 실시간 재고, 배송 예정일, 역대 최저가는 다루지 않습니다.
- 공개 엔드포인트에는 운영 가드레일이 적용됩니다.
  - `/api/search`: 분당 60회
  - `/api/compare`: 분당 60회
  - `/mcp`: 분당 120회

기본 canary URL:

```text
https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev
```

## 운영 문서

- 운영 런북: [OPERATIONS.md](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/docs/OPERATIONS.md)
- 로컬 환경변수 예시: [.dev.vars.example](/Users/sungjh/Projects/mcp1/.worktrees/electronics-price-mcp/.dev.vars.example)

운영 문서에는 아래 내용이 따로 정리돼 있습니다.

- rate limit, `X-Request-Id`, 구조화 로그
- canary와 production 배포 절차
- GitHub Actions `ci.yml`, `canary-eval.yml`, `deploy-worker.yml`
- smoke check와 release drill
- 장애 대응과 rollout 체크리스트
