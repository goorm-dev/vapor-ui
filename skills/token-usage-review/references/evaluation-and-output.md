# 결정론 검사 · 의미 판정 · 출력 · 되먹임 (실행 순서 2 → 3 → 4)

> 1단계(통합 추출)가 직접 출력한 Element 배열을 받아 위반을 가리고, 결정론 위반과 의미 판정 위반을 분리해 리포트한다.

## 2. 결정론 검사 실행

추출 스크립트가 반환한 Element 배열을 `evaluate.mjs`에 넘긴다(별도 정규화 없음):

```bash
echo '<추출 스크립트가 출력한 elements JSON>' | node ~/.claude/skills/token-usage-review/scripts/evaluate.mjs
```

반환: `{ violations, conformant, summary }`.

- `violations`: `do-not-use` / `contrast-fail` / `token-not-used` / `foreground-surface-mismatch`(high), `unknown-token` / `contrast-unchecked` / `foreground-surface-unchecked` / `opacity-mismatch`(info).
    - `foreground-surface-mismatch`: `FG_SURFACE` 상수 규칙 위반. `.100` 전경을 비순백 배경에, 또는 `.200` 전경을 순백(#ffffff) 배경에 쓴 경우. 순백 판정은 엄격(#ffffff/투명만, near-white 제외). 배경 hex를 모르면 `foreground-surface-unchecked`(info)로 보류.
    - `unknown-token`(info): 변수 바인딩은 정상이나 이름이 스키마 키와 불일치(오타/미등록). 진짜 raw(`token-not-used`, high)와 다르다 — "토큰을 썼으나 스키마에 없다"는 명확한 의미라 info(적합률 중립)다. 추출 스크립트가 `tokenStatus:'unknown'`을 싣거나, `token`이 스키마 키 집합(`ruleset.tokenKeys`)에 없을 때 잡힌다.
    - `opacity-mismatch`(info): disabled-opacity는 `evaluate.mjs`의 코드 상수(`DISABLED_OPACITY_PCT`, 32%)다. "이 요소가 disabled인가"는 의미 판정이라 결정론으로 단정하지 않고, opacity가 100%도 32%도 아닌 어정쩡한 값일 때만 보조 info로 남긴다(적합률에 영향 없음).
- 이건 **결정론 위반**이다. 그대로 신뢰하고 리포트의 "결정론 위반" 섹션에 넣는다.

결정론 임계값(`contrast`의 role별 최소 대비, `disabled` opacity, `foreground-surface`)은 `evaluate.mjs` 코드 상수가 진실이다(`RATIO_BY_ROLE`/`DISABLED_OPACITY_PCT`/`FG_SURFACE`). 스키마 자연어(`_rules`)나 토큰별 `minimumContrast`에서 파싱하지 않는다 — 가짓수가 작고 거의 안 바뀌므로 코드에 박아 재현성을 확보했다. contrast 요구치는 토큰 키 prefix로 role을 파생해 정한다(`colors.foreground.*`→4.5:1, `colors.border.*`→3:1, 그 외 대비 요구 없음). `schema-loader`가 스키마에서 읽는 건 `do-not-use`(status)·`tokenKeys`(키 집합)·`_rules` 키 목록(`unknownGlobalRules` 안전망)뿐이다. 결정론 임계값을 바꾸려면 `evaluate.mjs` 상수와 테스트를 함께 고친다.

## 3. 의미 판정 (너의 LLM 판단)

스키마(`assets/vapor-token-schemas-*.json`) 각 토큰의 `avoid`(좌변 조건 + `→` 우변 제안)와 `when`/`intent`를 기준으로, **결정론 검사를 통과한 요소들**의 의미 적합성을 판정한다. `avoid`는 따로 분류해 두지 않는다 — 의미 판정은 본래 LLM의 몫이라, 스키마 줄을 직접 읽고 판단하면 된다. (`disabled`·`contrast`·`foreground-surface`처럼 결정론으로 굳는 조건은 이미 `evaluate.mjs` 코드 상수로 빠져 evaluate가 처리한다.)

요소마다:

1. 이 요소의 **역할**을 정한다.
    - 의도 있음: 선언된 의도에서 (예: "선택된 탭" → 선택/활성 상태 요소).
    - 의도 없음: 캡처+노드 맥락에서 추론 (신뢰도 낮음 표시).
2. 쓴 토큰의 `when`이 그 역할을 전제하는가? `avoid`의 의미 조건에 걸리는가?
    - 예: `colors.background.primary.100`의 when="선택/활성 상태를 나타내는 요소 배경". 요소가 단순 페이지 배경이면 → avoid "page or screen background → canvas.100" 위반. 제안: `canvas.100`.
3. 각 판정에 **confidence(HIGH/MED/LOW)**를 단다. 의도 없이 추론한 역할은 기본 LOW~MED. 불확실한 판정이 리포트 상단을 점령하지 않게 하기 위함이다.

제안 토큰은 가능하면 스키마 `avoid` 줄의 `→` 우변(예: `page or screen background → colors.background.canvas.100`의 `colors.background.canvas.100`)에서 가져온다. 스키마가 이미 "대신 이걸 써라"를 명시하므로 제안을 지어내지 마라.

## 4. 터미널 출력

파일로 저장하지 말고 **터미널에 직접** 아래 형식으로 출력한다. 결정론 위반과 의미 판정 위반을 **분리**한다 (둘은 신뢰도가 다르므로 섞으면 안 된다). 적합률은 단순 비율이며 가중합산하지 않는다.

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

- (info) 표시: contrast 미검사(hex/배경 미제공), foreground-surface 미검사, opacity 불일치, **unknown-token**(스키마 미등록/오타 토큰명) 등 결정론적으로 부적합으로 단정하지 않는 항목.
```

- Figma 딥링크: `https://www.figma.com/design/{fileKey}/...?node-id={nodeId}` (nodeId는 `-` 형식).
- info 위반은 위반 표가 아니라 "참고"에 모은다(부적합 카운트에서 중립).

## 5. 되먹임 (improve) — 사람 루프

이 스킬은 **수정 제안까지만** 한다. Figma 파일을 자동으로 고치지 않는다(MCP는 읽기 도구이고, 디자이너의 통제권을 보호한다). 디자이너가 제안대로 고친 뒤 같은 URL로 다시 실행하면 재평가된다.
