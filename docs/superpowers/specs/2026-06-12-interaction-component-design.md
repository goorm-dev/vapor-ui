# Interaction Component — Design

- Status: Approved (brainstorming)
- Date: 2026-06-12
- Scope: `packages/core`
- Author: noah.choi

## 1. Background

`packages/core` currently styles interactive components (button, checkbox, switch, tabs, and 13 others — 16 total) by composing the vanilla-extract recipe `interaction()` exported from `src/styles/mixins/interactions.css.ts` into each component's own recipe:

```ts
// button.css.ts (current)
export const root = componentRecipe({
    base: [interaction(), { /* button-specific */ }],
    // ...
});
```

This works but couples interaction styling logic to every component recipe. The goal is to lift interaction styling into a dedicated `<Interaction>` React component that wraps any element and applies the same styles via class merging, with no extra DOM and no behavioral logic.

## 2. Goals

- Provide an `<Interaction>` component that adds interaction styles to its direct child.
- Mirror the variants currently accepted by the `interaction()` recipe (`scale`, `type`).
- Produce the same rendered DOM as the existing recipe-composition approach (no wrapping element).
- Keep the component free of any behavior — it only merges a className onto the child.

## 3. Non-Goals

- Migrating the 16 existing components to use `<Interaction>`. This spec creates the component only; component migration is a follow-up PR.
- Removing or modifying the existing `~/styles/mixins/interactions.css.ts` mixin. It stays as-is so the 16 existing components keep working.
- Public export from `@vapor-ui/core` root entrypoint. The component is added under `src/components/interaction/` but is **not** re-exported from `src/index.ts` in this PR. Public exposure is a follow-up decision.
- `asChild` / `render` prop patterns.
- Forwarding ref through `<Interaction>` itself.

## 4. Approach

Adopt the Slot pattern (Radix-style `cloneElement`):

- `<Interaction>` accepts exactly one React element child.
- It calls the recipe with variant props (`scale`, `type`) to obtain a class name string.
- It merges that class name with the child's existing `className` and any external `className` passed to `<Interaction>`, then returns `cloneElement(child, { className: merged })`.
- No new DOM element is rendered. The child's ref, props, children, and event handlers are untouched.

The recipe is **duplicated** into the new component folder (`interaction.css.ts`) rather than reused from the existing mixin. The existing mixin stays in place to support unmigrated components. SSOT drift risk is accepted as temporary; the existing mixin will be deleted when the 16 components are migrated in follow-up PRs, at which point the component recipe becomes the SSOT.

## 5. File Structure

```
packages/core/src/components/interaction/
├── interaction.tsx           # <Interaction /> component
├── interaction.css.ts        # vanilla-extract recipe (duplicate of existing mixin)
├── interaction.test.tsx      # Vitest + @testing-library/react
├── interaction.stories.tsx   # Storybook (autodocs)
└── index.ts                  # re-export: export * from './interaction'
```

No `index.parts.ts` — `<Interaction>` is a standalone component, not compound.

`src/index.ts` is **not** updated in this PR.

## 6. Recipe (`interaction.css.ts`)

Identical shape to the existing mixin at `src/styles/mixins/interactions.css.ts`. Exported as `root` to match the per-component recipe naming convention used elsewhere (e.g. `button.css.ts` exports `root`).

```ts
import { createVar } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const ratio = createVar('opacity-ratio');

export const root = componentRecipe({
    base: {
        position: 'relative',
        vars: { [ratio]: '0.08' },
        selectors: {
            '&::before': {
                position: 'absolute',
                top: 0,
                left: 0,
                transition: 'opacity 150ms ease',
                opacity: 0,
                border: 'none',
                borderRadius: 'inherit',
                backgroundColor: vars.color.gray[900],
                pointerEvents: 'none',
                width: '100%',
                height: '100%',
                content: '',
            },
            '&:focus': { outline: 'none' },
            '&:focus-visible': { outline: 'none' },
        },
    },
    defaultVariants: {
        scale: 'normal',
        type: 'default',
    },
    variants: {
        scale: {
            normal: {},
            light: { vars: { [ratio]: '0.04' } },
        },
        type: {
            default: {
                selectors: {
                    '&:active::before': { opacity: calc.multiply(ratio, 2) },
                    '&:focus-visible': {
                        outline: `2px solid ${vars.color.foreground.normal[200]}`,
                        outlineOffset: '2px',
                    },
                },
                '@media': {
                    '(hover: hover)': {
                        selectors: {
                            '&:hover::before': { opacity: calc.multiply(ratio, 1) },
                            '&:active::before': { opacity: calc.multiply(ratio, 2) },
                        },
                    },
                },
            },
            form: {
                transition: 'box-shadow 150ms cubic-bezier(.4,0,.2,1)',
                selectors: {
                    '&:focus': {
                        boxShadow: `inset 0 0 0 0.0625rem ${vars.color.border.primary}`,
                    },
                },
                '@media': {
                    '(hover: hover)': {
                        selectors: {
                            '&:hover:not(:focus)': {
                                boxShadow: `inset 0 0 0 0.0625rem color-mix(in srgb, ${vars.color.gray[900]} 32%, transparent)`,
                            },
                        },
                    },
                },
            },
            roving: {
                selectors: {
                    '&[data-highlighted]::before': { opacity: 0.08 },
                    '&[data-highlighted]:active::before': { opacity: 0.16 },
                },
            },
        },
    },
});

export type InteractionVariants = NonNullable<RecipeVariants<typeof root>>;
```

