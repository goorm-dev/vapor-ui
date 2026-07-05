# Plan E — `$css` Deprecation Phases 1 & 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the gentle deprecation surface for the legacy `$css` prop (spec §9 Phase 1 + Phase 3) — JSDoc `@deprecated` annotations + a dev-mode `console.warn` that fires once per call site. Phase 4 (breaking removal in v2.0) is **out of scope** and gets its own plan when v2 is real.

**Architecture:** Two changes only.

1. Add `@deprecated` JSDoc to every `$css` declaration in `@vapor-ui/core` source so editors highlight + TS surfaces it (Phase 1).
2. Add a `runDeprecationWarn` helper invoked from `resolveStyles` (the choke point used by every consumer of `$css` per spec §9.3). It maintains a `Set<string>` keyed by stack frame so each call site warns exactly once, and is no-op in `process.env.NODE_ENV === 'production'` (Phase 3).

**Tech Stack:** Existing `@vapor-ui/core` source, vitest.

## Global Constraints

- Spec §9 phases — this plan covers **Phase 1 and Phase 3 only**. Phase 2 (stabilization patches) is not a code change. Phase 4 (breaking removal) is deferred.
- Spec §9.2 — Phase 1 must not change runtime behavior. Adding JSDoc + extending the resolveStyles signature is allowed; changing prop semantics is not.
- Phase 3 warning constraints:
    - Dev mode only. `process.env.NODE_ENV === 'production'` → no-op.
    - At most **one warning per unique call site** (spec §9 phase row: "warn 노출. 동작 동일").
    - Must not fire when `$css` is the explicit recommendation source — e.g. the existing `Box` recipe's own internal calls. Implementation strategy: the warn fires only when `resolveStyles` receives a non-empty `$css` from props (consumer-supplied), not from internal recipes. The split happens naturally because `resolveStyles` is the consumer-facing entry point (already accepts the user's props object).
- Phase 3 must ship the codemod path as the recommended fix (spec §9 phase row: "codemod 공식 릴리스"). The warn message references the codemod command.
- Version targets are aspirational (spec uses 1.4.0 / 1.7.0 / 2.0.0 as examples). Use Changesets — do not hardcode version bumps in code.
- Out of scope (§9 Phase 4): removing `$css`, removing flat deprecated props, removing `Sprinkles` type export, removing `rainbow-sprinkles` dep, removing prebuild CSS artifact.

---

## File Structure

```
packages/core/
├── src/
│   ├── utils/
│   │   ├── resolve-styles.ts                   # (modify) add Phase-3 warn hook
│   │   └── deprecation-warn.ts                  # (new) warn-once helper
│   └── components/**/index.parts.ts            # (modify) add @deprecated to every $css prop type
└── __tests__/
    ├── style-fn/
    │   ├── deprecation-warn.test.ts            # warn-once + production silence
    │   └── jsdoc-deprecated.test.ts            # parse types.d.ts and assert annotation presence

.changeset/
└── deprecate-css-prop.md
```

---

## Task 1: `deprecation-warn` helper

**Files:**

- Create: `packages/core/src/utils/deprecation-warn.ts`
- Create: `packages/core/__tests__/style-fn/deprecation-warn.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:

    ```ts
    export function warnCssPropOnce(siteHint?: string): void;
    // For tests only:
    export function __resetWarnedSites(): void;
    ```

- [ ] **Step 1: Write failing tests**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetWarnedSites, warnCssPropOnce } from '../../src/utils/deprecation-warn';

describe('warnCssPropOnce', () => {
    const original = process.env.NODE_ENV;

    beforeEach(() => {
        process.env.NODE_ENV = 'development';
        __resetWarnedSites();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        process.env.NODE_ENV = original;
    });

    it('warns once per unique site hint', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        warnCssPropOnce('Box');
        warnCssPropOnce('Box');
        warnCssPropOnce('Flex');
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('warns once per stack frame when no hint given', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const call = () => warnCssPropOnce();
        call();
        call();
        // same callsite → warned once
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('is silent in production', () => {
        process.env.NODE_ENV = 'production';
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        warnCssPropOnce('Box');
        warnCssPropOnce('Flex');
        expect(spy).not.toHaveBeenCalled();
    });

    it('mentions the codemod path in the message', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        warnCssPropOnce('Box');
        const msg = (spy.mock.calls[0]?.[0] ?? '') as string;
        expect(msg).toMatch(/css-to-style/);
        expect(msg).toMatch(/\$style/);
    });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `pnpm --filter @vapor-ui/core vitest run __tests__/style-fn/deprecation-warn.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write `src/utils/deprecation-warn.ts`**

