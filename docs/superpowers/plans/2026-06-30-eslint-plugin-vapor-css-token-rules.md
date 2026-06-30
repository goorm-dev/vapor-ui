# eslint-plugin-vapor CSS Token Rules — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 ESLint rules to `packages/eslint-plugin-vapor` that lint Vapor design-token usage inside CSS files: `css/no-invalid-design-token`, `css/token-scope-mismatch`, `css/prefer-design-token`.

**Architecture:** Plain-text CSS rules consuming `@eslint/css` (`language: 'css/css'`) Declaration AST. Token JSON (11 files) is copied from `skills/token-lint/assets/` into `src/data/tokens/` and loaded at startup into in-memory indexes (canonical name set, hex→names, px→names, name→meta). Each rule shares the indexes; report logic is rule-specific. Color resolution uses `culori/fn` (tree-shaken) to convert primitive oklch → hex.

**Tech Stack:** TypeScript, ESLint 9 flat config, `@eslint/css` 0.6+ (peer optional), `culori` 4 (dependency), `vitest` + `RuleTester` (existing).

## Global Constraints

- Spec reference: `docs/superpowers/specs/2026-06-30-css-token-rules-design.md` — every task implicitly inherits its messages, options, candidate-rule ordering, and message IDs exactly as written.
- Package: `packages/eslint-plugin-vapor`. All paths below are relative to it unless noted.
- Branch: `eslint-plugin-css-tokens` (already current).
- Existing a11y rules stay untouched. Existing `recommended` preset stays a11y-only and is renamed to `flat` (a11y) plus a new `css` preset.
- Token JSON files are copied verbatim from `skills/token-lint/assets/*.json` — no transforms.
- v1 scope: pure `.css` only. No SCSS, no JS/TSX, no autofix, no shorthand decomposition, no dark-theme hex matching. Out-of-scope cases must skip cleanly (no false positives).
- TypeScript strict, no `any`. Use `unknown` and narrow.
- Tests colocate with source (`*.test.ts`) — same pattern as existing rules.
- Commit style mirrors existing branch history: `feat(eslint-plugin-vapor): ...` / `test(eslint-plugin-vapor): ...` — Conventional Commits, scope = package name.

---

## File Structure

```
packages/eslint-plugin-vapor/
├── package.json                                # MODIFY: add deps
├── README.md                                   # MODIFY: usage + options + limits
├── src/
│   ├── data/
│   │   ├── tokens/                             # NEW (11 JSON copies)
│   │   │   ├── border-radius.json
│   │   │   ├── dimension.json
│   │   │   ├── space.json
│   │   │   ├── shadow.json
│   │   │   ├── typography.json
│   │   │   ├── text-style.json
│   │   │   ├── primitive-color.light.json
│   │   │   ├── primitive-color.dark.json
│   │   │   ├── semantic-color.light.json
│   │   │   ├── semantic-color.dark.json
│   │   │   └── resolver.json
│   │   └── property-scope-map.ts               # NEW (Scope type + map)
│   ├── utils/
│   │   ├── token-scope.ts                      # NEW (name → scope)
│   │   ├── segment-distance.ts                 # NEW (typo candidates)
│   │   ├── allowlist-matcher.ts                # NEW (glob match)
│   │   ├── css-value-parser.ts                 # NEW (var/hex/dimension extract)
│   │   ├── color-resolver.ts                   # NEW (oklch → hex)
│   │   └── token-index.ts                      # NEW (aggregator: canonical/byHex/byPx/meta)
│   ├── rules/
│   │   └── css/
│   │       ├── no-invalid-design-token.ts      # NEW
│   │       ├── no-invalid-design-token.test.ts # NEW
│   │       ├── token-scope-mismatch.ts         # NEW
│   │       ├── token-scope-mismatch.test.ts    # NEW
│   │       ├── prefer-design-token.ts          # NEW
│   │       └── prefer-design-token.test.ts     # NEW
│   └── index.ts                                # MODIFY: register 3 rules + add `css` preset
```

---

## Task 1: Setup — dependencies, token assets, property-scope map

**Files:**
- Modify: `packages/eslint-plugin-vapor/package.json`
- Create (11): `packages/eslint-plugin-vapor/src/data/tokens/{border-radius,dimension,space,shadow,typography,text-style,primitive-color.light,primitive-color.dark,semantic-color.light,semantic-color.dark,resolver}.json`
- Create: `packages/eslint-plugin-vapor/src/data/property-scope-map.ts`

**Interfaces:**
- Consumes: nothing (foundational task).
- Produces:
  - JSON files at paths above (bytes identical to `skills/token-lint/assets/*`).
  - `export type Scope = 'foreground' | 'background' | 'border' | 'dimension' | 'space' | 'borderRadius' | 'shadow';`
  - `export const PROPERTY_SCOPE: Record<string, readonly Scope[]>;` keyed by CSS property name. Exact entries copied from spec §3 `PROPERTY_SCOPE` block (color/fill/stroke; background; border-*; width/min-width/max-width/height/min-height/max-height; gap/row-gap/column-gap/padding*/margin*/inset/top/right/bottom/left; border-radius + 4 corners; box-shadow).

- [ ] **Step 1: Copy 11 token JSONs from `skills/token-lint/assets/` into `packages/eslint-plugin-vapor/src/data/tokens/`**

Run from repo root:

```bash
mkdir -p packages/eslint-plugin-vapor/src/data/tokens
cp skills/token-lint/assets/border-radius.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/dimension.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/space.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/shadow.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/typography.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/text-style.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/primitive-color.light.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/primitive-color.dark.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/semantic-color.light.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/semantic-color.dark.json packages/eslint-plugin-vapor/src/data/tokens/
cp skills/token-lint/assets/resolver.json packages/eslint-plugin-vapor/src/data/tokens/
```

Verify: `ls packages/eslint-plugin-vapor/src/data/tokens/` → 11 files.

- [ ] **Step 2: Add `culori` runtime dep + `@eslint/css` optional peer**

Edit `packages/eslint-plugin-vapor/package.json`. Insert two new top-level keys (keep all existing keys intact):

```json
"dependencies": {
  "culori": "^4.0.1"
},
"peerDependenciesMeta": {
  "@eslint/css": { "optional": true }
}
```

Add to `devDependencies`:

```json
"@eslint/css": "^0.6.0"
```

Append `"@eslint/css"` (`^8.57.0 || ^9.0.0` already covers `eslint`) to the existing `peerDependencies` object:

```json
"@eslint/css": ">=0.6.0"
```

- [ ] **Step 3: Install + verify resolves**

From repo root:

```bash
pnpm install
```

Expected: no error. `pnpm --filter eslint-plugin-vapor exec node -e "require('culori/fn')"` exits 0.

- [ ] **Step 4: Write `property-scope-map.ts`**

Create `packages/eslint-plugin-vapor/src/data/property-scope-map.ts` with the full `Scope` type + `PROPERTY_SCOPE` constant. Copy entries verbatim from spec §3. Final shape:

```ts
export type Scope =
  | 'foreground'
  | 'background'
  | 'border'
  | 'dimension'
  | 'space'
  | 'borderRadius'
  | 'shadow';

export const PROPERTY_SCOPE: Record<string, readonly Scope[]> = {
  color: ['foreground'],
  fill: ['foreground'],
  stroke: ['foreground'],
  'background-color': ['background'],
  background: ['background'],
  'border-color': ['border'],
  'border-top-color': ['border'],
  'border-right-color': ['border'],
  'border-bottom-color': ['border'],
  'border-left-color': ['border'],
  'outline-color': ['border'],
  width: ['dimension'],
  'min-width': ['dimension'],
  'max-width': ['dimension'],
  height: ['dimension'],
  'min-height': ['dimension'],
  'max-height': ['dimension'],
  gap: ['space'],
  'row-gap': ['space'],
  'column-gap': ['space'],
  padding: ['space'],
  'padding-top': ['space'],
  'padding-right': ['space'],
  'padding-bottom': ['space'],
  'padding-left': ['space'],
  'padding-inline': ['space'],
  'padding-block': ['space'],
  margin: ['space'],
  'margin-top': ['space'],
  'margin-right': ['space'],
  'margin-bottom': ['space'],
  'margin-left': ['space'],
  'margin-inline': ['space'],
  'margin-block': ['space'],
  inset: ['space'],
  top: ['space'],
  right: ['space'],
  bottom: ['space'],
  left: ['space'],
  'border-radius': ['borderRadius'],
  'border-top-left-radius': ['borderRadius'],
  'border-top-right-radius': ['borderRadius'],
  'border-bottom-left-radius': ['borderRadius'],
  'border-bottom-right-radius': ['borderRadius'],
  'box-shadow': ['shadow'],
};
```

- [ ] **Step 5: Typecheck**

```bash
pnpm --filter eslint-plugin-vapor typecheck
```

