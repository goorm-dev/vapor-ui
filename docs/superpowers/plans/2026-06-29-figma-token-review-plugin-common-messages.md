# figma-token-review-plugin — common/messages 통합 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/figma-token-review-plugin`의 메시징 layer를 워크스페이스의 `apps/figma-plugin` 컨벤션 (`common/messages.ts` + `messages` 용어)에 맞춰 재구성.

**Architecture:** 2 task. Task 1은 파일 이동/통합 + 모든 callsite import 경로 갱신을 한 atomic 단위로 수행 (중간 상태에서 typecheck 깨짐 방지). Task 2는 ARCHITECTURE.md 동기화.

**Tech Stack:** TypeScript, Vite, pnpm workspace. 테스트 러너 없음 — `pnpm typecheck` + `pnpm lint` + `pnpm build`가 검증 게이트.

## Global Constraints

- Workspace cwd: `/Users/goorm/01_works/vapor/apps/figma-token-review-plugin`
- Spec SSOT: `docs/superpowers/specs/2026-06-29-figma-token-review-plugin-common-messages-design.md`
- 새 모듈 트리 (spec §"새 모듈 구조"):
  ```
  src/
  ├── common/messages.ts             # 모든 types + Envelope + newRequestId + postToCode + postToUi
  ├── plugin/messages.ts             # on(), start()
  ├── ui/messages/inbound.ts         # window listener fan-out (ex client.ts)
  ├── ui/messages/router.ts          # switch + orchestration (ex dispatcher.ts)
  └── ui/focus/request-id.ts         # activeFocusId state (ex bus/request.ts)
  ```
- 삭제 대상: `src/shared/`, `src/ui/messaging.ts`, `src/plugin/bus.ts`, `src/ui/bus/`
- 미사용 export 정리: `ui/messaging.ts`의 `subscribe()` 폐기
- 보존 (동작/이름 변경 금지): envelope 필드명 `payload`, helper 이름 `postToCode`/`postToUi`, dispatcher 함수 `startMessageBridge`
- 동작 변경 / 새 기능 / 테스트 도입 금지
- Conventional Commit (`refactor` / `docs`)

---

### Task 1: 파일 이동/통합 + 모든 import 경로 갱신

**Files:**

신규 (Create):
- `apps/figma-token-review-plugin/src/common/messages.ts`
- `apps/figma-token-review-plugin/src/plugin/messages.ts`

이동 (git mv):
- `src/ui/bus/client.ts` → `src/ui/messages/inbound.ts`
- `src/ui/bus/dispatcher.ts` → `src/ui/messages/router.ts`
- `src/ui/bus/request.ts` → `src/ui/focus/request-id.ts`

삭제 (Delete):
- `src/shared/schema.ts`
- `src/shared/protocol.ts`
- `src/shared/` 디렉토리 (빈 디렉토리 제거)
- `src/ui/messaging.ts`
- `src/plugin/bus.ts`
- `src/ui/bus/` 디렉토리 (빈 디렉토리 제거)

수정 (Modify, import 경로 갱신):
- `src/plugin/code.ts`
- `src/plugin/handlers/extract.ts`
- `src/plugin/handlers/selection.ts`
- `src/plugin/handlers/scan.ts`
- `src/plugin/handlers/focus.ts`
- `src/plugin/handlers/resize.ts`
- `src/ui/App.tsx`
- `src/ui/providers.tsx`
- `src/ui/hooks/use-scan.ts`
- `src/ui/hooks/use-selection.ts`
- `src/ui/store/scan.ts`
- `src/ui/store/selection.ts`
- `src/ui/store/create-store.ts` (타입 import만, 있을 경우)
- `src/ui/components/violation-card/violation-card.tsx`
- `src/ui/components/violation-card/violation-breadcrumb.tsx`
- `src/ui/components/violation-card/violation-detail.tsx`
- `src/ui/components/violation-card/token-comparison.tsx`
- `src/ui/components/violation-card/utils.ts`
- `src/ui/pages/home.tsx`
- `src/ui/pages/scan-result.tsx`
- `src/ui/pages/success.tsx`
- `src/ui/libs/llm/*.ts` (타입 import 경로)

(정확한 modify 목록은 구현 단계 grep으로 확정. 위 표는 grep 예상치.)

**Interfaces:**

