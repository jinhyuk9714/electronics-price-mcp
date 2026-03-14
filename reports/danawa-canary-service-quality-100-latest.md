# Service Quality 100 Evaluation

- 생성 시각: 2026-03-14T06:11:31.960Z
- base URL: https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev
- MCP URL: https://electronics-price-mcp-danawa-canary.jinhyuk9714.workers.dev/mcp
- 전체 결과: 100 pass / 0 soft_fail / 0 fail
- 통과율: 100.0%

## 카테고리별 통과율

| 카테고리 | total | pass | soft_fail | fail | pass_rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| 노트북 | 20 | 20 | 0 | 0 | 100.0% |
| 그래픽카드 | 20 | 20 | 0 | 0 | 100.0% |
| 키보드 | 20 | 20 | 0 | 0 | 100.0% |
| 모니터 | 20 | 20 | 0 | 0 | 100.0% |
| PC 부품 | 20 | 20 | 0 | 0 | 100.0% |

## 의도별 통과율

| 의도 | total | pass | soft_fail | fail | pass_rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| broad search | 20 | 20 | 0 | 0 | 100.0% |
| exact-ish search | 20 | 20 | 0 | 0 | 100.0% |
| exact compare | 20 | 20 | 0 | 0 | 100.0% |
| broad ambiguous safety | 20 | 20 | 0 | 0 | 100.0% |
| purchase/explain | 20 | 20 | 0 | 0 | 100.0% |

## 실패 패턴 상위 5개

- 특이 실패 패턴이 없습니다.

## 다음 개선 우선순위

- 카테고리별 broad 검색 필터를 다시 점검하기
- exact-ish 검색에서 모델 코드 인식률을 높이기
- 설명형 응답 요약과 추천 문구를 더 자연스럽게 다듬기

## 문장별 결과

### laptop-broad-search-1 · pass
- prompt: 게이밍 노트북 검색해 줘
- expected_behavior: 게이밍 노트북 broad search에서 비게이밍/렌탈 노이즈가 크게 섞이지 않아야 한다.
- observed_summary: 게이밍 노트북 기준 2개 모델, 4개 판매처를 찾았습니다.
- notes: (none)

### laptop-broad-search-2 · pass
- prompt: 4060 노트북 찾아줘
- expected_behavior: 4060 노트북 검색에서 다른 GPU 변형과 렌탈 결과가 줄어들어야 한다.
- observed_summary: 4060 노트북 기준 2개 모델, 4개 판매처를 찾았습니다.
- notes: (none)

### laptop-broad-search-3 · pass
- prompt: 그램 16 검색해 줘
- expected_behavior: 그램 16 검색에서는 노트북 본체 위주 결과가 남아야 한다.
- observed_summary: 그램 16 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-broad-search-4 · pass
- prompt: 갤럭시북4 프로 16 찾아줘
- expected_behavior: 갤럭시북 broad search에서 액세서리 노이즈가 크게 줄어야 한다.
- observed_summary: 갤럭시북4 프로 16 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-ish-search-1 · pass
- prompt: 16Z90T GA5CK 검색해 줘
- expected_behavior: 정확한 그램 모델 검색은 모델 코드가 살아 있는 결과를 보여줘야 한다.
- observed_summary: 16Z90T GA5CK 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-ish-search-2 · pass
- prompt: NT960XGQ-A51A 찾아줘
- expected_behavior: 정확한 갤럭시북 모델 검색은 모델 코드와 본체 위주 결과를 유지해야 한다.
- observed_summary: NT960XGQ-A51A 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-ish-search-3 · pass
- prompt: 15IRX9 노트북 검색해 줘
- expected_behavior: Lenovo exact-ish search는 다른 GPU 변형이 크게 끼지 않아야 한다.
- observed_summary: 15IRX9 노트북 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-ish-search-4 · pass
- prompt: 15-FB2061AX 검색해 줘
- expected_behavior: HP exact-ish search는 동일 모델 중심으로 정리되어야 한다.
- observed_summary: 15-FB2061AX 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-compare-1 · pass
- prompt: 16Z90T GA5CK 가격 비교해 줘
- expected_behavior: 정확한 그램 모델 비교는 ok 상태여야 한다.
- observed_summary: LG 그램 16 16Z90T-GA5CK 기준 최저가 1699000원, 최고가 1729000원, 판매처 2곳입니다.
- notes: (none)

