# Figma Token Semantic Judgment with Vision — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the figma-token-review-plugin LLM stage so it judges tokens against three inputs — rubric, frame node tree, and a frame screenshot — instead of rubric alone.

**Architecture:** Plugin sandbox additionally captures the frame as a base64 PNG (`figma.exportAsync`) and walks the visible node subtree into a flat `NodeInfo[]`. Both ride in a sibling `LlmContext` field on the existing `extract-result` message so `RawExtract` stays pure for deterministic evaluators. The UI iframe assembles a multi-block Anthropic user message (text JSON + image block) and posts it to LiteLLM.

**Tech Stack:** TypeScript, Figma Plugin API, Vite, Vitest, LiteLLM proxy to Anthropic Messages API (model `claude-sonnet-4-6`, vision-capable).

**Related spec:** `docs/superpowers/specs/2026-07-01-figma-token-semantic-judgment-with-vision-design.md`

## Global Constraints

- **Working directory:** all paths are relative to `apps/figma-token-review-plugin/` unless otherwise stated.
- **Plugin sandbox has no network.** All LiteLLM traffic stays in the UI iframe. Sandbox exposes data only via `figma.ui.postMessage`.
- **Screenshot format:** PNG, `constraint: { type: 'SCALE', value: 1 }`. Base64 without data-URL prefix.
- **Skip helper:** `shouldSkipNode` (extract.ts:21) already prunes 🟨/🔶 nodes; the tree walk reuses it.
- **Model:** default `claude-sonnet-4-6` (vision-capable). No fallback model logic in this plan.
- **Deterministic path unchanged.** Existing evaluators must not see `LlmContext`.
- **TDD discipline:** write failing test, watch it fail, minimal impl, watch it pass, commit.
- **Test runner:** `pnpm --filter figma-token-review-plugin test` runs Vitest for the package.

## File Structure

Files created or modified, one line per responsibility:

- **`src/common/schemas.ts`** (modify) — add `NodeInfo` and `LlmContext` types. Keep `RawExtract` unchanged.
- **`src/common/messages.ts`** (modify) — change `extract-result` payload from `RawExtract` to `{ extract: RawExtract; llmContext: LlmContext }`.
- **`src/plugin/handlers/extract.ts`** (modify) — add `captureScreenshot`, `walkTree`; change `extractFrame` return shape.
- **`src/plugin/handlers/extract.test.ts`** (create) — unit tests for `captureScreenshot` and `walkTree` (mock FrameNode).
- **`src/ui/features/messaging/evaluate.ts`** (modify) — read `msg.payload.extract` + pass `msg.payload.llmContext` to `runLlmEvaluation`.
- **`src/ui/lib/rubric.ts`** (modify) — `LlmInput.nodeTree`, `BuildLlmInputArgs.nodeTree`, thread into output.
- **`src/ui/lib/rubric.test.ts`** (modify) — assert `nodeTree` populated in `LlmInput`.
- **`src/ui/features/llm/prompt.ts`** (modify) — content becomes array; add `buildRequest(input, screenshotB64, model)`; guide prompt mentions the three inputs.
- **`src/ui/features/llm/prompt.test.ts`** (create) — assert content array shape with and without screenshot.
- **`src/ui/features/llm/index.ts`** (modify) — `runLlmEvaluation(extract, llmContext, options)` signature; thread nodeTree + screenshot through.

Total: 6 modified, 2 created (test files). `src/plugin/handlers/scan.ts` and `src/ui/features/messaging/bridge.ts` compile-through with no source edits (types re-flow).

---

## Task 1: Add `NodeInfo` and `LlmContext` types to shared schemas

**Files:**
- Modify: `apps/figma-token-review-plugin/src/common/schemas.ts` (append near the other shared types, after `RawExtract`)

**Interfaces:**
- Consumes: nothing (base types).
- Produces:
  - `NodeInfo = { id: string; type: string; name: string; parentId: string | null; childIds: string[]; x: number; y: number; w: number; h: number }`
  - `LlmContext = { screenshotB64: string; nodeTree: NodeInfo[] }`

- [ ] **Step 1: Add types to `schemas.ts`**

