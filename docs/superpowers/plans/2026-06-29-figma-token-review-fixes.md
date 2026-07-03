# Figma Token Review Plugin Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/figma-token-review-plugin`에서 (a) 🟨/🔶 prefix 노드 추출 제외, (b) AI 응답 schema 강제(필드/타입/한국어), (c) `suggested[0]` 첫글자 버그 등 UI 표시 정합.

**Architecture:** 4개 파일 국소 수정. schema 먼저 확장 → 추출기 가드 → LLM 프롬프트 재작성 → UI 라벨 매핑 확장. 각 task는 typecheck + lint 통과로 검증. UI 동작 최종은 빌드 후 Figma 플러그인 수동 스캔.

**Tech Stack:** TypeScript, React 19, Vapor UI, Vite, Anthropic Messages API (via LiteLLM). 테스트 러너 없음 — 검증 게이트는 `pnpm typecheck` / `pnpm lint` / 수동 스캔.

## Global Constraints

- Workspace cwd: `/Users/goorm/01_works/vapor/apps/figma-token-review-plugin`
- 명령은 `pnpm` 사용 (`pnpm typecheck`, `pnpm lint`, `pnpm build`)
- 변경 파일: `src/shared/schema.ts`, `src/plugin/call-evaluator.ts`, `src/ui/evaluator/prompt.ts`, `src/ui/components/violation-card/violation-card.tsx`
- spec 단일 SSOT: `docs/superpowers/specs/2026-06-29-figma-token-review-fixes-design.md`
- 코드 자연어 주석 / 토큰 키는 영어 유지. AI 응답의 `detail` / `suggested` 자연어 부분만 한국어
- 각 task 종료 후 commit (Conventional Commits: `feat` / `fix` / `refactor` / `docs`)

---

### Task 1: Schema 확장 — ViolationType / Summary / rubric

**Files:**
- Modify: `apps/figma-token-review-plugin/src/shared/schema.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  ```ts
  type ViolationType =
    | 'token-not-used' | 'unknown-token' | 'do-not-use'
    | 'role-mismatch' | 'fg-grade-mismatch' | 'fg-grade-ambiguous'
    | 'typo-raw' | 'typo-styled-override';

  type EvaluateSummary = {
    total: number;
    conformCount: number;
    conformanceRate: number | null;
    highViolations: number;
    infoFlags: number;
  };

  type EvaluateOutput = {
    violations: Violation[];
    conformant: Conformant[];
    summary: EvaluateSummary;
    rubric?: Record<string, unknown>;
  };
  ```

- [ ] **Step 1: 현재 schema.ts 확인**

Run:
```bash
touch /tmp/bash-raw-unlock && cat apps/figma-token-review-plugin/src/shared/schema.ts ; rm /tmp/bash-raw-unlock
```

기존 `ViolationType` union 6종 / `EvaluateOutput.summary` 필드명 확인. 다음 Step에서 정확한 위치에 Edit하기 위함.

- [ ] **Step 2: `ViolationType`에 typography 2종 추가**

Edit `apps/figma-token-review-plugin/src/shared/schema.ts`:

```ts
export type ViolationType =
    | 'token-not-used'
    | 'unknown-token'
    | 'do-not-use'
    | 'role-mismatch'
    | 'fg-grade-mismatch'
    | 'fg-grade-ambiguous'
    | 'typo-raw'
    | 'typo-styled-override';
```

- [ ] **Step 3: `EvaluateOutput.summary` 필드명 정합 + `rubric` 추가**

기존 `summary: { violationsCount, highSeverity }` 등을 다음으로 교체:

```ts
export type EvaluateSummary = {
    total: number;
    conformCount: number;
    conformanceRate: number | null;
    highViolations: number;
    infoFlags: number;
};

