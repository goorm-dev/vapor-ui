---
name: vapor-unit-test
description: >
    Write unit tests for React components in the vapor-ui design system (`packages/core/src/components/`).
    Use this skill whenever the user asks to write, add, generate, or create unit tests for a component —
    even if they just say "테스트 추가해줘" or "이 컴포넌트 테스트 써줘".
    Also use it when reviewing an existing test file and adding missing coverage.
    This skill enforces strict conventions: `rendered` variable, chained queries, semantic element names,
    grouped `describe` blocks, and correct state-assertion strategies for ARIA vs native attributes.
---

# Vapor Unit Test Skill

Write unit tests for components in `packages/core/src/components/` using **Vitest** and **React Testing Library**.

## File location

Place the test file at the same level as the component implementation:

```
packages/core/src/components/<component-name>/<component-name>.test.tsx
```

## Imports

Always use this import order:

```tsx
// React if needed (hooks, useState, etc.)
import { useState } from 'react';

// Testing library types (only when using RenderResult in beforeEach)
import type { RenderResult } from '@testing-library/react';
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
// only when vi.fn() return type is needed
import { axe } from 'vitest-axe';

import { Dialog } from '.';
// Component under test — use relative path or index
import { Button } from './button';
```

Do not import `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `vi` — Vitest provides these globally.

## Top-level describe

The outer `describe` uses the component name as a string:

```tsx
describe('Button', () => {
    afterEach(cleanup);
    // ...
});
```

Always call `afterEach(cleanup)` unless tests are entirely synchronous and stateless (rare).

## Coverage strategy

Target **80%+ across all four metrics**: Statements, Lines, Branches, and Functions.
Branch and Function coverage tend to come naturally from testing props and interactions.
Statements and Lines are the harder ones — they drop when code paths inside the component never execute during any test.

**Before writing tests, read the component source file.** The key question for each uncovered line is: _is this component-specific logic, or is it just delegating to Base UI?_

- **Component-specific logic → worth covering.** This includes:
    - Props that compute derived values (e.g. building `aria-label` from multiple inputs, normalizing a value)
    - Conditional rendering based on props (`icon && <Icon />`, `label ? <Label /> : null`)
    - State transformation logic (controlled/uncontrolled switching, value coercion)
    - `clsx` or recipe conditions that apply different classes based on prop combinations
    - Compound sub-parts that contain their own logic (`Dialog.Description`, `Menu.Group`, etc.)

- **Pure Base UI delegation → lower priority.** Simple wrappers that just forward props to a Base UI primitive without any transformation don't need deep coverage — testing them is effectively testing Base UI, not Vapor.

When you find uncovered component-specific logic, add a test that exercises that path. When the uncovered line is a plain render delegation, deprioritize it over meaningful behavior tests.

## Describe groups (sub-describes)

Nest `describe` blocks to organize tests by category. Common groups:

| Group                              | When to use                            |
| ---------------------------------- | -------------------------------------- |
| `'given a default <Component>'`    | Default uncontrolled state             |
| `'given a controlled <Component>'` | Controlled value/onChange state        |
| `'ARIA attributes'`                | Explicit aria-\* attribute checks      |
| `'keyboard navigation'`            | Tab, arrow keys, Enter/Space behaviors |
| `'prop: <propName>'`               | Behavior of a specific prop            |

**Do not test visual variants** (`size`, `shape`, `variant`, `color`, etc.) — those are covered by visual regression tests.

## rendered variable

**Always** assign the render result to `rendered`:

```tsx
const rendered = render(<ButtonTest />);
```

When sharing across `it` cases via `beforeEach`, declare with type:

```tsx
let rendered: RenderResult;

