# eslint-plugin-vapor 디자인 토큰 룰 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `eslint-plugin-vapor` 에 디자인 토큰 검사 룰(JS/TS 2개 + CSS 2개)을 추가하여 토큰 이름 오타, 미존재 토큰, raw 값 사용을 정적으로 감지/제안한다.

**Architecture:** SSOT 인 `skills/token-lint/assets/*.json` 을 build-time 에 파싱하여 `src/generated/tokens.ts` 로 캐노니컬 목록 + value→token 역인덱스를 생성한다. ESTree 컨텍스트(JS/TS/JSX)와 `@eslint/css` 의 CSSTree 컨텍스트(CSS) 양쪽에서 동작하는 룰 4개를 동일 데이터 위에서 구현한다. 세 계층 allowlist(글로벌 `settings`, 룰 옵션, 파일 LHS 자동 감지)로 사용자 커스텀 `--vapor-*` 충돌을 허용한다.

**Tech Stack:** TypeScript, ESLint v9 (flat config), `@eslint/css`, `culori` (oklch→hex), `vitest`, `tsup`, pnpm workspace.

## Global Constraints

- 패키지 경로: `packages/eslint-plugin-vapor`.
- 토큰 SSOT: `skills/token-lint/assets/*.json` (resolver.json 제외).
- 토큰 prefix: `--vapor-`.
- 토큰 카테고리: `space`, `borderRadius`, `dimension`, `shadow`, `typography`, `color` (v1 color 는 semantic-color 만 value-index).
- 모든 룰: autofix(--fix) 미제공, suggestion API 만 제공.
- 새 파일/디렉토리: `src/generated/`, `src/utils/`, `src/rules/css/`.
- 빌드 파이프라인: `pnpm prebuild` → `tsup`. 자동 hook 으로 `pnpm build` 가 `prebuild` 실행.
- 테스트 러너: `vitest` + ESLint `RuleTester`. 파일명 패턴 `*.test.ts`.
- 코드 스타일: 기존 룰(`aria-label-on-icon-button.ts`)과 동일 import 순서 (eslint type → estree type → utils), `~/` alias 사용.
- 토큰 segment 거리: per-segment Damerau-Levenshtein ≤ 1, total ≤ 2, top-3 후보.
- 기본 무시 값: `0`, `0px`, `transparent`, `none`.
- React inline style unitless property: `lineHeight`, `fontWeight`, `opacity`, `zIndex`, `flex`, `flexGrow`, `flexShrink`, `order`.
- 색상 정규화: hex 6자리 lower-case (`#RGB` → 확장, `#RRGGBB` → 소문자).
- CHANGELOG.md 직접 수정 금지 (changesets 가 관리).

## File Structure

생성:
- `packages/eslint-plugin-vapor/scripts/extract-tokens.mjs` — build-time 토큰 추출/색상 변환/value index 생성.
- `packages/eslint-plugin-vapor/.gitignore` — `src/generated/` 추가 (없으면 생성).
- `packages/eslint-plugin-vapor/src/generated/tokens.ts` — GENERATED, gitignored. `CANONICAL_TOKENS`, `TOKEN_CATEGORY`, `VALUE_INDEX` export.
- `packages/eslint-plugin-vapor/src/utils/token-segment-distance.ts` — Damerau-Levenshtein + segmentDistance + suggest.
- `packages/eslint-plugin-vapor/src/utils/token-string.ts` — 문자열에서 `--vapor-*` 토큰 + offset 추출.
- `packages/eslint-plugin-vapor/src/utils/property-category.ts` — camelCase / kebab-case 정규화 + 카테고리 매핑.
- `packages/eslint-plugin-vapor/src/utils/value-normalize.ts` — 숫자/단위/hex 정규화.
- `packages/eslint-plugin-vapor/src/utils/allowlist.ts` — settings + option + 로컬 union allowlist.
- `packages/eslint-plugin-vapor/src/utils/style-context.ts` — ESTree 컨텍스트 walker (JSX style, css tag, css call).
- `packages/eslint-plugin-vapor/src/rules/no-invalid-design-token.ts` — JS/TS/JSX 룰.
- `packages/eslint-plugin-vapor/src/rules/prefer-design-token.ts` — JS/TS/JSX 룰.
- `packages/eslint-plugin-vapor/src/rules/css/no-invalid-design-token.ts` — CSS 룰.
- `packages/eslint-plugin-vapor/src/rules/css/prefer-design-token.ts` — CSS 룰.
- 각 src 파일에 대응하는 `*.test.ts`.

수정:
- `packages/eslint-plugin-vapor/src/index.ts` — 신규 룰 등록 + `cssRecommended` preset export.
- `packages/eslint-plugin-vapor/package.json` — `prebuild` script, `culori`/`@eslint/css` devDep, peerDependenciesMeta.
- `packages/eslint-plugin-vapor/README.md` — 룰 표 + settings + `@eslint/css` 예시.

각 파일은 단일 책임: utils 는 순수 함수, rules 는 ESLint 통합, generated 는 데이터, scripts 는 build.

---

## Task 1: 빌드 셋업 (gitignore, package.json, prebuild 훅)

**Files:**
- Create: `packages/eslint-plugin-vapor/.gitignore`
- Modify: `packages/eslint-plugin-vapor/package.json`

**Interfaces:**
- Produces: `pnpm --filter eslint-plugin-vapor prebuild` 가 `node scripts/extract-tokens.mjs` 실행. `pnpm build` 가 `prebuild` 를 자동 호출.

- [ ] **Step 1: `.gitignore` 작성**

Create `packages/eslint-plugin-vapor/.gitignore`:

```
dist
node_modules
.turbo
src/generated
```

- [ ] **Step 2: `package.json` 수정**

다음 항목 추가/변경 (기존 키 유지하며 병합):

```json
{
    "scripts": {
        "build": "tsup",
        "prebuild": "node scripts/extract-tokens.mjs",
        "dev": "node scripts/extract-tokens.mjs && tsup --watch"
    },
    "devDependencies": {
        "culori": "^4.0.1",
        "@eslint/css": "^0.5.0"
    },
    "peerDependencies": {
        "@eslint/css": "^0.5.0"
    },
    "peerDependenciesMeta": {
        "@eslint/css": {
            "optional": true
        }
    }
}
```

(기존 `clean`, `lint`, `typecheck` 등 다른 scripts/deps 는 유지. 위 키만 추가/덮어쓰기.)

- [ ] **Step 3: 의존성 설치 + script 실행 검증**

Run:
```bash
pnpm install
pnpm --filter eslint-plugin-vapor exec node -e "console.log('ok')"
```
Expected: `ok` 출력 (의존성 설치 성공 검증).

- [ ] **Step 4: Commit**

```bash
git add packages/eslint-plugin-vapor/.gitignore packages/eslint-plugin-vapor/package.json pnpm-lock.yaml
git commit -m "chore(eslint-plugin-vapor): add prebuild hook + token deps"
```

---

## Task 2: 토큰 추출 스크립트 (이름 + 카테고리)

**Files:**
- Create: `packages/eslint-plugin-vapor/scripts/extract-tokens.mjs`
- Create: `packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`

**Interfaces:**
- Produces:
  - `extractCanonical(assetsDir): Promise<{ names: Set<string>, category: Map<string, Category> }>` — 토큰 이름 + 카테고리 매핑 추출 (색상 값은 다음 태스크).
  - `Category = 'space'|'borderRadius'|'dimension'|'shadow'|'typography'|'color'`.

- [ ] **Step 1: 실패 테스트 작성**

Create `packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`:

```js
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractCanonical } from './extract-tokens.mjs';

const ASSETS = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../skills/token-lint/assets',
);

test('extractCanonical 은 prefix 포함 토큰 이름을 모은다', async () => {
    const { names } = await extractCanonical(ASSETS);
    assert.ok(names.has('--vapor-size-space-100'));
    assert.ok(names.has('--vapor-size-borderRadius-400'));
    assert.ok(names.size > 50);
});

test('extractCanonical 은 카테고리를 매핑한다', async () => {
    const { category } = await extractCanonical(ASSETS);
    assert.equal(category.get('--vapor-size-space-100'), 'space');
    assert.equal(category.get('--vapor-size-borderRadius-400'), 'borderRadius');
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`
Expected: FAIL — `Cannot find package './extract-tokens.mjs'`.

- [ ] **Step 3: 최소 구현 작성**

Create `packages/eslint-plugin-vapor/scripts/extract-tokens.mjs`:

```js
#!/usr/bin/env node
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PREFIX = '--vapor-';
const DTCG_META_KEYS = new Set([
    '$type',
    '$value',
    '$description',
    '$schema',
    '$extensions',
    '$deprecated',
]);
const TOP_KEY_REMAP = { colors: 'color' };
const SKIP_FILES = new Set(['resolver.json']);

const FILE_CATEGORY = {
    'space.json': 'space',
    'border-radius.json': 'borderRadius',
    'dimension.json': 'dimension',
    'shadow.json': 'shadow',
    'typography.json': 'typography',
    'text-style.json': 'typography',
    'semantic-color.light.json': 'color',
    'semantic-color.dark.json': 'color',
    'primitive-color.light.json': 'color',
    'primitive-color.dark.json': 'color',
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isTokenNode = (node) => isPlainObject(node) && '$value' in node;

function walkNames(node, path, out) {
    if (!isPlainObject(node)) return;
    if (isTokenNode(node)) {
        if (path.length > 0) out.push(PREFIX + path.join('-'));
        return;
    }
    for (const [key, child] of Object.entries(node)) {
        if (DTCG_META_KEYS.has(key)) continue;
        const newKey = path.length === 0 ? (TOP_KEY_REMAP[key] ?? key) : key;
        walkNames(child, [...path, newKey], out);
    }
}

export async function extractCanonical(assetsDir) {
    const entries = await readdir(assetsDir);
    const names = new Set();
    const category = new Map();
    for (const name of entries) {
        if (!name.endsWith('.json') || SKIP_FILES.has(name)) continue;
        const cat = FILE_CATEGORY[name];
        if (!cat) continue;
        const text = await readFile(join(assetsDir, name), 'utf8');
        const data = JSON.parse(text);
        const collected = [];
        walkNames(data, [], collected);
        for (const tokenName of collected) {
            names.add(tokenName);
            if (!category.has(tokenName)) category.set(tokenName, cat);
        }
    }
    return { names, category };
}

async function main() {
    const here = dirname(fileURLToPath(import.meta.url));
    const assetsDir = resolve(here, '../../../skills/token-lint/assets');
    const outDir = resolve(here, '../src/generated');
    await mkdir(outDir, { recursive: true });
    const { names, category } = await extractCanonical(assetsDir);
    const sortedNames = [...names].sort();
    const lines = [
        '// AUTO-GENERATED. Do not edit. Run `pnpm prebuild`.',
        "export type Category = 'space'|'borderRadius'|'dimension'|'shadow'|'typography'|'color';",
        '',
        'export const CANONICAL_TOKENS: ReadonlySet<string> = new Set([',
        ...sortedNames.map((n) => `    '${n}',`),
        ']);',
        '',
        'export const TOKEN_CATEGORY: Readonly<Record<string, Category>> = {',
        ...sortedNames.map((n) => `    '${n}': '${category.get(n)}',`),
        '};',
        '',
        'export const VALUE_INDEX: Readonly<Record<Category, Record<string, string[]>>> = {',
        "    space: {},",
        "    borderRadius: {},",
        "    dimension: {},",
        "    shadow: {},",
        "    typography: {},",
        "    color: {},",
        '};',
        '',
    ];
    await writeFile(join(outDir, 'tokens.ts'), lines.join('\n'), 'utf8');
    console.log(`generated ${sortedNames.length} tokens`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`