Expected: PASS (no rules added yet, so existing tests untouched).

- [ ] **Step 6: Commit**

```bash
git add packages/eslint-plugin-vapor/package.json \
        packages/eslint-plugin-vapor/src/data/tokens \
        packages/eslint-plugin-vapor/src/data/property-scope-map.ts
git commit -m "feat(eslint-plugin-vapor): add token JSON assets and property-scope map"
```

---

## Task 2: Pure utils — token-scope, segment-distance, allowlist-matcher, css-value-parser

**Files:**
- Create: `src/utils/token-scope.ts`
- Create: `src/utils/token-scope.test.ts`
- Create: `src/utils/segment-distance.ts`
- Create: `src/utils/segment-distance.test.ts`
- Create: `src/utils/allowlist-matcher.ts`
- Create: `src/utils/allowlist-matcher.test.ts`
- Create: `src/utils/css-value-parser.ts`
- Create: `src/utils/css-value-parser.test.ts`

**Interfaces:**
- Consumes: `Scope` from `~/data/property-scope-map`.
- Produces:
  - `export function scopeFromTokenName(name: string): Scope | 'primitive' | null;` Rules: `name` must start with `--vapor-`; strip prefix, split on `-`; semantic color (`color-foreground-…`, `color-background-…`, `color-border-…`) → corresponding `Scope`; primitive color (`color-{red,blue,…}-…`) → `'primitive'`; `size-dimension-…` → `'dimension'`; `size-space-…` → `'space'`; `size-borderRadius-…` → `'borderRadius'`; `shadow-…` → `'shadow'`; unknown → `null`.
  - `export function segmentDistance(a: string, b: string): number | null;` Splits both strings on `-`; if segment counts differ → `null`; runs Damerau-Levenshtein per segment with per-segment cap 1; sums distances; if total > 2 → `null`; else returns the integer sum.
  - `export function matchAllowlist(name: string, patterns: readonly string[]): boolean;` Glob match: `*` matches any chars except `-` separator (use a minimatch-style implementation — convert pattern to regex with `*` → `[^-]*` and `?` → `[^-]`, anchor full string).
  - `export interface ParsedValueToken { type: 'var'; name: string; offset: number; }`
  - `export interface ParsedValueHex { type: 'hex'; raw: string; normalized: string; offset: number; }` — `normalized` is lower `#rrggbb` (or `#rrggbbaa` for 8-digit / 4-digit shorthand).
  - `export interface ParsedValueDimension { type: 'dimension'; raw: string; value: number; unit: string; offset: number; }`
  - `export type ParsedValuePart = ParsedValueToken | ParsedValueHex | ParsedValueDimension;`
  - `export function parseDeclarationValue(valueNode: unknown): ParsedValuePart[];` Walks the `@eslint/css` value AST: collects `Function(name==="var")` first-arg `Identifier` (token); `Hash` nodes (hex); `Dimension` nodes (number + unit). Each carries the byte offset from the value AST node. Other node kinds are ignored. (The function's input is loosely typed because `@eslint/css` AST types are pre-1.0; cast to a minimal shape inside.)

- [ ] **Step 1: Write failing test for `scopeFromTokenName`**

Create `src/utils/token-scope.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { scopeFromTokenName } from './token-scope';

describe('scopeFromTokenName', () => {
  it('returns foreground for semantic foreground tokens', () => {
    expect(scopeFromTokenName('--vapor-color-foreground-primary-100')).toBe('foreground');
  });
  it('returns background for semantic background tokens', () => {
    expect(scopeFromTokenName('--vapor-color-background-secondary-100')).toBe('background');
  });
  it('returns border for semantic border tokens', () => {
    expect(scopeFromTokenName('--vapor-color-border-primary-100')).toBe('border');
  });
  it('returns primitive for primitive color tokens', () => {
    expect(scopeFromTokenName('--vapor-color-blue-600')).toBe('primitive');
  });
  it('returns dimension for size-dimension tokens', () => {
    expect(scopeFromTokenName('--vapor-size-dimension-150')).toBe('dimension');
  });
  it('returns space for size-space tokens', () => {
    expect(scopeFromTokenName('--vapor-size-space-200')).toBe('space');
  });
  it('returns borderRadius for size-borderRadius tokens', () => {
    expect(scopeFromTokenName('--vapor-size-borderRadius-300')).toBe('borderRadius');
  });
  it('returns shadow for shadow tokens', () => {
    expect(scopeFromTokenName('--vapor-shadow-md')).toBe('shadow');
  });
  it('returns null for non-vapor tokens', () => {
    expect(scopeFromTokenName('--my-token')).toBe(null);
  });
  it('returns null for unknown vapor segments', () => {
    expect(scopeFromTokenName('--vapor-foo-bar')).toBe(null);
  });
});
```

- [ ] **Step 2: Run and confirm fail**

```bash
pnpm --filter eslint-plugin-vapor test src/utils/token-scope.test.ts
```

Expected: FAIL `Cannot find module './token-scope'`.

- [ ] **Step 3: Implement `token-scope.ts`**

```ts
import type { Scope } from '~/data/property-scope-map';

export function scopeFromTokenName(name: string): Scope | 'primitive' | null {
  if (!name.startsWith('--vapor-')) return null;
  const segments = name.slice('--vapor-'.length).split('-');
  if (segments[0] === 'color') {
    const second = segments[1];
    if (second === 'foreground' || second === 'background' || second === 'border') {
      return second;
    }
    return 'primitive';
  }
  if (segments[0] === 'size') {
    const second = segments[1];
    if (second === 'dimension' || second === 'space' || second === 'borderRadius') {
      return second;
    }
  }
  if (segments[0] === 'shadow') return 'shadow';
  return null;
}
```

- [ ] **Step 4: Tests pass**

```bash
pnpm --filter eslint-plugin-vapor test src/utils/token-scope.test.ts
```

Expected: PASS (10 cases).

- [ ] **Step 5: Write failing tests for `segmentDistance`**

Create `src/utils/segment-distance.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { segmentDistance } from './segment-distance';

describe('segmentDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(segmentDistance('--vapor-color-foreground-primary-100', '--vapor-color-foreground-primary-100')).toBe(0);
  });
  it('returns 1 for one-char typo within one segment', () => {
    expect(segmentDistance('--vapor-color-foregruond-primary-100', '--vapor-color-foreground-primary-100')).toBe(1);
  });
  it('returns null when segment counts differ', () => {
    expect(segmentDistance('--vapor-color-foreground-primary', '--vapor-color-foreground-primary-100')).toBe(null);
  });
  it('returns null when per-segment distance > 1', () => {
    expect(segmentDistance('--vapor-color-xxxxxxxxxx-primary-100', '--vapor-color-foreground-primary-100')).toBe(null);
  });
  it('returns null when total distance > 2', () => {
    expect(segmentDistance('--vapr-clor-foregruond-primary-100', '--vapor-color-foreground-primary-100')).toBe(null);
  });
  it('handles Damerau transposition as distance 1', () => {
    expect(segmentDistance('--vapor-color-foregruond-primary-100', '--vapor-color-foreground-primary-100')).toBe(1);
  });
});
```

- [ ] **Step 6: Confirm fail, then implement `segment-distance.ts`**

```bash
pnpm --filter eslint-plugin-vapor test src/utils/segment-distance.test.ts  # FAIL
```

```ts
function damerauLevenshtein(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    let rowMin = Number.POSITIVE_INFINITY;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
      rowMin = Math.min(rowMin, dp[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return dp[m][n];
}

export function segmentDistance(a: string, b: string): number | null {
  const segA = a.split('-');
  const segB = b.split('-');
  if (segA.length !== segB.length) return null;
  let total = 0;
  for (let i = 0; i < segA.length; i++) {
    const d = damerauLevenshtein(segA[i], segB[i], 1);
    if (d > 1) return null;
    total += d;
    if (total > 2) return null;
  }
  return total;
}
```

Run again → PASS (6 cases).

- [ ] **Step 7: Write failing tests for `matchAllowlist`**

Create `src/utils/allowlist-matcher.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { matchAllowlist } from './allowlist-matcher';

describe('matchAllowlist', () => {
  it('returns false for empty patterns', () => {
    expect(matchAllowlist('--vapor-app-x', [])).toBe(false);
  });
  it('matches exact name', () => {
    expect(matchAllowlist('--vapor-app-color', ['--vapor-app-color'])).toBe(true);
  });
  it('matches single * within last segment', () => {
    expect(matchAllowlist('--vapor-app-color', ['--vapor-app-*'])).toBe(true);
  });
  it('does not match across `-` separator when using single *', () => {
    expect(matchAllowlist('--vapor-app-color-x', ['--vapor-app-*'])).toBe(false);
  });
  it('returns false when no pattern matches', () => {
    expect(matchAllowlist('--vapor-color-blue-100', ['--vapor-app-*'])).toBe(false);
  });
});
```

- [ ] **Step 8: Confirm fail, implement `allowlist-matcher.ts`**

```ts
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const body = escaped.replace(/\*/g, '[^-]*').replace(/\?/g, '[^-]');
  return new RegExp(`^${body}$`);
}

export function matchAllowlist(name: string, patterns: readonly string[]): boolean {
  for (const p of patterns) {
    if (patternToRegex(p).test(name)) return true;
  }
  return false;
}
```

Run → PASS.

- [ ] **Step 9: Write failing tests for `parseDeclarationValue`**

Create `src/utils/css-value-parser.test.ts`. Tests construct minimal AST-shaped objects matching `@eslint/css` value nodes (sufficient for the parser; we don't need the full parser running):

```ts
import { describe, it, expect } from 'vitest';
import { parseDeclarationValue } from './css-value-parser';

describe('parseDeclarationValue', () => {
  it('extracts a var() token', () => {
    const ast = {
      type: 'Value',
      children: [
        {
          type: 'Function',
          name: 'var',
          children: [{ type: 'Identifier', name: '--vapor-color-foreground-primary-100', loc: { start: { offset: 4 } } }],
        },
      ],
    };
    const result = parseDeclarationValue(ast);
    expect(result).toEqual([{ type: 'var', name: '--vapor-color-foreground-primary-100', offset: 4 }]);
  });

  it('extracts hex literal and normalizes shorthand', () => {
    const ast = {
      type: 'Value',
      children: [{ type: 'Hash', value: 'FFF', loc: { start: { offset: 0 } } }],
    };
    expect(parseDeclarationValue(ast)).toEqual([{ type: 'hex', raw: '#FFF', normalized: '#ffffff', offset: 0 }]);
  });

  it('extracts 8-digit hex', () => {
    const ast = {
      type: 'Value',
      children: [{ type: 'Hash', value: '12345678', loc: { start: { offset: 0 } } }],
    };
    expect(parseDeclarationValue(ast)).toEqual([{ type: 'hex', raw: '#12345678', normalized: '#12345678', offset: 0 }]);
  });

  it('extracts a px Dimension', () => {
    const ast = {
      type: 'Value',
      children: [{ type: 'Dimension', value: '12', unit: 'px', loc: { start: { offset: 0 } } }],
    };
    expect(parseDeclarationValue(ast)).toEqual([{ type: 'dimension', raw: '12px', value: 12, unit: 'px', offset: 0 }]);
  });

  it('ignores rem dimensions (out of scope v1) — but still yields the part for the rule to filter', () => {
    const ast = {
      type: 'Value',
      children: [{ type: 'Dimension', value: '1', unit: 'rem', loc: { start: { offset: 0 } } }],
    };
    expect(parseDeclarationValue(ast)).toEqual([{ type: 'dimension', raw: '1rem', value: 1, unit: 'rem', offset: 0 }]);
  });

  it('collects multiple parts from a shorthand', () => {
    const ast = {
      type: 'Value',
      children: [
        { type: 'Dimension', value: '12', unit: 'px', loc: { start: { offset: 0 } } },
        { type: 'Dimension', value: '8', unit: 'px', loc: { start: { offset: 5 } } },
      ],
    };
    expect(parseDeclarationValue(ast)).toHaveLength(2);
  });
});
```

- [ ] **Step 10: Confirm fail, implement `css-value-parser.ts`**

```ts
export interface ParsedValueToken { type: 'var'; name: string; offset: number; }
export interface ParsedValueHex { type: 'hex'; raw: string; normalized: string; offset: number; }
export interface ParsedValueDimension { type: 'dimension'; raw: string; value: number; unit: string; offset: number; }
export type ParsedValuePart = ParsedValueToken | ParsedValueHex | ParsedValueDimension;

interface NodeLike {
  type?: string;
  name?: string;
  value?: string | number;
  unit?: string;
  children?: NodeLike[];
  loc?: { start?: { offset?: number } };
}

function normalizeHex(raw: string): string {
  const hex = raw.toLowerCase();
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  if (hex.length === 4) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return `#${hex}`;
}

export function parseDeclarationValue(valueNode: unknown): ParsedValuePart[] {
  const out: ParsedValuePart[] = [];
  const root = valueNode as NodeLike;

  function walk(node: NodeLike | undefined): void {
    if (!node) return;
    const offset = node.loc?.start?.offset ?? 0;
    if (node.type === 'Function' && node.name === 'var') {
      const first = node.children?.[0];
      if (first?.type === 'Identifier' && typeof first.name === 'string') {
        out.push({ type: 'var', name: first.name, offset: first.loc?.start?.offset ?? offset });
      }
      return;
    }
    if (node.type === 'Hash' && typeof node.value === 'string') {
      out.push({ type: 'hex', raw: `#${node.value}`, normalized: normalizeHex(node.value), offset });
      return;
    }
    if (node.type === 'Dimension' && node.value != null && typeof node.unit === 'string') {
      const num = typeof node.value === 'number' ? node.value : Number(node.value);
      out.push({ type: 'dimension', raw: `${node.value}${node.unit}`, value: num, unit: node.unit, offset });
      return;
    }
    if (Array.isArray(node.children)) {
      for (const c of node.children) walk(c);
    }
  }

  walk(root);
  return out;
}
```

Run → PASS.

- [ ] **Step 11: Full util suite + typecheck**

```bash
pnpm --filter eslint-plugin-vapor test src/utils
pnpm --filter eslint-plugin-vapor typecheck
```

Both PASS.

- [ ] **Step 12: Commit**

```bash
git add packages/eslint-plugin-vapor/src/utils
git commit -m "feat(eslint-plugin-vapor): add pure utils for token scope, distance, allowlist, value parsing"
```

---

## Task 3: Color resolver + token index

**Files:**
- Create: `src/utils/color-resolver.ts`
- Create: `src/utils/color-resolver.test.ts`
- Create: `src/utils/token-index.ts`
- Create: `src/utils/token-index.test.ts`

**Interfaces:**
- Consumes: `Scope` from `~/data/property-scope-map`; `scopeFromTokenName` from `~/utils/token-scope`; the 11 token JSON files from `~/data/tokens/*.json`.
- Produces:
  - `export function oklchToHex(components: readonly [number, number, number], alpha?: number): string;` Uses `culori/fn` (`formatHex` / `formatHex8`) and returns lower `#rrggbb` or `#rrggbbaa`.
  - `export type TokenKind = 'semantic' | 'primitive' | 'foundation';`
  - `export interface TokenMeta { name: string; kind: TokenKind; scope: Scope | 'primitive'; hex?: string; px?: number; }`
  - `export interface TokenIndex { canonicalTokens: ReadonlySet<string>; tokenMeta: ReadonlyMap<string, TokenMeta>; byHex: ReadonlyMap<string, readonly string[]>; byPx: ReadonlyMap<number, readonly string[]>; }`
  - `export function buildTokenIndex(): TokenIndex;` Walks the 11 JSON files, builds name strings using DTCG path convention (`category.subcategory.name` joined by `-`, prefixed with `--vapor-`), resolves primitive oklch → hex, resolves semantic color value refs `{colors.blue.100}` to primitive hex (light theme only), and emits px values from `dimension`/`space`/`borderRadius`. `shadow` tokens get name only (no hex/px). Names use the JSON path segments verbatim — confirm with a unit test that at least one known token round-trips (`--vapor-color-foreground-primary-100`).
  - `export const TOKEN_INDEX: TokenIndex;` (memoized singleton — call `buildTokenIndex()` once at module load).

- [ ] **Step 1: Write failing test for `oklchToHex`**

Create `src/utils/color-resolver.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { oklchToHex } from './color-resolver';

describe('oklchToHex', () => {
  it('converts white (1, 0, 0) to #ffffff', () => {
    expect(oklchToHex([1, 0, 0])).toBe('#ffffff');
  });
  it('converts black (0, 0, 0) to #000000', () => {
    expect(oklchToHex([0, 0, 0])).toBe('#000000');
  });
  it('emits 8-digit hex when alpha < 1', () => {
    const out = oklchToHex([1, 0, 0], 0.5);
    expect(out).toMatch(/^#ffffff[0-9a-f]{2}$/);
  });
});
```

Run → FAIL.

- [ ] **Step 2: Implement `color-resolver.ts`**

```ts
import { formatHex, formatHex8, type Color } from 'culori/fn';

export function oklchToHex(components: readonly [number, number, number], alpha?: number): string {
  const color: Color = {
    mode: 'oklch',
    l: components[0],
    c: components[1],
    h: components[2],
    alpha: alpha,
  };
  const result = alpha != null && alpha < 1 ? formatHex8(color) : formatHex(color);
  return (result ?? '#000000').toLowerCase();
}
```

If `culori/fn` does not export `Color`, declare a local type:

```ts
type Color = { mode: 'oklch'; l: number; c: number; h: number; alpha?: number };
```

Run → PASS.

- [ ] **Step 3: Write failing test for `buildTokenIndex`**

Create `src/utils/token-index.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TOKEN_INDEX } from './token-index';

describe('TOKEN_INDEX', () => {
  it('contains semantic foreground tokens', () => {
    expect(TOKEN_INDEX.canonicalTokens.has('--vapor-color-foreground-primary-100')).toBe(true);
  });
  it('contains primitive color tokens', () => {
    expect(TOKEN_INDEX.canonicalTokens.has('--vapor-color-blue-600')).toBe(true);
  });
  it('contains foundation size tokens', () => {
    expect(TOKEN_INDEX.canonicalTokens.has('--vapor-size-space-150')).toBe(true);
  });
  it('meta records scope and kind correctly', () => {
    const meta = TOKEN_INDEX.tokenMeta.get('--vapor-color-foreground-primary-100');
    expect(meta?.kind).toBe('semantic');
    expect(meta?.scope).toBe('foreground');
  });
  it('byPx looks up dimension tokens', () => {
    const names = TOKEN_INDEX.byPx.get(12);
    expect(names).toBeDefined();
    expect(names!.some((n) => n === '--vapor-size-space-150' || n === '--vapor-size-dimension-150')).toBe(true);
  });
  it('byHex looks up primitive color tokens', () => {
    // pick whichever hex maps to a known primitive; assert that at least one primitive matches the white token
    const whites = TOKEN_INDEX.byHex.get('#ffffff') ?? [];
    expect(whites.some((n) => TOKEN_INDEX.tokenMeta.get(n)?.kind === 'primitive')).toBe(true);
  });
});
```

Run → FAIL.

- [ ] **Step 4: Implement `token-index.ts`**

Skeleton:

```ts
import type { Scope } from '~/data/property-scope-map';
import { scopeFromTokenName } from './token-scope';
import { oklchToHex } from './color-resolver';

import borderRadius from '~/data/tokens/border-radius.json';
import dimension from '~/data/tokens/dimension.json';
import space from '~/data/tokens/space.json';
import shadow from '~/data/tokens/shadow.json';
import primitiveColorLight from '~/data/tokens/primitive-color.light.json';
import semanticColorLight from '~/data/tokens/semantic-color.light.json';

export type TokenKind = 'semantic' | 'primitive' | 'foundation';

export interface TokenMeta {
  name: string;
  kind: TokenKind;
  scope: Scope | 'primitive';
  hex?: string;
  px?: number;
}

export interface TokenIndex {
  canonicalTokens: ReadonlySet<string>;
  tokenMeta: ReadonlyMap<string, TokenMeta>;
  byHex: ReadonlyMap<string, readonly string[]>;
  byPx: ReadonlyMap<number, readonly string[]>;
}

interface IndexBuilder {
  canonical: Set<string>;
  meta: Map<string, TokenMeta>;
  hexIndex: Map<string, string[]>;
  pxIndex: Map<number, string[]>;
}

function nameFromPath(prefix: string, path: readonly string[]): string {
  return `--vapor-${[prefix, ...path].filter(Boolean).join('-')}`;
}

function pushIndex<K>(map: Map<K, string[]>, key: K, name: string): void {
  const list = map.get(key) ?? [];
  list.push(name);
  map.set(key, list);
}

function walkFoundation(
  b: IndexBuilder,
  json: unknown,
  prefix: string,
  scope: Scope,
): void {
  // Recurse object tree; leaves carry $value: { value, unit }
  const visit = (node: unknown, path: string[]): void => {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    if ('$value' in obj && obj.$value && typeof obj.$value === 'object') {
      const v = obj.$value as { value?: number; unit?: string };
      if (typeof v.value === 'number' && v.unit === 'px') {
        const name = nameFromPath(prefix, path);
        b.canonical.add(name);
        b.meta.set(name, { name, kind: 'foundation', scope, px: v.value });
        pushIndex(b.pxIndex, v.value, name);
      }
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$')) continue;
      visit(v, [...path, k]);
    }
  };
  visit(json, []);
}

function walkPrimitiveColors(b: IndexBuilder, json: unknown): void {
  const visit = (node: unknown, path: string[]): void => {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    if ('$type' in obj && obj.$type === 'color' && '$value' in obj) {
      const value = obj.$value as { colorSpace?: string; components?: [number, number, number]; alpha?: number };
      if (value?.colorSpace === 'oklch' && Array.isArray(value.components)) {
        const name = nameFromPath('color', path);
        const hex = oklchToHex(value.components, value.alpha);
        b.canonical.add(name);
        b.meta.set(name, { name, kind: 'primitive', scope: 'primitive', hex });
        pushIndex(b.hexIndex, hex, name);
      }
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$')) continue;
      visit(v, [...path, k]);
    }
  };
  // top-level object has `colors: { ... }` per spec
  const root = (json as { colors?: unknown }).colors;
  visit(root, []);
}

function walkSemanticColors(b: IndexBuilder, json: unknown, primitiveByName: ReadonlyMap<string, string>): void {
  // semantic leaves carry $value as reference string: "{colors.blue.100}"
  const visit = (node: unknown, path: string[]): void => {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    if ('$value' in obj && typeof obj.$value === 'string') {
      const ref = obj.$value.trim();
      if (ref.startsWith('{') && ref.endsWith('}')) {
        const refPath = ref.slice(1, -1).split('.');
        // refPath looks like ['colors', 'blue', '100']; turn into primitive name --vapor-color-blue-100
        const primName = `--vapor-${refPath.join('-')}`;
        const hex = primitiveByName.get(primName);
        const name = nameFromPath('color', path);
        const scope = scopeFromTokenName(name);
        if (scope === 'foreground' || scope === 'background' || scope === 'border') {
          b.canonical.add(name);
          b.meta.set(name, { name, kind: 'semantic', scope, hex });
          if (hex) pushIndex(b.hexIndex, hex, name);
        }
      }
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$')) continue;
      visit(v, [...path, k]);
    }
  };
  const root = (json as { colors?: unknown }).colors;
  visit(root, []);
}

function walkShadow(b: IndexBuilder, json: unknown): void {
  const root = (json as { shadow?: Record<string, unknown> }).shadow ?? {};
  for (const [k, v] of Object.entries(root)) {
    if (k.startsWith('$') || !v || typeof v !== 'object') continue;
    const name = `--vapor-shadow-${k}`;
    b.canonical.add(name);
    b.meta.set(name, { name, kind: 'foundation', scope: 'shadow' });
  }
}

export function buildTokenIndex(): TokenIndex {
  const b: IndexBuilder = {
    canonical: new Set(),
    meta: new Map(),
    hexIndex: new Map(),
    pxIndex: new Map(),
  };

  walkFoundation(b, (dimension as { size?: { dimension?: unknown } }).size?.dimension, 'size-dimension', 'dimension');
  walkFoundation(b, (space as { size?: { space?: unknown } }).size?.space, 'size-space', 'space');
  walkFoundation(b, (borderRadius as { size?: { borderRadius?: unknown } }).size?.borderRadius, 'size-borderRadius', 'borderRadius');
  walkPrimitiveColors(b, primitiveColorLight);
  // Build primitive lookup BEFORE semantic walk
  const primitiveByName = new Map<string, string>();
  for (const [name, meta] of b.meta) {
    if (meta.kind === 'primitive' && meta.hex) primitiveByName.set(name, meta.hex);
  }
  walkSemanticColors(b, semanticColorLight, primitiveByName);
  walkShadow(b, shadow);

  return {
    canonicalTokens: b.canonical,
    tokenMeta: b.meta,
    byHex: b.hexIndex,
    byPx: b.pxIndex,
  };
}

export const TOKEN_INDEX: TokenIndex = buildTokenIndex();
```

Add `"resolveJsonModule": true` + `"esModuleInterop": true` to `tsconfig.json` if not already present — check first; the existing config likely already enables both.

- [ ] **Step 5: Tests pass**

```bash
pnpm --filter eslint-plugin-vapor test src/utils/token-index.test.ts
pnpm --filter eslint-plugin-vapor test src/utils/color-resolver.test.ts
pnpm --filter eslint-plugin-vapor typecheck
```

All PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/eslint-plugin-vapor/src/utils/color-resolver.ts \
        packages/eslint-plugin-vapor/src/utils/color-resolver.test.ts \
        packages/eslint-plugin-vapor/src/utils/token-index.ts \
        packages/eslint-plugin-vapor/src/utils/token-index.test.ts
git commit -m "feat(eslint-plugin-vapor): build in-memory token index from JSON assets"
```

---

## Task 4: Rule A — `css/no-invalid-design-token`

**Files:**
- Create: `src/rules/css/no-invalid-design-token.ts`
- Create: `src/rules/css/no-invalid-design-token.test.ts`

**Interfaces:**
- Consumes: `TOKEN_INDEX` from `~/utils/token-index`; `parseDeclarationValue` from `~/utils/css-value-parser`; `segmentDistance` from `~/utils/segment-distance`; `matchAllowlist` from `~/utils/allowlist-matcher`.
- Produces: `export const noInvalidDesignTokenRule: Rule.RuleModule;` with:
  - `meta.type: 'problem'`
  - `meta.hasSuggestions: true`
  - `meta.schema`: `[{ type: 'object', properties: { allowCustomTokens: { type: 'array', items: { type: 'string' } } }, additionalProperties: false }]`
  - `meta.messages`:
    - `unknownToken: '"{{ token }}" is not a Vapor design token.'`
    - `unknownTokenWithSuggestions: '"{{ token }}" is not a Vapor design token. Did you mean: {{ candidates }}?'`
    - `replaceWithToken: 'Replace with "{{ candidate }}"'`
  - Visitor: `'Declaration'(node)` reads `node.value` via `parseDeclarationValue`. For each `var` part whose `name` starts with `--vapor-`: skip if `TOKEN_INDEX.canonicalTokens.has(name)`; skip if `matchAllowlist(name, options.allowCustomTokens ∪ context.settings.vapor?.customTokens)`. Else compute up to 3 candidates: walk `TOKEN_INDEX.canonicalTokens`, keep those with `segmentDistance ≤ 2`, sort ascending, take 3. Report at the var-arg offset (use `node.value.loc` + part.offset). Emit `replaceWithToken` suggestion per candidate.
  - **Public artifact for downstream tasks:** rule B + C must skip tokens that A reported. Expose a tiny helper file (read on by both rules):
    - Add `export function isCanonicalToken(name: string): boolean { return TOKEN_INDEX.canonicalTokens.has(name); }` inside `~/utils/token-index.ts` (extend Task 3's file in this commit if needed).

- [ ] **Step 1: Write failing test scaffold**

Create `src/rules/css/no-invalid-design-token.test.ts`:

```ts
import { RuleTester } from 'eslint';
import css from '@eslint/css';
import { describe, it } from 'vitest';
import { noInvalidDesignTokenRule } from './no-invalid-design-token';

const ruleTester = new RuleTester({
  plugins: { css },
  language: 'css/css',
});

describe('css/no-invalid-design-token', () => {
  it('runs', () => {
    ruleTester.run('no-invalid-design-token', noInvalidDesignTokenRule, {
      valid: [
        { code: '.x { color: var(--vapor-color-foreground-primary-100); }' },
        { code: '.x { width: var(--vapor-size-dimension-150); }' },
        { code: '.x { color: var(--vapor-app-color); }', options: [{ allowCustomTokens: ['--vapor-app-*'] }] },
        { code: '.x { color: var(--my-token); }' }, // non-vapor → skip
        { code: '.x { color: red; }' }, // no var() → skip
      ],
      invalid: [
        {
          code: '.x { color: var(--vapor-color-foregruond-primary-100); }',
          errors: [
            {
              messageId: 'unknownTokenWithSuggestions',
              data: {
                token: '--vapor-color-foregruond-primary-100',
                candidates: '--vapor-color-foreground-primary-100',
              },
            },
          ],
        },
        {
          code: '.x { color: var(--vapor-totally-unknown-xx-yy); }',
          errors: [{ messageId: 'unknownToken' }],
        },
        {
          code: '.x { color: var(--vapor-color-foregruond-primary-100); }',
          errors: [
            {
              messageId: 'unknownTokenWithSuggestions',
              suggestions: [
                {
                  messageId: 'replaceWithToken',
                  data: { candidate: '--vapor-color-foreground-primary-100' },
                  output: '.x { color: var(--vapor-color-foreground-primary-100); }',
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
```

Run → FAIL.

- [ ] **Step 2: Implement the rule (minimal — pass single failing case first)**

Create `src/rules/css/no-invalid-design-token.ts`:

```ts
import type { Rule } from 'eslint';

import { TOKEN_INDEX } from '~/utils/token-index';
import { parseDeclarationValue } from '~/utils/css-value-parser';
import { segmentDistance } from '~/utils/segment-distance';
import { matchAllowlist } from '~/utils/allowlist-matcher';

interface Options { allowCustomTokens?: readonly string[]; }

function findCandidates(name: string): string[] {
  const scored: Array<{ name: string; dist: number }> = [];
  for (const canonical of TOKEN_INDEX.canonicalTokens) {
    const d = segmentDistance(name, canonical);
    if (d !== null) scored.push({ name: canonical, dist: d });
  }
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, 3).map((c) => c.name);
}

export const noInvalidDesignTokenRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Disallow CSS var() references to Vapor design tokens that are not in the catalog.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowCustomTokens: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknownToken: '"{{ token }}" is not a Vapor design token.',
      unknownTokenWithSuggestions:
        '"{{ token }}" is not a Vapor design token. Did you mean: {{ candidates }}?',
      replaceWithToken: 'Replace with "{{ candidate }}"',
    },
  },

  create(context) {
    const opts = (context.options[0] ?? {}) as Options;
    const settingsAllow =
      (context.settings as { vapor?: { customTokens?: readonly string[] } }).vapor?.customTokens ?? [];
    const allow: readonly string[] = [...(opts.allowCustomTokens ?? []), ...settingsAllow];

    return {
      Declaration(node: unknown) {
        const decl = node as { value?: unknown; loc?: unknown };
        const parts = parseDeclarationValue(decl.value);
        for (const part of parts) {
          if (part.type !== 'var') continue;
          if (!part.name.startsWith('--vapor-')) continue;
          if (TOKEN_INDEX.canonicalTokens.has(part.name)) continue;
          if (allow.length && matchAllowlist(part.name, allow)) continue;

          const candidates = findCandidates(part.name);
          const reportNode = (decl as { value: { loc: unknown } }).value;

          if (candidates.length > 0) {
            context.report({
              node: reportNode as never,
              messageId: 'unknownTokenWithSuggestions',
              data: { token: part.name, candidates: candidates.join(', ') },
              suggest: candidates.map((c) => ({
                messageId: 'replaceWithToken',
                data: { candidate: c },
                fix(fixer) {
                  const valueNode = decl.value as { range?: [number, number] };
                  // Replace the token name inside the value range; compute exact span via offset + length.
                  const tokenStart = (valueNode.range?.[0] ?? 0) + part.offset;
                  const tokenEnd = tokenStart + part.name.length;
                  return fixer.replaceTextRange([tokenStart, tokenEnd], c);
                },
              })),
            });
          } else {
            context.report({
              node: reportNode as never,
              messageId: 'unknownToken',
              data: { token: part.name },
            });
          }
        }
      },
    };
  },
};
```

Run → PASS.

- [ ] **Step 3: Add edge-case tests + re-run**

Append to the test file:

```ts
// inside the same ruleTester.run call's invalid array
{
  code: '.x { color: var(--vapor-color-foreground-primary-100); width: var(--vapor-typo-broken-name); }',
  errors: [{ messageId: 'unknownToken' }], // only the typo'd one
},
{
  code: '.x { color: var(--vapor-app-x); }', // not allow-listed → still invalid (suggestion 0)
  errors: [{ messageId: 'unknownToken' }],
},
```

Add another `valid` row exercising `context.settings.vapor.customTokens`:

```ts
{
  code: '.x { color: var(--vapor-app-color); }',
  settings: { vapor: { customTokens: ['--vapor-app-*'] } },
},
```

Run → PASS.

- [ ] **Step 4: Typecheck + lint**

```bash
pnpm --filter eslint-plugin-vapor typecheck
pnpm --filter eslint-plugin-vapor lint
```

PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/rules/css/no-invalid-design-token.ts \
        packages/eslint-plugin-vapor/src/rules/css/no-invalid-design-token.test.ts
git commit -m "feat(eslint-plugin-vapor): add css/no-invalid-design-token rule"
```

---

## Task 5: Rule B — `css/token-scope-mismatch`

**Files:**
- Create: `src/rules/css/token-scope-mismatch.ts`
- Create: `src/rules/css/token-scope-mismatch.test.ts`

**Interfaces:**
- Consumes: `TOKEN_INDEX`, `PROPERTY_SCOPE`, `Scope`, `parseDeclarationValue`.
- Produces: `export const tokenScopeMismatchRule: Rule.RuleModule;` with:
  - `meta.messages`:
    - `scopeMismatch: '"{{ token }}" has scope "{{ tokenScope }}" but "{{ property }}" expects {{ expectedScopes }}.'`
    - `scopeMismatchWithSuggestions: '"{{ token }}" has scope "{{ tokenScope }}" but "{{ property }}" expects {{ expectedScopes }}. Candidate: {{ candidates }}.'`
    - `replaceWithToken: 'Replace with "{{ candidate }}"'`
  - Options schema:

```ts
{
  propertyScopeMap?: Record<string, Scope[]>;   // merged into PROPERTY_SCOPE
  ignoreProperties?: string[];
}
```

  - Visitor `Declaration`: skip if `parts` empty; for each `var` part whose name is canonical and `tokenMeta.scope !== 'primitive'`:
    1. Lookup `expectedScopes = mergedMap[property]`. If undefined → skip.
    2. If `options.ignoreProperties?.includes(property)` → skip.
    3. If `tokenScope ∈ expectedScopes` → skip.
    4. Candidates: for color tokens — `byHex.get(meta.hex!)` filtered to semantic tokens whose scope is in `expectedScopes`; for foundation — `byPx.get(meta.px!)` filtered by expected scope category. Take top 3.
    5. Report `scopeMismatch` or `scopeMismatchWithSuggestions` accordingly.
  - Primitive color tokens (`scope === 'primitive'`) are NOT this rule's concern (Rule C handles them).

- [ ] **Step 1: Failing test**

Create `src/rules/css/token-scope-mismatch.test.ts`:

```ts
import { RuleTester } from 'eslint';
import css from '@eslint/css';
import { describe, it } from 'vitest';
import { tokenScopeMismatchRule } from './token-scope-mismatch';

const ruleTester = new RuleTester({ plugins: { css }, language: 'css/css' });

describe('css/token-scope-mismatch', () => {
  it('runs', () => {
    ruleTester.run('token-scope-mismatch', tokenScopeMismatchRule, {
      valid: [
        { code: '.x { color: var(--vapor-color-foreground-primary-100); }' },
        { code: '.x { background: var(--vapor-color-background-primary-100); }' },
        { code: '.x { width: var(--vapor-size-dimension-150); }' },
        { code: '.x { color: var(--vapor-color-foreground-primary-100); }', options: [{ ignoreProperties: ['color'] }] },
        { code: '.x { unknown-prop: var(--vapor-color-background-primary-100); }' }, // unknown prop skips
        { code: '.x { color: var(--vapor-color-blue-600); }' }, // primitive → Rule C's job; skip here
      ],
      invalid: [
        {
          code: '.x { color: var(--vapor-color-background-secondary-100); }',
          errors: [
            {
              messageId: 'scopeMismatchWithSuggestions',
              data: {
                token: '--vapor-color-background-secondary-100',
                tokenScope: 'background',
                property: 'color',
                expectedScopes: 'foreground',
                candidates: '--vapor-color-foreground-secondary-100',
              },
            },
          ],
        },
        {
          code: '.x { width: var(--vapor-size-space-150); }',
          errors: [{ messageId: 'scopeMismatchWithSuggestions' }],
        },
      ],
    });
  });
});
```

Run → FAIL.

- [ ] **Step 2: Implement the rule**

Create `src/rules/css/token-scope-mismatch.ts`:

```ts
import type { Rule } from 'eslint';

import { PROPERTY_SCOPE, type Scope } from '~/data/property-scope-map';
import { TOKEN_INDEX } from '~/utils/token-index';
import { parseDeclarationValue } from '~/utils/css-value-parser';

interface Options {
  propertyScopeMap?: Record<string, Scope[]>;
  ignoreProperties?: readonly string[];
}

export const tokenScopeMismatchRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Disallow Vapor design tokens whose scope does not match the CSS property scope.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          propertyScopeMap: { type: 'object' },
          ignoreProperties: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      scopeMismatch:
        '"{{ token }}" has scope "{{ tokenScope }}" but "{{ property }}" expects {{ expectedScopes }}.',
      scopeMismatchWithSuggestions:
        '"{{ token }}" has scope "{{ tokenScope }}" but "{{ property }}" expects {{ expectedScopes }}. Candidate: {{ candidates }}.',
      replaceWithToken: 'Replace with "{{ candidate }}"',
    },
  },

  create(context) {
    const opts = (context.options[0] ?? {}) as Options;
    const ignoreProps = new Set(opts.ignoreProperties ?? []);
    const mergedMap: Record<string, readonly Scope[]> = { ...PROPERTY_SCOPE, ...(opts.propertyScopeMap ?? {}) };

    return {
      Declaration(node: unknown) {
        const decl = node as { property?: string; value?: unknown };
        const property = decl.property;
        if (!property) return;
        if (ignoreProps.has(property)) return;
        const expectedScopes = mergedMap[property];
        if (!expectedScopes) return;

        const parts = parseDeclarationValue(decl.value);
        for (const part of parts) {
          if (part.type !== 'var') continue;
          const meta = TOKEN_INDEX.tokenMeta.get(part.name);
          if (!meta) continue; // not canonical → Rule A's job
          if (meta.scope === 'primitive') continue; // → Rule C
          if (expectedScopes.includes(meta.scope as Scope)) continue;

          let candidates: string[] = [];
          if (meta.hex) {
            const matches = TOKEN_INDEX.byHex.get(meta.hex) ?? [];
            candidates = matches
              .filter((n) => {
                const m = TOKEN_INDEX.tokenMeta.get(n);
                return m?.kind === 'semantic' && expectedScopes.includes(m.scope as Scope);
              })
              .slice(0, 3);
          } else if (meta.px != null) {
            const matches = TOKEN_INDEX.byPx.get(meta.px) ?? [];
            candidates = matches
              .filter((n) => {
                const m = TOKEN_INDEX.tokenMeta.get(n);
                return m?.kind === 'foundation' && expectedScopes.includes(m.scope as Scope);
              })
              .slice(0, 3);
          }

          const reportNode = (decl as { value: unknown }).value;
          if (candidates.length > 0) {
            context.report({
              node: reportNode as never,
              messageId: 'scopeMismatchWithSuggestions',
              data: {
                token: part.name,
                tokenScope: String(meta.scope),
                property,
                expectedScopes: expectedScopes.join(', '),
                candidates: candidates.join(', '),
              },
              suggest: candidates.map((c) => ({
                messageId: 'replaceWithToken',
                data: { candidate: c },
                fix(fixer) {
                  const valueNode = decl.value as { range?: [number, number] };
                  const tokenStart = (valueNode.range?.[0] ?? 0) + part.offset;
                  const tokenEnd = tokenStart + part.name.length;
                  return fixer.replaceTextRange([tokenStart, tokenEnd], c);
                },
              })),
            });
          } else {
            context.report({
              node: reportNode as never,
              messageId: 'scopeMismatch',
              data: {
                token: part.name,
                tokenScope: String(meta.scope),
                property,
                expectedScopes: expectedScopes.join(', '),
              },
            });
          }
        }
      },
    };
  },
};
```

Run → PASS for the seed cases.

- [ ] **Step 3: Extend with category-mismatch edge case + non-color case**

Append invalid case demonstrating space-token-on-borderRadius:

```ts
{
  code: '.x { border-radius: var(--vapor-size-space-100); }',
  errors: [{ messageId: 'scopeMismatchWithSuggestions' }],
},
```

Run → PASS.

- [ ] **Step 4: Typecheck + lint**

```bash
pnpm --filter eslint-plugin-vapor typecheck
pnpm --filter eslint-plugin-vapor lint
```

PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/rules/css/token-scope-mismatch.ts \
        packages/eslint-plugin-vapor/src/rules/css/token-scope-mismatch.test.ts
git commit -m "feat(eslint-plugin-vapor): add css/token-scope-mismatch rule"
```

---

## Task 6: Rule C — `css/prefer-design-token`

**Files:**
- Create: `src/rules/css/prefer-design-token.ts`
- Create: `src/rules/css/prefer-design-token.test.ts`

**Interfaces:**
- Consumes: `TOKEN_INDEX`, `PROPERTY_SCOPE`, `parseDeclarationValue`.
- Produces: `export const preferDesignTokenRule: Rule.RuleModule;` with:
  - `meta.type: 'suggestion'`
  - `meta.messages`:
    - `preferSemantic: 'Use semantic token "{{ candidate }}" instead of primitive "{{ token }}" on "{{ property }}".'`
    - `preferToken: 'Use design token "{{ candidate }}" instead of "{{ rawValue }}" on "{{ property }}".'`
    - `replaceWithToken: 'Replace with "{{ candidate }}"'`
  - Options schema (default values per spec):

```ts
{
  categories?: Scope[];
  ignoreProperties?: string[];
  ignoreValues?: string[];      // default below
  maxSuggestions?: number;       // default 3
}
```

  - Default `ignoreValues = ['0','0px','transparent','none','currentcolor','inherit','initial','unset']`.
  - Visitor `Declaration`:
    1. Resolve `expectedScopes = PROPERTY_SCOPE[property]` (skip if undef, ignore if in `ignoreProperties`).
    2. For each `var` part: if `meta.kind === 'primitive'` and `meta.hex`, search `byHex.get(hex)` for `kind === 'semantic'` ∩ scope in `expectedScopes`; if any → `preferSemantic` report.
    3. For each `hex` part: skip if `ignoreValues` contains raw or normalized; **color context** = `expectedScopes ⊆ {foreground, background, border}`. Candidates priority:
       - semantic in expected scope (top-N),
       - else primitives whose hex matches,
       - else skip.
    4. For each `dimension` part with unit `px`: skip if `ignoreValues` contains raw; **foundation context** = `expectedScopes ⊆ {dimension, space, borderRadius}`. Candidates = `byPx.get(value)` filtered to `kind === 'foundation'` and scope in `expectedScopes`. Else skip.
  - **Critical: skip same-token-as-Rule-A/B.** Both Rule A and B run on the same source; Rule C must independently re-check skip conditions itself (Rule A: name in `--vapor-` but NOT canonical → skip; Rule B: canonical non-primitive token whose scope mismatches → skip). Concretely: in C, only consider `var()` parts whose `meta.kind === 'primitive'`, OR raw `hex`/`dimension` parts. Skip anything else. This obeys the spec's "독립적으로 평가" rule per part.

- [ ] **Step 1: Failing test scaffold**

Create `src/rules/css/prefer-design-token.test.ts`:

```ts
import { RuleTester } from 'eslint';
import css from '@eslint/css';
import { describe, it } from 'vitest';
import { preferDesignTokenRule } from './prefer-design-token';

const ruleTester = new RuleTester({ plugins: { css }, language: 'css/css' });

describe('css/prefer-design-token', () => {
  it('runs', () => {
    ruleTester.run('prefer-design-token', preferDesignTokenRule, {
      valid: [
        { code: '.x { color: var(--vapor-color-foreground-primary-100); }' },
        { code: '.x { color: red; }' }, // unknown raw → skip (no candidate)
        { code: '.x { padding: 0; }' },
        { code: '.x { color: transparent; }' },
        { code: '.x { unknown-prop: #ffffff; }' }, // unknown prop → skip
        { code: '.x { color: #ffffff; }', options: [{ ignoreProperties: ['color'] }] },
        { code: '.x { font-size: 12px; }' }, // font-size not in scope map
      ],
      invalid: [
        // C-1: primitive → semantic
        {
          code: '.x { color: var(--vapor-color-blue-600); }',
          errors: [{ messageId: 'preferSemantic' }],
        },
        // C-2: hex → semantic
        {
          code: '.x { background-color: #f7f7f7; }',
          errors: [{ messageId: 'preferToken' }],
        },
        // C-2: px → foundation
        {
          code: '.x { width: 12px; }',
          errors: [{ messageId: 'preferToken' }],
        },
      ],
    });
  });
});
```

NOTE: the `--vapor-color-blue-600` test depends on whether a real semantic token shares the same resolved hex in light theme. Before writing the assertion, smoke-check in a REPL or unit test:

```bash
pnpm --filter eslint-plugin-vapor exec node -e "import('./src/utils/token-index.ts').then(m=>console.log([...m.TOKEN_INDEX.byHex].slice(0,5)))"
```

If no semantic shares the blue-600 hex, swap to a token that does (consult `byHex` map). For `#f7f7f7` and `12px`, those values must map to known semantic-background and size-space/dimension tokens — verify the same way before locking the test.

Run → FAIL.

- [ ] **Step 2: Implement the rule**

Create `src/rules/css/prefer-design-token.ts`:

```ts
import type { Rule } from 'eslint';

import { PROPERTY_SCOPE, type Scope } from '~/data/property-scope-map';
import { TOKEN_INDEX } from '~/utils/token-index';
import { parseDeclarationValue } from '~/utils/css-value-parser';

interface Options {
  categories?: readonly Scope[];
  ignoreProperties?: readonly string[];
  ignoreValues?: readonly string[];
  maxSuggestions?: number;
}

const DEFAULT_IGNORE_VALUES = ['0', '0px', 'transparent', 'none', 'currentcolor', 'inherit', 'initial', 'unset'];

function isColorScope(scopes: readonly Scope[]): boolean {
  return scopes.every((s) => s === 'foreground' || s === 'background' || s === 'border');
}

function isFoundationScope(scopes: readonly Scope[]): boolean {
  return scopes.every((s) => s === 'dimension' || s === 'space' || s === 'borderRadius');
}

export const preferDesignTokenRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    docs: {
      description: 'Suggest a Vapor design token in place of a primitive token or raw CSS value.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          categories: { type: 'array', items: { type: 'string' } },
          ignoreProperties: { type: 'array', items: { type: 'string' } },
          ignoreValues: { type: 'array', items: { type: 'string' } },
          maxSuggestions: { type: 'number' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferSemantic:
        'Use semantic token "{{ candidate }}" instead of primitive "{{ token }}" on "{{ property }}".',
      preferToken:
        'Use design token "{{ candidate }}" instead of "{{ rawValue }}" on "{{ property }}".',
      replaceWithToken: 'Replace with "{{ candidate }}"',
    },
  },

  create(context) {
    const opts = (context.options[0] ?? {}) as Options;
    const maxSuggestions = opts.maxSuggestions ?? 3;
    const ignoreProps = new Set(opts.ignoreProperties ?? []);
    const ignoreValues = new Set(opts.ignoreValues ?? DEFAULT_IGNORE_VALUES);
    const categories = opts.categories ? new Set(opts.categories) : null;

    function scopeAllowed(scopes: readonly Scope[]): boolean {
      if (!categories) return true;
      return scopes.some((s) => categories.has(s));
    }

    return {
      Declaration(node: unknown) {
        const decl = node as { property?: string; value?: unknown };
        const property = decl.property;
        if (!property || ignoreProps.has(property)) return;
        const expectedScopes = PROPERTY_SCOPE[property];
        if (!expectedScopes || !scopeAllowed(expectedScopes)) return;

        const parts = parseDeclarationValue(decl.value);

        for (const part of parts) {
          if (part.type === 'var') {
            const meta = TOKEN_INDEX.tokenMeta.get(part.name);
            if (!meta || meta.kind !== 'primitive' || !meta.hex) continue;
            const candidates = (TOKEN_INDEX.byHex.get(meta.hex) ?? [])
              .filter((n) => {
                const m = TOKEN_INDEX.tokenMeta.get(n);
                return m?.kind === 'semantic' && expectedScopes.includes(m.scope as Scope);
              })
              .slice(0, maxSuggestions);
            if (candidates.length === 0) continue;
            reportReplace(
              context,
              decl.value as { range?: [number, number] },
              part.offset,
              part.name.length,
              'preferSemantic',
              { candidate: candidates[0], token: part.name, property },
              candidates,
            );
          } else if (part.type === 'hex') {
            if (ignoreValues.has(part.raw.toLowerCase()) || ignoreValues.has(part.normalized)) continue;
            if (!isColorScope(expectedScopes)) continue;
            const semantic = (TOKEN_INDEX.byHex.get(part.normalized) ?? []).filter((n) => {
              const m = TOKEN_INDEX.tokenMeta.get(n);
              return m?.kind === 'semantic' && expectedScopes.includes(m.scope as Scope);
            });
            const primitives =
              semantic.length === 0
                ? (TOKEN_INDEX.byHex.get(part.normalized) ?? []).filter(
                    (n) => TOKEN_INDEX.tokenMeta.get(n)?.kind === 'primitive',
                  )
                : [];
            const candidates = (semantic.length ? semantic : primitives).slice(0, maxSuggestions);
            if (candidates.length === 0) continue;
            reportReplace(
              context,
              decl.value as { range?: [number, number] },
              part.offset,
              part.raw.length,
              'preferToken',
              { candidate: candidates[0], rawValue: part.raw, property },
              candidates,
              `var(${candidates[0]})`,
            );
          } else if (part.type === 'dimension') {
            if (part.unit !== 'px') continue;
            if (ignoreValues.has(part.raw.toLowerCase())) continue;
            if (!isFoundationScope(expectedScopes)) continue;
            const candidates = (TOKEN_INDEX.byPx.get(part.value) ?? [])
              .filter((n) => {
                const m = TOKEN_INDEX.tokenMeta.get(n);
                return m?.kind === 'foundation' && expectedScopes.includes(m.scope as Scope);
              })
              .slice(0, maxSuggestions);
            if (candidates.length === 0) continue;
            reportReplace(
              context,
              decl.value as { range?: [number, number] },
              part.offset,
              part.raw.length,
              'preferToken',
              { candidate: candidates[0], rawValue: part.raw, property },
              candidates,
              `var(${candidates[0]})`,
            );
          }
        }
      },
    };
  },
};

function reportReplace(
  context: Rule.RuleContext,
  valueNode: { range?: [number, number] },
  offset: number,
  length: number,
  messageId: 'preferSemantic' | 'preferToken',
  data: Record<string, string | undefined>,
  candidates: readonly string[],
  fixedReplacement?: string,
): void {
  context.report({
    node: valueNode as never,
    messageId,
    data,
    suggest: candidates.map((c) => ({
      messageId: 'replaceWithToken',
      data: { candidate: c },
      fix(fixer) {
        const start = (valueNode.range?.[0] ?? 0) + offset;
        const end = start + length;
        return fixer.replaceTextRange([start, end], fixedReplacement ?? c);
      },
    })),
  });
}
```

Run → PASS for the seed cases.

- [ ] **Step 3: Add edge tests — case-insensitive hex, shorthand, ignoreValues override**

```ts
// valid
{ code: '.x { background-color: #FFFFFF; }', options: [{ ignoreValues: ['#ffffff'] }] },

// invalid: shorthand reports multiple
{
  code: '.x { padding: 12px 8px; }',
  errors: [{ messageId: 'preferToken' }, { messageId: 'preferToken' }],
},

// invalid: case-insensitive hex
{
  code: '.x { background-color: #F7F7F7; }',
  errors: [{ messageId: 'preferToken' }],
},
```

Run → PASS.

- [ ] **Step 4: Typecheck + lint**

```bash
pnpm --filter eslint-plugin-vapor typecheck
pnpm --filter eslint-plugin-vapor lint
```

PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/rules/css/prefer-design-token.ts \
        packages/eslint-plugin-vapor/src/rules/css/prefer-design-token.test.ts
git commit -m "feat(eslint-plugin-vapor): add css/prefer-design-token rule"
```

---

## Task 7: Wire-up, README, changeset, smoke test

**Files:**
- Modify: `src/index.ts`
- Modify: `README.md`
- Create: `.changeset/eslint-plugin-vapor-css-token-rules.md`

**Interfaces:**
- Consumes: all 3 rule modules.
- Produces: `default export` shape per spec §8, with `flat` (a11y), `legacy` (a11y), and `css` (the 3 new rules) presets.

- [ ] **Step 1: Update `src/index.ts`**

Replace the existing index with:

```ts
import type { Rule } from 'eslint';

import { altTextOnAvatarRule } from './rules/alt-text-on-avatar';
import { ariaLabelOnIconButtonRule } from './rules/aria-label-on-icon-button';
import { ariaLabelOnNavigationRule } from './rules/aria-label-on-navigation';
import { shouldHaveTitleOnDialogRule } from './rules/should-have-title-on-dialog';

import { noInvalidDesignTokenRule } from './rules/css/no-invalid-design-token';
import { tokenScopeMismatchRule } from './rules/css/token-scope-mismatch';
import { preferDesignTokenRule } from './rules/css/prefer-design-token';

const rules = {
  'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
  'navigation-has-aria-label': ariaLabelOnNavigationRule,
  'avatar-has-alt-text': altTextOnAvatarRule,
  'dialog-should-have-title': shouldHaveTitleOnDialogRule,
  'css/no-invalid-design-token': noInvalidDesignTokenRule,
  'css/token-scope-mismatch': tokenScopeMismatchRule,
  'css/prefer-design-token': preferDesignTokenRule,
} satisfies Record<string, Rule.RuleModule>;

const a11yRecommended = {
  'vapor/icon-button-has-aria-label': 'error',
  'vapor/navigation-has-aria-label': 'error',
  'vapor/avatar-has-alt-text': 'error',
  'vapor/dialog-should-have-title': 'error',
} as const;

const cssRecommended = {
  'vapor/css/no-invalid-design-token': 'error',
  'vapor/css/token-scope-mismatch': 'error',
  'vapor/css/prefer-design-token': 'warn',
} as const;

const plugin = {
  meta: { name: 'eslint-plugin-vapor', version: '0.1.0' },
  rules,
  configs: { flat: {}, legacy: {}, css: {} },
};

Object.assign(plugin.configs, {
  flat: { plugins: { vapor: plugin }, rules: a11yRecommended },
  legacy: { plugins: ['vapor'], rules: a11yRecommended },
  css: { plugins: { vapor: plugin }, rules: cssRecommended },
});

export default plugin;
```

Existing a11y tests must keep passing — they import rules by file, not via the plugin object, so this change is non-breaking.

- [ ] **Step 2: Full test + build**

```bash
pnpm --filter eslint-plugin-vapor test
pnpm --filter eslint-plugin-vapor typecheck
pnpm --filter eslint-plugin-vapor lint
pnpm --filter eslint-plugin-vapor build
```

All PASS. `dist/index.js` produced.

- [ ] **Step 3: Update `README.md`**

Append a section to `README.md` (after the existing a11y rule docs) covering:
- Usage section showing the flat config with `@eslint/css` and `vapor.configs.css` preset (copy from spec §8).
- Rule list table: name, severity in preset, short description.
- Options reference for each rule (copy schemas from spec §4–§6).
- Limits section: v1 = CSS files only; no SCSS, no CSS-in-JS, no autofix, no shorthand decomposition, no dark-theme hex matching.
- Token sync section: "Token assets live in `src/data/tokens/` and are copied from `skills/token-lint/assets/`. When the source changes, re-copy and bump the package version."

- [ ] **Step 4: Create changeset**

Write `.changeset/eslint-plugin-vapor-css-token-rules.md`:

```md
---
'eslint-plugin-vapor': minor
---

Add three CSS design-token rules: `css/no-invalid-design-token`, `css/token-scope-mismatch`, `css/prefer-design-token`. Opt in via the new `vapor.configs.css` preset.
```

- [ ] **Step 5: Manual smoke against a real Vapor component CSS**

Pick one CSS file inside the monorepo (e.g. `packages/core/src/components/button/button.module.css` — confirm path with `git ls-files '*.css' | rtk head`). Create a temporary `eslint.config.smoke.mjs` at repo root:

```js
import vapor from './packages/eslint-plugin-vapor/dist/index.js';
import css from '@eslint/css';

export default [
  {
    files: ['**/*.css'],
    plugins: { css, vapor: vapor.configs.css.plugins.vapor },
    language: 'css/css',
    rules: vapor.configs.css.rules,
  },
];
```

Run:

```bash
pnpm dlx eslint --config eslint.config.smoke.mjs <one-real-css-file>
```

Document observed output (count of each diagnostic, any false-positives) in the commit message. Delete the smoke config before committing.

- [ ] **Step 6: Commit**

```bash
git add packages/eslint-plugin-vapor/src/index.ts \
        packages/eslint-plugin-vapor/README.md \
        .changeset/eslint-plugin-vapor-css-token-rules.md
