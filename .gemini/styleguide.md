# 0. 코드 답변 방식

- 코드 리뷰 답변은 한국어로 제공한다.

# 1. 개발 환경

---

- **Package Manager**: PNPM (workspace 기반 모노레포)
- **Node.js**: v18+
- **UI Primitives**: `@base-ui/react` (Accessible unstyled components)
- **Styling**: Vanilla Extract (`@vanilla-extract/css`, `@vanilla-extract/recipes`)
- **Testing**: Vitest + React Testing Library + vitest-axe
- **Storybook**: Storybook 9 (`@storybook/react-vite`)
- **Linting & Formatting**: ESLint, Prettier

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

- **절대 경로 사용**: 같은 디렉터리 내 파일은 `./` 상대 경로 허용. 그 외 모든 경우 `tsconfig.json`의 `paths`에 정의된 `~/*` 별칭 사용.

    ```tsx
    // Good - 같은 디렉터리 내 sibling import
    import * as styles from './button.css';
    import { buttonVariants } from './button.variants';

    // Good - 다른 디렉터리는 절대 경로
    import { resolveStyles } from '~/utils/resolve-styles';
    import { vars } from '~/styles/themes.css';
    import { createContext } from '~/libs/create-context';
    import type { VComponentProps } from '~/utils/types';

    // Bad - 상위 디렉터리 접근 시 상대 경로
    import { resolveStyles } from '../../../utils/resolve-styles';
    import { shared } from '../shared';
    ```

- **외부 패키지 Import**: Base UI 컴포넌트는 개별 엔트리포인트에서 named import. namespace import는 스타일 파일에 사용.

    ```tsx
    // Base UI 컴포넌트
    import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
    import { Dialog as BaseDialog } from '@base-ui/react/dialog';
    import { useRender } from '@base-ui/react/use-render';

    // 스타일 파일
    import * as styles from './button.css';
    ```

- **Named Exports 지향**: `default export` 보다 `named export` 사용.
    ```tsx
    export const MyComponent = () => {
        /* ... */
    };
    export const utilityFunction = () => {
        /* ... */
    };
    ```
- **Props 타입 Export**: namespace를 통해 export.
    ```tsx
    export namespace Button {
        export interface Props extends ButtonPrimitiveProps, ButtonVariants {}
    }
    ```

## 3.2. 네이밍 컨벤션

- **`camelCase`**: 변수, 함수 (예: `userName`, `calculatePrice`)
- **`PascalCase`**: 컴포넌트, 인터페이스, 타입, Enum (예: `UserProfile`, `ColorPalette`)
- **`CONSTANT_CASE`**: 상수 (예: `MAX_USERS`, `API_URL`)
- **`kebab-case`**: 파일, 디렉터리명 (예: `text-input.tsx`, `button.css.ts`)

## 3.3. 문자열, 공백, 세미콜론