Expected: PASS — 2 tests pass.

- [ ] **Step 5: prebuild 실제 실행 검증**

Run: `pnpm --filter eslint-plugin-vapor prebuild`
Expected: `generated NNN tokens` 출력, `packages/eslint-plugin-vapor/src/generated/tokens.ts` 파일 존재. VALUE_INDEX 는 모두 빈 객체 (다음 태스크에서 채움).

- [ ] **Step 6: Commit**

```bash
git add packages/eslint-plugin-vapor/scripts/extract-tokens.mjs packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs
git commit -m "feat(eslint-plugin-vapor): add token name + category extractor"
```

---

## Task 3: VALUE_INDEX — 단순 카테고리 (space/borderRadius/dimension)

**Files:**
- Modify: `packages/eslint-plugin-vapor/scripts/extract-tokens.mjs`
- Modify: `packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`

**Interfaces:**
- Consumes: Task 2 의 `extractCanonical` walk 로직.
- Produces: `extractValueIndex(assetsDir): Promise<Record<Category, Record<string, string[]>>>` (이 태스크에서는 space/borderRadius/dimension 만 채움).

- [ ] **Step 1: 실패 테스트 작성**

`packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs` 에 추가:

```js
import { extractValueIndex } from './extract-tokens.mjs';

test('extractValueIndex 는 space px 값을 역인덱싱한다', async () => {
    const idx = await extractValueIndex(ASSETS);
    assert.ok(Array.isArray(idx.space['8px']));
    assert.ok(idx.space['8px'].includes('--vapor-size-space-100'));
});

test('extractValueIndex 는 borderRadius 12px = 400 토큰을 역인덱싱한다', async () => {
    const idx = await extractValueIndex(ASSETS);
    assert.ok(idx.borderRadius['12px'].includes('--vapor-size-borderRadius-400'));
});

test('extractValueIndex 는 dimension 도 px 키로 인덱싱한다', async () => {
    const idx = await extractValueIndex(ASSETS);
    const dimensionKeys = Object.keys(idx.dimension);
    assert.ok(dimensionKeys.length > 0);
    assert.ok(dimensionKeys.every((k) => k.endsWith('px')));
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`
Expected: FAIL — `extractValueIndex is not a function`.

- [ ] **Step 3: 구현 추가**

`scripts/extract-tokens.mjs` 에 다음 export + walk 보강. `walkNames` 옆에 `walkTokens` 추가, 그리고 `extractValueIndex` 함수 + `main()` 의 VALUE_INDEX 직렬화 부분 교체.

```js
function walkTokens(node, path, out) {
    if (!isPlainObject(node)) return;
    if (isTokenNode(node)) {
        if (path.length > 0) {
            out.push({ name: PREFIX + path.join('-'), value: node.$value });
        }
        return;
    }
    for (const [key, child] of Object.entries(node)) {
        if (DTCG_META_KEYS.has(key)) continue;
        const newKey = path.length === 0 ? (TOP_KEY_REMAP[key] ?? key) : key;
        walkTokens(child, [...path, newKey], out);
    }
}

const SIMPLE_PX_CATEGORIES = new Set(['space', 'borderRadius', 'dimension']);

export async function extractValueIndex(assetsDir) {
    const entries = await readdir(assetsDir);
    const idx = { space: {}, borderRadius: {}, dimension: {}, shadow: {}, typography: {}, color: {} };
    for (const name of entries) {
        if (!name.endsWith('.json') || SKIP_FILES.has(name)) continue;
        const cat = FILE_CATEGORY[name];
        if (!cat || !SIMPLE_PX_CATEGORIES.has(cat)) continue;
        const text = await readFile(join(assetsDir, name), 'utf8');
        const data = JSON.parse(text);
        const tokens = [];
        walkTokens(data, [], tokens);
        for (const { name: tokenName, value } of tokens) {
            if (!isPlainObject(value) || typeof value.value !== 'number') continue;
            const unit = value.unit ?? 'px';
            const key = `${value.value}${unit}`;
            if (!idx[cat][key]) idx[cat][key] = [];
            if (!idx[cat][key].includes(tokenName)) idx[cat][key].push(tokenName);
        }
    }
    return idx;
}
```

그리고 `main()` 의 VALUE_INDEX 직렬화 부분을 교체:

```js
    const valueIndex = await extractValueIndex(assetsDir);
    const renderEntries = (obj) =>
        Object.entries(obj)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, v]) => `        ${JSON.stringify(k)}: [${v.map((t) => `'${t}'`).join(', ')}],`)
            .join('\n');
    const valueIndexLines = [
        'export const VALUE_INDEX: Readonly<Record<Category, Record<string, string[]>>> = {',
        '    space: {',
        renderEntries(valueIndex.space),
        '    },',
        '    borderRadius: {',
        renderEntries(valueIndex.borderRadius),
        '    },',
        '    dimension: {',
        renderEntries(valueIndex.dimension),
        '    },',
        '    shadow: {},',
        '    typography: {},',
        '    color: {},',
        '};',
    ];
```