- Consumes: 없음
- Produces:
  ```ts
  // src/common/messages.ts (re-exports — names unchanged)
  export type { Severity, ViolationType, Violation, Conformant, EvaluateSummary, EvaluateOutput, ScanPayload, SelectionState, Viewport, SchemaMode, ColorProperty, TokenStatus, BackgroundKind, AppliedStatus, ColorBackground, ColorUsage, TypographyUsage, TypographyResolved, LineHeight, RawExtract, RawExtractStats, UiMsg, CodeMsg };
  export type { RequestId, Envelope, UiEnvelope, CodeEnvelope };
  export function newRequestId(): RequestId;
  export function postToCode(msg: UiMsg | UiEnvelope): void;
  export function postToUi(msg: CodeEnvelope, requestId?: RequestId): void;

  // src/plugin/messages.ts
  export function on(type: UiMsg['type'], handler: Handler): void;
  export function start(): void;

  // src/ui/messages/inbound.ts (formerly client.ts — unchanged content)
  export function onMessage(fn: Listener): () => void;

  // src/ui/messages/router.ts (formerly dispatcher.ts — unchanged content + import path updates)
  export function startMessageBridge(): () => void;

  // src/ui/focus/request-id.ts (formerly bus/request.ts — unchanged content)
  export function requestFocus(nodeIds: string[]): void;
  export function isActiveFocus(requestId: RequestId | undefined): boolean;
  ```

- [ ] **Step 1: 사전 grep — 현재 import 표면 파악**

Run:
```bash
touch /tmp/bash-raw-unlock && grep -rln "~/shared/\|'\.\./bus\|'\./bus\|~/ui/bus\|~/ui/messaging\|'\.\./messaging\|'\./messaging" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/src ; rm /tmp/bash-raw-unlock
```

Expected: 수정 대상 파일 목록 출력. 이 출력을 기준으로 Step 5 이후 일괄 갱신.

```bash
touch /tmp/bash-raw-unlock && grep -rn "subscribe\b" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/src/ui ; rm /tmp/bash-raw-unlock
```

Expected: `ui/messaging.ts:10`의 `subscribe` 정의 외에 외부 import 0건 확인. `store/create-store.ts`의 `subscribe`는 store API용 — 다른 심볼.

- [ ] **Step 2: `src/common/messages.ts` 생성**

Create file with the following content (4개 파일 콘텐츠 통합):

```ts
import type { SemanticResult } from '@vapor-ui/color-generator';

/* -------------------------------------------------------------------------------------------------
 * Domain types (formerly src/shared/schema.ts)
 * -----------------------------------------------------------------------------------------------*/

export type Severity = 'high' | 'info';

export type ViolationType =
    | 'token-not-used'
    | 'unknown-token'
    | 'do-not-use'
    | 'role-mismatch'
    | 'fg-grade-mismatch'
    | 'fg-grade-ambiguous'
    | 'typo-raw'
    | 'typo-styled-override';

// ... (rest of schema.ts contents verbatim — Violation, Conformant, EvaluateSummary, EvaluateOutput, ScanPayload, SelectionState, Viewport, SchemaMode, ColorProperty, TokenStatus, BackgroundKind, AppliedStatus, ColorBackground, ColorUsage, TypographyUsage, TypographyResolved, LineHeight, RawExtract, RawExtractStats, UiMsg, CodeMsg)

/* -------------------------------------------------------------------------------------------------
 * Envelope + RequestId (formerly src/shared/protocol.ts)
 * -----------------------------------------------------------------------------------------------*/

export type RequestId = string;
export type Envelope<T> = T & { requestId?: RequestId };
export type UiEnvelope = Envelope<UiMsg>;
export type CodeEnvelope = Envelope<CodeMsg>;

export function newRequestId(): RequestId {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* -------------------------------------------------------------------------------------------------
 * Post helpers
 * -----------------------------------------------------------------------------------------------*/

/**
 * UI → plugin direction. Uses `parent` (DOM iframe global).
 * Tree-shaken from plugin bundle when only types are imported.
 */
export function postToCode(msg: UiMsg | UiEnvelope): void {
    parent.postMessage({ pluginMessage: msg }, '*');
}

/**
 * Plugin → UI direction. Uses `figma.ui` (plugin sandbox global).
 * Tree-shaken from UI bundle when only types are imported.
 */
export function postToUi(msg: CodeEnvelope, requestId?: RequestId): void {
    figma.ui.postMessage(requestId ? { ...msg, requestId } : msg);
}
```

