# figma-token-review-plugin — Naming Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/figma-token-review-plugin`에서 "evaluator" 이름 충돌 제거 — plugin 측은 `extract`로, ui 측은 `libs/llm`으로 분리.

**Architecture:** 3개 task, 모두 mechanical rename / move. 동작 변경 없음. 각 task는 typecheck + lint + build 통과로 검증.

**Tech Stack:** TypeScript, Vite, pnpm workspace. 테스트 러너 없음 — `pnpm typecheck` + `pnpm lint` + `pnpm build`가 검증 게이트.

## Global Constraints

- Workspace cwd: `/Users/goorm/01_works/vapor/apps/figma-token-review-plugin`
- Spec SSOT: `docs/superpowers/specs/2026-06-29-figma-token-review-plugin-naming-cleanup-design.md`
- 영향 파일은 spec §"영향 파일 (총 8)" 표대로
- Plugin 측 함수명: `callEvaluator` → `extractFrame`
- UI 측 디렉토리: `src/ui/evaluator/` → `src/ui/libs/llm/`
- UI 측 심볼: `Evaluator*` → `Llm*` (Env / HttpError / TimeoutError / ParseError / runEvaluation→runLlmEvaluation / RunEvaluationOptions→RunLlmEvaluationOptions)
- 유지 심볼: `postLiteLLM`, `parseScanPayload`, `buildRequest`, `SYSTEM_PROMPT`, `AnthropicMessagesRequest/Response`
- 동작 변경 / 새 기능 / 테스트 도입 금지
- 각 task 종료 후 Conventional Commit

---

### Task 1: Plugin 측 — `extract.ts`로 이름/파일 정리

**Files:**
- Move: `apps/figma-token-review-plugin/src/plugin/call-evaluator.ts` → `apps/figma-token-review-plugin/src/plugin/extract.ts`
- Modify (in moved file): `export async function callEvaluator` → `export async function extractFrame`
- Modify: `apps/figma-token-review-plugin/src/plugin/handlers/scan.ts` — import path + 호출 식별자

**Interfaces:**
- Consumes: 없음
- Produces:
  ```ts
  // src/plugin/extract.ts
  export async function extractFrame(frameId: string): Promise<RawExtract>;
  ```

- [ ] **Step 1: 현재 import 위치 확인**

Run:
```bash
touch /tmp/bash-raw-unlock && grep -rn "call-evaluator\|callEvaluator" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/src ; rm /tmp/bash-raw-unlock
```

Expected: 정확히 3 hit
- `src/plugin/call-evaluator.ts:<line>: export async function callEvaluator`
- `src/plugin/handlers/scan.ts:2: import { callEvaluator } from '../call-evaluator'`
- `src/plugin/handlers/scan.ts:25:            const payload = await callEvaluator(msg.frameId)`

Hit 더 많거나 적으면 STOP — 가정과 다른 callsite 존재. spec 재검토 필요.

- [ ] **Step 2: 파일 이동**

```bash
cd /Users/goorm/01_works/vapor
git mv apps/figma-token-review-plugin/src/plugin/call-evaluator.ts apps/figma-token-review-plugin/src/plugin/extract.ts
```

- [ ] **Step 3: 함수명 rename**

Edit `apps/figma-token-review-plugin/src/plugin/extract.ts`:

```ts
// before
export async function callEvaluator(frameId: string): Promise<RawExtract> {
// after
export async function extractFrame(frameId: string): Promise<RawExtract> {
```

내부 자기참조 (있다면 — `callEvaluator`를 본문 안에서 호출하는 코드)도 모두 `extractFrame`으로. 통상은 없음.

- [ ] **Step 4: handlers/scan.ts 갱신**

Edit `apps/figma-token-review-plugin/src/plugin/handlers/scan.ts`:

```ts
// before
import { callEvaluator } from '../call-evaluator';
// after
import { extractFrame } from '../extract';
```

호출 라인:

```ts
// before
const payload = await callEvaluator(msg.frameId);
// after
const payload = await extractFrame(msg.frameId);
```

