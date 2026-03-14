# Service Quality Advanced 100 Evaluation

- 생성 시각: 2026-03-14T06:30:59.151Z
- base URL: static-canary-local://local
- MCP URL: static-canary-local://local/mcp
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
- prompt: 게임도 좀 할 거라 게이밍 노트북 쪽으로 보고 싶은데, 사무용 느낌 나는 건 빼고 요즘 뭐가 잡히는지 정리해줘
- expected_behavior: 게이밍 노트북 broad search에서 비게이밍/렌탈 노이즈가 크게 섞이지 않아야 한다.
- observed_summary: 게이밍 노트북 기준 2개 모델, 4개 판매처를 찾았습니다.
- notes: (none)

### laptop-broad-search-2 · pass
- prompt: 4060 들어간 노트북을 보는 중인데 렌탈이나 다른 급 그래픽 섞지 말고 대충 후보가 뭐가 있나 좀 볼래
- expected_behavior: 4060 노트북 검색에서 다른 GPU 변형과 렌탈 결과가 줄어들어야 한다.
- observed_summary: 4060 노트북 기준 2개 모델, 4개 판매처를 찾았습니다.
- notes: (none)

### laptop-broad-search-3 · pass
- prompt: 그램 16 생각 중인데 키스킨 같은 거 말고 본체 위주로만 뭐가 뜨는지 보여줘
- expected_behavior: 그램 16 검색에서는 노트북 본체 위주 결과가 남아야 한다.
- observed_summary: 그램 16 만 뭐가 뜨는지 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-broad-search-4 · pass
- prompt: 갤북4 프로 16 쪽으로 알아보는 중이라 파우치나 필름 같은 건 빼고 본체만 찾아줘
- expected_behavior: 갤럭시북 broad search에서 액세서리 노이즈가 크게 줄어야 한다.
- observed_summary: 갤럭시북4 프로 16 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-ish-search-1 · pass
- prompt: LG 그램 쪽에서 16Z90T GA5CK로 보이는 본체들만 가능하면 깔끔하게 정리해줘
- expected_behavior: 정확한 그램 모델 검색은 모델 코드가 살아 있는 결과를 보여줘야 한다.
- observed_summary: LG 그램 쪽에서 16Z90T GA5CK로 보이는 본체들만 깔끔하게 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-ish-search-2 · pass
- prompt: 삼성 쪽은 NT960XGQ-A51A 이 모델로 찾고 싶은데 액세서리 말고 본체 위주로 보여줘
- expected_behavior: 정확한 갤럭시북 모델 검색은 모델 코드와 본체 위주 결과를 유지해야 한다.
- observed_summary: 삼성 쪽은 NT960XGQ-A51A 이 모델로 찾고 싶은데 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-ish-search-3 · pass
- prompt: 레노버는 15IRX9로 보는 거라 다른 비슷한 급 말고 이 모델 검색 좀 해줘
- expected_behavior: Lenovo exact-ish search는 다른 GPU 변형이 크게 끼지 않아야 한다.
- observed_summary: 레노버는 15IRX9로 보는 거라 다른 비슷한 급 말고 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-ish-search-4 · pass
- prompt: 빅터스 쪽에서 15-FB2061AX 이걸 보는 거라 모델 맞는 것들만 한번 찾아봐줘
- expected_behavior: HP exact-ish search는 동일 모델 중심으로 정리되어야 한다.
- observed_summary: 빅터스 쪽에서 15-FB2061AX 이걸 보는 거라 모델 맞는 것들만 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### laptop-exact-compare-1 · pass
- prompt: 그램 16 중에서도 16Z90T GA5CK 이거 가격 비교만 딱 해줘
- expected_behavior: 정확한 그램 모델 비교는 ok 상태여야 한다.
- observed_summary: LG 그램 16 16Z90T-GA5CK 기준 최저가 1699000원, 최고가 1729000원, 판매처 2곳입니다.
- notes: (none)

### laptop-exact-compare-2 · pass
- prompt: NT960XGQ-A51A 이 모델은 지금 판매처별로 얼마 차이 나는지 비교해줘
- expected_behavior: 정확한 갤럭시북 모델 비교는 ok 상태여야 한다.
- observed_summary: 삼성 갤럭시북4 프로 NT960XGQ-A51A 기준 최저가 1889000원, 최고가 1929000원, 판매처 2곳입니다.
- notes: (none)

### laptop-exact-compare-3 · pass
- prompt: 15IRX9 하나 보고 있는데 같은 모델끼리 최저가 비교 좀 해줘
- expected_behavior: Lenovo exact compare는 모델 코드 기준으로 ok가 되어야 한다.
- observed_summary: 레노버 리전 5i 15IRX9 RTX 4060 기준 최저가 1679000원, 최고가 1699000원, 판매처 2곳입니다.
- notes: (none)

