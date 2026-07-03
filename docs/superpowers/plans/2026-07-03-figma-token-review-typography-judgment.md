# Typography Semantic Judgment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make typography review produce actionable findings — LLM verdicts split into hierarchy / role / viewport axes with rule citations, and deterministic recommendations for raw text (fontSize match) and styled-override (revert to bound style).

**Architecture:** Deterministic recommendation lives in `evaluate/typography.ts` (has usage context, including `resolved.fontSize`). LLM continues to judge only conformant textStyles but now gets the full 16-style rubric and enriched `nodeTree` (each TEXT node carries its own `characters` and `textStyle`). Output shape gains two new violation types (`typo-role-misfit`, `typo-viewport-misfit`) and the LLM must return `axis` + `matchedRule` per judgment. `recommend.ts` becomes a pass-through for typography-origin violations.

**Tech Stack:** TypeScript (strict), Vite bundled Figma plugin (sandbox + iframe), Vitest, React 19 UI (untouched by this plan), Anthropic Messages API via LiteLLM (vision-capable model).

Spec: `docs/superpowers/specs/2026-07-03-figma-token-review-typography-judgment-design.md`.

## Global Constraints

- All work lives under `apps/figma-token-review-plugin/`.
- Determinism first: token detection and recommendation must be reproducible from schema + usage without any LLM call. LLM is used **only** for semantic judgment of already-conformant typography.
- No LLM call on `typo-raw`, `typo-styled-override`, or `unknown-token` targets.
- LLM continues to judge only items in `deterministicConformant.typography`.
- Violation messages remain Korean, matching existing tone in `evaluate/typography.ts`.
- No `manifest.json` changes; no fixture format changes (existing `fixtures/typography.json` must still load).
- Vitest is the test runner: `pnpm --filter figma-token-review-plugin vitest run [path]`.
- `pnpm --filter figma-token-review-plugin vitest run` must pass at the end of every task's final step.
- Follow the existing file layout in `src/` — no restructuring.
- Commit after every task with a `feat(figma-token-review-plugin):`, `refactor(...):`, or `test(...):` prefix per the repo's log style.

---

### Task 1: Schema additions — NodeInfo optional fields + new ViolationType values

**Files:**
- Modify: `apps/figma-token-review-plugin/src/common/schemas.ts`

**Interfaces:**
- Consumes: nothing new; this is the foundation.
- Produces:
    - `NodeInfo.characters?: string` and `NodeInfo.textStyle?: string` (optional).
    - `ViolationType` gains `'typo-role-misfit'` and `'typo-viewport-misfit'`.

- [ ] **Step 1: Extend `NodeInfo` with two optional TEXT-only fields**

Open `src/common/schemas.ts`, find the current `NodeInfo` type. Replace with:

```ts
export type NodeInfo = {
    id: string;
    type: string;
    name: string;
    parentId: string | null;
    childIds: string[];
    x: number;
    y: number;
    w: number;
    h: number;
    characters?: string;   // TEXT nodes only, 60-char cap
    textStyle?: string;    // TEXT nodes only, bound style name if any
};
```

- [ ] **Step 2: Extend `ViolationType` union with two new values**

In the same file, find the `ViolationType` union and add two entries at the end:

```ts
export type ViolationType =
    | 'token-not-used'
    | 'primitive-used'
    | 'unknown-token'
    | 'do-not-use'
    | 'role-mismatch'
    | 'fg-grade-mismatch'
    | 'fg-grade-ambiguous'
    | 'typo-raw'
    | 'typo-styled-override'
    | 'semantic-misfit'
    | 'typo-hierarchy'
    | 'typo-role-misfit'
    | 'typo-viewport-misfit';
```

- [ ] **Step 3: Typecheck compiles**

Run: `pnpm --filter figma-token-review-plugin tsc --noEmit`
Expected: no errors (both fields are optional so no downstream break yet).

- [ ] **Step 4: Commit**

```bash
git add apps/figma-token-review-plugin/src/common/schemas.ts
git commit -m "feat(figma-token-review-plugin): add typography axis ViolationTypes and TEXT NodeInfo fields"
```

---

### Task 2: Font-size resolver in text-style loader

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/lib/loaders/typography.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/lib/loaders/typography.test.ts`

**Interfaces:**
- Consumes: `common/tokens/text-style.json`, `common/tokens/typography.json`.
- Produces: `TextStyleMeta.fontSize: number | null`, resolved from `$value.fontSize` alias.

- [ ] **Step 1: Write a failing test asserting resolved `fontSize` for display1 and body2**

Open `src/ui/lib/loaders/typography.test.ts` and append:

```ts
it('display1 fontSize 는 typography.json 의 1000 스케일(120) 로 resolve 된다', () => {
    expect(schema.styles.display1.fontSize).toBe(120);
});

it('body2 fontSize 는 typography.json 의 075 스케일(14) 로 resolve 된다', () => {
    expect(schema.styles.body2.fontSize).toBe(14);
});