- **문자열**: 템플릿 리터럴 ( `` ` `` ) 우선 사용. 단순 문자열은 작은따옴표 (`'`).
- **들여쓰기**: 스페이스 4칸.
- **세미콜론**: 문장 끝에 항상 사용.

## 3.4. 조건문 및 함수 구조

- **Early Return**: 중첩 깊이가 3 depth 이상인 경우 early return 패턴을 적용하여 가독성을 향상시킵니다.

    ```tsx
    // Bad - 3 depth 이상 중첩
    function processUser(user: User) {
        if (user) {
            if (user.isActive) {
                if (user.permissions.canEdit) {
                    return editUser(user);
                }
            }
        }
        return null;
    }

    // Good - Early return 적용
    function processUser(user: User) {
        if (!user) return null;
        if (!user.isActive) return null;
        if (!user.permissions.canEdit) return null;

        return editUser(user);
    }
    ```

# 4. TypeScript

---

## 4.1. React 컴포넌트 Props & 타입

- **`React.FC` 사용 지양**: `forwardRef`와 화살표 함수로 컴포넌트 정의.
- **Props는 namespace 내부에 `interface`로 정의**: 컴포넌트와 동일한 이름의 namespace 안에 `Props` interface를 선언.
- **기본 Props 타입**: `VComponentProps<ElementType>`을 기본으로 사용. 이는 `Sprinkles`(레이아웃 style props)와 `useRender.ComponentProps`를 조합한 타입.

    ```tsx
    import { forwardRef } from 'react';

    import type { VComponentProps } from '~/utils/types';

    // 컴포넌트 정의
    export const Button = forwardRef<HTMLButtonElement, Button.Props>((props, ref) => {
        // ...
    });
    Button.displayName = 'Button';

    // Props는 컴포넌트와 동일한 이름의 namespace 안에 정의
    export namespace Button {
        type ButtonPrimitiveProps = VComponentProps<'button'>;

        export interface Props extends ButtonPrimitiveProps, ButtonVariants {}
    }
    ```

- **Base UI 기반 컴포넌트의 Props 타입**:

    ```tsx
    import { Dialog as BaseDialog } from '@base-ui/react/dialog';

    export namespace DialogTrigger {
        export interface Props extends VComponentProps<typeof BaseDialog.Trigger> {}
    }
    ```

## 4.2. Type vs. Interface

- **`interface`**: 컴포넌트 Props 정의 시 (namespace 내부). `extends` 가능.
- **`type`**: 내부 헬퍼 타입, Union, Intersection 등 복합 타입 정의 시.

    ```tsx
    // namespace 내부 Props 정의 (interface)
    export namespace CheckboxRoot {
        type RootPrimitiveProps = VComponentProps<typeof BaseCheckbox.Root>;
        export interface Props extends RootPrimitiveProps, CheckboxSharedProps {}
    }

    // 내부 헬퍼 타입 (type)
    type CheckboxVariants = RootVariants;
    type CheckboxSharedProps = CheckboxVariants & Pick<BaseCheckbox.Root.Props, 'indeterminate'>;

    // Union 타입
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

- 모든 파일/디렉터리: `kebab-case` (예: `button.tsx`, `text-input.tsx`, `button.css.ts`).

## 5.2. 단수형 vs. 복수형

- **컴포넌트**: 단수형 (예: `button.tsx`). 목록 형태는 복수형 가능 (예: `tabs.tsx`).
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

**Compound 컴포넌트 구조 예시 (`dialog` 컴포넌트):**

```bash
src/
└── components/
    └── dialog/
        ├── index.ts                 # export * as Dialog from './index.parts'
        ├── index.parts.ts           # Sub-component re-exports (Root, Trigger, ...)
        ├── dialog.tsx               # All sub-components implementation
        ├── dialog.css.ts            # Vanilla Extract styles
        ├── dialog.stories.tsx       # Storybook stories
        └── dialog.test.tsx          # Unit/Integration tests
```

### **5.3.1. 엔트리포인트 전략**

#### 단일 컴포넌트 (`index.ts`)

Compound 패턴이 아닌 단일 컴포넌트는 직접 re-export:

```tsx
// src/components/button/index.ts
export * from './button';
```

#### Compound 컴포넌트 (`index.ts` + `index.parts.ts`)

Compound 컴포넌트는 `index.parts.ts`를 통해 namespace로 묶어 export:

```tsx
// src/components/dialog/index.parts.ts
export {
    DialogRoot as Root,
    DialogTrigger as Trigger,
    DialogPopup as Popup,
    DialogClose as Close,
    DialogTitle as Title,
    DialogDescription as Description,
    DialogHeader as Header,
    DialogBody as Body,
    DialogFooter as Footer,
} from './dialog';

// src/components/dialog/index.ts
export * as Dialog from './index.parts';
```

#### 라이브러리 루트 엔트리포인트 (`src/index.ts`)

각 개별 컴포넌트의 엔트리포인트에서 export된 것을 그대로 re-export:

```tsx
// src/index.ts
export * from './components/button';
export * from './components/dialog';
export * from './components/checkbox';
// ...
```

#### 라이브러리 사용 예시

```tsx
import { Button, Dialog, Checkbox } from '@vapor-ui/core';
// 또는 개별 import
import { Button } from '@vapor-ui/core/button';

function App() {
    return (
        <>
            {/* 단일 컴포넌트 - 직접 사용 */}
            <Button colorPalette="primary" variant="fill">
                클릭하세요
            </Button>

            {/* Compound 컴포넌트 - namespace 접근 */}
            <Dialog.Root>
                <Dialog.Trigger>열기</Dialog.Trigger>
                <Dialog.Popup>
                    <Dialog.Header>
                        <Dialog.Title>제목</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>내용</Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close>닫기</Dialog.Close>
                    </Dialog.Footer>
                </Dialog.Popup>
            </Dialog.Root>

            {/* Compound 컴포넌트 - Checkbox */}
            <Checkbox.Root>
                <Checkbox.IndicatorPrimitive />
            </Checkbox.Root>
        </>
    );
}
```

# 6. React 컴포넌트

---

## 6.1. 접근성 (WAI-ARIA)

- WAI-ARIA 패턴 준수. `@base-ui/react` Primitives 기반 개발.

## 6.2. Compound Pattern

- 하위 요소 조합으로 유연성 증대. (예: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Popup`)
- Compound 컴포넌트의 서브 컴포넌트는 같은 파일 내에서 정의한 뒤 `index.parts.ts`를 통해 export.

