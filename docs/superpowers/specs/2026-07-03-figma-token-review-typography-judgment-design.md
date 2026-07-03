# Figma Token Review — Typography Semantic Judgment

- Date: 2026-07-03
- Author: noah.choi
- Status: Draft
- Related:
    - `2026-07-01-figma-token-semantic-judgment-with-vision-design.md` (stage 3 vision context, prerequisite)
    - `2026-06-30-figma-token-review-plugin-deterministic-split-design.md` (deterministic evaluate split)
    - `skills/figma-token-review/references/evaluation-and-output.md` (3단계 의미 판정 rubric)

## 1. Goal

Make typography review actually surface findings and recommendations. Current pipeline only produces `typo-hierarchy` violations for LLM FAIL on deterministic-conformant text, and the deterministic violations (`typo-raw`, `typo-styled-override`, `unknown-token`) never carry `suggested[]`. Users report seeing zero typography suggestions in practice.

This spec:

1. Expands LLM rubric to the full 16 textStyles so FAIL judgments can propose alternatives that exist.
2. Enriches `nodeTree` TEXT nodes with `characters` and `textStyle` so the LLM can compare rank across neighbors without OCR guessing.
3. Splits the LLM judgment along 3 axes — hierarchy / role / viewport — with an explicit `matchedRule` field so the reasoning cites the actual `when`/`avoid` line.
4. Adds deterministic recommendations for `typo-styled-override` (revert to bound token) and `typo-raw` (fontSize match).

LLM continues to judge only conformant textStyles. Coverage of raw / override / unknown stays on the deterministic side.

## 2. Non-Goals

- Expanding LLM judgment to raw / styled-override / unknown-token targets.
- Unknown-token recommendation via edit-distance / fuzzy name match.
- Multi-frame typography scanning or cross-frame consistency.
- Auto-fix / write-back of suggested textStyles.
- Retry loops on low-confidence typography verdicts.

## 3. Architecture Overview

```
plugin/handlers/extract.ts
    walkTree() — TEXT nodes get { characters, textStyle } optional fields

ui/lib/loaders/typography.ts
    loadTextStyleSchema() — resolve $value.fontSize alias to concrete number

ui/lib/evaluate/typography.ts
    evaluateTypography() — fill suggested for typo-styled-override, typo-raw

ui/lib/rubric.ts
    buildLlmInput() — textStyleRubric spans full 16 styles (was: used only)

ui/features/llm/prompt.ts
    SEMANTIC_GUIDE — 3-axis judgment (hierarchy / role / viewport), matchedRule required

ui/features/llm/parse.ts
    LlmTypoJudgment — axis + matchedRule fields, schema-guarded

ui/features/llm/merge.ts
    heuristicTypo() — axis → ViolationType, matchedRule prepended to message,
    suggested filtered to schema-known names

ui/lib/recommend.ts
    typography cases become pass-through (suggested already filled upstream)
```

Deterministic recommendation lives in `evaluate/typography.ts` (has `TypographyUsage` in hand, including `resolved.fontSize`). `recommend.ts` stops trying to compute typography suggestions since it only sees `Violation` (no usage context).

## 4. Data Model Changes

### 4.1 `src/common/schemas.ts`

```ts
export type NodeInfo = {
    id: string;
    type: string;
    name: string;
    parentId: string | null;
    childIds: string[];
    x: number; y: number; w: number; h: number;
    characters?: string;   // TEXT nodes only, 60-char cap
    textStyle?: string;    // TEXT nodes only, bound style name if any
};

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
    | 'typo-role-misfit'      // NEW: axis=role LLM FAIL
    | 'typo-viewport-misfit'; // NEW: axis=viewport LLM FAIL
```

### 4.2 `src/ui/lib/loaders/typography.ts`

```ts
export type TextStyleMeta = {
    rank: number;
    when: string[];
    avoid: string[];
    description: string | null;
    fontSize: number | null;   // NEW: resolved primitive
};
```

