# figma-token-review-plugin: 결정론/LLM 책임 분리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** plugin이 모든 결정론 분석·대안 추천을 담당하고 LLM은 텍스트 위계 + semantic color 의미 적합성만 판정. 검사 범위를 6 카테고리(color, space, dimension, typography, borderRadius, shadow)로 확장.

**Architecture:** plugin은 자체 token schema 사본(`common/tokens/`)을 사용해 결정론 평가/추천을 모두 한다. LLM은 의미 판정 대상 노드 + rubric 서브셋만 받아 `heuristic` 위반 목록을 낸다. 두 결과는 합성기에서 카테고리별 `EvaluateOutput`으로 합쳐져 단일 `ScanPayload`가 UI에 전달된다.

**Tech Stack:** TypeScript, React 19, Vite 6, Vitest, Figma Plugin API, vapor token schema (skill assets 수동 복사).

## Global Constraints

- skill (`skills/figma-token-review`)의 어떤 파일도 본 작업으로 수정하지 않는다. assets / scripts / SKILL.md / references 전부 무수정.
- `token-lint` skill도 무수정. asset만 수동 복사.
- 모든 신규 파일/식별자는 kebab-case 파일명, camelCase 변수, PascalCase 타입.
- 모든 LLM 출력의 자연어는 Korean. 토큰 키는 영문 그대로.
- 적합률(`conformanceRate`) 카운트: 부적합 = `severity === 'high' && (!heuristic || confidence === 'HIGH')`. 그 외 high (heuristic + confidence ≠ HIGH)는 `infoFlags`로만.
- `EvaluateOutput.conformant`는 결정론 통과 항목만. LLM PASS는 어디에도 기록하지 않는다(MVP).
- 모든 결정론 위반은 `suggested[]`를 plugin이 채운다. 후보 없으면 `[]`. LLM은 자기 영역(typography / semanticColor)에서만 추천.

---

## File Structure

신규 또는 수정되는 모든 파일:

```
apps/figma-token-review-plugin/
├── package.json                        # 수정: vitest devDep + test script
├── vitest.config.ts                    # 신규
├── src/
│   ├── common/
│   │   ├── schemas.ts                  # 수정: ScanPayload 6 카테고리, Violation 확장
│   │   └── tokens/                     # 신규 디렉토리
│   │       ├── MANIFEST.json           # 신규: source SHA 기록
│   │       ├── semantic-color.light.json     # 신규(skill 복사)
│   │       ├── semantic-color.dark.json      # 신규(skill 복사)
│   │       ├── primitive-color.light.json    # 신규(skill 복사)
│   │       ├── primitive-color.dark.json     # 신규(skill 복사)
│   │       ├── text-style.json               # 신규(skill 복사)
│   │       ├── typography.json               # 신규(skill 복사)
│   │       ├── space.json                    # 신규(token-lint 복사)
│   │       ├── dimension.json                # 신규(token-lint 복사)
│   │       ├── border-radius.json            # 신규(token-lint 복사)
│   │       └── shadow.json                   # 신규(token-lint 복사)
│   ├── plugin/handlers/extract.ts      # 수정: space/dim/radius/shadow 추출 추가
│   └── ui/
│       ├── lib/                        # 신규 디렉토리
│       │   ├── scope.ts                # 신규: PROPERTY_SCOPE SSOT
│       │   ├── loaders/                # 신규: token JSON → flattened lookup
│       │   │   ├── color.ts
│       │   │   ├── dimension.ts        # space, dimension, borderRadius, shadow 공용
│       │   │   └── typography.ts
│       │   ├── evaluate/               # 신규: 카테고리별 결정론 평가
│       │   │   ├── color.ts
│       │   │   ├── space.ts
│       │   │   ├── dimension.ts
│       │   │   ├── typography.ts
│       │   │   ├── radius.ts
│       │   │   └── shadow.ts
│       │   ├── recommend.ts            # 신규: 통합 대안 추천 규칙
│       │   └── rubric.ts               # 신규: LLM 입력용 rubric 서브셋 생성
│       ├── features/llm/
│       │   ├── prompt.ts               # 수정: skill embed 제거, 의미 판정 전용 prompt + 새 입력 스키마
│       │   ├── parse.ts                # 수정: LLM 응답 → heuristic violations 변환
│       │   ├── merge.ts                # 신규: deterministic + heuristic → ScanPayload 합성
│       │   ├── client.ts               # 수정: skills 필드 제거 (이미 적용됨)
│       │   └── index.ts                # 수정: runLlmEvaluation flow 갱신
│       └── pages/scan-result.tsx       # 수정: 6 카테고리 탭, heuristic 배지
├── tests/                              # 신규
│   ├── lib/
│   │   ├── scope.test.ts
│   │   ├── loaders/*.test.ts
│   │   ├── evaluate/*.test.ts
│   │   ├── recommend.test.ts
│   │   └── rubric.test.ts
│   ├── features/llm/
│   │   ├── parse.test.ts
│   │   └── merge.test.ts
│   └── fixtures/
│       ├── extract-color.json
│       ├── extract-space.json
│       ├── extract-typography.json
│       └── ...
└── vite.config.ui.ts                   # 수정: `@skill` alias 제거 (이미 사용자 revert함)
```

Task 의존성: T1 → T2 → T3..T8 (각 evaluator 병렬 가능) → T9 → T10 → T11 → T12 → T13.

각 task = 한 commit. test가 함께 들어간 self-contained PR 단위.

---

## Task 1: Foundation (vitest, token schema 사본, 도메인 타입 확장, scope.ts)

**Files:**
- Create: `apps/figma-token-review-plugin/vitest.config.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/scope.test.ts`
- Create: `apps/figma-token-review-plugin/src/common/tokens/MANIFEST.json`
- Create: `apps/figma-token-review-plugin/src/common/tokens/*.json` (10개 — skill / token-lint asset 수동 복사)
- Create: `apps/figma-token-review-plugin/src/ui/lib/scope.ts`
- Modify: `apps/figma-token-review-plugin/src/common/schemas.ts`
- Modify: `apps/figma-token-review-plugin/package.json` (vitest devDep + scripts)

**Interfaces:**
- Consumes: (없음 — 첫 task)
- Produces:
  - `Property` (union of 'fill' | 'fill-on-text' | 'stroke' | 'padding' | 'gap' | 'width' | 'height' | 'borderRadius' | 'shadow' | 'textStyle')
  - `Role` (union of 'background' | 'foreground' | 'border' | 'space' | 'dimension' | 'borderRadius' | 'shadow')
  - `PROPERTY_SCOPE: Record<Property, ReadonlyArray<Role>>` from `~/ui/lib/scope`
  - `ViolationType` 확장 ('primitive-used' 추가) — `~/common/schemas`
  - `Violation` 확장 (heuristic, confidence, reasoning, property, value 필드) — `~/common/schemas`
  - `Severity = 'high' | 'info'`, `Confidence = 'HIGH' | 'MED' | 'LOW'` — `~/common/schemas`
  - `Category = 'color' | 'space' | 'dimension' | 'typography' | 'borderRadius' | 'shadow'`
  - `EvaluateOutput`, `ScanPayload` 확장 — `~/common/schemas`

- [ ] **Step 1: vitest 추가 + script**

`apps/figma-token-review-plugin/package.json`을 수정. `scripts`에 `"test": "vitest run"`과 `"test:watch": "vitest"` 추가. `devDependencies`에 `"vitest": "^3.0.0"`, `"@vitest/coverage-v8": "^3.0.0"` 추가. 그 후 `pnpm install` 실행.

```bash
cd apps/figma-token-review-plugin
# package.json 직접 편집 (Edit tool)
pnpm install
```

- [ ] **Step 2: vitest.config.ts**

```ts
// apps/figma-token-review-plugin/vitest.config.ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        globals: true,
    },
});
```

- [ ] **Step 3: token JSON 수동 복사**

`skills/figma-token-review/assets/`의 6 파일을 `src/common/tokens/`로 복사:
- semantic-color.light.json, semantic-color.dark.json
- primitive-color.light.json, primitive-color.dark.json
- text-style.json, typography.json

`skills/token-lint/assets/`의 4 파일을 `src/common/tokens/`로 복사:
- space.json, dimension.json, border-radius.json, shadow.json

```bash
mkdir -p apps/figma-token-review-plugin/src/common/tokens
cp skills/figma-token-review/assets/{semantic-color.light,semantic-color.dark,primitive-color.light,primitive-color.dark,text-style,typography}.json apps/figma-token-review-plugin/src/common/tokens/
cp skills/token-lint/assets/{space,dimension,border-radius,shadow}.json apps/figma-token-review-plugin/src/common/tokens/
```

- [ ] **Step 4: MANIFEST.json (source SHA 기록)**

복사한 source 파일의 SHA-256 hash를 기록해 drift 검출용으로 둔다.

```bash
cd /Users/goorm/01_works/vapor
node -e '
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const sources = [
  ["skills/figma-token-review/assets/semantic-color.light.json", "semantic-color.light.json"],
  ["skills/figma-token-review/assets/semantic-color.dark.json", "semantic-color.dark.json"],
  ["skills/figma-token-review/assets/primitive-color.light.json", "primitive-color.light.json"],
  ["skills/figma-token-review/assets/primitive-color.dark.json", "primitive-color.dark.json"],
  ["skills/figma-token-review/assets/text-style.json", "text-style.json"],
  ["skills/figma-token-review/assets/typography.json", "typography.json"],
  ["skills/token-lint/assets/space.json", "space.json"],
  ["skills/token-lint/assets/dimension.json", "dimension.json"],
  ["skills/token-lint/assets/border-radius.json", "border-radius.json"],
  ["skills/token-lint/assets/shadow.json", "shadow.json"],
];
const manifest = { generatedAt: "2026-06-30", entries: {} };
for (const [src, file] of sources) {
  const buf = fs.readFileSync(src);
  manifest.entries[file] = { source: src, sha256: crypto.createHash("sha256").update(buf).digest("hex") };
}
fs.writeFileSync("apps/figma-token-review-plugin/src/common/tokens/MANIFEST.json", JSON.stringify(manifest, null, 2));
'
```

- [ ] **Step 5: 도메인 타입 확장 (schemas.ts) — 실패 테스트 먼저**

`tests/lib/scope.test.ts` 생성:

```ts
// apps/figma-token-review-plugin/tests/lib/scope.test.ts
import { describe, expect, it } from 'vitest';

import { PROPERTY_SCOPE } from '~/ui/lib/scope';
import type { Property, Role } from '~/common/schemas';

describe('PROPERTY_SCOPE', () => {
    it('fill 은 background role 만 허용한다', () => {
        expect(PROPERTY_SCOPE.fill).toEqual(['background']);
    });

    it('fill-on-text 는 foreground role 만 허용한다', () => {
        expect(PROPERTY_SCOPE['fill-on-text']).toEqual(['foreground']);
    });

    it('stroke 는 border, foreground 둘 다 허용한다', () => {
        expect(PROPERTY_SCOPE.stroke).toEqual(['border', 'foreground']);
    });

    it('padding 과 gap 은 space role', () => {
        expect(PROPERTY_SCOPE.padding).toEqual(['space']);
        expect(PROPERTY_SCOPE.gap).toEqual(['space']);
    });

    it('width 와 height 는 dimension role', () => {
        expect(PROPERTY_SCOPE.width).toEqual(['dimension']);
        expect(PROPERTY_SCOPE.height).toEqual(['dimension']);
    });

    it('borderRadius / shadow 는 동명 role', () => {
        expect(PROPERTY_SCOPE.borderRadius).toEqual(['borderRadius']);
        expect(PROPERTY_SCOPE.shadow).toEqual(['shadow']);
    });

    it('typography Property 는 매핑이 없다 (결정론 결과 별도 정책)', () => {
        const map = PROPERTY_SCOPE as Record<Property, ReadonlyArray<Role>>;
        expect(map.textStyle).toBeUndefined();
    });
});
```

Run `pnpm --filter figma-token-review-plugin test -- scope` → FAIL (`Cannot find module '~/ui/lib/scope'`).

- [ ] **Step 6: schemas.ts 확장**

`src/common/schemas.ts`의 끝에 다음을 추가 (기존 export는 유지하되 `ViolationType`/`Violation`/`EvaluateOutput`/`ScanPayload`는 새 정의로 교체):

