# Figma Token Review Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Figma plugin that lets a designer select a single frame, click "검사 시작", see a list of design-token violations (offending token + reason + suggested replacements) split into color and typography tabs, and click any violation row to focus the offending node on the canvas. The AI evaluator is stubbed by fixtures generated from the real `/figma-token-review` skill output for a reference frame.

**Architecture:** New monorepo app `apps/figma-token-review-plugin` modeled on `apps/figma-plugin` (React + Vite + `@vapor-ui/core` + Tailwind, separate Vite configs for the UI iframe and the `code.ts` main thread). `code.ts` owns selection tracking, the evaluator call (currently fixture import with a 1.5 s delay), and node focusing; the UI iframe owns the selection banner, tabs, accordion violation list, and per-node focus rows. UI and `code.ts` communicate via a typed `postMessage` protocol defined once in `src/shared/schema.ts`. LiteLLM is a future swap inside the single `callEvaluator(frameId)` function — signature is fixed today so the swap is a one-file edit.

**Tech Stack:**
- React 19, TypeScript, Vite, `vite-plugin-singlefile`, `@vitejs/plugin-react`, Tailwind v4
- `@vapor-ui/core` (UI components, design tokens)
- `@figma/plugin-typings`
- Repo configs: `@repo/eslint-config`, `@repo/typescript-config`
- Build: `pnpm -C apps/figma-token-review-plugin build`, dev: `pnpm -C apps/figma-token-review-plugin dev`

## Global Constraints

- Plugin manifest name: **"Vapor Token Review"**.
- All UI copy in Korean (spec §13 — no i18n).
- Plugin window: 450 × 600 (match `apps/figma-plugin` `figma.ui.resize`).
- `manifest.json` `networkAccess.allowedDomains` MUST stay `["none"]` for this milestone (no real network call yet).
- `manifest.json` `documentAccess` MUST be `"dynamic-page"` to allow `figma.getNodeById` across frames.
- Exactly ONE frame selection required to enable the scan button — block 0, multi, or non-FRAME selections (spec §8 table).
- Simulated evaluator latency: **1500 ms** (`setTimeout` in `callEvaluator`).
- Message types: only the four `CodeMsg` / three `UiMsg` variants defined in `src/shared/schema.ts`. No ad-hoc string types.
- Use `~/` path alias for `src/` (matches existing plugin pattern).
- No automated tests (Figma host dependency). Each task ends with `lint` + `typecheck` + a manual Figma-host verification step. The reference Figma file MUST be open during manual verification from Task 5 onward: <https://www.figma.com/design/LJR08hnOB6ik7KXnKkQL4T/Untitled?node-id=1-1634>.
- Commit per task. Conventional Commits style (`feat:`, `chore:`, `fix:`, `docs:`).
- No `any`. Prefer discriminated unions over optional fields for state.

---

## File Structure

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
│  ├ color.json
│  └ typography.json
└ src/
   ├ vite-env.d.ts
   ├ plugin/
   │  ├ code.ts
   │  └ callEvaluator.ts
   ├ ui/
   │  ├ main.tsx
   │  ├ App.tsx
   │  ├ index.css
   │  ├ messaging.ts
   │  └ components/
   │     ├ SelectionBanner.tsx
   │     ├ TabHeader.tsx
   │     ├ ViolationList.tsx
   │     ├ ViolationItem.tsx
   │     ├ NodeRow.tsx
   │     └ states/
   │        ├ EmptyState.tsx
   │        ├ ErrorState.tsx
   │        └ LoadingState.tsx
   └ shared/
      └ schema.ts
```

---

## Task 1: Scaffold the app

**Files:**
- Create: `apps/figma-token-review-plugin/manifest.json`
- Create: `apps/figma-token-review-plugin/package.json`
- Create: `apps/figma-token-review-plugin/vite.config.plugin.ts`
- Create: `apps/figma-token-review-plugin/vite.config.ui.ts`
- Create: `apps/figma-token-review-plugin/tsconfig.json`
- Create: `apps/figma-token-review-plugin/tsconfig.app.json`
- Create: `apps/figma-token-review-plugin/tsconfig.node.json`
- Create: `apps/figma-token-review-plugin/eslint.config.mjs`
- Create: `apps/figma-token-review-plugin/index.html`
- Create: `apps/figma-token-review-plugin/src/vite-env.d.ts`
- Create: `apps/figma-token-review-plugin/src/ui/main.tsx`
- Create: `apps/figma-token-review-plugin/src/ui/App.tsx`
- Create: `apps/figma-token-review-plugin/src/ui/index.css`
- Create: `apps/figma-token-review-plugin/src/plugin/code.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a buildable plugin shell. `pnpm -C apps/figma-token-review-plugin build` outputs `dist/code.js`, `dist/index.html` (inlined), `dist/manifest.json`. UI iframe renders an empty page with a placeholder string.

- [ ] **Step 1: Create `manifest.json`**

```json
{
    "name": "Vapor Token Review",
    "id": "1542812611331843954",
    "api": "1.0.0",
    "main": "code.js",
    "ui": "index.html",
    "capabilities": [],
    "enableProposedApi": false,
    "documentAccess": "dynamic-page",
    "editorType": ["figma"],
    "networkAccess": {
        "allowedDomains": ["none"]
    }
}
```

- [ ] **Step 2: Create `package.json`**

```json
{
    "name": "figma-token-review-plugin",
    "version": "0.0.0",
    "private": true,
    "type": "module",
    "scripts": {
        "build": "rimraf dist && tsc -b && vite build --config vite.config.ui.ts && vite build --config vite.config.plugin.ts && cp manifest.json dist/",
        "build:plugin": "vite build --config vite.config.plugin.ts",
        "build:ui": "vite build --config vite.config.ui.ts",
        "clean": "rimraf dist node_modules .turbo",
        "dev": "vite build --watch --config vite.config.ui.ts & vite build --watch --config vite.config.plugin.ts",
        "predev:figma": "mkdir -p dist && cp manifest.json dist/",
        "lint": "eslint ./src",
        "typecheck": "tsc -b --noEmit"
    },
    "dependencies": {
        "@vapor-ui/core": "workspace:*",
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
    },
    "devDependencies": {
        "@figma/plugin-typings": "^1.125.0",
        "@repo/eslint-config": "workspace:*",
        "@repo/typescript-config": "workspace:*",
        "@tailwindcss/vite": "^4.0.0",
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "@vitejs/plugin-react": "^4.3.0",
        "eslint": "catalog:",
        "rimraf": "^6.0.0",
        "tailwindcss": "^4.0.0",
        "typescript": "catalog:",
        "vite": "^6.0.0",
        "vite-plugin-singlefile": "^2.0.0"
    }
}
```