export type EvaluateOutput = {
    violations: Violation[];
    conformant: Conformant[];
    summary: EvaluateSummary;
    rubric?: Record<string, unknown>;
};
```

(현재 schema가 inline summary 객체면 `EvaluateSummary` 별도 type alias로 추출.)

- [ ] **Step 4: 영향 받는 곳 확인**

Run:
```bash
touch /tmp/bash-raw-unlock && grep -rn "violationsCount\|highSeverity\|summary\." apps/figma-token-review-plugin/src ; rm /tmp/bash-raw-unlock
```

다른 곳에서 옛 필드명(`violationsCount`, `highSeverity`)을 참조하면 그 자리에서 신규 필드명(`highViolations`, `infoFlags`)으로 함께 수정. parse.ts의 `isScanPayload`도 보고 필드 체크가 깨지면 신규 필드명 적용.

- [ ] **Step 5: Typecheck**

```bash
cd apps/figma-token-review-plugin && pnpm typecheck
```

Expected: PASS. FAIL 시 Step 4 누락 — 옛 필드 참조 찾아서 정리.

- [ ] **Step 6: Lint**

```bash
cd apps/figma-token-review-plugin && pnpm lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/figma-token-review-plugin/src
git commit -m "refactor(figma-token-review-plugin): align Violation/Summary schema with evaluator output"
```

---

### Task 2: SKIP_PREFIXES 가드 — 🟨/🔶 노드 추출 제외

**Files:**
- Modify: `apps/figma-token-review-plugin/src/plugin/call-evaluator.ts`

**Interfaces:**
- Consumes: 없음 (Task 1과 독립이지만 순서상 schema 후)
- Produces: `visit()`가 `SKIP_PREFIXES` 시작 노드의 서브트리 전체를 추출 대상에서 제외

- [ ] **Step 1: visit() 위치 확인**

Run:
```bash
touch /tmp/bash-raw-unlock && grep -n "function visit\|async function visit" apps/figma-token-review-plugin/src/plugin/call-evaluator.ts ; rm /tmp/bash-raw-unlock
```

visit 함수 시작 라인 확인.

- [ ] **Step 2: SKIP_PREFIXES 상수 + 가드 함수 추가**

`src/plugin/call-evaluator.ts` 상단부(import 직후, `MODE` 상수 근처)에 추가:

```ts
const SKIP_PREFIXES = ['🟨', '🔶'] as const;

function shouldSkipNode(name: string): boolean {
    return SKIP_PREFIXES.some((p) => name.startsWith(p));
}
```

- [ ] **Step 3: visit() 진입 가드**

`visit` 함수 본문 첫 줄을 변경:

```ts
async function visit(node: SceneNode): Promise<void> {
    if (shouldSkipNode(node.name)) return;
    visited++;
    // ... 이하 기존 로직
}
```

서브트리도 차단됨 (재귀 진입 전 return).

- [ ] **Step 4: 가드 함수 단위 검증 (inline)**

```bash
node -e '
const SKIP=["🟨","🔶"];
const should=(n)=>SKIP.some(p=>n.startsWith(p));
const cases=[
  ["🟨Warn/foo", true],
  ["🔶InteractionLayer/Normal", true],
  ["Frame 18", false],
  ["🎨 Icon Color", false],
  ["Label", false],
];
for (const [n,exp] of cases){
  const got=should(n);
  if (got!==exp){console.error("FAIL",n,"got",got,"exp",exp);process.exit(1);}
}
console.log("ok",cases.length);
'
```

Expected: `ok 5`. 실패하면 Step 2의 함수 로직 재검토.

- [ ] **Step 5: Typecheck**

```bash
cd apps/figma-token-review-plugin && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Lint**

```bash
cd apps/figma-token-review-plugin && pnpm lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/figma-token-review-plugin/src/plugin/call-evaluator.ts
git commit -m "feat(figma-token-review-plugin): skip 🟨/🔶 prefixed nodes during extraction"
```

---

### Task 3: SYSTEM_PROMPT 재작성 — schema 강제 + 한국어 locale

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/evaluator/prompt.ts`

**Interfaces:**
- Consumes: Task 1의 `ViolationType` (typo-* 포함) / `EvaluateSummary`
- Produces: `SYSTEM_PROMPT` 상수가 LLM에 정확한 출력 스키마 강제

- [ ] **Step 1: 현재 prompt.ts 확인**

Run:
```bash
touch /tmp/bash-raw-unlock && cat apps/figma-token-review-plugin/src/ui/evaluator/prompt.ts ; rm /tmp/bash-raw-unlock
```

기존 `SYSTEM_PROMPT` 문자열 / export 명세 확인.

- [ ] **Step 2: SYSTEM_PROMPT 재작성**

`SYSTEM_PROMPT` 본문을 다음으로 교체:

```ts
import type { RawExtract } from '~/shared/schema';

