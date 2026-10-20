---
description: Component API design, compound component patterns, props typing, file structure, and import conventions for packages/core
paths:
    - 'packages/core/src/**/*.tsx'
    - 'packages/core/src/**/*.ts'
---

# Component API Rules (`packages/core`)

## File & Folder Structure

Keep implementation, styles, stories, and tests colocated in the component folder:

```text
src/components/button/
  button.tsx
  button.css.ts
  button.stories.tsx
  button.test.tsx
  index.ts
```

- All files and directories use `kebab-case`.
- Utility/hook collections: plural directories (`hooks/`, `utils/`).

## Import Conventions

Use `~/` path aliases for `src/*` imports:

```tsx
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
```

Alias Base UI primitives explicitly:

```tsx
import { Button as BaseButton } from '@base-ui/react/button';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
```

Prefer named exports over `default export`.

## Standalone vs Compound Components

- **Standalone** (`Button`, `TextInput`, `IconButton`): single component, simple API.
- **Compound** (`Dialog`, `Menu`, `Popover`, `RadioGroup`): multi-part, namespace-based API.

### Standalone entrypoint

```tsx
// index.ts
export * from './button';
```

### Compound entrypoint (3-file pattern)

```tsx
// index.ts
export * as Dialog from './index.parts';
```

```tsx
// index.parts.ts
export {
    DialogRoot as Root,
    DialogTrigger as Trigger,
    DialogPopup as Popup,
    DialogClose as Close,
} from './dialog';
```

Do **not** use `Object.assign` to build compound namespace exports.

Compound components may expose layout-convenience parts beyond the Base UI primitives — e.g. `Dialog` adds `Header`, `Body`, `Footer` alongside `Root`/`Trigger`/`Popup`/`Close`. Re-export these as namespace parts in `index.parts.ts` like any other part.

## Props Typing

Use `VaporUIComponentProps` (from `~/utils/types`) for all components — it merges Base UI `render` prop, Sprinkles `$css`, and stateful `className`/`style`:

```tsx
import type { VaporUIComponentProps } from '~/utils/types';

export const Button = forwardRef<HTMLElement, Button.Props>((props, ref) => { ... });

export namespace Button {
    export type State = BaseButton.State;
    export type Props = VaporUIComponentProps<typeof BaseButton, State> & ButtonVariants;
}
```

For compound component parts, derive props from the Base UI primitive:

```tsx
import type { ComponentPropsWithoutRef } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';

type DialogPrimitiveProps = Omit<
    ComponentPropsWithoutRef<typeof BaseDialog.Root>,
    'disablePointerDismissal'
>;

export namespace DialogRoot {
    export interface Props extends DialogPrimitiveProps {
        closeOnClickOverlay?: boolean;
    }
}
```

Prop type naming follows the local module pattern — preserve `Button.Props`, `DialogRoot.Props`, or direct names like `PaginationRootProps` as they already exist. Do not force a single convention.

When a prop is combined with an internal value (context, state) before being passed down, rename it with a `Prop` suffix on destructure and compute the result in a named variable above the JSX. Keep the JSX attribute a plain reference:

```tsx
const { disabled: disabledProp, ...componentProps } = resolveStyles(props);
const { disabled: contextDisabled } = useMenuContext();

const disabled = disabledProp || contextDisabled;

return <BaseMenu.Trigger ref={ref} disabled={disabled} {...componentProps} />;
```

Do not inline the merge expression in the JSX attribute (`disabled={disabledProp || contextDisabled}`).

- Avoid `React.FC`.
- Do not use `defaultProps` on function components — use parameter defaults instead.
- When a function has 3+ parameters, prefer an object parameter.

## Stateful Callbacks (`className` / `style` / `render`)

Base UI builds a part's state (`checked`, `disabled`, `open`, field state…) inside its own render, and resolves function `className` / `style` / `render` there. A callback only sees that state if it reaches the Base UI part **as a function**.

- Pass the callback to the Base UI part unresolved. `resolveStyles` and `cn()` keep functions intact, so passing their result straight through is safe.
- Do not render a Base UI part through `useRenderElement({ state, render: <BaseX /> })` with user `className` / `style` in `props`. The hook resolves them against `state` before Base UI runs, so callbacks get only the Vapor-side fields and every Base UI field is `undefined` — with no type error, because `State` still promises them.
- When `State` adds fields to the Base UI state (`interface XState extends BaseX.State`), wrap each callback with a `toState` adapter and render the Base UI part directly. Re-create any `data-*` attribute that the dropped `useRenderElement` state used to emit, since styles select on it.

```tsx
// ❌ callbacks resolved early with { invalid } only — `state.checked` is always undefined
useRenderElement({
    state: { invalid },
    render: <BaseCheckbox.Root />,
    props: { className: cn(styles.root({ invalid }), className) },
});

// ✅ Base UI calls the callbacks with its own state; toState adds the custom field
const toState = (state: BaseCheckbox.Root.State): CheckboxRoot.State => ({ ...state, invalid });
const className =
    typeof classNameProp === 'function'
        ? (state: BaseCheckbox.Root.State) => classNameProp(toState(state))
        : classNameProp;
// …same for style, and for render with (renderProps, state)

<BaseCheckbox.Root
    className={cn(styles.root({ invalid }), className)}
    style={style}
    render={render}
    {...createDataAttributes({ invalid })}
/>;
```

`useRenderElement` with a `state` is fine when it renders a plain element (`defaultTagName`) or a user `render`: there the passed `state` is the whole `State`, so it must match the declared type exactly — declare it as `const state: X.State = …` so the compiler enforces that.

## Composition & Accessibility

- Composition is via Base UI `render` prop — **not** `asChild`.
- Follow WAI-ARIA patterns. Prefer Base UI patterns for accessibility.
- Use `React.forwardRef` for all components.
- Default to uncontrolled behavior; support `value`/`onChange` for controlled.
- Overlay components must separate `Trigger`, popup/content, overlay, and close parts.
- Prefer passing icons through `children` or named icon components.
- Keep standard `aria-*` prop names; only abstract internally-managed ARIA behavior.

## Public API Example

```tsx
import { Button, Dialog, RadioGroup, TextInput } from '@vapor-ui/core';

<Button variant="solid">Click me</Button>;
<TextInput placeholder="Email" />;

<Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Popup>
        <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
</Dialog.Root>;

<RadioGroup.Root>{/* ... */}</RadioGroup.Root>;
```