## 6.3. 제어/비제어 컴포넌트

- 기본 비제어, 필요시 제어 패턴(`value`/`onChange`) 지원.

## 6.4. Trigger 패턴 (Overlay)

- Overlay형 컴포넌트는 `{Component}.Trigger`와 `{Component}.Popup` 명확히 구분.

## 6.5. Props 최소화 & 타입

- `VComponentProps<ElementType>`를 기본 Props 타입으로 사용. HTML 표준 속성 + Sprinkles(레이아웃) Props 자동 지원.
- Base UI 컴포넌트 래핑 시 `VComponentProps<typeof BaseComponent>` 사용.

    ```tsx
    // HTML 요소 기반
    export namespace Box {
        export interface Props extends VComponentProps<'div'> {}
    }

    // Base UI 컴포넌트 기반
    export namespace DialogTrigger {
        export interface Props extends VComponentProps<typeof BaseDialog.Trigger> {}
    }
    ```

## 6.6. 아이콘 처리

- `@vapor-ui/icons` 패키지에서 아이콘 컴포넌트 import.
- `children`으로 주입하거나, 컴포넌트 내부에서 직접 사용.

    ```tsx
    import { ChevronDownOutlineIcon } from '@vapor-ui/icons';
    ```

## 6.7. Ref 전달

- `forwardRef`를 사용하여 `ref` 전달. HTML 요소 타입을 첫 번째 제네릭으로 명시.

    ```tsx
    export const Button = forwardRef<HTMLButtonElement, Button.Props>((props, ref) => {
        // ...
    });
    ```

## 6.8. render prop 패턴 (Polymorphic)

- `@base-ui/react`의 `render` prop을 사용한 다형성(polymorphic) 렌더링. `asChild` 패턴이 아님.
- `render` prop에 다른 HTML 요소나 React 컴포넌트를 전달하여 렌더링 요소 변경 가능.

    ```tsx
    // a 태그로 렌더링
    <Button render={<a href="/link">Link Button</a>} />

    // 기본 렌더링 (button 태그)
    <Button>Click me</Button>
    ```

## 6.9. ARIA Props

- ARIA 표준 속성(`aria-*`) 명칭 그대로 사용. 내부 관리 ARIA는 추상화된 Props로 제공.

## 6.10. 입력 컴포넌트

- HTML `<input>` 타입별 독립 컴포넌트 제공 (예: `TextInput`, `Checkbox`).

## 6.11. 함수 매개변수