```ts
const warned = new Set<string>();

function siteFromStack(): string {
    // Stack format varies. Pick the third frame (warnCssPropOnce → caller → consumer).
    const stack = new Error().stack ?? '';
    const lines = stack.split('\n');
    // Index 0: 'Error'; 1: siteFromStack; 2: warnCssPropOnce; 3: actual caller.
    return (lines[3] ?? '<unknown>').trim();
}

export function warnCssPropOnce(siteHint?: string): void {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return;
    const key = siteHint ?? siteFromStack();
    if (warned.has(key)) return;
    warned.add(key);
    if (typeof console === 'undefined') return;
    console.warn(
        `[@vapor-ui/core] The "$css" prop is deprecated. Switch to the new "$style" function for build-time atomic CSS.\n` +
            `  Run: npx @vapor-ui/codemod css-to-style <paths>\n` +
            `  Site: ${key}`,
    );
}

export function __resetWarnedSites(): void {
    warned.clear();
}
```

- [ ] **Step 4: Run, verify pass**

Run: `pnpm --filter @vapor-ui/core vitest run __tests__/style-fn/deprecation-warn.test.ts`
Expected: 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/utils/deprecation-warn.ts packages/core/__tests__/style-fn/deprecation-warn.test.ts
git commit -m "feat(core): warn-once helper for \$css deprecation"
```

---

## Task 2: Wire `warnCssPropOnce` into `resolveStyles`

**Files:**

- Modify: `packages/core/src/utils/resolve-styles.ts`

**Interfaces:**

- Consumes: Task 1.
- Produces: every consumer call to `resolveStyles` passing a non-empty `$css` triggers the warning exactly once per call site.

- [ ] **Step 1: Read the current `resolveStyles` body**

Run: read `packages/core/src/utils/resolve-styles.ts`. Confirm the `createSplitProps<Styles>()(props, ['$css'])` destructuring still happens at the top.

- [ ] **Step 2: Add the warn call right after `$css` is extracted**

Modify the file so the segment looks like:

```ts
import { warnCssPropOnce } from './deprecation-warn';

export const resolveStyles = <T extends object>(props: T) => {
    const [layoutProps, _otherProps] = createSplitProps<Styles>()(props, ['$css']);
    if (
        layoutProps.$css &&
        typeof layoutProps.$css === 'object' &&
        Object.keys(layoutProps.$css).length > 0
    ) {
        warnCssPropOnce();
    }
    // ... rest unchanged ...
};
```

The check must not fire when `$css` is absent or empty.

- [ ] **Step 3: Verify existing tests still pass**

Run: `pnpm --filter @vapor-ui/core test`
Expected: PASS.

- [ ] **Step 4: Add a smoke test that verifies the wire-up**

Add to `__tests__/style-fn/deprecation-warn.test.ts` a final `it`:

```ts
it('fires when resolveStyles receives non-empty $css', () => {
    process.env.NODE_ENV = 'development';
    __resetWarnedSites();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Use a require here to side-step ESM hoisting interference with the spy.
    const { resolveStyles } = require('../../src/utils/resolve-styles');
    resolveStyles({ $css: { padding: '$400' } });
    expect(spy).toHaveBeenCalledTimes(1);
});

it('does NOT fire when $css is undefined', () => {
    process.env.NODE_ENV = 'development';
    __resetWarnedSites();
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { resolveStyles } = require('../../src/utils/resolve-styles');
    resolveStyles({ padding: '1rem' });
    expect(spy).not.toHaveBeenCalled();
});
```

Run: `pnpm --filter @vapor-ui/core vitest run __tests__/style-fn/deprecation-warn.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/utils/resolve-styles.ts packages/core/__tests__/style-fn/deprecation-warn.test.ts
git commit -m "feat(core): emit deprecation warn from resolveStyles"
```

---

## Task 3: JSDoc `@deprecated` on every `$css` declaration (Phase 1)

**Files:**

- Modify: every `index.parts.ts` (or equivalent) under `packages/core/src/components/**` that declares a `$css` prop on a public component.

**Interfaces:**

- Consumes: nothing.
- Produces: editor tooling (TS / IDE) renders strikethrough on `$css`. No runtime effect.

- [ ] **Step 1: Inventory the prop sites**

Run a search for the declaration. The current type definition lives where `Styles` (the `$css` carrier) is defined. Identify two surfaces:

- The `Styles` interface (likely in `packages/core/src/utils/resolve-styles.ts` or a shared `styles.ts`).
- Component-level prop interfaces that re-declare or compose `$css`.

Inspect, decide whether a single deprecation on the source `Styles` interface propagates, or whether each component re-exports its own and needs separate annotation.

- [ ] **Step 2: Annotate the canonical declaration**

Wherever `$css?:` is first declared, change:

```ts
$css?: Sprinkles;
```

to:

```ts
/**
 * @deprecated Use the `$style` function instead. Run `npx @vapor-ui/codemod css-to-style` to migrate.
 * @see https://vapor-ui.goorm.io/docs/migration/style-fn
 */
