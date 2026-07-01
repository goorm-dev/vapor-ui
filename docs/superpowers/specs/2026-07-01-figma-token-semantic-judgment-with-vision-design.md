# Figma Token Review — Stage 3 Semantic Judgment with Vision Context

- Date: 2026-07-01
- Author: noah.choi
- Status: Draft
- Related: `2026-06-29-figma-token-review-llm-integration-design.md`, `2026-06-30-figma-token-review-plugin-deterministic-split-design.md`

## 1. Goal

Enrich the existing LLM judgment stage in `apps/figma-token-review-plugin` with two additional context inputs so the LLM can reason about semantic role and visual hierarchy — not just the token rubric.

Currently the LLM receives only a text JSON payload: `{ context, judgmentTargets, rubric }`. This spec adds:

1. **`nodeTree`** — a compressed metadata tree of the scanned frame, giving structural context (parent/sibling, position, size, type/name per node).
2. **`screenshotB64`** — a single PNG capture of the scanned frame, giving visual hierarchy and emphasis that structure alone cannot express.

The LLM continues to judge only tokens that were classified as `conformant` by the deterministic stage. The output shape (`ScanPayload`) is unchanged.

## 2. Non-Goals

- Per-target node screenshots (frame-level capture only).
- Text characters embedded in the tree (structure only; existing `TypographyUsage.characters` still carries text where needed).
- Judging deterministic violations. Violations already have their explanation from the rule engine.
- Auto-fix / write-back of suggested tokens.
- Multi-frame batch scanning or streaming responses.
- Retry loops that re-run the LLM at higher screenshot resolution when confidence is LOW.

## 3. Architecture

### 3.1 Data flow

```
plugin sandbox                                 UI iframe
──────────────                                 ────────
extractFrame(frameId):
  RawExtract (unchanged shape)
  + captureScreenshot(frame) → base64 PNG
  + walkTree(frame)          → NodeInfo[]

  postToUi 'extract-result':
    { extract: RawExtract, llmContext: LlmContext }
                                              ┌─────────────────────────────┐
                                              │ store: keep extract +       │
                                              │ llmContext side-by-side     │
                                              │                             │
                                              │ deterministic evaluators    │
                                              │   ← read only `extract`     │
                                              │                             │
                                              │ buildLlmInput(              │
                                              │   ...,                      │
                                              │   nodeTree: llmContext      │
                                              │            .nodeTree)       │
                                              │                             │
                                              │ buildRequest(               │
                                              │   llmInput,                 │
                                              │   llmContext                │
                                              │     .screenshotB64,         │
                                              │   model)                    │
                                              │                             │
                                              │ postLiteLLM → judgments     │
                                              │ mergeScanPayload            │
                                              └─────────────────────────────┘
```

Deterministic code path is untouched. New data flows in a sibling `LlmContext` field so the pre-existing `RawExtract` type stays pure.

### 3.2 Rationale for the split

Two reasons the LLM extras live outside `RawExtract`:

- **Deterministic evaluators must not depend on visual context.** Keeping the types disjoint enforces this at the type level.
- **`RawExtract` is used by tests, fixtures, and future callers that might not need vision.** Attaching a large base64 blob to it would bleed into those callsites unnecessarily.

## 4. Data Model Changes

### 4.1 `src/common/schemas.ts` — new types

```ts
export type NodeInfo = {
    id: string;
    type: string;            // 'FRAME' | 'TEXT' | 'RECTANGLE' | 'INSTANCE' | ...
    name: string;
    parentId: string | null;
    childIds: string[];
    x: number;
    y: number;
    w: number;
    h: number;
};

export type LlmContext = {
    screenshotB64: string;   // frame PNG, scale 1.0, base64 (no data-URL prefix)
    nodeTree: NodeInfo[];    // BFS/DFS order, skip-prefix nodes filtered out
};
```

`RawExtract` is not changed.

### 4.2 `src/common/messages.ts` — extract-result payload

```ts
// Before
type ExtractResultMsg = { type: 'extract-result'; payload: RawExtract };

// After
type ExtractResultPayload = {
    extract: RawExtract;
    llmContext: LlmContext;
};
type ExtractResultMsg = { type: 'extract-result'; payload: ExtractResultPayload };
```

Existing callers on the UI side that read `msg.payload` as `RawExtract` need to be updated to read `msg.payload.extract`.

### 4.3 `src/ui/lib/rubric.ts` — `LlmInput` gets `nodeTree`

