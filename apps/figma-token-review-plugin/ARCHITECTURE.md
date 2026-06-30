# Figma Token Review Plugin — 모듈 구조

```
src/
├── common/     # 두 사이드가 공유하는 wire 계약·도메인 스키마
├── plugin/     # Figma 샌드박스 (figma API 접근, DOM 없음)
└── ui/         # React iframe UI (feature-folder 기반)
```

- `plugin/`: 1단(결정론) RawExtract 추출. LLM 호출 없음.
- `ui/features/llm/`: 2단 LLM 판정. RawExtract → ScanPayload.
- 두 사이드는 `figma.ui.postMessage` / `window.message`로만 통신. 모든 wire 형식은 `common/`이 정의.

---

## `src/common/` — 공유 계약

- **`schemas.ts`** — 도메인 타입 (`Violation`, `EvaluateOutput`, `ScanPayload`, `SelectionState`, `RawExtract`).
- **`messages.ts`** — wire envelope (`UiEnvelope`, `CodeEnvelope`), `RequestId`, `postToCode`, `newRequestId`. request/response 상관 인프라(핸들러가 응답에 동일 id를 echo → stale 응답 차단).

---

## `src/plugin/` — Figma 샌드박스

`figma.*` API만 접근. DOM/window 없음. Vite가 `code.ts`를 entry로 단일 번들 생성.

- **`code.ts`** _(entry)_ — UI 표시 + 크기 복원 + 핸들러 init + 메시지 라우터 시작.
- **`messages.ts`** — `postToUi` 래퍼 + 핸들러 등록(`on(type, handler)`) + `figma.ui.onmessage` 부착. 응답에 requestId echo.
- **`handlers/`** — 메시지 종류별 핸들러.

| 파일           | 책임                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| `selection.ts` | 초기 emit + `selectionchange` 구독 + `request-selection` 응답          |
| `scan.ts`      | in-flight scan cancel, `extract.ts` 호출, 결과 echo                    |
| `extract.ts`   | 프레임 추출 (`extractFrame`)                                           |
| `focus.ts`     | 노드 id 리스트 resolve, viewport 이동, missing 카운트 응답             |
| `resize.ts`    | `figma.ui.resize` 적용. `commit===true`일 때만 `clientStorage` persist |

새 메시지 추가 = `handlers/<name>.ts` 1개 + `code.ts`에 init 한 줄.

---

## `src/ui/` — React iframe UI

`createRoot` 단일 진입점. React 19, Vite single-file 번들. 폴더 분류는 **layer가 아니라 feature** 단위.

```
ui/
├── App.tsx  providers.tsx  main.tsx  index.css
├── assets/                  # svg 등 정적 리소스
├── shared/                  # cross-feature primitive (store factory 등)
├── features/                # 기능 단위 모듈
│   ├── messaging/           # plugin ↔ UI 와이어 통신 전담
│   ├── llm/                 # LLM 호출 (2단 평가)
│   ├── scan/                # 스캔 상태 머신 + 훅
│   └── selection/           # 샌드박스 selection 상태 + 훅
├── components/              # 순수 재사용 UI
│   └── violation-card/
└── pages/                   # 상태별 화면
```

새 기능 추가 = `features/<name>/` 폴더 하나만 늘어남. `src/ui/` 루트는 비대해지지 않음.

### 루트

- **`main.tsx`** _(entry)_ — `<StrictMode> → <ErrorBoundary> → <Providers> → <App>`. Render 트리만 조립.
- **`App.tsx`** — scan 상태 머신 switch 라우터. props drill 없음, store에서 직접 읽음.
- **`providers.tsx`** — `Toast.Provider` 래퍼 + `useBridge` + `useRequestSelection` 마운트.

### `shared/`

| 파일              | 책임                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| `create-store.ts` | 제네릭 store 팩토리 + `useStore` 훅. `Object.is` 동일 참조 시 알림 skip |

### `features/messaging/` — 와이어 통신

| 파일                   | 책임                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `bridge.ts`            | `window.message` 단일 listener + `handle(msg)` 라우터. requestId mismatch drop. `useBridge` 훅 export                |
| `evaluate.ts`          | `extract-result` 메시지 받아 `runLlmEvaluation` 호출 후 scan store에 반영. AbortController로 in-flight evaluate 취소 |
| `focus.ts`             | `requestFocus(nodeIds)` + `isActiveFocus()`. stale focus 토스트 차단                                                 |
| `request-selection.ts` | 초기 selection 요청 effect                                                                                           |
| `index.ts`             | barrel                                                                                                               |

