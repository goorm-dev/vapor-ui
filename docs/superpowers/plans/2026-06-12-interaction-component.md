# Interaction Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `<Interaction>` Slot-pattern component in `packages/core` that applies interaction styling (hover/focus/active/roving overlays) to its single child via className merging.

**Architecture:** Vanilla-extract recipe duplicated into the component folder (option C from spec). Slot pattern via `React.cloneElement` + `Children.only` — no wrapper DOM. Two variant props: `scale` ('normal' | 'light'), `type` ('default' | 'form' | 'roving'). Existing `~/styles/mixins/interactions.css.ts` mixin is **not** modified — the 16 components currently composing it continue to work unchanged.

**Tech Stack:** React 18, TypeScript, vanilla-extract (`@vanilla-extract/css`, `@vanilla-extract/recipes`, `@vanilla-extract/css-utils`), Vitest, `@testing-library/react`, `vitest-axe`, Storybook (`@storybook/react-vite`).

**Spec:** `docs/superpowers/specs/2026-06-12-interaction-component-design.md`

**Working directory:** `packages/core` (run all commands from there unless noted).

**Commit prefix:** `feat(Interaction):` for new code; `test(Interaction):` for test-only commits; `docs(Interaction):` for Storybook.

---

## Task 1: Create the recipe file

**Files:**
- Create: `packages/core/src/components/interaction/interaction.css.ts`

This file holds the vanilla-extract recipe. No tests — recipe correctness is verified visually via Storybook and indirectly via the component test (class string present). We duplicate the recipe from `src/styles/mixins/interactions.css.ts` as Option C; the mixin is left untouched.

- [ ] **Step 1: Create the recipe file**

Write `packages/core/src/components/interaction/interaction.css.ts`:

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

- [ ] **Step 2: Typecheck**

Run from `packages/core`:

```bash
pnpm typecheck
```

Expected: passes. The recipe file is now reachable from `src/` but not yet imported anywhere; tsc compiles it without errors.

- [ ] **Step 3: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.css.ts
git commit -m "feat(Interaction): add interaction recipe"
```

---

## Task 2: Component skeleton + first test (renders child as single DOM, no wrapper)

**Files:**
- Create: `packages/core/src/components/interaction/interaction.test.tsx`
- Create: `packages/core/src/components/interaction/interaction.tsx`

TDD: write the test first, watch it fail, then implement.

Vitest in this package uses `vitest/globals` (see `packages/core/tsconfig.json` — `"types": [..., "vitest/globals", ...]`), so `describe`, `it`, `expect`, `vi` are available without import. Tests use `@testing-library/react` `render`.

- [ ] **Step 1: Write the failing test**

Create `packages/core/src/components/interaction/interaction.test.tsx`:

```tsx
import { render } from '@testing-library/react';

import { Interaction } from './interaction';