### laptop-exact-compare-2 · pass
- prompt: NT960XGQ-A51A 가격 비교해 줘
- expected_behavior: 정확한 갤럭시북 모델 비교는 ok 상태여야 한다.
- observed_summary: 삼성 갤럭시북4 프로 NT960XGQ-A51A 기준 최저가 1889000원, 최고가 1929000원, 판매처 2곳입니다.
- notes: (none)

### laptop-exact-compare-3 · pass
- prompt: 15IRX9 가격 비교해 줘
- expected_behavior: Lenovo exact compare는 모델 코드 기준으로 ok가 되어야 한다.
- observed_summary: 레노버 리전 5i 15IRX9 RTX 4060 기준 최저가 1679000원, 최고가 1699000원, 판매처 2곳입니다.
- notes: (none)

### laptop-exact-compare-4 · pass
- prompt: 15-FB2061AX 최저가 비교해 줘
- expected_behavior: HP exact compare는 모델 코드 기준으로 ok가 되어야 한다.
- observed_summary: HP Victus 15-fb2061AX RTX 4060 기준 최저가 1499000원, 최고가 1519000원, 판매처 2곳입니다.
- notes: (none)

### laptop-broad-ambiguous-safety-1 · pass
- prompt: 그램 16 가격 비교해 줘
- expected_behavior: 그램 16 broad compare는 안전하게 ambiguous로 멈추고 follow-up query를 제안해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-broad-ambiguous-safety-2 · pass
- prompt: 갤럭시북4 프로 16 가격 비교해 줘
- expected_behavior: 갤럭시북 broad compare는 ambiguous로 멈추고 모델 코드 재질문을 유도해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-broad-ambiguous-safety-3 · pass
- prompt: 4060 노트북 가격 비교해 줘
- expected_behavior: 4060 노트북 broad compare는 ambiguous로 멈추고 GPU-only 추천 없이 모델 코드 중심 제안을 해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-broad-ambiguous-safety-4 · pass
- prompt: 게이밍 노트북 가격 비교해 줘
- expected_behavior: 게이밍 노트북 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-purchase-explain-1 · pass
- prompt: 그램 16 지금 사도 괜찮아?
- expected_behavior: 그램 16 explain은 ambiguous로 멈추고 다음 질문을 제안해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-purchase-explain-2 · pass
- prompt: 4060 노트북 지금 사도 돼?
- expected_behavior: 4060 노트북 explain은 노트북 모델 코드 기준 추천을 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-purchase-explain-3 · pass
- prompt: NT960XGQ-A51A 지금 사도 괜찮은 가격대야?
- expected_behavior: 정확한 갤럭시북 explain은 ok 상태로 가격대 해석을 줘야 한다.
- observed_summary: 삼성 갤럭시북4 프로 NT960XGQ-A51A 기준 최저가 1889000원, 최고가 1929000원, 판매처 2곳입니다. 현재 최저가는 1889000원이고 최고가와의 차이는 40000원입니다.
- notes: (none)

### laptop-purchase-explain-4 · pass
- prompt: 15IRX9 지금 사도 괜찮아?
- expected_behavior: 정확한 Lenovo explain은 ok 상태로 가격 해석을 줘야 한다.
- observed_summary: 레노버 리전 5i 15IRX9 RTX 4060 기준 최저가 1679000원, 최고가 1699000원, 판매처 2곳입니다. 현재 최저가는 1679000원이고 최고가와의 차이는 20000원입니다.
- notes: (none)