Primitive resolution: `text-style.json` `$value.fontSize` holds an alias like `{typography.fontSize.1000}`. Load `common/tokens/typography.json` into a `Record<string, number>` (`fontSize` map) and resolve at schema load time. Missing key → `fontSize: null`.

### 4.3 `src/ui/features/llm/parse.ts`

```ts
export type LlmTypoJudgment = {
    nodeId: string;
    name: string;
    token: string;
    verdict: 'PASS' | 'FAIL';
    confidence: Confidence;
    axis: 'hierarchy' | 'role' | 'viewport';   // NEW
    matchedRule: string;                        // NEW: cite when/avoid line
    reasoning: string;
    suggested: string[];
};
```

`isTypoJudgment` guard extended: `axis` in the 3-value union, `matchedRule` is `string` (empty allowed).

### 4.4 `src/ui/lib/rubric.ts`

`buildLlmInput` change — `textStyleRubric` iterates `textStyleSchema.order` instead of `usedTextStyles`:

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

`TextStyleMetaSubset` unchanged — the schema-side `fontSize` addition is not surfaced to the LLM (it already sees rank; fontSize is deterministic-only).

## 5. Sandbox Changes (`src/plugin/handlers/extract.ts`)

`walkTree` becomes async and enriches TEXT nodes:

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
            id: node.id, type: node.type, name: node.name, parentId,
            childIds: children.map((c) => c.id),
            x: 'x' in node ? node.x : 0,
            y: 'y' in node ? node.y : 0,
            w: 'width' in node ? node.width : 0,
            h: 'height' in node ? node.height : 0,
        };

        if (node.type === 'TEXT') {
            info.characters = (node.characters || '').slice(0, 60);
            try {
                const { textStyle } = await classifyTextNode(node);
                if (textStyle) info.textStyle = textStyle;
            } catch { /* skip textStyle on failure */ }
        }

        out.push(info);
        for (const c of children) stack.push({ node: c, parentId: node.id });
    }
    return out;
}
```

`extractFrame` await the tree walk:

```ts
const [screenshotB64, nodeTree] = await Promise.all([
    captureScreenshot(frame).catch(() => ''),
    walkTree(frame).catch(() => []),
]);
```

Duplicate `classifyTextNode` call (already invoked during typography extraction) is accepted for MVP — a `Map<nodeId, textStyle>` optimization comes later if profiling flags it.

## 6. Deterministic Recommendation (`src/ui/lib/evaluate/typography.ts`)

`evaluateTypography` fills `suggested` directly:

```ts
function suggestByFontSize(
    fontSize: number | null,
    schema: TextStyleSchema,
): string[] {
    if (fontSize == null) return [];
    return schema.order.filter((name) => schema.styles[name].fontSize === fontSize);
}

