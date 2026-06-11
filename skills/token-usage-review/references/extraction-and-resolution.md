# 통합 추출 (실행 순서 1) — 동결 스크립트 `scripts/extract.figma.js`

> "사실"을 모아 evaluate가 받을 요소 배열을 만드는 단계. 추론하지 말고 그대로 읽어 추출한다.

## 1. 실행 방법

추출 로직은 **번들 동결 스크립트**다. 매 실행 즉석 작성하지 않는다 — 재작성 드리프트(mode 오선택, remote 미방어 같은 누락)가 이 스킬 정확도의 최대 위협이었고, 상황 의존부는 루트 노드와 모드 두 가지뿐이라 파라미터로 충분하다.

1. `/figma-use` 스킬을 로드한다.
2. `scripts/extract.figma.js`를 Read한다.
3. 파일 상단의 `__ROOT_ID__`(검증 대상 노드 id, `:` 형식)와 `__MODE__`(`"both"`/`"color"`/`"typography"`)만 치환한다. **다른 부분은 수정 금지.**
4. `use_figma`에 read-only로 그대로 전달해 실행한다.

반환 형식: `{ mode, viewport, stats, colors: Element[], typography: TypoElement[] }`.
동일 입력 요소는 `nodeIds`/`count`로 그룹핑돼 있다(variant 반복이 많은 컴포넌트 페이지에서 수 배 압축, 적법성 판정 손실 없음). 이 객체를 **그대로 파일로 저장**하면 두 evaluate 스크립트가 같은 파일을 읽는다(`evaluation-and-output.md` §2).

스크립트가 하는 일: 트리 순회 + alias 체인 역추적(semantic 복원) + 최종 hex + TEXT 노드 typography 분류(`getStyledTextSegments`)를 **한 번의 순회**로 수행하고 evaluate 입력 형식을 직접 반환한다. 왜 use_figma 단일 추출인가: MCP read 도구(`get_variable_defs` 등)는 vapor의 3단 collection alias 체인을 평탄화해 적법성 판정에 필요한 **semantic 토큰 이름**을 숨기기 때문이다. MCP는 `get_metadata`(연결 확인)와 `get_screenshot`(필요 시, SKILL.md 분기)만 쓴다.

스크립트를 고쳐야 하는 결함을 발견하면: 파일 상단 주석의 **불변 원칙 8개**(재귀 정지·mode 고정·tier 판별·API 제약·스키마 키 변환·출력 형식·정직성·remote 방어)를 지켜 파일 자체를 수정하고, 문서·테스트를 함께 갱신한다.

## 2. 추출 후 셀프체크 — 시안 결함 vs 추출 결함 구분

추출 결과를 evaluate에 넘기기 전에 점검한다. 목적은 **"시안이 정말 raw인가, 추출이 실패했나"를 가르는 것**이다:

1. **semantic 변환 완전성(1순위)**: component 변수를 진입점으로 바인딩한 노드가 `raw`/`unknown`으로 떨어진 건이 있으면 — 시안의 실제 상태(미바인딩)인지, 체인 추적 실패(remote 컬렉션 미enabled 등)인지 `stats`와 시안 맥락으로 구분한다.
2. **raw 폭증 신호**: `raw`/`unknown` 건수가 시안과 모순되게 많으면(예: 6 variant 중 5개 semantic, 1개만 raw) 그 건을 따로 확인한다.

스크립트 결함이면 동결 스크립트를 고쳐 재실행(§1 수정 원칙), 시안 결함이면 **정직하게 raw/unknown으로 보고**하고 통과로 위장하지 않는다. 셀프체크는 둘을 가르는 단계지, 시안 결함을 덮는 단계가 아니다.