```ts
export type Severity = 'high' | 'info';
export type Confidence = 'HIGH' | 'MED' | 'LOW';

export type Property =
    | 'fill'
    | 'fill-on-text'
    | 'stroke'
    | 'padding'
    | 'gap'
    | 'width'
    | 'height'
    | 'borderRadius'
    | 'shadow'
    | 'textStyle';

export type Role =
    | 'background'
    | 'foreground'
    | 'border'
    | 'space'
    | 'dimension'
    | 'borderRadius'
    | 'shadow';

export type Category =
    | 'color'
    | 'space'
    | 'dimension'
    | 'typography'
    | 'borderRadius'
    | 'shadow';

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
    | 'semantic-misfit'    // heuristic: LLM 의미 판정 FAIL (color)
    | 'typo-hierarchy';    // heuristic: LLM 텍스트 위계 FAIL

export type Violation = {
    nodeId: string;
    nodeIds?: string[];
    count?: number;
    name: string;
    property: Property;
    token: string | null;
    value: string | null;
    type: ViolationType;
    severity: Severity;
    detail: string;
    suggested: string[];
    heuristic?: true;
    confidence?: Confidence;
    reasoning?: string;
};

export type Conformant = {
    nodeId: string;
    nodeIds?: string[];
    name: string;
    property: Property;
    token: string;
};

export type EvaluateSummary = {
    total: number;
    conformCount: number;
    conformanceRate: number | null;
    highViolations: number;
    infoFlags: number;
    heuristicViolations: number;
};

export type EvaluateOutput = {
    violations: Violation[];
    conformant: Conformant[];
    summary: EvaluateSummary;
};

export type ScanPayload = {
    color: EvaluateOutput;
    space: EvaluateOutput;
    dimension: EvaluateOutput;
    typography: EvaluateOutput;
    borderRadius: EvaluateOutput;
    shadow: EvaluateOutput;
};

export type SpaceUsage = {
    nodeId: string;
    name: string;
    property: 'padding' | 'gap';
    value: string;
    token: string | null;
    tokenStatus: TokenStatus;
};

export type DimensionUsage = {
    nodeId: string;
    name: string;
    property: 'width' | 'height';
    value: string;
    token: string | null;
    tokenStatus: TokenStatus;
};

export type RadiusUsage = {
    nodeId: string;
    name: string;
    value: string;
    token: string | null;
    tokenStatus: TokenStatus;
};

export type ShadowUsage = {
    nodeId: string;
    name: string;
    value: string;
    token: string | null;
    tokenStatus: TokenStatus;
};
```

기존 `RawExtract` 타입을 확장:

```ts
export type RawExtract = {
    schemaMode: SchemaMode;
    viewport: Viewport;
    colors: ColorUsage[];
    typography: TypographyUsage[];
    spaces: SpaceUsage[];
    dimensions: DimensionUsage[];
    radii: RadiusUsage[];
    shadows: ShadowUsage[];
    stats: RawExtractStats;
};
```

기존 `RawExtractStats`에는 추가 정보 없음(기존 그대로).

- [ ] **Step 7: scope.ts 생성**

```ts
// apps/figma-token-review-plugin/src/ui/lib/scope.ts
import type { Property, Role } from '~/common/schemas';

export const PROPERTY_SCOPE: Record<Exclude<Property, 'textStyle'>, ReadonlyArray<Role>> = {
    fill: ['background'],
    'fill-on-text': ['foreground'],
    stroke: ['border', 'foreground'],
    padding: ['space'],
    gap: ['space'],
    width: ['dimension'],
    height: ['dimension'],
    borderRadius: ['borderRadius'],
    shadow: ['shadow'],
} as const;
```

- [ ] **Step 8: Test → PASS 확인**

```bash
pnpm --filter figma-token-review-plugin test -- scope
```

Expected: PASS

- [ ] **Step 9: typecheck**

```bash
pnpm --filter figma-token-review-plugin typecheck
```

Expected: 새 타입 사용처(기존 `prompt.ts`/`parse.ts`/`scan-result.tsx` 등)에서 type error 발생 가능. 컴파일러가 잡는 break point는 후속 task에서 해당 file 수정 시 모두 fix하므로, 우선 schemas.ts/scope.ts/tests 자체만 통과하면 OK. 잘못 전역 가드된 임시 코드가 있으면 본 step에서 잡고 fix.

본 step에서 손쉽게 고칠 수 있는 break(예: 기존 `Violation`에 `property` 필드 부재로 인한 명시적 객체 리터럴 mismatch)는 임시로 `as Violation`이 아니라 정확히 필드를 채워준다. 큰 변경(prompt.ts 재작성 등)은 본 task 범위 밖.

- [ ] **Step 10: Commit**

```bash
git add apps/figma-token-review-plugin/package.json \
        apps/figma-token-review-plugin/vitest.config.ts \
        apps/figma-token-review-plugin/src/common/schemas.ts \
        apps/figma-token-review-plugin/src/common/tokens/ \
        apps/figma-token-review-plugin/src/ui/lib/scope.ts \
        apps/figma-token-review-plugin/tests/lib/scope.test.ts \
        pnpm-lock.yaml
git commit -m "feat(figma-token-review-plugin): foundation for deterministic/LLM split

Vitest 도입, vapor token schema 사본을 src/common/tokens/에 두고
MANIFEST.json으로 source SHA를 기록한다. 도메인 타입을 6 카테고리
ScanPayload + heuristic violation으로 확장하고 PROPERTY_SCOPE SSOT를
src/ui/lib/scope.ts에 둔다."
```

---

## Task 2: Token loaders (flatten + lookup index)

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/loaders/color.ts`
- Create: `apps/figma-token-review-plugin/src/ui/lib/loaders/dimension.ts`
- Create: `apps/figma-token-review-plugin/src/ui/lib/loaders/typography.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/loaders/color.test.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/loaders/dimension.test.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/loaders/typography.test.ts`

**Interfaces:**
- Consumes: `Role`, `SchemaMode`, `Severity` from `~/common/schemas`. JSON files from `~/common/tokens/`.
- Produces:
  - `loadColorSchema(mode: SchemaMode): ColorSchema`
    - `ColorSchema = { mode: SchemaMode; semantic: Record<string, SemanticTokenMeta>; primitive: Record<string, string>; tokenKeys: string[]; hexIndex: Map<string, string[]> }`
    - `SemanticTokenMeta = { role: Role | null; status: string | null; valueRef: string | null; when: string[]; avoid: string[]; description: string | null; gradeRule: GradeRule | null }`
    - `GradeRule = { other: '100' | '200' | 'ambiguous' | null }`
  - `loadDimensionSchemas(): DimensionSchemas`
    - `DimensionSchemas = { space: TokenValueIndex; dimension: TokenValueIndex; borderRadius: TokenValueIndex; shadow: TokenValueIndex }`
    - `TokenValueIndex = { tokens: Record<string, string>; valueToTokens: Map<string, string[]> }`
  - `loadTextStyleSchema(): TextStyleSchema`
    - `TextStyleSchema = { order: string[]; styles: Record<string, { rank: number; when: string[]; avoid: string[]; description: string | null }> }`

- [ ] **Step 1: 실패 테스트 — color loader**

```ts
// tests/lib/loaders/color.test.ts
import { describe, expect, it } from 'vitest';

import { loadColorSchema } from '~/ui/lib/loaders/color';