it('alias 를 해석할 수 없는 케이스는 null', () => {
    // 스키마 안에 실제로 alias resolve 실패 케이스가 없더라도, 타입이 nullable 이라는 것을 보장
    for (const meta of Object.values(schema.styles)) {
        expect(meta.fontSize === null || typeof meta.fontSize === 'number').toBe(true);
    }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/lib/loaders/typography.test.ts`
Expected: 3 failing tests (`fontSize` is undefined because the current schema doesn't emit it).

- [ ] **Step 3: Add `fontSize` to `TextStyleMeta` and resolve alias at load time**

Replace `src/ui/lib/loaders/typography.ts` body with:

```ts
import textStyleRaw from '~/common/tokens/text-style.json';
import typographyRaw from '~/common/tokens/typography.json';

const NS = 'io.goorm.vapor';

export type TextStyleMeta = {
    rank: number;
    when: string[];
    avoid: string[];
    description: string | null;
    fontSize: number | null;
};

export type TextStyleSchema = {
    order: string[];
    styles: Record<string, TextStyleMeta>;
};

type Node = {
    $description?: string;
    $extensions?: { [key: string]: Record<string, unknown> };
    $value?: { fontSize?: unknown };
};

function loadFontSizeTable(): Record<string, number> {
    const root = typographyRaw as {
        typography?: { fontSize?: Record<string, { $value?: { value?: unknown } }> };
    };
    const raw = root.typography?.fontSize ?? {};
    const out: Record<string, number> = {};
    for (const [key, node] of Object.entries(raw)) {
        if (key.startsWith('$')) continue;
        const value = node?.$value?.value;
        if (typeof value === 'number') out[key] = value;
    }
    return out;
}

function resolveFontSize(alias: unknown, table: Record<string, number>): number | null {
    if (typeof alias !== 'string') return null;
    const m = alias.match(/^\{typography\.fontSize\.([^}]+)\}$/);
    if (!m) return null;
    const key = m[1];
    return typeof table[key] === 'number' ? table[key] : null;
}

export function loadTextStyleSchema(): TextStyleSchema {
    const root = textStyleRaw as { textStyle?: Record<string, Node | unknown> };
    const fontSizeTable = loadFontSizeTable();
    const order: string[] = [];
    const styles: Record<string, TextStyleMeta> = {};
    const entries = Object.entries(root.textStyle ?? {});
    for (const [name, node] of entries) {
        if (name.startsWith('$') || typeof node !== 'object' || !node) continue;
        const meta = ((node as Node).$extensions?.[NS] ?? {}) as Record<string, unknown>;
        const alias = (node as Node).$value?.fontSize;
        styles[name] = {
            rank: order.length,
            when: Array.isArray(meta.when) ? (meta.when as string[]) : [],
            avoid: Array.isArray(meta.avoid) ? (meta.avoid as string[]) : [],
            description:
                typeof (node as Node).$description === 'string'
                    ? ((node as Node).$description ?? null)
                    : null,
            fontSize: resolveFontSize(alias, fontSizeTable),
        };
        order.push(name);
    }
    return { order, styles };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/lib/loaders/typography.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/lib/loaders/typography.ts apps/figma-token-review-plugin/src/ui/lib/loaders/typography.test.ts
git commit -m "feat(figma-token-review-plugin): resolve textStyle fontSize alias to primitive"
```

---

### Task 3: Deterministic `suggested` for `typo-raw` and `typo-styled-override`

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/lib/evaluate/typography.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/lib/evaluate/typography.test.ts`

**Interfaces:**
- Consumes: `TextStyleSchema` (with `fontSize` per style from Task 2).
- Produces: `evaluateTypography` returns violations whose `suggested[]` is populated for `typo-raw` (fontSize match) and `typo-styled-override` (bound token). `unknown-token` and other cases remain `[]`.

- [ ] **Step 1: Update the existing "suggested 는 항상 빈 배열" test — it no longer holds**

Open `src/ui/lib/evaluate/typography.test.ts`. Replace the test:

```ts
it('suggested 는 항상 빈 배열', () => {
    const r = evaluateTypography([usage({ appliedStatus: 'raw', textStyle: null })], schema);
    expect(r.violations[0].suggested).toEqual([]);
});
```

with:

```ts
it('typo-raw 는 resolved.fontSize 와 일치하는 textStyle 이름을 suggested 에 담는다', () => {
    // body2 는 14px 로 resolve 된다 (Task 2)
    const r = evaluateTypography(
        [
            usage({
                appliedStatus: 'raw',
                textStyle: null,
                resolved: { fontSize: 14, lineHeight: {}, letterSpacing: {}, fontName: {} },
            }),
        ],
        schema,
    );
    expect(r.violations[0].type).toBe('typo-raw');
    expect(r.violations[0].suggested).toContain('body2');
});

it('typo-raw 의 fontSize 가 null 이면 suggested 빈 배열', () => {
    const r = evaluateTypography(
        [
            usage({
                appliedStatus: 'raw',
                textStyle: null,
                resolved: { fontSize: null, lineHeight: {}, letterSpacing: {}, fontName: {} },
            }),
        ],
        schema,
    );
    expect(r.violations[0].suggested).toEqual([]);
});

it('typo-styled-override 는 바인딩된 textStyle 을 suggested 로 복원 제안한다', () => {
    const r = evaluateTypography(
        [
            usage({
                appliedStatus: 'styled-override',
                textStyle: 'body2',
                overriddenFields: ['fontSize'],
            }),
        ],
        schema,
    );
    expect(r.violations[0].type).toBe('typo-styled-override');
    expect(r.violations[0].suggested).toEqual(['body2']);
});

it('unknown-token 은 suggested 빈 배열', () => {
    const r = evaluateTypography(
        [usage({ textStyle: 'nonexistent-style-xyz', appliedStatus: 'styled-clean' })],
        schema,
    );
    expect(r.violations[0].type).toBe('unknown-token');
    expect(r.violations[0].suggested).toEqual([]);
});
```

- [ ] **Step 2: Run tests to verify the four new tests fail**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/lib/evaluate/typography.test.ts`
Expected: 3 failures (raw → `[]` currently, override → `[]`, unknown → `[]` — the unknown one already passes; the raw and override ones fail because `evaluateTypography` still hard-codes empty `suggested`).

- [ ] **Step 3: Fill `suggested` in `evaluateTypography`**

Replace `src/ui/lib/evaluate/typography.ts` body with:

```ts
import type { Conformant, TypographyUsage, Violation } from '~/common/schemas';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

function suggestByFontSize(
    fontSize: number | null,
    schema: TextStyleSchema,
): string[] {
    if (fontSize == null) return [];
    return schema.order.filter((name) => schema.styles[name].fontSize === fontSize);
}

export function evaluateTypography(
    usages: TypographyUsage[],
    schema: TextStyleSchema,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const base = {
            nodeId: u.nodeId,
            name: u.name,
            property: 'textStyle' as const,
            token: u.textStyle,
            value: null,
            origin: 'rule' as const,
            message: '',
            suggested: [] as string[],
        };

        if (u.appliedStatus === 'raw') {
            const fontSize =
                typeof u.resolved.fontSize === 'number' ? u.resolved.fontSize : null;
            violations.push({
                ...base,
                type: 'typo-raw',
                severity: 'high',
                message: `Text Style이 바인딩되지 않은 raw 텍스트입니다 ("${u.characters}").`,
                suggested: suggestByFontSize(fontSize, schema),
            });
            continue;
        }

        if (u.appliedStatus === 'styled-override') {
            violations.push({
                ...base,
                type: 'typo-styled-override',
                severity: 'info',
                message: `Text Style "${u.textStyle}" 적용 후 ${u.overriddenFields.join(', ')} 필드가 오버라이드되었습니다.`,
                suggested: u.textStyle ? [u.textStyle] : [],
            });
            continue;
        }

        if (u.textStyle && !(u.textStyle in schema.styles)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                message: `등록되지 않은 Text Style 이름입니다: ${u.textStyle}.`,
            });
            continue;
        }

        if (u.textStyle) {
            conformant.push({
                nodeId: u.nodeId,
                name: u.name,
                property: 'textStyle',
                token: u.textStyle,
            });
        }
    }

    return { violations, conformant };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/lib/evaluate/typography.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/lib/evaluate/typography.ts apps/figma-token-review-plugin/src/ui/lib/evaluate/typography.test.ts