### laptop-exact-compare-4 · pass
- prompt: 15-FB2061AX 이거는 다른 거 섞지 말고 정확히 같은 모델만 비교해줘
- expected_behavior: HP exact compare는 모델 코드 기준으로 ok가 되어야 한다.
- observed_summary: HP Victus 15-fb2061AX RTX 4060 기준 최저가 1499000원, 최고가 1519000원, 판매처 2곳입니다.
- notes: (none)

### laptop-broad-ambiguous-safety-1 · pass
- prompt: 그램 16 라인으로 보긴 하는데 모델이 많을 것 같아서, 바로 비교 말고 가능 여부부터 봐줘
- expected_behavior: 그램 16 broad compare는 안전하게 ambiguous로 멈추고 follow-up query를 제안해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-broad-ambiguous-safety-2 · pass
- prompt: 갤북4 프로 16이라고만 보면 여러 모델일 것 같은데 일단 가격 비교가 되는 수준인지 봐줘
- expected_behavior: 갤럭시북 broad compare는 ambiguous로 멈추고 모델 코드 재질문을 유도해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-broad-ambiguous-safety-3 · pass
- prompt: 4060 들어간 노트북 전부를 한 번에 비교하는 건 무리일 것 같긴 한데, 그래도 어떻게 나오는지 봐줘
- expected_behavior: 4060 노트북 broad compare는 ambiguous로 멈추고 GPU-only 추천 없이 모델 코드 중심 제안을 해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-broad-ambiguous-safety-4 · pass
- prompt: 게이밍 노트북 통으로 비교해달라는 건 좀 넓은 것 같은데, 멈춰야 하면 멈추고 알려줘
- expected_behavior: 게이밍 노트북 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-purchase-explain-1 · pass
- prompt: 그램 16 쪽을 보는 중인데, 모델이 여러 개면 멈춰도 되니까 지금 사도 되는 가격대인지 같이 봐줘
- expected_behavior: 그램 16 explain은 ambiguous로 멈추고 다음 질문을 제안해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-purchase-explain-2 · pass
- prompt: 4060 노트북 알아보는 중인데 너무 막연하면 멈추고, 다음에 뭘 물어보면 좋을지도 알려줘
- expected_behavior: 4060 노트북 explain은 노트북 모델 코드 기준 추천을 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### laptop-purchase-explain-3 · pass
- prompt: NT960XGQ-A51A 이건 지금 사도 괜찮은 가격대인지 한번 설명해줘
- expected_behavior: 정확한 갤럭시북 explain은 ok 상태로 가격대 해석을 줘야 한다.
- observed_summary: 삼성 갤럭시북4 프로 NT960XGQ-A51A 기준 최저가 1889000원, 최고가 1929000원, 판매처 2곳입니다. 현재 최저가는 1889000원이고 최고가와의 차이는 40000원입니다.
- notes: (none)

### laptop-purchase-explain-4 · pass
- prompt: 15IRX9 보는데 지금 들어가도 될 가격인지 너무 길지 않게 봐줘
- expected_behavior: 정확한 Lenovo explain은 ok 상태로 가격 해석을 줘야 한다.
- observed_summary: 레노버 리전 5i 15IRX9 RTX 4060 기준 최저가 1679000원, 최고가 1699000원, 판매처 2곳입니다. 현재 최저가는 1679000원이고 최고가와의 차이는 20000원입니다.
- notes: (none)