- [ ] **Step 5: Typecheck**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Lint**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm lint
```

Expected: PASS.

- [ ] **Step 7: 잔존 참조 회귀 확인**

```bash
touch /tmp/bash-raw-unlock && grep -rn "call-evaluator\|callEvaluator" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/src ; rm /tmp/bash-raw-unlock
```

Expected: 0 hit.

- [ ] **Step 8: Commit**

```bash
cd /Users/goorm/01_works/vapor
git add apps/figma-token-review-plugin/src/plugin
git commit -m "refactor(figma-token-review-plugin): rename plugin/call-evaluator to plugin/extract"
```

---

### Task 2: UI 측 — `libs/llm/`로 이전 + `Llm*` 심볼 정합

**Files:**
- Move: `apps/figma-token-review-plugin/src/ui/evaluator/` (4 files) → `apps/figma-token-review-plugin/src/ui/libs/llm/`
  - `index.ts`, `client.ts`, `parse.ts`, `prompt.ts`
- Modify (in moved `client.ts`): `EvaluatorEnv` / `EvaluatorHttpError` / `EvaluatorTimeoutError` symbol rename
- Modify (in moved `parse.ts`): `EvaluatorParseError` symbol rename
- Modify (in moved `index.ts`): `runEvaluation` / `RunEvaluationOptions` rename + re-export 명 정합
- Modify: `apps/figma-token-review-plugin/src/ui/bus/dispatcher.ts` — import 경로 + 심볼

**Interfaces:**
- Consumes: 없음
- Produces:
  ```ts
  // src/ui/libs/llm/index.ts
  export type RunLlmEvaluationOptions = { signal?: AbortSignal; env?: LlmEnv; model?: string };
  export async function runLlmEvaluation(extract: RawExtract, options?: RunLlmEvaluationOptions): Promise<ScanPayload>;
  export { LlmHttpError, LlmTimeoutError, LlmParseError };

  // src/ui/libs/llm/client.ts
  export type LlmEnv = { baseUrl: string; apiKey: string };
  export class LlmHttpError extends Error { status: number; bodyText: string; }
  export class LlmTimeoutError extends Error {}
  export async function postLiteLLM(request: AnthropicMessagesRequest, options: PostOptions): Promise<AnthropicMessagesResponse>;

  // src/ui/libs/llm/parse.ts
  export class LlmParseError extends Error {}
  export function parseScanPayload(response: AnthropicMessagesResponse): ScanPayload;
  ```

- [ ] **Step 1: 현재 evaluator 참조 확인**

Run:
```bash
touch /tmp/bash-raw-unlock && grep -rn "from '.*evaluator\|from \"~/ui/evaluator\|Evaluator\(Env\|HttpError\|TimeoutError\|ParseError\)\|runEvaluation\|RunEvaluationOptions" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/src ; rm /tmp/bash-raw-unlock
```

Expected callsites:
- `src/ui/evaluator/index.ts` — internal
- `src/ui/evaluator/client.ts` — internal
- `src/ui/evaluator/parse.ts` — internal
- `src/ui/bus/dispatcher.ts:4: import { EvaluatorHttpError, EvaluatorParseError, runEvaluation } from '../evaluator';`

추가 callsite 발견 시 STOP — spec 가정과 다름.

- [ ] **Step 2: 디렉토리 이동**

```bash
cd /Users/goorm/01_works/vapor
mkdir -p apps/figma-token-review-plugin/src/ui/libs
git mv apps/figma-token-review-plugin/src/ui/evaluator apps/figma-token-review-plugin/src/ui/libs/llm
```

- [ ] **Step 3: client.ts 심볼 rename**

Edit `apps/figma-token-review-plugin/src/ui/libs/llm/client.ts`:

```ts
// before
export type EvaluatorEnv = {
// after
export type LlmEnv = {
```

```ts
// before
export class EvaluatorHttpError extends Error {
    readonly status: number;
    readonly bodyText: string;
    constructor(message: string, status: number, bodyText: string) {
        super(message);
        this.name = 'EvaluatorHttpError';
// after
export class LlmHttpError extends Error {
    readonly status: number;
    readonly bodyText: string;
    constructor(message: string, status: number, bodyText: string) {
        super(message);
        this.name = 'LlmHttpError';
```

```ts
// before
export class EvaluatorTimeoutError extends Error {
    constructor(message = 'LLM 호출 timeout (60s)') {
        super(message);
        this.name = 'EvaluatorTimeoutError';
// after
export class LlmTimeoutError extends Error {
    constructor(message = 'LLM 호출 timeout (60s)') {
        super(message);
        this.name = 'LlmTimeoutError';
```

`PostOptions.env: EvaluatorEnv` 타입 참조도 `LlmEnv`로:

```ts
// before
export type PostOptions = {
    env: EvaluatorEnv;
// after
export type PostOptions = {
    env: LlmEnv;
```

내부에서 `EvaluatorHttpError`를 던지는 코드도 `LlmHttpError`로 모두 교체 (catch / instanceof 포함).

- [ ] **Step 4: parse.ts 심볼 rename**

Edit `apps/figma-token-review-plugin/src/ui/libs/llm/parse.ts`:

```ts
// before
export class EvaluatorParseError extends Error {
    // ...
    this.name = 'EvaluatorParseError';
// after
export class LlmParseError extends Error {
    // ...
    this.name = 'LlmParseError';
```

`throw new EvaluatorParseError(...)` 모든 호출도 `throw new LlmParseError(...)`로.

- [ ] **Step 5: index.ts 심볼 rename**

Edit `apps/figma-token-review-plugin/src/ui/libs/llm/index.ts`:

```ts
// before
import type { EvaluatorEnv } from './client';
import { EvaluatorHttpError, EvaluatorTimeoutError, postLiteLLM } from './client';
import { EvaluatorParseError, parseScanPayload } from './parse';
import { buildRequest } from './prompt';

export type RunEvaluationOptions = {
    signal?: AbortSignal;
    env?: EvaluatorEnv;
    model?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export async function runEvaluation(
    extract: RawExtract,
    options: RunEvaluationOptions = {},
): Promise<ScanPayload> {
    const env = options.env ?? envFromImportMeta();
    // ...
}

function envFromImportMeta(): EvaluatorEnv {
    // ...
}

// ...
export { EvaluatorHttpError, EvaluatorTimeoutError, EvaluatorParseError };
// after
import type { LlmEnv } from './client';
import { LlmHttpError, LlmTimeoutError, postLiteLLM } from './client';
import { LlmParseError, parseScanPayload } from './parse';
import { buildRequest } from './prompt';

export type RunLlmEvaluationOptions = {
    signal?: AbortSignal;
    env?: LlmEnv;
    model?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export async function runLlmEvaluation(
    extract: RawExtract,
    options: RunLlmEvaluationOptions = {},
): Promise<ScanPayload> {
    const env = options.env ?? envFromImportMeta();
    // ...
}

function envFromImportMeta(): LlmEnv {
    // ...
}

// ...
export { LlmHttpError, LlmTimeoutError, LlmParseError };
```

`envFromImportMeta` / `importMetaModel` / `importMetaString` 등 다른 로컬 함수 본문은 변경 없음 — `EvaluatorEnv`를 `LlmEnv`로 type만 교체.

- [ ] **Step 6: dispatcher.ts 갱신**

Edit `apps/figma-token-review-plugin/src/ui/bus/dispatcher.ts`:

```ts
// before
import { EvaluatorHttpError, EvaluatorParseError, runEvaluation } from '../evaluator';
// after
import { LlmHttpError, LlmParseError, runLlmEvaluation } from '../libs/llm';
```

이어서 같은 파일에서 `runEvaluation(...)` 호출도 `runLlmEvaluation(...)`로:

```ts
// before
const payload = await runEvaluation(msg.payload, { signal: controller.signal });
// after
const payload = await runLlmEvaluation(msg.payload, { signal: controller.signal });
```

그리고 `instanceof EvaluatorHttpError` / `instanceof EvaluatorParseError` 분기를 `LlmHttpError` / `LlmParseError`로:

```ts
// before
if (err instanceof EvaluatorHttpError) {
    if (err.status === 401 || err.status === 403) return 'API 키를 확인하세요.';
    if (err.status === 429) return '요청이 많습니다. 잠시 후 다시 시도해 주세요.';
    return `LLM 호출 실패 (${err.status})`;
}
if (err instanceof EvaluatorParseError) return 'LLM 응답 형식 오류';
// after
if (err instanceof LlmHttpError) {
    if (err.status === 401 || err.status === 403) return 'API 키를 확인하세요.';
    if (err.status === 429) return '요청이 많습니다. 잠시 후 다시 시도해 주세요.';
    return `LLM 호출 실패 (${err.status})`;
}
if (err instanceof LlmParseError) return 'LLM 응답 형식 오류';
```

- [ ] **Step 7: Typecheck**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 8: Lint**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm lint
```

Expected: PASS.

- [ ] **Step 9: 잔존 참조 회귀 확인**

```bash
touch /tmp/bash-raw-unlock && grep -rn "Evaluator\(Env\|HttpError\|TimeoutError\|ParseError\)\|runEvaluation\|RunEvaluationOptions\|from '.*evaluator'\|from \"~/ui/evaluator" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/src ; rm /tmp/bash-raw-unlock
```

Expected: 0 hit.

- [ ] **Step 10: Build**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm build
```

Expected: PASS. `dist/{code.js, index.html, manifest.json}` 산출.

- [ ] **Step 11: Commit**

```bash
cd /Users/goorm/01_works/vapor
git add apps/figma-token-review-plugin/src
git commit -m "refactor(figma-token-review-plugin): move ui/evaluator to ui/libs/llm with Llm* symbol family"
```

---

### Task 3: ARCHITECTURE.md 동기화

**Files:**
- Modify: `apps/figma-token-review-plugin/ARCHITECTURE.md`

**Interfaces:**
- Consumes: Task 1 + Task 2의 새 이름들
- Produces: 없음 (문서만)

- [ ] **Step 1: 현재 evaluator 참조 위치 파악**

```bash
touch /tmp/bash-raw-unlock && grep -n "call-evaluator\|evaluator\|callEvaluator" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/ARCHITECTURE.md ; rm /tmp/bash-raw-unlock
```

각 hit 라인을 확인하고 (a) plugin 측 추출 언급인지 (b) ui 측 LLM 판정 언급인지 분류.

- [ ] **Step 2: 외과적 교체**

각 hit에 대해:
- plugin 추출 맥락 → `plugin/extract` (함수 언급 시 `extractFrame`)
- ui LLM 판정 맥락 → `ui/libs/llm` (함수 언급 시 `runLlmEvaluation`)

문서 구조 / 한국어 문장은 보존. 식별자 토큰만 외과적 교체. 새 문장 추가 / 절 재배열 금지.

만약 문서가 1단/2단 구분을 명시하지 않은 상태라면, 모듈 트리 섹션 끝에 다음 한 줄 추가:

```
- `plugin/extract`: 1단(결정론) RawExtract 추출. LLM 호출 없음.
- `ui/libs/llm`: 2단 LLM 판정. RawExtract → ScanPayload.
```

문서가 이미 두 단계를 구분해 설명하고 있다면 위 한 줄 추가는 생략.

- [ ] **Step 3: 빌드 영향 없음 확인 (smoke)**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm typecheck && pnpm lint
```

문서만 바꿨으므로 두 명령 모두 PASS. 변동 없음 확인용.

- [ ] **Step 4: Commit**

```bash
cd /Users/goorm/01_works/vapor
git add apps/figma-token-review-plugin/ARCHITECTURE.md
git commit -m "docs(figma-token-review-plugin): sync ARCHITECTURE.md with new module names"
```

---

## Self-Review

### Spec 커버리지

| Spec 섹션 | 구현 task |
|---|---|
| §"Plugin 측 — 1단 추출" | Task 1 |
| §"UI 측 — 2단 LLM 판정" (디렉토리 이동 + 심볼 rename + callsite 갱신) | Task 2 |
| §"문서 — ARCHITECTURE.md" | Task 3 |
| §"영향 파일 (총 8)" — 표의 8 항목 | Task 1 (2 항목) + Task 2 (5 항목) + Task 3 (1 항목) |
| §"검증" — typecheck/lint/build | Task 1 Step 5-6, Task 2 Step 7-8 + 10, Task 3 Step 3 |
| §"비목표" 준수 (오케스트레이션 분리 / 새 기능 / 테스트 도입 금지) | 모든 task가 mechanical rename만 |

전 spec 항목 커버.

### Placeholder scan

"TBD" / "TODO" / "fill in" / "add appropriate" / "similar to Task N" 없음. 모든 코드 step은 before/after 코드 블록 포함. 모든 명령은 실제 실행 가능 형태.

### Type consistency

- Plugin 측: Task 1에서 `extractFrame(frameId: string): Promise<RawExtract>` 정의 — handlers/scan.ts에서 동일 시그니처로 호출.
- UI 측: Task 2에서 `runLlmEvaluation(extract, options)`, `LlmEnv`, `LlmHttpError`, `LlmTimeoutError`, `LlmParseError` 정의 — dispatcher.ts에서 import 시 동일 이름 사용.
- 유지 심볼 (`postLiteLLM`, `parseScanPayload`, `buildRequest`, `SYSTEM_PROMPT`, `AnthropicMessagesRequest/Response`) — rename 대상 아님, 모든 task에서 그대로 사용.