```ts
export type LlmInput = {
    context: { schemaMode: 'light' | 'dark'; viewport: string; frameName: string };
    judgmentTargets: { typography: TypographyTarget[]; semanticColor: ColorTarget[] };
    rubric: {
        textStyle: Record<string, TextStyleMetaSubset>;
        color: Record<string, ColorMetaSubset>;
    };
    nodeTree: NodeInfo[];    // NEW
};

export type BuildLlmInputArgs = {
    // ...existing
    nodeTree: NodeInfo[];    // NEW — passed from LlmContext
};
```

Screenshot bytes stay out of `LlmInput` — they ride as a message content block, not a JSON field. Base64 inside JSON would double-encode and inflate token count.

## 5. Sandbox Changes (`src/plugin/handlers/extract.ts`)

### 5.1 Screenshot capture

```ts
async function captureScreenshot(frame: FrameNode): Promise<string> {
    const bytes = await frame.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1 },
    });
    return figma.base64Encode(bytes);
}
```

Uses `figma.base64Encode` (built-in Plugin API). No manual `btoa` / `Uint8Array → string` gymnastics.

### 5.2 Tree walk

```ts
function walkTree(root: SceneNode): NodeInfo[] {
    const out: NodeInfo[] = [];
    const stack: Array<{ node: SceneNode; parentId: string | null }> = [
        { node: root, parentId: null },
    ];
    while (stack.length) {
        const { node, parentId } = stack.pop()!;
        if (shouldSkipNode(node.name)) continue;   // reuse existing helper
        const children = 'children' in node ? (node.children as readonly SceneNode[]) : [];
        out.push({
            id: node.id,
            type: node.type,
            name: node.name,
            parentId,
            childIds: children.map((c) => c.id),
            x: 'x' in node ? node.x : 0,
            y: 'y' in node ? node.y : 0,
            w: 'width' in node ? node.width : 0,
            h: 'height' in node ? node.height : 0,
        });
        for (const c of children) stack.push({ node: c, parentId: node.id });
    }
    return out;
}
```

- Reuses existing `shouldSkipNode` — nodes prefixed with 🟨 / 🔶 are pruned, matching the extractor's own skip semantics. Children of skipped nodes are also skipped (they never enter the stack).
- Iterative (no recursion) so deep frames do not blow the plugin sandbox call stack.
- No component-instance drill-in — instances appear as opaque nodes just like the current extractor treats them.

### 5.3 `extractFrame` return shape

```ts
// Before
export async function extractFrame(frameId: string): Promise<RawExtract> { ... }

// After
export async function extractFrame(frameId: string): Promise<{
    extract: RawExtract;
    llmContext: LlmContext;
}> {
    const frame = /* resolve frameId to FrameNode as today */;
    const extract = /* existing body, unchanged */;
    const [screenshotB64, nodeTree] = await Promise.all([
        captureScreenshot(frame).catch(() => ''),   // fallback: empty string
        Promise.resolve(walkTree(frame)),
    ]);
    return { extract, llmContext: { screenshotB64, nodeTree } };
}
```

`scan.ts` handler forwards this object as-is inside `postToUi({ type: 'extract-result', payload })`.

## 6. UI Prompt Assembly

### 6.1 `src/ui/features/llm/prompt.ts` — content becomes an array

Anthropic Messages API accepts either a string or an array of content blocks. Existing signature is stringified JSON; new signature is a two-block array (text + image).