### graphics-card-broad-search-1 · pass
- prompt: RTX 5070 제품 찾아줘
- expected_behavior: 5070 broad search는 부속품과 완본체 노이즈를 크게 줄여야 한다.
- observed_summary: RTX 5070 제품 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-broad-search-2 · pass
- prompt: RTX 5070 시리즈 검색해 줘
- expected_behavior: 5070 시리즈 broad search는 GPU 계열 중심으로 정리되어야 한다.
- observed_summary: RTX 5070 시리즈 기준 2개 모델, 4개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-broad-search-3 · pass
- prompt: RX 9070 그래픽카드 찾아줘
- expected_behavior: 라데온 broad search는 부속품과 완본체를 줄여야 한다.
- observed_summary: RX 9070 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-broad-search-4 · pass
- prompt: 5070 Ti 그래픽카드 검색해 줘
- expected_behavior: 5070 Ti broad search는 그래픽카드 본품 중심이어야 한다.
- observed_summary: 5070 Ti 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-ish-search-1 · pass
- prompt: ZOTAC RTX 5070 Twin Edge 검색해 줘
- expected_behavior: 정확한 GPU 모델 검색은 부속품 없이 모델명이 살아 있어야 한다.
- observed_summary: ZOTAC RTX 5070 Twin Edge 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-ish-search-2 · pass
- prompt: ASUS TUF RTX 5070 Ti 찾아줘
- expected_behavior: 정확한 ASUS GPU 검색은 모델 계열이 유지되어야 한다.
- observed_summary: ASUS TUF RTX 5070 Ti 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-ish-search-3 · pass
- prompt: Sapphire RX 9070 XT Pulse 검색해 줘
- expected_behavior: 정확한 Sapphire 검색은 XT 변형을 유지해야 한다.
- observed_summary: Sapphire RX 9070 XT Pulse 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-ish-search-4 · pass
- prompt: PowerColor RX 9070 Hellhound 찾아줘
- expected_behavior: 정확한 PowerColor 검색은 브랜드/모델명이 살아 있어야 한다.
- observed_summary: PowerColor RX 9070 Hellhound 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-compare-1 · pass
- prompt: RTX 5070 가격 비교해 줘
- expected_behavior: RTX 5070 exact compare는 ok 상태여야 한다.
- observed_summary: ZOTAC GAMING GeForce RTX 5070 Twin Edge 기준 최저가 799000원, 최고가 809000원, 판매처 2곳입니다.
- notes: (none)

### graphics-card-exact-compare-2 · pass
- prompt: RTX 5070 Ti 가격 비교해 줘
- expected_behavior: RTX 5070 Ti exact compare는 ok 상태여야 한다.
- observed_summary: MSI GeForce RTX 5070 Ti Ventus 2X OC 기준 최저가 999000원, 최고가 1019000원, 판매처 2곳입니다.
- notes: (none)

### graphics-card-exact-compare-3 · pass
- prompt: RX 9070 가격 비교해 줘
- expected_behavior: RX 9070 exact compare는 XT와 섞이지 않고 ok여야 한다.
- observed_summary: ASRock Radeon RX 9070 Challenger 기준 최저가 749000원, 최고가 759000원, 판매처 2곳입니다.
- notes: (none)

### graphics-card-exact-compare-4 · pass
- prompt: RX 9070 XT 가격 비교해 줘
- expected_behavior: RX 9070 XT exact compare는 ok 상태여야 한다.
- observed_summary: SAPPHIRE PULSE Radeon RX 9070 XT 기준 최저가 889000원, 최고가 899000원, 판매처 2곳입니다.
- notes: (none)

