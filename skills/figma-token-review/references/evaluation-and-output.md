# 2~4단계: 결정론 검사 · 의미 판정 · 출력

## 2단계: 결정론 검사

추출 파일을 두 스크립트에 인자로 넘긴다. 둘 다 `{ violations, conformant, summary, rubric }`를 낸다.

```bash
node scripts/evaluate.mjs <추출파일>             # 색상
node scripts/typography-evaluate.mjs <추출파일>  # typography
```

### 색상 위반 종류 (`evaluate.mjs`)

| type                 | severity | 의미                                                                             |
| -------------------- | -------- | -------------------------------------------------------------------------------- |
| `token-not-used`     | high     | 변수 미바인딩(raw 색) — 1축                                                      |
| `unknown-token`      | high     | 바인딩됐으나 semantic 미도달, 또는 스키마 키 부재(오타·미등록) — 2축             |
| `do-not-use`         | high     | do-not-use 토큰 사용 — 2축                                                       |
| `role-mismatch`      | high     | property가 전제하는 role과 토큰 role 불일치(예: 면 채움에 foreground 토큰) — 2축 |
| `fg-grade-mismatch`  | high     | fg-100을 비순백(other) 배경에 사용 — 4축. `suggested`에 `.200`                   |
| `fg-grade-ambiguous` | info     | 배경 식별 모호 — 4축. 적합률 중립, "검토 필요"로 노출                            |

- `stroke`는 border/foreground 둘 다 정당할 수 있어 role 검사를 생략한다(단정하면 오탐).
- 적합률은 high만 부적합으로 센다. info는 분모에서 중립. 단위는 가중 요소 수(그룹 `count`).

### typography 위반 종류 (`typography-evaluate.mjs`)

| type                   | severity | 의미                                                     |
| ---------------------- | -------- | -------------------------------------------------------- |
| `typo-raw`             | high     | Text Style·변수 둘 다 미바인딩 — 3축                     |
| `typo-styled-override` | info     | Text Style 적용 후 일부 필드 수동 오버라이드 — 위반 아님 |

- `styled-clean`/`var-only`/`mixed`는 정상 취급. `styled-override`를 info로만 두는 이유: font-weight
  변수 바인딩 시 Figma가 detach를 강제하는 제약 + 의도적 오버라이드 가능성 → high로 보면 오탐.
- 출력의 `unknownTextStyles`는 스키마에 없는 Text Style 이름(오타·미등록 검토용).

## 3단계: 의미 판정 (LLM)

**스키마 파일 전체를 Read하지 마라.** 2단 스크립트가 낸 `rubric`(입력에 실제 쓰인 토큰/Text Style의
서브셋)만 본다. 판정 입력은 **3종 묶음**이다.

1. **rubric 서브셋** — 색상: `{ description, when, avoid }`. typography: `{ rank, totalRanks, when, avoid, description }`.
   `rank`는 16단 위계 중 인덱스(작을수록 큰 제목) — "위계 뒤집힘"의 근거.
2. **시안 구조 — `get_metadata`** — 노드 트리·이름·부모/형제. "이 텍스트가 카드 제목 위치인가 본문
   단락인가", "이 토큰이 어떤 컴포넌트의 어느 부위인가"의 구조적 맥락.
3. **시각 맥락 — `get_screenshot`** — 시각적 위계·강조. 구조만으론 안 잡히는 "이게 시각적으로 가장 큰
   제목인가", "이 색이 경고처럼 보이는 자리인가".

### 판정 대상

- **2축 semantic 의미**: `when`이 전제하는 역할에 실제로 맞게 썼나? `avoid`에 걸리나? (danger를 success
  자리에 쓴 것 등.) `avoid`의 "조건 → colors.X.Y"는 **우변이 그대로 remedy**다.
- **3축 typography 위계**: 본문에 heading 오용, 위계 뒤집힘. viewport 의존 규칙("mobile viewports →
  heading1")도 LLM이 추출의 `viewport`와 rubric을 함께 보고 판정한다(결정론으로 잡지 않음).

## 4단계: 출력

색상·typography 위반을 **섹션 분리**해 출력한다.

- **적합률**: 두 스크립트 `summary`의 가중 집계값(색상 요소 + 텍스트 노드)을 통합.
- **결정론 위반**: type·severity·detail·suggested 그대로. high는 부적합, info는 참고.
- **의미 판정**: 각 항목에 **PASS / FAIL + confidence(HIGH/MED/LOW) + 근거**. 근거는 어떤 when/avoid
  항목에 걸렸는지 명시. 저confidence(결정 경계)는 "검토 필요"로 human 라우팅. **점수화(0-100) 안 함.**
- 의도 미제공이면 헤더에 "역할 추론(신뢰도 낮음)" 명시.

### 출력 템플릿

```markdown
# 토큰 사용성 검증 — <노드 이름> (<적합률>)

> mode: light/dark · viewport: pc · 의도: <제공/추론>

## 색상 (<색상 적합률>)

### 결정론 위반

- [high] <name> `<token>` — <detail> → 제안: <suggested>

### 의미 판정 (LLM)

- [FAIL · MED] <name> `<token>` — danger 자리에 success 토큰. avoid "...→ colors.X.Y" 위배 → colors.X.Y

## Typography (<typo 적합률>)

### 결정론 위반

- [high] <name> "<characters>" — raw 값 직접 입력

### 의미 판정 (LLM)

- [PASS · HIGH] <name> subtitle1 — 라벨 위치, when 부합

## 참고

- 배경 모호(info) <n>건 — 검토 필요
- unknown Text Style: [...]
```

되먹임은 제안까지만 — 시안을 자동 수정하지 않는다.