Implementation note: `// ... rest of schema.ts contents verbatim` 표시 부분은 실제 작업 시 현 `src/shared/schema.ts`의 모든 type/interface/export를 그대로 옮겨야 한다. 줄여서 적지 말고 1:1 전부 옮긴다.

도메인 type 중 SemanticResult 등 외부 import가 schema.ts에 있으면 함께 가져오기.

- [ ] **Step 3: `src/plugin/messages.ts` 생성**

Create file. 현 `src/plugin/bus.ts`의 `on()` + `start()` + `handlers` Map만 옮기되, `postToUi`는 common에서 가져오는 형태:

```ts
import type { UiEnvelope } from '~/common/messages';
import type { UiMsg } from '~/common/messages';

type Handler = (msg: UiEnvelope) => void | Promise<void>;

const handlers = new Map<UiMsg['type'], Handler>();

export function on(type: UiMsg['type'], handler: Handler): void {
    handlers.set(type, handler);
}

export function start(): void {
    figma.ui.onmessage = (msg: UiEnvelope) => {
        const handler = handlers.get(msg.type);
        if (!handler) return;

        const result = handler(msg);

        if (result instanceof Promise) {
            result.catch((err) => {
                console.error(`[plugin handler:${msg.type}]`, err);
            });
        }
    };
}
```

`postToUi`는 이제 common/messages.ts에서 export. 핸들러는 직접 common에서 import.

- [ ] **Step 4: ui/bus/ 3 파일 이동**

```bash
cd /Users/goorm/01_works/vapor
mkdir -p apps/figma-token-review-plugin/src/ui/messages
mkdir -p apps/figma-token-review-plugin/src/ui/focus
git mv apps/figma-token-review-plugin/src/ui/bus/client.ts apps/figma-token-review-plugin/src/ui/messages/inbound.ts
git mv apps/figma-token-review-plugin/src/ui/bus/dispatcher.ts apps/figma-token-review-plugin/src/ui/messages/router.ts
git mv apps/figma-token-review-plugin/src/ui/bus/request.ts apps/figma-token-review-plugin/src/ui/focus/request-id.ts
```

- [ ] **Step 5: 이동된 3 파일 내부 self-import 갱신**

`src/ui/messages/router.ts` (ex dispatcher.ts) — 내부 import 경로 변경:

```ts
// before
import type { CodeEnvelope } from '~/shared/protocol';
import { toastManager } from '../components/toast';
import { EvaluatorHttpError, EvaluatorParseError, runEvaluation } from '../evaluator';
import { scanActions, scanStore } from '../store/scan';
import { selectionStore } from '../store/selection';
import { onMessage } from './client';
import { isActiveFocus } from './request';
// after (Llm* renames preserved from prior plan, paths updated)
import type { CodeEnvelope } from '~/common/messages';
import { toastManager } from '../components/toast';
import { LlmHttpError, LlmParseError, runLlmEvaluation } from '../libs/llm';
import { scanActions, scanStore } from '../store/scan';
import { selectionStore } from '../store/selection';
import { onMessage } from './inbound';
import { isActiveFocus } from '../focus/request-id';
```

`src/ui/messages/inbound.ts` (ex client.ts) — 내부 type import:

```ts
// before
import type { CodeEnvelope } from '~/shared/protocol';
// after
import type { CodeEnvelope } from '~/common/messages';
```

`src/ui/focus/request-id.ts` (ex bus/request.ts) — 내부 import:

```ts
// before
import type { RequestId } from '~/shared/protocol';
import { newRequestId } from '~/shared/protocol';

import { postToCode } from '../messaging';
// after
import type { RequestId } from '~/common/messages';
import { newRequestId, postToCode } from '~/common/messages';
```

- [ ] **Step 6: 옛 파일 삭제**

```bash
cd /Users/goorm/01_works/vapor
rm apps/figma-token-review-plugin/src/shared/schema.ts
rm apps/figma-token-review-plugin/src/shared/protocol.ts
rmdir apps/figma-token-review-plugin/src/shared
rm apps/figma-token-review-plugin/src/ui/messaging.ts
rm apps/figma-token-review-plugin/src/plugin/bus.ts
rmdir apps/figma-token-review-plugin/src/ui/bus
```

- [ ] **Step 7: 외부 callsite 일괄 갱신**

Step 1의 grep 결과로 식별된 모든 파일의 import 경로를 일괄 치환:

