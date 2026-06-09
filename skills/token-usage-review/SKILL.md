---
name: token-usage-review
description: >
    Figma 시안의 vapor 디자인 토큰(색상) 사용이 적절한지 평가하는 스킬. Figma URL을 받아
    노드에 바인딩된 토큰을 추출하고, vapor 스키마의 intent/when/avoid/contrast 규칙과 대조해
    위반과 적합을 가린 뒤 수정 제안을 터미널에 출력한다.
    트리거: 사용자가 Figma URL을 주면서 "토큰 적절히 썼는지", "색상 토큰 검토", "토큰 사용성 평가",
    "이 시안 토큰 맞게 썼어?", "디자인 토큰 적법성", "contrast/대비 검사", "do-not-use 토큰 썼는지",
    "raw 색 안 쓰고 토큰 썼는지" 등을 물을 때 반드시 이 스킬을 쓴다. 사용자가 의도("선택된 탭 강조하려 했어"
    같은 자유 발화)를 함께 주면 그 의도를 기준으로 검증하고, 안 주면 캡처에서 역할을 추론해 평가한다.
    주의: 이 스킬은 "토큰 사용"을 평가한다. "컴포넌트 가이드라인 ↔ 코드 props 간극"을 보는 것은
    design-gap 스킬이다 — 컴포넌트 API/variant 비교 요청이면 그쪽을 쓴다.
---

# token-usage-review

Figma 시안에서 **어떤 요소가 어떤 vapor 색상 토큰을 썼는지** 추출하고, 그 사용이 **적절한지**를
평가한다. 평가는 신뢰도가 다른 두 종류의 판정으로 나뉜다 — 이 분리가 이 스킬의 핵심이다:

- **문법적 적법성 (결정론)**: do-not-use 토큰을 썼나? 대비(contrast)가 미달인가? raw 색을 썼나(토큰 미사용)?
  → `scripts/evaluate.mjs`가 코드로 계산. 입력이 같으면 답이 같다.
- **의미적 적합성 (LLM 판단)**: 이 토큰의 `when`("선택 상태인 요소", "강조돼야 할 텍스트")이 전제하는
  역할에 실제로 맞게 썼나? `avoid`의 의미 조건("page 배경인가?")을 어겼나?
  → 너(에이전트)가 판단. vapor 스키마가 루브릭이다.

왜 이렇게 나누나: vapor 토큰 메타데이터를 분석하면 `avoid` 조건의 96%가 "요소의 역할/상태"를 묻는
의미 조건이고, 순수 정적 분석으로 판정 가능한 건 일부(do-not-use, contrast, opacity)뿐이다. 결정론으로
될 건 코드에 고정해 재현성을 확보하고, 의미 판정만 LLM이 맡는다.

## 사전 조건: Figma MCP 연결 확인

이 스킬은 Figma Plugin API(`use_figma`, `/figma-use` 선로드)와 MCP read 도구(`get_metadata`,
`get_screenshot`)에 의존한다. **먼저 `get_metadata`를 가볍게 한 번 호출해 연결을 확인하라.** 실패하면
평가가 불가능하므로, 헛돌지 말고 "Figma MCP가 연결돼 있지 않습니다. 연결 후 다시 시도해 주세요."라고
안내하고 중단한다.

## 입력 파싱

- `/token-usage-review {Figma URL}` 형태. URL에서 `fileKey`, `nodeId` 추출.
    - `node-id`의 `-`를 `:`로 변환 (예: `37843-3511` → `37843:3511`).
- **의도(선택)**: URL 뒤에 자연어가 붙어 있으면 그것이 디자이너 의도다 (예: "선택된 탭 강조하려 했어").
    - 의도 있음 → **선언된 의도 검증**: 의도를 기준으로 토큰 적합성을 본다(역추론 아님, 더 정확).
    - 의도 없음 → **캡처 역추론 폴백**: 스크린샷+노드에서 각 요소 역할을 추론한다. 되묻지 말고 진행하되,
      리포트 헤더에 "의도 미제공 → 역할을 추론함(신뢰도 낮음)"을 명시한다.

## 실행 순서 (개요 + 상세 포인터)

전체 파이프라인은 4단계다. 단계별 상세는 아래 reference를 **그 단계에 들어갈 때 읽어라** — 본문은
흐름만 잡는다. 진행 순서대로 reference를 펼치면 토큰 낭비 없이 따라갈 수 있다.

