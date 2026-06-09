# 결정론 검사 · 의미 판정 · 출력 · 되먹임 (실행 순서 2 → 3 → 4)

> 1단계(통합 추출)가 직접 출력한 Element[] + TypoElement[] 배열을 받아 위반을 가리고, 결정론 위반과 의미 판정 위반을 분리해 리포트한다.

## 2. 결정론 검사 실행

### 2a. 색상 결정론

추출 스크립트가 반환한 Element 배열을 `evaluate.mjs`에 넘긴다:

```bash
echo '<Element[] JSON>' | node ~/.claude/skills/token-usage-review/scripts/evaluate.mjs
```

반환: `{ violations, conformant, summary }`.

- `violations`: `do-not-use` / `contrast-fail` / `token-not-used` / `foreground-surface-mismatch`(high), `unknown-token` / `contrast-unchecked` / `foreground-surface-unchecked` / `opacity-mismatch`(info).
    - `foreground-surface-mismatch`: `FG_SURFACE` 상수 규칙 위반. `.100` 전경을 비순백 배경에, 또는 `.200` 전경을 순백(#ffffff) 배경에 쓴 경우. 순백 판정은 엄격(#ffffff/투명만, near-white 제외). 배경 hex를 모르면 `foreground-surface-unchecked`(info)로 보류.
    - `unknown-token`(info): 변수 바인딩은 정상이나 이름이 스키마 키와 불일치(오타/미등록). 진짜 raw(`token-not-used`, high)와 다르다. 추출 스크립트가 `tokenStatus:'unknown'`을 싣거나, `token`이 스키마 키 집합(`ruleset.tokenKeys`)에 없을 때 잡힌다.
    - `opacity-mismatch`(info): opacity가 100%도 32%도 아닌 어정쩡한 값일 때만 보조 info로 남긴다(적합률 중립).

결정론 임계값은 `evaluate.mjs` 코드 상수(`RATIO_BY_ROLE`/`DISABLED_OPACITY_PCT`/`FG_SURFACE`)가 진실이다. 임계값을 바꾸려면 상수와 테스트를 함께 고친다.

### 2b. typography 결정론

추출 스크립트가 반환한 TypoElement 배열을 `typography-evaluate.mjs`에 넘긴다:

```bash
echo '<TypoElement[] JSON>' | node ~/.claude/skills/token-usage-review/scripts/typography-evaluate.mjs
```

반환: `{ violations, conformant, summary }`.

- `violations`: `typo-raw`(high) — `textStyleId` 없고 변수 바인딩도 없는 순수 raw 텍스트.
- `styled-override` / `var-only` / `mixed`는 디자이너가 의도적으로 직접 수정한 케이스이므로 **위반으로 세지 않는다(정상 취급)**.
- `infoFlags`는 항상 0 — typography 결정론에는 info 개념이 없다.

## 3. 의미 판정 (너의 LLM 판단)

### 3a. 색상 의미 판정

`assets/vapor-token-schemas-*.json` 각 토큰의 `avoid`·`when`·`intent`를 기준으로, **색상 결정론을 통과한 요소들**의 의미 적합성을 판정한다.

요소마다:

1. 이 요소의 **역할**을 정한다 — 의도 있음: 선언된 의도에서 / 의도 없음: 캡처+노드 맥락에서 추론(신뢰도 낮음).
2. 쓴 토큰의 `when`이 그 역할을 전제하는가? `avoid`의 의미 조건에 걸리는가?
3. 각 판정에 **confidence(HIGH/MED/LOW)**를 단다.

제안은 스키마 `avoid` 줄의 `→` 우변에서 가져온다. 지어내지 마라.

### 3b. typography 의미 판정 (위계 추론)

`assets/typography-token-schemas-v0.1.0.json` 각 역할의 `when`/`avoid`/`viewport`를 루브릭으로, **스크린샷과 의도**를 보며 텍스트 노드의 위계 적절성을 판정한다.

각 텍스트 노드마다:

1. **스크린샷**에서 이 텍스트가 어떤 위계인지 추론한다 — 히어로 제목인가? 섹션 제목인가? 본문인가? 레이블인가?
2. 노드의 `textStyle`(예: `heading3`)이 추론한 위계·맥락과 맞는가? 스키마의 `when`/"avoid"를 대조한다.
3. `viewport`도 확인 — 예: `display1`은 `pc` 전용인데 모바일 프레임에 쓰였다면 위반.
4. 각 판정에 **confidence(HIGH/MED/LOW)**를 단다. 의도 미제공 시 기본 LOW~MED. `textStyle`이 스키마 `roleKeys`에 없으면(오타/커스텀 스타일) LOW로 처리하고 리포트에 명시한다.

## 4. 터미널 출력

파일로 저장하지 말고 **터미널에 직접** 아래 형식으로 출력한다. 색상·typography 섹션을 **분리**한다. 적합률은 색상 요소(노드×속성) + 텍스트 노드 전체를 분모로 통합한다.

```markdown
# {노드명} — vapor 토큰 사용성 평가

> 의도: "{입력 의도 또는 '미제공 → 역할 추론(신뢰도 낮음)'}"
> 적합률: {colorConform+typoConform}/{colorTotal+typoTotal} ({rate}%)
> 색상 스키마 {colorSchemaVersion} · typography 스키마 {typoSchemaVersion}

---

## [색상] 결정론 위반 (strict)

| 요소    | 사용 토큰     | 위반 유형  | 제안 토큰   | Figma            |
| ------- | ------------- | ---------- | ----------- | ---------------- |
| 탭 배경 | secondary.100 | do-not-use | primary.100 | [열기]({딥링크}) |

## [색상] 의미 판정 위반 (LLM)

| 요소      | 사용 토큰   | 추론/선언 역할 | when 불일치                   | 제안       | confidence |
| --------- | ----------- | -------------- | ----------------------------- | ---------- | ---------- |
| 헤더 배경 | primary.100 | 페이지 배경    | 선택상태 전제인데 페이지 배경 | canvas.100 | HIGH       |

---

## [Typography] 결정론 위반 (strict)

| 텍스트(앞20자) | appliedStatus | 위반 유형 | Figma            |
| -------------- | ------------- | --------- | ---------------- |
| "안녕하세요"   | raw           | typo-raw  | [열기]({딥링크}) |

## [Typography] 위계 판정 위반 (LLM)

| 텍스트(앞20자) | Text Style | 추론 역할 | 위계 불일치                       | 제안     | confidence |
| -------------- | ---------- | --------- | --------------------------------- | -------- | ---------- |
| "주요 제목"    | body2      | 히어로    | body2는 본문용, 히어로엔 display3 | display3 | MED        |

---

## 적합 (통과)

| 요소/텍스트 | 종류       | 토큰/Text Style | 역할      | confidence |
| ----------- | ---------- | --------------- | --------- | ---------- |
| 버튼 배경   | 색상       | primary.200     | 활성 버튼 | HIGH       |
| "섹션 제목" | typography | heading2        | 섹션 제목 | HIGH       |

## 참고

- 색상 (info): contrast 미검사(hex/배경 미제공), foreground-surface 미검사, opacity 불일치, unknown-token 등.
- typography: styled-override/var-only/mixed는 정상 취급(위반으로 세지 않음). textStyle이 roleKeys에 없으면 LOW confidence.
```

- Figma 딥링크: `https://www.figma.com/design/{fileKey}/...?node-id={nodeId}` (nodeId는 `-` 형식).
- 색상 info 위반은 "참고"에 모은다(부적합 카운트 중립).
- **통합 적합률 분모**: 색상은 노드×속성(fill/stroke/text 각 1개), typography는 텍스트 노드 1개. 단위가 다르므로 분모에서 그냥 합산한다(동일 가중).

## 5. 되먹임 (improve) — 사람 루프

이 스킬은 **수정 제안까지만** 한다. Figma 파일을 자동으로 고치지 않는다(MCP는 읽기 도구이고, 디자이너의 통제권을 보호한다). 디자이너가 제안대로 고친 뒤 같은 URL로 다시 실행하면 재평가된다.