export const SYSTEM_PROMPT = [
    'You are the vapor design token reviewer.',
    'Apply the rules in .claude/skills/figma-token-review/scripts/evaluate.mjs (color)',
    'and typography-evaluate.mjs (typography) by reasoning. You do NOT execute code.',
    '',
    'Input (user message): a RawExtract JSON describing Figma frame extraction.',
    '',
    'Output: a single JSON object — no markdown fences, no prose around it.',
    'Top-level shape:',
    '{',
    '  "color": EvaluateOutput,',
    '  "typography": EvaluateOutput',
    '}',
    '',
    'EvaluateOutput = {',
    '  "violations": Violation[],',
    '  "conformant": Conformant[],',
    '  "summary": {',
    '    "total": number,',
    '    "conformCount": number,',
    '    "conformanceRate": number | null,',
    '    "highViolations": number,',
    '    "infoFlags": number',
    '  },',
    '  "rubric"?: object',
    '}',
    '',
    'Violation = {',
    '  "nodeId": string,           // required. group violation: copy nodeIds[0] here',
    '  "nodeIds"?: string[],       // optional grouping',
    '  "count"?: number,',
    '  "name": string,             // figma node name verbatim',
    '  "token": string | null,     // current token key (null when raw)',
    '  "type": ViolationType,',
    '  "severity": "high" | "info",',
    '  "detail": string,           // Korean natural language',
    '  "suggested": string[]       // ARRAY of token keys. NEVER a string. NEVER "A or B"',
    '}',
    '',
    'ViolationType =',
    '  | "token-not-used" | "unknown-token" | "do-not-use"',
    '  | "role-mismatch" | "fg-grade-mismatch" | "fg-grade-ambiguous"',
    '  | "typo-raw" | "typo-styled-override";',
    '',
    'Conformant = {',
    '  "nodeId": string,',
    '  "nodeIds"?: string[],',
    '  "name": string,',
    '  "token": string',
    '}',
    '',
    'Hard rules (any violation = invalid output):',
    '- `suggested` MUST be a JSON array. Multiple candidates → multiple array elements:',
    '  `["colors.foreground.normal.100", "colors.foreground.hint.100"]`.',
    '  No candidates → `[]`. NEVER emit a string. NEVER use "A or B" syntax.',
    '- Every Violation MUST include `nodeId` (string). Group violation: copy `nodeIds[0]`.',
    '- `type` and `severity` are required on every Violation.',
    '- Typography violations use the same base shape. Encode typography-only context',
    '  (characters, textStyle, appliedStatus, overriddenFields) inside `detail` as Korean prose.',
    '- `detail` and natural-language portions of `suggested` MUST be Korean.',
    '  Token keys (e.g. `colors.foreground.normal.100`) stay English.',
    '- Output the JSON object only. No markdown, no preamble, no trailing prose.',
].join('\n');

export function buildUserMessage(extract: RawExtract): string {
    return JSON.stringify(extract);
}
```

기존 파일에 `buildUserMessage` 같은 헬퍼가 이미 있고 시그니처가 다르면 그대로 두고 SYSTEM_PROMPT만 교체.

- [ ] **Step 3: Typecheck**

```bash
cd apps/figma-token-review-plugin && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 4: Lint**

```bash
cd apps/figma-token-review-plugin && pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/evaluator/prompt.ts
git commit -m "fix(figma-token-review-plugin): force schema-compliant Korean JSON output in system prompt"
```

---

### Task 4: violation-card PROPERTY_LABEL 확장 — typography 라벨 추가

**Files:**
- Modify: `apps/figma-token-review-plugin/src/ui/components/violation-card/violation-card.tsx`

**Interfaces:**
- Consumes: Task 1의 확장된 `ViolationType`
- Produces: `PROPERTY_LABEL` Record가 모든 8종 type을 매핑 → typescript exhaustiveness 만족

- [ ] **Step 1: PROPERTY_LABEL 확장**

`apps/figma-token-review-plugin/src/ui/components/violation-card/violation-card.tsx`의 `PROPERTY_LABEL` 정의를 다음으로 교체:

```ts
const PROPERTY_LABEL: Record<Violation['type'], string> = {
    'token-not-used': 'Fill',
    'unknown-token': 'Fill',
    'do-not-use': 'Fill',
    'role-mismatch': 'Role',
    'fg-grade-mismatch': 'Text',
    'fg-grade-ambiguous': 'Text',
    'typo-raw': 'Typography',
    'typo-styled-override': 'Typography',
};
```

`Record<Violation['type'], string>` 덕분에 typeof violation.type union이 변하면 typecheck가 누락 키를 즉시 잡음.

- [ ] **Step 2: Typecheck**

```bash
cd apps/figma-token-review-plugin && pnpm typecheck
```