describe('loadColorSchema(light)', () => {
    const schema = loadColorSchema('light');

    it('semantic 토큰을 평탄화한 키를 가진다', () => {
        expect(schema.tokenKeys.length).toBeGreaterThan(0);
        expect(schema.tokenKeys[0]).toMatch(/^colors\./);
    });

    it('각 토큰 메타에 when, avoid 배열을 포함한다', () => {
        const sample = schema.semantic[schema.tokenKeys[0]];
        expect(Array.isArray(sample.when)).toBe(true);
        expect(Array.isArray(sample.avoid)).toBe(true);
    });

    it('hex index로 같은 색을 가진 모든 semantic 토큰을 역참조할 수 있다', () => {
        for (const [hex, tokens] of schema.hexIndex.entries()) {
            expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
            expect(tokens.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('foreground 그룹의 leaf 토큰은 gradeRule을 상속한다', () => {
        const fg100 = schema.semantic['colors.foreground.normal.100'];
        expect(fg100?.gradeRule).toBeTruthy();
    });
});
```

Run: `pnpm --filter figma-token-review-plugin test -- color` → FAIL (모듈 없음).

- [ ] **Step 2: color loader 구현**

```ts
// src/ui/lib/loaders/color.ts
import primitiveDark from '~/common/tokens/primitive-color.dark.json';
import primitiveLight from '~/common/tokens/primitive-color.light.json';
import semanticDark from '~/common/tokens/semantic-color.dark.json';
import semanticLight from '~/common/tokens/semantic-color.light.json';
import type { Role, SchemaMode } from '~/common/schemas';

const NS = 'io.goorm.vapor';

export type GradeRule = { other: '100' | '200' | 'ambiguous' | null };

export type SemanticTokenMeta = {
    role: Role | null;
    status: string | null;
    valueRef: string | null;
    hex: string | null;
    when: string[];
    avoid: string[];
    description: string | null;
    gradeRule: GradeRule | null;
};

export type ColorSchema = {
    mode: SchemaMode;
    semantic: Record<string, SemanticTokenMeta>;
    primitive: Record<string, string>;
    tokenKeys: string[];
    hexIndex: Map<string, string[]>;
};

type Node = {
    $description?: string;
    $value?: string;
    $extensions?: { [NS]?: Record<string, unknown> };
    [k: string]: unknown;
};

function vaporMeta(node: Node): Record<string, unknown> {
    return (node?.$extensions?.[NS] ?? {}) as Record<string, unknown>;
}

function flattenPrimitive(root: { colors?: Node }): Record<string, string> {
    const out: Record<string, string> = {};
    const walk = (node: Node, path: string) => {
        if (!node || typeof node !== 'object') return;
        if ('$value' in node && typeof node.$value === 'string') {
            out[path] = node.$value;
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v as Node, path ? `${path}.${k}` : k);
        }
    };
    if (root.colors) walk(root.colors, 'colors');
    return out;
}

function resolveAlias(valueRef: string | null, primitive: Record<string, string>): string | null {
    if (!valueRef) return null;
    const m = valueRef.match(/^\{(.+)\}$/);
    if (!m) return /^#[0-9a-f]{3,8}$/i.test(valueRef) ? valueRef : null;
    return primitive[m[1]] ?? null;
}

function asRole(value: unknown): Role | null {
    const valid: Role[] = ['background', 'foreground', 'border', 'space', 'dimension', 'borderRadius', 'shadow'];
    return typeof value === 'string' && (valid as string[]).includes(value) ? (value as Role) : null;
}

function flattenSemantic(root: { colors?: Node }, primitive: Record<string, string>): {
    semantic: Record<string, SemanticTokenMeta>;
    tokenKeys: string[];
    hexIndex: Map<string, string[]>;
} {
    const out: Record<string, SemanticTokenMeta> = {};
    const hexIndex = new Map<string, string[]>();

    const walk = (node: Node, path: string, inheritedGradeRules: Record<string, string> | null) => {
        const meta = vaporMeta(node);
        const gradeRules = (meta.gradeRules as Record<string, string> | undefined) ?? inheritedGradeRules;
        if ('$value' in node && typeof node.$value === 'string') {
            const grade = path.split('.').pop() ?? '';
            const valueRef = node.$value;
            const hex = resolveAlias(valueRef, primitive);
            const gradeRuleOther = (gradeRules?.[grade] as '100' | '200' | 'ambiguous' | undefined) ?? null;
            out[path] = {
                role: asRole((meta.accessibility as { role?: unknown })?.role),
                status: typeof meta.status === 'string' ? meta.status : null,
                valueRef,
                hex,
                when: Array.isArray(meta.when) ? (meta.when as string[]) : [],
                avoid: Array.isArray(meta.avoid) ? (meta.avoid as string[]) : [],
                description: typeof node.$description === 'string' ? node.$description : null,
                gradeRule: gradeRuleOther ? { other: gradeRuleOther } : null,
            };
            if (hex) {
                const arr = hexIndex.get(hex.toLowerCase()) ?? [];
                arr.push(path);
                hexIndex.set(hex.toLowerCase(), arr);
            }
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v as Node, path ? `${path}.${k}` : k, gradeRules ?? null);
        }
    };
    if (root.colors) walk(root.colors, 'colors', null);
    return { semantic: out, tokenKeys: Object.keys(out), hexIndex };
}

export function loadColorSchema(mode: SchemaMode): ColorSchema {
    const semanticRaw = mode === 'dark' ? semanticDark : semanticLight;
    const primitiveRaw = mode === 'dark' ? primitiveDark : primitiveLight;
    const primitive = flattenPrimitive(primitiveRaw as { colors?: Node });
    const { semantic, tokenKeys, hexIndex } = flattenSemantic(semanticRaw as { colors?: Node }, primitive);
    return { mode, semantic, primitive, tokenKeys, hexIndex };
}
```

Run: `pnpm --filter figma-token-review-plugin test -- color` → PASS.

- [ ] **Step 3: 실패 테스트 — dimension loader**

```ts
// tests/lib/loaders/dimension.test.ts
import { describe, expect, it } from 'vitest';

import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';

describe('loadDimensionSchemas', () => {
    const schemas = loadDimensionSchemas();

    it('space tokens 의 valueToTokens 인덱스가 빈 배열을 만들지 않는다', () => {
        for (const [value, tokens] of schemas.space.valueToTokens.entries()) {
            expect(value).toMatch(/^[\d.]+(px|rem|%)?$/);
            expect(tokens.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('dimension, borderRadius, shadow 모두 동일한 인터페이스를 갖는다', () => {
        for (const key of ['space', 'dimension', 'borderRadius', 'shadow'] as const) {
            expect(schemas[key].tokens).toBeTypeOf('object');
            expect(schemas[key].valueToTokens).toBeInstanceOf(Map);
        }
    });
});
```

Run: FAIL.

- [ ] **Step 4: dimension loader 구현**

```ts
// src/ui/lib/loaders/dimension.ts
import borderRadiusRaw from '~/common/tokens/border-radius.json';
import dimensionRaw from '~/common/tokens/dimension.json';
import shadowRaw from '~/common/tokens/shadow.json';
import spaceRaw from '~/common/tokens/space.json';

export type TokenValueIndex = {
    tokens: Record<string, string>;
    valueToTokens: Map<string, string[]>;
};

export type DimensionSchemas = {
    space: TokenValueIndex;
    dimension: TokenValueIndex;
    borderRadius: TokenValueIndex;
    shadow: TokenValueIndex;
};

type Node = { $value?: string | object; [k: string]: unknown };

function flatten(root: unknown, rootKey: string): TokenValueIndex {
    const tokens: Record<string, string> = {};
    const valueToTokens = new Map<string, string[]>();

    const stringify = (v: string | object): string => {
        if (typeof v === 'string') return v;
        return JSON.stringify(v);
    };

    const walk = (node: Node, path: string) => {
        if (!node || typeof node !== 'object') return;
        if ('$value' in node && node.$value !== undefined) {
            const value = stringify(node.$value);
            tokens[path] = value;
            const arr = valueToTokens.get(value) ?? [];
            arr.push(path);
            valueToTokens.set(value, arr);
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v as Node, path ? `${path}.${k}` : k);
        }
    };

    const r = (root as Record<string, unknown>)[rootKey] as Node | undefined;
    if (r) walk(r, rootKey);
    return { tokens, valueToTokens };
}

export function loadDimensionSchemas(): DimensionSchemas {
    return {
        space: flatten(spaceRaw, 'space'),
        dimension: flatten(dimensionRaw, 'dimension'),
        borderRadius: flatten(borderRadiusRaw, 'borderRadius'),
        shadow: flatten(shadowRaw, 'shadow'),
    };
}
```

> **참고**: 실제 `space.json` 구조 확인은 source 파일을 읽어 `rootKey`(예: `'space'` 또는 `'spaces'`)를 정확히 맞춘다. 잘못된 rootKey면 `tokens`가 빈 객체가 되어 테스트가 fail로 잡힌다.

Run: PASS.

- [ ] **Step 5: 실패 테스트 — typography loader**

```ts
// tests/lib/loaders/typography.test.ts
import { describe, expect, it } from 'vitest';

import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';

describe('loadTextStyleSchema', () => {
    const schema = loadTextStyleSchema();

    it('order는 위계 큰 것부터 작은 것 순서를 유지한다 (display1 → ... → body4)', () => {
        expect(schema.order.indexOf('display1')).toBeLessThan(schema.order.indexOf('body4'));
    });

    it('각 스타일은 rank 인덱스를 갖는다', () => {
        for (const [name, meta] of Object.entries(schema.styles)) {
            expect(meta.rank).toBe(schema.order.indexOf(name));
        }
    });
});
```

Run: FAIL.

- [ ] **Step 6: typography loader 구현**

```ts
// src/ui/lib/loaders/typography.ts
import textStyleRaw from '~/common/tokens/text-style.json';

const NS = 'io.goorm.vapor';

export type TextStyleMeta = {
    rank: number;
    when: string[];
    avoid: string[];
    description: string | null;
};

export type TextStyleSchema = {
    order: string[];
    styles: Record<string, TextStyleMeta>;
};

type Node = { $description?: string; $extensions?: { [NS]?: Record<string, unknown> } };

export function loadTextStyleSchema(): TextStyleSchema {
    const root = textStyleRaw as { textStyle?: Record<string, Node | unknown> };
    const order: string[] = [];
    const styles: Record<string, TextStyleMeta> = {};
    const entries = Object.entries(root.textStyle ?? {});
    for (const [name, node] of entries) {
        if (name.startsWith('$') || typeof node !== 'object' || !node) continue;
        const meta = ((node as Node).$extensions?.[NS] ?? {}) as Record<string, unknown>;
        styles[name] = {
            rank: order.length,
            when: Array.isArray(meta.when) ? (meta.when as string[]) : [],
            avoid: Array.isArray(meta.avoid) ? (meta.avoid as string[]) : [],
            description: typeof (node as Node).$description === 'string' ? (node as Node).$description ?? null : null,
        };
        order.push(name);
    }
    return { order, styles };
}
```

Run: PASS.

- [ ] **Step 7: 전체 typecheck + test**

```bash
pnpm --filter figma-token-review-plugin typecheck
pnpm --filter figma-token-review-plugin test
```

- [ ] **Step 8: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/lib/loaders/ apps/figma-token-review-plugin/tests/lib/loaders/
git commit -m "feat(figma-token-review-plugin): add token schema loaders

color/dimension/typography loader를 추가해 src/common/tokens/의 JSON을
hex index, valueToTokens 인덱스, rank 부여된 textStyle order로 평탄화한다."
```

---

## Task 3: Color 결정론 evaluator

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/evaluate/color.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/evaluate/color.test.ts`

**Interfaces:**
- Consumes: `ColorSchema` from `~/ui/lib/loaders/color`, `PROPERTY_SCOPE` from `~/ui/lib/scope`, `ColorUsage`, `Violation`, `Conformant` from `~/common/schemas`.
- Produces:
  - `evaluateColor(usages: ColorUsage[], schema: ColorSchema): { violations: Violation[]; conformant: Conformant[] }`

- [ ] **Step 1: 실패 테스트**

```ts
// tests/lib/evaluate/color.test.ts
import { describe, expect, it } from 'vitest';

import { loadColorSchema } from '~/ui/lib/loaders/color';
import { evaluateColor } from '~/ui/lib/evaluate/color';
import type { ColorUsage } from '~/common/schemas';

const schema = loadColorSchema('light');

function usage(partial: Partial<ColorUsage>): ColorUsage {
    return {
        nodeId: 'n',
        name: 'sample',
        property: 'fill',
        token: null,
        hex: null,
        tokenStatus: 'ok',
        background: null,
        ...partial,
    };
}

describe('evaluateColor', () => {
    it('raw fill 은 token-not-used / severity high 로 잡는다', () => {
        const result = evaluateColor([usage({ tokenStatus: 'raw', hex: '#ff0000', token: null })], schema);
        expect(result.violations[0].type).toBe('token-not-used');
        expect(result.violations[0].severity).toBe('high');
    });

    it('알 수 없는 토큰은 unknown-token', () => {
        const result = evaluateColor(
            [usage({ tokenStatus: 'unknown', token: null, hex: '#abc123' })],
            schema,
        );
        expect(result.violations[0].type).toBe('unknown-token');
    });

    it('do-not-use 플래그가 박힌 토큰은 do-not-use 로 잡는다', () => {
        // status=do-not-use 가 있는 token 키를 schema 에서 골라 입력
        const doNotUseKey = Object.entries(schema.semantic).find(([, v]) => v.status === 'do-not-use')?.[0];
        if (!doNotUseKey) return; // 스키마에 없으면 skip
        const result = evaluateColor(
            [usage({ tokenStatus: 'ok', token: doNotUseKey, hex: schema.semantic[doNotUseKey].hex })],
            schema,
        );
        expect(result.violations[0].type).toBe('do-not-use');
    });

    it('fill 에 foreground 토큰을 쓰면 role-mismatch', () => {
        const fgKey = Object.entries(schema.semantic).find(([, v]) => v.role === 'foreground')?.[0];
        if (!fgKey) return;
        const result = evaluateColor(
            [usage({ property: 'fill', tokenStatus: 'ok', token: fgKey, hex: schema.semantic[fgKey].hex })],
            schema,
        );
        expect(result.violations.some((v) => v.type === 'role-mismatch')).toBe(true);
    });

    it('primitive 토큰 사용은 primitive-used / info', () => {
        // primitive 토큰 키는 colors. 로 시작하지 않는다고 가정 (또는 schema 에서 토큰이 아닌 primitive 키 사용)
        const result = evaluateColor(
            [usage({ tokenStatus: 'ok', token: 'colors.blue.500', hex: '#0000ff' })],
            schema,
        );
        expect(result.violations[0].type).toBe('primitive-used');
        expect(result.violations[0].severity).toBe('info');
    });

    it('적합한 semantic 토큰 사용은 conformant 로 떨어진다', () => {
        const fgKey = Object.entries(schema.semantic).find(([, v]) => v.role === 'foreground')?.[0];
        if (!fgKey) return;
        const result = evaluateColor(
            [
                usage({
                    property: 'fill-on-text',
                    tokenStatus: 'ok',
                    token: fgKey,
                    hex: schema.semantic[fgKey].hex,
                }),
            ],
            schema,
        );
        expect(result.violations.length).toBe(0);
        expect(result.conformant.length).toBe(1);
    });
});
```

Run: FAIL.

- [ ] **Step 2: evaluateColor 구현**

```ts
// src/ui/lib/evaluate/color.ts
import type {
    ColorUsage,
    Conformant,
    Property,
    Violation,
} from '~/common/schemas';
import type { ColorSchema } from '~/ui/lib/loaders/color';
import { PROPERTY_SCOPE } from '~/ui/lib/scope';

function isPrimitiveKey(token: string): boolean {
    // semantic 키는 schema.semantic 에 존재; primitive 는 'colors.<family>.<grade>' 형식이며
    // semantic 에 없으면 primitive 또는 unknown 으로 간주.
    return /^colors\.[a-z]+\.[0-9]{3}$/.test(token);
}

function effectiveProperty(usage: ColorUsage): Property {
    if (usage.property === 'text') return 'fill-on-text';
    if (usage.property === 'fill') return 'fill';
    return 'stroke';
}

export function evaluateColor(
    usages: ColorUsage[],
    schema: ColorSchema,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const property = effectiveProperty(u);
        const value = u.hex;
        const base = {
            nodeId: u.nodeId,
            nodeIds: u.nodeIds,
            count: u.count,
            name: u.name,
            property,
            token: u.token,
            value,
            detail: '',
            suggested: [] as string[],
        };

        if (u.tokenStatus === 'raw') {
            violations.push({
                ...base,
                type: 'token-not-used',
                severity: 'high',
                detail: '변수에 바인딩되지 않은 색이 직접 입력되었습니다.',
            });
            continue;
        }
        if (u.tokenStatus === 'unknown') {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                detail: '바인딩된 변수가 스키마의 semantic 단계에 도달하지 못했습니다.',
            });
            continue;
        }
        if (!u.token) continue;

        // primitive 토큰?
        if (isPrimitiveKey(u.token) && !schema.semantic[u.token]) {
            violations.push({
                ...base,
                type: 'primitive-used',
                severity: 'info',
                detail: 'primitive 토큰이 직접 사용되었습니다. 같은 값의 semantic 토큰이 있는지 확인하세요.',
            });
            continue;
        }

        const meta = schema.semantic[u.token];
        if (!meta) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                detail: '스키마에 없는 토큰 키입니다.',
            });
            continue;
        }

        if (meta.status === 'do-not-use') {
            violations.push({
                ...base,
                type: 'do-not-use',
                severity: 'high',
                detail: '사용이 권장되지 않는 토큰입니다(do-not-use).',
            });
            continue;
        }

        const allowedRoles = (PROPERTY_SCOPE as Record<string, ReadonlyArray<string>>)[property] ?? [];
        if (meta.role && !allowedRoles.includes(meta.role)) {
            // stroke 는 border, foreground 둘 다 허용이므로 그대로 통과
            violations.push({
                ...base,
                type: 'role-mismatch',
                severity: 'high',
                detail: `${property} 속성에는 ${allowedRoles.join('/')} role만 허용됩니다 (적용: ${meta.role}).`,
            });
            continue;
        }

        // fg-grade 검사
        if (meta.role === 'foreground' && property === 'fill-on-text' && u.background) {
            const kind = u.background.kind;
            if (kind === 'ambiguous') {
                violations.push({
                    ...base,
                    type: 'fg-grade-ambiguous',
                    severity: 'info',
                    detail: '배경 식별이 모호해 fg grade 짝 확인이 보류되었습니다.',
                });
                continue;
            }
            const grade = u.token.split('.').pop();
            if (kind === 'other' && grade === '100') {
                violations.push({
                    ...base,
                    type: 'fg-grade-mismatch',
                    severity: 'high',
                    detail: 'fg-100을 비순백 배경 위에 사용했습니다. .200 사용을 검토하세요.',
                });
                continue;
            }
        }

        conformant.push({
            nodeId: u.nodeId,
            nodeIds: u.nodeIds,
            name: u.name,
            property,
            token: u.token,
        });
    }

    return { violations, conformant };
}
```

Run: PASS.

- [ ] **Step 3: typecheck + test**

```bash
pnpm --filter figma-token-review-plugin typecheck
pnpm --filter figma-token-review-plugin test -- evaluate/color
```

- [ ] **Step 4: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/lib/evaluate/color.ts apps/figma-token-review-plugin/tests/lib/evaluate/color.test.ts
git commit -m "feat(figma-token-review-plugin): deterministic color evaluator

raw / unknown / primitive / do-not-use / role-mismatch / fg-grade 위반을
PROPERTY_SCOPE와 ColorSchema 기반으로 결정론으로 판정한다."
```