### graphics-card-broad-search-1 · pass
- prompt: 5070급 그래픽카드 보는 중인데 브라켓이나 완본체 같은 건 빼고 본품 위주로 뭐가 뜨는지 보여줘
- expected_behavior: 5070 broad search는 부속품과 완본체 노이즈를 크게 줄여야 한다.
- observed_summary: 5070 그래픽카드 뭐가 뜨는지 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-broad-search-2 · pass
- prompt: RTX 5070 시리즈를 넓게 훑어보고 싶은데 조립PC 말고 카드 본체만 정리해줘
- expected_behavior: 5070 시리즈 broad search는 GPU 계열 중심으로 정리되어야 한다.
- observed_summary: RTX 5070 시리즈 넓게 훑어보고 싶은데 카드 기준 2개 모델, 4개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-broad-search-3 · pass
- prompt: 라데온 9070 쪽 보는 중이라 브라켓이나 완본체 섞지 말고 카드만 찾아줘
- expected_behavior: 라데온 broad search는 부속품과 완본체를 줄여야 한다.
- observed_summary: 라데온 9070 기준 2개 모델, 4개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-broad-search-4 · pass
- prompt: 5070 Ti 라인 보는데 지지대나 완본체 말고 본품만 검색 좀 해줘
- expected_behavior: 5070 Ti broad search는 그래픽카드 본품 중심이어야 한다.
- observed_summary: 5070 Ti 라인 지지대나 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-ish-search-1 · pass
- prompt: 조탁 5070 Twin Edge 쪽이 궁금해서 ZOTAC RTX 5070 Twin Edge로 보이는 것만 찾아줘
- expected_behavior: 정확한 GPU 모델 검색은 부속품 없이 모델명이 살아 있어야 한다.
- observed_summary: 조탁 5070 Twin Edge 쪽이 ZOTAC RTX 5070 Twin Edge로 보이는 것만 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-ish-search-2 · pass
- prompt: ASUS TUF 5070 Ti 쪽으로 보는데 그 모델명 기준으로 검색해줘
- expected_behavior: 정확한 ASUS GPU 검색은 모델 계열이 유지되어야 한다.
- observed_summary: ASUS TUF 5070 Ti 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-ish-search-3 · pass
- prompt: Sapphire RX 9070 XT Pulse 이 라인만 보고 싶으니 다른 거 말고 그쪽만 찾아줘
- expected_behavior: 정확한 Sapphire 검색은 XT 변형을 유지해야 한다.
- observed_summary: Sapphire RX 9070 XT Pulse 이 라인만 보고 싶으니 다른 거 말고 그쪽만 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-ish-search-4 · pass
- prompt: PowerColor RX 9070 Hellhound 이 모델로 뜨는 것들만 한번 정리해줘
- expected_behavior: 정확한 PowerColor 검색은 브랜드/모델명이 살아 있어야 한다.
- observed_summary: PowerColor RX 9070 Hellhound 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### graphics-card-exact-compare-1 · pass
- prompt: RTX 5070은 정확히 그 모델끼리만 가격 비교해줘
- expected_behavior: RTX 5070 exact compare는 ok 상태여야 한다.
- observed_summary: ZOTAC GAMING GeForce RTX 5070 Twin Edge 기준 최저가 799000원, 최고가 809000원, 판매처 2곳입니다.
- notes: (none)

### graphics-card-exact-compare-2 · pass
- prompt: RTX 5070 Ti는 다른 급 섞지 말고 같은 모델만 비교해줘
- expected_behavior: RTX 5070 Ti exact compare는 ok 상태여야 한다.
- observed_summary: MSI GeForce RTX 5070 Ti Ventus 2X OC 기준 최저가 999000원, 최고가 1019000원, 판매처 2곳입니다.
- notes: (none)

### graphics-card-exact-compare-3 · pass
- prompt: RX 9070 이건 XT 말고 일반형끼리만 비교해줘
- expected_behavior: RX 9070 exact compare는 XT와 섞이지 않고 ok여야 한다.
- observed_summary: ASRock Radeon RX 9070 Challenger 기준 최저가 749000원, 최고가 759000원, 판매처 2곳입니다.
- notes: (none)

### graphics-card-exact-compare-4 · pass
- prompt: RX 9070 XT는 정확히 XT끼리만 가격 비교해줘
- expected_behavior: RX 9070 XT exact compare는 ok 상태여야 한다.
- observed_summary: SAPPHIRE PULSE Radeon RX 9070 XT 기준 최저가 889000원, 최고가 899000원, 판매처 2곳입니다.
- notes: (none)

### graphics-card-broad-ambiguous-safety-1 · pass
- prompt: RTX 5070 시리즈 전체를 한 번에 비교해달라는 건 넓을 수 있으니까, 안 되면 안전하게 멈춰줘
- expected_behavior: 5070 시리즈 broad compare는 ambiguous로 멈추고 follow-up query를 제안해야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-broad-ambiguous-safety-2 · pass
- prompt: RX 9070 시리즈 통으로 가격 비교가 되는지 보고, 아니면 왜 안 되는지 알려줘
- expected_behavior: 9070 시리즈 broad compare는 ambiguous로 멈춰야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-broad-ambiguous-safety-3 · pass
- prompt: 엔비디아 5070 그래픽카드 정도로만 말하면 애매할 것 같은데 그래도 비교 요청을 넣어볼게
- expected_behavior: 브랜드+세대 broad compare는 동일상품 비교를 시도하지 않아야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-broad-ambiguous-safety-4 · pass
- prompt: 라데온 9070 계열 전체로 보면 넓은데, 멈춰야 하면 멈추고 다음 검색어 좀 줘
- expected_behavior: 라데온 계열 broad compare는 ambiguous로 멈추고 추천 질의를 줘야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-purchase-explain-1 · pass
- prompt: RTX 5070 지금 들어가도 되는 가격인지 짧게 설명해줘
- expected_behavior: RTX 5070 explain은 ok 상태로 가격 해석을 줘야 한다.
- observed_summary: ZOTAC GAMING GeForce RTX 5070 Twin Edge 기준 최저가 799000원, 최고가 809000원, 판매처 2곳입니다. 현재 최저가는 799000원이고 최고가와의 차이는 10000원입니다.
- notes: (none)