### graphics-card-broad-ambiguous-safety-1 · pass
- prompt: RTX 5070 시리즈 가격 비교해 줘
- expected_behavior: 5070 시리즈 broad compare는 ambiguous로 멈추고 follow-up query를 제안해야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-broad-ambiguous-safety-2 · pass
- prompt: RX 9070 시리즈 가격 비교해 줘
- expected_behavior: 9070 시리즈 broad compare는 ambiguous로 멈춰야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-broad-ambiguous-safety-3 · pass
- prompt: 엔비디아 5070 그래픽카드 비교해 줘
- expected_behavior: 브랜드+세대 broad compare는 동일상품 비교를 시도하지 않아야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-broad-ambiguous-safety-4 · pass
- prompt: 라데온 9070 계열 비교해 줘
- expected_behavior: 라데온 계열 broad compare는 ambiguous로 멈추고 추천 질의를 줘야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-purchase-explain-1 · pass
- prompt: RTX 5070 지금 사도 돼?
- expected_behavior: RTX 5070 explain은 ok 상태로 가격 해석을 줘야 한다.
- observed_summary: ZOTAC GAMING GeForce RTX 5070 Twin Edge 기준 최저가 799000원, 최고가 809000원, 판매처 2곳입니다. 현재 최저가는 799000원이고 최고가와의 차이는 10000원입니다.
- notes: (none)

### graphics-card-purchase-explain-2 · pass
- prompt: RX 9070 XT 지금 사도 괜찮은 가격대야?
- expected_behavior: RX 9070 XT explain은 ok 상태로 가격 해석을 줘야 한다.
- observed_summary: SAPPHIRE PULSE Radeon RX 9070 XT 기준 최저가 889000원, 최고가 899000원, 판매처 2곳입니다. 현재 최저가는 889000원이고 최고가와의 차이는 10000원입니다.
- notes: (none)

### graphics-card-purchase-explain-3 · pass
- prompt: RTX 5070 시리즈 지금 사도 돼?
- expected_behavior: GPU 시리즈 explain은 ambiguous로 멈추고 재질문을 유도해야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-purchase-explain-4 · pass
- prompt: RX 9070 계열 지금 사도 괜찮아?
- expected_behavior: 라데온 계열 explain은 ambiguous로 멈추고 suggestedQueries를 줘야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### keyboard-broad-search-1 · pass
- prompt: 게이밍 키보드 찾아줘
- expected_behavior: 게이밍 키보드 broad search에 오피스 키보드가 과하게 섞이지 않아야 한다.
- observed_summary: 게이밍 키보드 기준 3개 모델, 6개 판매처를 찾았습니다.
- notes: (none)

### keyboard-broad-search-2 · pass
- prompt: 무선 기계식 키보드 검색해 줘
- expected_behavior: 무선 기계식 키보드 검색은 키보드 본체 중심이어야 한다.
- observed_summary: 무선 기계식 키보드 기준 5개 모델, 10개 판매처를 찾았습니다.
- notes: (none)

### keyboard-broad-search-3 · pass
- prompt: 텐키리스 게이밍 키보드 찾아줘
- expected_behavior: TKL 게이밍 키보드 검색은 게이밍/텐키리스 의도와 크게 어긋나지 않아야 한다.
- observed_summary: 텐키리스 게이밍 키보드 기준 4개 모델, 8개 판매처를 찾았습니다.
- notes: (none)

### keyboard-broad-search-4 · pass
- prompt: 저소음 사무용 키보드 검색해 줘
- expected_behavior: 사무용 키보드 검색은 게이밍 키워드가 과하게 섞이지 않아야 한다.
- observed_summary: 저소음 사무용 키보드 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-ish-search-1 · pass
- prompt: Keychron K2 Pro 검색해 줘
- expected_behavior: 정확한 Keychron 검색은 모델명이 유지되어야 한다.
- observed_summary: Keychron K2 Pro 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-ish-search-2 · pass
- prompt: 로지텍 MX Mechanical Mini 찾아줘
- expected_behavior: MX Mechanical Mini 검색은 키보드 본체 중심이어야 한다.
- observed_summary: 로지텍 MX Mechanical Mini 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-ish-search-3 · pass
- prompt: 앱코 K660 검색해 줘
- expected_behavior: 앱코 K660 검색은 모델명을 유지해야 한다.
- observed_summary: ABKO K660 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-ish-search-4 · pass
- prompt: DrunkDeer A75 찾아줘
- expected_behavior: DrunkDeer A75 검색은 키보드 본체 중심이어야 한다.
- observed_summary: DrunkDeer A75 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-compare-1 · pass
- prompt: Keychron K2 Pro 가격 비교해 줘
- expected_behavior: Keychron K2 Pro exact compare는 가능하면 ok 상태여야 한다.
- observed_summary: Keychron K2 Pro 무선 기계식 키보드 기준 최저가 149000원, 최고가 152000원, 판매처 2곳입니다.
- notes: (none)

