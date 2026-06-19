---
name: figma-token-review
description: >
    Figma 시안에서 vapor 디자인 토큰(색상 + typography)이 올바르게 쓰였는지 4축으로 검증하는 스킬.
    Figma URL이 등장하고 토큰·색상·폰트·스타일 사용에 대한 질문이 조금이라도 있으면 반드시 이 스킬을 써라.
    사용자가 "토큰 검토", "색상 맞게 썼어?", "폰트 위계", "Text Style", "do-not-use",
    "raw 색", "토큰 사용성", "디자인 토큰 적법성", "fg 배경 맞아?" 같은 표현을 쓰거나,
    Figma 링크를 던지며 "이거 맞아?", "확인해줘", "리뷰해줘"라고만 해도 이 스킬을 적용한다.
    영어로 "check token usage", "review design tokens", "color token audit",
    "typography hierarchy", "is this token correct" 같이 물어도 마찬가지다.
    이 스킬은 4축(raw/바인딩 · semantic 의미 · typography 위계 · 배경-전경 짝)을 결정론(코드)과
    의미 판정(LLM)으로 나눠 PASS/FAIL + confidence + 근거 + 대체 토큰을 출력한다.
    단, "컴포넌트 가이드라인 ↔ 코드 props 간극" 비교는 design-gap 스킬의 영역이다.
---

# figma-token-review

> **시작 전**: Figma MCP가 연결돼 있는지 확인하라(아래 §사전 조건). 연결 실패면 즉시 중단.

Figma 시안에서 **어떤 요소가 어떤 vapor 토큰을 썼는지** 추출하고, 그 사용이 **적절한지**를 검증한다.
검증은 신뢰도가 다른 두 종류로 나뉜다 — 이 분리가 이 스킬의 핵심이다.

- **결정론 (legality)**: 입력이 같으면 답이 같다. 코드(`scripts/evaluate.mjs`·`typography-evaluate.mjs`)가 계산한다.
- **의미 판정 (semantic fitness)**: 맥락에 비춘 적합성. 너(에이전트)가 vapor 스키마를 루브릭으로 삼아 판정한다.

## 검증 4축

| 축                     | 결정론 (코드)                                                            | 의미 판정 (LLM)                                         |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| **1. raw/바인딩**      | `boundVariables` 빈 객체 = raw(미바인딩) → high                          | —                                                       |
| **2. semantic 의미**   | do-not-use / 스키마 키 부재(오타·미등록) / role 불일치 → high            | when·avoid를 맥락에 비춘 적합성(danger↔success 오용 등) |
| **3. typography 위계** | Text Style 미바인딩(`appliedStatus==='raw'`) → high                      | 본문에 heading 오용, 위계 뒤집힘(16단 위계와 대조)      |
| **4. 배경-전경 짝**    | foreground `gradeRules`: fg-100을 비순백 배경에 → high, 배경 모호 → info | 배경 식별이 모호한 케이스                               |