치환 규칙:
| 옛 import 경로 | 새 경로 |
|---|---|
| `'~/shared/schema'` | `'~/common/messages'` |
| `'~/shared/protocol'` | `'~/common/messages'` |
| `'../bus'` (plugin/handlers 측) | `'../messages'` |
| `'./bus'` (plugin/code.ts) | `'./messages'` |
| `'~/ui/bus/request'` | `'~/ui/focus/request-id'` |
| `'../bus/request'` 또는 `'./bus/request'` | `'../focus/request-id'` 또는 적절한 상대 경로 |
| `'./messaging'` 또는 `'../messaging'` (ui 측) | `'~/common/messages'` |
| `'~/ui/messaging'` | `'~/common/messages'` |
| `'./client'` (ui/bus 내부) — Step 5에서 처리됨 | (해당 없음) |
| `'./dispatcher'` 또는 `'./bus/dispatcher'` (예: providers.tsx의 `startMessageBridge` import) | `'./messages/router'` 또는 적절한 경로 |

특히 주의:
- `plugin/handlers/*.ts`의 `import { on, postToUi } from '../bus'` → `on`은 `'../messages'`에서, `postToUi`는 `'~/common/messages'`에서. 두 줄로 분리:
  ```ts
  import { on } from '../messages';
  import { postToUi } from '~/common/messages';
  ```
- `ui/hooks/use-scan.ts`의 `postToCode` import → `'~/common/messages'`
- `ui/providers.tsx`의 `startMessageBridge` import → `'./messages/router'`
- `ui/components/violation-card/violation-card.tsx`의 `requestFocus` import → `'~/ui/focus/request-id'`

각 파일별 정확한 before/after는 typecheck가 미해결 import를 모두 잡아주므로, Step 9 typecheck 출력을 보고 마지막 누락 갱신.

- [ ] **Step 8: subscribe 폐기 확인**

`ui/messaging.ts`가 이미 삭제됨 (Step 6). 외부 callsite 0건이 Step 1에서 확인됨. 추가 조치 없음.

- [ ] **Step 9: Typecheck**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm typecheck
```

Expected: PASS.

FAIL 시: 출력의 `Cannot find module '~/shared/...'` 또는 `Module not found '../bus'` 메시지가 누락 callsite를 직접 지목. 해당 파일 열어 Step 7 규칙으로 갱신.

- [ ] **Step 10: Lint**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm lint
```

Expected: PASS.

FAIL이 `unused-import` 또는 `import order` 류면 해당 파일 내 자동 정리.

- [ ] **Step 11: 잔존 참조 회귀 확인**

```bash
touch /tmp/bash-raw-unlock && grep -rn "~/shared/\|'\.\./bus\|'\./bus\|~/ui/bus\|~/ui/messaging\|'\.\./messaging\|'\./messaging" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/src ; rm /tmp/bash-raw-unlock
```

Expected: 0 hit.

(예외: `ui/store/create-store.ts`의 `subscribe`는 store API 메소드명. import 경로 grep 대상 아님.)

