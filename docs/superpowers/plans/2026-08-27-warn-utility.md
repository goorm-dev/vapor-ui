# Warn Utility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the shared development-only, once-per-message warning utility and route ProgressBar warnings through it.

**Architecture:** A module-level `Set<string>` owns warning deduplication in `packages/core/src/utils/warn.ts`. ProgressBar imports the internal utility instead of calling `console.warn` directly.

**Tech Stack:** TypeScript, React, Vitest, Testing Library

## Global Constraints

- Match the meter-component `warn` implementation and tests.
- Keep `warn` internal; do not add a public package export.
- Do not commit changes yet.

---

### Task 1: Add the shared warn utility

**Files:**
- Create: `packages/core/src/utils/warn.test.ts`
- Create: `packages/core/src/utils/warn.ts`

**Interfaces:**
- Produces: `warn(message: string): void`

- [ ] **Step 1: Write the failing test**

```ts
import { warn } from './warn';

describe('warn', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('warns once per message', () => {
        warn('same message');
        warn('same message');

        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith('Vapor UI: same message');
    });

    it('warns for each distinct message', () => {
        warn('first message');
        warn('second message');

        expect(warnSpy).toHaveBeenCalledTimes(2);
    });
});
```

- [ ] **Step 2: Verify the test fails because `./warn` does not exist**

Run: `pnpm --filter @vapor-ui/core test -- src/utils/warn.test.ts`

- [ ] **Step 3: Add the minimal implementation**

```ts
const warned = new Set<string>();

export const warn = (message: string) => {
    if (process.env.NODE_ENV === 'production' || warned.has(message)) return;

    warned.add(message);
    console.warn(`Vapor UI: ${message}`);
};
```

- [ ] **Step 4: Verify the utility test passes**

Run: `pnpm --filter @vapor-ui/core test -- src/utils/warn.test.ts`

### Task 2: Route ProgressBar warnings through the utility

**Files:**
- Modify: `packages/core/src/components/progress-bar/progress-bar.test.tsx`
- Modify: `packages/core/src/components/progress-bar/progress-bar.tsx`

**Interfaces:**
- Consumes: `warn(message: string): void` from `~/utils/warn`

- [ ] **Step 1: Tighten existing warning assertions to require the shared prefix**

```ts
expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Vapor UI: ProgressBar:'));
```

Use the same prefix assertion in both existing warning tests.

- [ ] **Step 2: Verify the ProgressBar test fails against direct `console.warn` calls**

Run: `pnpm --filter @vapor-ui/core test -- src/components/progress-bar/progress-bar.test.tsx`

- [ ] **Step 3: Replace both direct calls**

```ts
import { warn } from '~/utils/warn';

warn(
    `ProgressBar: \`max\` (${max}) must be greater than \`min\` (${min}). Falling back to ${DEFAULT_MIN}–${DEFAULT_MAX}.`,
);

warn(
    'ProgressBar: no accessible name. Render a `ProgressBar.Label` or pass `aria-label` to the root — otherwise the progress bar announces a number with no subject.',
);
```

- [ ] **Step 4: Verify focused and package checks**

Run:

```sh
pnpm --filter @vapor-ui/core test -- src/utils/warn.test.ts src/components/progress-bar/progress-bar.test.tsx
pnpm --filter @vapor-ui/core typecheck
pnpm --filter @vapor-ui/core lint
```