기존 `lines` 배열에서 VALUE_INDEX 6줄 블록을 `...valueIndexLines,` 한 줄로 교체.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`
Expected: PASS — 5 tests pass.

- [ ] **Step 5: 생성 결과 검증**

Run: `pnpm --filter eslint-plugin-vapor prebuild`
Expected: `src/generated/tokens.ts` 의 `VALUE_INDEX.space` / `borderRadius` / `dimension` 에 항목 존재.

- [ ] **Step 6: Commit**

```bash
git add packages/eslint-plugin-vapor/scripts/extract-tokens.mjs packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs
git commit -m "feat(eslint-plugin-vapor): index space/borderRadius/dimension by px value"
```

---

## Task 4: VALUE_INDEX — semantic-color (oklch → hex)

**Files:**
- Modify: `packages/eslint-plugin-vapor/scripts/extract-tokens.mjs`
- Modify: `packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`

**Interfaces:**
- Consumes: Task 3 의 `extractValueIndex`.
- Produces: 동일 함수가 color 카테고리도 채움. semantic-color.light.json 의 ref 를 primitive-color.light.json 의 oklch 정의로 해석 → `culori.formatHex` 로 hex 변환. dark 변형은 v1 미반영 (별도 키로 추가 가능하나 현재는 light 만).

- [ ] **Step 1: 실패 테스트 작성**

`scripts/extract-tokens.test.mjs` 에 추가:

```js
test('extractValueIndex 는 semantic-color 의 hex 를 역인덱싱한다', async () => {
    const idx = await extractValueIndex(ASSETS);
    const hexKeys = Object.keys(idx.color);
    assert.ok(hexKeys.length > 0, 'color index should have entries');
    assert.ok(hexKeys.every((k) => /^#[0-9a-f]{6}$/.test(k)), `keys must be 6-digit lower hex, got ${hexKeys[0]}`);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`
Expected: FAIL — `color index should have entries`.

- [ ] **Step 3: color 처리 구현 추가**

`scripts/extract-tokens.mjs` 상단 import 추가:

```js
import { formatHex } from 'culori';
```

그리고 다음 헬퍼와 `extractValueIndex` 보강:

```js
function buildPrimitiveColorMap(primitiveJson) {
    const map = new Map();
    function visit(node, path) {
        if (!isPlainObject(node)) return;
        if (isTokenNode(node)) {
            const value = node.$value;
            if (isPlainObject(value) && value.colorSpace === 'oklch' && Array.isArray(value.components)) {
                const [l, c, h] = value.components;
                map.set(path.join('.'), { mode: 'oklch', l, c, h });
            }
            return;
        }
        for (const [key, child] of Object.entries(node)) {
            if (DTCG_META_KEYS.has(key)) continue;
            visit(child, [...path, key]);
        }
    }
    visit(primitiveJson, []);
    return map;
}

function resolveRef(rawValue, primitiveMap) {
    if (typeof rawValue !== 'string') return null;
    const m = rawValue.match(/^\{([^}]+)\}$/);
    if (!m) return null;
    const lookupKey = m[1];
    const stripped = lookupKey.startsWith('colors.') ? lookupKey.slice('colors.'.length) : lookupKey;
    return primitiveMap.get(stripped) ?? null;
}

function toHexKey(oklchColor) {
    const hex = formatHex(oklchColor);
    return hex ? hex.toLowerCase() : null;
}
```

`extractValueIndex` 끝부분에 색상 처리 추가 (return 직전):

```js
    // color: semantic-color.light.json 만
    const semanticPath = join(assetsDir, 'semantic-color.light.json');
    const primitivePath = join(assetsDir, 'primitive-color.light.json');
    try {
        const primitiveJson = JSON.parse(await readFile(primitivePath, 'utf8'));
        const primitiveMap = buildPrimitiveColorMap(primitiveJson);
        const semanticJson = JSON.parse(await readFile(semanticPath, 'utf8'));
        const semanticTokens = [];
        walkTokens(semanticJson, [], semanticTokens);
        for (const { name: tokenName, value } of semanticTokens) {
            const oklch = resolveRef(value, primitiveMap);
            if (!oklch) continue;
            const hex = toHexKey(oklch);
            if (!hex) continue;
            const fullName = tokenName.replace(/^--vapor-color-/, '--vapor-color-');
            if (!idx.color[hex]) idx.color[hex] = [];
            if (!idx.color[hex].includes(fullName)) idx.color[hex].push(fullName);
        }
    } catch (e) {
        // semantic / primitive 누락 시 color 인덱스는 비움
    }
```

주의: `walkTokens` 가 semantic JSON 에서 top-level `colors` 를 `color` 로 remap 하므로 토큰 이름은 자연스럽게 `--vapor-color-...` 형태로 나온다. `replace` 는 noop 이지만 명시성 위해 유지.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`
Expected: PASS — 6 tests pass.

- [ ] **Step 5: 생성 결과 검증**

Run: `pnpm --filter eslint-plugin-vapor prebuild`
Expected: `tokens.ts` 의 `VALUE_INDEX.color` 에 hex → token 매핑 다수 존재. 임의 1개 확인 (예: 흔히 쓰이는 brand 컬러).

- [ ] **Step 6: Commit**

```bash
git add packages/eslint-plugin-vapor/scripts/extract-tokens.mjs packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs
git commit -m "feat(eslint-plugin-vapor): resolve semantic-color via oklch -> hex"
```

---

## Task 5: `token-segment-distance` 유틸

**Files:**
- Create: `packages/eslint-plugin-vapor/src/utils/token-segment-distance.ts`
- Create: `packages/eslint-plugin-vapor/src/utils/token-segment-distance.test.ts`

**Interfaces:**
- Produces:
  - `damerauLevenshtein(a: string, b: string, cutoff?: number): number`
  - `segmentDistance(name: string, cand: string): number` — `--vapor-` prefix 동일 + segment 수 동일 + per-segment ≤ 1 + total ≤ 2 일 때만 거리, 아니면 cutoff+1.
  - `suggest(name: string, canonical: Iterable<string>, max?: number): string[]` — 거리순 정렬 후 상위 N.

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';

import { damerauLevenshtein, segmentDistance, suggest } from './token-segment-distance';

describe('damerauLevenshtein', () => {
    it('동일 문자열은 0', () => {
        expect(damerauLevenshtein('foo', 'foo')).toBe(0);
    });
    it('1 글자 치환은 1', () => {
        expect(damerauLevenshtein('foo', 'fox')).toBe(1);
    });
    it('인접 transposition 은 1', () => {
        expect(damerauLevenshtein('abcd', 'abdc')).toBe(1);
    });
    it('cutoff 초과는 cutoff+1', () => {
        expect(damerauLevenshtein('abcdef', 'zzzzzz', 2)).toBe(3);
    });
});

describe('segmentDistance', () => {
    const A = '--vapor-size-space-100';
    it('동일 토큰은 0', () => {
        expect(segmentDistance(A, A)).toBe(0);
    });
    it('마지막 segment 1글자 차이는 1', () => {
        expect(segmentDistance(A, '--vapor-size-space-200')).toBe(1);
    });
    it('per-segment 2글자 차이는 cutoff 초과 (3)', () => {
        expect(segmentDistance(A, '--vapor-size-space-9999')).toBe(3);
    });
    it('segment 수가 다르면 cutoff 초과', () => {
        expect(segmentDistance(A, '--vapor-size-space')).toBe(3);
    });
    it('prefix 없으면 cutoff 초과', () => {
        expect(segmentDistance('foo', 'bar')).toBe(3);
    });
});

describe('suggest', () => {
    const canonical = [
        '--vapor-size-space-100',
        '--vapor-size-space-200',
        '--vapor-size-space-300',
        '--vapor-color-foreground-primary',
    ];
    it('1글자 오타 → top 후보', () => {
        const out = suggest('--vapor-size-space-101', canonical, 3);
        expect(out[0]).toBe('--vapor-size-space-100');
    });
    it('완전 잘못된 이름 → 빈 배열', () => {
        expect(suggest('--vapor-totally-different-name', canonical, 3)).toEqual([]);
    });
    it('max 인자만큼만 반환', () => {
        const out = suggest('--vapor-size-space-101', canonical, 2);
        expect(out.length).toBeLessThanOrEqual(2);
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/token-segment-distance.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/utils/token-segment-distance.ts`:

```ts
const VAPOR_PREFIX = '--vapor-';
const MAX_PER_SEGMENT_DISTANCE = 1;
const MAX_TOTAL_DISTANCE = 2;
const DEFAULT_TOP_K = 3;

export function damerauLevenshtein(a: string, b: string, cutoff = MAX_TOTAL_DISTANCE): number {
    if (Math.abs(a.length - b.length) > cutoff) return cutoff + 1;
    if (a === b) return 0;
    const la = a.length;
    const lb = b.length;
    if (la === 0) return lb;
    if (lb === 0) return la;
    let prev2: number[] = new Array(lb + 1).fill(0);
    let prev: number[] = Array.from({ length: lb + 1 }, (_, i) => i);
    for (let i = 1; i <= la; i++) {
        const curr: number[] = new Array(lb + 1);
        curr[0] = i;
        let rowMin = curr[0];
        for (let j = 1; j <= lb; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                curr[j] = Math.min(curr[j], prev2[j - 2] + 1);
            }
            if (curr[j] < rowMin) rowMin = curr[j];
        }
        if (rowMin > cutoff) return cutoff + 1;
        prev2 = prev;
        prev = curr;
    }
    return prev[lb];
}

export function segmentDistance(name: string, cand: string): number {
    if (!name.startsWith(VAPOR_PREFIX) || !cand.startsWith(VAPOR_PREFIX)) {
        return MAX_TOTAL_DISTANCE + 1;
    }
    const aSegs = name.slice(VAPOR_PREFIX.length).split('-');
    const bSegs = cand.slice(VAPOR_PREFIX.length).split('-');
    if (aSegs.length !== bSegs.length) return MAX_TOTAL_DISTANCE + 1;
    let total = 0;
    for (let k = 0; k < aSegs.length; k++) {
        const d = damerauLevenshtein(aSegs[k], bSegs[k], MAX_PER_SEGMENT_DISTANCE);
        if (d > MAX_PER_SEGMENT_DISTANCE) return MAX_TOTAL_DISTANCE + 1;
        total += d;
        if (total > MAX_TOTAL_DISTANCE) return MAX_TOTAL_DISTANCE + 1;
    }
    return total;
}

export function suggest(name: string, canonical: Iterable<string>, max = DEFAULT_TOP_K): string[] {
    const scored: Array<[string, number]> = [];
    for (const cand of canonical) {
        const d = segmentDistance(name, cand);
        if (d <= MAX_TOTAL_DISTANCE) scored.push([cand, d]);
    }
    scored.sort((x, y) => x[1] - y[1] || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
    return scored.slice(0, max).map(([n]) => n);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/token-segment-distance.test.ts`
Expected: PASS — 12 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/utils/token-segment-distance.ts packages/eslint-plugin-vapor/src/utils/token-segment-distance.test.ts
git commit -m "feat(eslint-plugin-vapor): add token segment-distance util"
```

---

## Task 6: `property-category` 유틸

**Files:**
- Create: `packages/eslint-plugin-vapor/src/utils/property-category.ts`
- Create: `packages/eslint-plugin-vapor/src/utils/property-category.test.ts`

**Interfaces:**
- Produces:
  - `Category` 재export (generated tokens 로부터).
  - `normalizeProperty(prop: string): string` — kebab-case → camelCase.
  - `propertyCategory(prop: string, overrides?: Record<string, Category>): Category | null` — 정규화 후 매핑 조회.
  - `DEFAULT_PROPERTY_CATEGORY: Record<string, Category>` — spec 의 매핑 그대로.
  - `UNITLESS_PROPERTIES: Set<string>` — `lineHeight`, `fontWeight`, `opacity`, `zIndex`, `flex`, `flexGrow`, `flexShrink`, `order`.

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';

import {
    DEFAULT_PROPERTY_CATEGORY,
    UNITLESS_PROPERTIES,
    normalizeProperty,
    propertyCategory,
} from './property-category';

describe('normalizeProperty', () => {
    it('kebab → camel', () => {
        expect(normalizeProperty('border-radius')).toBe('borderRadius');
        expect(normalizeProperty('background-color')).toBe('backgroundColor');
    });
    it('camel 유지', () => {
        expect(normalizeProperty('borderRadius')).toBe('borderRadius');
    });
});

describe('propertyCategory', () => {
    it('gap → space', () => {
        expect(propertyCategory('gap')).toBe('space');
    });
    it('border-radius → borderRadius', () => {
        expect(propertyCategory('border-radius')).toBe('borderRadius');
    });
    it('background-color → color', () => {
        expect(propertyCategory('background-color')).toBe('color');
    });
    it('미매핑 → null', () => {
        expect(propertyCategory('display')).toBeNull();
    });
    it('override 우선', () => {
        expect(propertyCategory('display', { display: 'space' })).toBe('space');
    });
});

describe('DEFAULT_PROPERTY_CATEGORY', () => {
    it('주요 키 포함', () => {
        expect(DEFAULT_PROPERTY_CATEGORY.padding).toBe('space');
        expect(DEFAULT_PROPERTY_CATEGORY.boxShadow).toBe('shadow');
        expect(DEFAULT_PROPERTY_CATEGORY.fontSize).toBe('typography');
    });
});

describe('UNITLESS_PROPERTIES', () => {
    it('lineHeight 포함', () => {
        expect(UNITLESS_PROPERTIES.has('lineHeight')).toBe(true);
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/property-category.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/utils/property-category.ts`:

```ts
import type { Category } from '~/generated/tokens';

export type { Category };

export function normalizeProperty(prop: string): string {
    if (prop.startsWith('--')) return prop;
    return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export const DEFAULT_PROPERTY_CATEGORY: Record<string, Category> = {
    gap: 'space',
    rowGap: 'space',
    columnGap: 'space',
    padding: 'space',
    paddingTop: 'space',
    paddingRight: 'space',
    paddingBottom: 'space',
    paddingLeft: 'space',
    paddingInline: 'space',
    paddingBlock: 'space',
    margin: 'space',
    marginTop: 'space',
    marginRight: 'space',
    marginBottom: 'space',
    marginLeft: 'space',
    marginInline: 'space',
    marginBlock: 'space',
    inset: 'space',
    top: 'space',
    right: 'space',
    bottom: 'space',
    left: 'space',
    borderRadius: 'borderRadius',
    borderTopLeftRadius: 'borderRadius',
    borderTopRightRadius: 'borderRadius',
    borderBottomLeftRadius: 'borderRadius',
    borderBottomRightRadius: 'borderRadius',
    width: 'dimension',
    height: 'dimension',
    minWidth: 'dimension',
    minHeight: 'dimension',
    maxWidth: 'dimension',
    maxHeight: 'dimension',
    size: 'dimension',
    boxShadow: 'shadow',
    color: 'color',
    background: 'color',
    backgroundColor: 'color',
    borderColor: 'color',
    borderTopColor: 'color',
    borderRightColor: 'color',
    borderBottomColor: 'color',
    borderLeftColor: 'color',
    outlineColor: 'color',
    fill: 'color',
    stroke: 'color',
    fontSize: 'typography',
    lineHeight: 'typography',
    letterSpacing: 'typography',
    fontWeight: 'typography',
};

export const UNITLESS_PROPERTIES: ReadonlySet<string> = new Set([
    'lineHeight',
    'fontWeight',
    'opacity',
    'zIndex',
    'flex',
    'flexGrow',
    'flexShrink',
    'order',
]);

export function propertyCategory(
    prop: string,
    overrides?: Record<string, Category>,
): Category | null {
    const camel = normalizeProperty(prop);
    if (overrides && camel in overrides) return overrides[camel];
    return DEFAULT_PROPERTY_CATEGORY[camel] ?? null;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/property-category.test.ts`
Expected: PASS — 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/utils/property-category.ts packages/eslint-plugin-vapor/src/utils/property-category.test.ts
git commit -m "feat(eslint-plugin-vapor): add property -> token category map"
```

---

## Task 7: `value-normalize` 유틸

**Files:**
- Create: `packages/eslint-plugin-vapor/src/utils/value-normalize.ts`
- Create: `packages/eslint-plugin-vapor/src/utils/value-normalize.test.ts`

**Interfaces:**
- Produces:
  - `normalizeLength(prop: string, value: string | number): string | null` — 숫자 + camel/Unitless 룰 따른 px 변환 + 0 정규화. unitless property 면 string 화. 이미 단위 포함 string 이면 trim.
  - `normalizeHex(value: string): string | null` — `#RGB`/`#RRGGBB` → 6자리 lowercase. 그 외 (rgb/named) → null.
  - `IGNORE_VALUES_DEFAULT: ReadonlySet<string>` — `0`, `0px`, `transparent`, `none`.

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';

import { IGNORE_VALUES_DEFAULT, normalizeHex, normalizeLength } from './value-normalize';

describe('normalizeLength', () => {
    it('숫자 + space 계열 → Npx', () => {
        expect(normalizeLength('gap', 12)).toBe('12px');
    });
    it('숫자 + unitless property → 그대로 string', () => {
        expect(normalizeLength('lineHeight', 1.5)).toBe('1.5');
    });
    it('px 문자열 trim', () => {
        expect(normalizeLength('gap', '  12px ')).toBe('12px');
    });
    it('단위 없는 문자열 + unitless property 는 그대로', () => {
        expect(normalizeLength('opacity', '0.5')).toBe('0.5');
    });
    it('빈 값은 null', () => {
        expect(normalizeLength('gap', '')).toBeNull();
    });
});

describe('normalizeHex', () => {
    it('#RRGGBB lowercase', () => {
        expect(normalizeHex('#3B82F6')).toBe('#3b82f6');
    });
    it('#RGB 확장', () => {
        expect(normalizeHex('#3bf')).toBe('#33bbff');
    });
    it('비-hex 는 null', () => {
        expect(normalizeHex('rgb(0,0,0)')).toBeNull();
        expect(normalizeHex('red')).toBeNull();
    });
});

describe('IGNORE_VALUES_DEFAULT', () => {
    it('기본 무시 값', () => {
        expect(IGNORE_VALUES_DEFAULT.has('0')).toBe(true);
        expect(IGNORE_VALUES_DEFAULT.has('transparent')).toBe(true);
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/value-normalize.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/utils/value-normalize.ts`:

```ts
import { UNITLESS_PROPERTIES, normalizeProperty } from './property-category';

export const IGNORE_VALUES_DEFAULT: ReadonlySet<string> = new Set([
    '0',
    '0px',
    'transparent',
    'none',
]);

export function normalizeLength(prop: string, value: string | number): string | null {
    const camel = normalizeProperty(prop);
    const isUnitless = UNITLESS_PROPERTIES.has(camel);
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) return null;
        return isUnitless ? String(value) : `${value}px`;
    }
    const trimmed = value.trim();
    if (trimmed === '') return null;
    return trimmed;
}

export function normalizeHex(value: string): string | null {
    const v = value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(v)) {
        const [, r, g, b] = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)!;
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return null;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/value-normalize.test.ts`
Expected: PASS — 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/utils/value-normalize.ts packages/eslint-plugin-vapor/src/utils/value-normalize.test.ts
git commit -m "feat(eslint-plugin-vapor): add value normalize util"
```

---

## Task 8: `token-string` 유틸 (문자열에서 `--vapor-*` 추출)

**Files:**
- Create: `packages/eslint-plugin-vapor/src/utils/token-string.ts`
- Create: `packages/eslint-plugin-vapor/src/utils/token-string.test.ts`

**Interfaces:**
- Produces:
  - `findVaporTokens(text: string): Array<{ name: string, offset: number, length: number }>` — `--vapor-[a-z0-9-]+` 매치 + 위치.
  - `findVaporDeclarations(text: string): string[]` — `(--vapor-...):` 패턴 LHS 만 추출 (CSS 본문 내 선언).

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';

import { findVaporDeclarations, findVaporTokens } from './token-string';

describe('findVaporTokens', () => {
    it('var() 안의 토큰을 offset 과 함께 추출', () => {
        const text = "var(--vapor-size-space-100)";
        const out = findVaporTokens(text);
        expect(out).toHaveLength(1);
        expect(out[0].name).toBe('--vapor-size-space-100');
        expect(out[0].offset).toBe(4);
        expect(out[0].length).toBe('--vapor-size-space-100'.length);
    });
    it('여러 토큰 모두 추출', () => {
        const text = "var(--vapor-a-b) var(--vapor-c-d)";
        expect(findVaporTokens(text)).toHaveLength(2);
    });
    it('--vapor- 가 아니면 무시', () => {
        expect(findVaporTokens('var(--foo)')).toHaveLength(0);
    });
});

describe('findVaporDeclarations', () => {
    it('LHS 선언 추출', () => {
        const out = findVaporDeclarations(':root { --vapor-app-foo: red; --vapor-app-bar: blue; }');
        expect(out).toEqual(['--vapor-app-foo', '--vapor-app-bar']);
    });
    it('var() 참조는 LHS 아님', () => {
        expect(findVaporDeclarations('color: var(--vapor-x);')).toEqual([]);
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/token-string.test.ts`
Expected: FAIL.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/utils/token-string.ts`:

```ts
const TOKEN_RE = /--vapor-[a-z0-9-]+/gi;
const DECL_RE = /(--vapor-[a-z0-9-]+)\s*:/gi;

export interface TokenMatch {
    name: string;
    offset: number;
    length: number;
}

export function findVaporTokens(text: string): TokenMatch[] {
    const out: TokenMatch[] = [];
    TOKEN_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = TOKEN_RE.exec(text)) !== null) {
        out.push({ name: m[0], offset: m.index, length: m[0].length });
    }
    return out;
}

export function findVaporDeclarations(text: string): string[] {
    const out: string[] = [];
    DECL_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = DECL_RE.exec(text)) !== null) {
        out.push(m[1]);
    }
    return out;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/token-string.test.ts`
Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/utils/token-string.ts packages/eslint-plugin-vapor/src/utils/token-string.test.ts
git commit -m "feat(eslint-plugin-vapor): add string scanner for vapor tokens + declarations"
```

---

## Task 9: `allowlist` 유틸

**Files:**
- Create: `packages/eslint-plugin-vapor/src/utils/allowlist.ts`
- Create: `packages/eslint-plugin-vapor/src/utils/allowlist.test.ts`

**Interfaces:**
- Produces:
  - `buildAllowMatcher(patterns: readonly string[]): (name: string) => boolean` — `*` glob 변환 후 정확 일치 또는 regex 매치.
  - `mergeAllowlists(...lists: Array<readonly string[] | undefined>): string[]` — undefined 제거 + dedup.

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';

import { buildAllowMatcher, mergeAllowlists } from './allowlist';

describe('buildAllowMatcher', () => {
    it('정확 일치', () => {
        const ok = buildAllowMatcher(['--vapor-app-foo']);
        expect(ok('--vapor-app-foo')).toBe(true);
        expect(ok('--vapor-app-bar')).toBe(false);
    });
    it('glob 패턴', () => {
        const ok = buildAllowMatcher(['--vapor-app-*']);
        expect(ok('--vapor-app-anything')).toBe(true);
        expect(ok('--vapor-other-foo')).toBe(false);
    });
    it('빈 리스트 → 항상 false', () => {
        expect(buildAllowMatcher([])('--vapor-x')).toBe(false);
    });
});

describe('mergeAllowlists', () => {
    it('undefined 제거 + dedup', () => {
        expect(mergeAllowlists(['a', 'b'], undefined, ['b', 'c'])).toEqual(['a', 'b', 'c']);
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/allowlist.test.ts`
Expected: FAIL.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/utils/allowlist.ts`:

```ts
function patternToRegex(pat: string): RegExp {
    const escaped = pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
}

export function buildAllowMatcher(patterns: readonly string[]): (name: string) => boolean {
    if (patterns.length === 0) return () => false;
    const exact = new Set<string>();
    const regexes: RegExp[] = [];
    for (const p of patterns) {
        if (p.includes('*')) regexes.push(patternToRegex(p));
        else exact.add(p);
    }
    return (name: string) => {
        if (exact.has(name)) return true;
        for (const re of regexes) {
            if (re.test(name)) return true;
        }
        return false;
    };
}

export function mergeAllowlists(
    ...lists: Array<readonly string[] | undefined>
): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const list of lists) {
        if (!list) continue;
        for (const x of list) {
            if (!seen.has(x)) {
                seen.add(x);
                out.push(x);
            }
        }
    }
    return out;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/allowlist.test.ts`
Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/utils/allowlist.ts packages/eslint-plugin-vapor/src/utils/allowlist.test.ts
git commit -m "feat(eslint-plugin-vapor): add allowlist matcher (glob + dedup)"
```

---

## Task 10: `style-context` 유틸 (ESTree walker)

**Files:**
- Create: `packages/eslint-plugin-vapor/src/utils/style-context.ts`
- Create: `packages/eslint-plugin-vapor/src/utils/style-context.test.ts`

**Interfaces:**
- Consumes: `~/utils/property-category`, `~/utils/token-string`.
- Produces:
  - `iterateStyleObject(node: ObjectExpression, onEntry: (prop: string, valueNode: Node) => void): void` — JSX style obj / css({}) 인자 ObjectExpression 의 각 property iterate.
  - `collectFileLocalAllow(programText: string, ast: Program): Set<string>` — 동일 파일의 LHS `--vapor-*` 선언 (object key + template literal CSS body).
  - `isCssTaggedTemplate(node: TaggedTemplateExpression): boolean` — tag 가 `css` / `styled.X` / `styled(X)` / `keyframes` / `globalStyle` 패턴.
  - `iterateCssTemplate(node: TaggedTemplateExpression, onEntry: (prop: string, value: string) => void): void` — quasis raw 안 `prop: value;` 페어 추출.

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { parse } from 'espree';
import { describe, expect, it } from 'vitest';

import {
    collectFileLocalAllow,
    isCssTaggedTemplate,
    iterateCssTemplate,
    iterateStyleObject,
} from './style-context';

function parseProgram(code: string) {
    return parse(code, {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        loc: true,
        range: true,
    }) as any;
}

describe('iterateStyleObject', () => {
    it('JSX style obj 각 property iterate', () => {
        const ast = parseProgram('const a = ({ gap: 12, padding: "8px" });');
        const obj = ast.body[0].declarations[0].init;
        const entries: Array<[string, string]> = [];
        iterateStyleObject(obj, (prop, valueNode) => {
            const v = valueNode.type === 'Literal' ? String(valueNode.value) : '?';
            entries.push([prop, v]);
        });
        expect(entries).toEqual([
            ['gap', '12'],
            ['padding', '8px'],
        ]);
    });
});

describe('collectFileLocalAllow', () => {
    it('JSX style obj key 의 --vapor-* 수집', () => {
        const code = "const a = ({ '--vapor-app-foo': 'red' });";
        const ast = parseProgram(code);
        const set = collectFileLocalAllow(code, ast);
        expect(set.has('--vapor-app-foo')).toBe(true);
    });
    it('template literal CSS LHS 수집', () => {
        const code = "const css = (s) => s; const x = css`--vapor-app-x: red;`;";
        const ast = parseProgram(code);
        const set = collectFileLocalAllow(code, ast);
        expect(set.has('--vapor-app-x')).toBe(true);
    });
});

describe('isCssTaggedTemplate', () => {
    it('css 식별자', () => {
        const ast = parseProgram('const x = css`gap: 8px;`;');
        const node = ast.body[0].declarations[0].init;
        expect(isCssTaggedTemplate(node)).toBe(true);
    });
    it('styled.div', () => {
        const ast = parseProgram('const x = styled.div`gap: 8px;`;');
        const node = ast.body[0].declarations[0].init;
        expect(isCssTaggedTemplate(node)).toBe(true);
    });
    it('관계없는 태그', () => {
        const ast = parseProgram('const x = sql`select 1`;');
        const node = ast.body[0].declarations[0].init;
        expect(isCssTaggedTemplate(node)).toBe(false);
    });
});

describe('iterateCssTemplate', () => {
    it('prop:value 페어 추출', () => {
        const ast = parseProgram('const x = css`gap: 12px; padding: 8px;`;');
        const node = ast.body[0].declarations[0].init;
        const entries: Array<[string, string]> = [];
        iterateCssTemplate(node, (p, v) => entries.push([p, v]));
        expect(entries).toEqual([
            ['gap', '12px'],
            ['padding', '8px'],
        ]);
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/style-context.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/utils/style-context.ts`:

```ts
import type { Node, ObjectExpression, Program, TaggedTemplateExpression } from 'estree';

import { findVaporDeclarations } from './token-string';

const CSS_TAGS = new Set(['css', 'keyframes', 'globalStyle']);

export function iterateStyleObject(
    node: ObjectExpression,
    onEntry: (prop: string, valueNode: Node) => void,
): void {
    for (const prop of node.properties) {
        if (prop.type !== 'Property') continue;
        let key: string | null = null;
        if (prop.key.type === 'Identifier') key = prop.key.name;
        else if (prop.key.type === 'Literal' && typeof prop.key.value === 'string') key = prop.key.value;
        if (key === null) continue;
        onEntry(key, prop.value as Node);
    }
}

export function isCssTaggedTemplate(node: TaggedTemplateExpression): boolean {
    const tag = node.tag;
    if (tag.type === 'Identifier') return CSS_TAGS.has(tag.name);
    if (tag.type === 'MemberExpression') {
        if (tag.object.type === 'Identifier' && tag.object.name === 'styled') return true;
    }
    if (tag.type === 'CallExpression') {
        if (tag.callee.type === 'Identifier' && tag.callee.name === 'styled') return true;
    }
    return false;
}

const PROP_VALUE_RE = /([a-zA-Z-]+)\s*:\s*([^;]+);/g;

export function iterateCssTemplate(
    node: TaggedTemplateExpression,
    onEntry: (prop: string, value: string) => void,
): void {
    for (const quasi of node.quasi.quasis) {
        const text = quasi.value.cooked ?? quasi.value.raw;
        PROP_VALUE_RE.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = PROP_VALUE_RE.exec(text)) !== null) {
            onEntry(m[1].trim(), m[2].trim());
        }
    }
}

export function collectFileLocalAllow(programText: string, ast: Program): Set<string> {
    const out = new Set<string>();
    function walk(node: any) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'Property' && node.key) {
            if (node.key.type === 'Literal' && typeof node.key.value === 'string' && node.key.value.startsWith('--vapor-')) {
                out.add(node.key.value);
            }
        }
        if (node.type === 'TemplateElement') {
            const text = node.value?.cooked ?? node.value?.raw ?? '';
            for (const name of findVaporDeclarations(text)) out.add(name);
        }
        for (const key of Object.keys(node)) {
            const child = node[key];
            if (Array.isArray(child)) child.forEach(walk);
            else if (child && typeof child === 'object' && 'type' in child) walk(child);
        }
    }
    walk(ast);
    return out;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/utils/style-context.test.ts`
Expected: PASS — 7 tests pass.

- [ ] **Step 5: espree 의존성 확인**

`espree` 가 패키지에 없으면 devDependency 추가 후 재설치.

Run: `pnpm --filter eslint-plugin-vapor add -D espree`
(이미 ESLint 가 transitively 가져오므로 보통 추가 불요. 누락 시에만 실행.)

- [ ] **Step 6: Commit**

```bash
git add packages/eslint-plugin-vapor/src/utils/style-context.ts packages/eslint-plugin-vapor/src/utils/style-context.test.ts
git commit -m "feat(eslint-plugin-vapor): add ESTree walker for style contexts"
```

---

## Task 11: `no-invalid-design-token` 룰 (JS/TS/JSX)

**Files:**
- Create: `packages/eslint-plugin-vapor/src/rules/no-invalid-design-token.ts`
- Create: `packages/eslint-plugin-vapor/src/rules/no-invalid-design-token.test.ts`

**Interfaces:**
- Consumes: `generated/tokens` (`CANONICAL_TOKENS`), `utils/token-segment-distance` (`suggest`), `utils/token-string` (`findVaporTokens`), `utils/allowlist` (`buildAllowMatcher`, `mergeAllowlists`), `utils/style-context` (`collectFileLocalAllow`).
- Produces:
  - `default export Rule.RuleModule` (named export `noInvalidDesignTokenRule`).
  - 옵션 스키마: `{ ignore?: string[]; allowCustomTokens?: string[]; maxSuggestions?: number }`.
  - messageIds: `unknownToken`, `unknownTokenWithSuggestions`.

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import { noInvalidDesignTokenRule } from './no-invalid-design-token';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: { ecmaFeatures: { jsx: true } },
    },
});

describe('no-invalid-design-token', () => {
    tester.run('no-invalid-design-token', noInvalidDesignTokenRule, {
        valid: [
            {
                code: "const a = 'var(--vapor-size-space-100)';",
            },
            {
                code: "const a = 'no token here';",
            },
            {
                code: "const a = 'var(--vapor-app-foo)';",
                options: [{ allowCustomTokens: ['--vapor-app-*'] }],
            },
            {
                code: "const a = 'var(--vapor-shared-color)';",
                settings: { vapor: { customTokens: ['--vapor-shared-color'] } },
            },
            {
                code: "const a = ({ '--vapor-myown': 'red' }); const b = 'var(--vapor-myown)';",
            },
        ],
        invalid: [
            {
                code: "const a = 'var(--vapor-size-space-101)';",
                errors: [{ messageId: 'unknownTokenWithSuggestions' }],
            },
            {
                code: "const a = 'var(--vapor-totally-bogus-name-x)';",
                errors: [{ messageId: 'unknownToken' }],
            },
            {
                code: "const a = `gap: var(--vapor-size-space-101);`;",
                errors: [{ messageId: 'unknownTokenWithSuggestions' }],
            },
        ],
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/rules/no-invalid-design-token.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/rules/no-invalid-design-token.ts`:

```ts
import type { Rule } from 'eslint';
import type { Literal, Node, Program, TemplateElement } from 'estree';

import { CANONICAL_TOKENS } from '~/generated/tokens';
import { buildAllowMatcher, mergeAllowlists } from '~/utils/allowlist';
import { collectFileLocalAllow } from '~/utils/style-context';
import { suggest } from '~/utils/token-segment-distance';
import { findVaporTokens } from '~/utils/token-string';

interface Options {
    ignore?: string[];
    allowCustomTokens?: string[];
    maxSuggestions?: number;
}

export const noInvalidDesignTokenRule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Forbid use of unknown --vapor-* design tokens (typo detection).',
        },
        hasSuggestions: true,
        schema: [
            {
                type: 'object',
                properties: {
                    ignore: { type: 'array', items: { type: 'string' } },
                    allowCustomTokens: { type: 'array', items: { type: 'string' } },
                    maxSuggestions: { type: 'integer', minimum: 0 },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unknownToken: "Unknown design token '{{ name }}'.",
            unknownTokenWithSuggestions: "Unknown design token '{{ name }}'. Did you mean: {{ suggestions }}?",
        },
    },
    create(context: Rule.RuleContext) {
        const options = (context.options[0] ?? {}) as Options;
        const maxSuggestions = options.maxSuggestions ?? 3;
        const ignoreRegexes = (options.ignore ?? []).map((p) => new RegExp(p));
        const settings = (context.settings as { vapor?: { customTokens?: string[] } })?.vapor;
        const globalAllow = settings?.customTokens;

        let localAllowSet: Set<string> | null = null;
        function getLocalAllow(): Set<string> {
            if (localAllowSet) return localAllowSet;
            const source = context.sourceCode.text;
            const ast = context.sourceCode.ast as Program;
            localAllowSet = collectFileLocalAllow(source, ast);
            return localAllowSet;
        }

        const matchAllow = buildAllowMatcher(
            mergeAllowlists(globalAllow, options.allowCustomTokens),
        );

        function reportToken(strNode: Node, strStart: number, name: string, tokenOffset: number) {
            if (CANONICAL_TOKENS.has(name)) return;
            if (matchAllow(name)) return;
            if (getLocalAllow().has(name)) return;
            if (ignoreRegexes.some((re) => re.test(name))) return;

            const candidates = suggest(name, CANONICAL_TOKENS, maxSuggestions);
            const reportStart = strStart + tokenOffset;
            const reportEnd = reportStart + name.length;
            const loc = {
                start: context.sourceCode.getLocFromIndex(reportStart),
                end: context.sourceCode.getLocFromIndex(reportEnd),
            };
            const suggestionFixes: Rule.SuggestionReportDescriptor[] = candidates.map((cand) => ({
                messageId: 'unknownTokenWithSuggestions',
                data: { name, suggestions: cand },
                fix: (fixer) => fixer.replaceTextRange([reportStart, reportEnd], cand),
            }));

            if (candidates.length === 0) {
                context.report({ loc, messageId: 'unknownToken', data: { name } });
            } else {
                context.report({
                    loc,
                    messageId: 'unknownTokenWithSuggestions',
                    data: { name, suggestions: candidates.join(', ') },
                    suggest: suggestionFixes,
                });
            }
        }

        function scanLiteral(node: Literal) {
            if (typeof node.value !== 'string') return;
            const start = (node.range?.[0] ?? 0) + 1; // skip opening quote
            for (const t of findVaporTokens(node.value)) {
                reportToken(node, start, t.name, t.offset);
            }
        }

        function scanTemplateElement(node: TemplateElement) {
            const text = node.value.cooked ?? node.value.raw;
            const start = (node.range?.[0] ?? 0);
            // template element range starts at the backtick or `}`; +1 skips it for matching offsets in cooked text
            const baseOffset = start + 1;
            for (const t of findVaporTokens(text)) {
                reportToken(node, baseOffset, t.name, t.offset);
            }
        }

        return {
            Literal: scanLiteral,
            TemplateElement: scanTemplateElement,
        };
    },
};

export default noInvalidDesignTokenRule;
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/rules/no-invalid-design-token.test.ts`
Expected: PASS — 8 cases (5 valid + 3 invalid).

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/rules/no-invalid-design-token.ts packages/eslint-plugin-vapor/src/rules/no-invalid-design-token.test.ts
git commit -m "feat(eslint-plugin-vapor): add no-invalid-design-token rule (JS/TS)"
```

---

## Task 12: `prefer-design-token` 룰 (JS/TS/JSX)

**Files:**
- Create: `packages/eslint-plugin-vapor/src/rules/prefer-design-token.ts`
- Create: `packages/eslint-plugin-vapor/src/rules/prefer-design-token.test.ts`

**Interfaces:**
- Consumes: `generated/tokens` (`VALUE_INDEX`, `Category`), `utils/property-category` (`propertyCategory`, `normalizeProperty`), `utils/value-normalize`, `utils/style-context` (`iterateStyleObject`, `isCssTaggedTemplate`, `iterateCssTemplate`).
- Produces:
  - `default export Rule.RuleModule` (named export `preferDesignTokenRule`).
  - 옵션: `{ categories?, propertyMap?, ignoreProperties?, ignoreValues?, maxSuggestions? }`.
  - messageId: `preferToken`.

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { RuleTester } from 'eslint';
import { describe } from 'vitest';

import { preferDesignTokenRule } from './prefer-design-token';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: { ecmaFeatures: { jsx: true } },
    },
});

describe('prefer-design-token', () => {
    tester.run('prefer-design-token', preferDesignTokenRule, {
        valid: [
            { code: "const a = ({ gap: 'var(--vapor-size-space-100)' });" },
            { code: "const a = ({ display: 'flex' });" },
            { code: "const a = ({ gap: 0 });" },
            { code: "const a = ({ backgroundColor: 'transparent' });" },
            {
                code: "const a = ({ fontSize: '14px' });",
                options: [{ ignoreProperties: ['fontSize'] }],
            },
            { code: "const a = ({ lineHeight: 1.5 });" },
        ],
        invalid: [
            {
                code: "const a = ({ gap: 8 });",
                errors: [{ messageId: 'preferToken' }],
            },
            {
                code: "const a = ({ gap: '8px' });",
                errors: [{ messageId: 'preferToken' }],
            },
            {
                code: "const a = ({ borderRadius: '12px' });",
                errors: [{ messageId: 'preferToken' }],
            },
            {
                code: "const css = (s) => s; const x = css`gap: 8px;`;",
                errors: [{ messageId: 'preferToken' }],
            },
        ],
    });
});
```

(색상 매핑 테스트는 generated tokens.ts 의 실제 hex 값을 알아야 deterministic 이므로 별도 case 제외. 후속 PR 에서 fixture 추가.)

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/rules/prefer-design-token.test.ts`
Expected: FAIL.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/rules/prefer-design-token.ts`:

```ts
import type { Rule } from 'eslint';
import type { Literal, Node, ObjectExpression, TaggedTemplateExpression, TemplateLiteral } from 'estree';

import { VALUE_INDEX, type Category } from '~/generated/tokens';
import { propertyCategory } from '~/utils/property-category';
import {
    isCssTaggedTemplate,
    iterateCssTemplate,
    iterateStyleObject,
} from '~/utils/style-context';
import { IGNORE_VALUES_DEFAULT, normalizeHex, normalizeLength } from '~/utils/value-normalize';

interface Options {
    categories?: Category[];
    propertyMap?: Record<string, Category>;
    ignoreProperties?: string[];
    ignoreValues?: string[];
    maxSuggestions?: number;
}

const CSS_CALLEES = new Set(['css', 'style', 'keyframes', 'globalStyle']);

function looksLikeVar(value: string): boolean {
    return /var\(\s*--vapor-/.test(value);
}

export const preferDesignTokenRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Suggest design tokens when a raw value matches a token 1:1.',
        },
        hasSuggestions: true,
        schema: [
            {
                type: 'object',
                properties: {
                    categories: { type: 'array', items: { type: 'string' } },
                    propertyMap: { type: 'object', additionalProperties: { type: 'string' } },
                    ignoreProperties: { type: 'array', items: { type: 'string' } },
                    ignoreValues: { type: 'array', items: { type: 'string' } },
                    maxSuggestions: { type: 'integer', minimum: 0 },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            preferToken: "Use design token instead of raw value '{{ value }}'. Candidate: {{ candidates }}.",
        },
    },
    create(context: Rule.RuleContext) {
        const options = (context.options[0] ?? {}) as Options;
        const maxSuggestions = options.maxSuggestions ?? 3;
        const ignoreProps = new Set(options.ignoreProperties ?? []);
        const ignoreValues = new Set([
            ...IGNORE_VALUES_DEFAULT,
            ...(options.ignoreValues ?? []),
        ]);
        const allowedCategories = options.categories
            ? new Set(options.categories)
            : null;

        function categoryFor(prop: string): Category | null {
            const cat = propertyCategory(prop, options.propertyMap);
            if (!cat) return null;
            if (allowedCategories && !allowedCategories.has(cat)) return null;
            return cat;
        }

        function lookupCandidates(cat: Category, key: string): string[] {
            const bucket = VALUE_INDEX[cat][key];
            if (!bucket) return [];
            return bucket.slice(0, maxSuggestions);
        }

        function reportNode(valueNode: Node, rawValue: string, cat: Category, key: string, isStringLiteral: boolean) {
            if (ignoreValues.has(key)) return;
            const candidates = lookupCandidates(cat, key);
            if (candidates.length === 0) return;
            const fixes: Rule.SuggestionReportDescriptor[] = candidates.map((cand) => ({
                messageId: 'preferToken',
                data: { value: rawValue, candidates: cand },
                fix: (fixer) => {
                    const replacement = `'var(${cand})'`;
                    if (valueNode.range) {
                        return fixer.replaceTextRange(valueNode.range, replacement);
                    }
                    return null;
                },
            }));
            context.report({
                node: valueNode,
                messageId: 'preferToken',
                data: { value: rawValue, candidates: candidates.join(', ') },
                suggest: fixes,
            });
        }

        function handleEntry(prop: string, valueNode: Node) {
            if (ignoreProps.has(prop)) return;
            const cat = categoryFor(prop);
            if (!cat) return;

            if (valueNode.type === 'Literal') {
                const lit = valueNode as Literal;
                if (typeof lit.value === 'number') {
                    const key = normalizeLength(prop, lit.value);
                    if (key) reportNode(valueNode, String(lit.value), cat, key, false);
                    return;
                }
                if (typeof lit.value === 'string') {
                    if (looksLikeVar(lit.value)) return;
                    if (cat === 'color') {
                        const hex = normalizeHex(lit.value);
                        if (hex) reportNode(valueNode, lit.value, cat, hex, true);
                        return;
                    }
                    const key = normalizeLength(prop, lit.value);
                    if (key) reportNode(valueNode, lit.value, cat, key, true);
                }
            }
        }

        function handleObjectExpression(obj: ObjectExpression) {
            iterateStyleObject(obj, handleEntry);
        }

        return {
            'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression'(
                node: ObjectExpression,
            ) {
                handleObjectExpression(node);
            },
            CallExpression(node) {
                if (node.callee.type !== 'Identifier') return;
                if (!CSS_CALLEES.has(node.callee.name)) return;
                for (const arg of node.arguments) {
                    if (arg.type === 'ObjectExpression') handleObjectExpression(arg);
                }
            },
            TaggedTemplateExpression(node: TaggedTemplateExpression) {
                if (!isCssTaggedTemplate(node)) return;
                iterateCssTemplate(node, (prop, value) => {
                    if (ignoreProps.has(prop)) return;
                    const cat = categoryFor(prop);
                    if (!cat) return;
                    if (looksLikeVar(value)) return;
                    let key: string | null = null;
                    if (cat === 'color') key = normalizeHex(value);
                    else key = normalizeLength(prop, value);
                    if (!key || ignoreValues.has(key)) return;
                    const candidates = lookupCandidates(cat, key);
                    if (candidates.length === 0) return;
                    context.report({
                        node: node.quasi as TemplateLiteral,
                        messageId: 'preferToken',
                        data: { value, candidates: candidates.join(', ') },
                    });
                });
            },
        };
    },
};

export default preferDesignTokenRule;
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/rules/prefer-design-token.test.ts`
Expected: PASS — 10 cases.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/rules/prefer-design-token.ts packages/eslint-plugin-vapor/src/rules/prefer-design-token.test.ts
git commit -m "feat(eslint-plugin-vapor): add prefer-design-token rule (JS/TS)"
```

---

## Task 13: CSS 룰 — `no-invalid-design-token`

**Files:**
- Create: `packages/eslint-plugin-vapor/src/rules/css/no-invalid-design-token.ts`
- Create: `packages/eslint-plugin-vapor/src/rules/css/no-invalid-design-token.test.ts`

**Interfaces:**
- Consumes: `generated/tokens`, `utils/token-segment-distance`, `utils/allowlist`.
- Produces:
  - `default export` 객체 (CSSPlugin rule 형식 — `@eslint/css` 의 `Rule` 타입이 ESTree Rule 과 동일 shape 이므로 그대로 사용 가능. visitor 키만 CSSTree node type.).
  - messageIds 동일 (`unknownToken`, `unknownTokenWithSuggestions`).

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { Linter } from 'eslint';
import css from '@eslint/css';
import { describe, expect, it } from 'vitest';

import { cssNoInvalidDesignTokenRule } from './no-invalid-design-token';

function lint(code: string, settings: Record<string, unknown> = {}) {
    const linter = new Linter();
    return linter.verify(code, {
        files: ['*.css'],
        plugins: { css, vapor: { rules: { 'css/no-invalid-design-token': cssNoInvalidDesignTokenRule } } },
        language: 'css/css',
        rules: { 'vapor/css/no-invalid-design-token': 'error' },
        settings,
    } as any);
}

describe('css/no-invalid-design-token', () => {
    it('canonical 토큰 통과', () => {
        const out = lint('a { color: var(--vapor-color-foreground-primary); }');
        expect(out).toHaveLength(0);
    });
    it('동일 파일 LHS 선언된 커스텀 토큰 통과', () => {
        const out = lint(':root { --vapor-app-foo: red; } a { color: var(--vapor-app-foo); }');
        expect(out).toHaveLength(0);
    });
    it('settings 커스텀 토큰 통과', () => {
        const out = lint(
            'a { color: var(--vapor-shared-x); }',
            { vapor: { customTokens: ['--vapor-shared-x'] } },
        );
        expect(out).toHaveLength(0);
    });
    it('미존재 토큰은 보고', () => {
        const out = lint('a { color: var(--vapor-color-foreground-primry); }');
        expect(out.length).toBeGreaterThan(0);
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/rules/css/no-invalid-design-token.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/rules/css/no-invalid-design-token.ts`:

```ts
import { CANONICAL_TOKENS } from '~/generated/tokens';
import { buildAllowMatcher, mergeAllowlists } from '~/utils/allowlist';
import { suggest } from '~/utils/token-segment-distance';

interface Options {
    ignore?: string[];
    allowCustomTokens?: string[];
    maxSuggestions?: number;
}

interface CssContext {
    options: Options[];
    settings: { vapor?: { customTokens?: string[] } };
    sourceCode: { ast: any; getLocFromIndex(i: number): { line: number; column: number } };
    report(descriptor: any): void;
}

export const cssNoInvalidDesignTokenRule = {
    meta: {
        type: 'problem',
        docs: { description: 'Forbid use of unknown --vapor-* design tokens in CSS.' },
        hasSuggestions: true,
        schema: [
            {
                type: 'object',
                properties: {
                    ignore: { type: 'array', items: { type: 'string' } },
                    allowCustomTokens: { type: 'array', items: { type: 'string' } },
                    maxSuggestions: { type: 'integer', minimum: 0 },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unknownToken: "Unknown design token '{{ name }}'.",
            unknownTokenWithSuggestions: "Unknown design token '{{ name }}'. Did you mean: {{ suggestions }}?",
        },
    },
    create(context: CssContext) {
        const options = (context.options[0] ?? {}) as Options;
        const maxSuggestions = options.maxSuggestions ?? 3;
        const ignoreRegexes = (options.ignore ?? []).map((p) => new RegExp(p));
        const globalAllow = context.settings?.vapor?.customTokens;
        const matchAllow = buildAllowMatcher(
            mergeAllowlists(globalAllow, options.allowCustomTokens),
        );

        // 사전 패스: LHS 선언 수집
        const localAllow = new Set<string>();
        function preWalk(node: any) {
            if (!node || typeof node !== 'object') return;
            if (node.type === 'Declaration' && typeof node.property === 'string' && node.property.startsWith('--vapor-')) {
                localAllow.add(node.property);
            }
            for (const k of Object.keys(node)) {
                const v = node[k];
                if (Array.isArray(v)) v.forEach(preWalk);
                else if (v && typeof v === 'object' && 'type' in v) preWalk(v);
            }
        }
        preWalk(context.sourceCode.ast);

        return {
            Function(node: any) {
                if (node.name !== 'var') return;
                const arg = node.children?.[0];
                if (!arg) return;
                const name: string | undefined =
                    arg.type === 'Identifier' ? arg.name : undefined;
                if (!name || !name.startsWith('--vapor-')) return;
                if (CANONICAL_TOKENS.has(name)) return;
                if (matchAllow(name)) return;
                if (localAllow.has(name)) return;
                if (ignoreRegexes.some((re) => re.test(name))) return;

                const candidates = suggest(name, CANONICAL_TOKENS, maxSuggestions);
                if (candidates.length === 0) {
                    context.report({
                        node: arg,
                        messageId: 'unknownToken',
                        data: { name },
                    });
                } else {
                    context.report({
                        node: arg,
                        messageId: 'unknownTokenWithSuggestions',
                        data: { name, suggestions: candidates.join(', ') },
                    });
                }
            },
        };
    },
};

export default cssNoInvalidDesignTokenRule;
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/rules/css/no-invalid-design-token.test.ts`
Expected: PASS — 4 cases.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/rules/css/no-invalid-design-token.ts packages/eslint-plugin-vapor/src/rules/css/no-invalid-design-token.test.ts
git commit -m "feat(eslint-plugin-vapor): add css/no-invalid-design-token rule"
```

---

## Task 14: CSS 룰 — `prefer-design-token`

**Files:**
- Create: `packages/eslint-plugin-vapor/src/rules/css/prefer-design-token.ts`
- Create: `packages/eslint-plugin-vapor/src/rules/css/prefer-design-token.test.ts`

**Interfaces:**
- Consumes: `generated/tokens`, `utils/property-category`, `utils/value-normalize`.
- Produces: CSS rule object with `Declaration` visitor.

- [ ] **Step 1: 실패 테스트 작성**

```ts
import css from '@eslint/css';
import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';

import { cssPreferDesignTokenRule } from './prefer-design-token';

function lint(code: string) {
    const linter = new Linter();
    return linter.verify(code, {
        files: ['*.css'],
        plugins: { css, vapor: { rules: { 'css/prefer-design-token': cssPreferDesignTokenRule } } },
        language: 'css/css',
        rules: { 'vapor/css/prefer-design-token': 'warn' },
    } as any);
}

describe('css/prefer-design-token', () => {
    it('var() 사용은 통과', () => {
        expect(lint('a { gap: var(--vapor-size-space-100); }')).toHaveLength(0);
    });
    it('0 은 통과', () => {
        expect(lint('a { gap: 0; }')).toHaveLength(0);
    });
    it('gap: 8px → 보고', () => {
        const out = lint('a { gap: 8px; }');
        expect(out.length).toBeGreaterThan(0);
    });
    it('border-radius: 12px → 보고', () => {
        const out = lint('a { border-radius: 12px; }');
        expect(out.length).toBeGreaterThan(0);
    });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/rules/css/prefer-design-token.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: 구현 작성**

Create `packages/eslint-plugin-vapor/src/rules/css/prefer-design-token.ts`:

```ts
import { VALUE_INDEX, type Category } from '~/generated/tokens';
import { propertyCategory } from '~/utils/property-category';
import { IGNORE_VALUES_DEFAULT, normalizeHex, normalizeLength } from '~/utils/value-normalize';

interface Options {
    categories?: Category[];
    propertyMap?: Record<string, Category>;
    ignoreProperties?: string[];
    ignoreValues?: string[];
    maxSuggestions?: number;
}

interface CssContext {
    options: Options[];
    report(descriptor: any): void;
}

const FIRST_TOKEN_RE = /^\s*([#0-9a-zA-Z.+-]+)/;

export const cssPreferDesignTokenRule = {
    meta: {
        type: 'suggestion',
        docs: { description: 'Suggest design tokens when a raw CSS value matches a token 1:1.' },
        schema: [
            {
                type: 'object',
                properties: {
                    categories: { type: 'array', items: { type: 'string' } },
                    propertyMap: { type: 'object', additionalProperties: { type: 'string' } },
                    ignoreProperties: { type: 'array', items: { type: 'string' } },
                    ignoreValues: { type: 'array', items: { type: 'string' } },
                    maxSuggestions: { type: 'integer', minimum: 0 },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            preferToken: "Use design token instead of raw value '{{ value }}'. Candidate: {{ candidates }}.",
        },
    },
    create(context: CssContext) {
        const options = (context.options[0] ?? {}) as Options;
        const maxSuggestions = options.maxSuggestions ?? 3;
        const ignoreProps = new Set(options.ignoreProperties ?? []);
        const ignoreValues = new Set([
            ...IGNORE_VALUES_DEFAULT,
            ...(options.ignoreValues ?? []),
        ]);
        const allowedCategories = options.categories ? new Set(options.categories) : null;

        return {
            Declaration(node: any) {
                const prop: string = node.property;
                if (!prop || prop.startsWith('--')) return;
                if (ignoreProps.has(prop)) return;
                const cat = propertyCategory(prop, options.propertyMap);
                if (!cat) return;
                if (allowedCategories && !allowedCategories.has(cat)) return;

                const valueText: string = node.value?.raw ?? '';
                if (/var\(\s*--vapor-/.test(valueText)) return;
                const m = valueText.match(FIRST_TOKEN_RE);
                if (!m) return;
                const firstToken = m[1];

                let key: string | null = null;
                if (cat === 'color') key = normalizeHex(firstToken);
                else key = normalizeLength(prop, firstToken);
                if (!key || ignoreValues.has(key)) return;

                const bucket = VALUE_INDEX[cat][key];
                if (!bucket || bucket.length === 0) return;
                const candidates = bucket.slice(0, maxSuggestions);

                context.report({
                    node,
                    messageId: 'preferToken',
                    data: { value: firstToken, candidates: candidates.join(', ') },
                });
            },
        };
    },
};

export default cssPreferDesignTokenRule;
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter eslint-plugin-vapor exec vitest run src/rules/css/prefer-design-token.test.ts`
Expected: PASS — 4 cases.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/rules/css/prefer-design-token.ts packages/eslint-plugin-vapor/src/rules/css/prefer-design-token.test.ts
git commit -m "feat(eslint-plugin-vapor): add css/prefer-design-token rule"
```

---

## Task 15: 플러그인 등록 + recommended preset

**Files:**
- Modify: `packages/eslint-plugin-vapor/src/index.ts`

**Interfaces:**
- Consumes: 모든 룰 모듈.
- Produces: `default export` 가 `rules` 에 신규 4개 포함. `configs.recommended` (JS) 갱신. `configs.cssRecommended` 추가.

- [ ] **Step 1: 기존 index.ts 백업 읽기**

Run: `cat packages/eslint-plugin-vapor/src/index.ts` (Read tool)
Expected: 기존 4개 룰 등록 + recommended export 확인.

- [ ] **Step 2: index.ts 교체**

Create/Replace `packages/eslint-plugin-vapor/src/index.ts`:

```ts
import type { Rule } from 'eslint';

import altTextOnAvatarRule from './rules/alt-text-on-avatar';
import ariaLabelOnIconButtonRule from './rules/aria-label-on-icon-button';
import ariaLabelOnNavigationRule from './rules/aria-label-on-navigation';
import cssNoInvalidDesignTokenRule from './rules/css/no-invalid-design-token';
import cssPreferDesignTokenRule from './rules/css/prefer-design-token';
import noInvalidDesignTokenRule from './rules/no-invalid-design-token';
import preferDesignTokenRule from './rules/prefer-design-token';
import shouldHaveTitleOnDialogRule from './rules/should-have-title-on-dialog';

const rules = {
    'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
    'navigation-has-aria-label': ariaLabelOnNavigationRule,
    'avatar-has-alt-text': altTextOnAvatarRule,
    'dialog-should-have-title': shouldHaveTitleOnDialogRule,
    'no-invalid-design-token': noInvalidDesignTokenRule,
    'prefer-design-token': preferDesignTokenRule,
    'css/no-invalid-design-token': cssNoInvalidDesignTokenRule as unknown as Rule.RuleModule,
    'css/prefer-design-token': cssPreferDesignTokenRule as unknown as Rule.RuleModule,
} satisfies Record<string, Rule.RuleModule>;

const JS_RULE_KEYS = [
    'icon-button-has-aria-label',
    'navigation-has-aria-label',
    'avatar-has-alt-text',
    'dialog-should-have-title',
    'no-invalid-design-token',
];

const recommended = Object.fromEntries(
    JS_RULE_KEYS.map((k) => [`vapor/${k}`, 'error' as const]),
);
recommended['vapor/prefer-design-token'] = 'warn';

const cssRecommended = {
    'vapor/css/no-invalid-design-token': 'error' as const,
    'vapor/css/prefer-design-token': 'warn' as const,
};

const plugin = {
    meta: {
        name: 'eslint-plugin-vapor',
        version: '0.1.0',
    },
    rules,
    configs: {
        recommended,
        cssRecommended,
    },
};

export default plugin;
```

- [ ] **Step 3: 빌드 검증**

Run: `pnpm --filter eslint-plugin-vapor build`
Expected: dist/index.cjs + dist/index.mjs + dist/index.d.ts 생성. 에러 없음.

- [ ] **Step 4: 타입체크**

Run: `pnpm --filter eslint-plugin-vapor typecheck`
Expected: 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add packages/eslint-plugin-vapor/src/index.ts
git commit -m "feat(eslint-plugin-vapor): register token rules + cssRecommended preset"
```

---

## Task 16: README + changeset

**Files:**
- Modify: `packages/eslint-plugin-vapor/README.md`
- Create: `.changeset/eslint-plugin-vapor-token-rules.md`

**Interfaces:** 문서만.

- [ ] **Step 1: README 갱신**

`packages/eslint-plugin-vapor/README.md` 의 `## License` 직전에 다음 섹션 추가:

````markdown
## Rules

### A11y

- `vapor/icon-button-has-aria-label`
- `vapor/navigation-has-aria-label`
- `vapor/avatar-has-alt-text`
- `vapor/dialog-should-have-title`

### Design tokens (JS/TS/JSX)

- `vapor/no-invalid-design-token` — Detects typos and unknown `--vapor-*` tokens; suggests near matches.
- `vapor/prefer-design-token` — Suggests a design token when a raw CSS value (px, hex, etc.) maps 1:1 to a known token.

### Design tokens (CSS, requires `@eslint/css`)

- `vapor/css/no-invalid-design-token`
- `vapor/css/prefer-design-token`

## Custom tokens

If your project defines its own `--vapor-*` CSS variables (e.g. in `:root`), declare them in shared settings so the plugin treats them as valid:

```js
// eslint.config.js
import vapor from 'eslint-plugin-vapor';

export default [
    {
        plugins: { vapor },
        settings: {
            vapor: {
                customTokens: [
                    '--vapor-app-sidebar-width',
                    '--vapor-app-brand-*', // glob 허용
                ],
            },
        },
        rules: { ...vapor.configs.recommended },
    },
];
```

You can also pass `allowCustomTokens` per rule via options for narrower overrides.

## CSS file linting

The CSS rules require `@eslint/css`:

```js
// eslint.config.js
import css from '@eslint/css';
import vapor from 'eslint-plugin-vapor';

export default [
    {
        files: ['**/*.css'],
        plugins: { css, vapor },
        language: 'css/css',
        rules: { ...vapor.configs.cssRecommended },
    },
];
```

## Token catalog

Tokens are extracted at build time from `skills/token-lint/assets` and embedded in the plugin. Updating tokens upstream and rebuilding the plugin propagates them automatically.

````

- [ ] **Step 2: changeset 작성**

Create `.changeset/eslint-plugin-vapor-token-rules.md`:

```markdown
---
'eslint-plugin-vapor': minor
---

Add design token rules: `no-invalid-design-token`, `prefer-design-token`, plus CSS variants (`css/no-invalid-design-token`, `css/prefer-design-token`) when used with `@eslint/css`. Custom tokens can be registered via `settings.vapor.customTokens` or per-rule `allowCustomTokens`.
```

- [ ] **Step 3: Commit**

```bash
git add packages/eslint-plugin-vapor/README.md .changeset/eslint-plugin-vapor-token-rules.md
git commit -m "docs(eslint-plugin-vapor): document token rules + changeset"
```

---

## Task 17: 전체 검증

**Files:** 없음 (검증만).

**Interfaces:** 없음.

- [ ] **Step 1: 패키지 lint**

Run: `pnpm --filter eslint-plugin-vapor lint`
Expected: PASS.

- [ ] **Step 2: 패키지 typecheck**

Run: `pnpm --filter eslint-plugin-vapor typecheck`
Expected: PASS.

- [ ] **Step 3: 패키지 테스트**

Run: `pnpm --filter eslint-plugin-vapor test`
Expected: 모든 vitest suite PASS (Task 5~14 의 모든 케이스). 추출 스크립트의 node:test 도 별도로:
Run: `node --test packages/eslint-plugin-vapor/scripts/extract-tokens.test.mjs`
Expected: 6 tests pass.

- [ ] **Step 4: 패키지 빌드**

Run: `pnpm --filter eslint-plugin-vapor build`
Expected: dist 결과물 생성, 에러 없음.

- [ ] **Step 5: 모노레포 영향 확인 (선택)**

Run: `pnpm -w lint && pnpm -w typecheck`
Expected: PASS. 실패 시 영향받는 패키지 확인 후 수정.

- [ ] **Step 6: Commit (없을 시 skip)**

검증 중 자잘한 수정이 있었다면 그것만 별도 커밋. 검증만이라면 commit 생략.