beforeEach(() => {
    rendered = render(<CheckboxTest />);
});
```

## Querying elements

Always chain query methods from `rendered`:

```tsx
const button = rendered.getByRole('button', { name: 'Submit' });
const checkbox = rendered.getByRole('checkbox');
const link = rendered.getByRole('link', { name: 'Home' });
const dialog = rendered.getByRole('dialog');
```

Always give queried elements a **semantic name**, and always assign them to a variable before asserting — never inline a query inside `expect()`:

```tsx
// good
const trigger = rendered.getByRole('button', { name: 'Open' });
const closeButton = rendered.getByText(CLOSE_TEXT);
const currentItem = rendered.getByRole('link', { name: 'Products' });

// bad — anonymous variable
const el = rendered.getByRole('button');

// bad — query inlined inside expect
expect(rendered.getByRole('listbox')).toBeInTheDocument();
```

The reason to extract queries into named variables is readability and debuggability: a descriptive name immediately tells the reader what element is being asserted on, and the variable can be reused for multiple assertions.

### Naming by component, not by ARIA role

Name variables after the **component name**, not the underlying ARIA role. The component interface is what developers think in — using the component name keeps tests readable alongside the JSX.

| Component        | ARIA role  | Variable name                |
| ---------------- | ---------- | ---------------------------- |
| `Select.Trigger` | `combobox` | `trigger`                    |
| `Select.Popup`   | `listbox`  | `popup`                      |
| `Select.Item`    | `option`   | `appleItem`, `bananaItem`, … |
| `Dialog.Trigger` | `button`   | `trigger`                    |
| `Dialog.Popup`   | `dialog`   | `popup`                      |
| `Menu.Item`      | `menuitem` | `deleteItem`, `editItem`, …  |

For items, prefix with the content label to disambiguate: `appleItem`, not `item1`.

Use `queryBy*` when checking absence, and still assign to a variable:

```tsx
const popup = rendered.queryByRole('listbox');
expect(popup).not.toBeInTheDocument();
```

## it() naming

Write `it()` descriptions as sentences that complete "it \_\_\_":

```tsx
it('should have no a11y violations', ...)
it('should invoke the onClick handler when clicked', ...)
it('should not change its state when disabled', ...)
it('does not close when closeOnClickOverlay is false', ...)
```

When an attribute name or attribute+value appears in the description, wrap it in backticks:

```tsx
// attribute name only
it('should have the `aria-required` attribute on the trigger', ...)
it('should have the `data-disabled` attribute on the trigger', ...)

// attribute with value
it('should have `aria-expanded="true"` when open', ...)
it('should have items with `role="option"` in the listbox', ...)
```

All `it` callbacks must be `async` when using `userEvent` or `axe`.

## Accessibility test (always include)

Every component test file must include an a11y check:

```tsx
it('should have no a11y violations', async () => {
    const rendered = render(<ComponentTest />);
    const result = await axe(rendered.container);

    expect(result).toHaveNoViolations();
});
```

## User interactions

Use `@testing-library/user-event` for all user actions:

```tsx
await userEvent.click(button);
await userEvent.tab();
await userEvent.keyboard('{Escape}');
await userEvent.keyboard('{Enter}');
await userEvent.type(input, 'hello');
```

When directly calling a DOM method (not via `userEvent`), wrap it with `waitFor` from `@testing-library/react` so React can flush state updates before the next step:

```tsx
// good — DOM method wrapped in waitFor
await waitFor(() => trigger.focus());

// bad — direct DOM call without waiting
trigger.focus();
```

This matters because `trigger.focus()` is synchronous but the component may need a render cycle to respond. Without `waitFor`, the following `userEvent.keyboard(...)` call may fire before the component is ready.

## State assertions

### Native HTML state (input, button, etc.)

Use matcher functions when the state is reflected natively by the browser:

```tsx
expect(checkbox).toBeChecked();
expect(button).toBeDisabled();
expect(input).toBeRequired();
expect(input).toHaveFocus();
expect(element).toBeInTheDocument();
```

### JS-managed state (div-based, Base UI components)

When a component uses `aria-*` or `data-*` attributes to communicate state (not native HTML attributes), use `toHaveAttribute`:

```tsx
// aria-based
expect(element).toHaveAttribute('aria-disabled', 'true');
expect(element).toHaveAttribute('aria-checked', 'mixed');
expect(element).toHaveAttribute('aria-invalid', 'true');
expect(element).toHaveAttribute('aria-readonly', 'true');
expect(element).toHaveAttribute('aria-current', 'page');