Append the following to `apps/figma-token-review-plugin/src/common/schemas.ts` (order relative to existing exports does not matter as long as they are top-level):

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
};

export type LlmContext = {
    screenshotB64: string;
    nodeTree: NodeInfo[];
};
```

- [ ] **Step 2: Verify types compile in isolation**

Run:

```
pnpm --filter figma-token-review-plugin exec tsc --noEmit
```

Expected: no new errors (existing errors elsewhere are addressed by later tasks; the new type additions themselves do not reference anything outside stdlib).

- [ ] **Step 3: Commit**

```bash
git add apps/figma-token-review-plugin/src/common/schemas.ts
git commit -m "feat(figma-token-review-plugin): add NodeInfo + LlmContext types"
```

---

## Task 2: Change `extract-result` payload shape

**Files:**
- Modify: `apps/figma-token-review-plugin/src/common/messages.ts:5`

**Interfaces:**
- Consumes: `RawExtract`, `LlmContext` (from Task 1).
- Produces: `CodeMsg` union member `{ type: 'extract-result'; payload: { extract: RawExtract; llmContext: LlmContext } }`.

- [ ] **Step 1: Update `CodeMsg` in `messages.ts`**

Current (line 1):

```ts
import type { RawExtract, SelectionState } from './schemas';
```

Change to:

```ts
import type { LlmContext, RawExtract, SelectionState } from './schemas';
```

Current (line 5):

```ts
    | { type: 'extract-result'; payload: RawExtract }
```

Change to:

```ts
    | { type: 'extract-result'; payload: { extract: RawExtract; llmContext: LlmContext } }
```

- [ ] **Step 2: Run typecheck to surface consumers that break**

Run:

```
pnpm --filter figma-token-review-plugin exec tsc --noEmit
```

Expected: two new type errors —
- `src/plugin/handlers/scan.ts:27` — `payload` from `extractFrame` is `RawExtract`, not `{ extract; llmContext }`. Fixed by Task 3.
- `src/ui/features/messaging/evaluate.ts:20` — `msg.payload` passed to `runLlmEvaluation(extract, options)` no longer matches. Fixed by Task 6.

These are expected; leave them until their owning tasks land. Do **not** commit here.

- [ ] **Step 3: Do not commit yet**

This task's edit is a load-bearing type change; committing it in isolation would leave the tree in a broken state. It will be committed together with Task 3.

---

## Task 3: Plugin sandbox — capture screenshot + walk tree

**Files:**
- Modify: `apps/figma-token-review-plugin/src/plugin/handlers/extract.ts:301` (`extractFrame` return type + body tail)
- Modify: `apps/figma-token-review-plugin/src/plugin/handlers/extract.ts` (add two helpers near the top, above `extractFrame`)

**Interfaces:**
- Consumes: `LlmContext` (Task 1), the existing `shouldSkipNode` helper (extract.ts:21), Figma Plugin API globals `figma.base64Encode`, `FrameNode.exportAsync`.
- Produces: `extractFrame(frameId: string): Promise<{ extract: RawExtract; llmContext: LlmContext }>`.

- [ ] **Step 1: Write failing tests for `captureScreenshot` and `walkTree`**

Create `apps/figma-token-review-plugin/src/plugin/handlers/extract.test.ts` with:

```ts
import { describe, expect, it, vi } from 'vitest';

import { __testables } from './extract';

const { captureScreenshot, walkTree } = __testables;

describe('captureScreenshot', () => {
    it('base64-encodes exportAsync bytes as PNG at scale 1', async () => {
        const bytes = new Uint8Array([1, 2, 3, 4]);
        const frame = {
            exportAsync: vi.fn().mockResolvedValue(bytes),
        } as unknown as FrameNode;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).figma = { base64Encode: (b: Uint8Array) => Buffer.from(b).toString('base64') };

        const out = await captureScreenshot(frame);
        expect(frame.exportAsync).toHaveBeenCalledWith({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 1 },
        });
        expect(out).toBe(Buffer.from(bytes).toString('base64'));
    });
});

