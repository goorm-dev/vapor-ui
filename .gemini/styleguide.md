# 0. 코드 답변 방식

- 코드 리뷰 답변은 한국어로 제공한다.

# 1. 개발 환경

---

- **Package Manager**: PNPM v9+
- **Node.js**: v18+
- **Linting & Formatting**: ESLint, Prettier 사용 (IDE 연동 및 Git Hook 설정 권장)

# 2. Git & 버전 관리

---

## 2.1. 브랜치 전략

- **Git Flow** 사용 (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`).
- 브랜치명은 목적을 명확히 기술 (예: `feature/button-loading-state`).
- PR 병합 시 `feature` 등 작업 브랜치는 삭제.

## 2.2. 커밋 메시지 (Conventional Commits & SemVer)

[Conventional Commits 명세](https://www.conventionalcommits.org/)를 따릅니다. 이는 [SemVer](https://semver.org/lang/ko/) 기반 버전 관리 및 Changelog 자동 생성을 위함입니다.

**형식:**

```bash
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### **2.2.1. 주요 Commit Types & SemVer 영향:**

- **`feat`**: 새로운 기능 추가 (컴포넌트, prop 등). **`MINOR` 버전 상승.**

    - 예시:

        ```bash
        # 신규 Avatar 컴포넌트 (v1.2.3 -> v1.3.0)
        feat(Avatar): add new Avatar component

        # Button 컴포넌트에 iconPosition prop 추가 (v1.3.0 -> v1.4.0)
        feat(Button): implement iconPosition prop for icon placement

        ```

- **`fix`**: 버그 수정. **`PATCH` 버전 상승.**

    - 예시:

        ```bash
        # Input disabled 시 placeholder 색상 오류 (v1.4.0 -> v1.4.1)
        fix(Input): correct placeholder color in disabled state

        # Modal 내부 스크롤 불가 문제 (v1.4.1 -> v1.4.2)
        fix(Modal): resolve issue where modal content is not scrollable

        ```

- **`BREAKING CHANGE`**: API 호환성이 깨지는 변경. `type` 뒤에 `!`를 붙이거나, 푸터에 `BREAKING CHANGE:` 명시. **`MAJOR` 버전 상승.**

    - 예시:
      (v1.4.2 -> v2.0.0)

        ````
        feat(Button)!: change 'kind' prop to 'variant' for clarity

            BREAKING CHANGE: Button component's `kind` prop has been renamed to `variant`.
            Migrate `kind="primary"` to `variant="solid"`.
            Migrate `kind="secondary"` to `variant="outline"`.

            ```
        ````

### **2.2.2. 기타 Commit Types (주로 `PATCH` 또는 버전 변경 없음):**

- `docs`: 문서 변경.
    - 예시: `docs(Button): add examples for 'variant' prop`
- `style`: 코드 스타일 변경 (로직 변경 없음).
    - 예시: `style(Input): apply Prettier formatting`
- `refactor`: 기능 변경 없는 코드 리팩토링.
    - 예시: `refactor(Dropdown): optimize internal state management`
- `test`: 테스트 코드 추가/수정.
    - 예시: `test(Checkbox): add tests for indeterminate state`
- `perf`: 성능 개선.
    - 예시: `perf(List): improve rendering performance for large datasets`
- `chore`: 빌드, 패키지 설정 등 유지보수 작업.
    - 예시: `chore: update ESLint configuration`

### **2.2.3. Scope (선택 사항):**

- 변경 범위를 명시 (주로 컴포넌트명). 예: `feat(Modal): ...`

### **2.2.4. Subject:**

- 현재 시제, 명령형, 소문자 시작, 마침표 없음. 50자 이내 권장.

## 2.3. Pull Request (PR)

- PR 템플릿 내용 충실히 작성 (변경 사항, 테스트, 관련 이슈).
- 리뷰어 2명 이상 `approve` 필요.
- 병합 방식: **Squash and merge** (커밋 히스토리 깔끔하게 유지).

# 3. 코딩 스타일

---

## 3.1. 모듈 (Import & Export)

- **절대 경로 사용**: 2-depth 이상 상대 경로 대신 `tsconfig.json`의 `paths` 활용.
    ```tsx
    // Good
    import { Button } from '@components/button';
    ```
- **외부 패키지 Namespace**: `as` 키워드로 명확한 네임스페이스 사용.
    ```tsx
    import * as RadixCheckbox from '@radix-ui/react-checkbox';
    ```
- **Named Exports 지향**: `default export` 보다 `named export` 사용.
    - 컴파운드 컴포넌트 export 방식은 [6.2.1. Export 방식](https://www.notion.so/1e74e6997fb0803794e2e0bb33ca4b74?pvs=21) 참조
    ```tsx
    export const MyComponent = () => {
        /* ... */
    };
    export const utilityFunction = () => {
        /* ... */
    };
    ```
- **Props 타입 Export**: 컴포넌트명 포함.
    - 컴파운드 컴포넌트 타입 그룹화는 [6.2.2. 타입 그룹화](https://www.notion.so/1e74e6997fb0803794e2e0bb33ca4b74?pvs=21) 참조
    ```tsx
    export type ButtonProps = {
        /* ... */
    };
    ```

## 3.2. 네이밍 컨벤션

- **`camelCase`**: 변수, 함수 (예: `userName`, `calculatePrice`)
- **`PascalCase`**: 클래스, 인터페이스, 타입, Enum (예: `UserProfile`, `ColorPalette`)
- **`CONSTANT_CASE`**: 상수 (예: `MAX_USERS`, `API_URL`)
- **`kebab-case`**: 파일, 디렉터리명 (예: `user-profile.tsx`)

## 3.3. 문자열, 공백, 세미콜론

- **문자열**: 템플릿 리터럴 ( ```` ) 우선 사용. 단순 문자열은 작은따옴표 (`'`).
- **들여쓰기**: 스페이스 4칸.
- **세미콜론**: 문장 끝에 항상 사용.
- prettierc (Github link)

# 4. TypeScript

---

## 4.1. React 컴포넌트 Props & 타입

- **`React.FC` 사용 지양**: 화살표 함수로 컴포넌트 정의, Props 타입 명시.

    ```tsx
    type MyComponentProps = {
        title: string;
        isVisible?: boolean;
    };

    const MyComponent = ({ title, isVisible = true }: MyComponentProps) => {
        // ...
    };
    ```

## 4.2. Type vs. Interface

- **`interface`**: 컴포넌트 Props, 객체 구조 정의 시. `extends` 가능.
- **`type`**: Union, Intersection 등 복합 타입, 유틸리티 타입 정의 시.

    ```tsx
    // Props 정의
    export interface ModalProps {
        isOpen: boolean;
        onClose: () => void;
    }

    // 복합 타입
    export type AlignVariant = 'start' | 'center' | 'end';
    ```

## 4.3. Null & Undefined

- **`undefined`**: "아직 할당되지 않음" 또는 "존재하지 않는 속성" 의미로 일관되게 사용.
- **`null`**: 외부 API 연동 등 제한적 상황 외 사용 지양.
- Optional Chaining (`?.`), Nullish Coalescing (`??`) 적극 활용.

## 4.4. 배열 타입

- `T[]` 형태 사용. (예: `string[]`, `User[]`)

## 4.5. Enum

- 이름 및 멤버: `PascalCase`.
- **대안**: `as const` 활용 객체 (Tree-shaking 유리, 명확한 값).

    ```tsx
    // Enum
    enum Status {
        Pending,
        Success,
        Failed,
    }

    // as const (권장)
    export const AlertVariant = {
        Info: 'info',
        Warning: 'warning',
        Error: 'error',
    } as const;
    export type AlertVariantType = (typeof AlertVariant)[keyof typeof AlertVariant];
    ```

## 4.6. 상수 (Constants)

- `CONSTANT_CASE` 사용. `as const`로 불변성/타입 추론 강화.
    ```tsx
    const REQUEST_TIMEOUT = 5000;
    const Z_INDEX = { MODAL: 1000, TOOLTIP: 1010 } as const;
    ```

# 5. 파일 & 폴더 구조

---

## 5.1. 네이밍 (파일명, 디렉터리명)

- 모든 파일/디렉터리: `kebab-case` (예: `button-group.tsx`, `validation-utils.ts`).

## 5.2. 단수형 vs. 복수형

- **컴포넌트**: 단수형 (예: `Button.tsx`). 목록 형태는 복수형 가능 (예: `Tabs.tsx`).
- **유틸리티/훅 모음**: 복수형 디렉터리 (예: `hooks/`, `utils/`).

## 5.3. 컴포넌트 폴더 (Colocation)

관련 코드(구현, 스타일, 스토리, 테스트)는 해당 컴포넌트 폴더 내 함께 위치.

**구조 예시 (`text-input` 컴포넌트):**

```bash
src/
└── components/
└── text-input/
  ├── index.ts                 # Entry point (exports)
  ├── text-input.tsx           # Component implementation
  ├── text-input.css.ts        # Vanilla Extract styles
  ├── text-input.stories.tsx   # Storybook stories
  └── text-input.test.tsx      # Unit/Integration tests
```

### **5.3.1 서브컴포넌트 전략**

- 합성 컴포넌트의 서브 컴포넌트는 주 컴포넌트 파일 내 정의 후 `Root.Sub` 형태로 export.

### **5.3.2. 엔트리포인트 전략**

- **개별 컴포넌트 엔트리포인트 (`src/components/[component]/index.ts`)**:
    - **목적**: 각 컴포넌트 모듈의 공개 API를 정의합니다.
    - **Export 규칙**:
        - 컴포넌트 관련 모든 named export (함수, 상수, 실제 컴포넌트 등)는 해당 컴포넌트 이름의 네임스페이스로 묶어 export 합니다.
            ```tsx
            // 예시: src/components/button/index.ts
            export * as Button from './button'; // ./button.tsx (또는 .ts) 파일의 모든 것을 Button 네임스페이스로 export
            ```
        - 컴포넌트 관련 모든 타입은 직접 export 합니다.
            ```tsx
            // 예시: src/components/button/index.ts
            export type * from './button'; // ./button.tsx (또는 .ts) 파일의 모든 타입을 export
            ```
    - **결과**: 사용자는 `Button.Root`, `Button.Icon` 등으로 컴포넌트 요소에 접근하고, `ButtonRootProps` 등으로 타입에 접근합니다.
- **컴포넌트 그룹 엔트리포인트 (`src/components/index.ts`)**:
    - 이 파일은 더 이상 사용하지 않으며, 프로젝트에 존재한다면 삭제합니다.
- **라이브러리 루트 엔트리포인트 (`src/index.ts`)**:
    - **목적**: 라이브러리 전체의 공개 API를 단일 진입점을 통해 제공합니다.
    - **Export 규칙**: 각 개별 컴포넌트의 엔트리포인트(`src/components/[component]/index.ts`)에서 export 된 모든 것(네임스페이스 및 타입)을 그대로 re-export 합니다.
        ```tsx
        // 예시: src/index.ts
        export * from './components/button'; // Button 네임스페이스 및 Button 관련 타입들이 export됨
        export * from './components/card';
        // ... other components
        ```
- **라이브러리 사용 예시**:

    ```tsx
    import { Button, Card } from '@vapor-ui/core';
    // Button과 Card는 각각 네임스페이스(모듈 객체)
    import type { ButtonProps, CardContentProps } from '@vapor-ui/core';

    function App() {
        return (
            <>
                <Button.Root variant="primary">
                    <Button.Label>클릭하세요</Button.Label>
                </Button.Root>

                <Card.Root>
                    <Card.Header>제목</Card.Header>
                    <Card.Content>내용</Card.Content>
                </Card.Root>
            </>
        );
    }
    ```

# 6. React 컴포넌트

---

## 6.1. 접근성 (WAI-ARIA)

- WAI-ARIA 패턴 준수. Radix UI Primitives 기반 개발 권장.

## 6.2. Compound Pattern

- 하위 요소 조합으로 유연성 증대. (예: `Menu.Root`, `Menu.Item`, `Menu.Trigger`)

## 6.3. 제어/비제어 컴포넌트

- 기본 비제어, 필요시 제어 패턴(`value`/`onChange`) 지원.

## 6.4. Trigger 패턴 (Overlay)

- Overlay형 컴포넌트는 `{Component}.Trigger`와 `{Component}.Content` 명확히 구분.

## 6.5. Props 최소화 & 타입

- `React.ComponentPropsWithoutRef<ElementType>` 활용. 컴포넌트 고유 Props만 명시.

## 6.6. 아이콘 처리

- `children` 주입 또는 명명된 아이콘 컴포넌트 직접 사용 권장.

## 6.7. Ref 전달

- `React.forwardRef` 사용, `ref` 전달 지원.

## 6.8. asChild 패턴

- `asChild={true}` 시 자식 요소에 props 병합 렌더링. 기본값 `false`.

## 6.9. ARIA Props

- ARIA 표준 속성(`aria-*`) 명칭 그대로 사용. 내부 관리 ARIA는 추상화된 Props로 제공.

## 6.10. 개발자 전용 Props

- 개발 편의성 Props(예: `Button`의 `stretch`)는 Storybook 등에 명확히 문서화.

## 6.11. 입력 컴포넌트

- HTML `<input>` 타입별 독립 컴포넌트 제공 (예: `TextInput`, `Checkbox`).

## 6.12. Props 처리

### **6.12.1. Props 병합 (Merge)**

### **6.12.2. Props 타입 정의**

- **일반 HTML 요소 Props**:
    - `React.ComponentPropsWithoutRef<ElementType>` 또는
    - `React.ComponentPropsWithRef<ElementType>`를 활용하여 HTML 표준 속성을 지원합니다.
- **Radix UI 컴포넌트 Props**:

    - 개별 Props 타입을 일일이 import 하는 대신, `React.ComponentPropsWithoutRef<typeof RadixComponent>`와 같은 유틸리티 타입을 사용하여 추출합니다.
    - 이는 타입 선언을 간결하게 하고, Radix UI 업데이트 시 Props 변경에 유연하게 대응할 수 있도록 합니다.
    - **예시 (`Dialog` 컴포넌트에서 Radix Props 사용):**

        ```tsx
        import type { ComponentPropsWithoutRef } from 'react';

        import { Root as RadixDialogRoot } from '@radix-ui/react-dialog';

        // Radix Dialog의 Root 컴포넌트 Props 타입을 가져옴
        type RadixDialogRootProps = ComponentPropsWithoutRef<typeof RadixDialogRoot>;

        interface CustomDialogRootProps extends RadixDialogRootProps {
            // Vapor Design System에서 추가하는 custom props
            customFeature?: boolean;
        }

        const DialogRoot = forwardRef<
            React.ElementRef<typeof RadixDialogRoot>,
            CustomDialogRootProps
        >(({ customFeature, ...radixProps }, ref) => {
            return <RadixDialogRoot ref={ref} {...radixProps} />;
        });
        ```

### **6.12.3. `defaultProps` 사용 지양**

- 클래스형 컴포넌트의 `defaultProps` 또는 함수형 컴포넌트의 `Component.defaultProps = { ... }` 방식은 사용하지 않습니다.
- **대안**: 함수 매개변수의 기본값 문법을 사용합니다.

    ```elm
    interface MyComponentProps {
      title?: string;
      count?: number;
    }

    const MyComponent = ({ title = 'Default Title', count = 0 }: MyComponentProps) => {
      // ...
    };

    ```

## 6.13. 컴파운드 컴포넌트 (Compound Pattern)

여러 하위 요소를 조합하여 유연한 UI 구성을 지원하는 Compound Pattern을 적극 활용합니다.

### **6.13.1. Export 방식**

컴파운드 컴포넌트 사용 시 `Dialog.Trigger`와 같이 직관적인 API를 제공하기 위해, 주 컴포넌트 객체에 하위 컴포넌트들을 할당하여 export 합니다.

1. **컴포넌트 구현 파일 (`[componentName].tsx`)**:

    - 주 컴포넌트(Root)와 하위 컴포넌트들을 각각 선언합니다 (선언부에서 `export` 사용 안 함).
    - 주 컴포넌트 변수에 `Object.assign`을 사용하여 하위 컴포넌트들을 속성으로 할당합니다.
    - 최종적으로 할당된 주 컴포넌트 객체와 필요한 타입들을 `export` 합니다.

    ```tsx
    // 예시: src/components/dialog/dialog.tsx
    import React, { forwardRef } from "react";
    // ... 기타 import ...

    // 1. Root 및 서브 컴포넌트들 선언 (export 키워드 없이)
    const DialogRoot = forwardRef<HTMLDivElement, DialogRootProps>(
      (props, ref) => {
        /* ... */
      }
    );
    DialogRoot.displayName = "Dialog.Root"; // displayName 설정 권장

    const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
      (props, ref) => {
        /* ... */
      }
    );
    DialogTrigger.displayName = "Dialog.Trigger";

    const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
      (props, ref) => {
        /* ... */
      }
    );
    DialogContent.displayName = "Dialog.Content";

    // ... 기타 Portal, Overlay, Title, Description, Close 등 선언 ...

    // 2. Object.assign으로 주 컴포넌트에 하위 컴포넌트 할당
    export const Dialog = Object.assign(DialogRoot, {
      Trigger: DialogTrigger,
      Content: DialogContent,
      // Portal: DialogPortal,
      // Overlay: DialogOverlay,
      // Title: DialogTitle,
      // Description: DialogDescription,
      // Close: DialogClose,
    });

    // 3. 관련 타입들 export
    export type {
      DialogRootProps,
      DialogTriggerProps,
      DialogContentProps,
      // ... 기타 타입들
    };
    ```

2. **개별 컴포넌트 엔트리포인트 (`[componentName]/index.ts`)**: 이전 [3.1.1. 엔트리포인트 전략](https://www.notion.so/1e74e6997fb0803794e2e0bb33ca4b74?pvs=21)을 따릅니다.

    ```tsx
    // 예시: src/components/dialog/index.ts
    export * from './dialog'; // dialog.tsx에서 export한 Dialog 객체 및 모든 타입이 export 됨
    ```

3. **사용**:

    ```tsx
    import { Dialog } from '@vapor-ui/core';

    <Dialog>
        {' '}
        {/* Dialog 자체가 Dialog.Root와 동일하게 동작 */}
        <Dialog.Trigger>...</Dialog.Trigger>
        <Dialog.Content>...</Dialog.Content>
    </Dialog>;
    ```

### **6.13.2. 타입 그룹화**

- 컴파운드 컴포넌트의 여러 Props 타입을 그룹화하여 관리할 수 있습니다.
- 다음 두 가지 방식 중 프로젝트 일관성을 고려하여 선택합니다.

1. **Namespace 사용**:

    ```tsx
    // 예시: src/components/dialog/dialog.tsx (타입 정의 부분)

    export namespace DialogComponentProps {
        // 'DialogProps' 보다는 충돌 방지를 위해 'DialogComponentProps' 등 사용
        export type Root = DialogRootProps;
        export type Trigger = DialogTriggerProps;
        export type Content = DialogContentProps;
    }

    // 사용 예시
    // import type { DialogComponentProps } from '@vapor-ui/core';
    // type MyDialogRootProps = DialogComponentProps.Root;
    ```

2. **객체 타입 사용 (권장)**:

    ```tsx
    // 예시: src/components/dialog/dialog.tsx (타입 정의 부분)
    // 개별 Props 타입은 이미 export DialogRootProps 등으로 export 되고 있음
    // 필요하다면, 다음과 같이 그룹화된 타입을 추가로 export 가능
    export type AllDialogProps = {
        Root: DialogRootProps;
        Trigger: DialogTriggerProps;
        Content: DialogContentProps;
    };

    // 사용 예시
    // import type { AllDialogProps } from '@vapor-ui/core';
    // type MyDialogTriggerProps = AllDialogProps['Trigger'];
    ```

    - 일반적으로는 개별 Props 타입을 직접 import (`import type { DialogRootProps }`) 하는 것이 더 명시적이고 간결할 수 있습니다.
    - 타입 그룹화는 매우 많은 하위 컴포넌트와 Props가 있을 경우 고려합니다.

# 7. 스타일링 (Vanilla Extract)

---

## 7.1. `style` 함수 (기본)

- 정적 스타일 규칙 정의.

    ```tsx
    // button.css.ts
    import { vars } from '../theme.css';
    import { style } from '@vanilla-extract/css';

    // 예시: 테마 변수 파일

    export const container = style({
        padding: vars.spacing.large,
        backgroundColor: vars.colors.backgroundPrimary,
    });
    ```

## 7.2. `recipe` 함수 (Variants)

- 컴포넌트 상태/형태별 스타일 정의. `base`, `variants`, `defaultVariants` (필수), `compoundVariants` 활용.

    ```tsx
    // button.css.ts
    import { vars } from '../theme.css';
    import { RecipeVariants, recipe } from '@vanilla-extract/recipes';

    export const buttonRecipe = recipe({
        base: {
            /* 기본 스타일 ... */
            borderRadius: vars.borderRadius.medium,
            fontWeight: 'bold',
        },
        variants: {
            variant: {
                primary: {
                    backgroundColor: vars.colors.primary,
                    color: vars.colors.white,
                },
                secondary: {
                    backgroundColor: vars.colors.secondary,
                    color: vars.colors.text,
                },
            },
            size: {
                small: { padding: `${vars.spacing.small} ${vars.spacing.medium}` },
                large: { padding: `${vars.spacing.medium} ${vars.spacing.large}` },
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'large',
        },
    });
    export type ButtonVariants = RecipeVariants<typeof buttonRecipe>;
    ```

### **7.2.1. Variants 타입 선언**

- Vanilla Extract의 `recipe` 함수로 생성된 여러 Variants 타입을 단일 타입으로 병합하여 사용합니다.
- **방식**: 여러 `recipe`의 `typeof styles.xxx`를 Union 타입으로 묶어 `MergeRecipeVariants`와 같은 유틸리티 타입을 사용합니다. (해당 유틸리티 타입은 프로젝트 내에 정의되어 있어야 합니다.)

    ```tsx
    // 예시: ~/libs/recipe.ts 또는 프로젝트 공통 유틸리티
    import type { RecipeVariants as OriginalRecipeVariants } from '@vanilla-extract/recipes';

    // 여러 RecipeVariants 타입을 병합하기 위한 유틸리티 타입
    // 주의: 이 유틸리티 타입은 단순 예시이며, 실제 사용 시에는
    // 복잡한 RecipeVariants 구조를 올바르게 병합하도록 견고하게 작성해야 합니다.
    // 간단한 경우, 각 recipe의 variants 속성들만 Pick & Intersect 하는 방식도 고려할 수 있습니다.
    // 현재로서는 각 컴포넌트가 자신의 RecipeVariants를 직접 사용하거나,
    // 필요한 경우 props 레벨에서 개별적으로 합치는 것이 더 안전할 수 있습니다.
    // 아래는 개념적 예시입니다.
    export type MergeRecipeVariants<T extends ReadonlyArray<(...args: any) => any>> = T extends [
        infer Head,
        ...infer Tail,
    ]
        ? Head extends (...args: any) => infer R
            ? R extends { variants: infer V }
                ? V &
                      (Tail extends ReadonlyArray<(...args: any) => any>
                          ? MergeRecipeVariants<Tail>
                          : {})
                : {}
            : {}
        : {};

    // 또는 더 간단한 접근 (Recipe의 variants 객체 타입을 직접 받는 경우)
    // export type MergeRecipeVariantObjects<T> = T extends { variants: infer V } ? V : {};
    // type CombinedVariants = MergeRecipeVariantObjects<typeof styles.root> & MergeRecipeVariantObjects<typeof styles.control>;
    ```

- **컴포넌트 내 사용 예시 (`Checkbox` 컴포넌트):**

    ```tsx
    // checkbox.types.ts 또는 checkbox.tsx
    // import type { MergeRecipeVariants } from '~/libs/recipe'; // 유틸리티 타입 경로
    import * as styles from './checkbox.css';
    // styles.root, styles.control, styles.label 등이 recipe로 정의됨 가정
    import type { RecipeVariants as OriginalRecipeVariants } from '@vanilla-extract/recipes';

    // Vanilla Extract 원본 타입

    // 개별 Variants 타입 정의 (기존 방식도 유효)
    type CheckboxRootVariants = OriginalRecipeVariants<typeof styles.rootRecipe>; // styles.rootRecipe 가정
    type CheckboxControlVariants = OriginalRecipeVariants<typeof styles.controlRecipe>;
    type CheckboxLabelVariants = OriginalRecipeVariants<typeof styles.labelRecipe>;

    // 유틸리티 타입을 사용한 병합 시도 (주의: 유틸리티 타입의 정확성에 따라 결과가 달라짐)
    // type CheckboxCombinedVariants = MergeRecipeVariants<[
    //     typeof styles.rootRecipe,
    //     typeof styles.controlRecipe,
    //     typeof styles.labelRecipe
    // ]>;

    // 컴포넌트 Props에서 필요한 Variants만 선택적으로 조합하여 사용
    interface CheckboxProps extends CheckboxRootVariants, CheckboxLabelVariants {
        // ... other props
        // 예: control의 variant는 내부적으로 결정되거나 다른 prop으로 받을 수 있음
    }
    ```

- **고려 사항**:
    - `MergeRecipeVariants`와 같은 복잡한 유틸리티 타입은 유지보수가 어려울 수 있으며, 타입 추론에 한계가 있을 수 있습니다.
    - 스토리북의 `argTypes` 자동 추출 도구(예: `react-docgen-typescript`)와의 호환성 문제가 발생할 수 있습니다. 복잡한 유틸리티 타입은 `argTypes`가 정확히 추론되지 않을 가능성이 있습니다.
    - **권장**: 매우 많은 `recipe`를 병합해야 하는 특수한 경우가 아니라면, 각 `recipe`의 Variants 타입을 개별적으로 사용하거나, 컴포넌트 Props 레벨에서 필요한 Variants 타입들을 명시적으로 `&` (Intersection) 하는 것이 더 명확하고 안전할 수 있습니다.

## 7.3. CSS 변수 (Variables)

- 디자인 토큰(색상, 폰트 등)은 CSS 변수로 정의, `vars` 객체 통해 참조. (하드코딩 지양)

## 7.4. 반응형 디자인

- `style`, `recipe` 함수 내 `@media` 사용. 모바일 우선 권장.
- Vanilla Extract `sprinkles` 패키지 활용 고려.

## 7.5. 클래스명 관리 (`classnames`)

- 동적 클래스명 조합 시 `classnames` (또는 `clsx`) 사용. 약어 `cn` 통일.

    ```tsx
    import cn from 'classnames';

    // 사용: className={cn(buttonRecipe({ variant, size }), customClassName)}
    ```

# 8. 테스팅

---

# 9. 문서화

---

## 9.1 Storybook

- `Docs`: storybook `autodocs` 로 자동 생성됨
- `Test Bed`: 시각적 회귀 테스트 용도

## 9.2 Vapor Docs

- `use case` : 서브컴포넌트 컴포넌트들의 조합 / 특정 variant의 나열