---

## Task 4: Space 결정론 evaluator

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/evaluate/space.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/evaluate/space.test.ts`

**Interfaces:**
- Consumes: `TokenValueIndex` (space slot) from `~/ui/lib/loaders/dimension`, `SpaceUsage`, `Violation`, `Conformant` from `~/common/schemas`.
- Produces: `evaluateSpace(usages: SpaceUsage[], schema: TokenValueIndex): { violations: Violation[]; conformant: Conformant[] }`

- [ ] **Step 1: 실패 테스트**

```ts
// tests/lib/evaluate/space.test.ts
import { describe, expect, it } from 'vitest';

import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { evaluateSpace } from '~/ui/lib/evaluate/space';
import type { SpaceUsage } from '~/common/schemas';

const schemas = loadDimensionSchemas();

function usage(partial: Partial<SpaceUsage>): SpaceUsage {
    return {
        nodeId: 'n',
        name: 'box',
        property: 'padding',
        value: '16px',
        token: null,
        tokenStatus: 'ok',
        ...partial,
    };
}

describe('evaluateSpace', () => {
    it('raw value 는 token-not-used / high', () => {
        const r = evaluateSpace([usage({ tokenStatus: 'raw' })], schemas.space);
        expect(r.violations[0].type).toBe('token-not-used');
        expect(r.violations[0].severity).toBe('high');
    });

    it('스키마에 없는 토큰은 unknown-token', () => {
        const r = evaluateSpace([usage({ token: 'space.999', tokenStatus: 'ok' })], schemas.space);
        expect(r.violations[0].type).toBe('unknown-token');
    });

    it('적합 토큰은 conformant', () => {
        const knownToken = Object.keys(schemas.space.tokens)[0];
        const knownValue = schemas.space.tokens[knownToken];
        const r = evaluateSpace([usage({ token: knownToken, value: knownValue })], schemas.space);
        expect(r.violations.length).toBe(0);
        expect(r.conformant[0].token).toBe(knownToken);
    });
});
```

Run: FAIL.

- [ ] **Step 2: evaluateSpace 구현**

```ts
// src/ui/lib/evaluate/space.ts
import type { Conformant, SpaceUsage, Violation } from '~/common/schemas';
import type { TokenValueIndex } from '~/ui/lib/loaders/dimension';

export function evaluateSpace(
    usages: SpaceUsage[],
    schema: TokenValueIndex,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const base = {
            nodeId: u.nodeId,
            name: u.name,
            property: u.property,
            token: u.token,
            value: u.value,
            detail: '',
            suggested: [] as string[],
        };

        if (u.tokenStatus === 'raw') {
            violations.push({
                ...base,
                type: 'token-not-used',
                severity: 'high',
                detail: `${u.property}에 raw value(${u.value})가 직접 입력되었습니다.`,
            });
            continue;
        }
        if (u.tokenStatus === 'unknown' || !u.token || !(u.token in schema.tokens)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                detail: 'space 스키마에 등록되지 않은 토큰입니다.',
            });
            continue;
        }
        conformant.push({ nodeId: u.nodeId, name: u.name, property: u.property, token: u.token });
    }

    return { violations, conformant };
}
```

Run: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/lib/evaluate/space.ts apps/figma-token-review-plugin/tests/lib/evaluate/space.test.ts
git commit -m "feat(figma-token-review-plugin): deterministic space evaluator"
```

---

## Task 5: Dimension 결정론 evaluator

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/evaluate/dimension.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/evaluate/dimension.test.ts`

**Interfaces:**
- Consumes: `TokenValueIndex` (dimension slot), `DimensionUsage`.
- Produces: `evaluateDimension(usages: DimensionUsage[], schema: TokenValueIndex): { violations: Violation[]; conformant: Conformant[] }`

- [ ] **Step 1: 실패 테스트**

```ts
// tests/lib/evaluate/dimension.test.ts
import { describe, expect, it } from 'vitest';

import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { evaluateDimension } from '~/ui/lib/evaluate/dimension';
import type { DimensionUsage } from '~/common/schemas';

const schemas = loadDimensionSchemas();

function usage(partial: Partial<DimensionUsage>): DimensionUsage {
    return {
        nodeId: 'n',
        name: 'box',
        property: 'width',
        value: '320px',
        token: null,
        tokenStatus: 'ok',
        ...partial,
    };
}

describe('evaluateDimension', () => {
    it('raw value 는 token-not-used / high', () => {
        const r = evaluateDimension([usage({ tokenStatus: 'raw' })], schemas.dimension);
        expect(r.violations[0].type).toBe('token-not-used');
    });

    it('적합 토큰은 conformant', () => {
        const k = Object.keys(schemas.dimension.tokens)[0];
        const v = schemas.dimension.tokens[k];
        const r = evaluateDimension([usage({ token: k, value: v })], schemas.dimension);
        expect(r.conformant.length).toBe(1);
    });
});
```

Run: FAIL.

- [ ] **Step 2: evaluateDimension 구현**

```ts
// src/ui/lib/evaluate/dimension.ts
import type { Conformant, DimensionUsage, Violation } from '~/common/schemas';
import type { TokenValueIndex } from '~/ui/lib/loaders/dimension';

export function evaluateDimension(
    usages: DimensionUsage[],
    schema: TokenValueIndex,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const base = {
            nodeId: u.nodeId,
            name: u.name,
            property: u.property,
            token: u.token,
            value: u.value,
            detail: '',
            suggested: [] as string[],
        };

        if (u.tokenStatus === 'raw') {
            violations.push({
                ...base,
                type: 'token-not-used',
                severity: 'high',
                detail: `${u.property}에 raw value(${u.value})가 직접 입력되었습니다.`,
            });
            continue;
        }
        if (u.tokenStatus === 'unknown' || !u.token || !(u.token in schema.tokens)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                detail: 'dimension 스키마에 등록되지 않은 토큰입니다.',
            });
            continue;
        }
        conformant.push({ nodeId: u.nodeId, name: u.name, property: u.property, token: u.token });
    }

    return { violations, conformant };
}
```

Run: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/lib/evaluate/dimension.ts apps/figma-token-review-plugin/tests/lib/evaluate/dimension.test.ts
git commit -m "feat(figma-token-review-plugin): deterministic dimension evaluator"
```

---

## Task 6: BorderRadius 결정론 evaluator

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/evaluate/radius.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/evaluate/radius.test.ts`

**Interfaces:**
- Consumes: `TokenValueIndex` (borderRadius slot), `RadiusUsage`.
- Produces: `evaluateRadius(usages: RadiusUsage[], schema: TokenValueIndex): { violations: Violation[]; conformant: Conformant[] }`

- [ ] **Step 1: 실패 테스트**

```ts
// tests/lib/evaluate/radius.test.ts
import { describe, expect, it } from 'vitest';

import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { evaluateRadius } from '~/ui/lib/evaluate/radius';
import type { RadiusUsage } from '~/common/schemas';

const schemas = loadDimensionSchemas();

function usage(partial: Partial<RadiusUsage>): RadiusUsage {
    return { nodeId: 'n', name: 'card', value: '8px', token: null, tokenStatus: 'ok', ...partial };
}

describe('evaluateRadius', () => {
    it('raw value 는 token-not-used', () => {
        const r = evaluateRadius([usage({ tokenStatus: 'raw' })], schemas.borderRadius);
        expect(r.violations[0].type).toBe('token-not-used');
    });
});
```

- [ ] **Step 2: 구현**

```ts
// src/ui/lib/evaluate/radius.ts
import type { Conformant, RadiusUsage, Violation } from '~/common/schemas';
import type { TokenValueIndex } from '~/ui/lib/loaders/dimension';

export function evaluateRadius(
    usages: RadiusUsage[],
    schema: TokenValueIndex,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const base = {
            nodeId: u.nodeId,
            name: u.name,
            property: 'borderRadius' as const,
            token: u.token,
            value: u.value,
            detail: '',
            suggested: [] as string[],
        };

        if (u.tokenStatus === 'raw') {
            violations.push({
                ...base,
                type: 'token-not-used',
                severity: 'high',
                detail: `borderRadius에 raw value(${u.value})가 직접 입력되었습니다.`,
            });
            continue;
        }
        if (u.tokenStatus === 'unknown' || !u.token || !(u.token in schema.tokens)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                detail: 'borderRadius 스키마에 등록되지 않은 토큰입니다.',
            });
            continue;
        }
        conformant.push({ nodeId: u.nodeId, name: u.name, property: 'borderRadius', token: u.token });
    }

    return { violations, conformant };
}
```

- [ ] **Step 3: Test + Commit**

```bash
pnpm --filter figma-token-review-plugin test -- evaluate/radius
git add apps/figma-token-review-plugin/src/ui/lib/evaluate/radius.ts apps/figma-token-review-plugin/tests/lib/evaluate/radius.test.ts
git commit -m "feat(figma-token-review-plugin): deterministic borderRadius evaluator"
```

---

## Task 7: Shadow 결정론 evaluator

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/evaluate/shadow.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/evaluate/shadow.test.ts`

**Interfaces:**
- Consumes: `TokenValueIndex` (shadow slot), `ShadowUsage`.
- Produces: `evaluateShadow(usages: ShadowUsage[], schema: TokenValueIndex): { violations: Violation[]; conformant: Conformant[] }`

- [ ] **Step 1: 실패 테스트**

```ts
// tests/lib/evaluate/shadow.test.ts
import { describe, expect, it } from 'vitest';

import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { evaluateShadow } from '~/ui/lib/evaluate/shadow';
import type { ShadowUsage } from '~/common/schemas';

const schemas = loadDimensionSchemas();

function usage(partial: Partial<ShadowUsage>): ShadowUsage {
    return {
        nodeId: 'n',
        name: 'card',
        value: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        token: null,
        tokenStatus: 'ok',
        ...partial,
    };
}

describe('evaluateShadow', () => {
    it('raw 는 token-not-used', () => {
        const r = evaluateShadow([usage({ tokenStatus: 'raw' })], schemas.shadow);
        expect(r.violations[0].type).toBe('token-not-used');
    });
});
```

- [ ] **Step 2: 구현**

```ts
// src/ui/lib/evaluate/shadow.ts
import type { Conformant, ShadowUsage, Violation } from '~/common/schemas';
import type { TokenValueIndex } from '~/ui/lib/loaders/dimension';

export function evaluateShadow(
    usages: ShadowUsage[],
    schema: TokenValueIndex,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const base = {
            nodeId: u.nodeId,
            name: u.name,
            property: 'shadow' as const,
            token: u.token,
            value: u.value,
            detail: '',
            suggested: [] as string[],
        };

        if (u.tokenStatus === 'raw') {
            violations.push({
                ...base,
                type: 'token-not-used',
                severity: 'high',
                detail: `shadow에 raw value(${u.value})가 직접 입력되었습니다.`,
            });
            continue;
        }
        if (u.tokenStatus === 'unknown' || !u.token || !(u.token in schema.tokens)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                detail: 'shadow 스키마에 등록되지 않은 토큰입니다.',
            });
            continue;
        }
        conformant.push({ nodeId: u.nodeId, name: u.name, property: 'shadow', token: u.token });
    }

    return { violations, conformant };
}
```

- [ ] **Step 3: Test + Commit**

```bash
pnpm --filter figma-token-review-plugin test -- evaluate/shadow
git add apps/figma-token-review-plugin/src/ui/lib/evaluate/shadow.ts apps/figma-token-review-plugin/tests/lib/evaluate/shadow.test.ts
git commit -m "feat(figma-token-review-plugin): deterministic shadow evaluator"
```

---

## Task 8: Typography 결정론 evaluator

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/evaluate/typography.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/evaluate/typography.test.ts`

**Interfaces:**
- Consumes: `TextStyleSchema` from `~/ui/lib/loaders/typography`, `TypographyUsage`.
- Produces: `evaluateTypography(usages: TypographyUsage[], schema: TextStyleSchema): { violations: Violation[]; conformant: Conformant[] }`

- [ ] **Step 1: 실패 테스트**

```ts
// tests/lib/evaluate/typography.test.ts
import { describe, expect, it } from 'vitest';

import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';
import { evaluateTypography } from '~/ui/lib/evaluate/typography';
import type { TypographyUsage } from '~/common/schemas';

const schema = loadTextStyleSchema();

