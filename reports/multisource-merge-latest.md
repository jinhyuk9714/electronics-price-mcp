# Multisource Merge Evaluation

- generatedAt: 2026-03-14T05:52:08.397Z
- total: 7
- pass/fail: 7 / 0
- passRate: 100%
- canonical mall dedupe hits: 4
- cross-source duplicate drops: 4

## source 조합별 결과

| source combination | total | pass | fail | passRate |
| --- | ---: | ---: | ---: | ---: |
| danawa+static-catalog | 1 | 1 | 0 | 100% |
| naver-shopping+danawa | 2 | 2 | 0 | 100% |
| naver-shopping+danawa+static-catalog | 1 | 1 | 0 | 100% |
| naver-shopping+static-catalog | 3 | 3 | 0 | 100% |

## failure patterns

- none

## cases

### merge-same-mall-alias-dedupe
- action: search
- sourceCombination: naver-shopping+static-catalog
- status: pass
- observedSummary: 27GR93U 기준 1개 모델, 1개 판매처를 찾았습니다.
- diagnostics: dedupe=1, drops=1, partialFailure=false

### merge-different-mall-keep-both
- action: search
- sourceCombination: naver-shopping+static-catalog
- status: pass
- observedSummary: 27GR93U 기준 1개 모델, 2개 판매처를 찾았습니다.
- diagnostics: dedupe=0, drops=0, partialFailure=false

### merge-same-mall-large-price-gap
- action: search
- sourceCombination: naver-shopping+danawa
- status: pass
- observedSummary: 27GR93U 기준 1개 모델, 2개 판매처를 찾았습니다.
- diagnostics: dedupe=0, drops=0, partialFailure=false

### merge-source-priority-tiebreak
- action: search
- sourceCombination: naver-shopping+danawa+static-catalog
- status: pass
- observedSummary: 27GR93U 기준 1개 모델, 1개 판매처를 찾았습니다.
- diagnostics: dedupe=2, drops=2, partialFailure=false

### merge-partial-provider-failure
- action: compare
- sourceCombination: naver-shopping+danawa
- status: pass
- observedSummary: ZOTAC GAMING GeForce RTX 5070 Twin Edge 기준 최저가 919000원, 최고가 929000원, 판매처 2곳입니다.
- diagnostics: dedupe=0, drops=0, partialFailure=true

### merge-broad-query-safety
- action: compare
- sourceCombination: naver-shopping+static-catalog
- status: pass
- observedSummary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- diagnostics: dedupe=0, drops=0, partialFailure=false

### merge-danawa-static-alias-dedupe
- action: search
- sourceCombination: danawa+static-catalog
- status: pass
- observedSummary: RTX 5070 기준 1개 모델, 1개 판매처를 찾았습니다.
- diagnostics: dedupe=1, drops=1, partialFailure=false