### graphics-card-purchase-explain-2 · pass
- prompt: RX 9070 XT는 지금 사도 괜찮은 가격대인지 한번 봐줘
- expected_behavior: RX 9070 XT explain은 ok 상태로 가격 해석을 줘야 한다.
- observed_summary: SAPPHIRE PULSE Radeon RX 9070 XT 기준 최저가 889000원, 최고가 899000원, 판매처 2곳입니다. 현재 최저가는 889000원이고 최고가와의 차이는 10000원입니다.
- notes: (none)

### graphics-card-purchase-explain-3 · pass
- prompt: RTX 5070 시리즈 쪽으로 보는 중인데 너무 넓으면 멈추고 다음 질문을 추천해줘
- expected_behavior: GPU 시리즈 explain은 ambiguous로 멈추고 재질문을 유도해야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### graphics-card-purchase-explain-4 · pass
- prompt: 라데온 9070 계열이 지금 살 만한지 보려는데, 애매하면 정확한 모델로 다시 묻게 해줘
- expected_behavior: 라데온 계열 explain은 ambiguous로 멈추고 suggestedQueries를 줘야 한다.
- observed_summary: 정확히 같은 모델만 비교할 수 있습니다.
- notes: (none)

### keyboard-broad-search-1 · pass
- prompt: 게이밍 키보드 찾는 중인데 사무용 느낌 강한 거나 오피스용은 빼고 뭐가 뜨는지 볼래
- expected_behavior: 게이밍 키보드 broad search에 오피스 키보드가 과하게 섞이지 않아야 한다.
- observed_summary: 게이밍 키보드 뭐가 뜨는지 기준 3개 모델, 6개 판매처를 찾았습니다.
- notes: (none)

### keyboard-broad-search-2 · pass
- prompt: 무선 기계식 키보드 보고 있는데 마우스나 사무용 키보드 같은 건 빼고 정리해줘
- expected_behavior: 무선 기계식 키보드 검색은 키보드 본체 중심이어야 한다.
- observed_summary: 무선 기계식 키보드 보고 있는데 기준 5개 모델, 10개 판매처를 찾았습니다.
- notes: (none)

### keyboard-broad-search-3 · pass
- prompt: 텐키리스 게이밍 키보드 쪽으로 보고 싶어서 풀배열 오피스용 말고 맞는 것만 보여줘
- expected_behavior: TKL 게이밍 키보드 검색은 게이밍/텐키리스 의도와 크게 어긋나지 않아야 한다.
- observed_summary: 텐키리스 게이밍 키보드 기준 4개 모델, 8개 판매처를 찾았습니다.
- notes: (none)

### keyboard-broad-search-4 · pass
- prompt: 저소음 사무용 키보드 찾는 중인데 RGB 번쩍이는 게이밍 느낌은 빼고 보여줘
- expected_behavior: 사무용 키보드 검색은 게이밍 키워드가 과하게 섞이지 않아야 한다.
- observed_summary: 저소음 사무용 키보드 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-ish-search-1 · pass
- prompt: 키크론 K2 Pro 생각 중이라 정확히 그 모델로 뜨는 것들만 검색해줘
- expected_behavior: 정확한 Keychron 검색은 모델명이 유지되어야 한다.
- observed_summary: Keychron K2 Pro 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-ish-search-2 · pass
- prompt: 로지텍 mx mini라고들 하던데 정확히는 MX Mechanical Mini잖아, 그걸로 찾아줘
- expected_behavior: MX Mechanical Mini 검색은 키보드 본체 중심이어야 한다.
- observed_summary: 로지텍 mx mini라고들 하던데 는 MX Mechanical Mini잖아 그걸로 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-ish-search-3 · pass
- prompt: 앱코 K660 하나 보는데 키캡 같은 액세서리 말고 본체만 검색해줘
- expected_behavior: 앱코 K660 검색은 모델명을 유지해야 한다.
- observed_summary: ABKO K660 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-ish-search-4 · pass
- prompt: DrunkDeer A75 이 모델 궁금해서 정확히 맞는 것만 한번 찾아봐줘
- expected_behavior: DrunkDeer A75 검색은 키보드 본체 중심이어야 한다.
- observed_summary: DrunkDeer A75 맞는 것만 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### keyboard-exact-compare-1 · pass
- prompt: Keychron K2 Pro 이건 정확히 같은 모델끼리 가격 비교해줘
- expected_behavior: Keychron K2 Pro exact compare는 가능하면 ok 상태여야 한다.
- observed_summary: Keychron K2 Pro 무선 기계식 키보드 기준 최저가 149000원, 최고가 152000원, 판매처 2곳입니다.
- notes: (none)