function usage(partial: Partial<TypographyUsage>): TypographyUsage {
    return {
        nodeId: 'n',
        name: 'label',
        characters: '안내',
        textStyle: 'body2',
        viewport: 'pc',
        appliedStatus: 'styled-clean',
        overriddenFields: [],
        resolved: { fontSize: 14, lineHeight: {}, letterSpacing: {}, fontName: {} },
        ...partial,
    };
}

describe('evaluateTypography', () => {
    it('appliedStatus=raw 는 typo-raw / high', () => {
        const r = evaluateTypography([usage({ appliedStatus: 'raw', textStyle: null })], schema);
        expect(r.violations[0].type).toBe('typo-raw');
    });

    it('styled-override 는 info', () => {
        const r = evaluateTypography(
            [usage({ appliedStatus: 'styled-override', overriddenFields: ['fontSize'] })],
            schema,
        );
        expect(r.violations[0].type).toBe('typo-styled-override');
        expect(r.violations[0].severity).toBe('info');
    });

    it('styled-clean 은 conformant', () => {
        const r = evaluateTypography([usage({})], schema);
        expect(r.conformant.length).toBe(1);
    });
});
```

- [ ] **Step 2: 구현**

```ts
// src/ui/lib/evaluate/typography.ts
import type { Conformant, TypographyUsage, Violation } from '~/common/schemas';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

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
            detail: '',
            suggested: [] as string[],
        };

        if (u.appliedStatus === 'raw') {
            violations.push({
                ...base,
                type: 'typo-raw',
                severity: 'high',
                detail: `Text Style이 바인딩되지 않은 raw 텍스트입니다 ("${u.characters}").`,
            });
            continue;
        }
        if (u.appliedStatus === 'styled-override') {
            violations.push({
                ...base,
                type: 'typo-styled-override',
                severity: 'info',
                detail: `Text Style "${u.textStyle}" 적용 후 ${u.overriddenFields.join(', ')} 필드가 오버라이드되었습니다.`,
            });
            continue;
        }
        if (u.textStyle && !(u.textStyle in schema.styles)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                detail: `등록되지 않은 Text Style 이름입니다: ${u.textStyle}.`,
            });
            continue;
        }
        if (u.textStyle) {
            conformant.push({ nodeId: u.nodeId, name: u.name, property: 'textStyle', token: u.textStyle });
        }
    }

    return { violations, conformant };
}
```

- [ ] **Step 3: Test + Commit**

```bash
pnpm --filter figma-token-review-plugin test -- evaluate/typography
git add apps/figma-token-review-plugin/src/ui/lib/evaluate/typography.ts apps/figma-token-review-plugin/tests/lib/evaluate/typography.test.ts
git commit -m "feat(figma-token-review-plugin): deterministic typography evaluator"
```

---

## Task 9: Unified Recommend 모듈

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/recommend.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/recommend.test.ts`

**Interfaces:**
- Consumes: 모든 evaluator 출력의 `Violation`, `ColorSchema`, `DimensionSchemas` (혹은 그 안의 `TokenValueIndex`).
- Produces: `applyRecommendations(violations: Violation[], ctx: RecommendCtx): Violation[]` (각 violation의 `suggested[]`를 in-place로 채워 반환)
  - `RecommendCtx = { colorSchema: ColorSchema; space: TokenValueIndex; dimension: TokenValueIndex; borderRadius: TokenValueIndex; shadow: TokenValueIndex }`

추천 규칙은 spec §4.4 표를 그대로 코드화한다.

- [ ] **Step 1: 실패 테스트**

```ts
// tests/lib/recommend.test.ts
import { describe, expect, it } from 'vitest';

import { loadColorSchema } from '~/ui/lib/loaders/color';
import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { applyRecommendations } from '~/ui/lib/recommend';
import type { Violation } from '~/common/schemas';

const colorSchema = loadColorSchema('light');
const dim = loadDimensionSchemas();

function v(partial: Partial<Violation>): Violation {
    return {
        nodeId: 'n',
        name: 's',
        property: 'fill',
        token: null,
        value: null,
        type: 'token-not-used',
        severity: 'high',
        detail: '',
        suggested: [],
        ...partial,
    };
}

describe('applyRecommendations', () => {
    it('raw color 가 동일 hex semantic 후보를 받는다', () => {
        // hexIndex 의 첫 entry 를 이용
        const [hex, tokens] = colorSchema.hexIndex.entries().next().value as [string, string[]];
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'fill', value: hex })],
            { colorSchema, ...dim },
        );
        // suggested 는 colorSchema 스코프 + hex 일치 토큰만
        expect(out[0].suggested.length).toBeGreaterThan(0);
        for (const s of out[0].suggested) {
            expect(tokens).toContain(s);
        }
    });

    it('스코프에 맞는 후보가 없으면 primitive 로 fallback', () => {
        const primitiveHex = Object.values(colorSchema.primitive)[0];
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'fill', value: primitiveHex })],
            { colorSchema, ...dim },
        );
        // semantic 후보가 없으면 primitive 후보가 들어와야 함
        const allPrim = Object.keys(colorSchema.primitive);
        expect(out[0].suggested.every((s) => allPrim.includes(s)) || out[0].suggested.length === 0).toBe(true);
    });

    it('raw space 의 후보를 동일 value 토큰으로 채운다', () => {
        const [value, tokens] = dim.space.valueToTokens.entries().next().value as [string, string[]];
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'padding', value })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested).toEqual(tokens);
    });

    it('primitive-used 색상이 동일 hex semantic 후보를 받는다', () => {
        const primitiveKey = Object.keys(colorSchema.primitive)[0];
        const primitiveHex = colorSchema.primitive[primitiveKey];
        // semantic 중 같은 hex 를 갖는 게 있어야 후보가 나옴
        const expected = colorSchema.hexIndex.get(primitiveHex.toLowerCase()) ?? [];
        const out = applyRecommendations(
            [v({ type: 'primitive-used', property: 'fill', value: primitiveHex, token: primitiveKey })],
            { colorSchema, ...dim },
        );
        if (expected.length > 0) {
            expect(out[0].suggested).toEqual(expect.arrayContaining(expected.filter((t) => colorSchema.semantic[t]?.role === 'background')));
        }
    });

    it('do-not-use 토큰은 schema 메타에서 추출한 대체 후보를 받는다', () => {
        const doNotUseEntry = Object.entries(colorSchema.semantic).find(([, m]) => m.status === 'do-not-use');
        if (!doNotUseEntry) return; // 스키마에 do-not-use가 없으면 skip
        const [token] = doNotUseEntry;
        const out = applyRecommendations(
            [v({ type: 'do-not-use', property: 'fill', token })],
            { colorSchema, ...dim },
        );
        // 모든 후보는 유효한 schema 키여야 하고 본인을 가리키지 않아야 한다
        for (const s of out[0].suggested) {
            expect(s in colorSchema.semantic).toBe(true);
            expect(s).not.toBe(token);
        }
    });
});
```

- [ ] **Step 2: 구현**

```ts
// src/ui/lib/recommend.ts
import type { Property, Role, Violation } from '~/common/schemas';
import type { ColorSchema } from '~/ui/lib/loaders/color';
import type { TokenValueIndex } from '~/ui/lib/loaders/dimension';
import { PROPERTY_SCOPE } from '~/ui/lib/scope';

export type RecommendCtx = {
    colorSchema: ColorSchema;
    space: TokenValueIndex;
    dimension: TokenValueIndex;
    borderRadius: TokenValueIndex;
    shadow: TokenValueIndex;
};

function allowedRoles(property: Property): ReadonlyArray<Role> {
    if (property === 'textStyle') return [];
    return PROPERTY_SCOPE[property as Exclude<Property, 'textStyle'>] ?? [];
}

function colorSuggestions(
    violation: Violation,
    schema: ColorSchema,
): string[] {
    if (!violation.value) return [];
    const hex = violation.value.toLowerCase();
    const allRoles = allowedRoles(violation.property);
    const matched = schema.hexIndex.get(hex) ?? [];
    const inScope = matched.filter((t) => {
        const role = schema.semantic[t]?.role;
        return role !== null && allRoles.includes(role as Role);
    });
    if (inScope.length > 0) return inScope;
    if (violation.type === 'token-not-used') {
        const primitives = Object.entries(schema.primitive)
            .filter(([, v]) => v.toLowerCase() === hex)
            .map(([k]) => k);
        return primitives;
    }
    return [];
}

function dimensionIndex(ctx: RecommendCtx, property: Property): TokenValueIndex | null {
    if (property === 'padding' || property === 'gap') return ctx.space;
    if (property === 'width' || property === 'height') return ctx.dimension;
    if (property === 'borderRadius') return ctx.borderRadius;
    if (property === 'shadow') return ctx.shadow;
    return null;
}

function valueSuggestions(violation: Violation, index: TokenValueIndex): string[] {
    if (!violation.value) return [];
    return index.valueToTokens.get(violation.value) ?? [];
}

function scopeMismatchSuggestions(violation: Violation, schema: ColorSchema): string[] {
    if (!violation.token) return [];
    const grade = violation.token.split('.').pop();
    if (!grade) return [];
    const allRoles = allowedRoles(violation.property);
    return Object.entries(schema.semantic)
        .filter(([k, meta]) => k.endsWith(`.${grade}`) && meta.role && allRoles.includes(meta.role))
        .map(([k]) => k);
}

// do-not-use 대체 후보: skill semantic-color.json 메타에서 추출.
// 메타 위치는 schema entry 별 검증 필요. 우선순위:
//   1) meta.replacement (string | string[])  ← 명시 필드 있으면 그대로
//   2) meta.avoid 의 우변 'colors.\w+' 추출 ← "<조건> → colors.X.Y" 패턴
//   3) 동위계 + 같은 role 의 같은 family 토큰  ← family는 token key 의 2번째 segment
// 구현 전 src/common/tokens/semantic-color.light.json 에서 status='do-not-use' 토큰 1개를
// 골라 실제 메타 키를 확인하고, 위 fallback chain 을 그 구조에 맞춰 조정한다.
function doNotUseSuggestions(token: string, schema: ColorSchema): string[] {
    const meta = schema.semantic[token];
    if (!meta) return [];
    const extra = meta as unknown as { replacement?: string | string[] };
    if (Array.isArray(extra.replacement)) return extra.replacement;
    if (typeof extra.replacement === 'string') return [extra.replacement];

    const fromAvoid = (meta.avoid ?? [])
        .flatMap((line) => Array.from(line.matchAll(/colors\.[a-zA-Z0-9.]+/g), (m) => m[0]))
        .filter((cand) => cand !== token && cand in schema.semantic);
    if (fromAvoid.length > 0) return Array.from(new Set(fromAvoid));

    const parts = token.split('.');
    const grade = parts.at(-1);
    const family = parts[1];
    if (!grade || !family) return [];
    return Object.entries(schema.semantic)
        .filter(([k, m]) => k !== token && k.endsWith(`.${grade}`) && m.role === meta.role && k.split('.')[1] !== family && m.status !== 'do-not-use')
        .map(([k]) => k);
}

export function applyRecommendations(
    violations: Violation[],
    ctx: RecommendCtx,
): Violation[] {
    return violations.map((violation) => {
        if (violation.heuristic) return violation; // LLM 항목은 자기 추천 유지

        let suggested: string[] = violation.suggested;

        const isColorProperty =
            violation.property === 'fill' ||
            violation.property === 'fill-on-text' ||
            violation.property === 'stroke';

        if (violation.type === 'token-not-used') {
            if (isColorProperty) suggested = colorSuggestions(violation, ctx.colorSchema);
            else {
                const idx = dimensionIndex(ctx, violation.property);
                suggested = idx ? valueSuggestions(violation, idx) : [];
            }
        } else if (violation.type === 'primitive-used') {
            suggested = colorSuggestions(violation, ctx.colorSchema);
        } else if (violation.type === 'role-mismatch') {
            suggested = scopeMismatchSuggestions(violation, ctx.colorSchema);
        } else if (violation.type === 'fg-grade-mismatch' && violation.token) {
            const base = violation.token.replace(/\.100$/, '.200');
            suggested = base in ctx.colorSchema.semantic ? [base] : [];
        } else if (violation.type === 'do-not-use' && violation.token) {
            suggested = doNotUseSuggestions(violation.token, ctx.colorSchema);
        }
        // unknown-token, fg-grade-ambiguous, typo-raw, typo-styled-override: 빈 배열 그대로.

        return { ...violation, suggested };
    });
}
```

- [ ] **Step 3: Test + Commit**

```bash
pnpm --filter figma-token-review-plugin test -- recommend
git add apps/figma-token-review-plugin/src/ui/lib/recommend.ts apps/figma-token-review-plugin/tests/lib/recommend.test.ts
git commit -m "feat(figma-token-review-plugin): unified recommendation rules"
```

---

## Task 10: Rubric subset 생성기 (LLM 입력용)