Expected: PASS. FAIL with "Property 'typo-raw' is missing" → Step 1 객체 누락 확인.

- [ ] **Step 3: Lint**

```bash
cd apps/figma-token-review-plugin && pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/figma-token-review-plugin/src/ui/components/violation-card/violation-card.tsx
git commit -m "feat(figma-token-review-plugin): map typography violation types in PROPERTY_LABEL"
```

---

### Task 5: 통합 빌드 + 수동 검증

**Files:** 없음 (검증 only)

**Interfaces:** 모든 이전 task가 한 번에 적재돼 실제 Figma 환경에서 동작하는지 확인

- [ ] **Step 1: 전체 빌드**

```bash
cd apps/figma-token-review-plugin && pnpm build
```

Expected: PASS. `dist/` 산출 확인:

```bash
ls apps/figma-token-review-plugin/dist
```

`manifest.json`, UI / plugin 번들 존재 확인.

- [ ] **Step 2: Figma 데스크탑에서 플러그인 로드**

수동:
1. Figma 데스크탑 앱 → Plugins → Development → Import plugin from manifest
2. `apps/figma-token-review-plugin/dist/manifest.json` 선택
3. 검증 대상 프레임이 있는 파일 열기
4. 플러그인 실행

- [ ] **Step 3: 케이스 A — 🟨/🔶 노드 스킵 확인**

프레임 안에 `🟨` 또는 `🔶`로 시작하는 노드 포함된 상태에서 스캔:
- 결과 카드에서 해당 노드명이 등장하지 않으면 PASS
- `test.json`에 있던 `🔶InteractionLayer/Normal/omitPressed` 같은 항목이 violation/conformant 어디에도 없어야 함

- [ ] **Step 4: 케이스 B — suggested 토큰 전체 표시**

색상 violation 카드에서:
- 이전: `c` / `b` / `h` 같은 한 글자만 표시되던 자리
- 현재: `colors.foreground.normal.100` 같은 전체 토큰 키 표시
PASS = 한 글자 표시 0건.

- [ ] **Step 5: 케이스 C — 한국어 detail**

violation detail 본문이 한국어 문장 (예: "변수 미바인딩 — 토큰을 사용하세요"). 영어 문장이 나오면 FAIL → SYSTEM_PROMPT의 한국어 강제 강도 보강 필요(별도 task로 회수).

- [ ] **Step 6: 케이스 D — PROPERTY_LABEL 매핑**

typography violation 카드 헤더 라벨이 "Typography" 표기. 빈 라벨 / undefined 표시 0건 = PASS.

- [ ] **Step 7: 결과 기록 + 최종 커밋 (선택)**

위 4 케이스 모두 PASS면 작업 종료. 기록할 메모 있으면:

```bash
git commit --allow-empty -m "chore(figma-token-review-plugin): verify fixes against live frame"
```

FAIL 항목 있으면 해당 task로 돌아가 보강.

---

## Self-Review

### Spec 커버리지

| Spec 섹션 | 구현 task |
|---|---|
| §1 SKIP_PREFIXES 가드 | Task 2 |
| §2 SYSTEM_PROMPT 재작성 (suggested string[], type/severity 필수, 한국어) | Task 3 |
| §3 schema.ts 정합 (ViolationType + summary + rubric) | Task 1 |
| §4 UI PROPERTY_LABEL 확장 | Task 4 |
| 데이터 흐름 검증 | Task 5 |
| 테스트(수동) | Task 5 Step 3~6 |

전 spec 항목 커버. 누락 없음.

### Placeholder scan

"TBD" / "TODO" / "implement later" / "add appropriate error handling" / "similar to Task N" 없음. 모든 코드 step은 실제 코드 블록 포함. 모든 명령은 실제 실행 가능한 형태.

### Type consistency

- `ViolationType` Task 1에서 8종 union으로 정의 → Task 3 SYSTEM_PROMPT 문자열 내 8종 동일 → Task 4 `PROPERTY_LABEL` 8키 동일.
- `EvaluateSummary` 5필드 Task 1 정의 → Task 3 SYSTEM_PROMPT 5필드 명세 동일.
- `Violation` 필드 (`nodeId`, `nodeIds?`, `count?`, `name`, `token`, `type`, `severity`, `detail`, `suggested: string[]`) Task 1 schema와 Task 3 SYSTEM_PROMPT 사이 1:1 일치.
- `shouldSkipNode(name: string): boolean` Task 2에서 정의, Task 2 내부에서만 사용 — 누수 없음.