- [ ] **Step 3: Create the three tsconfig files**

`tsconfig.json`:
```json
{
    "files": [],
    "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

`tsconfig.app.json`:
```json
{
    "extends": "@repo/typescript-config/react-app",
    "compilerOptions": {
        "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
        "target": "ES2022",
        "useDefineForClassFields": true,
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "typeRoots": ["./node_modules/@types", "./node_modules/@figma"],
        "baseUrl": ".",
        "paths": {
            "~/*": ["src/*"]
        },
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "verbatimModuleSyntax": true,
        "moduleDetection": "force",
        "jsx": "react-jsx",
        "resolveJsonModule": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "erasableSyntaxOnly": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedSideEffectImports": true
    },
    "include": ["src"]
}
```

`tsconfig.node.json`:
```json
{
    "extends": "@repo/typescript-config/base",
    "compilerOptions": {
        "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
        "target": "ES2023",
        "lib": ["ES2023"],
        "allowImportingTsExtensions": true,
        "verbatimModuleSyntax": true,
        "moduleDetection": "force",
        "noEmit": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "erasableSyntaxOnly": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedSideEffectImports": true
    },
    "include": ["vite.config.ui.ts", "vite.config.plugin.ts"]
}
```

- [ ] **Step 4: Create `vite.config.plugin.ts`**

```ts
import path from 'node:path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
    plugins: [viteSingleFile()],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        minify: mode === 'production',
        sourcemap: mode !== 'production' ? 'inline' : false,
        target: 'es2017',
        emptyOutDir: false,
        outDir: path.resolve('dist'),
        rollupOptions: {
            input: path.resolve('src/plugin/code.ts'),
            output: {
                entryFileNames: 'code.js',
            },
        },
    },
}));
```

- [ ] **Step 5: Create `vite.config.ui.ts`**

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss(), ...(mode === 'production' ? [viteSingleFile()] : [])],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        minify: mode === 'production',
        cssMinify: mode === 'production',
        sourcemap: mode !== 'production' ? 'inline' : false,
        emptyOutDir: false,
        outDir: path.resolve('dist'),
        rollupOptions: {
            input: path.resolve('index.html'),
        },
    },
}));
```

- [ ] **Step 6: Create `eslint.config.mjs`**

```js
// @ts-check
import { configs as reactPackage } from '@repo/eslint-config/react-package';

export default [
    ...reactPackage,
    {
        ignores: ['dist/**/*'],
    },
];
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vapor Token Review</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/ui/main.tsx"></script>
    </body>
</html>
```

- [ ] **Step 8: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 9: Create `src/ui/index.css`**

```css
@layer tw-theme, vapor, tw-utilities;

@import '@vapor-ui/core/tailwind.css';

@import 'tailwindcss/theme.css' layer(tw-theme);
@import 'tailwindcss/utilities.css' layer(tw-utilities);
```

- [ ] **Step 10: Create `src/ui/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
```

- [ ] **Step 11: Create `src/ui/App.tsx`** (placeholder)

```tsx
import { Box, Text } from '@vapor-ui/core';

const App = () => {
    return (
        <Box className="bg-white p-v-200">
            <Text typography="body1">Vapor Token Review (scaffold)</Text>
        </Box>
    );
};

export default App;
```

- [ ] **Step 12: Create `src/plugin/code.ts`** (placeholder)

```ts
figma.showUI(__html__, { width: 450, height: 600 });
```

- [ ] **Step 13: Install + build**

Run from repo root:
```bash
pnpm install
pnpm -C apps/figma-token-review-plugin lint
pnpm -C apps/figma-token-review-plugin typecheck
pnpm -C apps/figma-token-review-plugin build
ls apps/figma-token-review-plugin/dist
```
Expected: `code.js`, `index.html`, `manifest.json` present in `dist/`. Lint + typecheck pass.

- [ ] **Step 14: Manual Figma load**

In the Figma desktop app: Plugins → Development → Import plugin from manifest → pick `apps/figma-token-review-plugin/dist/manifest.json`. Run the plugin → window opens, shows "Vapor Token Review (scaffold)". Close.

- [ ] **Step 15: Commit**

```bash
git add apps/figma-token-review-plugin
git commit -m "chore(figma-token-review-plugin): scaffold app"
```

---

## Task 2: Shared schema + message types

**Files:**
- Create: `apps/figma-token-review-plugin/src/shared/schema.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: the canonical message types and `EvaluateOutput` shape used by every later task. Exports:
  - `type Severity = 'high' | 'info';`
  - `type ViolationType = 'token-not-used' | 'unknown-token' | 'do-not-use' | 'role-mismatch' | 'fg-grade-mismatch' | 'fg-grade-ambiguous';`
  - `type Violation = { nodeId: string; nodeIds?: string[]; count?: number; name: string; token: string | null; type: ViolationType; severity: Severity; detail: string; suggested: string[]; };`
  - `type Conformant = { nodeId: string; name: string; token: string };`
  - `type EvaluateOutput = { violations: Violation[]; conformant: Conformant[]; summary: { total: number; violationsCount: number; highSeverity: number; }; rubric: { version: string; source: string }; };`
  - `type ScanPayload = { color: EvaluateOutput; typography: EvaluateOutput };`
  - `type SelectionState = | { kind: 'frame'; id: string; name: string } | { kind: 'none' } | { kind: 'multi' } | { kind: 'invalid'; nodeType: string };`
  - `type CodeMsg = | { type: 'selection'; state: SelectionState } | { type: 'scan-result'; payload: ScanPayload } | { type: 'scan-error'; message: string } | { type: 'focus-result'; resolved: number; missing: number };`
  - `type UiMsg = | { type: 'request-selection' } | { type: 'scan'; frameId: string } | { type: 'focus'; nodeIds: string[] };`

- [ ] **Step 1: Create `src/shared/schema.ts`**

```ts
export type Severity = 'high' | 'info';

