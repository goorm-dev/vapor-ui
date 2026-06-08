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
평가한다. 평가는 두 종류의 판정으로 나뉜다 — 이 분리가 이 스킬의 핵심이다:

- **문법적 적법성 (결정론)**: do-not-use 토큰을 썼나? 대비(contrast)가 미달인가? raw 색을 썼나(토큰 미사용)?
  → `scripts/evaluate.mjs`가 코드로 계산. 입력이 같으면 답이 같다.
- **의미적 적합성 (LLM 판단)**: 이 토큰의 `when`("선택 상태인 요소", "강조돼야 할 텍스트")이 전제하는
  역할에 실제로 맞게 썼나? `avoid`의 의미 조건("page 배경인가?")을 어겼나?
  → 너(에이전트)가 판단. vapor 스키마가 루브릭이다.

왜 이렇게 나누나: vapor 토큰 메타데이터를 분석하면 `avoid` 조건의 96%가 "요소의 역할/상태"를 묻는
의미 조건이고, 순수 정적 분석으로 판정 가능한 건 일부(do-not-use, contrast, opacity)뿐이다. 결정론으로
될 건 코드에 고정해 재현성을 확보하고, 의미 판정만 LLM이 맡는다.

## 사전 조건: Figma MCP 연결 확인

이 스킬은 Figma MCP read 도구(`get_design_context`, `get_variable_defs`, `get_screenshot`)에
전적으로 의존한다. **먼저 `get_metadata`를 가볍게 한 번 호출해 연결을 확인하라.** 실패하면 평가가
불가능하므로, 헛돌지 말고 "Figma MCP가 연결돼 있지 않습니다. 연결 후 다시 시도해 주세요."라고 안내하고
중단한다.

## 입력 파싱

- `/token-usage-review {Figma URL}` 형태. URL에서 `fileKey`, `nodeId` 추출.
    - `node-id`의 `-`를 `:`로 변환 (예: `37843-3511` → `37843:3511`).
- **의도(선택)**: URL 뒤에 자연어가 붙어 있으면 그것이 디자이너 의도다 (예: "선택된 탭 강조하려 했어").
    - 의도 있음 → **선언된 의도 검증**: 의도를 기준으로 토큰 적합성을 본다(역추론 아님, 더 정확).
    - 의도 없음 → **캡처 역추론 폴백**: 스크린샷+노드에서 각 요소 역할을 추론한다. 되묻지 말고 진행하되,
      리포트 헤더에 "의도 미제공 → 역할을 추론함(신뢰도 낮음)"을 명시한다.

## 실행 순서

### 1. 데이터 추출 (결정론, MCP)

이 단계는 "사실"을 모으는 단계다. 추론하지 말고 그대로 읽어라.

1. **`get_design_context`** — 노드 트리 + 각 노드의 바인딩(fill/stroke/text에 어떤 변수가 묶였는지)
    - 노드 id/이름/좌표. **"어느 노드가 어떤 토큰을 쓰는가"는 여기서 사실로 확정된다.** 짝짓기를 추론으로
      하지 마라.
2. **`get_variable_defs`** — 토큰(변수) → 실제 렌더 hex. vapor 스키마엔 hex가 없고 alias만 있으므로,
   contrast 계산에 쓸 hex는 **반드시 여기서** 가져온다.
3. **`get_screenshot`** — 시각 렌더. 요소 역할 추론(3단)의 **보조** 입력. 토큰 짝짓기 용도가 아니다.

**폴백**: 노드에 변수 바인딩이 없고 raw hex로 칠해져 있으면, 그 자체가 "토큰 미사용" 위반이다.
캡처/노드 색에서 가장 가까운 vapor 토큰을 `nearestToken`으로 추정해 제안에 쓴다.

### 2. 정규화 — evaluate.mjs 입력 만들기

추출한 데이터를 **요소(element) 배열**로 정규화한다. 평가 단위는 "노드 하나가 한 속성에 쓴 토큰"이다.
한 노드가 fill과 text를 둘 다 토큰화했으면 요소 2개로 쪼갠다.