describe('Interaction', () => {
    it('renders the single child element with no wrapper DOM', () => {
        const { container } = render(
            <Interaction>
                <button type="button" data-testid="child">
                    Click
                </button>
            </Interaction>,
        );

        expect(container.children).toHaveLength(1);
        expect(container.firstElementChild?.tagName).toBe('BUTTON');
        expect(container.firstElementChild?.getAttribute('data-testid')).toBe('child');
    });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: FAIL — `Cannot find module './interaction'` (or similar resolution error).

- [ ] **Step 3: Write minimal component to make it pass**

Create `packages/core/src/components/interaction/interaction.tsx`:

```tsx
import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

interface InteractionProps {
    children: ReactNode;
}

const Interaction = (props: InteractionProps) => {
    const child = Children.only(props.children);

    if (!isValidElement<{ className?: string }>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    return cloneElement(child);
};

Interaction.displayName = 'Interaction';

export { Interaction };
export type { InteractionProps };
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.test.tsx src/components/interaction/interaction.tsx
git commit -m "feat(Interaction): add component skeleton with Slot pattern"
```

---

## Task 3: Apply recipe className to the child

**Files:**
- Modify: `packages/core/src/components/interaction/interaction.test.tsx`
- Modify: `packages/core/src/components/interaction/interaction.tsx`

Now `<Interaction>` must call the recipe and merge the resulting class onto the child.

- [ ] **Step 1: Write the failing test**

Append to `packages/core/src/components/interaction/interaction.test.tsx` inside the existing `describe('Interaction', ...)` block:

```tsx
import * as styles from './interaction.css';

it('applies the interaction recipe className onto the child', () => {
    const { container } = render(
        <Interaction>
            <button type="button">Click</button>
        </Interaction>,
    );

    const expectedClass = styles.root({});
    expect(container.firstElementChild?.className.split(' ')).toEqual(
        expect.arrayContaining(expectedClass.split(' ').filter(Boolean)),
    );
});
```

Place the `import * as styles from './interaction.css';` line with the other imports at the top of the test file.

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: FAIL — the assertion finds no recipe classes on the child.

- [ ] **Step 3: Update the component**

Replace the contents of `packages/core/src/components/interaction/interaction.tsx`:

```tsx
import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

import { cn } from '~/utils/cn';

import * as styles from './interaction.css';

interface InteractionProps {
    children: ReactNode;
}

const Interaction = (props: InteractionProps) => {
    const child = Children.only(props.children);

    if (!isValidElement<{ className?: string }>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    return cloneElement(child, {
        className: cn(styles.root({}), child.props.className),
    });
};

Interaction.displayName = 'Interaction';

export { Interaction };
export type { InteractionProps };
```

- [ ] **Step 4: Run tests to verify both pass**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.test.tsx src/components/interaction/interaction.tsx
git commit -m "feat(Interaction): apply recipe className to child"
```

---

## Task 4: Preserve the child's existing className

**Files:**
- Modify: `packages/core/src/components/interaction/interaction.test.tsx`

The component already merges via `cn(styles.root({}), child.props.className)`. Add a test that locks the behavior in.

- [ ] **Step 1: Write the failing test**

Append inside `describe('Interaction', ...)`:

```tsx
it('preserves the child existing className', () => {
    const { container } = render(
        <Interaction>
            <button type="button" className="my-child-class">
                Click
            </button>
        </Interaction>,
    );

    const classList = container.firstElementChild?.className.split(' ') ?? [];
    expect(classList).toContain('my-child-class');
});
```

- [ ] **Step 2: Run tests to verify the new test passes**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: PASS (3 tests). The implementation from Task 3 already supports this — the test locks it in.

- [ ] **Step 3: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.test.tsx
git commit -m "test(Interaction): preserve child className when merging"
```

---

## Task 5: Accept and merge external `className` prop

**Files:**
- Modify: `packages/core/src/components/interaction/interaction.test.tsx`
- Modify: `packages/core/src/components/interaction/interaction.tsx`

`<Interaction>` itself takes a `className` prop, which is merged between the recipe class and the child's own class.

- [ ] **Step 1: Write the failing test**

Append inside `describe('Interaction', ...)`:

```tsx
it('merges external className prop with recipe and child classes', () => {
    const { container } = render(
        <Interaction className="external-class">
            <button type="button" className="child-class">
                Click
            </button>
        </Interaction>,
    );

    const classList = container.firstElementChild?.className.split(' ') ?? [];
    expect(classList).toContain('external-class');
    expect(classList).toContain('child-class');
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: FAIL — `external-class` is not present (the current component does not read `className`).

- [ ] **Step 3: Update the component**

Replace the contents of `packages/core/src/components/interaction/interaction.tsx`:

```tsx
import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

import { cn } from '~/utils/cn';

import * as styles from './interaction.css';

interface InteractionProps {
    className?: string;
    children: ReactNode;
}

const Interaction = (props: InteractionProps) => {
    const { className, children } = props;
    const child = Children.only(children);

    if (!isValidElement<{ className?: string }>(child)) {
        throw new Error('<Interaction> child must be a single React element');
    }

    return cloneElement(child, {
        className: cn(styles.root({}), className, child.props.className),
    });
};

Interaction.displayName = 'Interaction';

export { Interaction };
export type { InteractionProps };
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.test.tsx src/components/interaction/interaction.tsx
git commit -m "feat(Interaction): merge external className prop"
```

---

## Task 6: Accept `scale` and `type` variant props

**Files:**
- Modify: `packages/core/src/components/interaction/interaction.test.tsx`
- Modify: `packages/core/src/components/interaction/interaction.tsx`

Variant props feed into `styles.root({ scale, type })`. Different variant inputs must produce different recipe class output on the child.

- [ ] **Step 1: Write the failing test**

Append inside `describe('Interaction', ...)`:

```tsx
it('applies variant props through to the recipe', () => {
    const { container: defaultContainer } = render(
        <Interaction>
            <button type="button">Click</button>
        </Interaction>,
    );

    const { container: lightFormContainer } = render(
        <Interaction scale="light" type="form">
            <button type="button">Click</button>
        </Interaction>,
    );

    expect(defaultContainer.firstElementChild?.className).not.toBe(
        lightFormContainer.firstElementChild?.className,
    );

    const lightFormExpected = styles.root({ scale: 'light', type: 'form' });
    const lightFormActual = lightFormContainer.firstElementChild?.className.split(' ') ?? [];
    expect(lightFormActual).toEqual(
        expect.arrayContaining(lightFormExpected.split(' ').filter(Boolean)),
    );
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: FAIL — the component ignores `scale` / `type`.

- [ ] **Step 3: Update the component**

Replace the contents of `packages/core/src/components/interaction/interaction.tsx`:

```tsx
import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';

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

- [ ] **Step 4: Run tests to verify all pass**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.test.tsx src/components/interaction/interaction.tsx
git commit -m "feat(Interaction): wire scale and type variant props"
```

---

## Task 7: Error cases — multiple children & non-element child

**Files:**
- Modify: `packages/core/src/components/interaction/interaction.test.tsx`

`Children.only` already throws when there are zero or multiple children. `isValidElement` throws our message when the single child is a string/number/null. Lock both with tests.

- [ ] **Step 1: Write the failing tests**

Append inside `describe('Interaction', ...)`:

```tsx
it('throws when given multiple children', () => {
    const previousError = console.error;
    console.error = vi.fn();

    expect(() =>
        render(
            <Interaction>
                <button type="button">A</button>
                <button type="button">B</button>
            </Interaction>,
        ),
    ).toThrow();

    console.error = previousError;
});

it('throws with a clear message when child is not a React element', () => {
    const previousError = console.error;
    console.error = vi.fn();

    expect(() => render(<Interaction>{'just a string' as unknown as never}</Interaction>)).toThrow(
        '<Interaction> child must be a single React element',
    );

    console.error = previousError;
});
```

The `console.error = vi.fn()` lines silence React's error-boundary noise so the test output stays clean. They are restored afterward.

- [ ] **Step 2: Run the tests**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: PASS (7 tests). Both error cases are already enforced by the existing `Children.only` + `isValidElement` checks in the component — these tests lock the contract.

- [ ] **Step 3: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.test.tsx
git commit -m "test(Interaction): cover multi-child and non-element error cases"
```

---

## Task 8: Ref forwarding through the child

**Files:**
- Modify: `packages/core/src/components/interaction/interaction.test.tsx`

`cloneElement` preserves the child's ref. Confirm a `ref` attached to the child still resolves to the underlying DOM node.

- [ ] **Step 1: Write the test**

Append inside `describe('Interaction', ...)`:

```tsx
import { createRef } from 'react';

it('preserves the child ref', () => {
    const ref = createRef<HTMLButtonElement>();

    render(
        <Interaction>
            <button type="button" ref={ref}>
                Click
            </button>
        </Interaction>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
```

Add `createRef` to the existing `import { ... } from 'react'` if not already present. (If there is no existing react import, add the new import line at the top of the test file.)

- [ ] **Step 2: Run the tests**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: PASS (8 tests). The behavior is provided by `cloneElement` — this test locks it in.

- [ ] **Step 3: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.test.tsx
git commit -m "test(Interaction): verify ref forwarding through cloneElement"
```

---

## Task 9: a11y smoke check

**Files:**
- Modify: `packages/core/src/components/interaction/interaction.test.tsx`

Mirror the pattern used in `button.test.tsx`: run `vitest-axe` over the rendered output to confirm wrapping a button does not introduce a11y violations.

- [ ] **Step 1: Write the test**

Add the axe import near the top of the test file (with the other imports):

```tsx
import { axe } from 'vitest-axe';
```

Append inside `describe('Interaction', ...)`:

```tsx
it('has no a11y violations when wrapping a button', async () => {
    const rendered = render(
        <Interaction>
            <button type="button">Click</button>
        </Interaction>,
    );

    const result = await axe(rendered.container);
    expect(result).toHaveNoViolations();
});
```

- [ ] **Step 2: Run the tests**

```bash
pnpm test --run src/components/interaction/interaction.test.tsx
```

Expected: PASS (9 tests).

- [ ] **Step 3: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.test.tsx
git commit -m "test(Interaction): add vitest-axe smoke check"
```

---

## Task 10: `index.ts` re-export

**Files:**
- Create: `packages/core/src/components/interaction/index.ts`

`<Interaction>` is a standalone (non-compound) component. Per the project conventions in `packages/core/CLAUDE.md` §5.3.2, the entrypoint re-exports the implementation directly. Do **not** create `index.parts.ts`. Do **not** modify `src/index.ts` in this PR (per spec §3 non-goals: "Public export from `@vapor-ui/core` root entrypoint is a follow-up decision").

- [ ] **Step 1: Create the index file**

Write `packages/core/src/components/interaction/index.ts`:

```ts
export * from './interaction';
```

- [ ] **Step 2: Typecheck & lint**

```bash
pnpm typecheck
pnpm lint
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
cd packages/core
git add src/components/interaction/index.ts
git commit -m "feat(Interaction): add component entrypoint"
```

---

## Task 11: Storybook stories

**Files:**
- Create: `packages/core/src/components/interaction/interaction.stories.tsx`

Stories use `@storybook/react-vite` and `autodocs` (default for the package — see `button.stories.tsx`). Five stories per spec §10. We do **not** import other Vapor components in the stories — to avoid the documented "double-styling" caveat (spec §11), we wrap plain HTML elements.

- [ ] **Step 1: Write the stories file**

Create `packages/core/src/components/interaction/interaction.stories.tsx`:

```tsx
import type { CSSProperties } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Interaction } from './interaction';

export default {
    title: 'Interaction',
    component: Interaction,
    argTypes: {
        scale: { control: 'inline-radio', options: ['normal', 'light'] },
        type: { control: 'inline-radio', options: ['default', 'form', 'roving'] },
    },
} as Meta<typeof Interaction>;

type Story = StoryObj<typeof Interaction>;

const buttonStyle: CSSProperties = {
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    background: '#fff',
    cursor: 'pointer',
};

const inputStyle: CSSProperties = {
    padding: '0.5rem 0.75rem',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    outline: 'none',
};

const itemStyle: CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    userSelect: 'none',
    cursor: 'pointer',
};

export const Default: Story = {
    render: (args) => (
        <Interaction {...args}>
            <button type="button" style={buttonStyle}>
                Interactive button
            </button>
        </Interaction>
    ),
};

export const ScaleLight: Story = {
    args: { scale: 'light' },
    render: (args) => (
        <Interaction {...args}>
            <button type="button" style={buttonStyle}>
                Light scale
            </button>
        </Interaction>
    ),
};

export const TypeForm: Story = {
    args: { type: 'form' },
    render: (args) => (
        <Interaction {...args}>
            <input type="text" placeholder="Form input" style={inputStyle} />
        </Interaction>
    ),
};

export const TypeRoving: Story = {
    args: { type: 'roving' },
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Interaction {...args}>
                <div data-highlighted style={itemStyle}>
                    Highlighted item
                </div>
            </Interaction>
            <Interaction {...args}>
                <div style={itemStyle}>Regular item</div>
            </Interaction>
        </div>
    ),
};

export const TestBed: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Interaction>
                <button type="button" style={buttonStyle}>
                    default / normal
                </button>
            </Interaction>
            <Interaction scale="light">
                <button type="button" style={buttonStyle}>
                    default / light
                </button>
            </Interaction>
            <Interaction type="form">
                <input type="text" placeholder="form / normal" style={inputStyle} />
            </Interaction>
            <Interaction type="roving">
                <div data-highlighted style={itemStyle}>
                    roving (highlighted)
                </div>
            </Interaction>
        </div>
    ),
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: passes.

- [ ] **Step 3: Run the full package test suite**

```bash
pnpm test
```

Expected: passes (no regressions in any other component, plus 9 new tests).

- [ ] **Step 4: Lint**

```bash
pnpm lint
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/components/interaction/interaction.stories.tsx
git commit -m "docs(Interaction): add Storybook stories"
```

---

## Task 12: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Run typecheck, lint, and tests from the package root**

```bash
cd packages/core
pnpm typecheck && pnpm lint && pnpm test
```

Expected: all three pass.

- [ ] **Step 2: Confirm the existing `interactions.css.ts` mixin is untouched**

```bash
cd /Users/goorm/01_works/vapor
git diff --name-only main -- packages/core/src/styles/mixins/interactions.css.ts
```

Expected: no output (file unchanged on this branch).

- [ ] **Step 3: Confirm the 16 existing consumers are untouched**

```bash
cd /Users/goorm/01_works/vapor
git diff --name-only main -- 'packages/core/src/components/**/*.css.ts' | grep -v interaction/interaction.css.ts
```

Expected: no output. (Only the new `interaction/interaction.css.ts` should appear in css.ts diffs against main.)

- [ ] **Step 4: Confirm `src/index.ts` is untouched**

```bash
cd /Users/goorm/01_works/vapor
git diff --name-only main -- packages/core/src/index.ts
```

Expected: no output. The component is added under `src/components/interaction/` but is **not** re-exported from the package root (per spec §3 non-goals).

- [ ] **Step 5: Confirm the final file set**

```bash
ls packages/core/src/components/interaction/
```

Expected output (exactly these five files):

```
index.ts
interaction.css.ts
interaction.stories.tsx
interaction.test.tsx
interaction.tsx
```

---

## Done criteria

- 9 passing tests in `interaction.test.tsx` covering: single child no-wrap, recipe class merge, child className preserved, external className merged, variant pass-through, multi-child throw, non-element child throw with message, ref forwarding, axe a11y.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` all pass from `packages/core`.
- 5 Storybook stories visible under `Interaction` title.
- Existing `~/styles/mixins/interactions.css.ts` and 16 consumer recipes unchanged.
- `src/index.ts` unchanged (no public re-export in this PR).
- Each task committed with the conventional-commit prefix shown in its commit step.
