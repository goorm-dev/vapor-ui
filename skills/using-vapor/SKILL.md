---
name: using-vapor
description: "Vapor UI 세션 오케스트레이터. 다음 상황에서 반드시 이 스킬을 사용할 것: /using-vapor 호출, '베이퍼 세션 시작', 'Vapor UI로 만들어줘', 'Vapor UI 써서', '@vapor-ui/core 사용', '@vapor-ui로 컴포넌트 만들어줘', Vapor UI 컴포넌트로 UI/페이지/폼/화면 작성 요청. Vapor UI 컴포넌트(Button, Box, TextInput, Card, Dialog 등)를 사용한 React 코드를 생성한 뒤 token-qa 스킬을 자동 실행하여 디자인 토큰 QA를 수행한다. 재실행, 토큰 수정, QA 재검사, 컴포넌트 추가 요청에도 사용."
---

# using-vapor — Vapor UI 세션 오케스트레이터

`@vapor-ui/core`로 React 코드를 작성하고, 작성이 끝나면 `token-qa` 스킬을 자동 실행해 디자인 토큰 QA를 받는다.

**왜 세션 단위인가:** 디자인 시스템은 한 번 쓰고 끝나는 게 아니라 일관되게 누적되어야 한다. 컴포넌트를 차례로 추가/수정할 때마다 QA가 자동으로 따라붙어야 일관성이 무너지지 않는다.

---

## Phase 0 — 세션 시작 알림

세션 첫 트리거 시 다음을 출력:

> "Vapor UI 세션을 시작합니다. 코드 작성이 끝나면 디자인 토큰 QA가 자동으로 실행됩니다."

같은 세션에서 이미 코드를 작성한 적이 있으면 재출력하지 않는다.

세션 컨텍스트:

- **신규 요청** — 새로 작성/수정한 파일 목록 추적
- **수정/보완 요청** — 이전에 작성한 파일도 QA 대상에 포함

---

## Phase 1 — 코드 작성

사용자 요청에 맞춰 `@vapor-ui/core` 컴포넌트로 코드를 작성한다. `vapor-ui` 스킬이 설치돼 있으면 컴포넌트 카탈로그·props·아이콘 조회에 활용한다.

### 권장 패턴

1. **색상은 `colorPalette` prop으로.** HEX 직타 대신:

    ```tsx
    <Button colorPalette="primary">   // OK
    <Button style={{ backgroundColor: '#0066ff' }}>   // 피한다
    ```

2. **크기는 `size` prop으로.** 픽셀 직타 대신:

    ```tsx
    <Button size="md">   // OK
    <Button style={{ height: '40px' }}>   // 피한다
    ```

3. **커스터마이징은 `$css` prop으로.** inline `style=`은 토큰 검증을 우회한다:
    ```tsx
    <Box $css={{ padding: '$200', background: '$bg-primary-100' }}>   // OK
    <Box style={{ padding: '16px', background: '#e3f2fd' }}>          // 피한다
    ```

### 사용자가 명시한 비-토큰 값은 그대로 작성한다

사용자가 명시적으로 HEX(`#f5f5f5`)·픽셀(`16px`)·`rgb(...)` 같은 비-토큰 값을 요청하면 그 값을 그대로 코드에 반영한다. 임의로 토큰 치환하지 않는다 — 의도를 마음대로 바꾸면 신뢰가 깨지고, 다음 Phase에서 token-qa가 후보 토큰을 제시할 테니 사용자가 결정하면 된다.

**예외 — 선제 치환 허용:**

- "토큰으로 알아서 변환해줘", "디자인 시스템에 맞게" 같이 명시적 변환 요청
- 색을 이름(`"파란색"`/`"회색"`)으로만 지정하고 구체 값 없는 경우 — 자연스럽게 `colorPalette` prop 선택

**예시 흐름:**

```
사용자: "배경을 #f5f5f5로 해줘"
→ Phase 1: <Box $css={{ background: '#f5f5f5' }}>   // 그대로
→ Phase 2: token-qa CRITICAL + 토큰 대안 제시
→ Phase 3: "수정하시겠어요?" 대기
```

```
사용자: "배경을 옅은 회색으로 토큰 써서 해줘"
→ Phase 1: <Box $css={{ background: '$bg-secondary-100' }}>   // 처음부터 토큰
→ Phase 2: token-qa PASS
```

### 파일 추적

Write/Edit 시마다 절대 경로를 기억. Phase 2에서 QA 대상으로 사용. 코드 작성이 없는 단순 질문(props 안내, 사용법 설명 등)은 Phase 2를 건너뛴다.

---

## Phase 2 — 토큰 QA

Phase 1에서 작성/수정한 파일이 하나 이상 있으면 `token-qa` 스킬을 호출. 작성된 파일 경로 목록을 함께 전달. token-qa가 CRITICAL/WARNING/PASS 리포트를 출력한다.

코드 작성을 안 했다면 Phase 2를 생략 — QA는 새 코드가 있을 때만 의미가 있다.

---

## Phase 3 — 결과 보고

```md
## 작업 완료

**생성/수정된 파일:**

- {파일 경로 목록}

### 토큰 QA 결과

{token-qa 리포트}
```

- **CRITICAL 있음:** "수정하시겠어요?" 프롬프트. 사용자 동의 시 해당 파일 수정 후 Phase 2 재실행.
- **CRITICAL 없음:** "✓ 토큰 QA 통과"로 마무리.

WARNING은 권장 사항. 사용자가 명시적으로 수정을 요청하지 않으면 그대로 둔다.

---

## 에러 핸들링

| 상황                          | 처리                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 코드 작성 없이 질문만 한 경우 | Phase 2 생략, 답변만 제공                                                                                                                        |
| token-qa 스킬 미설치          | "`skills/token-qa`를 `.claude/skills/`에 복사하세요" 안내 후 코드만 출력                                                                         |
| CRITICAL 수정 후 재검사 요청  | 해당 파일만 다시 QA 대상으로 전달                                                                                                                |
| 파일 쓰기 실패 (권한 거부 등) | **작업을 포기하지 말 것.** 코드를 응답 본문에 코드 블록으로 인라인 출력하고 의도된 파일 경로를 명시. QA는 인라인 코드 텍스트에 대해 그대로 수행. |

---

## 테스트 시나리오

### 정상 흐름

1. "Vapor UI로 로그인 폼 만들어줘"
2. `Button`/`TextInput`/`Form` 컴포넌트로 코드 작성
3. token-qa 자동 실행 → 하드코딩 없음 → ✓ 통과

### 위반 발견 → 수정 흐름

1. "배경을 파란색(#0066ff)으로 해줘"
2. `<Box $css={{ background: '#0066ff' }}>` 작성
3. token-qa: **CRITICAL** — hardcoded HEX
4. 사용자 "수정해줘"
5. `colorPalette="primary"` 또는 `$bg-primary-200`로 교체 → QA 재실행 → ✓ 통과

---

## 설치 안내

이 스킬은 `token-qa`와 함께 사용된다. 두 스킬을 모두 프로젝트의 `.claude/skills/`에 복사:

```bash
cp -r path/to/vapor-ui/skills/using-vapor .claude/skills/using-vapor
cp -r path/to/vapor-ui/skills/token-qa    .claude/skills/token-qa
```