### keyboard-exact-compare-2 · pass
- prompt: 로지텍 MX Mechanical Mini 가격 비교해 줘
- expected_behavior: MX Mechanical Mini exact compare는 가능하면 ok 상태여야 한다.
- observed_summary: Logitech MX Mechanical Mini 무선 키보드 기준 최저가 169000원, 최고가 171000원, 판매처 2곳입니다.
- notes: (none)

### keyboard-exact-compare-3 · pass
- prompt: 앱코 K660 가격 비교해 줘
- expected_behavior: 앱코 K660 exact compare는 가능하면 ok 상태여야 한다.
- observed_summary: 앱코 ABKO K660 완전방수 카일 광축 키보드 기준 최저가 59900원, 최고가 64900원, 판매처 2곳입니다.
- notes: (none)

### keyboard-exact-compare-4 · pass
- prompt: DrunkDeer A75 가격 비교해 줘
- expected_behavior: DrunkDeer A75 exact compare는 가능하면 ok 상태여야 한다.
- observed_summary: DrunkDeer A75 래피드트리거 게이밍 키보드 기준 최저가 139000원, 최고가 142000원, 판매처 2곳입니다.
- notes: (none)

### keyboard-broad-ambiguous-safety-1 · pass
- prompt: 게이밍 키보드 가격 비교해 줘
- expected_behavior: 게이밍 키보드 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-broad-ambiguous-safety-2 · pass
- prompt: 무선 키보드 가격 비교해 줘
- expected_behavior: 무선 키보드 broad compare는 ambiguous로 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-broad-ambiguous-safety-3 · pass
- prompt: Keychron 키보드 가격 비교해 줘
- expected_behavior: 브랜드 단위 Keychron compare는 ambiguous로 멈추고 모델 추천을 주는 편이 좋다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-broad-ambiguous-safety-4 · pass
- prompt: 로지텍 기계식 키보드 가격 비교해 줘
- expected_behavior: 브랜드 단위 로지텍 기계식 키보드 compare는 ambiguous여야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-purchase-explain-1 · pass
- prompt: 게이밍 키보드 지금 사도 돼?
- expected_behavior: 게이밍 키보드 explain은 동일상품이 아니면 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-purchase-explain-2 · pass
- prompt: Keychron 키보드 지금 사도 괜찮아?
- expected_behavior: Keychron 브랜드 explain은 ambiguous로 멈추고 follow-up query를 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-purchase-explain-3 · pass
- prompt: 로지텍 MX Mechanical Mini 지금 사도 괜찮은 가격대야?
- expected_behavior: 정확한 MX Mechanical explain은 ok 상태로 가격 해석을 줘야 한다.
- observed_summary: Logitech MX Mechanical Mini 무선 키보드 기준 최저가 169000원, 최고가 171000원, 판매처 2곳입니다. 현재 최저가는 169000원이고 최고가와의 차이는 2000원입니다.
- notes: (none)

### keyboard-purchase-explain-4 · pass
- prompt: 앱코 K660 지금 사도 돼?
- expected_behavior: 앱코 K660 explain은 ok 상태를 목표로 한다.
- observed_summary: 앱코 ABKO K660 완전방수 카일 광축 키보드 기준 최저가 59900원, 최고가 64900원, 판매처 2곳입니다. 현재 최저가는 59900원이고 최고가와의 차이는 5000원입니다.
- notes: (none)