- **매개변수 개수**: 함수 매개변수가 3개 이상인 경우 객체 형태로 전달합니다.

    ```tsx
    // Bad - 3개 이상의 개별 매개변수
    function createUser(name: string, email: string, age: number, department: string) {
        // ...
    }

    // Good - 객체로 그룹화
    interface CreateUserParams {
        name: string;
        email: string;
        age: number;
        department: string;
    }

    function createUser({ name, email, age, department }: CreateUserParams) {
        // ...
    }
    ```

## 6.12. Props 처리

### **6.12.1. resolveStyles 유틸리티**

모든 컴포넌트에서 `resolveStyles`를 사용하여 Sprinkles(레이아웃) Props를 분리:

```tsx
export const Button = forwardRef<HTMLButtonElement, Button.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    // componentProps에서 레이아웃 관련 props가 제거되고 className/style로 변환됨
});
```

### **6.12.2. createSplitProps 유틸리티**

Variant props를 나머지 props에서 분리:

```tsx
const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(componentProps, [
    'colorPalette',
    'size',
    'variant',
]);
```

### **6.12.3. useRender 패턴**

`@base-ui/react`의 `useRender`를 사용하여 렌더링:

```tsx
return useRender({
    ref,
    state: { disabled },
    render: render || <button />,
    props: {
        className: clsx(styles.root(variantsProps), className),
        ...otherProps,
    },
});
```

### **6.12.4. `defaultProps` 사용 지양**

- 함수 매개변수의 기본값 문법을 사용.

    ```tsx
    const DialogRoot = ({
        size,
        closeOnClickOverlay = true,
        children,
        ...props
    }: DialogRoot.Props) => {
        // ...
    };
    ```

## 6.13. Compound 컴포넌트 구현

### **6.13.1. 구현 파일 (`[componentName].tsx`)**

서브 컴포넌트를 하나의 파일에서 선언하고 각각 export. `Object.assign` 사용하지 않음.

```tsx
// dialog.tsx

// Context 생성
const [DialogProvider, useDialogContext] = createContext<DialogContext>({
    name: 'Dialog',
    hookName: 'useDialogContext',
    providerName: 'DialogProvider',
});

// 서브 컴포넌트들 각각 export
export const DialogRoot = ({ size, children, ...props }: DialogRoot.Props) => {
    return (
        <DialogProvider value={{ size }}>
            <BaseDialog.Root {...props}>{children}</BaseDialog.Root>
        </DialogProvider>
    );
};

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTrigger.Props>((props, ref) => {
    const componentProps = resolveStyles(props);
    return <BaseDialog.Trigger ref={ref} {...componentProps} />;
});
DialogTrigger.displayName = 'Dialog.Trigger';

// ... 기타 서브 컴포넌트 ...

// namespace로 Props 타입 정의
export namespace DialogRoot {
    export interface Props extends /* ... */ {}
}
export namespace DialogTrigger {
    export interface Props extends VComponentProps<typeof BaseDialog.Trigger> {}
}
```

### **6.13.2. Re-export 파일 (`index.parts.ts`)**

서브 컴포넌트들을 짧은 이름으로 re-export:

```tsx
// dialog/index.parts.ts
export {
    DialogRoot as Root,
    DialogTrigger as Trigger,
    DialogPopup as Popup,
    DialogClose as Close,
    // ...
} from './dialog';
```

### **6.13.3. 엔트리포인트 (`index.ts`)**

namespace로 묶어 export:

```tsx
// dialog/index.ts
export * as Dialog from './index.parts';
```

### **6.13.4. displayName 설정**

모든 서브 컴포넌트에 `displayName`을 설정하되, `{ParentName}.{SubName}` 형식 사용:

```tsx
DialogRoot.displayName = 'Dialog.Root'; // (Root는 생략할 수도 있음)
DialogTrigger.displayName = 'Dialog.Trigger';
DialogPopup.displayName = 'Dialog.Popup';
```

## 6.14. Context 패턴