// data-attribute-based (Base UI pattern)
expect(element).toHaveAttribute('data-disabled', '');
expect(element).toHaveAttribute('data-checked', '');
```

The rule: if the component renders a `<div>` or a non-native interactive element, use `toHaveAttribute`. If it renders a real `<input>`, `<button>`, `<select>`, use the semantic matchers.

## Component-defined callback coverage

Only test callbacks that the component itself defines as part of its custom API — not native HTML event passthrough props.

- **Test these** — callbacks that contain component logic:
  `onCheckedChange`, `onValueChange`, `onOpenChange`, `onSelect`, `onDismiss`

- **Skip these** — raw HTML events the component just forwards to the DOM:
  `onFocus`, `onBlur`, `onClick` (on a plain wrapper), `onKeyDown`, `onMouseEnter`

Native event props are handled by the browser; testing them only verifies React's event system, not the component's behavior. Component-specific callbacks, by contrast, contain logic worth verifying — they fire at the right time, carry the right payload, and respect conditions like `disabled` or `readOnly`.

Trigger callbacks through real user interactions (`userEvent.click`, `userEvent.tab`, `userEvent.type`) so the surrounding component logic runs, not just the binding.

## Mock functions

```tsx
const onClick: Mock = vi.fn();
// or simply
const onClick = vi.fn();

expect(onClick).toHaveBeenCalledTimes(1);
expect(onClick).toHaveBeenCalled();
expect(onClick).not.toHaveBeenCalled();
```

## Test component wrapper pattern

Define a lightweight wrapper at the bottom of the file to keep test markup clean and prop-passthrough easy:

```tsx
const LABEL_TEXT = 'My Checkbox';

const CheckboxTest = (props: Checkbox.Root.Props) => (
    <>
        <Checkbox.Root id="cb" aria-label={LABEL_TEXT} {...props} />
        <label htmlFor="cb">{LABEL_TEXT}</label>
    </>
);
```

Constants like `TRIGGER_TEXT`, `CLOSE_TEXT`, `LABEL_TEXT` should be defined at the module level above the wrapper.

## Full example structure

```tsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Breadcrumb } from '.';

describe('Breadcrumb', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<BreadcrumbTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    describe('ARIA attributes', () => {
        it('should have the `aria-current="page"` when the item is current', () => {
            const rendered = render(<BreadcrumbTest />);
            const currentItem = rendered.getByRole('link', { name: 'Products' });

            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('keyboard navigation', () => {
        it('should support keyboard navigation via Tab and Enter', async () => {
            const onClick = vi.fn();
            render(
                <Breadcrumb.Root>
                    <Breadcrumb.Item href="home">Home</Breadcrumb.Item>
                    <Breadcrumb.Item href="away" onClick={onClick}>
                        Away
                    </Breadcrumb.Item>
                </Breadcrumb.Root>,
            );

            await userEvent.tab();
            await userEvent.tab();
            await userEvent.keyboard('{Enter}');

            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('prop: current', () => {
        it('sets aria-current="page" on the active item', () => {
            const rendered = render(<BreadcrumbTest />);
            const currentItem = rendered.getByRole('link', { name: 'Products' });

            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });
    });
});

const BreadcrumbTest = (props: Breadcrumb.Root.Props) => (
    <Breadcrumb.Root {...props}>
        <Breadcrumb.Item href="home">Home</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item href="products" current>
            Products
        </Breadcrumb.Item>
    </Breadcrumb.Root>
);
```
