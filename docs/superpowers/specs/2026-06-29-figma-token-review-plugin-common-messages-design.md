# figma-token-review-plugin — common/messages 통합 spec

날짜: 2026-06-29
대상: `apps/figma-token-review-plugin/src`
선행 참고:
- `docs/superpowers/notes/2026-06-29-figma-token-review-plugin-flow.md`
- `docs/superpowers/specs/2026-06-29-figma-token-review-plugin-naming-cleanup-design.md` (선행 task)

## 배경

워크스페이스 내 다른 Figma 플러그인 `apps/figma-plugin`은 메시징 layer를 다음 컨벤션으로 둔다.

- `src/common/messages.ts` — 메시지 타입 union + `postMessage` helper 한 곳
- `src/plugin/code.ts` — `figma.ui.onmessage` inline switch
- envelope: `{ type, data }`

이 컨벤션 대비 token-review-plugin은 분산도 더 높다.

- `shared/schema.ts` + `shared/protocol.ts` — types + Envelope + newRequestId
- `plugin/bus.ts` — handler registry (`on`, `start`, `postToUi`)
- `ui/messaging.ts` — `postToCode`, 사용되지 않는 `subscribe`
- `ui/bus/client.ts` — window listener fan-out
- `ui/bus/dispatcher.ts` — switch-route + orchestration
- `ui/bus/request.ts` — focus 도메인 request-id state

"bus" 단어가 모호하고, "messaging" / "shared" / "bus" 세 용어가 같은 경계 책임을 나눠 가져 인지 부하 큼.

token-review-plugin은 race guard / 양방향 orchestration이 실제 필요해 figma-plugin 수준으로 평탄화하면 손해. 하지만 **이름과 폴더 구조는 figma-plugin 컨벤션에 정렬** 가능.

## 목표

- 워크스페이스 컨벤션과 폴더/모듈 명 일치 (`common/`, `messages` 용어)
- 메시지 layer의 단일 진입점 `common/messages.ts` — 타입 / requestId factory / 양방향 post helper 통합
- "bus" 용어 제거
- focus 도메인 state는 messaging layer에서 분리
- 동작 / 메시지 envelope 모양 / race guard 로직은 보존

## 비목표

- envelope 필드명 `payload` → `data` 정합 (별도 후속 — 표면적 라벨 변경, 본 spec 스코프 밖)
- helper 이름 `postToCode`/`postToUi` → `postMessage` 정합 (별도 후속)
- dispatcher의 라우터 + orchestration 분리 (별도 후속, flow notes §9 항목 2)
- 새 기능 / 동작 변경 / 테스트 도입

## 설계

### 새 모듈 구조

```
src/
├── common/
│   └── messages.ts             # 모든 types + Envelope + newRequestId + postToCode + postToUi
├── plugin/
│   ├── code.ts
│   ├── messages.ts             # on(), start() — handler registry
│   └── handlers/{selection,scan,focus,resize,extract}.ts
└── ui/
    ├── App.tsx
    ├── messages/
    │   ├── inbound.ts          # window 'message' listener fan-out
    │   └── router.ts           # switch-route + orchestration (현 dispatcher)
    └── focus/
        └── request-id.ts       # activeFocusId / requestFocus / isActiveFocus
```

### `src/common/messages.ts` 통합 내용

현재 `shared/schema.ts` 전체:
- `Severity`, `ViolationType`, `Violation`, `Conformant`
- `EvaluateSummary`, `EvaluateOutput`, `ScanPayload`
- `SelectionState`, `Viewport`, `SchemaMode`, `ColorProperty`, `TokenStatus`, `BackgroundKind`, `AppliedStatus`, `ColorBackground`
- `ColorUsage`, `TypographyUsage`, `TypographyResolved`, `LineHeight`
- `RawExtract`, `RawExtractStats`
- `UiMsg`, `CodeMsg`

현재 `shared/protocol.ts` 전체:
- `RequestId`, `Envelope<T>`, `UiEnvelope`, `CodeEnvelope`
- `newRequestId()`

현재 `ui/messaging.ts`의 일부:
- `postToCode(msg: UiMsg | UiEnvelope): void` — `parent.postMessage({ pluginMessage: msg }, '*')`

현재 `plugin/bus.ts`의 일부:
- `postToUi(msg: CodeEnvelope, requestId?: RequestId): void` — `figma.ui.postMessage(...)`

`common/messages.ts`는 `parent`와 `figma` 두 글로벌을 모두 참조. UI 측은 type-only + postToCode만 import → `figma` 분기는 tree-shake. plugin 측은 type-only + postToUi만 import → `parent` 분기는 tree-shake. figma-plugin이 동일 패턴(`common/messages.ts`에서 `parent.postMessage`)으로 이미 작동 확인됨.

### `src/plugin/messages.ts` 잔여 내용

현재 `plugin/bus.ts`에서 `postToUi`만 빠진 형태:
- `Handler` 타입 (local)
- `handlers: Map<UiMsg['type'], Handler>` 모듈 전역
- `on(type, handler)`
- `start()` — `figma.ui.onmessage = dispatcher` 바인딩

`figma.ui.onmessage` 바인딩은 plugin sandbox 전용이라 common으로 못 옮김 — 유지.

### `src/ui/messages/` 디렉토리 잔여 내용

현재 `ui/bus/client.ts` → **`ui/messages/inbound.ts`** (변경 없음, 위치만):
- `onMessage(fn)` — window 'message' listener fan-out

현재 `ui/bus/dispatcher.ts` → **`ui/messages/router.ts`** (변경 없음, 위치+이름):
- `startMessageBridge()` 그대로 (또는 `startMessageRouter()`로 정합)
- switch 라우팅 + evaluator/store/toast orchestration