### monitor-broad-search-1 · pass
- prompt: 27인치 4K 모니터 검색해 줘
- expected_behavior: 27인치 4K 모니터 broad search는 모니터 본품 중심이어야 한다.
- observed_summary: 27인치 4K 모니터 기준 4개 모델, 8개 판매처를 찾았습니다.
- notes: (none)

### monitor-broad-search-2 · pass
- prompt: 게이밍 모니터 찾아줘
- expected_behavior: 게이밍 모니터 broad search는 렌탈 노이즈를 크게 줄여야 한다.
- observed_summary: 게이밍 모니터 기준 4개 모델, 8개 판매처를 찾았습니다.
- notes: (none)

### monitor-broad-search-3 · pass
- prompt: 울트라와이드 모니터 검색해 줘
- expected_behavior: 울트라와이드 모니터 broad search는 모니터 본체 위주여야 한다.
- observed_summary: 검색 결과가 없습니다: 울트라와이드 모니터
- notes: (none)

### monitor-broad-search-4 · pass
- prompt: 32인치 QHD 모니터 찾아줘
- expected_behavior: 32인치 QHD 모니터 broad search는 과도하게 흩어지지 않아야 한다.
- observed_summary: 32인치 QHD 모니터 기준 3개 모델, 6개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-ish-search-1 · pass
- prompt: LG 27GR93U 검색해 줘
- expected_behavior: 정확한 LG 모니터 검색은 모델 코드가 유지되어야 한다.
- observed_summary: LG 27GR93U 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-ish-search-2 · pass
- prompt: Dell U2723QE 찾아줘
- expected_behavior: 정확한 Dell 모니터 검색은 모델 코드가 유지되어야 한다.
- observed_summary: Dell U2723QE 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-ish-search-3 · pass
- prompt: MSI MPG 321URX 검색해 줘
- expected_behavior: 정확한 MSI 모니터 검색은 모델 코드가 살아 있어야 한다.
- observed_summary: MSI MPG 321URX 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-ish-search-4 · pass
- prompt: 삼성 S27DG500 찾아줘
- expected_behavior: 정확한 삼성 모니터 검색은 모델 코드가 유지되어야 한다.
- observed_summary: 삼성 S27DG500 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-compare-1 · pass
- prompt: LG 27GR93U 가격 비교해 줘
- expected_behavior: LG 27GR93U exact compare는 ok 상태를 목표로 한다.
- observed_summary: LG 울트라기어 27GR93U 27인치 4K 모니터 기준 최저가 799000원, 최고가 819000원, 판매처 2곳입니다.
- notes: (none)

### monitor-exact-compare-2 · pass
- prompt: Dell U2723QE 가격 비교해 줘
- expected_behavior: Dell U2723QE exact compare는 ok 상태를 목표로 한다.
- observed_summary: DELL U2723QE 27인치 4K UHD IPS 모니터 기준 최저가 689000원, 최고가 699000원, 판매처 2곳입니다.
- notes: (none)

### monitor-exact-compare-3 · pass
- prompt: MSI MPG 321URX 가격 비교해 줘
- expected_behavior: MSI 321URX exact compare는 ok 상태를 목표로 한다.
- observed_summary: MSI MPG 321URX QD-OLED 32인치 게이밍 모니터 기준 최저가 1599000원, 최고가 1619000원, 판매처 2곳입니다.
- notes: (none)

### monitor-exact-compare-4 · pass
- prompt: 삼성 S27DG500 가격 비교해 줘
- expected_behavior: 삼성 S27DG500 exact compare는 ok 상태를 목표로 한다.
- observed_summary: 삼성전자 오디세이 G5 S27DG500 27인치 게이밍 모니터 기준 최저가 339000원, 최고가 349000원, 판매처 2곳입니다.
- notes: (none)