$css?: Sprinkles;
```

- [ ] **Step 3: Verify the annotation surfaces**

Run: `pnpm --filter @vapor-ui/core build`
Read one generated `*.d.ts` (e.g. `dist/components/box/index.d.ts`). The `$css` line should carry the `@deprecated` JSDoc.

- [ ] **Step 4: Write the verification test**

`packages/core/__tests__/style-fn/jsdoc-deprecated.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourcePath = resolve(__dirname, '../../src/utils/resolve-styles.ts');

describe('$css JSDoc deprecation', () => {
    it('canonical declaration is annotated', () => {
        const src = readFileSync(sourcePath, 'utf-8');
        // Allow either inline before `$css?:` or above it in a JSDoc block.
        const re = /@deprecated[\s\S]{0,200}\$css\?:|\$css\?:[^\n]*\n[\s\S]{0,200}@deprecated/;
        expect(src).toMatch(re);
        expect(src).toMatch(/css-to-style/);
    });
});
```

(If the canonical declaration is in a file other than `resolve-styles.ts`, update `sourcePath` accordingly during Step 2.)

- [ ] **Step 5: Run test, commit**

Run: `pnpm --filter @vapor-ui/core test`
Expected: PASS.

```bash
git add packages/core/src packages/core/__tests__/style-fn/jsdoc-deprecated.test.ts
git commit -m "feat(core): mark \$css prop @deprecated (phase 1)"
```

---

## Task 4: Changeset

**Files:**

- Create: `.changeset/deprecate-css-prop.md`

**Interfaces:**

- Consumes: existing Changesets workflow.
- Produces: a `minor` bump on `@vapor-ui/core` carrying the deprecation surface.

- [ ] **Step 1: Inspect existing changeset shape**

Look at an existing `.changeset/*.md`. Match front-matter exactly.

- [ ] **Step 2: Write the changeset**

```markdown
---
'@vapor-ui/core': minor
---

Deprecate the `$css` prop in favor of the new build-time `$style` function.

- `$css` now carries a `@deprecated` JSDoc annotation; editors / TypeScript will surface the notice.
- In development, the first consumer call site per session emits a one-time `console.warn` referencing the codemod and the new `$style` API. The warning is silent in production.
- Behavior is unchanged. Migrate at your own pace via `npx @vapor-ui/codemod css-to-style <paths>` or follow the [migration guide](https://vapor-ui.goorm.io/docs/migration/style-fn).
```

- [ ] **Step 3: Commit**

```bash
git add .changeset/deprecate-css-prop.md
git commit -m "chore: changeset for \$css deprecation"
```

---

## Task 5: Verify storybook + website still build with the warning in place

**Files:** none new.

**Interfaces:** none.

- [ ] **Step 1: Build both apps**

Run: `pnpm --filter @vapor-ui/storybook build`
Run: `pnpm --filter @vapor-ui/website build`
Expected: PASS (warnings appearing in build logs are acceptable; errors are not).

- [ ] **Step 2: Run the full test sweep**

Run: `pnpm -r test`
Expected: PASS.

- [ ] **Step 3: No commit (verification only)**

---

## Self-review against spec

- §9 Phase 1 — `$css` `@deprecated` JSDoc + docs/Storybook nudge → Task 3 + cross-link to migration guide (which Plan C added).
- §9 Phase 3 — dev-mode `console.warn` once per call site, codemod-released signal → Tasks 1 + 2 + 4 changeset note.
- §9.2 backward compatibility unchanged → Task 5 verification.
- §9.3 internal components — `resolveStyles` is the consumer chokepoint, internal recipes pass through it the same way today; this means recipes whose own props default to `$css={}` (empty) won't warn (Task 2 step 2 guards on `Object.keys(...).length > 0`).

**Out of scope (handed off to a future v2 plan):** §9.4 Phase 4 — removing `$css`, removing flat deprecated props, removing `Sprinkles` export, removing `rainbow-sprinkles` peer dep, removing `dist/styles/sprinkles.css.ts.vanilla.css`. When the v2 cycle starts, draft a new plan that begins with the codemod test sweep on the whole monorepo and ends with removing the runtime files.
