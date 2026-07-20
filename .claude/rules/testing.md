---
description: Testing conventions for packages/core — Vitest, Testing Library, accessibility checks
paths:
    - 'packages/core/src/**/*.test.tsx'
---

# Testing Rules (`packages/core`)

## Stack

- **Vitest** — test runner
- **`@testing-library/react`** — component rendering
- **`@testing-library/user-event`** — user interactions
- **`vitest-axe`** — accessibility assertions

## What to Cover

For every public component, cover:

- Keyboard interaction (Tab, Enter, Space, Arrow keys, Escape)
- Pointer interaction (click, hover)
- Focus behavior (focus trapping, focus restoration)
- Open/close lifecycle (for overlays, dialogs, menus)
- Controlled and uncontrolled patterns
- Accessibility (`vitest-axe`)

## Fake Timers

Use fake timers for delay-driven behavior (tooltip delay, hover timing, animation):

```tsx
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

it('shows tooltip after delay', async () => {
    render(
        <Tooltip content="Hello">
            <button>Hover me</button>
        </Tooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    await act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
});
```

## Accessibility Check

Add `vitest-axe` checks for public components. Full coverage is the target and it is required for new components; a few existing components are still being backfilled.

```tsx
import { axe } from 'vitest-axe';

it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
```

## Colocation

Keep test files next to the component they cover:

```text
src/components/button/
  button.tsx
  button.test.tsx   ← colocated
```

## Example Structure

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Button } from './button';

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click me</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('has no accessibility violations', async () => {
        const { container } = render(<Button>Click me</Button>);
        expect(await axe(container)).toHaveNoViolations();
    });
});
```