### monitor-broad-ambiguous-safety-1 · pass
- prompt: 27인치 4K 모니터 가격 비교해 줘
- expected_behavior: 27인치 4K 모니터 broad compare는 ambiguous로 멈추고 모델 추천을 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-broad-ambiguous-safety-2 · pass
- prompt: 게이밍 모니터 가격 비교해 줘
- expected_behavior: 게이밍 모니터 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-broad-ambiguous-safety-3 · pass
- prompt: 32인치 QHD 모니터 가격 비교해 줘
- expected_behavior: 32인치 QHD broad compare는 ambiguous로 멈추고 follow-up query를 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-broad-ambiguous-safety-4 · pass
- prompt: 울트라와이드 모니터 가격 비교해 줘
- expected_behavior: 울트라와이드 broad compare는 ambiguous로 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-purchase-explain-1 · pass
- prompt: 27인치 4K 모니터 지금 사도 돼?
- expected_behavior: 27인치 4K monitor explain은 ambiguous로 멈추고 follow-up query를 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-purchase-explain-2 · pass
- prompt: 게이밍 모니터 지금 사도 괜찮아?
- expected_behavior: 게이밍 모니터 explain은 broad query이면 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-purchase-explain-3 · pass
- prompt: LG 27GR93U 지금 사도 괜찮은 가격대야?
- expected_behavior: LG 27GR93U explain은 ok 상태를 목표로 한다.
- observed_summary: LG 울트라기어 27GR93U 27인치 4K 모니터 기준 최저가 799000원, 최고가 819000원, 판매처 2곳입니다. 현재 최저가는 799000원이고 최고가와의 차이는 20000원입니다.
- notes: (none)

### monitor-purchase-explain-4 · pass
- prompt: Dell U2723QE 지금 사도 돼?
- expected_behavior: Dell U2723QE explain은 ok 상태를 목표로 한다.
- observed_summary: DELL U2723QE 27인치 4K UHD IPS 모니터 기준 최저가 689000원, 최고가 699000원, 판매처 2곳입니다. 현재 최저가는 689000원이고 최고가와의 차이는 10000원입니다.
- notes: (none)

### pc-part-broad-search-1 · pass
- prompt: B650 메인보드 검색해 줘
- expected_behavior: B650 메인보드 broad search는 완본체와 렌탈 노이즈를 줄여야 한다.
- observed_summary: B650 메인보드 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-broad-search-2 · pass
- prompt: 850W 파워 찾아줘
- expected_behavior: 850W 파워 broad search는 파워 본품 중심이어야 한다.
- observed_summary: 850W 파워 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-broad-search-3 · pass
- prompt: DDR5 32GB 메모리 검색해 줘
- expected_behavior: DDR5 32GB 메모리 broad search는 메모리 본품 중심이어야 한다.
- observed_summary: DDR5 32GB 메모리 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-broad-search-4 · pass
- prompt: NVMe SSD 2TB 찾아줘
- expected_behavior: NVMe SSD broad search는 외장 저장장치나 완본체 노이즈를 줄여야 한다.
- observed_summary: NVMe SSD 2TB 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-ish-search-1 · pass
- prompt: ASUS TUF B650M-PLUS 검색해 줘
- expected_behavior: 정확한 메인보드 검색은 모델명을 유지해야 한다.
- observed_summary: ASUS TUF B650M-PLUS 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-ish-search-2 · pass
- prompt: Ryzen 7 9800X3D 찾아줘
- expected_behavior: 정확한 CPU 검색은 모델명을 유지해야 한다.
- observed_summary: Ryzen 7 9800X3D 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-ish-search-3 · pass
- prompt: WD SN850X 2TB 검색해 줘
- expected_behavior: 정확한 SSD 검색은 외장 SSD와 과도하게 섞이지 않아야 한다.
- observed_summary: WD SN850X 2TB 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-ish-search-4 · pass
- prompt: SuperFlower SF-850F14XG 찾아줘
- expected_behavior: 정확한 파워 검색은 모델명을 유지해야 한다.
- observed_summary: SuperFlower SF-850F14XG 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-compare-1 · pass
- prompt: ASUS TUF B650M-PLUS 가격 비교해 줘
- expected_behavior: 메인보드 exact compare는 ok 상태를 목표로 한다.
- observed_summary: ASUS TUF B650M-PLUS WIFI 메인보드 기준 최저가 249000원, 최고가 255000원, 판매처 2곳입니다.
- notes: (none)