describe('walkTree', () => {
    it('emits parent before children, skips 🟨/🔶 subtrees, populates xywh', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leaf = { id: 'l', type: 'TEXT', name: 'label', x: 5, y: 6, width: 7, height: 8 } as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const skipped = { id: 's', type: 'GROUP', name: '🟨 legend', children: [leaf], x: 0, y: 0, width: 0, height: 0 } as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const root = { id: 'r', type: 'FRAME', name: 'Root', children: [skipped, leaf], x: 0, y: 0, width: 100, height: 200 } as any;

        const tree = walkTree(root);

        const ids = tree.map((n) => n.id);
        expect(ids).toContain('r');
        expect(ids).toContain('l');
        expect(ids).not.toContain('s');
        expect(tree[0]?.id).toBe('r');
        const leafInfo = tree.find((n) => n.id === 'l')!;
        expect(leafInfo).toMatchObject({ parentId: 'r', childIds: [], x: 5, y: 6, w: 7, h: 8 });
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
pnpm --filter figma-token-review-plugin exec vitest run src/plugin/handlers/extract.test.ts
```

Expected: FAIL — `__testables` is not exported from `extract.ts`.

- [ ] **Step 3: Implement helpers and export test hook**

In `apps/figma-token-review-plugin/src/plugin/handlers/extract.ts`, insert the following block **immediately above** the existing `extractFrame` declaration (around line 300):

```ts
async function captureScreenshot(frame: FrameNode): Promise<string> {
    const bytes = await frame.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1 },
    });
    return figma.base64Encode(bytes);
}

function walkTree(root: SceneNode): NodeInfo[] {
    const out: NodeInfo[] = [];
    const stack: Array<{ node: SceneNode; parentId: string | null }> = [{ node: root, parentId: null }];
    while (stack.length > 0) {
        const frame = stack.pop();
        if (!frame) continue;
        const { node, parentId } = frame;
        if (shouldSkipNode(node.name)) continue;
        const children: readonly SceneNode[] =
            'children' in node ? (node.children as readonly SceneNode[]) : [];
        out.push({
            id: node.id,
            type: node.type,
            name: node.name,
            parentId,
            childIds: children.map((c) => c.id),
            x: 'x' in node ? (node as { x: number }).x : 0,
            y: 'y' in node ? (node as { y: number }).y : 0,
            w: 'width' in node ? (node as { width: number }).width : 0,
            h: 'height' in node ? (node as { height: number }).height : 0,
        });
        // Preserve document order in the output: push children in reverse so pop() yields them in-order.
        for (let i = children.length - 1; i >= 0; i--) {
            stack.push({ node: children[i]!, parentId: node.id });
        }
    }
    return out;
}