각 요소 형식 (이 형식이 `evaluate.mjs`의 계약이다):

```json
{
    "nodeId": "37843:3525",
    "name": "선택된 탭",
    "property": "fill",
    "token": "colors.background.primary.100",
    "hex": "#e8f0fe",
    "opacity": 1,
    "backgroundHex": null,
    "nearestToken": null
}
```

- `token`: 바인딩된 vapor 토큰 키. 미바인딩(raw색)이면 `null`.
- `hex`: `get_variable_defs`가 푼 실제 hex. 모르면 `null`.
- `backgroundHex`: 이 요소가 **전경**(text/icon/foreground 토큰)일 때, 깔린 배경의 hex. contrast 계산에 필수.
  배경 위 전경 관계는 노드 트리의 부모/겹침에서 판단한다. 모르면 `null`(→ contrast 미검사 처리됨).
- `opacity`: 0~1. disabled-opacity 검사용.
- `nearestToken`: `token`이 `null`일 때만, 캡처 색 역매핑으로 찾은 가장 가까운 토큰.

### 3. 결정론 검사 실행 (2단)

정규화한 배열을 `evaluate.mjs`에 넘긴다:

```bash
echo '<정규화된 elements JSON>' | node skills/token-usage-review/scripts/evaluate.mjs
```

반환: `{ violations, conformant, summary }`.