### `src/ui/focus/request-id.ts`

현재 `ui/bus/request.ts` 전체 이동. 내용 그대로:
- `activeFocusId: RequestId | null` 모듈 전역
- `requestFocus(nodeIds)`
- `isActiveFocus(requestId)`

이 모듈은 messaging 매개 책임이 아니라 focus 도메인의 race guard state. `ui/focus/` 하위로 격리.

### 삭제 대상

- `src/shared/` 디렉토리 (schema.ts + protocol.ts 모두 common으로 흡수 후 빈 디렉토리 제거)
- `src/ui/messaging.ts` (postToCode는 common으로, `subscribe`는 미사용 — 폐기)
- `src/plugin/bus.ts` (잔여 부분이 `src/plugin/messages.ts`로 이동)
- `src/ui/bus/` 디렉토리 (세 파일 분산 이전 후 빈 디렉토리 제거)

### 미사용 export 정리

- `ui/messaging.ts`의 `subscribe(handler)` — grep 결과 외부 호출처 없음. 통합 시 폐기 (common/messages.ts에 포함하지 않음).

### Import 경로 갱신

타입 import 일괄 치환:
- `'~/shared/schema'` → `'~/common/messages'`
- `'~/shared/protocol'` → `'~/common/messages'`

helper import:
- `'../messaging'` (UI 측 postToCode) → `'~/common/messages'`
- `'../bus'` 또는 `'./bus'` (plugin 측) → `'./messages'` (또는 `'../messages'`)
- `'./client'` (ui/bus 내부 self-import) → `./inbound` (`ui/messages/`)
- `'./request'` (ui/bus 내부 self-import) → `'~/ui/focus/request-id'`

`request.ts` 외부 호출처 (`requestFocus` / `isActiveFocus`):
- `ui/components/violation-card/violation-card.tsx` 등에서 `import { requestFocus } from '~/ui/bus/request'` → `from '~/ui/focus/request-id'`
- `ui/messages/router.ts` (ex-dispatcher)에서 `isActiveFocus` import 마찬가지

## 영향 파일

| 파일 | 변경 |
|---|---|
| `src/shared/schema.ts` | common/messages.ts로 흡수 후 삭제 |
| `src/shared/protocol.ts` | common/messages.ts로 흡수 후 삭제 |
| `src/ui/messaging.ts` | postToCode common으로, subscribe 폐기, 파일 삭제 |
| `src/plugin/bus.ts` | postToUi common으로, on/start는 plugin/messages.ts로 이동, 파일 삭제 |
| `src/ui/bus/client.ts` | `src/ui/messages/inbound.ts`로 이동 |
| `src/ui/bus/dispatcher.ts` | `src/ui/messages/router.ts`로 이동 |
| `src/ui/bus/request.ts` | `src/ui/focus/request-id.ts`로 이동 |
| `src/common/messages.ts` | 신규 (4파일 콘텐츠 통합) |
| `src/plugin/messages.ts` | 신규 (on/start만) |
| `src/plugin/code.ts` | import 경로 (`./bus` → `./messages`) |
| `src/plugin/handlers/*.ts` | import 경로 (`../bus` → `../messages`) + 타입 import 경로 (`~/shared/...` → `~/common/messages`) |
| `src/ui/App.tsx` | import 경로 (있다면) |
| `src/ui/providers.tsx` | `startMessageBridge` import 경로 |
| `src/ui/hooks/*.ts` | 타입 + postToCode import 경로 |
| `src/ui/store/*.ts` | 타입 import 경로 |
| `src/ui/components/violation-card/*.tsx` | `requestFocus` import 경로 |
| `src/ui/pages/*.tsx` | 타입 import 경로 |
| `apps/figma-token-review-plugin/ARCHITECTURE.md` | 모듈 트리 갱신 |

(정확한 callsite 수는 구현 단계 grep으로 확정)

## 검증

- `pnpm typecheck` PASS
- `pnpm lint` PASS
- `pnpm build` PASS — `dist/code.js`, `dist/index.html`, `dist/manifest.json` 산출
- 잔존 참조 grep 0건: `~/shared/`, `'../bus'`, `'./bus'`, `'~/ui/bus/'`, `'~/ui/messaging'`
- 수동: 빌드 산출물로 Figma 실행 → 스캔 / focus / clean / resize 동작 변화 없음

## 위험

- callsite 분산이 큼. 누락된 import 경로 1개라도 typecheck가 잡지만 회귀 grep 필수.
- `common/messages.ts`가 `parent` (DOM)와 `figma` (plugin global) 둘 다 참조 → 컴파일에 양 글로벌 타입 모두 필요. tsconfig가 dom + @figma/plugin-typings 모두 include하는지 확인 필요 (figma-plugin이 동일 패턴으로 빌드되므로 동일 셋업이면 안전).
- `ui/bus/dispatcher.ts:startMessageBridge` 이름을 그대로 둘지 `startMessageRouter` 등으로 정합할지 결정 필요. 본 spec은 **그대로 유지**가 기본 — 호출 1곳(`providers.tsx`)만 영향이라 추가 변경 없음.
- focus 도메인 분리 (`ui/focus/request-id.ts`) 후 다른 focus 관련 코드(없음)와 모이는 자연스러운 후속 위치. 단독 파일로 시작.

## 후속 작업 (이 spec 밖)

1. envelope 필드 `payload` → `data` 정합 (figma-plugin 일치)
2. helper 이름 `postToCode` / `postToUi` → 양쪽 `postMessage` (figma-plugin 일치)
3. dispatcher router + orchestration 분리 (flow notes §9 항목 2)
4. request-id state 정본 통합 (flow notes §9 항목 — handlers/scan / store/scan / focus/request-id 3곳 분산 해결)