- [ ] **Step 12: Build**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm build
```

Expected: PASS. `dist/code.js`, `dist/index.html`, `dist/manifest.json` 산출.

```bash
ls /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/dist
```

Expected: 위 3 파일 존재.

- [ ] **Step 13: Commit**

```bash
cd /Users/goorm/01_works/vapor
git add apps/figma-token-review-plugin/src
git commit -m "refactor(figma-token-review-plugin): consolidate messaging layer into common/messages convention"
```

---

### Task 2: ARCHITECTURE.md 동기화

**Files:**
- Modify: `apps/figma-token-review-plugin/ARCHITECTURE.md`

**Interfaces:**
- Consumes: Task 1의 새 모듈 트리
- Produces: 없음 (문서만)

- [ ] **Step 1: 현재 모듈 트리 / bus / shared / messaging 참조 위치 파악**

```bash
touch /tmp/bash-raw-unlock && grep -n "bus\|shared\|messaging\|libs/llm" /Users/goorm/01_works/vapor/apps/figma-token-review-plugin/ARCHITECTURE.md ; rm /tmp/bash-raw-unlock
```

각 hit을 다음 카테고리로 분류:
- 옛 폴더 경로 (bus/, shared/, messaging.ts) — 새 경로로 교체
- 옛 함수/모듈 설명 — 새 이름/위치로 교체

- [ ] **Step 2: 외과적 토큰 교체**

치환 규칙:
| 옛 경로/이름 | 새 경로/이름 |
|---|---|
| `shared/` | `common/` |
| `shared/schema` | `common/messages` |
| `shared/protocol` | `common/messages` |
| `plugin/bus` | `plugin/messages` |
| `ui/bus/client` | `ui/messages/inbound` |
| `ui/bus/dispatcher` | `ui/messages/router` |
| `ui/bus/request` | `ui/focus/request-id` |
| `ui/messaging` | `ui/common/messages` (postToCode가 common으로 통합됨을 명시) |

ASCII 트리에 다음 노드들이 새로 추가/대체된다면 반영:
```
src/
├── common/messages.ts        # 모든 types + envelope + post helpers (양방향)
├── plugin/
│   ├── code.ts
│   ├── messages.ts           # on/start — handler registry
│   └── handlers/*.ts
└── ui/
    ├── messages/
    │   ├── inbound.ts        # window listener fan-out
    │   └── router.ts         # switch + orchestration
    ├── focus/
    │   └── request-id.ts     # activeFocusId state
    └── ...
```

문장/표 구조 보존. 새 문장 추가는 트리 변경 반영 + (필요 시) 한 줄 요약 외 금지.

- [ ] **Step 3: Smoke (문서만 변경된 것 확인)**

```bash
cd /Users/goorm/01_works/vapor/apps/figma-token-review-plugin && pnpm typecheck && pnpm lint
```

Expected: PASS (문서 변경은 코드 영향 없음).

- [ ] **Step 4: Commit**

```bash
cd /Users/goorm/01_works/vapor
git add apps/figma-token-review-plugin/ARCHITECTURE.md
git commit -m "docs(figma-token-review-plugin): sync ARCHITECTURE.md with common/messages structure"
```

---

## Self-Review

### Spec 커버리지

| Spec 섹션 | 구현 task |
|---|---|
| §"새 모듈 구조" — common/messages.ts | Task 1 Step 2 |
| §"새 모듈 구조" — plugin/messages.ts | Task 1 Step 3 |
| §"새 모듈 구조" — ui/messages/inbound.ts, router.ts | Task 1 Step 4-5 |
| §"새 모듈 구조" — ui/focus/request-id.ts | Task 1 Step 4-5 |
| §"common/messages.ts 통합 내용" 4종 콘텐츠 | Task 1 Step 2 |
| §"plugin/messages.ts 잔여 내용" | Task 1 Step 3 |
| §"삭제 대상" 4개 (shared/, ui/messaging.ts, plugin/bus.ts, ui/bus/) | Task 1 Step 6 |
| §"미사용 export 정리" (subscribe 폐기) | Task 1 Step 8 |
| §"Import 경로 갱신" 일괄 치환 | Task 1 Step 7 |
| §"ARCHITECTURE.md 갱신" | Task 2 |
| §"검증" typecheck + lint + build + 회귀 grep | Task 1 Step 9-12 |

전 spec 항목 커버.

### Placeholder scan

- "TBD" / "TODO" / "implement later" 없음.
- Task 1 Step 2의 "rest of schema.ts contents verbatim" — 명시적 instruction with rule ("줄여서 적지 말고 1:1 전부 옮긴다"). 빈 placeholder 아니라 정확한 작업 지시.
- 모든 명령 / 코드 블록은 실제 실행 가능 형태.
- "Similar to Task N" 없음 — 각 task는 자체 완결.

### Type consistency

- `postToCode(msg: UiMsg | UiEnvelope): void` — Task 1 Step 2에서 common에 정의, Step 7에서 모든 callsite가 common으로부터 import.
- `postToUi(msg: CodeEnvelope, requestId?: RequestId): void` — Task 1 Step 2에서 common에 정의, plugin/handlers의 import는 Step 7 규칙.
- `on(type: UiMsg['type'], handler: Handler): void` — Task 1 Step 3에서 plugin/messages.ts에 정의, plugin/handlers의 import는 `'../messages'`.
- `startMessageBridge` 이름 보존 — providers.tsx의 import 경로만 `./messages/router`로 갱신, 함수명은 그대로.
- `requestFocus(nodeIds: string[]): void`, `isActiveFocus(requestId): boolean` — Task 1 Step 4-5에서 `ui/focus/request-id.ts`로 이동, 시그니처 변경 없음.