git commit -m "feat(figma-token-review-plugin): fill deterministic suggested for typo-raw and typo-styled-override"
```

---

### Task 4: `recommend.ts` pass-through for typography deterministic types

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/lib/recommend.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/lib/recommend.test.ts`

**Interfaces:**
- Consumes: `Violation` objects that may arrive from `evaluateTypography` with `suggested` already filled.
- Produces: `applyRecommendations` preserves the pre-filled `suggested` on typography violations instead of resetting them to `[]`.

- [ ] **Step 1: Write a failing test that a typo-raw with pre-filled `suggested` survives `applyRecommendations`**

Open `src/ui/lib/recommend.test.ts` and append inside the top-level describe (create describe if none). Verify the file's existing imports include `applyRecommendations` and any needed schema fixtures; if not, import them:

```ts
import { applyRecommendations } from '~/ui/lib/recommend';
import { loadColorSchema } from '~/ui/lib/loaders/color';
import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import type { Violation } from '~/common/schemas';
```

Append tests:

```ts
describe('applyRecommendations - typography pass-through', () => {
    const colorSchema = loadColorSchema('light');
    const dim = loadDimensionSchemas();
    const ctx = {
        colorSchema,
        space: dim.space,
        dimension: dim.dimension,
        borderRadius: dim.borderRadius,
        shadow: dim.shadow,
    };

    it('typo-raw 는 이미 채워진 suggested 를 보존한다', () => {
        const v: Violation = {
            nodeId: 'n1',
            name: 'title',
            property: 'textStyle',
            token: null,
            value: null,
            type: 'typo-raw',
            severity: 'high',
            origin: 'rule',
            message: 'raw',
            suggested: ['body2'],
        };
        const [out] = applyRecommendations([v], ctx);
        expect(out.suggested).toEqual(['body2']);
    });

    it('typo-styled-override 는 이미 채워진 suggested 를 보존한다', () => {
        const v: Violation = {
            nodeId: 'n2',
            name: 'x',
            property: 'textStyle',
            token: 'body1',
            value: null,
            type: 'typo-styled-override',
            severity: 'info',
            origin: 'rule',
            message: 'override',
            suggested: ['body1'],
        };
        const [out] = applyRecommendations([v], ctx);
        expect(out.suggested).toEqual(['body1']);
    });

    it('typography unknown-token 은 suggested 를 덮어쓰지 않는다', () => {
        const v: Violation = {
            nodeId: 'n3',
            name: 'x',
            property: 'textStyle',
            token: 'nonexistent',
            value: null,
            type: 'unknown-token',
            severity: 'high',
            origin: 'rule',
            message: 'unknown',
            suggested: [],
        };
        const [out] = applyRecommendations([v], ctx);
        expect(out.suggested).toEqual([]);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/lib/recommend.test.ts`
Expected: two failures (typo-raw and typo-styled-override tests). The current switch resets `suggested = []` for these types.

- [ ] **Step 3: Add pass-through cases in `applyRecommendations` switch**

In `src/ui/lib/recommend.ts`, find the `switch (type)` inside `applyRecommendations`. Replace the block starting from `case 'unknown-token':` (currently `unknown-token`, `fg-grade-ambiguous`, `typo-raw`, `typo-styled-override`, `semantic-misfit`, `typo-hierarchy` all fall into a single `suggested = []` block) with an explicit pass-through for typography and an isolated color-side unknown-token branch:

```ts
case 'typo-raw':
case 'typo-styled-override':
    // suggested already filled by evaluateTypography — do not overwrite
    return violation;

case 'unknown-token':
    if (property === 'textStyle') {
        // typography path — evaluateTypography already set suggested (currently [])
        return violation;
    }
    suggested = [];
    break;

case 'fg-grade-ambiguous':
case 'semantic-misfit':
case 'typo-hierarchy':
    suggested = [];
    break;
```

The `origin === 'llm'` early return at the top of `applyRecommendations` continues to short-circuit LLM-origin violations. No case entries needed for `typo-role-misfit` or `typo-viewport-misfit` — they arrive with `origin: 'llm'`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/lib/recommend.test.ts`
Expected: all pass, including previously green tests.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/lib/recommend.ts apps/figma-token-review-plugin/src/ui/lib/recommend.test.ts
git commit -m "refactor(figma-token-review-plugin): recommend.ts passes typography deterministic violations through"
```

---