Compound 컴포넌트 간 상태 공유 시 `~/libs/create-context` 사용:

```tsx
import { createContext } from '~/libs/create-context';

const [CheckboxProvider, useCheckboxContext] = createContext<CheckboxSharedProps>({
    name: 'Checkbox',
    hookName: 'useCheckbox',
    providerName: 'CheckboxProvider',
});

// Provider에서 값 제공
return <CheckboxProvider value={{ size, indeterminate }}>{root}</CheckboxProvider>;

// 자식 컴포넌트에서 값 사용
const { size, indeterminate } = useCheckboxContext();
```

## 6.15. Data Attributes

`createDataAttributes` 유틸리티로 data 속성 생성:

```tsx
import { createDataAttributes } from '~/utils/data-attributes';

const dataAttrs = createDataAttributes({ invalid });
// invalid가 true이면 { 'data-invalid': '' } 생성
```

# 7. 스타일링 (Vanilla Extract)

---

## 7.1. `style` 함수 (기본)

- 정적 스타일 규칙 정의.

    ```tsx
    // dialog.css.ts
    import { style } from '@vanilla-extract/css';

    import { layerStyle } from '~/styles/mixins/layer-style.css';
    import { vars } from '~/styles/themes.css';

    export const overlay = style([
        layerStyle('components', {
            position: 'fixed',
            inset: 0,
            backgroundColor: vars.color.background.overlay,
        }),
    ]);
    ```

## 7.2. `recipe` 함수 (Variants)

- 컴포넌트 상태/형태별 스타일 정의. `base`, `variants`, `defaultVariants` 활용.
- `layerStyle()`, `interaction()`, `typography()` 등 스타일 믹스인 함수 활용.

    ```tsx
    // button.css.ts
    import { createVar } from '@vanilla-extract/css';
    import type { RecipeVariants } from '@vanilla-extract/recipes';
    import { recipe } from '@vanilla-extract/recipes';

    import { interaction } from '~/styles/mixins/interactions.css';
    import { layerStyle } from '~/styles/mixins/layer-style.css';
    import { typography } from '~/styles/mixins/typography.css';
    import { vars } from '~/styles/themes.css';

    const fg = createVar();
    const bg = createVar();

    export const root = recipe({
        base: [
            interaction(),
            layerStyle('components', {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: vars.size.borderRadius['300'],
            }),
        ],

        defaultVariants: { colorPalette: 'primary', size: 'md', variant: 'fill' },

        variants: {
            size: {
                sm: [
                    typography({ style: 'subtitle1' }),
                    layerStyle('components', {
                        gap: vars.size.space['050'],
                        paddingInline: vars.size.space['100'],
                        height: vars.size.dimension['300'],
                    }),
                ],
                md: [
                    /* ... */
                ],
                lg: [
                    /* ... */
                ],
                xl: [
                    /* ... */
                ],
            },
            colorPalette: {
                primary: layerStyle('components', {
                    vars: {
                        [fg]: vars.color.foreground.inverse,
                        [bg]: vars.color.background.primary[200],
                    },
                }),
                secondary: layerStyle('components', {
                    /* ... */
                }),
                // ...
            },
            variant: {
                fill: layerStyle('components', { backgroundColor: bg, color: fg }),
                outline: layerStyle('components', {
                    /* ... */
                }),
                ghost: layerStyle('components', {
                    /* ... */
                }),
            },
        },
    });

    export type ButtonVariants = NonNullable<RecipeVariants<typeof root>>;
    ```

### **7.2.1. Variants 타입 선언**

- `RecipeVariants<typeof recipeName>`으로 추출하고, `NonNullable`로 감싸서 사용.

    ```tsx
    import type { RecipeVariants } from '@vanilla-extract/recipes';

    export type ButtonVariants = NonNullable<RecipeVariants<typeof root>>;
    ```