1. **통합 추출 (use_figma 단일 스크립트)** — `/figma-use`를 로드한 뒤 `use_figma`로 read-only JS를
   한 번 실행해 트리 순회 + alias 체인 역추적(semantic 복원) + 최종 hex + 배경↔전경 매핑을 모두 수행하고,
   `evaluate.mjs` 입력 형식(Element 배열)을 **직접 반환**한다. MCP `get_variable_defs`/`get_design_context`는
   3단 alias 체인을 평탄화해 진입점 이름 + 최종 hex만 주므로, 적법성 판정에 필요한 실제 semantic token은
   Plugin API 역추적으로만 복원된다(거짓 `token-not-used` 방지). 배경↔전경도 트리 부모-자식 중첩에서 같은
   순회로 잡힌다. 별도 정규화 단계가 없다. MCP는 `get_metadata`(연결 확인)·`get_screenshot`(역할 추론 보조)만
   쓰고, `get_design_context`는 토큰 검증 흐름엔 불필요하다(코드 스니펫이 따로 필요할 때만 별개로).
   추출 직후, evaluate에 넘기기 전에 **semantic 변환 완전성 셀프체크**를 수행한다(component 진입점이 빠짐없이
   semantic으로 복원됐는지 — `extraction-and-resolution.md` §4).

    → 1단계 상세(불변 원칙·스키마 키 변환·배경 전파 알고리즘·read-only 참고 골격·추출 후 셀프체크)는
    **[references/extraction-and-resolution.md](references/extraction-and-resolution.md)**.

2. **결정론 검사** — 추출한 Element 배열을 `evaluate.mjs`에 넘겨 do-not-use/contrast/foreground-surface/
   unknown-token/미바인딩 위반을 받는다(결정론 위반).
3. **의미 판정 (LLM)** — 결정론을 통과한 요소를 `when`/`avoid`(semantic) 기준으로 판정, confidence를 단다.
4. **터미널 출력** — 결정론 위반과 의미 위반을 **분리**한 고정 템플릿으로 출력. 되먹임은 제안까지만(자동 수정 안 함).

    → 위 2~4단계 상세(출력 템플릿 포함)는 **[references/evaluation-and-output.md](references/evaluation-and-output.md)**.

## 번들 구성

```text
token-usage-review/
├── SKILL.md
├── references/
│   ├── extraction-and-resolution.md   # 1단계: use_figma 단일 통합 추출 / alias 역추적 / 배경↔전경 매핑 / Element 직접 출력
│   ├── evaluation-and-output.md       # 2~4단계: 결정론 검사 / 의미 판정 / 출력 템플릿 / 되먹임
│   └── limitations.md                 # 한계(정직성 기록)
├── assets/
│   └── vapor-token-schemas-v0.2.3.json   # 루브릭 = 유일한 진실. 토큰 41개 + 전역 `_rules`. 추후 CDN로 이전 예정
└── scripts/
    ├── schema-loader.mjs   # 스키마 출처 추상화 + 버전 핀. loadSchema/loadGlobalRules + deriveRuleset(do-not-use·tokenKeys·unknownGlobalRules 도출)
    ├── evaluate.mjs        # 2단 결정론 (do-not-use/contrast/foreground-surface/opacity/미바인딩 + 집계 검산 가드). 결정론 임계값은 코드 상수
    └── evaluate.test.mjs   # 결정론 코어 단위테스트 (node --test scripts/)
```

> **결정론 임계값은 스키마 파싱이 아니라 코드 상수다.** contrast(role별 최소 대비)·disabled opacity·
> foreground-surface 규칙은 `evaluate.mjs`의 상수(`RATIO_BY_ROLE`/`DISABLED_OPACITY_PCT`/`FG_SURFACE`)가
> 진실이다 — 가짓수가 작고 거의 안 바뀌므로 스키마 자연어에서 역파싱하지 않고 코드에 박아 재현성을
> 확보했다. contrast 요구치는 토큰 키 prefix로 role을 파생해 정한다(`colors.foreground.*`→4.5:1,
> `colors.border.*`→3:1). **`schema-loader`의 `deriveRuleset`이 스키마에서 읽는 건 `do-not-use`(status
> 열거값)·`tokenKeys`(키 집합)·`_rules` 키 목록(`unknownGlobalRules` 안전망)뿐**이고, 임계값은 안 읽는다.
> `do-not-use`/`avoid` 등 스키마가 진실인 것은 그대로 스키마를 고치면 즉시 반영된다. `avoid` 조건은 결정론으로
> 분류하지 않고 5단계 LLM이 스키마에서 직접 읽는다. (예전엔 `build-ruleset.mjs`가 룰셋 산물을 git에 두어
> 재생성을 깜빡하면 stale했고, 그 뒤엔 스키마 자연어를 정규식으로 파싱했으나 문구 변경에 깨지기 쉬웠다.)

> **1단계(통합 추출)는 번들 스크립트가 아니다.** `use_figma`는 `/figma-use`를 로드한 에이전트가
> read-only JS를 즉석 작성해 실행하므로 `scripts/`에 별도 파일이 없다(노드/페이지/mode 상황에 맞춰 매번
> 짠다). 불변 원칙(재귀 정지·mode 고정·스키마 키 변환·배경 전파·Element 직접 출력·정직성·remote 방어) +
> 참고 골격은 `references/extraction-and-resolution.md`에 있다.

## 한계

contrast 배경 hex 추출 실패·LLM 의미 판정 confidence·component 역추적의 remote 변수/mode 의존성 등,
이 스킬이 결정론으로 단정 못 하는 지점은 **[references/limitations.md](references/limitations.md)** 에
정직하게 기록돼 있다. "미검사"를 통과로 오해하지 않으려면 평가 마무리 전에 한 번 확인하라.