### Task 5: Full-schema `textStyleRubric` in `buildLlmInput`

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/lib/rubric.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/lib/rubric.test.ts`

**Interfaces:**
- Consumes: `TextStyleSchema` (with all 16 styles enumerated in `order`).
- Produces: `LlmInput.rubric.textStyle` keyed by every style name in the schema, not just used tokens.

- [ ] **Step 1: Write a failing test asserting rubric enumerates all 16 styles**

Open `src/ui/lib/rubric.test.ts`. Locate any existing test that inspects `rubric.textStyle` (or create a new describe block). Add:

```ts
it('textStyleRubric 는 스키마 전체 스타일을 포함한다 (사용/미사용 무관)', () => {
    const schema = loadTextStyleSchema();
    const input = buildLlmInput({
        extract: makeEmptyExtract(),                 // helper — see below
        deterministicConformant: { color: [], typography: [] },
        frameName: 'frame',
        colorSchema: loadColorSchema('light'),
        textStyleSchema: schema,
        nodeTree: [],
    });
    for (const name of schema.order) {
        expect(input.rubric.textStyle[name]).toBeDefined();
    }
    expect(Object.keys(input.rubric.textStyle).length).toBe(schema.order.length);
});
```

If `makeEmptyExtract` does not already exist in this test file, add:

```ts
function makeEmptyExtract() {
    return {
        schemaMode: 'light' as const,
        viewport: 'pc' as const,
        colors: [],
        typography: [],
        spaces: [],
        dimensions: [],
        radii: [],
        shadows: [],
        stats: { nodeCount: 0, textNodes: 0, visited: 0 },
    };
}
```

Add missing imports at the top:

```ts
import { loadColorSchema } from '~/ui/lib/loaders/color';
import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';
import { buildLlmInput } from '~/ui/lib/rubric';
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/lib/rubric.test.ts`
Expected: fails — current implementation only emits rubric entries for used tokens (none in empty extract).

- [ ] **Step 3: Iterate the full schema instead of `usedTextStyles`**

In `src/ui/lib/rubric.ts`, find:

```ts
const totalRanks = textStyleSchema.order.length;
const textStyleRubric: Record<string, TextStyleMetaSubset> = {};
for (const t of usedTextStyles) {
    const meta = textStyleSchema.styles[t];
    if (!meta) continue;
    textStyleRubric[t] = {
        rank: meta.rank,
        totalRanks,
        when: meta.when,
        avoid: meta.avoid,
        description: meta.description,
    };
}
```

Replace with:

```ts
const totalRanks = textStyleSchema.order.length;
const textStyleRubric: Record<string, TextStyleMetaSubset> = {};
for (const name of textStyleSchema.order) {
    const meta = textStyleSchema.styles[name];
    textStyleRubric[name] = {
        rank: meta.rank,
        totalRanks,
        when: meta.when,
        avoid: meta.avoid,
        description: meta.description,
    };
}
```

Delete the now-unused `usedTextStyles` set and its populating loop lines (`usedTextStyles.add(conf.token)`). Keep the `typographyTargets` construction — only the rubric-building loop changes.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/lib/rubric.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/lib/rubric.ts apps/figma-token-review-plugin/src/ui/lib/rubric.test.ts
git commit -m "feat(figma-token-review-plugin): expose full textStyle rubric to LLM"
```

---

### Task 6: Enrich `nodeTree` TEXT nodes with `characters` and `textStyle`

**Files:**
- Modify: `apps/figma-token-review-plugin/src/plugin/handlers/extract.ts`
- Modify: `apps/figma-token-review-plugin/src/plugin/handlers/extract.test.ts`

**Interfaces:**
- Consumes: existing `classifyTextNode` helper (already in `extract.ts`), Figma `TextNode.characters`.
- Produces: `NodeInfo` objects for TEXT nodes carry `characters` (60-char cap) and `textStyle` (bound style name if present).

- [ ] **Step 1: Write failing tests for the enriched TEXT node fields**

Open `src/plugin/handlers/extract.test.ts`. Locate any existing `walkTree` test (there is at least one from the stage-3 vision spec). Add these tests near it:

```ts
it('walkTree TEXT 노드는 characters(60자 컷) 와 textStyle 을 담는다', async () => {
    const frame = makeFrame({                      // helper factory — see comment below
        children: [
            makeTextNode({
                id: 't1',
                characters: 'a'.repeat(100),
                boundTextStyleName: 'body2',
            }),
        ],
    });
    const tree = await walkTree(frame);
    const text = tree.find((n) => n.id === 't1')!;
    expect(text.characters).toBe('a'.repeat(60));
    expect(text.textStyle).toBe('body2');
});

it('walkTree 비-TEXT 노드는 characters/textStyle 이 undefined', async () => {
    const frame = makeFrame({ children: [makeFrame({ id: 'f2' })] });
    const tree = await walkTree(frame);
    const inner = tree.find((n) => n.id === 'f2')!;
    expect(inner.characters).toBeUndefined();
    expect(inner.textStyle).toBeUndefined();
});

it('walkTree 는 classifyTextNode 실패해도 노드를 유지하고 textStyle 만 생략', async () => {
    const frame = makeFrame({
        children: [
            makeTextNode({
                id: 't3',
                characters: 'x',
                classifyThrows: true,     // helper stubs classifyTextNode to throw for this node
            }),
        ],
    });
    const tree = await walkTree(frame);
    const text = tree.find((n) => n.id === 't3')!;
    expect(text).toBeDefined();
    expect(text.characters).toBe('x');
    expect(text.textStyle).toBeUndefined();
});
```

Follow the existing `extract.test.ts` conventions for factory helpers (`makeFrame`, `makeTextNode`). If these helpers do not exist, add them inline at the top of the test file with the minimum shape the current test scaffolding uses: an object literal that satisfies Figma's `SceneNode` structural shape (`type`, `id`, `name`, `children`, `x/y/width/height`, `characters` for TEXT, and the `boundVariables`/`fills`/etc surface the extractor reads).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter figma-token-review-plugin vitest run src/plugin/handlers/extract.test.ts`
Expected: three failures — current `walkTree` does not populate `characters`/`textStyle` on TEXT nodes.

- [ ] **Step 3: Convert `walkTree` to async and enrich TEXT nodes**

In `src/plugin/handlers/extract.ts`, find the current `walkTree` function. Replace with:

```ts
async function walkTree(root: SceneNode): Promise<NodeInfo[]> {
    const out: NodeInfo[] = [];
    const stack: Array<{ node: SceneNode; parentId: string | null }> = [
        { node: root, parentId: null },
    ];
    while (stack.length) {
        const { node, parentId } = stack.pop()!;
        if (shouldSkipNode(node.name)) continue;
        const children = 'children' in node ? (node.children as readonly SceneNode[]) : [];

        const info: NodeInfo = {
            id: node.id,
            type: node.type,
            name: node.name,
            parentId,
            childIds: children.map((c) => c.id),
            x: 'x' in node ? (node as { x: number }).x : 0,
            y: 'y' in node ? (node as { y: number }).y : 0,
            w: 'width' in node ? (node as { width: number }).width : 0,
            h: 'height' in node ? (node as { height: number }).height : 0,
        };

        if (node.type === 'TEXT') {
            const textNode = node as TextNode;
            info.characters = (textNode.characters || '').slice(0, 60);
            try {
                const { textStyle } = await classifyTextNode(textNode);
                if (textStyle) info.textStyle = textStyle;
            } catch {
                // Skip textStyle on failure; characters still surfaces.
            }
        }

        out.push(info);
        for (const c of children) stack.push({ node: c, parentId: node.id });
    }
    return out;
}
```

Update the `extractFrame` call site to await `walkTree`. Find the block that constructs `llmContext` and replace it with:

