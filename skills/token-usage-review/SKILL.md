---
name: token-usage-review
description: >
    Figma 시안에서 vapor 디자인 토큰(색상 + typography)이 올바르게 쓰였는지 검증하는 스킬.
    Figma URL이 등장하고 토큰·색상·폰트·스타일 사용에 대한 질문이 조금이라도 있으면 반드시 이 스킬을 써라.
    사용자가 "토큰 검토", "색상 맞게 썼어?", "폰트 위계", "Text Style", "contrast", "do-not-use",
    "raw 색", "토큰 사용성", "디자인 토큰 적법성" 같은 표현을 쓰거나,
    Figma 링크를 던지며 "이거 맞아?", "확인해줘", "리뷰해줘"라고만 해도 이 스킬을 적용한다.
    영어로 "check token usage", "review design tokens", "color token audit",
    "typography hierarchy", "is this token correct" 같이 물어도 마찬가지다.
    이 스킬은 vapor 토큰의 적법성(do-not-use·contrast·raw 미바인딩)과 의미 적합성(when/avoid 규칙)을
    색상과 typography 두 축에서 함께 판정하고 수정 제안을 출력한다.
    단, "컴포넌트 가이드라인 ↔ 코드 props 간극" 비교는 design-gap 스킬의 영역이다.
---

# token-usage-review

> **시작하기 전에**: Figma MCP가 연결돼 있는지 확인하라(아래 §사전 조건). 연결 실패면 즉시 중단.

Figma 시안에서 **어떤 요소가 어떤 vapor 토큰을 썼는지** 추출하고, 그 사용이 **적절한지**를
평가한다. **색상 토큰**과 **typography(글꼴 위계) 토큰** 두 가지를 검증하며, 기본값은 둘 다 검증한다.

평가는 신뢰도가 다른 두 종류의 판정으로 나뉜다 — 이 분리가 이 스킬의 핵심이다:

- **문법적 적법성 (결정론)**: do-not-use 토큰을 썼나? 대비(contrast)가 미달인가? raw 색/raw 텍스트를 썼나(토큰 미사용)?
  → `scripts/evaluate.mjs`(색상) / `scripts/typography-evaluate.mjs`(typography)가 코드로 계산. 입력이 같으면 답이 같다.
- **의미적 적합성 (LLM 판단)**: 이 토큰의 `when`이 전제하는 역할에 실제로 맞게 썼나? typography라면 이 텍스트의 위계가 적절한가?
  → 너(에이전트)가 판단. vapor 스키마가 루브릭이다.

왜 이렇게 나누나: vapor 토큰 메타데이터를 분석하면 `avoid` 조건의 96%가 "요소의 역할/상태"를 묻는
의미 조건이고, 순수 정적 분석으로 판정 가능한 건 일부(do-not-use, contrast, opacity, typography raw)뿐이다. 결정론으로
될 건 코드에 고정해 재현성을 확보하고, 의미 판정만 LLM이 맡는다.

## 사전 조건: Figma MCP 연결 확인

이 스킬은 Figma Plugin API(`use_figma`, `/figma-use` 선로드)와 MCP read 도구(`get_metadata`,
`get_screenshot`)에 의존한다. **먼저 `get_metadata`를 가볍게 한 번 호출해 연결을 확인하라.** 실패하면
평가가 불가능하므로, 헛돌지 말고 "Figma MCP가 연결돼 있지 않습니다. 연결 후 다시 시도해 주세요."라고
안내하고 중단한다.

## 입력 파싱

- `/token-usage-review {Figma URL}` 형태. URL에서 `fileKey`, `nodeId` 추출.
    - `node-id`의 `-`를 `:`로 변환 (예: `37843-3511` → `37843:3511`).
- **검증 모드(선택)**: 발화에서 "색상만" / "typography만" / "폰트만" 을 명시하면 그 모드만 실행한다. 명시 없으면 **기본 둘 다** 실행한다.
- **의도(선택)**: URL 뒤에 자연어가 붙어 있으면 그것이 디자이너 의도다 (예: "선택된 탭 강조하려 했어").
    - 의도 있음 → **선언된 의도 검증**: 의도를 기준으로 토큰 적합성을 본다(역추론 아님, 더 정확).
    - 의도 없음 → **캡처 역추론 폴백**: 스크린샷+노드에서 각 요소 역할을 추론한다. 되묻지 말고 진행하되,
      리포트 헤더에 "의도 미제공 → 역할을 추론함(신뢰도 낮음)"을 명시한다.

## 실행 순서 (개요 + 상세 포인터)

전체 파이프라인은 4단계다. 색상과 typography를 **한 트리 순회**에서 함께 추출하고 각자의 결정론 스크립트로 평가한다. 단계별 상세는 아래 reference를 **그 단계에 들어갈 때 읽어라** — 본문은 흐름만 잡는다.

