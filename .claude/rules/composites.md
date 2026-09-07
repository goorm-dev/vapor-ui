---
paths:
    - 'packages/composites/**'
---

# Composites 컴포넌트 작성 컨벤션

`@vapor-ui/composites`는 `@vapor-ui/core`의 primitive를 조합해 디자인 결정을 내재화한 완성형 컴포넌트를 제공한다. 아래 규칙은 이 패키지 안에서 컴포넌트를 새로 만들거나 수정할 때 공통으로 따르는 항목이다. 규칙의 배경과 상위 정책은 [`packages/composites/CLAUDE.md`](../../packages/composites/CLAUDE.md)를 함께 참고한다.

목차

1. [슬롯은 `createSlots`로 만든다](#1-슬롯은-createslots로-만든다)
2. [모든 prop에 JSDoc을 붙인다](#2-모든-prop에-jsdoc을-붙인다)
3. [스타일은 `$css` prop으로 작성한다](#3-스타일은-css-prop으로-작성한다)
4. [Primitive prop은 인터페이스 내부에서 재정의한다](#4-primitive-prop은-인터페이스-내부에서-재정의한다)
5. [타입은 TypeScript `namespace`로 노출한다](#5-타입은-typescript-namespace로-노출한다)
6. [서브 컴포넌트는 `index.parts.ts`로 분리한다](#6-서브-컴포넌트는-indexpartsts로-분리한다)
7. [Preset wrapper는 primitive prop을 전체 상속한다 (§4 예외)](#7-preset-wrapper는-primitive-prop을-전체-상속한다-4-예외)

---

## 1. 슬롯은 `createSlots`로 만든다

Composites의 컴포넌트는 Figma 아나토미에 대응하는 여러 슬롯(예: `trigger`, `title`, `description`)을 노출한다. 슬롯 렌더링 로직을 컴포넌트마다 손으로 짜지 않고, 반드시 `~/utils/create-slots`의 `createSlots` 유틸을 사용한다.

**규칙**

- 각 슬롯은 해당 위치에서 렌더링할 primitive JSX를 값으로 갖는 객체로 선언한다.
- 슬롯 host는 `render` prop을 지원하는 `@vapor-ui/core` primitive여야 한다.
- 슬롯 props 타입은 `SlotProps<typeof slots, Required>` 유틸로 파생한다. 두 번째 제네릭 인자에 필수 슬롯의 key를 넘긴다.
- 사용 시에는 `<slots.name render={propValue} />` 형태로 렌더링한다.

**예시** (`src/components/dialog/dialog.tsx`)

```tsx
import { createSlots } from '~/utils/create-slots';
import type { SlotProps } from '~/utils/create-slots';

const slots = createSlots({
    title: DialogPrimitives.Title,
    trigger: DialogPrimitives.Trigger,
    description: DialogPrimitives.Description,
});

// `title`은 필수, 나머지는 옵셔널
type Slots = SlotProps<typeof slots, 'title'>;

// 렌더링
<slots.title render={title} />
<slots.description render={description} $css={{ color: '$basic-gray-500' }} />
```

> 외부에 노출되는 서브 컴포넌트가 자체 슬롯 세트를 가진다면 그 서브 컴포넌트 스코프에 별도 `createSlots` 호출을 둔다. 컴포넌트 최상위와 뒤섞지 않는다. 반대로 `Header`, `Body`, `Footer`처럼 외부 API가 아닌 내부 아나토미 분리용 컴포넌트는 최상위 슬롯을 props drilling으로 전달한다.

## 2. 모든 prop에 JSDoc을 붙인다

Props Table 자동 생성이 이 문자열을 그대로 사용한다. 시각(variants)·기능(functional)·슬롯(slot) 카테고리를 가리지 않고 모든 prop에 JSDoc을 작성한다.

**규칙**

- 첫 문장은 이 prop이 컴포넌트에서 어떤 역할을 하는지 한 문장으로 설명한다.
- 기본값이 있으면 `@default` 태그로 명시한다. boolean은 `@default false`, size 같은 variant는 `@default "md"`처럼 실제 리터럴을 적는다.
- 사용 패턴이 명확하지 않은 slot이나 콜백에는 `@example`로 최소 예시를 붙인다.
- 제어/비제어 prop 쌍(`open` / `defaultOpen` / `onOpenChange`)은 상호 관계를 설명에 포함한다.
- 톤은 명령형 서술("~한다")로 통일한다.

**예시** (`src/components/dialog/dialog.tsx`)

```tsx
export interface DialogProps {
    /**
     * 다이얼로그 열림 상태(제어). 사용자가 결정을 내려야 하는 시점을 외부 상태로 동기화할 때 사용한다.
     * 상태의 변경을 추적할 필요가 없다면 defaultOpen을 사용한다.
     */
    open?: RootProps['open'];

    /**
     * 마운트 시 초기 열림 여부(비제어).
     * @default false
     */
    defaultOpen?: RootProps['defaultOpen'];

    /**
     * 열림 상태 변경 콜백. 트리거·오버레이·ESC 등 모든 닫힘 경로에서 호출된다.
     * @example
     * <Dialog onOpenChange={(open) => setOpen(open)} />
     */
    onOpenChange?: RootProps['onOpenChange'];

    /**
     * 다이얼로그의 크기를 변경한다.
     * @default "md"
     */
    size?: RootProps['size'];
}
```

## 3. 스타일은 `$css` prop으로 작성한다

Composites는 `className` / `style` 오버라이드를 소비자에게 노출하지 않는다(→ [`CLAUDE.md §8`](../../packages/composites/CLAUDE.md)). 컴포넌트 내부 스타일은 `@vapor-ui/core` primitive가 제공하는 `$css` prop을 사용한다. `$css`는 디자인 토큰(`$300`, `$basic-gray-500` 등)을 지원하므로 하드코딩된 색상·간격 값을 사용하지 않는다.

**규칙**

- 정적 스타일은 primitive의 `$css`에 인라인으로 작성한다. 스타일 파일(`.css.ts`) 별도 생성 금지.
- 색상·간격·radius 등은 반드시 토큰(`$...`)으로 참조한다.
- 상태에 따라 값이 달라지는 스타일은 삼항 연산으로 표현한다.
- 여러 컴포넌트에 반복 적용되는 오프셋·정렬은 primitive 자체 default에 맡기고, 필요할 때만 재정의한다.

**예시** (`src/components/dialog/dialog.tsx`)

```tsx
<DialogPrimitives.Header
    $css={{
        justifyContent: 'space-between',
        alignItems: 'start',
        height: 'unset',
        paddingTop: '$300',
        paddingBottom: '$200',
        gap: '$200',
    }}
>
    <VStack $css={{ alignItems: 'flex-start', gap: '$025', flex: 1 }}>
        <slots.title render={title} />
        <slots.description render={description} $css={{ color: '$basic-gray-500' }} />
    </VStack>
</DialogPrimitives.Header>

// 상태에 따라 분기하는 경우
<DialogPrimitives.Body
    $css={{
        marginBottom: '$300',
        maskImage: scrollable ? 'linear-gradient(to top, transparent 0, black 20px)' : '',
    }}
>
    {children}
</DialogPrimitives.Body>
```

## 4. Primitive prop은 인터페이스 내부에서 재정의한다

`@vapor-ui/core` primitive의 prop을 Composites 컴포넌트가 그대로 노출할 때는, primitive의 prop 타입을 로컬에서 별칭(alias)으로 잡은 뒤 `interface` 안에서 `Alias['propName']`으로 프로퍼티를 재선언한다. `extends`나 `Pick`으로 primitive의 인터페이스 전체를 상속하지 않는다.

**왜 이렇게 하는가**

- Composites의 Public API는 primitive의 하위집합이다. `extends`는 원치 않는 prop까지 노출한다.
- 재정의된 프로퍼티에는 Composites 문맥에 맞는 JSDoc을 별도로 붙일 수 있다(§2).
- primitive prop 시그니처가 바뀌어도 재정의는 자동으로 따라간다.

**규칙**

- 파일 상단에 재사용할 primitive prop 타입을 로컬 alias로 선언한다. 예: `type RootProps = DialogPrimitives.Root.Props;`
- `interface`의 각 프로퍼티는 `open?: RootProps['open']` 형태로 인덱싱해 가져온다.
- 슬롯 관련 prop은 `Slots['name']`으로 가져온다(§1).
- primitive의 이름 그대로가 아니라 Composites의 도메인 이름으로 rename이 필요하다면, alias 인덱싱 뒤에 별도 유틸 타입으로 감싼다.

**예시** (`src/components/dialog/dialog.tsx`)

```tsx
type Slots = SlotProps<typeof slots, 'title'>;
type RootProps = DialogPrimitives.Root.Props;
type PortalProps = DialogPrimitives.PortalPrimitive.Props;

export interface DialogProps {
    open?: RootProps['open'];
    defaultOpen?: RootProps['defaultOpen'];
    onOpenChange?: RootProps['onOpenChange'];
    container?: PortalProps['container'];
    keepMounted?: PortalProps['keepMounted'];
    size?: RootProps['size'];

    title: Slots['title'];
    description?: Slots['description'];
    trigger?: Slots['trigger'];
}
```

## 5. 타입은 TypeScript `namespace`로 노출한다

컴포넌트 prop 타입은 컴포넌트 이름과 같은 `namespace` 안에서 `Props`로 export한다. 소비자는 `Dialog.Props` 형태로 참조한다. 이는 core 패키지의 `Button.Props`, `DialogRoot.Props`와 동일한 관용을 유지하기 위함이다.

**규칙**

- 파일 내부에서는 `DialogProps` 같은 구체 이름의 `interface`로 선언한다. 이 편이 도구 지원이 좋고 순환 참조가 없다.
- Public API로는 `export namespace <ComponentName> { export type Props = <InternalInterface>; }` 패턴으로 재노출한다.
- 하위 슬롯이 자체 props를 가진다면 같은 namespace 안에 `FooterProps` 등으로 함께 export한다.

**예시** (`src/components/dialog/dialog.tsx`)

```tsx
// 소비자 사용
import type { Dialog } from '@vapor-ui/composites';

export interface DialogProps {
    /* ... */
}

export namespace Dialog {
    export type Props = DialogProps;
}

const props: Dialog.Props = {/* ... */};
```

## 6. 서브 컴포넌트는 `index.parts.ts`로 분리한다

Flat 컴포넌트가 기본이지만, 다음 두 경우에는 dot-notation 서브 컴포넌트를 노출한다.

1. **아이템 반복 나열** — 사용자가 임의 개수의 아이템을 배치하는 컴포넌트(예: `Select` → `Select.Root`, `Select.Option`). (→ [`CLAUDE.md §3`](../../packages/composites/CLAUDE.md))
2. **문맥 preset 부품 노출** — 부품이 고정 위치에 0~1회 렌더되지만, 컴포넌트 문맥에 맞는 스타일(size/colorPalette 등)이 사전 지정된 preset을 별도로 제공하는 컴포넌트(예: `Dialog` → `Dialog.Root`, `Dialog.Action`, `Dialog.Assistive`).

두 경우 모두 core 패키지와 동일하게 `index.parts.ts`로 부분들을 재수출하고, `index.ts`에서 namespace 형태로 export한다.

**규칙**

- 실제 구현은 `<component>.tsx`에 그대로 둔다. 부품 이름은 `SelectRoot`, `SelectOption`처럼 컴포넌트 접두어를 유지한다.
- `<component>/index.parts.ts`에서 각 부품을 짧은 공개 이름으로 rename해 export한다.
- `<component>/index.ts`는 `export * as <ComponentName> from './index.parts';` 한 줄로 유지한다.
- 각 부품의 prop 타입은 해당 부품 이름의 namespace 안에서 `Props`로 노출한다 (`SelectRoot.Props`).

**예시** (core의 `Select`를 그대로 참고할 수 있다)

```tsx
// src/components/select/select.tsx
export const SelectRoot = (props: SelectRoot.Props) => {
    /* ... */
};
export const SelectOption = (props: SelectOption.Props) => {
    /* ... */
};

export namespace SelectRoot {
    export interface Props {
        /* ... */
    }
}
```

```tsx
// src/components/select/index.parts.ts
export {
    SelectRoot as Root,
    SelectOption as Option,
    // ...
} from './select';
```

```tsx
// src/components/select/index.ts
export * as Select from './index.parts';
```

```tsx
// 소비자 사용
import { Select } from '@vapor-ui/composites';

<Select.Root>
    <Select.Option value="a">A</Select.Option>
</Select.Root>;
```

위 두 경우에 해당하지 않는 flat 컴포넌트는 이 구조를 쓰지 않고 `export * from './<component>';` 한 줄만 둔다.

## 7. Preset wrapper는 primitive prop을 전체 상속한다 (§4 예외)

§6의 두 번째 케이스("문맥 preset 부품")에 해당하고 아래 판정 기준을 **전부** 만족하는 컴포넌트는 §4의 cherry-pick 원칙에서 벗어나, primitive prop을 `Omit`으로 preset key만 봉인한 형태로 그대로 상속한다. `Dialog.Action`, `Dialog.Assistive`가 이 케이스다.

**판정 기준 (4개 모두 충족해야 예외 적용)**

1. **Single-primitive** — 루트가 단일 `@vapor-ui/core` primitive를 그대로 렌더한다. 여러 primitive를 조합하지 않는다.
2. **Defaults-only override** — `variant`, `size`, `colorPalette` 등 정적 default 값만 override한다. `onClick`, `ref`, `disabled`, `type` 같은 기능·상태 prop에는 개입하지 않는다.
3. **Namespace-bound** — 부모 Composite의 dot-notation 부품으로만 노출한다. Top-level export 금지(`Dialog.Action`은 O, `DialogAction`을 별개 최상위 컴포넌트로 export하지 않는다).
4. **No rename** — primitive prop을 Composites 도메인 이름으로 rename하지 않는다.

하나라도 어긋나면 preset wrapper가 아니다. §4로 회귀해 cherry-pick한다.

**타입 선언 — 봉인은 `Omit`으로**

컴포넌트가 소유한 preset key를 `Omit`으로 제거해, 소비자가 preset을 override하지 못하도록 봉인한다. 그 외 기능 prop은 primitive의 JSDoc을 그대로 상속한다.

**예시**

```tsx
export const DialogAssistive = ({ children, ...props }: DialogAssistive.Props) => {
    return (
        <Button size="lg" colorPalette="secondary" variant="outline" {...props}>
            {children}
        </Button>
    );
};

export namespace DialogAssistive {
    /**
     * Dialog 문맥에 맞춰 `size`, `colorPalette`, `variant`를 고정한 보조 액션 버튼.
     * 그 외 Button prop(`onClick`, `disabled`, `type`, `ref` 등)은 그대로 노출된다.
     */
    export type Props = Omit<Button.Props, 'size' | 'colorPalette' | 'variant'>;
}
```

**왜 예외인가**

- §4는 "여러 primitive를 조합·재해석하는 Composite가 원치 않는 primitive prop을 소비자에게 노출하는 것"을 막기 위한 규칙이다. Preset wrapper는 primitive와 1:1이므로 primitive의 모든 기능 prop이 소비자에게도 의미가 있다.
- 판정 기준 2·3·4가 "wrapper가 defaults 이상으로 확장되지 못한다"는 것을 구조적으로 강제한다. wrapper에 로직·rename·다중 primitive가 추가되는 순간 이 컴포넌트는 더 이상 preset wrapper가 아니며, 자동으로 §4의 cherry-pick 요건으로 돌아간다.
- `Omit`으로 preset key를 봉인하기 때문에 "Dialog.Action이 사실상 다른 Button이 되어버리는" 무질서한 override는 타입 레벨에서 차단된다.

---

## 체크리스트

컴포넌트 PR을 올리기 전에 아래를 확인한다.

- [ ] 슬롯을 `createSlots`로 만들었고, 필수 슬롯 key를 `SlotProps` 두 번째 제네릭에 넘겼다.
- [ ] 모든 prop에 JSDoc이 있다. 기본값이 있는 prop에는 `@default`가 붙어 있다.
- [ ] 스타일은 `$css`로만 작성했고, 색상·간격은 토큰(`$...`)을 사용했다.
- [ ] Primitive prop을 노출할 때 로컬 alias를 만들고 인터페이스 내부에서 `Alias['prop']`으로 인덱싱했다.
- [ ] `export namespace <Component> { export type Props = ... }` 패턴으로 타입을 노출했다.
- [ ] 서브 컴포넌트가 있는 컴포넌트라면 `index.parts.ts`를 두고 `index.ts`에서 namespace로 재수출했다.
- [ ] Preset wrapper라면 §7의 판정 기준 4개를 모두 만족하고, `Omit`으로 preset key를 봉인했다.