### pc-part-exact-compare-2 · pass
- prompt: Ryzen 7 9800X3D 가격 비교해 줘
- expected_behavior: CPU exact compare는 ok 상태를 목표로 한다.
- observed_summary: AMD Ryzen 7 9800X3D 정품 멀티팩 기준 최저가 679000원, 최고가 689000원, 판매처 2곳입니다.
- notes: (none)

### pc-part-exact-compare-3 · pass
- prompt: WD SN850X 2TB 가격 비교해 줘
- expected_behavior: SSD exact compare는 ok 상태를 목표로 한다.
- observed_summary: WD_BLACK SN850X 2TB NVMe SSD 기준 최저가 219000원, 최고가 225000원, 판매처 2곳입니다.
- notes: (none)

### pc-part-exact-compare-4 · pass
- prompt: SuperFlower SF-850F14XG 가격 비교해 줘
- expected_behavior: 파워 exact compare는 ok 상태를 목표로 한다.
- observed_summary: SUPERFLOWER SF-850F14XG LEADEX III GOLD 850W 기준 최저가 159000원, 최고가 162000원, 판매처 2곳입니다.
- notes: (none)

### pc-part-broad-ambiguous-safety-1 · pass
- prompt: B650 메인보드 가격 비교해 줘
- expected_behavior: B650 broad compare는 ambiguous로 멈추고 모델 재질문을 유도해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-broad-ambiguous-safety-2 · pass
- prompt: 850W 파워 가격 비교해 줘
- expected_behavior: 파워 broad compare는 ambiguous로 멈추고 follow-up query를 제안해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-broad-ambiguous-safety-3 · pass
- prompt: DDR5 32GB 메모리 가격 비교해 줘
- expected_behavior: 메모리 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-broad-ambiguous-safety-4 · pass
- prompt: NVMe SSD 2TB 가격 비교해 줘
- expected_behavior: SSD broad compare는 ambiguous로 멈추고 모델 재질문을 유도해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-purchase-explain-1 · pass
- prompt: B650 메인보드 지금 사도 돼?
- expected_behavior: B650 explain은 broad query면 ambiguous로 멈추고 follow-up query를 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-purchase-explain-2 · pass
- prompt: Ryzen 7 9800X3D 지금 사도 괜찮아?
- expected_behavior: CPU exact explain은 ok 상태를 목표로 한다.
- observed_summary: AMD Ryzen 7 9800X3D 정품 멀티팩 기준 최저가 679000원, 최고가 689000원, 판매처 2곳입니다. 현재 최저가는 679000원이고 최고가와의 차이는 10000원입니다.
- notes: (none)

### pc-part-purchase-explain-3 · pass
- prompt: WD SN850X 2TB 지금 사도 돼?
- expected_behavior: SSD exact explain은 ok 상태를 목표로 한다.
- observed_summary: WD_BLACK SN850X 2TB NVMe SSD 기준 최저가 219000원, 최고가 225000원, 판매처 2곳입니다. 현재 최저가는 219000원이고 최고가와의 차이는 6000원입니다.
- notes: (none)

### pc-part-purchase-explain-4 · pass
- prompt: 850W 파워 지금 사도 괜찮은 가격대야?
- expected_behavior: 파워 broad explain은 ambiguous로 멈추고 재질문을 유도해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