export type ViolationType =
    | 'token-not-used'
    | 'unknown-token'
    | 'do-not-use'
    | 'role-mismatch'
    | 'fg-grade-mismatch'
    | 'fg-grade-ambiguous';

export type Violation = {
    nodeId: string;
    nodeIds?: string[];
    count?: number;
    name: string;
    token: string | null;
    type: ViolationType;
    severity: Severity;
    detail: string;
    suggested: string[];
};

export type Conformant = {
    nodeId: string;
    name: string;
    token: string;
};

export type EvaluateOutput = {
    violations: Violation[];
    conformant: Conformant[];
    summary: {
        total: number;
        violationsCount: number;
        highSeverity: number;
    };
    rubric: {
        version: string;
        source: string;
    };
};

export type ScanPayload = {
    color: EvaluateOutput;
    typography: EvaluateOutput;
};

export type SelectionState =
    | { kind: 'frame'; id: string; name: string }
    | { kind: 'none' }
    | { kind: 'multi' }
    | { kind: 'invalid'; nodeType: string };

export type CodeMsg =
    | { type: 'selection'; state: SelectionState }
    | { type: 'scan-result'; payload: ScanPayload }
    | { type: 'scan-error'; message: string }
    | { type: 'focus-result'; resolved: number; missing: number };

export type UiMsg =
    | { type: 'request-selection' }
    | { type: 'scan'; frameId: string }
    | { type: 'focus'; nodeIds: string[] };
```

- [ ] **Step 2: Verify typecheck + lint**

```bash
pnpm -C apps/figma-token-review-plugin lint
pnpm -C apps/figma-token-review-plugin typecheck
```
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apps/figma-token-review-plugin/src/shared/schema.ts
git commit -m "feat(figma-token-review-plugin): add shared schema + message types"
```

---

## Task 3: code.ts selection emitter + UI receiver + SelectionBanner

**Files:**
- Modify: `apps/figma-token-review-plugin/src/plugin/code.ts` (full rewrite)
- Create: `apps/figma-token-review-plugin/src/ui/messaging.ts`
- Create: `apps/figma-token-review-plugin/src/ui/components/SelectionBanner.tsx`
- Modify: `apps/figma-token-review-plugin/src/ui/App.tsx` (full rewrite)

**Interfaces:**
- Consumes: `CodeMsg`, `UiMsg`, `SelectionState` from `~/shared/schema`.
- Produces:
  - `code.ts` emits `{ type: 'selection', state }` on plugin open and on every `selectionchange`.
  - `code.ts` handles `{ type: 'request-selection' }` by re-emitting current selection.
  - `messaging.ts` exports `postToCode(msg: UiMsg): void` and `subscribe(handler: (msg: CodeMsg) => void): () => void`.
  - `SelectionBanner` props: `{ state: SelectionState; onScan: (frameId: string) => void; }`.

- [ ] **Step 1: Rewrite `src/plugin/code.ts`**

```ts
import type { CodeMsg, SelectionState, UiMsg } from '~/shared/schema';

figma.showUI(__html__, { width: 450, height: 600 });

function computeSelection(): SelectionState {
    const sel = figma.currentPage.selection;
    if (sel.length === 0) return { kind: 'none' };
    if (sel.length > 1) return { kind: 'multi' };
    const node = sel[0];
    if (node.type !== 'FRAME') return { kind: 'invalid', nodeType: node.type };
    return { kind: 'frame', id: node.id, name: node.name };
}

function emitSelection(): void {
    const msg: CodeMsg = { type: 'selection', state: computeSelection() };
    figma.ui.postMessage(msg);
}

emitSelection();
figma.on('selectionchange', emitSelection);

figma.ui.onmessage = (msg: UiMsg) => {
    switch (msg.type) {
        case 'request-selection':
            emitSelection();
            return;
        case 'scan':
            // Task 5 will wire this to callEvaluator
            return;
        case 'focus':
            // Task 8 will implement this
            return;
    }
};
```

- [ ] **Step 2: Create `src/ui/messaging.ts`**

```ts
import type { CodeMsg, UiMsg } from '~/shared/schema';

export function postToCode(msg: UiMsg): void {
    parent.postMessage({ pluginMessage: msg }, '*');
}

export function subscribe(handler: (msg: CodeMsg) => void): () => void {
    const listener = (event: MessageEvent) => {
        const data = event.data?.pluginMessage as CodeMsg | undefined;
        if (!data || typeof data.type !== 'string') return;
        handler(data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
}
```

- [ ] **Step 3: Create `src/ui/components/SelectionBanner.tsx`**

```tsx
import { Box, Button, Text } from '@vapor-ui/core';

import type { SelectionState } from '~/shared/schema';

type Props = {
    state: SelectionState;
    onScan: (frameId: string) => void;
};

const COPY: Record<SelectionState['kind'], string> = {
    frame: '',
    none: '프레임 1개를 선택하세요.',
    multi: '프레임 1개만 선택하세요.',
    invalid: '프레임 노드만 검사할 수 있습니다.',
};

export function SelectionBanner({ state, onScan }: Props) {
    const enabled = state.kind === 'frame';
    const label =
        state.kind === 'frame'
            ? `선택: ${state.name}`
            : state.kind === 'invalid'
              ? `${COPY.invalid} (현재: ${state.nodeType})`
              : COPY[state.kind];

    return (
        <Box className="flex flex-col gap-v-100 border-b border-v-gray-200 bg-white p-v-200">
            <Text typography="body2">{label}</Text>
            <Button
                size="md"
                color="primary"
                disabled={!enabled}
                onClick={() => state.kind === 'frame' && onScan(state.id)}
            >
                검사 시작
            </Button>
        </Box>
    );
}
```