The `ratio` CSS variable is intentionally **not** exposed as a prop. It stays an internal implementation detail of the recipe, controlled by the `scale` variant.

## 7. Component (`interaction.tsx`)

```tsx
import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

import cn from '~/utils/cn';
import createSplitProps from '~/utils/create-split-props';

import * as styles from './interaction.css';
import type { InteractionVariants } from './interaction.css';

interface InteractionProps extends InteractionVariants {
    className?: string;
    children: ReactNode;
}

const Interaction = (props: InteractionProps) => {
    const [variantProps, { className, children }] = createSplitProps<InteractionVariants>()(
        props,
        ['scale', 'type'],
    );

    const child = Children.only(children);

    if (!isValidElement<{ className?: string }>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    return cloneElement(child, {
        className: cn(styles.root(variantProps), className, child.props.className),
    });
};

Interaction.displayName = 'Interaction';

export { Interaction };
export type { InteractionProps };
```

### 7.1 Behavior Contract

- **Props accepted**: `scale`, `type` (recipe variants), `className`, `children`. Nothing else.
- **DOM output**: exactly one element — the child, with className merged. No wrapper.
- **className merge order** (later entries cascade-win when CSS specificity ties):
  1. `styles.root({ scale, type })` — interaction styles
  2. External `className` passed to `<Interaction>`
  3. `child.props.className` — child's own classes (intentionally last so component-specific styles can override interaction defaults if needed)
- **Ref**: not handled by `<Interaction>`. The child's own ref (if any) is preserved by `cloneElement`.
- **Other props**: not merged onto the child. Event handlers, `style`, `data-*`, `aria-*` belong on the child element directly.

### 7.2 Error / Edge Cases

- `Children.only(children)` throws if `children` is `0`, multiple, or a fragment with multiple roots.
- `isValidElement` check throws a clear error if the single child is a string, number, null, or other non-element.
- If the child does not accept `className` as a prop (e.g., a React component that ignores it), the recipe class is still passed but has no visual effect. This is the consumer's responsibility — the same constraint as Radix `Slot`. Documented in Storybook.

## 8. Public API

```ts
// Usage
<Interaction>
    <button type="button">Click</button>
</Interaction>

<Interaction scale="light" type="form">
    <input type="text" />
</Interaction>

<Interaction type="roving" className="extra-class">
    <MenuItem />
</Interaction>
```

Defaults: `scale="normal"`, `type="default"` (inherited from the recipe's `defaultVariants`).

## 9. Testing (`interaction.test.tsx`)

Vitest + `@testing-library/react`. Cases:

1. Renders the child as the only DOM element — no wrapper.
2. Merges recipe className with the child's existing className.
3. Merges external `className` prop with the child's className.
4. Applies `scale` and `type` variants — assert recipe class string is present on the child.
5. Default variants applied when no `scale` / `type` given.
6. Throws when `children` is empty, multiple, or a non-element (string).
7. Ref forwarding: a child rendered with `forwardRef` receives the ref (the ref the consumer attached to the child, not to `<Interaction>`).
8. `vitest-axe` smoke check on a button child to confirm interaction styles do not violate basic a11y.

## 10. Storybook (`interaction.stories.tsx`)

`autodocs` enabled. Stories:

1. **Default** — over a plain `<button>`, default variants.
2. **Scale: light** — same button, `scale="light"`.
3. **Type: form** — over a `<TextInput />`, `type="form"`.
4. **Type: roving** — over a menu-item-like element with `data-highlighted` toggled.
5. **Composition with existing component** — wrapping `<Button />` (showing that wrapping does not duplicate styling when the existing Button still uses the legacy mixin internally; this documents the temporary double-styling situation for the migration window).

## 11. Risks & Follow-ups

- **Recipe duplication (Option C)**: The new component recipe and the existing `~/styles/mixins/interactions.css.ts` mixin must stay in sync until the 16 components are migrated. Any change to interaction styling during the migration window must be applied to both files. A follow-up PR should delete the mixin and update the 16 imports once migration is complete.
- **Double-styling during migration**: If a consumer wraps an already-styled component (e.g., the current `<Button />`, which composes `interaction()` internally) in `<Interaction>`, the interaction classes are applied twice. The visual result is identical (same class merged onto the same element), but the className string grows. Not a correctness bug; documented in Storybook so consumers know to either migrate the inner component or skip `<Interaction>` until then.
- **className specificity**: Because all three merged class sources target the same element, last-loaded CSS wins on ties. The merge order documented in §7.1 assumes the component-specific recipe is loaded after the interaction recipe (consistent with how `componentRecipe` layers are ordered today). Verified by manual visual check in Storybook.
- **Public export**: `src/index.ts` does not re-export `<Interaction>` in this PR. Adding the export is a one-line follow-up once the component has been validated in Storybook.

## 12. Out of Scope (Explicit)

- Migration of existing components (button, checkbox, switch, tabs, text-input, textarea, radio, radio-card, segmented-control, pagination, menu, multi-select, navigation-menu, select, tabs).
- Deletion of `~/styles/mixins/interactions.css.ts`.
- `<Interaction>` ref forwarding.
- `asChild` / `render` prop API.
- Additional variants beyond `scale` and `type`.
- Exposing `ratio` as a prop.