```ts
type TextBlock = { type: 'text'; text: string };
type ImageBlock = {
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

Empty `screenshotB64` (capture failed) → image block is omitted, request stays valid, LLM falls back to text-only judgment.

### 6.2 Prompt guidance (`SYSTEM_BASE` / `SEMANTIC_GUIDE`)

Add a short paragraph listing the three input strata:

> Your inputs are three:
> 1. `rubric` — per-token intent (`when`, `avoid`, plus typography `rank`/`totalRanks`). Judge whether the used token's intent fits the target.
> 2. `nodeTree` — the frame's structural context (id, type, name, parent, children, xy/wh). Use it to locate the target within its component and neighborhood.
> 3. The attached image — the rendered frame. Use it for visual hierarchy (largest visible heading? warning-colored context?) that structure alone cannot show.

Keep the rest of `SEMANTIC_GUIDE` untouched (verdict/confidence conventions still apply).

## 7. `runLlmEvaluation` Wiring (`src/ui/features/llm/index.ts`)

```ts
export async function runLlmEvaluation(
    extract: RawExtract,
    llmContext: LlmContext,           // NEW positional argument
    options: RunLlmEvaluationOptions = {},
): Promise<ScanPayload> {
    // ...existing deterministic pass (unchanged)

    const llmInput = buildLlmInput({
        extract,
        deterministicConformant: { color: det.color.conformant, typography: det.typography.conformant },
        frameName,
        colorSchema,
        textStyleSchema,
        nodeTree: llmContext.nodeTree,       // NEW
    });

    const request = buildRequest(llmInput, llmContext.screenshotB64, model);
    // ...rest unchanged
}
```

Callers of `runLlmEvaluation` (scan store / UI feature glue) must be updated to pass the `llmContext` extracted from the `extract-result` message payload.

## 8. Error Handling & Budget

| Failure                              | Behavior                                                                 |
|--------------------------------------|--------------------------------------------------------------------------|
| `exportAsync` throws                 | `screenshotB64 = ''`, log warning, continue. LLM runs text-only.         |
| `screenshotB64` length > 1_000_000 (≈750KB raw) | Log warning; leave as-is for MVP. Retry-at-lower-scale is a future item. |
| `walkTree` throws                    | `nodeTree = []`, log warning, continue. LLM has rubric only.             |
| LiteLLM 413 / oversize               | Surface `LlmHttpError` as today. No implicit retry.                      |

Sandbox → UI message size: Figma's `postMessage` handles multi-hundred-KB payloads without special handling. No chunking needed at MVP scale (frame ≈ 200–500 KB PNG base64).

## 9. Testing

- **`extract.test.ts`** — extend with FrameNode mock that stubs `exportAsync` (returns `Uint8Array`); verify `captureScreenshot` returns non-empty base64 and `walkTree` traversal order (parent before children, skip-prefix nodes pruned along with their subtrees).
- **`rubric.test.ts`** — extend to assert `LlmInput.nodeTree` is populated from `BuildLlmInputArgs.nodeTree`.
- **`prompt.test.ts`** (new file) —
  - `buildRequest` with non-empty `screenshotB64` produces `content` of length 2, second block is `image/png` base64.
  - `buildRequest` with empty `screenshotB64` produces `content` of length 1 (text only).
- **`index.test.ts` / integration** — end-to-end from `{ extract, llmContext }` through `runLlmEvaluation` with a mocked `postLiteLLM`; assert judgment merge output shape unchanged.

Types force the `llmContext` argument at compile time — passing `runLlmEvaluation(extract, options)` (old signature) becomes a type error.

## 10. Rollout & Compatibility

- The change is source-level only (no persisted schema, no fixture format change to `ScanPayload`). Fixtures under `apps/figma-token-review-plugin/fixtures/` that supply `RawExtract` directly to tests continue to work; new tests provide `LlmContext` alongside.
- Model must support vision. Current default `claude-sonnet-4-6` does. If `VITE_LITELLM_MODEL` overrides to a non-vision model, LiteLLM will reject the image block — treat this as a config error, no runtime workaround.
- No `manifest.json` changes required. Plugin sandbox already exports images; UI iframe already reaches LiteLLM host.

## 11. Files Touched (estimated 8)

1. `src/common/schemas.ts` — add `NodeInfo`, `LlmContext`.
2. `src/common/messages.ts` — change `extract-result` payload shape.
3. `src/plugin/handlers/extract.ts` — add `captureScreenshot`, `walkTree`, change return shape.
4. `src/plugin/handlers/scan.ts` — forward the new payload shape to UI.
5. `src/ui/lib/rubric.ts` — extend `LlmInput` and `buildLlmInput` args.
6. `src/ui/features/llm/prompt.ts` — new `buildRequest` signature + image content block.
7. `src/ui/features/llm/index.ts` — thread `llmContext` through `runLlmEvaluation`.
8. UI callsite that invokes `runLlmEvaluation` (scan store / feature glue) — pass `llmContext` from message payload.

All are small; the message payload rename in items 2 and 4 is the widest ripple (any place that reads `msg.payload` as `RawExtract` must switch to `msg.payload.extract`).

## 12. Success Criteria

- Selecting a frame, running scan, and hitting the LLM produces judgments that reference structural / visual context in the `message` field (spot-checked against 3–5 representative frames).
- Existing deterministic rule output is unchanged for the same input.
- All existing unit tests pass. New tests cover screenshot capture, tree walk, and image content block assembly.
- Type errors surface immediately if a caller drops `llmContext`.