- [ ] **Step 4: Rewrite `src/ui/App.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Box } from '@vapor-ui/core';

import type { SelectionState } from '~/shared/schema';
import { postToCode, subscribe } from './messaging';
import { SelectionBanner } from './components/SelectionBanner';

const App = () => {
    const [selection, setSelection] = useState<SelectionState>({ kind: 'none' });

    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            if (msg.type === 'selection') setSelection(msg.state);
        });
        postToCode({ type: 'request-selection' });
        return unsubscribe;
    }, []);

    const handleScan = (frameId: string) => {
        postToCode({ type: 'scan', frameId });
    };

    return (
        <Box className="min-h-screen bg-v-gray-50">
            <SelectionBanner state={selection} onScan={handleScan} />
        </Box>
    );
};

export default App;
```

- [ ] **Step 5: Build + lint + typecheck**

```bash
pnpm -C apps/figma-token-review-plugin lint
pnpm -C apps/figma-token-review-plugin typecheck
pnpm -C apps/figma-token-review-plugin build
```
Expected: all pass.

- [ ] **Step 6: Manual Figma verify**

Reload the plugin (Plugins → Development → Vapor Token Review). Click in empty canvas → banner: "프레임 1개를 선택하세요." button disabled. Select a frame → banner: "선택: <frame name>", button enabled. Select two frames → "프레임 1개만 선택하세요.", disabled. Select a non-frame (e.g. text) → "프레임 노드만 검사할 수 있습니다. (현재: TEXT)".

- [ ] **Step 7: Commit**

```bash
git add apps/figma-token-review-plugin/src
git commit -m "feat(figma-token-review-plugin): wire selection state between code and UI"
```

---

## Task 4: `callEvaluator` stub with hardcoded `EvaluateOutput`

**Files:**
- Create: `apps/figma-token-review-plugin/src/plugin/callEvaluator.ts`
- Modify: `apps/figma-token-review-plugin/src/plugin/code.ts` (add scan branch)
- Modify: `apps/figma-token-review-plugin/src/ui/App.tsx` (handle scan-result, scan-error, loading state)
- Create: `apps/figma-token-review-plugin/src/ui/components/states/LoadingState.tsx`
- Create: `apps/figma-token-review-plugin/src/ui/components/states/ErrorState.tsx`

**Interfaces:**
- Consumes: `EvaluateOutput`, `ScanPayload`, `CodeMsg` from `~/shared/schema`.
- Produces:
  - `callEvaluator(frameId: string): Promise<ScanPayload>` — returns hardcoded empty payloads after a 1500 ms delay.
  - `code.ts` handles `{ type: 'scan' }` by validating the frame still exists, calling `callEvaluator`, then emitting `scan-result` or `scan-error`.
  - `App` shows `<LoadingState />` during scan and an `<ErrorState message={...} />` when one arrives. Stores last `ScanPayload` in state (`null` initially) and renders a temporary debug line: "violations: color=N typography=M".

- [ ] **Step 1: Create `src/plugin/callEvaluator.ts`**

```ts
import type { EvaluateOutput, ScanPayload } from '~/shared/schema';

const SIMULATED_LATENCY_MS = 1500;

const EMPTY: EvaluateOutput = {
    violations: [],
    conformant: [],
    summary: { total: 0, violationsCount: 0, highSeverity: 0 },
    rubric: { version: 'stub', source: 'callEvaluator stub' },
};

export async function callEvaluator(_frameId: string): Promise<ScanPayload> {
    await new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    return { color: EMPTY, typography: EMPTY };
}
```

- [ ] **Step 2: Update `src/plugin/code.ts` to handle scan**

Replace the `case 'scan':` body with:
```ts
        case 'scan': {
            const node = await figma.getNodeByIdAsync(msg.frameId);
            if (!node || node.type !== 'FRAME') {
                figma.ui.postMessage({
                    type: 'scan-error',
                    message: '선택한 프레임을 찾을 수 없습니다.',
                } satisfies CodeMsg);
                return;
            }
            try {
                const payload = await callEvaluator(msg.frameId);
                figma.ui.postMessage({ type: 'scan-result', payload } satisfies CodeMsg);
            } catch (err) {
                figma.ui.postMessage({
                    type: 'scan-error',
                    message: err instanceof Error ? err.message : '알 수 없는 오류',
                } satisfies CodeMsg);
            }
            return;
        }
```

Add at the top of `code.ts` (with the other imports):
```ts
import { callEvaluator } from './callEvaluator';
```

The `figma.ui.onmessage` handler must already be `async`. Update its signature:
```ts
figma.ui.onmessage = async (msg: UiMsg) => {
```

- [ ] **Step 3: Create `src/ui/components/states/LoadingState.tsx`**

```tsx
import { Box, Text } from '@vapor-ui/core';

export function LoadingState() {
    return (
        <Box className="flex flex-col items-center justify-center gap-v-100 p-v-400">
            <Text typography="body2">검사 중...</Text>
        </Box>
    );
}
```

- [ ] **Step 4: Create `src/ui/components/states/ErrorState.tsx`**

```tsx
import { Box, Text } from '@vapor-ui/core';

type Props = { message: string };

export function ErrorState({ message }: Props) {
    return (
        <Box className="m-v-200 rounded border border-v-red-300 bg-v-red-50 p-v-200">
            <Text typography="body2">오류: {message}</Text>
        </Box>
    );
}
```

- [ ] **Step 5: Update `src/ui/App.tsx`** (full rewrite)

```tsx
import { useEffect, useState } from 'react';
import { Box, Text } from '@vapor-ui/core';

import type { ScanPayload, SelectionState } from '~/shared/schema';
import { postToCode, subscribe } from './messaging';
import { SelectionBanner } from './components/SelectionBanner';
import { LoadingState } from './components/states/LoadingState';
import { ErrorState } from './components/states/ErrorState';

type ScanStatus =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'success'; payload: ScanPayload }
    | { kind: 'error'; message: string };

const App = () => {
    const [selection, setSelection] = useState<SelectionState>({ kind: 'none' });
    const [scan, setScan] = useState<ScanStatus>({ kind: 'idle' });

    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            switch (msg.type) {
                case 'selection':
                    setSelection(msg.state);
                    return;
                case 'scan-result':
                    setScan({ kind: 'success', payload: msg.payload });
                    return;
                case 'scan-error':
                    setScan({ kind: 'error', message: msg.message });
                    return;
                case 'focus-result':
                    return;
            }
        });
        postToCode({ type: 'request-selection' });
        return unsubscribe;
    }, []);

    const handleScan = (frameId: string) => {
        setScan({ kind: 'loading' });
        postToCode({ type: 'scan', frameId });
    };

    return (
        <Box className="min-h-screen bg-v-gray-50">
            <SelectionBanner state={selection} onScan={handleScan} />
            {scan.kind === 'loading' && <LoadingState />}
            {scan.kind === 'error' && <ErrorState message={scan.message} />}
            {scan.kind === 'success' && (
                <Box className="p-v-200">
                    <Text typography="body2">
                        violations: color={scan.payload.color.violations.length} typography=
                        {scan.payload.typography.violations.length}
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default App;
```