- 컴포넌트 Props와 조합 시 namespace 내부에서 extends:

    ```tsx
    export namespace Button {
        type ButtonPrimitiveProps = VComponentProps<'button'>;
        export interface Props extends ButtonPrimitiveProps, ButtonVariants {}
    }
    ```

## 7.3. CSS 변수 (Variables) & 테마 토큰

- 디자인 토큰은 `vars` 객체를 통해 참조. 하드코딩 지양.
- 토큰 경로는 계층 구조를 따름:

    ```tsx
    // 색상 토큰
    vars.color.background.primary[200];
    vars.color.foreground.inverse;
    vars.color.border.primary;
    vars.color.white;

    // 크기 토큰
    vars.size.space['100']; // spacing
    vars.size.dimension['400']; // height/width
    vars.size.borderRadius['300'];

    // 컴포넌트 내부 CSS 변수
    const fg = createVar();
    const bg = createVar();
    ```

## 7.4. 스타일 믹스인

프로젝트에서 제공하는 스타일 믹스인 함수를 활용:

- **`layerStyle(layer, styles)`**: CSS Cascade Layer에 스타일 배치.
- **`interaction()`**: hover, active, focus 등 인터랙션 스타일.
- **`typography({ style })`**: 타이포그래피 프리셋 적용.

## 7.5. 클래스명 관리 (`clsx`)

- 동적 클래스명 조합 시 `clsx` 사용.

    ```tsx
    import clsx from 'clsx';

    className={clsx(styles.root(variantsProps), className)}
    ```

# 8. 테스팅

---

## 8.1. 테스트 환경

- **테스트 프레임워크**: Vitest (`globals: true` 설정으로 `describe`, `it`, `expect` 등 전역 사용)
- **DOM 환경**: happy-dom
- **테스트 유틸리티**: React Testing Library (`@testing-library/react`), `@testing-library/user-event`
- **접근성 테스트**: vitest-axe

## 8.2. 테스트 패턴

```tsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Button } from './button';

describe('Button', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<Button>Test</Button>);
        const result = await axe(rendered.container);
        expect(result).toHaveNoViolations();
    });

    it('should be clickable', async () => {
        const handleClickMock = vi.fn();
        const rendered = render(<Button onClick={handleClickMock}>Test</Button>);
        await userEvent.click(rendered.getByText('Test'));
        expect(handleClickMock).toHaveBeenCalledTimes(1);
    });
});
```

## 8.3. 테스트 파일 위치

- 컴포넌트 폴더 내 co-locate: `button/button.test.tsx`

# 9. 문서화

---

## 9.1 Storybook

- Storybook 9 (`@storybook/react-vite`) 사용.
- `Meta<typeof Component>`와 `StoryObj<typeof Component>`로 타입 지정.
- `Docs`: storybook `autodocs`로 자동 생성.
- `TestBed`: 시각적 회귀 테스트 용도의 스토리 별도 작성.

    ```tsx
    import type { Meta, StoryObj } from '@storybook/react-vite';
    import { Button } from './button';

    export default {
        title: 'Button',
        argTypes: {
            colorPalette: {
                control: 'inline-radio',
                options: ['primary', 'secondary', 'success', 'warning', 'danger', 'contrast'],
            },
            size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
            variant: { control: 'inline-radio', options: ['fill', 'outline', 'ghost'] },
            disabled: { control: 'boolean' },
        },
    } as Meta<typeof Button>;

    type Story = StoryObj<typeof Button>;

    export const Default: Story = {
        render: (args) => <Button {...args}>Button</Button>,
    };

    export const TestBed: Story = {
        render: () => (/* 시각적 회귀 테스트 케이스 */),
    };
    ```

## 9.2 Vapor Docs (apps/website)

- `use case`: 서브컴포넌트 조합 / 특정 variant의 나열.
- 타이틀에는 이모지를 사용하지 않는다.
- 단일 문자열 값 표기 시 작은따옴표는 생략한다.
  예: `string` (O) / `'string'` (X)
- Union Type 표기 시 공백 구분으로 작성한다.
  예: `small` `medium` `large`