### keyboard-exact-compare-2 · pass
- prompt: MX Mechanical Mini는 마우스 같은 거 섞지 말고 키보드 본체끼리만 비교해줘
- expected_behavior: MX Mechanical Mini exact compare는 가능하면 ok 상태여야 한다.
- observed_summary: Logitech MX Mechanical Mini 무선 키보드 기준 최저가 169000원, 최고가 171000원, 판매처 2곳입니다.
- notes: (none)

### keyboard-exact-compare-3 · pass
- prompt: 앱코 K660 가격 차이만 깔끔하게 비교해줘
- expected_behavior: 앱코 K660 exact compare는 가능하면 ok 상태여야 한다.
- observed_summary: 앱코 ABKO K660 완전방수 카일 광축 키보드 기준 최저가 59900원, 최고가 64900원, 판매처 2곳입니다.
- notes: (none)

### keyboard-exact-compare-4 · pass
- prompt: DrunkDeer A75는 정확히 같은 제품 기준으로 얼마 차이 나는지 보고 싶어
- expected_behavior: DrunkDeer A75 exact compare는 가능하면 ok 상태여야 한다.
- observed_summary: DrunkDeer A75 래피드트리거 게이밍 키보드 기준 최저가 139000원, 최고가 142000원, 판매처 2곳입니다.
- notes: (none)

### keyboard-broad-ambiguous-safety-1 · pass
- prompt: 게이밍 키보드 전체를 바로 비교하는 건 넓을 수 있으니까 안 되면 멈추고 알려줘
- expected_behavior: 게이밍 키보드 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-broad-ambiguous-safety-2 · pass
- prompt: 무선 키보드 통으로 가격 비교하면 애매할 것 같은데, 가능 여부부터 봐줘
- expected_behavior: 무선 키보드 broad compare는 ambiguous로 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-broad-ambiguous-safety-3 · pass
- prompt: 로지텍 기계식 키보드 정도로만 말하면 여러 개일 텐데 그래도 비교 요청 넣어볼게
- expected_behavior: 브랜드 단위 Keychron compare는 ambiguous로 멈추고 모델 추천을 주는 편이 좋다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-broad-ambiguous-safety-4 · pass
- prompt: 저소음 사무용 키보드도 모델이 많으니 정확히 못 고르면 멈추고 다음 질문을 추천해줘
- expected_behavior: 브랜드 단위 로지텍 기계식 키보드 compare는 ambiguous여야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-purchase-explain-1 · pass
- prompt: Keychron 키보드 중에 하나 사려는데 너무 막연하면 멈추고 다음 검색어를 줘
- expected_behavior: 게이밍 키보드 explain은 동일상품이 아니면 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-purchase-explain-2 · pass
- prompt: 로지텍 기계식 키보드 지금 사도 될 가격인지 보고 싶은데 애매하면 재질문도 같이 줘
- expected_behavior: Keychron 브랜드 explain은 ambiguous로 멈추고 follow-up query를 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### keyboard-purchase-explain-3 · pass
- prompt: MX Mechanical Mini는 지금 들어가도 괜찮은 가격대인지 설명해줘
- expected_behavior: 정확한 MX Mechanical explain은 ok 상태로 가격 해석을 줘야 한다.
- observed_summary: Logitech MX Mechanical Mini 무선 키보드 기준 최저가 169000원, 최고가 171000원, 판매처 2곳입니다. 현재 최저가는 169000원이고 최고가와의 차이는 2000원입니다.
- notes: (none)

### keyboard-purchase-explain-4 · pass
- prompt: 앱코 K660 이거 지금 사도 무난한 가격인지 간단히 봐줘
- expected_behavior: 앱코 K660 explain은 ok 상태를 목표로 한다.
- observed_summary: 앱코 ABKO K660 완전방수 카일 광축 키보드 기준 최저가 59900원, 최고가 64900원, 판매처 2곳입니다. 현재 최저가는 59900원이고 최고가와의 차이는 5000원입니다.
- notes: (none)

### monitor-broad-search-1 · pass
- prompt: 27인치 4K 모니터 찾는 중인데 TV나 이상한 액세서리 말고 본체 위주로 정리해줘
- expected_behavior: 27인치 4K 모니터 broad search는 모니터 본품 중심이어야 한다.
- observed_summary: 27인치 4K 모니터 기준 4개 모델, 8개 판매처를 찾았습니다.
- notes: (none)

