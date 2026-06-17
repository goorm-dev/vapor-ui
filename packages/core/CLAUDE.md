# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

`@vapor-ui/core` is the main React component package. It provides 40+ accessible components built on `@base-ui/react` primitives with Vanilla Extract for zero-runtime, type-safe CSS.

To run a single test file: `pnpm vitest run src/components/button/button.test.tsx`

## Detailed Rules

Full rule files live in `.claude/rules/` at the repo root. Load them when you need deeper guidance:

- `@.claude/rules/component-api.md` — component API, file structure, compound pattern, props typing
- `@.claude/rules/styling.md` — Vanilla Extract styling, tokens, layer cascade, sprinkles
- `@.claude/rules/typescript.md` — TypeScript conventions, naming, coding style
- `@.claude/rules/testing.md` — testing stack, coverage expectations, fake timers
- `@.claude/rules/docs.md` — Storybook story structure, `TestBed` story convention

## Component Architecture

### Standalone vs Compound

**Standalone** — single component, simple API (e.g., `Button`, `TextInput`):

```text
src/components/button/
  button.tsx         ← component + Props namespace
  button.css.ts      ← componentRecipe / componentStyle
  button.test.tsx    ← colocated test
  button.stories.tsx ← Default story (interactive) + TestBed story (visual regression baseline)
  index.ts           ← export all from component file
```

**Compound** — multi-part namespace API (e.g., `Dialog`, `Menu`):

```text
src/components/dialog/
  dialog.tsx         ← all parts + Props namespaces
  dialog.css.ts
  dialog.test.tsx
  dialog.stories.tsx ← Default story (interactive) + TestBed story (visual regression baseline)
  index.ts           ← export * as Dialog from './index.parts'
  index.parts.ts     ← DialogRoot as Root, DialogTrigger as Trigger, …
```

Never use `Object.assign` to build compound namespace exports — use the 3-file pattern above. `Object.assign` makes the entrypoint (`index.ts`) directly reference implementation files, which prevents RSC-compatible `'use client'` boundary separation. The 3-file pattern keeps `index.ts` free of client directives so it can be imported in server components.

### Props Typing

All components use `VaporUIComponentProps` from `~/utils/types`, which merges Base UI's `render` prop, the `$css` sprinkles prop, and stateful `className`/`style`:

```tsx
export namespace Button {
    export type State = BaseButton.State;
    export type Props = VaporUIComponentProps<typeof BaseButton, State> & ButtonVariants;
}
```

For compound parts that derive from a Base UI primitive directly:

```tsx
export namespace DialogClose {
    export type State = BaseDialog.Close.State;
    export type Props = VaporUIComponentProps<typeof BaseDialog.Close, State>;
}
```

Always use `forwardRef` on all components. Never use `React.FC` or `defaultProps`.

### Composition Pattern

Composition uses the Base UI `render` prop — **not** `asChild`. Base UI primitives are aliased on import:

```tsx
import { Button as BaseButton } from '@base-ui/react/button';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
```

### Runtime Rendering Flow

Every component follows the same three-step flow:

```text
resolveStyles(props)      → strips $css / deprecated flat props, returns { className, style, ...rest }
cn(recipe(variants), className)  → merges classNames
<BaseComponent className={...} {...otherProps} />
```

`createSplitProps` extracts variant keys from props so they never reach the DOM:

```tsx
const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(componentProps, [
    'colorPalette',
    'size',
    'variant',
]);
```

For compound components where the Root owns variants that style multiple sub-parts, store them in Context and read in sub-parts via `useXxxContext()`.

## Styling (Vanilla Extract)

All styles live in `*.css.ts` files. No inline styles, no CSS modules.

### Three primitives

- **`componentRecipe`** — components with variants. Placed inside `@layer vapor.components` automatically.
- **`componentStyle`** — static, no-variant component parts.
- **`interaction()` mixin** — include in `base` for any interactive element (hover/active/focus via `::before` overlay).

### CSS Variables for palette × variant

Use `createVar` to avoid N×M `compoundVariants`:

```ts
const variables = { foreground: createVar('foreground'), background: createVar('background') };

variants: {
    colorPalette: { primary: { vars: { [variables.background]: vars.color.background.primary[200] } } },
    variant: { fill: { backgroundColor: variables.background } },
}
```

### State selectors

Use `when` helpers from `~/styles/mixins/logical-states` for Base UI data-attribute states — **not** CSS pseudo-classes like `:disabled`:

```ts
selectors: { [when.disabled()]: { opacity: 0.32 } }
```

### Design tokens

Always use the `vars` object from `~/styles/themes.css`. Never use hard-coded values.

### `$css` prop

`$css` is the public API for sprinkle styles. Deprecated flat props (`padding`, `margin`, etc.) are being removed — always write `$css={{ padding: '150' }}` instead.

### `@layer` cascade order

```text
vapor.theme → vapor.reset → vapor.components → vapor.utilities → (no layer: user className)
```

User `className` always wins over component styles without `!important`.

## Testing

- **Vitest** + `@testing-library/react` + `@testing-library/user-event` + `vitest-axe`
- Test files are colocated: `button.tsx` → `button.test.tsx`
- New public components must include a `vitest-axe` accessibility check; full coverage is the goal and existing components are being backfilled (a few — e.g. wrappers like `input-group`, or parts covered via their group like `radio` → `radio-group` — are not yet checked directly)
- Use `vi.useFakeTimers()` for delay-driven behavior (tooltips, animations)
- Visual regressions are in `__tests__/regressions.test.ts` via Playwright against Storybook "Test Bed" stories

## Path Aliases

Use `~/` for `src/` imports:

```tsx
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
```

## Build

Rollup produces three artifacts per entry point: ESM (`.js`), CJS (`.cjs`), and TypeScript declarations (`.d.ts`). Each component's `index.ts` is a separate entry point — tree-shaking works at the component level. The `preserveDirectives` plugin keeps `'use client'` directives.