export const __testables = { captureScreenshot, walkTree };
```

Add `LlmContext` and `NodeInfo` to the existing import at the top of the file:

```ts
import type {
    ColorBackground,
    ColorProperty,
    ColorUsage,
    DimensionUsage,
    LlmContext,
    NodeInfo,
    RadiusUsage,
    RawExtract,
    SchemaMode,
    ShadowUsage,
    SpaceUsage,
    TokenStatus,
    TypographyUsage,
    Viewport,
} from '~/common/schemas';
```

- [ ] **Step 4: Run test to verify it passes**

```
pnpm --filter figma-token-review-plugin exec vitest run src/plugin/handlers/extract.test.ts
```

Expected: both tests PASS.

- [ ] **Step 5: Change `extractFrame` return shape**

Current signature at `extract.ts:301`:

```ts
export async function extractFrame(frameId: string): Promise<RawExtract> {
```

Change to:

```ts
export async function extractFrame(
    frameId: string,
): Promise<{ extract: RawExtract; llmContext: LlmContext }> {
```

At the end of `extractFrame` (locate the current `return { ... }` that produces the `RawExtract`), refactor to:

```ts
    const extract: RawExtract = { /* ...existing return literal, unchanged... */ };

    let screenshotB64 = '';
    try {
        screenshotB64 = await captureScreenshot(root as FrameNode);
    } catch (err) {
        console.warn('[figma-token-review-plugin] exportAsync failed, continuing text-only', err);
    }

    let nodeTree: NodeInfo[] = [];
    try {
        nodeTree = walkTree(root as SceneNode);
    } catch (err) {
        console.warn('[figma-token-review-plugin] walkTree failed, continuing without tree', err);
        nodeTree = [];
    }

    return { extract, llmContext: { screenshotB64, nodeTree } };
```

Concretely: whatever object literal is currently `return`ed becomes the value of `const extract: RawExtract = { ... }`; then the new final `return` wraps it.

- [ ] **Step 6: Fix scan.ts postToUi typing**

Open `apps/figma-token-review-plugin/src/plugin/handlers/scan.ts`. Line 27–31 currently reads:

```ts
const payload = await extractFrame(msg.frameId);

if (activeRequestId !== requestId) return;

postToUi({ type: 'extract-result', payload }, requestId ?? undefined);
```

No source change needed — `payload` is now of the new shape, and `postToUi` accepts it via the updated `CodeMsg`. Confirm by running:

```
pnpm --filter figma-token-review-plugin exec tsc --noEmit
```

Expected: the error at `scan.ts:27–31` is gone. The remaining error is at `evaluate.ts:20` and is fixed by Task 6.

- [ ] **Step 7: Commit**

```bash
git add \
    apps/figma-token-review-plugin/src/common/schemas.ts \
    apps/figma-token-review-plugin/src/common/messages.ts \
    apps/figma-token-review-plugin/src/plugin/handlers/extract.ts \
    apps/figma-token-review-plugin/src/plugin/handlers/extract.test.ts
git commit -m "feat(figma-token-review-plugin): capture frame screenshot + node tree in extract stage"
```

(This commit intentionally bundles Task 1, Task 2, and Task 3 because Tasks 1 and 2 leave the tree uncompilable in isolation; Task 3 closes the plugin side. UI side remains broken until Task 6 lands.)

---

## Task 4: Extend `LlmInput` with `nodeTree`

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/lib/rubric.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/lib/rubric.test.ts`

**Interfaces:**
- Consumes: `NodeInfo` from Task 1.
- Produces:
  - `LlmInput` gains `nodeTree: NodeInfo[]`.
  - `BuildLlmInputArgs` gains `nodeTree: NodeInfo[]`.
  - `buildLlmInput(args)` copies `args.nodeTree` into the returned `LlmInput`.

- [ ] **Step 1: Write failing test for `nodeTree` passthrough**

Open `apps/figma-token-review-plugin/src/ui/lib/rubric.test.ts` and append a new test case inside the existing `describe` block (or add a new `describe('buildLlmInput — nodeTree', …)`):

```ts
    it('threads nodeTree from args into LlmInput unchanged', () => {
        const nodeTree = [
            { id: 'r', type: 'FRAME', name: 'Root', parentId: null, childIds: ['c'], x: 0, y: 0, w: 10, h: 10 },
            { id: 'c', type: 'TEXT', name: 'Caption', parentId: 'r', childIds: [], x: 1, y: 2, w: 3, h: 4 },
        ];
        const input = buildLlmInput({
            // Reuse whatever minimal fixtures the existing tests already build.
            extract: makeEmptyExtract(),
            deterministicConformant: { color: [], typography: [] },
            frameName: 'F',
            colorSchema: makeEmptyColorSchema(),
            textStyleSchema: makeEmptyTextStyleSchema(),
            nodeTree,
        });
        expect(input.nodeTree).toEqual(nodeTree);
    });
```

If helper factories (`makeEmptyExtract`, `makeEmptyColorSchema`, `makeEmptyTextStyleSchema`) are not already present in the test file, reuse whichever minimal object literals the neighboring tests build; do not invent new helpers.

- [ ] **Step 2: Run test to verify it fails**

```
pnpm --filter figma-token-review-plugin exec vitest run src/ui/lib/rubric.test.ts
```

Expected: FAIL — either `nodeTree` is not on `BuildLlmInputArgs` (compile error) or `input.nodeTree` is undefined.

- [ ] **Step 3: Add `nodeTree` to types + implementation**

In `apps/figma-token-review-plugin/src/ui/lib/rubric.ts`:

1. Add `NodeInfo` to the import from `~/common/schemas` (join the existing import list).
2. Extend `LlmInput`:

```ts
export type LlmInput = {
    context: { schemaMode: 'light' | 'dark'; viewport: string; frameName: string };
    judgmentTargets: { typography: TypographyTarget[]; semanticColor: ColorTarget[] };
    rubric: {
        textStyle: Record<string, TextStyleMetaSubset>;
        color: Record<string, ColorMetaSubset>;
    };
    nodeTree: NodeInfo[]; // NEW
};
```

(Keep any additional fields the current `LlmInput` already carries — this snippet lists the four fields the design specifies; do not delete anything already there.)

3. Extend `BuildLlmInputArgs`:

```ts
export type BuildLlmInputArgs = {
    extract: RawExtract;
    deterministicConformant: { color: Conformant[]; typography: Conformant[] };
    frameName: string;
    colorSchema: ColorSchema;
    textStyleSchema: TextStyleSchema;
    nodeTree: NodeInfo[]; // NEW
};
```

4. Inside `buildLlmInput`, add `nodeTree: args.nodeTree` to the returned `LlmInput` literal.

- [ ] **Step 4: Run test to verify it passes**

```
pnpm --filter figma-token-review-plugin exec vitest run src/ui/lib/rubric.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
    apps/figma-token-review-plugin/src/ui/lib/rubric.ts \
    apps/figma-token-review-plugin/src/ui/lib/rubric.test.ts
git commit -m "feat(figma-token-review-plugin): thread nodeTree into LlmInput"
```

---

## Task 5: Change `buildRequest` to emit a multi-block user message

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/prompt.ts`
- Create: `apps/figma-token-review-plugin/src/ui/features/llm/prompt.test.ts`

**Interfaces:**
- Consumes: `LlmInput` (updated in Task 4).
- Produces: `buildRequest(input: LlmInput, screenshotB64: string, model: string): AnthropicMessagesRequest` where `AnthropicMessagesRequest.messages[0].content` is `Array<TextBlock | ImageBlock>`.

- [ ] **Step 1: Write failing tests for the new `buildRequest` shape**

Create `apps/figma-token-review-plugin/src/ui/features/llm/prompt.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import type { LlmInput } from '~/ui/lib/rubric';

import { buildRequest } from './prompt';

function baseInput(): LlmInput {
    return {
        context: { schemaMode: 'light', viewport: 'pc', frameName: 'F' },
        judgmentTargets: { typography: [], semanticColor: [] },
        rubric: { textStyle: {}, color: {} },
        nodeTree: [],
    };
}

describe('buildRequest', () => {
    it('with a non-empty screenshot, emits [text, image] content blocks', () => {
        const req = buildRequest(baseInput(), 'AAAA', 'claude-sonnet-4-6');
        expect(req.messages).toHaveLength(1);
        const content = req.messages[0]!.content as Array<{ type: string }>;
        expect(content).toHaveLength(2);
        expect(content[0]).toMatchObject({ type: 'text' });
        expect(content[1]).toMatchObject({
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: 'AAAA' },
        });
    });

    it('with empty screenshot, emits [text] only', () => {
        const req = buildRequest(baseInput(), '', 'claude-sonnet-4-6');
        const content = req.messages[0]!.content as Array<{ type: string }>;
        expect(content).toHaveLength(1);
        expect(content[0]).toMatchObject({ type: 'text' });
    });

    it('serializes the input into the text block as JSON', () => {
        const input = baseInput();
        input.context.frameName = 'MyFrame';
        const req = buildRequest(input, '', 'claude-sonnet-4-6');
        const first = (req.messages[0]!.content as Array<{ type: string; text?: string }>)[0]!;
        const parsed = JSON.parse(first.text ?? '');
        expect(parsed.context.frameName).toBe('MyFrame');
        expect(Array.isArray(parsed.nodeTree)).toBe(true);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
pnpm --filter figma-token-review-plugin exec vitest run src/ui/features/llm/prompt.test.ts
```

Expected: FAIL — signature mismatch (`buildRequest` currently takes `(input, model)` and returns string content).

- [ ] **Step 3: Rewrite `buildRequest`**

Replace the tail of `apps/figma-token-review-plugin/src/ui/features/llm/prompt.ts` (from `export type AnthropicMessagesRequest = …` onward) with:

```ts
export type SystemBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } };

export type TextBlock = { type: 'text'; text: string };

export type ImageBlock = {
    type: 'image';
    source: { type: 'base64'; media_type: 'image/png'; data: string };
};

export type AnthropicMessagesRequest = {
    model: string;
    max_tokens: number;
    system: SystemBlock[];
    messages: Array<{ role: 'user'; content: Array<TextBlock | ImageBlock> }>;
};

export function buildRequest(
    input: LlmInput,
    screenshotB64: string,
    model: string,
): AnthropicMessagesRequest {
    const content: Array<TextBlock | ImageBlock> = [
        { type: 'text', text: JSON.stringify(input) },
    ];
    if (screenshotB64) {
        content.push({
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: screenshotB64 },
        });
    }
    return {
        model,
        max_tokens: 4096,
        system: [
            { type: 'text', text: SYSTEM_BASE },
            { type: 'text', text: SEMANTIC_GUIDE, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content }],
    };
}
```

- [ ] **Step 4: Update `SYSTEM_BASE` and `SEMANTIC_GUIDE` to mention the three inputs**

At the top of `prompt.ts`, extend the existing `SYSTEM_BASE` string array by inserting the following three lines just before the line reading `'출력은 다음 JSON 객체 하나뿐. …'`:

```ts
    '판정 입력은 세 가지다:',
    '1) rubric — 각 토큰의 의도(when/avoid, typography는 rank/totalRanks 포함). 사용된 토큰의 의도와 자리의 부합 여부를 판정.',
    '2) nodeTree — 프레임 하위 노드의 구조(id, type, name, parentId, childIds, xywh). 대상 노드의 컴포넌트/이웃 관계 파악에 사용.',
    '3) 첨부 이미지 — 렌더된 프레임. 구조로 안 잡히는 시각적 위계(가장 큰 헤딩인가, 경고 색 자리인가)를 판정에 반영.',
```

Do not modify any other line of the prompt. `SEMANTIC_GUIDE` stays as-is.

- [ ] **Step 5: Run test to verify it passes**

```
pnpm --filter figma-token-review-plugin exec vitest run src/ui/features/llm/prompt.test.ts
```

Expected: all three tests PASS.

- [ ] **Step 6: Commit**

```bash
git add \
    apps/figma-token-review-plugin/src/ui/features/llm/prompt.ts \
    apps/figma-token-review-plugin/src/ui/features/llm/prompt.test.ts
git commit -m "feat(figma-token-review-plugin): buildRequest emits text+image content blocks"
```

---

## Task 6: Wire `LlmContext` through `runLlmEvaluation` and its caller

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/index.ts:30` (`runLlmEvaluation` signature and body)
- Modify: `apps/figma-token-review-plugin/src/ui/features/messaging/evaluate.ts:20` (pass `llmContext`)

**Interfaces:**
- Consumes: `LlmContext` (Task 1), `nodeTree` field on `BuildLlmInputArgs` (Task 4), new `buildRequest` signature (Task 5).
- Produces: `runLlmEvaluation(extract: RawExtract, llmContext: LlmContext, options?: RunLlmEvaluationOptions): Promise<ScanPayload>`.

- [ ] **Step 1: Update `runLlmEvaluation` signature**

In `apps/figma-token-review-plugin/src/ui/features/llm/index.ts`:

1. Add `LlmContext` to the imports:

```ts
import type { Category, LlmContext, RawExtract, ScanPayload } from '~/common/schemas';
```

2. Change the exported signature (currently at line 30):

```ts
export async function runLlmEvaluation(
    extract: RawExtract,
    llmContext: LlmContext,
    options: RunLlmEvaluationOptions = {},
): Promise<ScanPayload> {
```

3. In the body, at the `buildLlmInput({ … })` call (around line 71), add `nodeTree: llmContext.nodeTree` to the arg object:

```ts
    const llmInput = buildLlmInput({
        extract,
        deterministicConformant: {
            color: det.color.conformant,
            typography: det.typography.conformant,
        },
        frameName,
        colorSchema,
        textStyleSchema,
        nodeTree: llmContext.nodeTree,
    });
```

4. Change the `buildRequest` call (currently at line 82):

```ts
    const request = buildRequest(llmInput, llmContext.screenshotB64, model);
```

- [ ] **Step 2: Update `evaluateExtract` caller**

In `apps/figma-token-review-plugin/src/ui/features/messaging/evaluate.ts`, the current line 20 reads:

```ts
const payload = await runLlmEvaluation(msg.payload, { signal: controller.signal });
```

Change to:

```ts
const payload = await runLlmEvaluation(msg.payload.extract, msg.payload.llmContext, {
    signal: controller.signal,
});
```

- [ ] **Step 3: Run typecheck**

```
pnpm --filter figma-token-review-plugin exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run full test suite**

```
pnpm --filter figma-token-review-plugin test
```

Expected: all tests PASS, including the ones added in Tasks 3, 4, 5.

- [ ] **Step 5: Commit**

```bash
git add \
    apps/figma-token-review-plugin/src/ui/features/llm/index.ts \
    apps/figma-token-review-plugin/src/ui/features/messaging/evaluate.ts
git commit -m "feat(figma-token-review-plugin): thread LlmContext through runLlmEvaluation + evaluateExtract"
```

---

## Task 7: Smoke check in the running plugin

**Files:**
- No file changes. This is a manual verification pass.

**Interfaces:**
- Consumes: the full pipeline built by Tasks 1–6.
- Produces: confidence that the change works end-to-end against Figma + LiteLLM.

- [ ] **Step 1: Build the plugin**

```
pnpm --filter figma-token-review-plugin build
```

Expected: build completes with no errors. `dist/` is populated.

- [ ] **Step 2: Load into Figma desktop and scan a representative frame**

Manual: from Figma → Plugins → Development → Import plugin from manifest → select `apps/figma-token-review-plugin/manifest.json`. Open a file with a well-typed frame, select the frame, run the plugin, hit Scan.

Expected:
- Scan completes without a toast error.
- LLM output includes `reasoning` strings that reference visual/structural context (e.g. "카드 제목 위치", "가장 큰 헤딩") — spot check 2–3 items on the same frame.
- DevTools Network tab (for the UI iframe) shows the LiteLLM request with a `content` array of length 2 (text + image) on scans where `screenshotB64` is non-empty.

- [ ] **Step 3: Record findings**

If reasoning still references only token names (no visual or structural language), the prompt guide from Task 5 Step 4 is not being followed by the model. Iterate on `SEMANTIC_GUIDE` — this is expected to be a follow-up, not part of this plan.

- [ ] **Step 4: No commit**

Manual verification only.

---

## Self-Review Notes

**Spec coverage (§ from spec → task):**
- §4.1 `NodeInfo` + `LlmContext` → Task 1.
- §4.2 `extract-result` payload shape → Task 2 (+ closed with Task 3).
- §4.3 `LlmInput.nodeTree` → Task 4.
- §5 sandbox `captureScreenshot` + `walkTree` + `extractFrame` return → Task 3.
- §6 `buildRequest` array content + guide prompt update → Task 5.
- §7 `runLlmEvaluation(extract, llmContext, options)` + `evaluateExtract` → Task 6.
- §8 error handling (empty base64 → skip image block; `walkTree` throws → empty tree) → Task 3 Step 5 (try/catch), Task 5 Step 3 (image-block gate).
- §9 tests → covered in Tasks 3, 4, 5.
- §10 rollout — no manifest change → confirmed by Task 7 Step 1 (build succeeds without touching `manifest.json`).

**Type consistency check:**
- `NodeInfo`, `LlmContext` names used identically in schemas.ts, extract.ts, rubric.ts, index.ts, evaluate.ts.
- `buildRequest(input, screenshotB64, model)` argument order matches the call in `index.ts` Task 6 Step 1 item 4.
- `BuildLlmInputArgs.nodeTree` in Task 4 matches usage in Task 6 Step 1 item 3.

**Placeholder scan:** No TBD/TODO or "similar to Task N" references. All code blocks contain the actual code the engineer types.

**Commit boundary note:** Tasks 1 and 2 do not each commit; they roll into Task 3's commit because their combined output leaves the source tree uncompilable until Task 3 closes the plugin side. The UI side then stays broken until Task 6 closes it. Two commits total for the type-flow ripple: Task 3 (sandbox side) and Task 6 (UI side).