- [ ] **Step 6: Build + lint + typecheck**

```bash
pnpm -C apps/figma-token-review-plugin lint
pnpm -C apps/figma-token-review-plugin typecheck
pnpm -C apps/figma-token-review-plugin build
```
Expected: all pass.

- [ ] **Step 7: Manual Figma verify**

Reload plugin. Select a frame → "검사 시작" → "검사 중..." appears for ~1.5 s → "violations: color=0 typography=0".

- [ ] **Step 8: Commit**

```bash
git add apps/figma-token-review-plugin/src
git commit -m "feat(figma-token-review-plugin): add stub callEvaluator + scan plumbing"
```

---

## Task 5: Generate fixtures from `/figma-token-review` skill

**Files:**
- Create: `apps/figma-token-review-plugin/fixtures/color.json`
- Create: `apps/figma-token-review-plugin/fixtures/typography.json`
- Modify: `apps/figma-token-review-plugin/src/plugin/callEvaluator.ts` (swap empty payloads → fixture imports)

**Interfaces:**
- Consumes: `EvaluateOutput` shape from `~/shared/schema`.
- Produces: two JSON files with real `EvaluateOutput` data. NodeIds inside each violation MUST be real node IDs from the reference frame (`node-id=1:1634` of file `LJR08hnOB6ik7KXnKkQL4T`) — that is the load-bearing property of this task (focus must work in Task 8).

- [ ] **Step 1: Run the skill against the reference frame**

In a Claude Code session against this repo, invoke:
```
/figma-token-review https://www.figma.com/design/LJR08hnOB6ik7KXnKkQL4T/Untitled?node-id=1-1634
```

Follow the skill instructions:
- Extract the frame with `get_metadata` / `get_design_context`.
- Run `node skills/figma-token-review/scripts/evaluate.mjs <extracted-color-elements>` → color JSON.
- Run `node skills/figma-token-review/scripts/typography-evaluate.mjs <extracted-text-elements>` → typography JSON.

Save raw stdout of each script (the `{violations, conformant, summary, rubric}` object) verbatim.

- [ ] **Step 2: Write fixtures**

Save the color script's stdout to `apps/figma-token-review-plugin/fixtures/color.json`. Save typography's to `apps/figma-token-review-plugin/fixtures/typography.json`.

Required shape (validate before saving — fail the step if any field missing):
```json
{
    "violations": [
        {
            "nodeId": "1:1635",
            "nodeIds": ["1:1635", "1:1640"],
            "count": 2,
            "name": "Card / Title",
            "token": "color/primary/300",
            "type": "do-not-use",
            "severity": "high",
            "detail": "사유 설명",
            "suggested": ["color/primary/500", "color/primary/600"]
        }
    ],
    "conformant": [],
    "summary": { "total": 12, "violationsCount": 3, "highSeverity": 2 },
    "rubric": { "version": "v1", "source": "skills/figma-token-review" }
}
```

Required: every `nodeId` and every entry in `nodeIds` MUST appear in the reference frame's node tree. Sanity check at least 3 of them with `get_metadata` if unsure.

- [ ] **Step 3: Update `src/plugin/callEvaluator.ts` to import fixtures**

```ts
import type { ScanPayload } from '~/shared/schema';

import colorFixture from '../../fixtures/color.json';
import typographyFixture from '../../fixtures/typography.json';

const SIMULATED_LATENCY_MS = 1500;

export async function callEvaluator(_frameId: string): Promise<ScanPayload> {
    await new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    return {
        color: colorFixture as ScanPayload['color'],
        typography: typographyFixture as ScanPayload['typography'],
    };
}
```

The `resolveJsonModule: true` already set in Task 1's tsconfig.app.json makes the imports type-check.

- [ ] **Step 4: Build + lint + typecheck**

```bash
pnpm -C apps/figma-token-review-plugin lint
pnpm -C apps/figma-token-review-plugin typecheck
pnpm -C apps/figma-token-review-plugin build
```
Expected: all pass.

- [ ] **Step 5: Manual Figma verify**

Open the reference Figma file. Select frame `1:1634`. Run plugin → "검사 시작" → after 1.5 s the temporary debug line shows the fixture counts (non-zero).

- [ ] **Step 6: Commit**

```bash
git add apps/figma-token-review-plugin/fixtures apps/figma-token-review-plugin/src/plugin/callEvaluator.ts
git commit -m "feat(figma-token-review-plugin): wire real /figma-token-review fixtures into callEvaluator"
```

---

## Task 6: Tabs + ViolationList + ViolationItem accordion

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/components/TabHeader.tsx`
- Create: `apps/figma-token-review-plugin/src/ui/components/ViolationList.tsx`
- Create: `apps/figma-token-review-plugin/src/ui/components/ViolationItem.tsx`
- Create: `apps/figma-token-review-plugin/src/ui/components/NodeRow.tsx`
- Create: `apps/figma-token-review-plugin/src/ui/components/states/EmptyState.tsx`
- Modify: `apps/figma-token-review-plugin/src/ui/App.tsx` (replace debug line with the tab UI)

**Interfaces:**
- Consumes: `EvaluateOutput`, `Violation`, `Severity` from `~/shared/schema`; `postToCode` from `~/ui/messaging` (only the `focus` message is sent here — Task 8 implements the receiving side).
- Produces:
  - `TabHeader` props: `{ active: 'color' | 'typography'; colorCount: number; typographyCount: number; onChange: (tab: 'color' | 'typography') => void; }`.
  - `ViolationList` props: `{ violations: Violation[]; summary: EvaluateOutput['summary']; }`. Sorts inside the component (`severity === 'high'` first, then `(b.count ?? b.nodeIds?.length ?? 1) - (a.count ?? a.nodeIds?.length ?? 1)`).
  - `ViolationItem` props: `{ violation: Violation; }`. Internal `useState<boolean>` for accordion expand. Calls `postToCode({ type: 'focus', nodeIds })` from each NodeRow click.
  - `NodeRow` props: `{ nodeId: string; index: number; onClick: () => void; }`.
  - `EmptyState` props: `{ summary: EvaluateOutput['summary']; }`.

- [ ] **Step 1: Create `src/ui/components/TabHeader.tsx`**

```tsx
import { Box, Button, Text } from '@vapor-ui/core';

