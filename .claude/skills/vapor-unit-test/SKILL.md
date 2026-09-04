---
name: vapor-unit-test
description: >
    vapor-ui 모노레포(`packages/*`)의 유닛 테스트를 **Vitest** + **React Testing Library** 컨벤션에 맞게 작성합니다.
    다음과 같은 표현이 보이면 — 명시적 파일 경로/스킬 이름 호출이 없더라도 — 반드시 이 스킬을 사용하세요:
    "테스트 추가해줘", "이 컴포넌트/hook/util 테스트 써줘", "유닛 테스트 작성", "test 좀 짜줘", "테스트 코드 작성",
    "spec 파일 만들어줘", "`*.test.ts(x)` 추가", "`__tests__` 만들어", "커버리지 올려/보강해",
    "snapshot 갱신", "테스트 실패 고쳐", "이 파일 테스트 리뷰해줘",
    "write/add/generate/scaffold unit tests", "improve test coverage", "review tests".
    기존 테스트 파일을 리뷰하거나 누락된 커버리지를 보충하는 작업에도 사용합니다.
    React 컴포넌트, 커스텀 hook, 그리고 그 외 일반 JS/TS 파일(순수 함수, 변환기, 생성기, 린트 규칙 등) 모두를 다룹니다.
---

# Vapor Unit Test Skill

vapor-ui 모노레포의 모든 유닛 테스트를 작성·리뷰합니다.

## 무엇을 테스트하는가에 따라 가이드가 다릅니다

작성 대상에 맞춰 references/ 안의 가이드 한 개를 골라 읽으세요. **전부 한꺼번에 로드하지 마세요.**

| 대상                                                            | 가이드                          |
| --------------------------------------------------------------- | ------------------------------- |
| React 컴포넌트                                                  | `references/component-tests.md` |
| React 커스텀 hook (`use*`)                                      | `references/hook-tests.md`      |
| 그 외 일반 JS/TS 파일 (순수 함수, 변환기, 생성기, 린트 규칙 등) | `references/general-tests.md`   |

작성 전에 **반드시 대상 소스 파일을 먼저 읽으세요.** 무엇을 테스트할지, 무엇이 위임(delegation)이라 테스트가 불필요한지 판단하기 위해서입니다.

## 작성 워크플로우

1. **대상 소스 읽기** — 어떤 함수/컴포넌트/hook인지, 외부 라이브러리에 단순 위임하는지 자체 로직이 있는지 파악
2. **레퍼런스 선택** — 위 표에서 적절한 references 파일 1개 읽기
3. **테스트 케이스 작성** — 행복 경로 + 실패 경로 + 엣지 케이스를 모두 다룸
4. **검증** — `pnpm test <파일경로>` 또는 `pnpm test:coverage` 통과 확인

### TDD는 옵션

이 스킬의 주된 목적은 **테스트 파일 작성 컨벤션**입니다. TDD를 강제하지 않습니다.

- 구현이 이미 완료된 코드에 테스트를 추가하는 호출에서는 TDD 적용 불가 — 그 경우엔 컨벤션에 맞춰 테스트만 작성
- 구현이 아직 없거나, 전체 작업 흐름을 관장하는 호출에서 TDD 적용이 가능한 상황이라면 red → green → refactor 순서로 진행 권장 — 검증 누락을 줄임

## 모든 테스트에 공통인 규칙

### 파일 위치

- **단일 파일 테스트** → 그 파일 바로 옆에 **co-located**.
  예: `useInterval.ts` → `useInterval.test.ts`, `stateful-props.ts` → `stateful-props.test.ts`,
  컴포넌트는 컴포넌트 폴더 안에 — `packages/core/src/components/<name>/<name>.test.tsx`
- **여러 파일을 가로지르는 통합 테스트나 공통 시나리오** → 해당 영역 루트의 `__tests__/` 폴더.
  예: `packages/codemod/.../__tests__/<name>.test.ts`, `packages/color-generator/__tests__/snapshots.test.ts`

"단일 파일이냐 / 전체 흐름이냐"가 판단 기준. 같은 패키지 안에서도 두 위치가 공존할 수 있음.

### 외부 fixture 파일