### `features/llm/` — LLM 평가 (2단)

| 파일        | 책임                                                                                |
| ----------- | ----------------------------------------------------------------------------------- |
| `client.ts` | LiteLLM HTTP 호출. 60s timeout, 429 1회 재시도. `LlmHttpError`/`LlmTimeoutError`    |
| `parse.ts`  | Anthropic content blocks → `ScanPayload` JSON parse + schema guard. `LlmParseError` |
| `prompt.ts` | `SYSTEM_PROMPT` + `buildRequest()`                                                  |
| `index.ts`  | `runLlmEvaluation()` 공개 + env/model 해석                                          |

외부에서는 `runLlmEvaluation(extract, opts)` 한 함수만 사용. UI는 `messaging/evaluate.ts`만 의존.

### `features/scan/` — 스캔 상태 머신

| 파일          | 책임                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `store.ts`    | `idle/loading/clean/success` 머신 + `scanActions`. loading에 requestId 포함, action 단에서 race 가드 |
| `use-scan.ts` | scan state + `start(frameId, name)` (requestId 생성 + dispatch + postToCode) + `reset`               |
| `index.ts`    | barrel                                                                                               |

### `features/selection/` — 셀렉션 상태

| 파일               | 책임                        |
| ------------------ | --------------------------- |
| `store.ts`         | 샌드박스 selection 슬라이스 |
| `use-selection.ts` | selection store 구독        |
| `index.ts`         | barrel                      |

### `pages/`

| 파일              | 책임                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| `home.tsx`        | idle 화면. selection 종류에 따라 토스트/스캔 트리거                                |
| `scan-result.tsx` | success 화면. Tabs(color/typography) + Violation 섹션. counts/sort/split `useMemo` |
| `success.tsx`     | clean 화면 (위반 0)                                                                |

### `components/`

| 파일                 | 책임                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| `error-boundary.tsx` | 렌더 에러 catch + fallback UI + reset 버튼                                        |
| `resize-handler.tsx` | rAF throttle drag. pointermove → 큐 → next frame flush, pointerup만 `commit:true` |
| `toast.tsx`          | `toastManager` 싱글톤 + ToastProvider                                             |
| `hero-panel.tsx`     | home/success 공통 패널 슬롯                                                       |
| `loader.tsx`         | loading 스피너                                                                    |

#### `components/violation-card/`

| 파일                       | 책임                                         |
| -------------------------- | -------------------------------------------- |
| `violation-card.tsx`       | 카드 컨테이너. 클릭 시 `requestFocus(nodes)` |
| `violation-breadcrumb.tsx` | 카드 상단 경로 표시                          |
| `token-comparison.tsx`     | used → suggested 토큰 chip + color swatch    |
| `violation-detail.tsx`     | detail 텍스트 + AI 추천 뱃지                 |
| `utils.ts`                 | `isHexColor` 등 헬퍼                         |
| `index.ts`                 | barrel                                       |

---

## 데이터 흐름

```
[사용자 액션]
   └─> features/scan.use-scan.start ─postToCode─> plugin/messages ─dispatch─> handlers/scan
                                                                                  └─ figma API
                                                                                  └─ postToUi(requestId)
   <── window.message ── features/messaging/bridge (단일 listener)
                              └─ handle() ─ scan/selection store action (requestId 매칭 후 set)
                                                  └─ useSyncExternalStore notify
                                                          └─ React re-render
```

특별 경로

- **extract-result → LLM 평가**: `features/messaging/bridge.handle` → `evaluate.evaluateExtract` → `features/llm.runLlmEvaluation` → `scanActions.result`.
- **selection 변화**: plugin `figma.on('selectionchange')` → `handlers/selection` emit → `selectionStore` set → 모든 구독 컴포넌트.
- **focus 토스트**: bridge가 `isActiveFocus()`로 stale 차단.
- **resize**: UI rAF 큐 → pointermove 시 `commit` 없음 → sandbox apply only / pointerup commit → persist.