type Tab = 'color' | 'typography';

type Props = {
    active: Tab;
    colorCount: number;
    typographyCount: number;
    onChange: (tab: Tab) => void;
};

const LABEL: Record<Tab, string> = { color: '색상', typography: '타이포' };

export function TabHeader({ active, colorCount, typographyCount, onChange }: Props) {
    const counts: Record<Tab, number> = { color: colorCount, typography: typographyCount };
    return (
        <Box className="flex border-b border-v-gray-200 bg-white">
            {(['color', 'typography'] as Tab[]).map((tab) => (
                <Button
                    key={tab}
                    variant={active === tab ? 'fill' : 'ghost'}
                    color="primary"
                    size="md"
                    className="flex-1 rounded-none"
                    onClick={() => onChange(tab)}
                >
                    <Text typography="body2">
                        {LABEL[tab]} ({counts[tab]})
                    </Text>
                </Button>
            ))}
        </Box>
    );
}
```

- [ ] **Step 2: Create `src/ui/components/NodeRow.tsx`**

```tsx
import { Box, Button, Text } from '@vapor-ui/core';

type Props = {
    nodeId: string;
    index: number;
    onClick: () => void;
};

export function NodeRow({ nodeId, index, onClick }: Props) {
    return (
        <Box
            as="button"
            className="flex w-full items-center justify-between border-b border-v-gray-100 px-v-200 py-v-100 text-left hover:bg-v-gray-50"
            onClick={onClick}
        >
            <Text typography="body3">#{index + 1}</Text>
            <Text typography="caption" className="font-mono text-v-gray-500">
                {nodeId}
            </Text>
            <Button size="sm" variant="ghost" color="primary">
                포커스
            </Button>
        </Box>
    );
}
```

- [ ] **Step 3: Create `src/ui/components/ViolationItem.tsx`**

```tsx
import { useState } from 'react';
import { Box, Button, Text } from '@vapor-ui/core';

import type { Violation } from '~/shared/schema';
import { postToCode } from '~/ui/messaging';
import { NodeRow } from './NodeRow';

type Props = { violation: Violation };

const SEVERITY_LABEL = { high: '부적합', info: '안내' } as const;

