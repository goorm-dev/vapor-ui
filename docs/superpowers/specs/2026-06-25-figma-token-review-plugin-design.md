# Figma Token Review Plugin — Design Spec

- Date: 2026-06-25
- Author: noah.choi
- Status: Draft (awaiting implementation)

## 1. Goal

Build a Figma plugin that:

1. Lets a user select a single frame and click **검사 시작** to run a design-token review.
2. Displays returned violations (offending token, reason, recommended replacements) in the plugin body.
3. On violation click, focuses the offending node(s) in the current Figma frame.

AI/LLM calls are stubbed for this milestone. The plugin loads fixture JSON produced by the `/figma-token-review` skill against a real frame. The LiteLLM integration is a single replaceable function (`callEvaluator`) — fixture today, network call later.

## 2. Non-Goals

- Real LiteLLM integration (separate milestone).
- Multi-frame batch scanning.
- Auto-fix or write-back of suggested tokens.
- Automated tests in CI (Figma host environment dependency).
- Component/guideline gap analysis (covered by separate `design-gap` skill).

## 3. Location & Stack

- New monorepo app: `apps/figma-token-review-plugin/`
- React + Vite + `@vapor-ui/core` (UI iframe)
- TypeScript, ESLint, Prettier — match repo defaults
- Build: `vite.config.ui.ts` for iframe bundle, `vite.config.plugin.ts` for `code.ts` main thread (same pattern as `apps/figma-plugin`)
- Manifest names plugin "Vapor Token Review"

## 4. Message Protocol

```ts
// code.ts → UI
type CodeMsg =
  | {
      type: 'selection';
      state:
        | { kind: 'frame'; id: string; name: string }
        | { kind: 'none' }
        | { kind: 'multi' }
        | { kind: 'invalid'; nodeType: string };
    }
  | { type: 'scan-result'; payload: { color: EvaluateOutput; typography: EvaluateOutput } }
  | { type: 'scan-error'; message: string }
  | { type: 'focus-result'; resolved: number; missing: number };

// UI → code.ts
type UiMsg =
  | { type: 'request-selection' }
  | { type: 'scan'; frameId: string }
  | { type: 'focus'; nodeIds: string[] };
```

`EvaluateOutput` mirrors `skills/figma-token-review/scripts/evaluate.mjs` return shape: `{ violations, conformant, summary, rubric }`. The single typedef lives in `src/shared/schema.ts`.

## 5. code.ts Responsibilities

- Register `figma.on('selectionchange', emitSelection)` and emit once on plugin open.
- `scan`: validate that `frameId` resolves to a `FRAME` node, `setTimeout` 1500 ms (simulated LiteLLM latency), then return fixture data via `callEvaluator(frameId)` which currently:
  - Imports `fixtures/color.json` and `fixtures/typography.json` (real `/figma-token-review` output for the test frame).
  - Returns `{ color, typography }`.
- `focus`: resolve `nodeIds` via `figma.getNodeById`, drop nulls, then:
  - If at least one resolved: `figma.currentPage.selection = nodes; figma.viewport.scrollAndZoomIntoView(nodes);` and emit a UI message with the count of missing IDs.
  - If all null: emit `scan-error` with a "no matching nodes in current frame" message (likely wrong file open).
- If `scan` selection mismatches mid-run, drop the result (track a `scanToken` counter).

## 6. UI Components

```
App
├ SelectionBanner       — selection state text + 검사 시작 button (enable iff kind === 'frame')
├ Tabs (Color | Typography) with violation count badges
│  └ TabPanel
│     ├ Summary line (from EvaluateOutput.summary)
│     └ ViolationList
│        └ ViolationItem (accordion)
│           ├ Closed: severity badge, type tag, layer name, one-line detail, count
│           └ Open: suggested-token chips + per-node list (each row = one nodeId, click to focus)
├ ScanProgress          — visible during the 1.5 s simulated call
├ EmptyState            — violations.length === 0 + summary
└ ErrorState            — scan-error
```

## 7. Data Rules

- Color → "색상" tab. Typography → "타이포" tab.
- Sort within each tab: `severity: high` first, then `count` descending.
- `count` defaults to `nodeIds.length` when omitted.
- Tab header badge = `violations.length`.

## 8. Edge Cases

| Situation | Handling |
|---|---|
| Selection 0 / multi / non-FRAME | Button disabled, banner copy explains "프레임 1개 선택 필요" |
| Selection changes mid-scan | Drop stale result via `scanToken` counter |
| `figma.getNodeById` all null | Error toast: "이 프레임에 해당 노드 없음" |
| Some null | Focus available IDs, toast "n개 노드 누락" |
| `violations === []` | EmptyState with summary text |
| `code.ts` throws | `scan-error` banner in UI |

## 9. File Tree

```
apps/figma-token-review-plugin/
├ manifest.json
├ package.json
├ vite.config.plugin.ts
├ vite.config.ui.ts
├ tsconfig.json
├ tsconfig.app.json
├ tsconfig.node.json
├ eslint.config.mjs
├ index.html
├ fixtures/
│  ├ color.json          # /figma-token-review output for the test frame
│  └ typography.json
└ src/
   ├ plugin/
   │  ├ code.ts
   │  └ callEvaluator.ts # fixture loader (LiteLLM swap point)
   ├ ui/
   │  ├ main.tsx
   │  ├ App.tsx
   │  ├ messaging.ts
   │  └ components/
   │     ├ SelectionBanner.tsx
   │     ├ TabHeader.tsx
   │     ├ ViolationList.tsx
   │     ├ ViolationItem.tsx
   │     └ states/{Empty,Error,Loading}.tsx
   └ shared/
      └ schema.ts        # EvaluateOutput, CodeMsg, UiMsg
```

## 10. Fixture Generation

Reference frame: `https://www.figma.com/design/LJR08hnOB6ik7KXnKkQL4T/Untitled?node-id=1-1634`

Implementation step 1 runs `/figma-token-review` on this frame and writes the raw outputs (one for color, one for typography) to `apps/figma-token-review-plugin/fixtures/`. NodeIds in the fixtures are real and resolve when the same Figma file is open.

## 11. LiteLLM Swap Point

`src/plugin/callEvaluator.ts` exposes:

```ts
export async function callEvaluator(
  frameId: string,
): Promise<{ color: EvaluateOutput; typography: EvaluateOutput }>;
```

Current implementation: 1500 ms `setTimeout`, then return the imported fixtures. Future implementation: HTTP call to internal LiteLLM endpoint with the extracted node payload. Caller signature does not change.

## 12. Manual QA Checklist (in lieu of automated tests)

1. Open the reference Figma file. Select 0 frames → button disabled, banner reads "프레임 1개 선택 필요".
2. Select 2 frames → banner says "1개만 선택".
3. Select 1 frame → button enabled. Click → loading state for ~1.5 s → tabs render with counts.
4. Click a color violation → accordion opens, suggested-token chips visible, per-node list shows.
5. Click an individual nodeId row → canvas scrolls/zooms to that node and selects it.
6. Switch to the typography tab → list re-renders, counts correct.
7. Open a different (unrelated) Figma file, click a violation → "이 프레임에 해당 노드 없음" toast.

Verification: `pnpm -C apps/figma-token-review-plugin lint && pnpm -C apps/figma-token-review-plugin typecheck && pnpm -C apps/figma-token-review-plugin build` all pass.

## 13. Out of Scope (explicitly)

- Persisting scan history across sessions.
- Settings UI for LiteLLM endpoint or API key.
- i18n — Korean copy hard-coded.
- Telemetry/analytics.