1. **통합 추출 (use_figma 단일 스크립트)** — `/figma-use`를 로드한 뒤 `use_figma`로 read-only JS를
   한 번 실행한다. 트리 순회 중 모든 노드에서 색상 바인딩(fill/stroke alias 역추적)과 TEXT 노드의
   typography 바인딩(`getStyledTextSegments`)을 **함께** 뽑는다.
    - 색상: alias 체인 역추적(semantic 복원) + 최종 hex + 배경↔전경 매핑 → `Element[]` 직접 반환.
    - typography: `getStyledTextSegments` 단일 호출 + resolved 값 비교(override 탐지) + 뷰포트 판별 → `TypoElement[]` 직접 반환.
    - MCP는 `get_metadata`(연결 확인)·`get_screenshot(maxDimension:2576)`(역할 추론 보조)만 쓴다.
    - 추출 직후 셀프체크: 색상 semantic 변환 완전성(`extraction-and-resolution.md` §4) + typography raw 노드 재확인(`typography-extraction.md` §6).

    → 색상 1단계 상세: **[references/extraction-and-resolution.md](references/extraction-and-resolution.md)**.
    → typography 1단계 상세: **[references/typography-extraction.md](references/typography-extraction.md)**.

2. **결정론 검사** — 두 배열을 각각의 스크립트로 평가한다.
    - 색상: `evaluate.mjs` → do-not-use/contrast/foreground-surface/unknown-token/미바인딩 위반.
    - typography: `typography-evaluate.mjs` → `appliedStatus === 'raw'`만 high 위반(토큰 전혀 미사용). styled-override/var-only/mixed는 정상 취급.
3. **의미 판정 (LLM)** — 색상은 `when`/`avoid`(semantic) 기준으로, typography는 스크린샷+의도로 위계 역할을 추론해 `typography-token-schemas-v0.1.0.json`의 `when`/`avoid`와 대조. 각 판정에 confidence(HIGH/MED/LOW)를 단다.
4. **터미널 출력** — 색상·typography 위반을 **섹션 분리**해 출력. 적합률은 색상 요소 + 텍스트 노드 전체 대비 통합. 되먹임은 제안까지만.

    → 2~4단계 상세(출력 템플릿 포함): **[references/evaluation-and-output.md](references/evaluation-and-output.md)**.

## 번들 구성

```text
token-usage-review/
├── SKILL.md
├── references/
│   ├── extraction-and-resolution.md   # 색상 1단계: alias 역추적 / 배경↔전경 매핑 / ColorElement 출력
│   ├── typography-extraction.md       # typography 1단계: getStyledTextSegments / appliedStatus 판정 / TypoElement 출력
│   ├── evaluation-and-output.md       # 2~4단계: 결정론 검사 / 의미 판정 / 출력 템플릿 / 되먹임
│   └── limitations.md                 # 한계(정직성 기록)
├── assets/
│   ├── vapor-token-schemas-v0.2.3.json          # 색상 루브릭. 토큰 41개 + 전역 `_rules`. 추후 CDN 이전 예정
│   └── typography-token-schemas-v0.1.0.json     # typography 루브릭. 18개 역할 + viewport. Notion Roles 진행중
└── scripts/
    ├── schema-loader.mjs              # 스키마 출처 추상화 + 버전 핀. 색상(loadSchema/deriveRuleset) + typography(loadTypographySchema/deriveTypographyRuleset) 병렬 제공
    ├── evaluate.mjs                   # 색상 결정론 (do-not-use/contrast/foreground-surface/opacity/미바인딩 + 집계 가드)
    ├── evaluate.test.mjs              # 색상 결정론 단위테스트 (node --test scripts/)
    ├── typography-evaluate.mjs        # typography 결정론 (raw=high, 나머지 정상 + 집계 가드)
    └── typography-evaluate.test.mjs   # typography 결정론 단위테스트
```

> **결정론 임계값은 스키마 파싱이 아니라 코드 상수다.** contrast(role별 최소 대비)·disabled opacity·
> foreground-surface 규칙은 `evaluate.mjs`의 상수(`RATIO_BY_ROLE`/`DISABLED_OPACITY_PCT`/`FG_SURFACE`)가
> 진실이다. typography 결정론은 `typography-evaluate.mjs`의 `HIGH_STATUSES`가 진실(`raw`만).
> `schema-loader`의 `deriveRuleset`이 색상 스키마에서 읽는 건 `do-not-use`·`tokenKeys`·`_rules` 키뿐이고,
> `deriveTypographyRuleset`이 typography 스키마에서 읽는 건 `roleKeys`(유효 역할명 집합)뿐이다 — 결정론 임계값은 안 읽는다.

> **1단계(통합 추출)는 번들 스크립트가 아니다.** `use_figma`는 `/figma-use`를 로드한 에이전트가
> read-only JS를 즉석 작성해 실행하므로 `scripts/`에 별도 파일이 없다. 불변 원칙과 참고 골격은
> `references/extraction-and-resolution.md`(색상)·`references/typography-extraction.md`(typography)에 있다.

## 한계

contrast 배경 hex 추출 실패·LLM 의미 판정 confidence·component 역추적의 remote 변수/mode 의존성 등,
이 스킬이 결정론으로 단정 못 하는 지점은 **[references/limitations.md](references/limitations.md)** 에
정직하게 기록돼 있다. "미검사"를 통과로 오해하지 않으려면 평가 마무리 전에 한 번 확인하라.