```ts
const [screenshotB64, nodeTree] = await Promise.all([
    captureScreenshot(frame).catch(() => ''),
    walkTree(frame).catch(() => [] as NodeInfo[]),
]);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter figma-token-review-plugin vitest run src/plugin/handlers/extract.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/plugin/handlers/extract.ts apps/figma-token-review-plugin/src/plugin/handlers/extract.test.ts
git commit -m "feat(figma-token-review-plugin): nodeTree TEXT nodes carry characters and textStyle"
```

---

### Task 7: LLM parse — enforce `axis` and `matchedRule` fields

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/parse.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/parse.test.ts`

**Interfaces:**
- Consumes: raw LLM response text.
- Produces: `LlmTypoJudgment` now includes `axis: 'hierarchy' | 'role' | 'viewport'` and `matchedRule: string`. The type guard rejects responses missing them.

- [ ] **Step 1: Write failing tests for the new fields**

Open `src/ui/features/llm/parse.test.ts`. Update the existing "JSON text block 을 LlmJudgments 로 파싱한다" test's typography item so it includes `axis: 'hierarchy'` and `matchedRule: ''` — otherwise it will fail once the guard is tightened:

```ts
typography: [
    {
        nodeId: '1',
        name: 'h',
        token: 'subtitle1',
        verdict: 'PASS',
        confidence: 'HIGH',
        axis: 'hierarchy',
        matchedRule: '',
        reasoning: '맞음',
        suggested: [],
    },
],
```

Then append new tests:

```ts
it('typography item 에 axis 필드가 없으면 LlmParseError', () => {
    const response = {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify({
                    typography: [
                        {
                            nodeId: '1',
                            name: 'h',
                            token: 'subtitle1',
                            verdict: 'PASS',
                            confidence: 'HIGH',
                            matchedRule: '',
                            reasoning: '맞음',
                            suggested: [],
                        },
                    ],
                    semanticColor: [],
                }),
            },
        ],
    };
    expect(() => parseLlmResponse(response)).toThrow(LlmParseError);
});

it('typography item 의 axis 가 3-value union 밖이면 LlmParseError', () => {
    const response = {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify({
                    typography: [
                        {
                            nodeId: '1',
                            name: 'h',
                            token: 'subtitle1',
                            verdict: 'FAIL',
                            confidence: 'MED',
                            axis: 'unknown',
                            matchedRule: 'x',
                            reasoning: 'nope',
                            suggested: [],
                        },
                    ],
                    semanticColor: [],
                }),
            },
        ],
    };
    expect(() => parseLlmResponse(response)).toThrow(LlmParseError);
});