**Files:**
- Create: `apps/figma-token-review-plugin/src/ui/lib/rubric.ts`
- Create: `apps/figma-token-review-plugin/tests/lib/rubric.test.ts`

**Interfaces:**
- Consumes: `ColorUsage`, `TypographyUsage`, `ColorSchema`, `TextStyleSchema`.
- Produces: `buildLlmInput(args): LlmInput`
  - `LlmInput = { context: { schemaMode, viewport, frameName }; judgmentTargets: { typography: TypographyTarget[]; semanticColor: ColorTarget[] }; rubric: { textStyle: Record<string, TextStyleMeta>; color: Record<string, ColorMetaSubset> } }`
  - `TypographyTarget = { nodeId, name, characters, textStyle, parentName?, siblingIndex?, totalSiblings? }`
  - `ColorTarget = { nodeId, name, property, token, parentName?, neighbors?, characters? }`
  - `ColorMetaSubset = { when: string[]; avoid: string[]; role: Role | null; description: string | null }`
  - `buildLlmInputArgs = { extract: RawExtract; deterministicConformant: { color: Conformant[]; typography: Conformant[] }; frameName: string; colorSchema: ColorSchema; textStyleSchema: TextStyleSchema }`

(Plugin이 결정론 통과한 conformant 목록을 기반으로 의미 판정 대상을 추리고, 그에 등장한 토큰의 rubric만 발췌.)

- [ ] **Step 1: 실패 테스트**

```ts
// tests/lib/rubric.test.ts
import { describe, expect, it } from 'vitest';

import { loadColorSchema } from '~/ui/lib/loaders/color';
import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';
import { buildLlmInput } from '~/ui/lib/rubric';
import type { Conformant, RawExtract } from '~/common/schemas';

const colorSchema = loadColorSchema('light');
const textStyleSchema = loadTextStyleSchema();

const fgKey = Object.entries(colorSchema.semantic).find(([, v]) => v.role === 'foreground')?.[0] ?? '';

const extract: RawExtract = {
    schemaMode: 'light',
    viewport: 'pc',
    colors: [
        { nodeId: '1', name: 't', property: 'text', token: fgKey, hex: '#000', tokenStatus: 'ok', background: null },
    ],
    typography: [
        { nodeId: '2', name: 'h', characters: '제목', textStyle: 'subtitle1', viewport: 'pc', appliedStatus: 'styled-clean', overriddenFields: [], resolved: { fontSize: 14, lineHeight: {}, letterSpacing: {}, fontName: {} } },
    ],
    spaces: [],
    dimensions: [],
    radii: [],
    shadows: [],
    stats: { nodeCount: 0, textNodes: 0, visited: 0 },
};

describe('buildLlmInput', () => {
    it('의미 판정 대상은 결정론 통과 conformant 노드만', () => {
        const conformant = {
            color: [{ nodeId: '1', name: 't', property: 'fill-on-text', token: fgKey } as Conformant],
            typography: [{ nodeId: '2', name: 'h', property: 'textStyle', token: 'subtitle1' } as Conformant],
        };
        const input = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            frameName: 'frame',
            colorSchema,
            textStyleSchema,
        });
        expect(input.judgmentTargets.semanticColor.map((t) => t.nodeId)).toEqual(['1']);
        expect(input.judgmentTargets.typography.map((t) => t.nodeId)).toEqual(['2']);
    });

    it('rubric 서브셋은 실제 등장한 토큰만 담는다', () => {
        const conformant = {
            color: [{ nodeId: '1', name: 't', property: 'fill-on-text', token: fgKey } as Conformant],
            typography: [{ nodeId: '2', name: 'h', property: 'textStyle', token: 'subtitle1' } as Conformant],
        };
        const input = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            frameName: 'frame',
            colorSchema,
            textStyleSchema,
        });
        expect(Object.keys(input.rubric.color)).toEqual([fgKey]);
        expect(Object.keys(input.rubric.textStyle)).toEqual(['subtitle1']);
    });
});
```

- [ ] **Step 2: 구현**

```ts
// src/ui/lib/rubric.ts
import type {
    ColorUsage,
    Conformant,
    RawExtract,
    Role,
    TypographyUsage,
} from '~/common/schemas';
import type { ColorSchema } from '~/ui/lib/loaders/color';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

export type TypographyTarget = {
    nodeId: string;
    name: string;
    characters: string;
    textStyle: string;
};

export type ColorTarget = {
    nodeId: string;
    name: string;
    property: 'fill' | 'fill-on-text' | 'stroke';
    token: string;
};

export type ColorMetaSubset = {
    when: string[];
    avoid: string[];
    role: Role | null;
    description: string | null;
};

export type TextStyleMetaSubset = {
    rank: number;
    totalRanks: number;
    when: string[];
    avoid: string[];
    description: string | null;
};

export type LlmInput = {
    context: { schemaMode: 'light' | 'dark'; viewport: string; frameName: string };
    judgmentTargets: { typography: TypographyTarget[]; semanticColor: ColorTarget[] };
    rubric: { textStyle: Record<string, TextStyleMetaSubset>; color: Record<string, ColorMetaSubset> };
};

export type BuildLlmInputArgs = {
    extract: RawExtract;
    deterministicConformant: { color: Conformant[]; typography: Conformant[] };
    frameName: string;
    colorSchema: ColorSchema;
    textStyleSchema: TextStyleSchema;
};

export function buildLlmInput(args: BuildLlmInputArgs): LlmInput {
    const { extract, deterministicConformant, frameName, colorSchema, textStyleSchema } = args;

    const colorByNode = new Map(extract.colors.map((c) => [c.nodeId, c]));
    const typoByNode = new Map(extract.typography.map((t) => [t.nodeId, t]));

    const semanticColorTargets: ColorTarget[] = [];
    const usedColorTokens = new Set<string>();
    for (const conf of deterministicConformant.color) {
        const u = colorByNode.get(conf.nodeId);
        if (!u || !conf.token) continue;
        const property =
            u.property === 'text' ? 'fill-on-text' : u.property === 'fill' ? 'fill' : 'stroke';
        if (!colorSchema.semantic[conf.token]) continue; // primitive 또는 unknown 은 의미 판정 대상 아님
        semanticColorTargets.push({
            nodeId: u.nodeId,
            name: u.name,
            property,
            token: conf.token,
        });
        usedColorTokens.add(conf.token);
    }

    const typographyTargets: TypographyTarget[] = [];
    const usedTextStyles = new Set<string>();
    for (const conf of deterministicConformant.typography) {
        const u = typoByNode.get(conf.nodeId);
        if (!u || !conf.token) continue;
        typographyTargets.push({
            nodeId: u.nodeId,
            name: u.name,
            characters: u.characters,
            textStyle: conf.token,
        });
        usedTextStyles.add(conf.token);
    }

    const colorRubric: Record<string, ColorMetaSubset> = {};
    for (const t of usedColorTokens) {
        const meta = colorSchema.semantic[t];
        if (!meta) continue;
        colorRubric[t] = {
            when: meta.when,
            avoid: meta.avoid,
            role: meta.role,
            description: meta.description,
        };
    }

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

    return {
        context: { schemaMode: extract.schemaMode, viewport: extract.viewport, frameName },
        judgmentTargets: { typography: typographyTargets, semanticColor: semanticColorTargets },
        rubric: { textStyle: textStyleRubric, color: colorRubric },
    };
}
```

- [ ] **Step 3: Test + Commit**

```bash
pnpm --filter figma-token-review-plugin test -- rubric
git add apps/figma-token-review-plugin/src/ui/lib/rubric.ts apps/figma-token-review-plugin/tests/lib/rubric.test.ts
git commit -m "feat(figma-token-review-plugin): LLM input rubric subset builder"
```

---

## Task 11: RawExtract 확장 — space/dimension/radius/shadow 추출

**Files:**
- Modify: `apps/figma-token-review-plugin/src/plugin/handlers/extract.ts`

**Interfaces:**
- Consumes: Figma plugin API (`figma.*`). 기존 `extractFrame()` 시그니처.
- Produces: `RawExtract` 확장본 — `colors`, `typography`, `spaces`, `dimensions`, `radii`, `shadows` 모두 채워서 반환.

> 본 task의 코드는 Figma plugin runtime API에 의존한다. 단위 테스트는 Figma API mock 없이 수행 불가하므로, 통합은 Task 13의 smoke test에서 검증한다. 본 task는 typecheck + 빌드만 통과시킨다.

- [ ] **Step 1: extract.ts 의 트리 순회 루프에서 새 카테고리 채집**

`extract.ts`의 노드 순회 함수(현재 `visit(node)` 또는 동등 위치)에 다음 분기를 추가한다. 기존 `colors`/`typography` 채집과 같은 위치에서.

```ts
// 의사코드 (실제 파일 구조에 맞춰 삽입)

const spaces: SpaceUsage[] = [];
const dimensions: DimensionUsage[] = [];
const radii: RadiusUsage[] = [];
const shadows: ShadowUsage[] = [];

function pushSpace(node: SceneNode, property: 'padding' | 'gap', value: number, fieldKey: string) {
    const tokenInfo = readSpaceToken(node, fieldKey); // boundVariables.paddingTop 등
    spaces.push({
        nodeId: node.id,
        name: node.name,
        property,
        value: `${value}px`,
        token: tokenInfo.token,
        tokenStatus: tokenInfo.status,
    });
}

function visitDimension(node: SceneNode) {
    if ('paddingTop' in node) {
        if (node.paddingTop != null) pushSpace(node, 'padding', node.paddingTop, 'paddingTop');
        if (node.paddingRight != null) pushSpace(node, 'padding', node.paddingRight, 'paddingRight');
        if (node.paddingBottom != null) pushSpace(node, 'padding', node.paddingBottom, 'paddingBottom');
        if (node.paddingLeft != null) pushSpace(node, 'padding', node.paddingLeft, 'paddingLeft');
    }
    if ('itemSpacing' in node && (node as FrameNode).itemSpacing != null) {
        pushSpace(node, 'gap', (node as FrameNode).itemSpacing, 'itemSpacing');
    }
    if ('width' in node && node.width != null) {
        const tokenInfo = readSizeToken(node, 'width');
        dimensions.push({ nodeId: node.id, name: node.name, property: 'width', value: `${node.width}px`, token: tokenInfo.token, tokenStatus: tokenInfo.status });
    }
    if ('height' in node && node.height != null) {
        const tokenInfo = readSizeToken(node, 'height');
        dimensions.push({ nodeId: node.id, name: node.name, property: 'height', value: `${node.height}px`, token: tokenInfo.token, tokenStatus: tokenInfo.status });
    }
    if ('cornerRadius' in node && node.cornerRadius !== figma.mixed && node.cornerRadius != null) {
        const tokenInfo = readRadiusToken(node);
        radii.push({ nodeId: node.id, name: node.name, value: `${node.cornerRadius}px`, token: tokenInfo.token, tokenStatus: tokenInfo.status });
    }
    if ('effects' in node) {
        for (const eff of node.effects) {
            if (eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW') {
                const tokenInfo = readShadowToken(node, eff);
                shadows.push({
                    nodeId: node.id,
                    name: node.name,
                    value: shadowToCss(eff),
                    token: tokenInfo.token,
                    tokenStatus: tokenInfo.status,
                });
            }
        }
    }
}
```

`readSpaceToken` / `readSizeToken` / `readRadiusToken` / `readShadowToken`은 기존 색상 `readVarChain` 헬퍼와 같은 패턴으로 작성한다. 노드의 `boundVariables[field]`가 있으면 `getVariableByIdAsync`로 chain을 따라가 토큰 이름을 복원 → `tokenStatus: 'ok'` / `'unknown'`. 없으면 `'raw'`.

```ts
async function readBoundDimensionToken(
    node: SceneNode,
    field: string,
): Promise<{ token: string | null; status: TokenStatus }> {
    const bound = (node as unknown as { boundVariables?: Record<string, { id: string }> }).boundVariables;
    const ref = bound?.[field];
    if (!ref) return { token: null, status: 'raw' };
    const variable = await figma.variables.getVariableByIdAsync(ref.id);
    if (!variable) return { token: null, status: 'unknown' };
    // tier 판별 + 이름 → 스키마 키 변환
    const name = variable.name; // e.g. "space/200"
    const key = name.replace(/\//g, '.');
    return { token: key, status: 'ok' };
}
```

- [ ] **Step 2: `extractFrame()` 반환값에 새 배열을 포함**

기존 반환문에서:

```ts
return {
    schemaMode,
    viewport,
    colors,
    typography,
    spaces,
    dimensions,
    radii,
    shadows,
    stats,
};
```

- [ ] **Step 3: typecheck + build**

```bash
pnpm --filter figma-token-review-plugin typecheck
pnpm --filter figma-token-review-plugin build:plugin
```

Expected: 통과.

- [ ] **Step 4: Commit**

