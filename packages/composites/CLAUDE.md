# CLAUDE.md

이 문서의 규칙은 `packages/composites/**` 안에서 모두 지킨다.

컴포넌트 작성의 구현 세부(슬롯 유틸, JSDoc 형식, `$css`, primitive prop 재정의, `namespace` 타입 export, `index.parts.ts` 구조)는 [`.claude/rules/composites.md`](../../.claude/rules/composites.md)에서 관리한다. 이 문서는 상위 정책과 경계, rules 파일은 그 정책을 코드로 옮기는 방법을 담는다. rules 파일은 `paths` frontmatter로 `packages/composites/**` 조작 시 자동 로드된다.

## 1. 패키지 개요

- `@vapor-ui/composites`는 `@vapor-ui/core` primitive를 조합하고 디자인 결정을 내재화한 슬롯 기반 완성형 컴포넌트를 제공한다.
- 사용자들이 디자인 시스템을 사용할 때, 기본적으로 `@vapor-ui/composites`을 사용한다. `@vapor-ui/core`의 primitives는 Composites에서 사용되기 위한 조각이며, 커스터마이징이 필요한 경우에 한해 사용자들이 제한적으로 primitive를 직접 사용할 수 있다.
- 참고: [`@vapor-ui/composites` 계획](https://app.notion.com/p/goorm/Flat-Component-3b14e6997fb080ff8734f0f9d96a6439).

## 2. `@vapor-ui/core`와의 경계

- Composites의 모든 컴포넌트는 core primitive의 Public API 위에서 만든다. DOM을 직접 재구현하지 않는다.
- core는 `peerDependency`로 선언한다. 소비자가 core와 composites를 함께 설치했을 때 두 패키지는 같은 core 인스턴스를 참조한다. 그래야 `ThemeProvider` 같은 React Context를 하나로 유지한다.
- 로컬 개발·테스트에서는 `devDependencies`에도 `workspace:*`로 걸어 둔다. 그래야 workspace 링크로 해석된다.

## 3. 컴포넌트 API 규칙 (Flat Component 계획 참조)

- 슬롯 prop은 Figma의 아나토미와 1:1로 맞춘다 (`trigger`, `title`, `description`, `leadingIcon` 등).
- 폴리모픽(`asChild` / `as`)은 제공하지 않는다. 폴리모픽이 필요하면 소비자가 `@vapor-ui/core`로 직접 만든다.
- 모든 컴포넌트는 제어/비제어를 함께 지원한다: `state` / `defaultState` / `onStateChange` (예: `open` / `defaultOpen` / `onOpenChange`).
- 논리 상태 boolean에는 `is` 프리픽스를 붙인다: `isOpen`, `isDisabled`, `isChecked`. HTML 네이티브 속성과 구분한다.
- 아이템을 나열하는 경우 `items` prop 대신 dot-notation 서브 컴포넌트로 노출한다 (`Select.Root` / `Select.Option`).
- 모든 prop(시각 / 기능 / 슬롯)에 JSDoc을 작성한다. 이 내용을 그대로 Props Table 자동 생성에 사용한다. JSDoc의 형식·톤·태그 규칙은 [`.claude/rules/composites.md §2`](../../.claude/rules/composites.md#2-모든-prop에-jsdoc을-붙인다)를 따른다.

## 4. Prop 추가 — 이중 게이트웨이

새 prop은 두 게이트를 모두 통과한다. 하나라도 만족하지 못하면 반려한다.

1. 역할 강화: 이 prop이 컴포넌트의 역할을 어떻게 강화하는지 한 문장으로 설명한다.
2. 카테고리 배타성: `variants` / `functional` / `slot` 가운데 정확히 하나에만 속한다. 메타 정보는 prop 카테고리에 포함하지 않는다.

## 5. 코딩 스타일

- `packages/core/CLAUDE.md`의 규칙(타입스크립트, 파일·폴더 kebab-case, `index.ts` + `index.parts.ts` 재수출 패턴, Vanilla Extract 사용, 테스트 컨벤션)을 그대로 따른다.
- 예외: composites 컴포넌트의 기본 형태는 Flat이다. Compound 네임스페이스는 §3의 아이템 나열 케이스에만 사용한다.
- 슬롯 유틸(`createSlots`), 스타일(`$css`), primitive prop 재정의, `namespace` 타입 export, `index.parts.ts` 분리 규칙은 [`.claude/rules/composites.md`](../../.claude/rules/composites.md)에서 다룬다.

## 6. 테스트

- 유닛 테스트는 `vitest`와 `@testing-library/react`로 작성한다. 각 컴포넌트 폴더 안에 함께 두고, core와 동일한 셋업을 사용한다.
- 시각적 회귀 테스트는 `playwright`로 Storybook의 `Test Bed` 스토리를 캡처한다. `title`이 `Composites/`로 시작하는 스토리만 대상으로 삼는다. 기준 스크린샷은 `__tests__/screenshots/`에 둔다.

## 7. Storybook

- 스토리 파일은 루트 Storybook 앱이 `packages/**/src/**/*.stories.@(...)` glob으로 자동 수집한다.
- 시각적 회귀 필터가 인식하도록 `title`을 `'Composites/<Name>'` 형태로 작성한다.
- `apps/storybook/.storybook/main.ts`에서 `@vapor-ui/composites`와 `@vapor-ui/core`를 각 패키지의 `src` 디렉터리로 alias 처리한다. 소스를 수정하면 HMR로 바로 반영한다.

## 8. 하지 말아야 할 것

- Flat Component 설계가 확정되기 전에는 `src/components/` 아래 구현 코드를 수정하지 않는다.
- 명시적인 지시가 없으면 `className` / `style` 오버라이드 prop을 추가하지 않는다. 오버라이드 정책은 아직 정하지 않았다. 컴포넌트 내부 스타일은 [`.claude/rules/composites.md §3`](../../.claude/rules/composites.md#3-스타일은-css-prop으로-작성한다)의 `$css` 규칙을 따른다.
- `component.figma.tsx` (Code Connect) 파일을 손으로 작성하지 않는다. codegen 파이프라인이 생성한다.