export function ViolationItem({ violation }: Props) {
    const [open, setOpen] = useState(false);
    const nodes = violation.nodeIds && violation.nodeIds.length > 0 ? violation.nodeIds : [violation.nodeId];
    const count = violation.count ?? nodes.length;

    return (
        <Box className="border-b border-v-gray-200 bg-white">
            <Box
                as="button"
                className="flex w-full flex-col gap-v-050 p-v-200 text-left hover:bg-v-gray-50"
                onClick={() => setOpen((v) => !v)}
            >
                <Box className="flex items-center gap-v-100">
                    <Text typography="caption" className="rounded bg-v-red-100 px-v-050 text-v-red-700">
                        {SEVERITY_LABEL[violation.severity]}
                    </Text>
                    <Text typography="caption" className="text-v-gray-500">
                        {violation.type}
                    </Text>
                    <Text typography="caption" className="ml-auto text-v-gray-500">
                        {count}건
                    </Text>
                </Box>
                <Text typography="body2">
                    {violation.name}
                    {violation.token ? ` · ${violation.token}` : ''}
                </Text>
                <Text typography="body3" className="text-v-gray-600">
                    {violation.detail}
                </Text>
            </Box>
            {open && (
                <Box className="bg-v-gray-50 px-v-200 pb-v-200 pt-v-100">
                    {violation.suggested.length > 0 && (
                        <Box className="mb-v-100 flex flex-wrap gap-v-050">
                            <Text typography="caption" className="text-v-gray-600">추천:</Text>
                            {violation.suggested.map((s) => (
                                <Text
                                    key={s}
                                    typography="caption"
                                    className="rounded bg-white px-v-100 py-v-050 font-mono text-v-gray-700"
                                >
                                    {s}
                                </Text>
                            ))}
                        </Box>
                    )}
                    <Box className="overflow-hidden rounded border border-v-gray-200 bg-white">
                        <Button
                            size="sm"
                            variant="ghost"
                            color="primary"
                            className="w-full"
                            onClick={() => postToCode({ type: 'focus', nodeIds: nodes })}
                        >
                            모두 포커스 ({nodes.length})
                        </Button>
                        {nodes.map((id, i) => (
                            <NodeRow
                                key={id + i}
                                nodeId={id}
                                index={i}
                                onClick={() => postToCode({ type: 'focus', nodeIds: [id] })}
                            />
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
```

- [ ] **Step 4: Create `src/ui/components/ViolationList.tsx`**

```tsx
import { Box, Text } from '@vapor-ui/core';

import type { EvaluateOutput, Violation } from '~/shared/schema';
import { ViolationItem } from './ViolationItem';
import { EmptyState } from './states/EmptyState';

type Props = {
    violations: Violation[];
    summary: EvaluateOutput['summary'];
};

function weight(v: Violation): number {
    return v.count ?? v.nodeIds?.length ?? 1;
}

export function ViolationList({ violations, summary }: Props) {
    if (violations.length === 0) return <EmptyState summary={summary} />;

    const sorted = [...violations].sort((a, b) => {
        if (a.severity === b.severity) return weight(b) - weight(a);
        return a.severity === 'high' ? -1 : 1;
    });

    return (
        <Box>
            <Box className="px-v-200 py-v-100">
                <Text typography="caption" className="text-v-gray-600">
                    전체 {summary.total} · 부적합 {summary.violationsCount} · 중요 {summary.highSeverity}
                </Text>
            </Box>
            {sorted.map((v, i) => (
                <ViolationItem key={`${v.nodeId}-${i}`} violation={v} />
            ))}
        </Box>
    );
}
```

- [ ] **Step 5: Create `src/ui/components/states/EmptyState.tsx`**

```tsx
import { Box, Text } from '@vapor-ui/core';

import type { EvaluateOutput } from '~/shared/schema';

type Props = { summary: EvaluateOutput['summary'] };

export function EmptyState({ summary }: Props) {
    return (
        <Box className="flex flex-col items-center gap-v-100 p-v-400">
            <Text typography="body2">위반 없음.</Text>
            <Text typography="caption" className="text-v-gray-600">
                검사 노드 총 {summary.total}개
            </Text>
        </Box>
    );
}
```

- [ ] **Step 6: Update `src/ui/App.tsx`** (replace the debug `Text` block with TabHeader + ViolationList)

```tsx
import { useEffect, useState } from 'react';
import { Box } from '@vapor-ui/core';

import type { ScanPayload, SelectionState } from '~/shared/schema';
import { postToCode, subscribe } from './messaging';
import { SelectionBanner } from './components/SelectionBanner';
import { TabHeader } from './components/TabHeader';
import { ViolationList } from './components/ViolationList';
import { LoadingState } from './components/states/LoadingState';
import { ErrorState } from './components/states/ErrorState';

type ScanStatus =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'success'; payload: ScanPayload }
    | { kind: 'error'; message: string };

type Tab = 'color' | 'typography';

const App = () => {
    const [selection, setSelection] = useState<SelectionState>({ kind: 'none' });
    const [scan, setScan] = useState<ScanStatus>({ kind: 'idle' });
    const [tab, setTab] = useState<Tab>('color');

    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            switch (msg.type) {
                case 'selection':
                    setSelection(msg.state);
                    return;
                case 'scan-result':
                    setScan({ kind: 'success', payload: msg.payload });
                    return;
                case 'scan-error':
                    setScan({ kind: 'error', message: msg.message });
                    return;
                case 'focus-result':
                    return;
            }
        });
        postToCode({ type: 'request-selection' });
        return unsubscribe;
    }, []);

    const handleScan = (frameId: string) => {
        setScan({ kind: 'loading' });
        postToCode({ type: 'scan', frameId });
    };

    return (
        <Box className="min-h-screen bg-v-gray-50">
            <SelectionBanner state={selection} onScan={handleScan} />
            {scan.kind === 'loading' && <LoadingState />}
            {scan.kind === 'error' && <ErrorState message={scan.message} />}
            {scan.kind === 'success' && (
                <>
                    <TabHeader
                        active={tab}
                        colorCount={scan.payload.color.violations.length}
                        typographyCount={scan.payload.typography.violations.length}
                        onChange={setTab}
                    />
                    <ViolationList
                        violations={scan.payload[tab].violations}
                        summary={scan.payload[tab].summary}
                    />
                </>
            )}
        </Box>
    );
};

export default App;
```

- [ ] **Step 7: Build + lint + typecheck**

```bash
pnpm -C apps/figma-token-review-plugin lint
pnpm -C apps/figma-token-review-plugin typecheck
pnpm -C apps/figma-token-review-plugin build
```
Expected: all pass.

- [ ] **Step 8: Manual Figma verify**

Reload plugin on the reference frame. Click "검사 시작" → after 1.5 s the tab header shows `색상 (N)` / `타이포 (M)` with the fixture counts. Click each tab → list re-renders. Click any violation row → accordion expands, shows recommended chips + per-node list with "포커스" buttons. (Buttons are wired but not yet effective — Task 8.)

- [ ] **Step 9: Commit**

```bash
git add apps/figma-token-review-plugin/src
git commit -m "feat(figma-token-review-plugin): render tabs + violation accordion"
```

---

## Task 7: Mid-scan staleness guard

**Files:**
- Modify: `apps/figma-token-review-plugin/src/plugin/code.ts`

**Interfaces:**
- Consumes: existing `CodeMsg`, `UiMsg`.
- Produces: `code.ts` increments an internal `scanToken` counter on each `scan` request and on each `selectionchange`; when `callEvaluator` returns, the result is sent ONLY if the counter still matches the one captured at request time. Stale results are silently dropped.

- [ ] **Step 1: Patch `src/plugin/code.ts`**

Add `let scanToken = 0;` near the top.

Update `emitSelection` to invalidate in-flight scans:
```ts
function emitSelection(): void {
    scanToken += 1;
    const msg: CodeMsg = { type: 'selection', state: computeSelection() };
    figma.ui.postMessage(msg);
}
```

Update the `case 'scan':` body:
```ts
        case 'scan': {
            const node = await figma.getNodeByIdAsync(msg.frameId);
            if (!node || node.type !== 'FRAME') {
                figma.ui.postMessage({
                    type: 'scan-error',
                    message: '선택한 프레임을 찾을 수 없습니다.',
                } satisfies CodeMsg);
                return;
            }
            scanToken += 1;
            const myToken = scanToken;
            try {
                const payload = await callEvaluator(msg.frameId);
                if (myToken !== scanToken) return;
                figma.ui.postMessage({ type: 'scan-result', payload } satisfies CodeMsg);
            } catch (err) {
                if (myToken !== scanToken) return;
                figma.ui.postMessage({
                    type: 'scan-error',
                    message: err instanceof Error ? err.message : '알 수 없는 오류',
                } satisfies CodeMsg);
            }
            return;
        }
```

- [ ] **Step 2: Build + lint + typecheck**

```bash
pnpm -C apps/figma-token-review-plugin lint
pnpm -C apps/figma-token-review-plugin typecheck
pnpm -C apps/figma-token-review-plugin build
```
Expected: all pass.

- [ ] **Step 3: Manual Figma verify**

Reload plugin. Select reference frame → "검사 시작" → while "검사 중..." is showing (within 1.5 s), click a different node in the canvas. The loading indicator should NOT be replaced by a result — selection state changes but `scan-result` is dropped. The UI stays in `loading` state visually because we have no auto-reset; instead the next selection change will let the user start a new scan. (Acceptable for this milestone; future work could reset to `idle`.)

- [ ] **Step 4: Commit**

```bash
git add apps/figma-token-review-plugin/src/plugin/code.ts
git commit -m "fix(figma-token-review-plugin): drop stale scan results on selection change"
```

---

## Task 8: Focus action — receive `focus`, scroll, report missing nodes

**Files:**
- Modify: `apps/figma-token-review-plugin/src/plugin/code.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/App.tsx` (consume `focus-result`)

**Interfaces:**
- Consumes: `UiMsg.focus` from the UI; emits `CodeMsg.focus-result` and may emit `CodeMsg.scan-error`.
- Produces:
  - `code.ts` handles `{ type: 'focus', nodeIds }`: resolves each via `figma.getNodeByIdAsync`, filters truthy `SceneNode`-typed entries, then `figma.currentPage.selection = nodes; figma.viewport.scrollAndZoomIntoView(nodes)`. Always emits `{ type: 'focus-result', resolved, missing }`. If `resolved === 0`, also emits `{ type: 'scan-error', message: '이 프레임에 해당 노드 없음 — 파일이 다른가요?' }`.
  - `App.tsx` reads `focus-result`; if `missing > 0 && resolved > 0`, render a small toast strip above the violation list saying `n개 노드 누락` for ~3 seconds.

- [ ] **Step 1: Patch `src/plugin/code.ts`** — replace the `case 'focus':` body

```ts
        case 'focus': {
            const resolved: SceneNode[] = [];
            let missing = 0;
            for (const id of msg.nodeIds) {
                const n = await figma.getNodeByIdAsync(id);
                if (n && 'visible' in n && n.type !== 'DOCUMENT' && n.type !== 'PAGE') {
                    resolved.push(n as SceneNode);
                } else {
                    missing += 1;
                }
            }
            if (resolved.length === 0) {
                figma.ui.postMessage({
                    type: 'scan-error',
                    message: '이 프레임에 해당 노드 없음 — 파일이 다른가요?',
                } satisfies CodeMsg);
                figma.ui.postMessage({
                    type: 'focus-result',
                    resolved: 0,
                    missing,
                } satisfies CodeMsg);
                return;
            }
            figma.currentPage.selection = resolved;
            figma.viewport.scrollAndZoomIntoView(resolved);
            figma.ui.postMessage({
                type: 'focus-result',
                resolved: resolved.length,
                missing,
            } satisfies CodeMsg);
            return;
        }
```

- [ ] **Step 2: Patch `src/ui/App.tsx`** — add toast state

Add the new state slot near the existing `useState` calls:
```tsx
const [toast, setToast] = useState<string | null>(null);
```

Inside the `subscribe` switch, replace the `case 'focus-result':` branch:
```ts
                case 'focus-result':
                    if (msg.resolved > 0 && msg.missing > 0) {
                        setToast(`${msg.missing}개 노드 누락`);
                        setTimeout(() => setToast(null), 3000);
                    }
                    return;
```

Render the toast above the loading/error/success block:
```tsx
{toast && (
    <Box className="bg-v-yellow-50 px-v-200 py-v-100">
        <Text typography="caption" className="text-v-yellow-800">
            {toast}
        </Text>
    </Box>
)}
```

(Import `Text` in App.tsx if not already present.)

- [ ] **Step 3: Build + lint + typecheck**

```bash
pnpm -C apps/figma-token-review-plugin lint
pnpm -C apps/figma-token-review-plugin typecheck
pnpm -C apps/figma-token-review-plugin build
```
Expected: all pass.

- [ ] **Step 4: Manual Figma verify**

Open the reference Figma file. Run plugin → select frame `1:1634` → "검사 시작" → expand a violation that has multiple `nodeIds` → click "포커스" on a single row → canvas selects that node and scrolls to it. Click "모두 포커스 (n)" → all nodes selected and viewport zoomed to fit. Open an unrelated Figma file, leave a prior `scan-result` rendered (force by selecting a frame, scanning, then switching file with the plugin still open), click any focus button → red ErrorState shows: "이 프레임에 해당 노드 없음 — 파일이 다른가요?".

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src
git commit -m "feat(figma-token-review-plugin): focus offending nodes on canvas"
```

---

## Self-Review Notes

- **Spec coverage:** §1 stack → Task 1. §2 (none) → unchanged. §3 location → Task 1. §4 message protocol → Tasks 2–8 (one type per task that introduces it). §5 code.ts responsibilities → Tasks 3 (selection), 4 (scan), 7 (staleness), 8 (focus). §6 UI components → Tasks 3 (SelectionBanner), 4 (Loading/Error), 6 (Tabs/List/Item/NodeRow/Empty). §7 data rules (sort, tab counts) → Task 6. §8 edge cases — selection table → Task 3; selection change mid-scan → Task 7; getNodeById all null → Task 8; some null → Task 8; empty violations → Task 6 (EmptyState); code.ts throws → Task 4 (scan-error). §9 file tree → Tasks 1, 2, 3, 4, 6, 7, 8 cover all files. §10 fixtures → Task 5. §11 LiteLLM swap point — `callEvaluator(frameId) => Promise<ScanPayload>` → Task 4 introduces it, Task 5 keeps the same signature. §12 manual QA checklist → distributed across each task's manual verify step. §13 out of scope (persistence/settings UI/i18n/telemetry) — no task touches these.
- **Placeholder scan:** No "TBD", no "implement appropriate error handling" — every error path has explicit code. No "similar to Task N" — code is repeated where needed.
- **Type consistency:** `ScanPayload`, `EvaluateOutput`, `SelectionState`, `Violation`, `CodeMsg`, `UiMsg` defined once in Task 2 and referenced by exact name in every later task. `callEvaluator` signature stable across Tasks 4, 5, 7. Tab keys `'color'` / `'typography'` consistent in `ScanPayload`, `TabHeader`, `App.tsx`. `figma.getNodeByIdAsync` used (NOT the legacy sync `getNodeById`, which `documentAccess: "dynamic-page"` forbids).