- `violations`: `do-not-use` / `contrast-fail` / `token-not-used` / `foreground-surface-mismatch`(high), `contrast-unchecked` / `foreground-surface-unchecked` / `opacity-mismatch`(info).
    - `foreground-surface-mismatch`: `_rules.foreground` 전역 규칙 위반. `.100` 전경을 비순백 배경에, 또는 `.200` 전경을 순백(#ffffff) 배경에 쓴 경우. 순백 판정은 엄격(#ffffff/투명만, near-white 제외). 배경 hex를 모르면 `foreground-surface-unchecked`(info)로 보류.
    - `opacity-mismatch`(info): disabled-opacity는 `_rules.disabled` 전역 규칙(32%)이다. "이 요소가 disabled인가"는 의미 판정이라 결정론으로 단정하지 않고, opacity가 100%도 32%도 아닌 어정쩡한 값일 때만 보조 info로 남긴다(적합률에 영향 없음).
- 이건 **결정론 위반**이다. 그대로 신뢰하고 리포트의 "결정론 위반" 섹션에 넣는다.

룰셋이 stale하다고 의심되거나 스키마를 갱신했으면 먼저
`node skills/token-usage-review/scripts/build-ruleset.mjs`로 룰셋을 재생성한다.

### 4. 의미 판정 (3단, 너의 LLM 판단)

룰셋(`assets/vapor-ruleset.json`)의 `avoidRules` 중 `classification: "semantic"`인 항목과,
각 토큰의 `when`/`intent`(스키마)를 기준으로, **결정론 검사를 통과한 요소들**의 의미 적합성을 판정한다.

요소마다:

1. 이 요소의 **역할**을 정한다.
    - 의도 있음: 선언된 의도에서 (예: "선택된 탭" → 선택/활성 상태 요소).
    - 의도 없음: 캡처+노드 맥락에서 추론 (신뢰도 낮음 표시).
2. 쓴 토큰의 `when`이 그 역할을 전제하는가? `avoid`의 의미 조건에 걸리는가?
    - 예: `colors.background.primary.100`의 when="선택/활성 상태를 나타내는 요소 배경". 요소가 단순
      페이지 배경이면 → avoid "page or screen background → canvas.100" 위반. 제안: `canvas.100`.
3. 각 판정에 **confidence(HIGH/MED/LOW)**를 단다. 의도 없이 추론한 역할은 기본 LOW~MED. 불확실한 판정이
   리포트 상단을 점령하지 않게 하기 위함이다.

제안 토큰은 가능하면 `avoidRules[].remedy.suggestedTokens`(= vapor `avoid` 우변)에서 가져온다.
스키마가 이미 "대신 이걸 써라"를 명시하므로 제안을 지어내지 마라.

### 5. 터미널 출력

파일로 저장하지 말고 **터미널에 직접** 아래 형식으로 출력한다. 결정론 위반과 의미 판정 위반을 **분리**한다
(둘은 신뢰도가 다르므로 섞으면 안 된다). 적합률은 단순 비율이며 가중합산하지 않는다.

```markdown
# {노드명} — vapor 토큰 사용성 평가

> 의도: "{입력 의도 또는 '미제공 → 역할 추론(신뢰도 낮음)'}"
> 적합률: {conformCount}/{total} ({rate}%) · 스키마 {schemaVersion}

## 결정론 위반 (strict)

| 요소    | 사용 토큰     | 위반 유형  | 제안 토큰   | Figma            |
| ------- | ------------- | ---------- | ----------- | ---------------- |
| 탭 배경 | secondary.100 | do-not-use | primary.100 | [열기]({딥링크}) |

## 의미 판정 위반 (LLM)

| 요소      | 사용 토큰   | 추론/선언 역할 | when 불일치                   | 제안       | confidence |
| --------- | ----------- | -------------- | ----------------------------- | ---------- | ---------- |
| 헤더 배경 | primary.100 | 페이지 배경    | 선택상태 전제인데 페이지 배경 | canvas.100 | HIGH       |

## 적합 (통과)

| 요소 | 사용 토큰 | 역할 | confidence |
| ---- | --------- | ---- | ---------- |

## 참고

- (info) 표시: contrast 미검사(hex/배경 미제공), opacity 불일치 등 결정론적으로 단정 못 한 항목.
```

- Figma 딥링크: `https://www.figma.com/design/{fileKey}/...?node-id={nodeId}` (nodeId는 `-` 형식).
- info 위반은 위반 표가 아니라 "참고"에 모은다(부적합 카운트에서 중립).

### 6. 되먹임 (improve) — 사람 루프

이 스킬은 **수정 제안까지만** 한다. Figma 파일을 자동으로 고치지 않는다(MCP는 읽기 도구이고,
디자이너의 통제권을 보호한다). 디자이너가 제안대로 고친 뒤 같은 URL로 다시 실행하면 재평가된다.

## 번들 구성

```
token-usage-review/
├── SKILL.md
├── assets/
│   ├── vapor-token-schemas-v0.2.3.json   # 루브릭. 토큰 41개 + 전역 `_rules`. 추후 CDN로 이전 예정
│   └── vapor-ruleset.json                # build-ruleset 산물 (결정론 규칙 + globalRules)
└── scripts/
    ├── schema-loader.mjs   # 스키마 출처 추상화 + 버전 핀. loadSchema(토큰만)/loadGlobalRules(_rules)
    ├── build-ruleset.mjs   # 스키마 → 룰셋. _rules→globalRules 추출. 새 avoid는 UNCLASSIFIED로 플래그
    ├── evaluate.mjs        # 2단 결정론 (do-not-use/contrast/foreground-surface/opacity/미바인딩 + 집계 검산 가드)
    └── evaluate.test.mjs   # 결정론 코어 단위테스트 (node --test scripts/)
```

## 한계 (정직하게)

- contrast 검사는 전경 hex와 배경 hex를 둘 다 알아야 한다. 노드 트리에서 배경을 못 잡으면 "미검사"로
  남는다 — 통과로 오해하지 마라. **룰셋 contrast 테이블은 24개 토큰 전부(success/warning/contrast 계열
  foreground 포함) 완비돼 있다.** 런타임 "미검사"는 테이블 누락이 아니라 배경 hex 추출 실패 때문이다.
  같은 제약이 `foreground-surface` 검사에도 적용된다(배경 hex 없으면 보류).
- 의미 판정(3단)은 LLM 추론이라 confidence가 낮을 수 있다. 특히 의도 미제공 시. 리포트는 그 불확실성을
  숨기지 않는다.
- 현재 스키마는 **색상 토큰 41개**만 다룬다. spacing/typography는 스키마가 확장되면 같은 파이프라인에 얹는다.