테스트가 외부 fixture(`.input.tsx`/`.output.tsx`, JSON 모킹 데이터, 큰 입력 스냅샷 등)를 사용하면 **테스트 파일과 같은 위치의 `__testfixtures__/` 하위 폴더**에 둡니다 (`__testfixtures__`는 jscodeshift 관례명, 다른 도메인도 동일 이름 사용).

이유:

- 소스 폴더에 fixture가 섞이면 본체 파일 식별이 어려워짐
- fixture는 의도적으로 부분/구버전 코드인 경우가 많아 빌드·타입체크 글롭이 fixture를 잡으면 오탐 발생 → `__testfixtures__/`는 vitest/tsconfig 글롭에서 한 번에 제외하기 쉬움

```
<area>/
├── target.ts
├── target.test.ts
└── __testfixtures__/
    ├── case-a.input.tsx
    └── case-a.output.tsx
```

현재 주 사용처는 codemod지만, 컴포넌트·hook·유틸에서도 외부 fixture가 필요해지면 동일 규칙 적용.

### Imports

Vitest는 `globals: true` 설정으로 동작합니다. 다음 식별자는 **import 하지 마세요** — 전역으로 제공됩니다.

```ts
(describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi);
```

`Mock` 등 타입만은 `import type { Mock } from 'vitest'`로 가져옵니다.

### `it()` 네이밍

`it ___` 문장이 완성되도록 작성합니다. `should ___` 형식과 평서 현재형(`returns ___`, `merges ___`, `fires ___`) 둘 다 허용. 한 파일 안에서는 한 형식으로 통일.

```ts
// should 형식
it('should invoke the onClick handler when clicked', ...)
it('should not change its state when disabled', ...)

// 평서 현재형
it('returns null when input is empty', ...)
it('merges static className values', ...)
it('fires the callback every interval', ...)
```

속성/속성+값을 언급할 때는 백틱으로 감쌉니다.

```ts
it('should have the `aria-required` attribute on the trigger', ...)
it('should have `aria-expanded="true"` when open', ...)
```

`userEvent`, `axe`, async 동작을 다루는 콜백은 모두 `async`.

### Mock 함수

```ts
const onChange = vi.fn();
// 타입 강제가 필요할 때만 — props 시그니처에 맞춰야 하거나 `mockImplementation` 타입 추론이 안 될 때
const onChange: Mock = vi.fn();

expect(onChange).toHaveBeenCalledTimes(1);
expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
expect(onChange).not.toHaveBeenCalled();
```

### 커버리지 목표

**4개 지표 모두 80% 이상**: Statements, Lines, Branches, Functions.

지표가 떨어지면 소스 파일을 다시 보고 "이 라인이 자체 로직인가, 외부 라이브러리에 단순 위임인가"를 판단하세요. 자체 로직 → 테스트 추가. 단순 위임 → 우선순위 낮춤.

**단순 위임 판단 기준** — 함수 본문이 `return externalLib.foo(args)` 처럼 외부 호출 한 줄(+ 인자 그대로 전달)이면 위임. 분기, 인자 변환, 입력 검증, 반환값 가공 중 하나라도 있으면 자체 로직 → 테스트.

### 시각적 변형은 테스트하지 않음

`size`, `shape`, `variant`, `color` 같은 시각적 prop은 시각 회귀 테스트가 담당합니다. 유닛 테스트에서 다루지 마세요.

## 깊이 들어가야 할 때

- 컴포넌트 작성 중인데 query/state-assertion 패턴이 헷갈린다 → `references/component-tests.md`
- hook의 비동기 상태 변경을 어떻게 검증하는지 모르겠다 → `references/hook-tests.md`
- snapshot을 쓸지 명시적 assertion을 쓸지 판단 못 하겠다, 도메인 헬퍼를 어떻게 활용하는지 → `references/general-tests.md`
- 풀 예시가 필요하다 → `references/examples/` (`breadcrumb.test.tsx`, `use-hook.test.ts`, `util.test.ts`)

## 시작 전 체크리스트

- [ ] 대상 소스 파일을 읽었는가?
- [ ] 대상이 컴포넌트 / hook / 그 외 일반 JS·TS 중 어디인지 분류했는가?
- [ ] 적합한 `references/*.md`를 1개 골라 읽었는가?
- [ ] 시각 회귀로 다뤄야 할 prop을 유닛 테스트에 넣고 있지 않은가?