**WCAG 명도비 ratio는 계산하지 않는다.** 4축은 foreground 토큰의 배경이 순백(#ffffff)/투명/그 외 중
무엇이냐의 3분류만 본다(`gradeRules.100/200`). oklch→sRGB 변환·반올림·effective color 합성은 범위 밖.
한계는 [references/limitations.md](references/limitations.md) 참고.

## 사전 조건: Figma MCP 연결 확인

이 스킬은 Figma Plugin API(`use_figma`, `/figma-use` 선로드)와 MCP read 도구(`get_metadata`,
`get_screenshot`)에 의존한다. **먼저 `get_metadata`를 가볍게 한 번 호출해 연결을 확인하라.** 실패하면
"Figma MCP가 연결돼 있지 않습니다. 연결 후 다시 시도해 주세요."라고 안내하고 중단한다.

## 입력 파싱

- `/figma-token-review {Figma URL}` 형태. URL에서 `fileKey`, `nodeId` 추출.
    - `node-id`의 `-`를 `:`로 변환 (예: `32842-2107` → `32842:2107`).
- **검증 모드(선택)**: "색상만"/"typography만"/"폰트만"을 명시하면 그 모드만. 명시 없으면 **둘 다**.
- **의도(선택)**: URL 뒤 자연어가 디자이너 의도다(예: "선택된 탭 강조하려 했어").
    - 의도 있음 → 그 의도를 기준으로 토큰 적합성을 본다(더 정확).
    - 의도 없음 → 스크린샷+노드로 역할을 추론한다. 되묻지 말고 진행하되, 리포트 헤더에
      "의도 미제공 → 역할 추론(신뢰도 낮음)"을 명시한다.

## 실행 순서 (4단계)

색상과 typography를 **한 트리 순회**에서 함께 추출하고 각자의 결정론 스크립트로 평가한다.

1. **통합 추출 (고정 스크립트)** — `/figma-use`를 로드한 뒤 `scripts/extract.figma.js`를 Read하고,
   상단 `ROOT_ID`·`MODE`(`both`/`color`/`typography`)만 치환해 `use_figma`에 read-only로 그대로 전달한다.
   **로직을 즉석 재작성하지 마라** — 재작성 드리프트가 정확도의 최대 위협이다(결함 발견 시 파일 자체를 고친다).
   스크립트가 색상(alias 끝까지 역추적)과 typography(`getStyledTextSegments` 분류)를 함께 뽑아
   `{ colors, typography, schemaMode, viewport, stats }`를 그룹핑된(`nodeIds`/`count`) 형태로 반환한다.
    - 반환 객체를 **Write로 파일에 저장**한다(예: `/tmp/token-review-extract.json`) — 2단의 두 스크립트가 같은 파일을 읽는다.
    - 상세: **[references/extraction.md](references/extraction.md)**.

2. **결정론 검사** — 추출 파일을 각 스크립트에 인자로 넘긴다.
    - 색상: `node scripts/evaluate.mjs <추출파일>` → raw/do-not-use/키부재/role 불일치/fg 짝 위반.
      CLI가 `schemaMode`(light/dark)를 읽어 맞는 스키마로 판정한다.
    - typography: `node scripts/typography-evaluate.mjs <추출파일>` → `appliedStatus==='raw'`만 high.

3. **의미 판정 (LLM)** — 두 스크립트 출력의 **`rubric`**(입력에 실제 쓰인 토큰/Text Style의
   `$description`/`when`/`avoid` 서브셋)을 기준으로 판정한다. **스키마 파일 전체를 Read하지 마라.**
   판정 입력 3종 묶음과 출력 형식은 **[references/evaluation-and-output.md](references/evaluation-and-output.md)**.

4. **터미널 출력** — 색상·typography 위반을 섹션 분리해 출력. 적합률은 evaluate `summary`의 가중 집계값을 통합.
   각 의미 판정에 **PASS/FAIL + confidence + 근거**를 단다. 저confidence는 "검토 필요"로 표시.

**스크린샷 분기**: `get_screenshot`은 토큰이 크다. (a) typography 모드일 때(위계 추론 필수), 또는
(b) 의도 미제공으로 역할 역추론이 필요할 때만 호출한다.

## 번들 구성

```text
figma-token-review/
├── SKILL.md
├── references/
│   ├── extraction.md             # 1단: alias 끝까지 해석 / 배경 식별 / 추출 출력 형식
│   ├── evaluation-and-output.md  # 2~4단: 결정론 검사 / LLM 판정 3종 입력 / 출력 템플릿
│   └── limitations.md            # 한계(정직성 기록)
├── assets/                       # rubric SSOT. 운영 시 GitHub CDN, 개발/번들은 이 6파일
│   ├── semantic-color.{light,dark}.json   # 의미 검증 본체(when/avoid/role/status/gradeRules)
│   ├── primitive-color.{light,dark}.json  # alias 종착(실제 색). 값 해석 시에만
│   ├── text-style.json                    # typography 16단 위계 + when/avoid
│   └── typography.json                    # text-style이 참조하는 primitive 스케일
└── scripts/
    ├── extract.figma.js          # 1단 통합 추출 고정 스크립트 (use_figma용 — ROOT_ID/MODE만 치환)
    ├── schema-loader.mjs         # 6파일 로딩(mode 선택) + 중첩 트리 평탄화 + gradeRules 상속
    ├── evaluate.mjs              # 색상 결정론 (4축) + rubric 서브셋
    ├── evaluate.test.mjs
    ├── typography-evaluate.mjs   # typography 결정론 (raw=high) + 위계 rubric
    └── typography-evaluate.test.mjs
```

> **버전 관리 없음.** 스키마는 버전 접미사 없이 "현재" 한 벌만 둔다. 시안 토큰셋과의 동기화는
> 운영 규율로 보장하며 코드가 버전을 비교·차단하지 않는다. `schema-loader`가 추출의 `schemaMode`로
> light/dark 파일을 고른다.

> **1단계(통합 추출)도 번들 고정 스크립트다.** 에이전트는 `ROOT_ID`·`MODE` 두 상수만 치환해
> `use_figma`에 전달한다 — 로직 즉석 재작성 금지. 불변 원칙은 스크립트 상단 주석에 있고, 수정이
> 필요하면 그 원칙을 지켜 파일을 고치고 문서·테스트를 함께 갱신한다.

## 한계

배경 식별 결정론 한계·WCAG ratio 미계산·CI 미지원·LLM 비결정성 등 이 스킬이 결정론으로 단정 못 하는
지점은 **[references/limitations.md](references/limitations.md)** 에 정직하게 기록돼 있다. "미검사"를
통과로 오해하지 않으려면 평가 마무리 전에 한 번 확인하라.