git commit -m "feat(eslint-plugin-vapor): register CSS rules, add css preset, update README and changeset"
```

- [ ] **Step 7: Final verification**

```bash
pnpm --filter eslint-plugin-vapor test
pnpm --filter eslint-plugin-vapor typecheck
pnpm --filter eslint-plugin-vapor lint
pnpm --filter eslint-plugin-vapor build
```

All four PASS. Push branch and open PR via `superpowers:finishing-a-development-branch`.

---

## Self-Review Notes

- **Spec coverage:**
  - §1 목적 (3 rules) → Tasks 4/5/6.
  - §2 범위 → Global Constraints.
  - §3 architecture → Tasks 1–3 file layout.
  - §3 `Scope` + `PROPERTY_SCOPE` → Task 1 Step 4.
  - §4 Rule A (visitor, options, messages, candidates, suggestion) → Task 4.
  - §5 Rule B → Task 5.
  - §6 Rule C (C-1 + C-2 with fallback ordering) → Task 6.
  - §7 test matrix → covered across Tasks 4/5/6 (each rule's task adds a row per matrix entry that targets it).
  - §8 deps + tsup + `src/index.ts` + flat-config example + changeset → Tasks 1 (deps) + 7 (index, README, changeset, smoke).
  - §9 success criteria → Task 7 Step 7.
  - §10 risks: handled implicitly via peer optional, culori/fn, v1 skips. Plan locks the skip behaviors.
- **Type consistency:** `Scope` produced by Task 1, consumed identically in Tasks 2/3/4/5/6. `TokenIndex` / `TokenMeta` produced by Task 3, consumed identically downstream. `ParsedValuePart` produced by Task 2, consumed by Tasks 4/5/6.
- **Placeholder scan:** no "TBD" / "implement later" / "similar to N" — every step shows the actual code or command.
- **Open question on `@eslint/css` AST node shapes:** Task 2's parser uses a defensive `NodeLike` interface because the official type defs are not stable across patch versions. If the actual AST keys differ at runtime (likely culprit: `name` vs `name.name` for Function, or `value.value` vs `value` for Hash), Task 2's tests will catch it before any rule code is touched — fix in `css-value-parser.ts` only, no ripple.

---

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-06-30-eslint-plugin-vapor-css-token-rules.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch fresh subagent per task, review between tasks. Use `superpowers:subagent-driven-development`.
2. **Inline Execution** — execute tasks in this session with checkpoints. Use `superpowers:executing-plans`.

Which approach?