```bash
git add apps/figma-token-review-plugin/src/plugin/handlers/extract.ts
git commit -m "feat(figma-token-review-plugin): extract space/dimension/radius/shadow

Figma plugin main thread에서 padding, gap, width, height, cornerRadius,
DROP_SHADOW / INNER_SHADOW 를 RawExtract 의 spaces/dimensions/radii/shadows
필드로 수집한다. boundVariables 가 있으면 alias 체인을 따라 토큰 이름을
복원하고, 없으면 tokenStatus:'raw' 로 떨어진다."
```

---

## Task 12: LLM prompt 재작성 + parse + merge

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/prompt.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/parse.ts`
- Modify: `apps/figma-token-review-plugin/src/ui/features/llm/index.ts`
- Modify: `apps/figma-token-review-plugin/vite.config.ui.ts`
- Create: `apps/figma-token-review-plugin/src/ui/features/llm/merge.ts`
- Create: `apps/figma-token-review-plugin/tests/features/llm/parse.test.ts`
- Create: `apps/figma-token-review-plugin/tests/features/llm/merge.test.ts`

**Interfaces:**
- Consumes: `LlmInput` from `~/ui/lib/rubric`, deterministic results from each evaluator, all loaders.
- Produces:
  - `buildRequest(input: LlmInput, model: string): AnthropicMessagesRequest`
  - `parseLlmResponse(response: AnthropicMessagesResponse): LlmJudgments`
    - `LlmJudgments = { typography: LlmTypoJudgment[]; semanticColor: LlmColorJudgment[] }`
    - `LlmTypoJudgment = { nodeId, name, token, verdict, confidence, reasoning, suggested }`
    - `LlmColorJudgment = { nodeId, name, property, token, verdict, confidence, reasoning, suggested }`
  - `mergeScanPayload(args: MergeArgs): ScanPayload`
    - `MergeArgs = { deterministic: Record<Category, { violations: Violation[]; conformant: Conformant[]; total: number }>; llm: LlmJudgments }`

- [ ] **Step 1: 실패 테스트 — parse**

```ts
// tests/features/llm/parse.test.ts
import { describe, expect, it } from 'vitest';

import { parseLlmResponse } from '~/ui/features/llm/parse';

describe('parseLlmResponse', () => {
    it('JSON text block 을 LlmJudgments 로 파싱한다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify({
                        typography: [
                            { nodeId: '1', name: 'h', token: 'subtitle1', verdict: 'PASS', confidence: 'HIGH', reasoning: '맞음', suggested: [] },
                        ],
                        semanticColor: [
                            { nodeId: '2', name: 'alert', property: 'fill', token: 'colors.background.danger.100', verdict: 'FAIL', confidence: 'MED', reasoning: '경고가 아닌 정보 자리', suggested: ['colors.background.hint.100'] },
                        ],
                    }),
                },
            ],
        };
        const result = parseLlmResponse(response);
        expect(result.typography[0].verdict).toBe('PASS');
        expect(result.semanticColor[0].suggested).toEqual(['colors.background.hint.100']);
    });

    it('마크다운 fence 감싸도 추출한다', () => {
        const response = {
            content: [
                {
                    type: 'text' as const,
                    text: '```json\n' + JSON.stringify({ typography: [], semanticColor: [] }) + '\n```',
                },
            ],
        };
        const result = parseLlmResponse(response);
        expect(result.typography).toEqual([]);
    });
});
```

- [ ] **Step 2: parse.ts 재작성**

```ts
// src/ui/features/llm/parse.ts
import type { Confidence } from '~/common/schemas';

type AnthropicTextBlock = { type: 'text'; text: string };
type AnthropicContentBlock = AnthropicTextBlock | { type: string; [k: string]: unknown };

export type AnthropicMessagesResponse = {
    content?: AnthropicContentBlock[];
};

export type LlmTypoJudgment = {
    nodeId: string;
    name: string;
    token: string;
    verdict: 'PASS' | 'FAIL';
    confidence: Confidence;
    reasoning: string;
    suggested: string[];
};

export type LlmColorJudgment = {
    nodeId: string;
    name: string;
    property: 'fill' | 'fill-on-text' | 'stroke';
    token: string;
    verdict: 'PASS' | 'FAIL';
    confidence: Confidence;
    reasoning: string;
    suggested: string[];
};

export type LlmJudgments = {
    typography: LlmTypoJudgment[];
    semanticColor: LlmColorJudgment[];
};

export class LlmParseError extends Error {
    readonly raw: string | null;
    constructor(message: string, raw: string | null) {
        super(message);
        this.name = 'LlmParseError';
        this.raw = raw;
    }
}

function extractJsonObject(text: string): string | null {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = (fenced ? fenced[1] : text).trim();
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    return candidate.slice(start, end + 1);
}

function isJudgments(value: unknown): value is LlmJudgments {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return Array.isArray(v.typography) && Array.isArray(v.semanticColor);
}

export function parseLlmResponse(response: AnthropicMessagesResponse): LlmJudgments {
    const blocks = response.content ?? [];
    const lastText = [...blocks].reverse().find(
        (b): b is AnthropicTextBlock => b.type === 'text' && typeof (b as AnthropicTextBlock).text === 'string',
    );
    if (!lastText) throw new LlmParseError('LLM 응답에 text block이 없습니다.', null);
    const json = extractJsonObject(lastText.text);
    if (!json) throw new LlmParseError('LLM 응답에서 JSON 객체를 찾을 수 없습니다.', lastText.text);
    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch (e) {
        throw new LlmParseError(`JSON parse 실패: ${(e as Error).message}`, json);
    }
    if (!isJudgments(parsed)) throw new LlmParseError('LlmJudgments schema mismatch.', json);
    return parsed;
}
```

- [ ] **Step 3: prompt.ts 재작성**

```ts
// src/ui/features/llm/prompt.ts
import type { LlmInput } from '~/ui/lib/rubric';

const SYSTEM_BASE = [
    '당신은 vapor 디자인 토큰의 의미 판정자다.',
    '결정론 분석은 일체 하지 않는다 — plugin이 이미 끝냈다.',
    '너의 역할은 두 가지뿐이다.',
    '1) 텍스트 위계(text styles) 적합성 분석',
    '2) semantic color의 역할/상태/상황 적합성 분석',
    '각 항목에 verdict(PASS/FAIL), confidence(HIGH/MED/LOW), 한국어 reasoning, 그리고 FAIL일 때만 자기 영역의 대체 토큰 후보(`suggested`)를 낸다.',
    '결정론 fail 노드는 입력에 없다. 결정론 fail에 대한 의견은 내지 마라.',
    '',
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
    '- 토큰 키(예: colors.background.danger.100, subtitle1)는 영문 그대로.',
    '- reasoning 은 한국어. 어느 when/avoid 항목이 부합/위배되는지 명시.',
    '- 확신이 약하면 confidence를 낮추되 verdict는 PASS/FAIL 둘 중 하나만 사용.',
].join('\n');

const SEMANTIC_GUIDE = [
    '의미 판정 가이드 (vapor 토큰 의미 기준):',
    '- color: 각 토큰의 when/avoid 가 전제하는 역할(danger/warning/primary/normal/hint 등)과 실제 자리(노드 이름·부모·인접 노드)의 의미가 부합하는가.',
    '  - avoid 의 "조건 → colors.X.Y" 형식은 우변이 그대로 remedy 후보다.',
    '- typography: rank 는 위계 인덱스(작을수록 큰 제목). totalRanks 와 함께 보고 위계 뒤집힘 / 본문에 heading 오용 등을 잡는다.',
    '  - viewport 의존 규칙은 textStyle 의 when 에 명시("mobile viewports → heading1" 등)되어 있다.',
    '- 점수화(0-100) 금지. PASS/FAIL + confidence 만.',
].join('\n');

export type SystemBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } };

export type AnthropicMessagesRequest = {
    model: string;
    max_tokens: number;
    system: SystemBlock[];
    messages: Array<{ role: 'user'; content: string }>;
};

export function buildRequest(input: LlmInput, model: string): AnthropicMessagesRequest {
    return {
        model,
        max_tokens: 4096,
        system: [
            { type: 'text', text: SYSTEM_BASE },
            { type: 'text', text: SEMANTIC_GUIDE, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content: JSON.stringify(input) }],
    };
}
```

- [ ] **Step 4: 실패 테스트 — merge**

```ts
// tests/features/llm/merge.test.ts
import { describe, expect, it } from 'vitest';

import { mergeScanPayload } from '~/ui/features/llm/merge';

describe('mergeScanPayload', () => {
    it('LLM heuristic FAIL 항목을 해당 카테고리 violations 로 합친다', () => {
        const payload = mergeScanPayload({
            deterministic: {
                color: { violations: [], conformant: [], total: 1 },
                space: { violations: [], conformant: [], total: 0 },
                dimension: { violations: [], conformant: [], total: 0 },
                typography: { violations: [], conformant: [], total: 1 },
                borderRadius: { violations: [], conformant: [], total: 0 },
                shadow: { violations: [], conformant: [], total: 0 },
            },
            llm: {
                typography: [
                    { nodeId: '1', name: 'h', token: 'body2', verdict: 'FAIL', confidence: 'HIGH', reasoning: '제목 자리에 본문', suggested: ['heading4'] },
                ],
                semanticColor: [
                    { nodeId: '2', name: 'alert', property: 'fill', token: 'colors.background.danger.100', verdict: 'FAIL', confidence: 'MED', reasoning: '경고 아님', suggested: [] },
                ],
            },
        });
        expect(payload.typography.violations[0].heuristic).toBe(true);
        expect(payload.typography.violations[0].severity).toBe('high');
        expect(payload.color.violations[0].heuristic).toBe(true);
    });

    it('적합률은 결정론 high + HIGH-confidence heuristic 만 부적합', () => {
        const payload = mergeScanPayload({
            deterministic: {
                color: { violations: [], conformant: [], total: 10 },
                space: { violations: [], conformant: [], total: 0 },
                dimension: { violations: [], conformant: [], total: 0 },
                typography: { violations: [], conformant: [], total: 0 },
                borderRadius: { violations: [], conformant: [], total: 0 },
                shadow: { violations: [], conformant: [], total: 0 },
            },
            llm: {
                typography: [],
                semanticColor: [
                    { nodeId: '1', name: 'a', property: 'fill', token: 'colors.background.primary.100', verdict: 'FAIL', confidence: 'HIGH', reasoning: '', suggested: [] },
                    { nodeId: '2', name: 'b', property: 'fill', token: 'colors.background.primary.100', verdict: 'FAIL', confidence: 'LOW', reasoning: '', suggested: [] },
                ],
            },
        });
        // 부적합 1건(HIGH), 비결정 1건(LOW). 적합률 = (10-1)/10 = 0.9
        expect(payload.color.summary.conformanceRate).toBeCloseTo(0.9);
    });

    it('verdict=PASS 인 heuristic 은 어디에도 기록하지 않는다', () => {
        const payload = mergeScanPayload({
            deterministic: {
                color: { violations: [], conformant: [], total: 1 },
                space: { violations: [], conformant: [], total: 0 },
                dimension: { violations: [], conformant: [], total: 0 },
                typography: { violations: [], conformant: [], total: 1 },
                borderRadius: { violations: [], conformant: [], total: 0 },
                shadow: { violations: [], conformant: [], total: 0 },
            },
            llm: {
                typography: [
                    { nodeId: '1', name: 'h', token: 'body2', verdict: 'PASS', confidence: 'HIGH', reasoning: '', suggested: [] },
                ],
                semanticColor: [],
            },
        });
        expect(payload.typography.violations.length).toBe(0);
        expect(payload.typography.conformant.length).toBe(0); // 결정론 conformant 입력 없음
    });
});
```

- [ ] **Step 5: merge.ts 구현**

```ts
// src/ui/features/llm/merge.ts
import type {
    Category,
    Conformant,
    EvaluateOutput,
    EvaluateSummary,
    ScanPayload,
    Violation,
} from '~/common/schemas';

import type { LlmColorJudgment, LlmJudgments, LlmTypoJudgment } from './parse';

type CategoryDet = { violations: Violation[]; conformant: Conformant[]; total: number };

export type MergeArgs = {
    deterministic: Record<Category, CategoryDet>;
    llm: LlmJudgments;
};

function heuristicTypo(j: LlmTypoJudgment): Violation {
    return {
        nodeId: j.nodeId,
        name: j.name,
        property: 'textStyle',
        token: j.token,
        value: null,
        type: 'typo-hierarchy',
        severity: 'high',
        detail: j.reasoning,
        suggested: j.suggested,
        heuristic: true,
        confidence: j.confidence,
        reasoning: j.reasoning,
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
        detail: j.reasoning,
        suggested: j.suggested,
        heuristic: true,
        confidence: j.confidence,
        reasoning: j.reasoning,
    };
}