### monitor-broad-search-2 · pass
- prompt: 32인치 QHD 모니터 보려는데 너무 엉뚱한 해상도는 빼고 대충 뭐가 있는지 보여줘
- expected_behavior: 게이밍 모니터 broad search는 렌탈 노이즈를 크게 줄여야 한다.
- observed_summary: 32인치 QHD 모니터 보려는데 너무 엉뚱한 해상도는 빼고 뭐가 있는지 기준 3개 모델, 6개 판매처를 찾았습니다.
- notes: (none)

### monitor-broad-search-3 · pass
- prompt: 울트라와이드 모니터 쪽으로 보는데 본체 말고 암이나 케이블 같은 건 빼고 찾아줘
- expected_behavior: 울트라와이드 모니터 broad search는 모니터 본체 위주여야 한다.
- observed_summary: 검색 결과가 없습니다: 울트라와이드 모니터
- notes: (none)

### monitor-broad-search-4 · pass
- prompt: 고주사율 게이밍 모니터 보는 중인데 TV나 다른 기기 말고 모니터만 보여줘
- expected_behavior: 32인치 QHD 모니터 broad search는 과도하게 흩어지지 않아야 한다.
- observed_summary: 고주사율 게이밍 모니터 기준 4개 모델, 8개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-ish-search-1 · pass
- prompt: LG 27GR93U 이 모델로 검색 좀 해줘, 비슷한 다른 모델 말고
- expected_behavior: 정확한 LG 모니터 검색은 모델 코드가 유지되어야 한다.
- observed_summary: LG 27GR93U 이 모델로 검색 해줘 비슷한 다른 모델 말고 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-ish-search-2 · pass
- prompt: DELL U2723QE 하나 보는 중인데 정확한 모델명으로 뜨는 것만 찾아줘
- expected_behavior: 정확한 Dell 모니터 검색은 모델 코드가 유지되어야 한다.
- observed_summary: DELL U2723QE 하나 정확한 모델명으로 뜨는 것만 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-ish-search-3 · pass
- prompt: MSI 321URX 생각 중이라 그 모델 기준 결과만 보여줘
- expected_behavior: 정확한 MSI 모니터 검색은 모델 코드가 살아 있어야 한다.
- observed_summary: MSI 321URX 기준 결과만 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-ish-search-4 · pass
- prompt: 삼성 S27DG500 이 모델로 검색해줘
- expected_behavior: 정확한 삼성 모니터 검색은 모델 코드가 유지되어야 한다.
- observed_summary: 삼성 S27DG500 이 모델로 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### monitor-exact-compare-1 · pass
- prompt: 27GR93U는 정확히 같은 모델끼리 가격 비교해줘
- expected_behavior: LG 27GR93U exact compare는 ok 상태를 목표로 한다.
- observed_summary: LG 울트라기어 27GR93U 27인치 4K 모니터 기준 최저가 799000원, 최고가 819000원, 판매처 2곳입니다.
- notes: (none)

### monitor-exact-compare-2 · pass
- prompt: U2723QE 판매처별 차이 좀 비교해줘
- expected_behavior: Dell U2723QE exact compare는 ok 상태를 목표로 한다.
- observed_summary: DELL U2723QE 27인치 4K UHD IPS 모니터 기준 최저가 689000원, 최고가 699000원, 판매처 2곳입니다.
- notes: (none)

### monitor-exact-compare-3 · pass
- prompt: 321URX 이건 정확 모델 기준으로 최저가 비교해줘
- expected_behavior: MSI 321URX exact compare는 ok 상태를 목표로 한다.
- observed_summary: MSI MPG 321URX QD-OLED 32인치 게이밍 모니터 기준 최저가 1599000원, 최고가 1619000원, 판매처 2곳입니다.
- notes: (none)

### monitor-exact-compare-4 · pass
- prompt: S27DG500 가격 비교 좀 해줘, 다른 비슷한 모델 섞지 말고
- expected_behavior: 삼성 S27DG500 exact compare는 ok 상태를 목표로 한다.
- observed_summary: 삼성전자 오디세이 G5 S27DG500 27인치 게이밍 모니터 기준 최저가 339000원, 최고가 349000원, 판매처 2곳입니다.
- notes: (none)