it('typography item 에 matchedRule 이 빈 문자열이면 통과한다', () => {
    const response = {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify({
                    typography: [
                        {
                            nodeId: '1',
                            name: 'h',
                            token: 'subtitle1',
                            verdict: 'PASS',
                            confidence: 'HIGH',
                            axis: 'role',
                            matchedRule: '',
                            reasoning: '맞음',
                            suggested: [],
                        },
                    ],
                    semanticColor: [],
                }),
            },
        ],
    };
    const result = parseLlmResponse(response);
    expect(result.typography[0].axis).toBe('role');
    expect(result.typography[0].matchedRule).toBe('');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/features/llm/parse.test.ts`
Expected: the two `LlmParseError`-expecting tests fail (guard is currently too loose), the axis/matchedRule assertion test fails (`axis` and `matchedRule` are undefined on the parsed object).

- [ ] **Step 3: Extend the type and guard**

In `src/ui/features/llm/parse.ts`, update `LlmTypoJudgment`:

```ts
export type LlmTypoJudgment = {
    nodeId: string;
    name: string;
    token: string;
    verdict: 'PASS' | 'FAIL';
    confidence: Confidence;
    axis: 'hierarchy' | 'role' | 'viewport';
    matchedRule: string;
    reasoning: string;
    suggested: string[];
};
```

Rewrite `isTypoJudgment`:

```ts
function isTypoJudgment(v: unknown): v is LlmTypoJudgment {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return (
        typeof o.nodeId === 'string' &&
        typeof o.name === 'string' &&
        typeof o.token === 'string' &&
        (o.verdict === 'PASS' || o.verdict === 'FAIL') &&
        (o.confidence === 'HIGH' || o.confidence === 'MED' || o.confidence === 'LOW') &&
        (o.axis === 'hierarchy' || o.axis === 'role' || o.axis === 'viewport') &&
        typeof o.matchedRule === 'string' &&
        typeof o.reasoning === 'string' &&
        Array.isArray(o.suggested)
    );
}
```

`isColorJudgment` currently delegates to `isTypoJudgment`. Since color judgments do **not** carry `axis` / `matchedRule`, replace the delegation with a standalone guard that mirrors only the shared fields:

```ts
function isColorJudgment(v: unknown): v is LlmColorJudgment {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return (
        typeof o.nodeId === 'string' &&
        typeof o.name === 'string' &&
        typeof o.token === 'string' &&
        (o.property === 'fill' || o.property === 'fill-on-text' || o.property === 'stroke') &&
        (o.verdict === 'PASS' || o.verdict === 'FAIL') &&
        (o.confidence === 'HIGH' || o.confidence === 'MED' || o.confidence === 'LOW') &&
        typeof o.reasoning === 'string' &&
        Array.isArray(o.suggested)
    );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/features/llm/parse.test.ts`
Expected: all pass, including the pre-existing tests that were updated to include the new fields.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/features/llm/parse.ts apps/figma-token-review-plugin/src/ui/features/llm/parse.test.ts
git commit -m "feat(figma-token-review-plugin): enforce axis and matchedRule on LlmTypoJudgment"
```

---

### Task 8: Prompt — `SYSTEM_BASE` schema block + rewritten `SEMANTIC_GUIDE`

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/prompt.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/prompt.test.ts`

**Interfaces:**
- Consumes: `LlmInput`, `screenshotB64`, `model`.
- Produces: `buildRequest` output with a system prompt that instructs the LLM to emit `axis` + `matchedRule` per typography judgment and describes the 3-axis rubric.

- [ ] **Step 1: Write failing tests asserting the new prompt content**

Open `src/ui/features/llm/prompt.test.ts`. Append:

```ts
it('SYSTEM_BASE typography schema 블록에 axis 와 matchedRule 필드가 포함된다', () => {
    const req = buildRequest(minimalInput(), '', 'claude-sonnet-4-6');
    const combined = req.system.map((b) => b.text).join('\n');
    expect(combined).toContain('"axis"');
    expect(combined).toContain('"matchedRule"');
    expect(combined).toContain('"hierarchy"');
    expect(combined).toContain('"role"');
    expect(combined).toContain('"viewport"');
});

it('SEMANTIC_GUIDE 는 3축 정의와 rubric 활용 지시를 포함한다', () => {
    const req = buildRequest(minimalInput(), '', 'claude-sonnet-4-6');
    const combined = req.system.map((b) => b.text).join('\n');
    expect(combined).toContain('hierarchy');
    expect(combined).toContain('role');
    expect(combined).toContain('viewport');
    expect(combined).toContain('rubric.textStyle');
    expect(combined).toContain('matchedRule');
});
```

If `minimalInput` helper does not exist in this test file, add:

```ts
function minimalInput(): import('~/ui/lib/rubric').LlmInput {
    return {
        context: { schemaMode: 'light', viewport: 'pc', frameName: 'f' },
        judgmentTargets: { typography: [], semanticColor: [] },
        rubric: { textStyle: {}, color: {} },
        nodeTree: [],
    };
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/features/llm/prompt.test.ts`
Expected: fails — current prompt does not mention `axis`, `matchedRule`, or the 3-axis rubric structure.

- [ ] **Step 3: Update `SYSTEM_BASE` and `SEMANTIC_GUIDE` strings**

In `src/ui/features/llm/prompt.ts`, replace `SYSTEM_BASE` with:

```ts
const SYSTEM_BASE = [
    '당신은 vapor 디자인 토큰의 의미 판정자다.',
    '결정론 분석은 일체 하지 않는다 — plugin이 이미 끝냈다.',
    '너의 역할은 두 가지뿐이다.',
    '1) 텍스트 위계(text styles) 적합성 분석',
    '2) semantic color의 역할/상태/상황 적합성 분석',
    '각 항목에 verdict(PASS/FAIL), confidence(HIGH/MED/LOW), 한국어 reasoning, 그리고 FAIL일 때만 자기 영역의 대체 토큰 후보(`suggested`)를 낸다.',
    '결정론 fail 노드는 입력에 없다. 결정론 fail에 대한 의견은 내지 마라.',
    '',
    '판정 입력은 세 가지다:',
    '1) rubric — 각 토큰의 의도(when/avoid, typography는 rank/totalRanks 포함). 사용된 토큰의 의도와 자리의 부합 여부를 판정.',
    '2) nodeTree — 프레임 하위 노드의 구조(id, type, name, parentId, childIds, xywh). TEXT 노드는 characters, textStyle 필드도 포함해 이웃 텍스트 간 rank 비교에 사용.',
    '3) 첨부 이미지 — 렌더된 프레임. 구조로 안 잡히는 시각적 위계(가장 큰 헤딩인가, 경고 색 자리인가)를 판정에 반영.',
    '출력은 다음 JSON 객체 하나뿐. 마크다운 fence/문장/접두사 금지.',
    '{',
    '  "typography": LlmTypoJudgment[],',
    '  "semanticColor": LlmColorJudgment[]',
    '}',
    '',
    'LlmTypoJudgment = {',
    '  "nodeId": string, "name": string, "token": string,',
    '  "verdict": "PASS" | "FAIL",',
    '  "confidence": "HIGH" | "MED" | "LOW",',
    '  "axis": "hierarchy" | "role" | "viewport",',
    '  "matchedRule": string,   // 위반(FAIL) 시 걸린 when/avoid 원문. PASS 면 부합한 when. 스키마에 없는 규칙 발명 금지. 없으면 빈 문자열.',
    '  "reasoning": string (Korean),',
    '  "suggested": string[]   // verdict=FAIL 일 때만 채움. 빈 배열 가능. 절대 string 으로 내지 마라.',
    '}',
    '',
    'LlmColorJudgment = {',
    '  "nodeId": string, "name": string, "property": "fill" | "fill-on-text" | "stroke", "token": string,',
    '  "verdict": "PASS" | "FAIL",',
    '  "confidence": "HIGH" | "MED" | "LOW",',
    '  "reasoning": string (Korean),',
    '  "suggested": string[]',
    '}',
    '',
    'Hard rules:',
    '- suggested 는 항상 배열. 후보 없으면 [].',
    '- 토큰 키(예: color-background-danger-100, subtitle1)는 영문 그대로.',
    '- reasoning 은 한국어. 어느 when/avoid 항목이 부합/위배되는지 명시.',
    '- 확신이 약하면 confidence를 낮추되 verdict는 PASS/FAIL 둘 중 하나만 사용.',
].join('\n');
```

Replace `SEMANTIC_GUIDE` with:

```ts
const SEMANTIC_GUIDE = [
    '의미 판정 가이드:',
    '',
    '색상 판정 축: semantic color 의 when/avoid 가 전제하는 역할(danger/warning/primary/normal/hint 등) 과 실제 자리(노드 이름·부모·인접 노드)의 의미가 부합하는가.',
    '- avoid 의 "조건 → color-X-Y" 형식은 우변이 그대로 remedy 후보다.',
    '',
    'typography 판정 축 (각 대상에 정확히 하나 라벨):',
    '- hierarchy: 시각 위계 뒤집힘 / 본문에 heading 오용 / heading 에 body 오용. 근거는 rank(작을수록 큰 제목) 와 nodeTree 상 이웃 TEXT 노드의 rank·characters 비교 + 스크린샷의 시각 크기.',
    '- role: when/avoid 의 역할·문맥 규칙 위배 (예: subtitle 자리에 body, code 자리에 body).',
    '- viewport: when/avoid 의 뷰포트 규칙 위배. context.viewport ∈ {pc, tablet, mobile}. mobile 에서 display* 는 즉시 viewport FAIL.',
    '',
    '입력 3종 활용:',
    '1. rubric.textStyle — 전체 스타일의 rank/when/avoid/description. 대체 후보(suggested) 는 이 안에서만 선택.',
    '2. nodeTree — 각 TEXT 노드에 characters, textStyle 포함. 형제·부모 그룹에서 이웃 rank 비교로 위계 판정.',
    '3. 첨부 이미지 — 시각 크기·강조·위치. 구조로 안 잡히는 위계는 이미지에서.',
    '',
    '각 typography 판정에 필수:',
    '- axis: "hierarchy" | "role" | "viewport"',
    '- matchedRule: 위반한 when/avoid 문장 원문. PASS 면 부합한 when 문장. 스키마에 없는 규칙 발명 금지. 없으면 빈 문자열.',
    '- suggested: FAIL 일 때만 채움. rubric.textStyle 키만 허용.',
    '',
    '점수화(0-100) 금지. PASS/FAIL + confidence 만.',
].join('\n');
```

Do not change the `buildRequest` function body — `system` blocks and `cache_control` placement stay identical.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/features/llm/prompt.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/features/llm/prompt.ts apps/figma-token-review-plugin/src/ui/features/llm/prompt.test.ts
git commit -m "feat(figma-token-review-plugin): prompt requires axis and matchedRule per typography judgment"
```

---

### Task 9: Merge — axis → ViolationType, matchedRule prepend, suggested filter

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/merge.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/merge.test.ts`

**Interfaces:**
- Consumes: `LlmTypoJudgment` with `axis` + `matchedRule` (Task 7), `TextStyleSchema` (Task 2).
- Produces: `MergeArgs` gains `textStyleSchema: TextStyleSchema`. `heuristicTypo(j, schema)` maps axis to violation type, prepends `[matchedRule]` to message, filters `suggested` to schema-known names.

- [ ] **Step 1: Write failing tests for axis mapping, message prepend, suggested filter**

Open `src/ui/features/llm/merge.test.ts`. Append (assuming existing helpers `makeJudgments`, `makeDeterministic`, or similar):

```ts
import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';

const textStyleSchema = loadTextStyleSchema();

function makeTypoJudgment(overrides: Partial<import('~/ui/features/llm/parse').LlmTypoJudgment> = {}) {
    return {
        nodeId: 'n1',
        name: 'Label',
        token: 'body2',
        verdict: 'FAIL' as const,
        confidence: 'HIGH' as const,
        axis: 'hierarchy' as const,
        matchedRule: '본문에 heading 오용',
        reasoning: '이유',
        suggested: ['body1'],
        ...overrides,
    };
}

function mergeWithTypo(judgment: import('~/ui/features/llm/parse').LlmTypoJudgment) {
    return mergeScanPayload({
        deterministic: emptyDeterministic(),
        llm: { typography: [judgment], semanticColor: [] },
        schemaMode: 'light',
        textStyleSchema,
    });
}

it('axis=hierarchy → violation.type=typo-hierarchy', () => {
    const payload = mergeWithTypo(makeTypoJudgment({ axis: 'hierarchy' }));
    expect(payload.typography.violations[0].type).toBe('typo-hierarchy');
});

it('axis=role → violation.type=typo-role-misfit', () => {
    const payload = mergeWithTypo(makeTypoJudgment({ axis: 'role' }));
    expect(payload.typography.violations[0].type).toBe('typo-role-misfit');
});

it('axis=viewport → violation.type=typo-viewport-misfit', () => {
    const payload = mergeWithTypo(makeTypoJudgment({ axis: 'viewport' }));
    expect(payload.typography.violations[0].type).toBe('typo-viewport-misfit');
});

it('matchedRule 이 있으면 message 앞에 대괄호로 붙는다', () => {
    const payload = mergeWithTypo(makeTypoJudgment({ matchedRule: 'mobile → heading1', reasoning: '모바일임' }));
    expect(payload.typography.violations[0].message).toBe('[mobile → heading1] 모바일임');
});

it('matchedRule 이 빈 문자열이면 reasoning 만 사용', () => {
    const payload = mergeWithTypo(makeTypoJudgment({ matchedRule: '', reasoning: '이유만' }));
    expect(payload.typography.violations[0].message).toBe('이유만');
});

it('suggested 는 스키마에 없는 이름을 걸러낸다', () => {
    const payload = mergeWithTypo(
        makeTypoJudgment({ suggested: ['body1', 'nonexistent-style', 'subtitle1'] }),
    );
    expect(payload.typography.violations[0].suggested).toEqual(['body1', 'subtitle1']);
});
```

If `emptyDeterministic` does not exist, add:

```ts
function emptyDeterministic(): import('~/ui/features/llm/merge').MergeArgs['deterministic'] {
    const empty = () => ({ violations: [], conformant: [], total: 0 });
    return {
        color: empty(),
        space: empty(),
        dimension: empty(),
        typography: empty(),
        borderRadius: empty(),
        shadow: empty(),
    };
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/features/llm/merge.test.ts`
Expected: type check fails (MergeArgs doesn't yet accept `textStyleSchema`) and/or runtime fails (heuristicTypo doesn't map axis or filter suggested).

- [ ] **Step 3: Update `MergeArgs` and `heuristicTypo`**

In `src/ui/features/llm/merge.ts`, replace the file body with:

```ts
import type {
    Category,
    Conformant,
    EvaluateOutput,
    EvaluateSummary,
    ScanPayload,
    SchemaMode,
    ViolationType,
    Violation,
} from '~/common/schemas';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

import type { LlmColorJudgment, LlmJudgments, LlmTypoJudgment } from './parse';

export type CategoryDet = { violations: Violation[]; conformant: Conformant[]; total: number };

export type MergeArgs = {
    deterministic: Record<Category, CategoryDet>;
    llm: LlmJudgments;
    schemaMode: SchemaMode;
    textStyleSchema: TextStyleSchema;
};

const AXIS_TO_TYPE: Record<LlmTypoJudgment['axis'], ViolationType> = {
    hierarchy: 'typo-hierarchy',
    role: 'typo-role-misfit',
    viewport: 'typo-viewport-misfit',
};

function heuristicTypo(j: LlmTypoJudgment, schema: TextStyleSchema): Violation {
    const known = new Set(schema.order);
    const filtered = j.suggested.filter((s) => known.has(s));
    const message = j.matchedRule ? `[${j.matchedRule}] ${j.reasoning}` : j.reasoning;
    return {
        nodeId: j.nodeId,
        name: j.name,
        property: 'textStyle',
        token: j.token,
        value: null,
        type: AXIS_TO_TYPE[j.axis],
        severity: 'high',
        origin: 'llm',
        message,
        suggested: filtered,
        confidence: j.confidence,
    };
}

function heuristicColor(j: LlmColorJudgment): Violation {
    return {
        nodeId: j.nodeId,
        name: j.name,
        property: j.property,
        token: j.token,
        value: null,
        type: 'semantic-misfit',
        severity: 'high',
        origin: 'llm',
        message: j.reasoning,
        suggested: j.suggested,
        confidence: j.confidence,
    };
}

function summarize(
    violations: Violation[],
    conformant: Conformant[],
    total: number,
): EvaluateSummary {
    const isFail = (v: Violation): boolean =>
        v.severity === 'high' && (v.origin === 'rule' || v.confidence === 'HIGH');
    const high = violations.filter(isFail).length;
    const heuristics = violations.filter((v) => v.origin === 'llm').length;
    const infos = violations.filter(
        (v) => v.severity === 'info' || (v.origin === 'llm' && v.confidence !== 'HIGH'),
    ).length;
    const conformCount = conformant.length;
    const conformanceRate = total > 0 ? (total - high) / total : null;
    return {
        total,
        conformCount,
        conformanceRate,
        highViolations: high,
        infoFlags: infos,
        heuristicViolations: heuristics,
    };
}

export function mergeScanPayload(args: MergeArgs): ScanPayload {
    const { deterministic, llm, schemaMode, textStyleSchema } = args;

    const colorHeuristics = llm.semanticColor
        .filter((j) => j.verdict === 'FAIL')
        .map(heuristicColor);
    const typoHeuristics = llm.typography
        .filter((j) => j.verdict === 'FAIL')
        .map((j) => heuristicTypo(j, textStyleSchema));

    const buildOutput = (cat: Category, extra: Violation[]): EvaluateOutput => {
        const d = deterministic[cat];
        const violations = [...d.violations, ...extra];
        return {
            violations,
            conformant: d.conformant,
            summary: summarize(violations, d.conformant, d.total),
        };
    };

    return {
        color: buildOutput('color', colorHeuristics),
        space: buildOutput('space', []),
        dimension: buildOutput('dimension', []),
        typography: buildOutput('typography', typoHeuristics),
        borderRadius: buildOutput('borderRadius', []),
        shadow: buildOutput('shadow', []),
        schemaMode,
    };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter figma-token-review-plugin vitest run src/ui/features/llm/merge.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/features/llm/merge.ts apps/figma-token-review-plugin/src/ui/features/llm/merge.test.ts
git commit -m "feat(figma-token-review-plugin): axis→ViolationType map + matchedRule prepend + suggested filter"
```

---

### Task 10: Thread `textStyleSchema` into `mergeScanPayload` via `runLlmEvaluation`

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/index.ts`

**Interfaces:**
- Consumes: `MergeArgs.textStyleSchema` (Task 9), `loadTextStyleSchema` (already imported).
- Produces: `runLlmEvaluation` passes the loaded `textStyleSchema` into `mergeScanPayload`.

- [ ] **Step 1: Thread `textStyleSchema` into `mergeArgs`**

In `src/ui/features/llm/index.ts`, find the `mergeArgs` construction (near the end of `runLlmEvaluation`). Replace with:

```ts
const mergeArgs: MergeArgs = {
    deterministic: det,
    llm: judgments,
    schemaMode: extract.schemaMode,
    textStyleSchema,
};
return mergeScanPayload(mergeArgs);
```

`textStyleSchema` is already loaded near the top of `runLlmEvaluation` — no new load call.

- [ ] **Step 2: Run all plugin tests to verify end-to-end stability**

Run: `pnpm --filter figma-token-review-plugin vitest run`
Expected: 100% pass, including all pre-existing suites.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter figma-token-review-plugin tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/features/llm/index.ts
git commit -m "feat(figma-token-review-plugin): pass textStyleSchema to mergeScanPayload for suggested filter"
```

---

## Post-implementation checklist (manual QA)

Not tasks — verification steps after all tasks are green.

- [ ] Load the plugin in Figma, pick a frame with mixed textStyles (heading + body), scan it. Confirm each conformant typography target appears in the LLM output with an `axis` value and a non-hallucinated `matchedRule` (spot-check against the actual `when`/`avoid` entries in `text-style.json`).
- [ ] Scan a frame containing raw (unstyled) text. Confirm the `typo-raw` violation card shows a `suggested` chip when the raw fontSize matches one of the schema-defined sizes.
- [ ] Scan a frame with a text node that has a styled-override. Confirm the `typo-styled-override` card offers the original bound style as the suggested chip.
- [ ] Scan a mobile-viewport frame using a `display*` textStyle. Confirm the LLM emits a `typo-viewport-misfit` violation with `matchedRule` citing the "mobile viewports → heading1" clause.

## Self-Review

Spec coverage — every section maps to a task:

- Spec §4.1 (schemas.ts) → Task 1.
- Spec §4.2 (loaders fontSize) → Task 2.
- Spec §4.3 (parse.ts) → Task 7.
- Spec §4.4 (rubric.ts) → Task 5.
- Spec §5 (extract.ts walkTree) → Task 6.
- Spec §6 (evaluate deterministic suggested) → Task 3.
- Spec §6.1 (recommend.ts pass-through) → Task 4.
- Spec §7 (prompt.ts) → Task 8.
- Spec §8 (merge.ts) → Task 9.
- Spec §9 (runLlmEvaluation wiring) → Task 10.
- Spec §10 (error handling) — behaviors are tested inside their host tasks (Task 3 fontSize=null, Task 6 classifyTextNode throw, Task 7 axis outside union, Task 9 suggested filter).
- Spec §11 (testing) — each test bullet lands inside its task's Step 1 / Step 2 pair.
- Spec §12 (rollout) — no code impact; noted in Global Constraints.
- Spec §14 (success criteria) — manual QA checklist above.

Type / name consistency check:

- `axis` values (`hierarchy` / `role` / `viewport`) match across Task 7 (parse.ts), Task 8 (prompt strings), Task 9 (AXIS_TO_TYPE keys).
- `ViolationType` additions (`typo-role-misfit`, `typo-viewport-misfit`) match between Task 1 (schemas), Task 9 (AXIS_TO_TYPE), and the recommend.ts LLM early-return comment (Task 4).
- `MergeArgs.textStyleSchema` in Task 9 matches the field passed from Task 10.
- `TextStyleMeta.fontSize` in Task 2 matches usage in Task 3 (`schema.styles[name].fontSize`).
- `evaluateTypography` signature unchanged — still `(usages, schema)` — so `runLlmEvaluation` call site (already correct) needs no change.

No placeholders remain — every code block is executable as written.