function summarize(violations: Violation[], conformant: Conformant[], total: number): EvaluateSummary {
    const isFail = (v: Violation): boolean =>
        v.severity === 'high' && (!v.heuristic || v.confidence === 'HIGH');
    const high = violations.filter(isFail).length;
    const heuristics = violations.filter((v) => v.heuristic).length;
    const infos = violations.filter((v) => v.severity === 'info' || (v.heuristic && v.confidence !== 'HIGH')).length;
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
    const { deterministic, llm } = args;

    const colorHeuristics = llm.semanticColor.filter((j) => j.verdict === 'FAIL').map(heuristicColor);
    const typoHeuristics = llm.typography.filter((j) => j.verdict === 'FAIL').map(heuristicTypo);

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
    };
}
```

- [ ] **Step 6: runLlmEvaluation 흐름 재배선 (index.ts)**

```ts
// src/ui/features/llm/index.ts
import type { Category, RawExtract, ScanPayload } from '~/common/schemas';

import { evaluateColor } from '~/ui/lib/evaluate/color';
import { evaluateDimension } from '~/ui/lib/evaluate/dimension';
import { evaluateRadius } from '~/ui/lib/evaluate/radius';
import { evaluateShadow } from '~/ui/lib/evaluate/shadow';
import { evaluateSpace } from '~/ui/lib/evaluate/space';
import { evaluateTypography } from '~/ui/lib/evaluate/typography';
import { loadColorSchema } from '~/ui/lib/loaders/color';
import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';
import { applyRecommendations } from '~/ui/lib/recommend';
import { buildLlmInput } from '~/ui/lib/rubric';

import { LlmHttpError, LlmTimeoutError, postLiteLLM, type LlmEnv } from './client';
import { mergeScanPayload, type MergeArgs } from './merge';
import { LlmParseError, parseLlmResponse } from './parse';
import { buildRequest } from './prompt';

export type RunLlmEvaluationOptions = {
    signal?: AbortSignal;
    env?: LlmEnv;
    model?: string;
    frameName?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export async function runLlmEvaluation(
    extract: RawExtract,
    options: RunLlmEvaluationOptions = {},
): Promise<ScanPayload> {
    const env = options.env ?? envFromImportMeta();
    const model = options.model ?? importMetaModel() ?? DEFAULT_MODEL;
    const frameName = options.frameName ?? '';

    const colorSchema = loadColorSchema(extract.schemaMode);
    const dim = loadDimensionSchemas();
    const textStyleSchema = loadTextStyleSchema();

    const det = {
        color: { ...evaluateColor(extract.colors, colorSchema), total: extract.colors.length },
        space: { ...evaluateSpace(extract.spaces, dim.space), total: extract.spaces.length },
        dimension: { ...evaluateDimension(extract.dimensions, dim.dimension), total: extract.dimensions.length },
        typography: { ...evaluateTypography(extract.typography, textStyleSchema), total: extract.typography.length },
        borderRadius: { ...evaluateRadius(extract.radii, dim.borderRadius), total: extract.radii.length },
        shadow: { ...evaluateShadow(extract.shadows, dim.shadow), total: extract.shadows.length },
    } satisfies Record<Category, { violations: ReturnType<typeof evaluateColor>['violations']; conformant: ReturnType<typeof evaluateColor>['conformant']; total: number }>;

    const ctx = { colorSchema, space: dim.space, dimension: dim.dimension, borderRadius: dim.borderRadius, shadow: dim.shadow };
    for (const key of Object.keys(det) as Category[]) {
        det[key].violations = applyRecommendations(det[key].violations, ctx);
    }

    const llmInput = buildLlmInput({
        extract,
        deterministicConformant: { color: det.color.conformant, typography: det.typography.conformant },
        frameName,
        colorSchema,
        textStyleSchema,
    });

    const request = buildRequest(llmInput, model);
    const response = await postLiteLLM(request, { env, signal: options.signal });
    const judgments = parseLlmResponse(response);

    const mergeArgs: MergeArgs = { deterministic: det, llm: judgments };
    return mergeScanPayload(mergeArgs);
}

function envFromImportMeta(): LlmEnv {
    const baseUrl = importMetaString('VITE_LITELLM_BASE_URL');
    const apiKey = importMetaString('VITE_LITELLM_API_KEY');
    if (!baseUrl) throw new Error('VITE_LITELLM_BASE_URL 누락');
    if (!apiKey) throw new Error('VITE_LITELLM_API_KEY 누락');
    return { baseUrl, apiKey };
}

function importMetaModel(): string | undefined {
    return importMetaString('VITE_LITELLM_MODEL') || undefined;
}

function importMetaString(key: string): string | undefined {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    return env ? env[key] : undefined;
}

export { LlmHttpError, LlmTimeoutError, LlmParseError };
```

- [ ] **Step 7: vite.config.ui.ts 정리**

이미 사용자가 `@skill` alias 제거함. 변경 불필요. 확인만.

- [ ] **Step 8: client.ts의 `AnthropicMessagesRequest` import 경로 확인**

`client.ts`는 `'./prompt'`에서 `AnthropicMessagesRequest`를 import한다. 새 prompt.ts에 export됨 — 그대로 동작. 단 `AnthropicMessagesResponse`는 새 `parse.ts`에서 export됨.

- [ ] **Step 9: test + typecheck**

```bash
pnpm --filter figma-token-review-plugin test
pnpm --filter figma-token-review-plugin typecheck
```

- [ ] **Step 10: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/features/llm/ apps/figma-token-review-plugin/tests/features/llm/
git commit -m "feat(figma-token-review-plugin): rewire LLM flow for semantic-only judgment

prompt.ts: skill embed 제거 + 의미 판정 전용 system prompt + prompt caching.
parse.ts: LlmJudgments JSON 응답 파싱.
merge.ts: deterministic + heuristic → ScanPayload 합성 + 적합률 정책 적용.
index.ts: extract → 6 카테고리 evaluator → recommend → rubric → LLM → merge."
```

---

## Task 13: UI 6 카테고리 렌더링 + e2e wiring

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/pages/scan-result.tsx`
- Modify: `apps/figma-token-review-plugin/src/ui/components/violation-card/violation-card.tsx` (heuristic 배지, confidence 표시)

**Interfaces:**
- Consumes: `ScanPayload` (6 카테고리), `Violation` (heuristic/confidence/reasoning 필드).
- Produces: 사용자가 6 카테고리 탭을 보고 각 violation을 클릭하면 카드에 heuristic 배지 + confidence + reasoning + suggested[]가 표시된다.

UI 변경은 시각적 검증이므로 단위 test 대신 typecheck + build + 수동 smoke 로 확인.

- [ ] **Step 1: TabKey 6 카테고리화 + counts 함수 수정**

```tsx
// src/ui/pages/scan-result.tsx (해당 부분만 발췌)

type TabKey = 'color' | 'space' | 'dimension' | 'typography' | 'borderRadius' | 'shadow';

const FRAME_TAB_KEYS: TabKey[] = ['color', 'space', 'dimension', 'typography', 'borderRadius', 'shadow'];

const TAB_LABEL: Record<TabKey, string> = {
    color: 'Color',
    space: 'Space',
    dimension: 'Dimension',
    typography: 'Typography',
    borderRadius: 'Border Radius',
    shadow: 'Shadow',
};

function getViolationCounts(payload: ScanPayload): Record<TabKey, number> {
    return {
        color: payload.color.violations.length,
        space: payload.space.violations.length,
        dimension: payload.dimension.violations.length,
        typography: payload.typography.violations.length,
        borderRadius: payload.borderRadius.violations.length,
        shadow: payload.shadow.violations.length,
    };
}
```

`<Tabs.Panel>` 도 6개로:

```tsx
<Tabs.Panel value="color">
    <ViolationPanel violations={payload.color.violations} summary={payload.color.summary} />
</Tabs.Panel>
<Tabs.Panel value="space">
    <ViolationPanel violations={payload.space.violations} summary={payload.space.summary} />
</Tabs.Panel>
<Tabs.Panel value="dimension">
    <ViolationPanel violations={payload.dimension.violations} summary={payload.dimension.summary} />
</Tabs.Panel>
<Tabs.Panel value="typography">
    <ViolationPanel violations={payload.typography.violations} summary={payload.typography.summary} />
</Tabs.Panel>
<Tabs.Panel value="borderRadius">
    <ViolationPanel violations={payload.borderRadius.violations} summary={payload.borderRadius.summary} />
</Tabs.Panel>
<Tabs.Panel value="shadow">
    <ViolationPanel violations={payload.shadow.violations} summary={payload.shadow.summary} />
</Tabs.Panel>
```

- [ ] **Step 1b: violation-card.tsx의 PROPERTY_LABEL exhaustive 갱신**

`components/violation-card/violation-card.tsx` 의 `PROPERTY_LABEL: Record<ViolationType, string>` 객체에 `'semantic-misfit'`, `'typo-hierarchy'`, `'primitive-used'` 라벨을 추가한다. 누락 시 TypeScript exhaustive check가 실패한다. 한국어 라벨 예: 의미 부적합 / 위계 부적합 / Primitive 사용.

- [ ] **Step 2: ViolationCard에 heuristic 배지 + confidence 표시**

`components/violation-card/violation-card.tsx`의 헤더(혹은 메타 영역)에:

```tsx
{v.heuristic ? (
    <HStack $css={{ gap: '$050', alignItems: 'center' }}>
        <Badge size="sm" colorPalette="warning">의미 판정</Badge>
        <Badge size="sm" colorPalette={v.confidence === 'HIGH' ? 'primary' : 'hint'}>
            {v.confidence ?? 'MED'}
        </Badge>
    </HStack>
) : null}
```

`reasoning` 필드가 있는 경우(`v.heuristic`) 카드 본문에 `<Text typography="body4">{v.reasoning}</Text>` 노출. `detail`은 결정론 항목에서 사용.

- [ ] **Step 3: typecheck + build**

```bash
pnpm --filter figma-token-review-plugin typecheck
pnpm --filter figma-token-review-plugin build
```

Expected: 통과. dist/ 생성.

- [ ] **Step 4: 수동 smoke (Figma plugin runtime)**

`dist/manifest.json` 기준으로 Figma에 plugin import → 임의 frame 선택 → 검사. 6 카테고리 탭 모두 보이고, 카운트 표시, heuristic 카드의 배지가 노출되는 것을 확인.

> 자동화 어려우므로 manual verification only. 실패 시 plugin console 에러 + LLM 응답 raw를 캡쳐해서 디버그.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/pages/scan-result.tsx apps/figma-token-review-plugin/src/ui/components/violation-card/
git commit -m "feat(figma-token-review-plugin): render 6 category tabs + heuristic badges

scan-result 페이지를 color/space/dimension/typography/borderRadius/shadow
6 카테고리 탭으로 확장하고, ViolationCard 에 heuristic + confidence 배지를
표시한다."
```

---

## Self-Review

Spec(§3 책임 분담, §4 Plugin 결정론, §5 LLM, §6 출력 JSON, §9 영향 범위) 각 요구사항 → Task 매핑:

- 결정론 토큰 합법성 / scope matching: Tasks 3–8 (각 카테고리 evaluator)
- Primitive→Semantic, Raw→Token, scope-mismatch, fg-grade, do-not-use 대안 추천: Task 9 (`recommend.ts`)
- 신규 ViolationType `primitive-used`: Task 1 (schemas) + Task 3 (color evaluator)
- 6 카테고리 ScanPayload: Task 1 (schemas) + Task 12 (merge) + Task 13 (UI)
- LLM 입력 = 의미 판정 대상 + rubric 서브셋: Task 10 (`rubric.ts`) + Task 12 (`prompt.ts`)
- LLM 출력은 단일 `violations[]`에 `heuristic + confidence + reasoning`: Task 12 (`merge.ts`)
- 적합률은 confidence=HIGH heuristic만 부적합: Task 12 (`summarize()` in merge)
- skill 본체 무수정 + plugin 수동 복사: Task 1 (token JSON 복사 + MANIFEST)
- `vite.config.ui.ts`의 `@skill` alias 제거: Task 12 (확인 step) — 사용자가 이미 revert함
- 스크린샷 미사용 (MVP): Task 10 (rubric에 image 안 담음) + Task 12 (prompt에 image 없음)

Placeholder 스캔: 다른 task의 코드를 참조하는 패턴(`readSpaceToken` 등)은 Task 11 step 1에서 구현 의사코드를 인라인으로 제공. "TBD" / "implement later" 없음.

Type consistency 확인: `applyRecommendations` (T9) ↔ `evaluateColor` (T3) ↔ `mergeScanPayload` (T12) 모두 동일 `Violation` (T1) 사용. `LlmJudgments` (T12)는 `mergeScanPayload`의 `args.llm`과 동일 타입. `RecommendCtx` (T9)는 `loadDimensionSchemas` (T2)의 반환을 spread해서 호환.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-30-figma-token-review-plugin-deterministic-split.md`.

두 가지 실행 옵션:

1. **Subagent-Driven (recommended)** — 한 task당 fresh subagent dispatch, task 간 review, 빠른 iteration.
2. **Inline Execution** — 본 세션에서 `superpowers:executing-plans` skill로 batch 실행 + checkpoint.

어느 쪽으로 진행할까?
