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

- Avoid `React.FC`.
- Do not use `defaultProps` on function components — use parameter defaults instead.
- When a function has 3+ parameters, prefer an object parameter.

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
