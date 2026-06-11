# 결정론 검사 · 의미 판정 · 출력 · 되먹임 (실행 순서 2 → 3 → 4)

> 1단계(통합 추출)가 출력한 `{ colors, typography, ... }` 객체를 받아 위반을 가리고, 결정론 위반과 의미 판정 위반을 분리해 리포트한다.

## 2. 결정론 검사 실행

추출 결과 객체를 **Write로 파일에 한 번 저장**하고(예: `/tmp/token-review-extract.json`), 두 스크립트에 같은 파일을 인자로 넘긴다. JSON을 echo로 다시 출력하지 마라 — 컨텍스트 중복 통과는 토큰 낭비이고, 따옴표 이스케이프 사고의 원인이다.

### 2a. 색상 결정론

```bash
node ~/.claude/skills/token-usage-review/scripts/evaluate.mjs /tmp/token-review-extract.json
```

반환: `{ violations, conformant, summary, rubric }`.

- 그룹 요소(`nodeIds`/`count`)는 count 가중으로 집계된다 — `summary.total`은 그룹 수가 아니라 실제 요소 수다. 위반 항목의 `nodeId`는 그룹 대표(첫 노드)이고 전체 목록은 `nodeIds`에 있다.
- `rubric`: 입력에 실제 등장한 토큰의 `intent`/`when`/`avoid` 서브셋. **3단 의미 판정은 이것만 보면 된다 — 스키마 파일 전체를 Read하지 마라.**

- `violations`: `do-not-use` / `token-not-used`(high), `unknown-token` / `opacity-mismatch`(info).
  - `unknown-token`(info): 변수 바인딩은 정상이나 이름이 스키마 키와 불일치(오타/미등록). 진짜 raw(`token-not-used`, high)와 다르다. 추출 스크립트가 `tokenStatus:'unknown'`을 싣거나, `token`이 스키마 키 집합(`ruleset.tokenKeys`)에 없을 때 잡힌다.
  - `opacity-mismatch`(info): opacity가 100%도 32%도 아닌 어정쩡한 값일 때만 보조 info로 남긴다(적합률 중립).

결정론 임계값은 `evaluate.mjs` 코드 상수(`DISABLED_OPACITY_PCT`)가 진실이다. 임계값을 바꾸려면 상수와 테스트를 함께 고친다.

### 2b. typography 결정론

```bash
node ~/.claude/skills/token-usage-review/scripts/typography-evaluate.mjs /tmp/token-review-extract.json
```

반환: `{ violations, conformant, summary, rubric, unknownTextStyles }`.

- `violations`: `typo-raw`(high) — `textStyleId` 없고 변수 바인딩도 없는 순수 raw 텍스트.
- `styled-override` / `var-only` / `mixed`는 디자이너가 의도적으로 직접 수정한 케이스이므로 **위반으로 세지 않는다(정상 취급)**.
- `infoFlags`는 항상 0 — typography 결정론에는 info 개념이 없다.
- `rubric`: 사용된 Text Style의 `intent`/`when`/`avoid`/`viewport` 서브셋(3단용 — 스키마 파일 직독 불필요). `unknownTextStyles`: 스키마에 없는 스타일명(오타/커스텀 → 3단에서 LOW confidence).

## 3. 의미 판정 (너의 LLM 판단)

### 3a. 색상 의미 판정

`evaluate.mjs` 출력의 `rubric`(사용 토큰별 `intent`/`when`/`avoid`)을 기준으로, **색상 결정론을 통과한 요소들**의 의미 적합성을 판정한다. 스키마 파일 전체를 읽지 마라 — 루브릭에 없는 토큰이 판정에 필요해진 경우(제안 후보 탐색 등)에만 스키마를 연다.

요소마다:

1. 이 요소의 **역할**을 정한다 — 의도 있음: 선언된 의도에서 / 의도 없음: 캡처+노드 맥락에서 추론(신뢰도 낮음).
2. **property와 토큰 계열의 일치를 반드시 대조한다.** `property`(fill/stroke/text)가 전제하는 토큰 계열과 실제 쓴 토큰의 계열이 맞는가:
   - `stroke`(테두리/선) → `colors.border.*` 계열이 맞다. `colors.background.*`(면 채우기)를 stroke에 쓰면 **부적합**(제안: 같은 의도의 `colors.border.*`).
   - `text`(글자) → `colors.foreground.*` 계열.
   - `fill`(면) → `colors.background.*` 계열(전경 노드의 아이콘/벡터 fill은 `colors.foreground.*`일 수 있으니 역할로 가른다).
   - 결정론은 이 불일치를 보지 않으므로(토큰 적법성만 본다) 반드시 여기서 잡는다. 계열 불일치가 명백하면 confidence HIGH.
3. 쓴 토큰의 `when`이 그 역할을 전제하는가? `avoid`의 의미 조건에 걸리는가?
4. 각 판정에 **confidence(HIGH/MED/LOW)**를 단다.

제안은 스키마 `avoid` 줄의 `→` 우변에서 가져온다. 지어내지 마라.

### 3b. typography 의미 판정 (위계 추론)

`typography-evaluate.mjs` 출력의 `rubric`(사용 역할별 `when`/`avoid`/`viewport`)을 루브릭으로, **스크린샷과 의도**를 보며 텍스트 노드의 위계 적절성을 판정한다. 위계 추론에는 스크린샷이 필요하다 — typography 모드가 실행 중이면 이 시점까지 `get_screenshot(maxDimension: 2576)`을 호출해 둔다(SKILL.md 스크린샷 분기).

각 텍스트 노드마다:

1. **스크린샷**에서 이 텍스트가 어떤 위계인지 추론한다 — 히어로 제목인가? 섹션 제목인가? 본문인가? 레이블인가?
2. 노드의 `textStyle`(예: `heading3`)이 추론한 위계·맥락과 맞는가? 스키마의 `when`/"avoid"를 대조한다.
3. `viewport`도 확인 — 예: `display1`은 `pc` 전용인데 모바일 프레임에 쓰였다면 위반.
4. 각 판정에 **confidence(HIGH/MED/LOW)**를 단다. 의도 미제공 시 기본 LOW~MED. `unknownTextStyles`에 잡힌 스타일(오타/커스텀)은 LOW로 처리하고 리포트에 명시한다.

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

- 색상 (info): opacity 불일치, unknown-token 등.
- typography: styled-override/var-only/mixed는 정상 취급(위반으로 세지 않음). textStyle이 roleKeys에 없으면 LOW confidence.
```

- Figma 딥링크: `https://www.figma.com/design/{fileKey}/...?node-id={nodeId}` (nodeId는 `-` 형식).
- 그룹 위반(`count > 1`)은 요소명 뒤에 `×N`을 붙이고 딥링크는 대표(첫) 노드로 건다. 적합률 분모/분자는 evaluate `summary`가 이미 가중 집계한 값을 그대로 쓴다.
- 색상 info 위반은 "참고"에 모은다(부적합 카운트 중립).
- **통합 적합률 분모**: 색상은 노드×속성(fill/stroke/text 각 1개), typography는 텍스트 노드 1개. 단위가 다르므로 분모에서 그냥 합산한다(동일 가중).

## 5. 되먹임 (improve) — 사람 루프

이 스킬은 **수정 제안까지만** 한다. Figma 파일을 자동으로 고치지 않는다(MCP는 읽기 도구이고, 디자이너의 통제권을 보호한다). 디자이너가 제안대로 고친 뒤 같은 URL로 다시 실행하면 재평가된다.