### monitor-broad-ambiguous-safety-1 · pass
- prompt: 27인치 4K 모니터 전체를 바로 비교하는 건 넓을 수 있으니까 가능 여부 먼저 봐줘
- expected_behavior: 27인치 4K 모니터 broad compare는 ambiguous로 멈추고 모델 추천을 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-broad-ambiguous-safety-2 · pass
- prompt: 32인치 QHD 모니터 통으로 가격 비교해달라면 애매할 것 같은데 그래도 한번 넣어볼게
- expected_behavior: 게이밍 모니터 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-broad-ambiguous-safety-3 · pass
- prompt: 게이밍 모니터라고만 하면 모델이 많으니 안 되면 멈추고 다시 물을 만한 걸 추천해줘
- expected_behavior: 32인치 QHD broad compare는 ambiguous로 멈추고 follow-up query를 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-broad-ambiguous-safety-4 · pass
- prompt: 울트라와이드 모니터 가격 비교하고 싶은데 너무 넓으면 멈추고 정리해줘
- expected_behavior: 울트라와이드 broad compare는 ambiguous로 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-purchase-explain-1 · pass
- prompt: 27인치 4K 모니터 지금 사도 될 가격인지 보고 싶은데, 애매하면 재질문도 같이 줘
- expected_behavior: 27인치 4K monitor explain은 ambiguous로 멈추고 follow-up query를 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-purchase-explain-2 · pass
- prompt: 32인치 QHD 모니터 쪽이 요즘 살 만한지 보려는데 너무 넓으면 멈춰줘
- expected_behavior: 게이밍 모니터 explain은 broad query이면 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### monitor-purchase-explain-3 · pass
- prompt: 27GR93U는 지금 사도 괜찮은 가격대인지 설명해줘
- expected_behavior: LG 27GR93U explain은 ok 상태를 목표로 한다.
- observed_summary: LG 울트라기어 27GR93U 27인치 4K 모니터 기준 최저가 799000원, 최고가 819000원, 판매처 2곳입니다. 현재 최저가는 799000원이고 최고가와의 차이는 20000원입니다.
- notes: (none)

### monitor-purchase-explain-4 · pass
- prompt: U2723QE 이 모델은 지금 들어가도 될 가격인지 좀 봐줘
- expected_behavior: Dell U2723QE explain은 ok 상태를 목표로 한다.
- observed_summary: DELL U2723QE 27인치 4K UHD IPS 모니터 기준 최저가 689000원, 최고가 699000원, 판매처 2곳입니다. 현재 최저가는 689000원이고 최고가와의 차이는 10000원입니다.
- notes: (none)

### pc-part-broad-search-1 · pass
- prompt: B650 메인보드 보는 중인데 메인보드 말고 다른 완본체나 엉뚱한 건 빼고 보여줘
- expected_behavior: B650 메인보드 broad search는 완본체와 렌탈 노이즈를 줄여야 한다.
- observed_summary: B650 메인보드 메인보드 말고 다른 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-broad-search-2 · pass
- prompt: 850W 파워 찾는 중이라 파워 본체 위주로만 정리해줘
- expected_behavior: 850W 파워 broad search는 파워 본품 중심이어야 한다.
- observed_summary: 850W 파워 파워 만 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-broad-search-3 · pass
- prompt: DDR5 32GB 메모리 보려는데 규격 안 맞는 거나 엉뚱한 주변기기 말고 찾아줘
- expected_behavior: DDR5 32GB 메모리 broad search는 메모리 본품 중심이어야 한다.
- observed_summary: DDR5 32GB 메모리 보려는데 규격 안 맞는 거나 엉뚱한 주변기기 말고 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-broad-search-4 · pass
- prompt: 2TB NVMe SSD 쪽으로 보는 중인데 외장 케이스 같은 건 빼고 본체만 보여줘
- expected_behavior: NVMe SSD broad search는 외장 저장장치나 완본체 노이즈를 줄여야 한다.
- observed_summary: 2TB NVMe SSD 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-ish-search-1 · pass
- prompt: ASUS TUF B650M-PLUS 이 보드로 검색해줘
- expected_behavior: 정확한 메인보드 검색은 모델명을 유지해야 한다.
- observed_summary: ASUS TUF B650M-PLUS 이 보드로 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-ish-search-2 · pass
- prompt: Ryzen 7 9800X3D 이 CPU로 뜨는 것만 찾아줘
- expected_behavior: 정확한 CPU 검색은 모델명을 유지해야 한다.
- observed_summary: Ryzen 7 9800X3D 이 CPU로 뜨는 것만 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-ish-search-3 · pass
- prompt: WD SN850X 2TB 이 모델로 검색해줘
- expected_behavior: 정확한 SSD 검색은 외장 SSD와 과도하게 섞이지 않아야 한다.
- observed_summary: WD SN850X 2TB 이 모델로 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-ish-search-4 · pass
- prompt: SuperFlower SF-850F14XG 이 파워 검색해줘
- expected_behavior: 정확한 파워 검색은 모델명을 유지해야 한다.
- observed_summary: SuperFlower SF-850F14XG 이 기준 1개 모델, 2개 판매처를 찾았습니다.
- notes: (none)