// inside the loop:
if (u.appliedStatus === 'raw') {
    violations.push({
        ...base,
        type: 'typo-raw',
        severity: 'high',
        message: `Text Style이 바인딩되지 않은 raw 텍스트입니다 ("${u.characters}").`,
        suggested: suggestByFontSize(u.resolved.fontSize, schema),
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
```

`unknown-token` case unchanged (`suggested: []`) — deterministic recovery for unknown names is out of scope.

### 6.1 `recommend.ts` — typography cases become pass-through

```ts
case 'typo-raw':
case 'typo-styled-override':
    // suggested filled by evaluateTypography — do not overwrite
    return violation;

case 'unknown-token':
    if (property === 'textStyle') return violation;    // typography path — pass-through
    // else: color-side path, no known-hex recovery yet
    suggested = [];
    break;
```

LLM-origin violation types (`typo-hierarchy`, `typo-role-misfit`, `typo-viewport-misfit`, `semantic-misfit`) never reach the switch — the `origin === 'llm'` early return at the top of `applyRecommendations` short-circuits them. No case entries needed for those.

## 7. Prompt (`src/ui/features/llm/prompt.ts`)

`SEMANTIC_GUIDE` (replaces current text):

```
의미 판정 가이드:

색상 판정 축: semantic color의 when/avoid vs 실제 자리 의미.
- avoid의 "조건 → colors.X.Y"는 우변이 그대로 remedy.

typography 판정 축 (각 대상에 정확히 하나 라벨):
- hierarchy: 시각 위계 뒤집힘 / 본문에 heading 오용 / heading에 body 오용.
  근거는 rank(작을수록 큰 제목)와 이웃 TEXT 노드의 rank 비교 + 스크린샷 시각 크기.
- role: when/avoid의 역할·문맥 규칙 위배 (예: subtitle 자리에 body, code 자리에 body).
- viewport: when/avoid의 뷰포트 규칙 위배. context.viewport ∈ {pc, tablet, mobile}.
  mobile에서 display*는 즉시 viewport FAIL.

입력 3종 활용:
1. rubric.textStyle — 전체 16종의 rank/when/avoid/description. 대체 후보는 이 안에서만 선택.
2. nodeTree — 각 TEXT 노드에 characters/textStyle 포함. 형제·부모 그룹에서 이웃 rank 비교로 위계 판정.
3. 첨부 이미지 — 시각 크기·강조·위치. 구조로 안 잡히는 위계는 이미지에서.

각 typography 판정에 필수:
- axis: "hierarchy" | "role" | "viewport"
- matchedRule: 위반한 when/avoid 문장 원문. PASS면 부합한 when 문장. 스키마에 없는 규칙 발명 금지.
- suggested: FAIL일 때만 채움. rubric.textStyle 키만 허용.

점수화(0-100) 금지. PASS/FAIL + confidence만.
```

`SYSTEM_BASE`의 `LlmTypoJudgment` 스키마 문자열에 `axis`, `matchedRule` 추가.

Rubric은 user content JSON에 그대로 둔다 (cache_control로 이동하지 않음).

## 8. Merge (`src/ui/features/llm/merge.ts`)

```ts
const AXIS_TO_TYPE: Record<LlmTypoJudgment['axis'], ViolationType> = {
    hierarchy: 'typo-hierarchy',
    role: 'typo-role-misfit',
    viewport: 'typo-viewport-misfit',
};

function heuristicTypo(j: LlmTypoJudgment, schema: TextStyleSchema): Violation {
    const known = new Set(schema.order);
    const filtered = j.suggested.filter((s) => known.has(s));
    const msg = j.matchedRule ? `[${j.matchedRule}] ${j.reasoning}` : j.reasoning;
    return {
        nodeId: j.nodeId,
        name: j.name,
        property: 'textStyle',
        token: j.token,
        value: null,
        type: AXIS_TO_TYPE[j.axis],
        severity: 'high',
        origin: 'llm',
        message: msg,
        suggested: filtered,
        confidence: j.confidence,
    };
}
```

`mergeScanPayload` gets `textStyleSchema` in `MergeArgs` to pass into `heuristicTypo`. `runLlmEvaluation` already loads it.

## 9. `runLlmEvaluation` Wiring

Only threading changes:

```ts
const textStyleSchema = loadTextStyleSchema();   // now returns fontSize per style
// ...
const mergeArgs: MergeArgs = {
    deterministic: det,
    llm: judgments,
    schemaMode: extract.schemaMode,
    textStyleSchema,   // NEW
};
return mergeScanPayload(mergeArgs);
```

## 10. Error Handling

| Failure | Behavior |
|---|---|
| `text-style.json` alias unresolved | `fontSize = null`, raw suggestion returns `[]`. Judgment unaffected. |
| LLM returns `axis` outside 3-value union | `LlmParseError` thrown from `parseLlmResponse`. Merged as evaluator error → toast. |
| LLM returns empty `matchedRule` | Accepted. Message falls back to `reasoning` only. |
| LLM `suggested` contains names not in schema | Filtered out in `heuristicTypo`. |
| `walkTree` `classifyTextNode` throws for a node | Skip textStyle field, keep the node with characters only. |
| Existing `typo-raw` `resolved.fontSize` is `null` | `suggestByFontSize` returns `[]`. Violation still surfaces, no suggestion. |

## 11. Testing

- `loaders/typography.test.ts` — extend with fontSize resolve: valid alias → number, missing alias → null.
- `evaluate/typography.test.ts` — extend:
    - `styled-override` → `suggested = [u.textStyle]`.
    - `typo-raw` with resolved.fontSize matching one style → `[<matched>]`.
    - `typo-raw` with fontSize matching multiple styles → all matches.
    - `typo-raw` with fontSize null → `[]`.
    - `unknown-token` for typography → `[]`.
- `plugin/handlers/extract.test.ts` — extend:
    - `walkTree` TEXT node has `characters` (60-char cap) and `textStyle` when bound.
    - Non-TEXT nodes have neither field.
    - `classifyTextNode` throwing → node kept, no `textStyle`.
- `lib/rubric.test.ts` — extend: `textStyleRubric` contains every entry in `textStyleSchema.order`, not just used tokens.
- `features/llm/parse.test.ts` (new or extend existing) —
    - Judgment missing `axis` → LlmParseError.
    - Judgment with `axis: 'unknown'` → LlmParseError.
    - Judgment with empty `matchedRule` string → parses OK.
- `features/llm/merge.test.ts` — extend:
    - `axis: hierarchy` → `type: 'typo-hierarchy'`.
    - `axis: role` → `type: 'typo-role-misfit'`.
    - `axis: viewport` → `type: 'typo-viewport-misfit'`.
    - `suggested` containing name outside schema → filtered out.
    - `matchedRule` non-empty → message prepended `[rule]`.
- `lib/recommend.test.ts` — extend: typography deterministic violations arrive with `suggested` filled → `applyRecommendations` preserves it (no overwrite to `[]`).

## 12. Rollout & Compatibility

- No `manifest.json` changes.
- Existing fixture `apps/figma-token-review-plugin/fixtures/typography.json` still valid (no new violations expected on that frame).
- `LlmContext` payload size increases moderately (characters/textStyle per TEXT node). Frames with hundreds of TEXT nodes may add ~10–20 KB; still well under postMessage limits.
- Rubric grows from used-only (typically 2–5 styles) to full 16 styles. LlmInput JSON ~+2 KB, prompt token increase manageable at `max_tokens: 4096`.
- Vision model requirement unchanged (still `claude-sonnet-4-6` default).

## 13. Files Touched (estimated 10)

1. `src/common/schemas.ts` — NodeInfo optional fields, ViolationType additions.
2. `src/common/tokens/text-style.json` — unchanged (source of truth).
3. `src/ui/lib/loaders/typography.ts` — fontSize primitive resolver.
4. `src/ui/lib/evaluate/typography.ts` — deterministic `suggested` fill.
5. `src/ui/lib/rubric.ts` — full-schema textStyleRubric.
6. `src/plugin/handlers/extract.ts` — `walkTree` TEXT enrichment.
7. `src/ui/features/llm/prompt.ts` — SEMANTIC_GUIDE + SYSTEM_BASE schema block.
8. `src/ui/features/llm/parse.ts` — axis / matchedRule schema guard.
9. `src/ui/features/llm/merge.ts` — axis → ViolationType, matchedRule prepend, suggested filter.
10. `src/ui/lib/recommend.ts` — typography pass-through.

Test file counterparts touched alongside each unit.

## 14. Success Criteria

- Selecting a frame with mixed textStyles produces at least one LLM typography judgment per conformant target, each carrying `axis` and `matchedRule`.
- Frames with raw text or overridden styles show `suggested` chips in the UI (styled-override → original token; raw → fontSize match if any).
- Existing deterministic tests pass unchanged; new tests cover the axis mapping and suggested filtering paths.
- LLM prompt cache hit rate on `SYSTEM_BASE + SEMANTIC_GUIDE` remains healthy (no change to cache_control placement).
- Manual QA on 3–5 representative frames confirms judgments cite an actual `when`/`avoid` line via `matchedRule` (no hallucinated rules).