### pc-part-exact-compare-1 · pass
- prompt: ASUS TUF B650M-PLUS는 정확 모델 기준으로 가격 비교해줘
- expected_behavior: ASUS TUF B650M-PLUS exact compare는 ok 상태를 목표로 한다.
- observed_summary: ASUS TUF B650M-PLUS WIFI 메인보드 기준 최저가 249000원, 최고가 255000원, 판매처 2곳입니다.
- notes: (none)

### pc-part-exact-compare-2 · pass
- prompt: 9800X3D 가격 차이만 정확히 비교해줘
- expected_behavior: CPU exact compare는 ok 상태를 목표로 한다.
- observed_summary: AMD Ryzen 7 9800X3D 정품 멀티팩 기준 최저가 679000원, 최고가 689000원, 판매처 2곳입니다.
- notes: (none)

### pc-part-exact-compare-3 · pass
- prompt: SN850X 2TB는 용량까지 맞는 것끼리만 비교해줘
- expected_behavior: SSD exact compare는 ok 상태를 목표로 한다.
- observed_summary: WD_BLACK SN850X 2TB NVMe SSD 기준 최저가 219000원, 최고가 225000원, 판매처 2곳입니다.
- notes: (none)

### pc-part-exact-compare-4 · pass
- prompt: SF-850F14XG는 같은 파워 모델끼리만 가격 비교해줘
- expected_behavior: 파워 exact compare는 ok 상태를 목표로 한다.
- observed_summary: SUPERFLOWER SF-850F14XG LEADEX III GOLD 850W 기준 최저가 159000원, 최고가 162000원, 판매처 2곳입니다.
- notes: (none)

### pc-part-broad-ambiguous-safety-1 · pass
- prompt: B650 메인보드 전체 가격 비교는 넓을 테니 안 되면 멈추고 추천 검색어를 줘
- expected_behavior: B650 broad compare는 ambiguous로 멈추고 모델 재질문을 유도해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-broad-ambiguous-safety-2 · pass
- prompt: 850W 파워를 한 번에 비교하면 모델이 많을 것 같은데 가능 여부부터 봐줘
- expected_behavior: 파워 broad compare는 ambiguous로 멈추고 follow-up query를 제안해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-broad-ambiguous-safety-3 · pass
- prompt: DDR5 32GB 메모리 통으로 가격 비교하려는데, 너무 넓으면 멈추고 다시 물을 걸 추천해줘
- expected_behavior: 메모리 broad compare는 동일상품 비교를 시도하지 않고 멈춰야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-broad-ambiguous-safety-4 · pass
- prompt: 2TB NVMe SSD 가격 비교하고 싶은데 모델이 많으면 안전하게 멈춰줘
- expected_behavior: SSD broad compare는 ambiguous로 멈추고 모델 재질문을 유도해야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-purchase-explain-1 · pass
- prompt: B650 메인보드 쪽을 지금 사도 되는 가격인지 보고 싶은데 막연하면 멈추고 재질문 추천해줘
- expected_behavior: B650 explain은 broad query면 ambiguous로 멈추고 follow-up query를 줘야 한다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-purchase-explain-2 · pass
- prompt: 850W 파워 지금 들어가도 될 가격대인지 같이 봐줘, 애매하면 정확 모델도 알려줘
- expected_behavior: 850W 파워 broad explain은 ambiguous로 멈추고 정확 모델 추천을 주는 편이 좋다.
- observed_summary: 정확한 모델이 여러 개라 바로 판단할 수 없습니다. 모델 코드나 정확한 제품명으로 다시 물어봐 주세요.
- notes: (none)

### pc-part-purchase-explain-3 · pass
- prompt: 9800X3D는 요즘 사도 괜찮은 가격인지 봐줘
- expected_behavior: 9800X3D exact explain은 ok 상태를 목표로 한다.
- observed_summary: AMD Ryzen 7 9800X3D 정품 멀티팩 기준 최저가 679000원, 최고가 689000원, 판매처 2곳입니다. 현재 최저가는 679000원이고 최고가와의 차이는 10000원입니다.
- notes: (none)

### pc-part-purchase-explain-4 · pass
- prompt: SN850X 2TB 지금 사도 무난한 가격인지 설명해줘
- expected_behavior: SN850X 2TB exact explain은 ok 상태를 목표로 한다.
- observed_summary: WD_BLACK SN850X 2TB NVMe SSD 기준 최저가 219000원, 최고가 225000원, 판매처 2곳입니다. 현재 최저가는 219000원이고 최고가와의 차이는 6000원입니다.
- notes: (none)

