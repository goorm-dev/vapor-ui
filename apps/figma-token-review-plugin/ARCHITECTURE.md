# Figma Token Review Plugin — 모듈 구조

```
src/
├── shared/    # 두 사이드 공유 타입/프로토콜
├── plugin/    # Figma 샌드박스 (figma API 접근, DOM 없음)
│   └── extract.ts   # 프레임 추출 1단 — extractFrame
└── ui/        # React iframe UI
    └── libs/llm/    # LLM 판정 2단 — runLlmEvaluation (index.ts, client.ts, parse.ts, prompt.ts)
```

- `plugin/extract`: 1단(결정론) RawExtract 추출. LLM 호출 없음.
- `ui/libs/llm`: 2단 LLM 판정. RawExtract → ScanPayload.

샌드박스(`plugin/`)와 UI(`ui/`)는 `figma.ui.postMessage` / `window.message`로만 통신. 모든 wire-level 형식은 `shared/`가 정의.

---

## `src/shared/` — 공유 계약

도메인 타입과 메시지 envelope 정의. 양쪽 사이드가 같은 타입을 import.

- **`schema.ts`** — 도메인 타입 (`Violation`, `EvaluateOutput`, `ScanPayload`, `SelectionState`) + wire 타입 (`UiMsg`, `CodeMsg`). 메시지 union의 단일 출처.
- **`protocol.ts`** — request/response 상관관계 인프라. `Envelope<T> = T & { requestId? }`, `UiEnvelope`, `CodeEnvelope`, `newRequestId()`. 핸들러가 응답에 동일 id를 echo → stale 응답 차단용.

---

## `src/plugin/` — Figma 샌드박스

`figma.*` API만 접근. DOM/window 없음. Vite가 `code.ts`를 entry로 단일 번들 생성.

### 루트

- **`code.ts`** _(entry)_ — UI 표시 + 크기 복원 + 핸들러 init + bus.start. 15줄.
- **`bus.ts`** — 메시지 라우터. `on(type, handler)` 등록, `start()`로 `figma.ui.onmessage` 부착, `postToUi(msg, requestId?)`가 응답에 requestId echo.
- **`sizing.ts`** — 크기 상수(`MIN_SIZE`, `DEFAULT_SIZE`, `SIZE_KEY`) + `restoreSavedSize()` (`clientStorage` 복원).
- **`extract.ts`** — 프레임 추출 (`extractFrame`). scan 핸들러 의존.

### `handlers/` — 메시지 종류별 핸들러

| 파일           | 책임                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| `selection.ts` | 초기 emit + `selectionchange` 구독 + `request-selection` 응답               |
| `scan.ts`      | `activeRequestId`로 in-flight scan cancel, `plugin/extract`(`extractFrame`) 호출, 결과 echo |
| `focus.ts`     | 노드 id 리스트 resolve, viewport 이동, missing 카운트 응답                  |
| `resize.ts`    | `figma.ui.resize` 적용. `commit===true`일 때만 `clientStorage` persist      |

새 메시지 추가 = 파일 1개 추가 + `code.ts`에 init 한 줄.

---

## `src/ui/` — React iframe UI

`createRoot` 단일 진입점. React 19, Vite single-file 번들.

### 루트

- **`main.tsx`** _(entry)_ — `<StrictMode> → <ErrorBoundary> → <Providers> → <App>`. Render 트리만 조립.
- **`App.tsx`** — scan 상태 머신 switch 라우터. props drill 없음, store에서 직접 읽음.
- **`providers.tsx`** — `Toast.Provider` 래퍼.
- **`messaging.ts`** — `postToCode()` 래퍼와 legacy `subscribe()` (내부적으로 `bus/client.ts` 위임).

### `bus/` — 메시지 인프라

| 파일            | 책임                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| `client.ts`     | `window.message` 단일 listener. fan-out emitter. 훅마다 listener 부착하던 패턴 제거 |
| `dispatcher.ts` | bus → store + toast 단일 라우터. requestId mismatch drop                            |
| `request.ts`    | focus 트래커 (`activeFocusId`) + `requestFocus()`. stale focus 토스트 차단          |

### `store/` — 상태 단일 출처

`useSyncExternalStore` 기반. 외부 의존성 없음.

| 파일              | 책임                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `create-store.ts` | 제네릭 store 팩토리 + `useStore` 훅. `Object.is` 동일 참조 시 알림 skip                              |
| `selection.ts`    | 샌드박스 selection 슬라이스                                                                          |
| `scan.ts`         | `idle/loading/clean/success` 머신 + `scanActions`. loading에 requestId 포함, action 단에서 race 가드 |

### `hooks/` — store 셀렉터/액션 wrapper

| 파일               | 책임                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| `use-selection.ts` | selection store 구독                                                                   |
| `use-scan.ts`      | scan state + `start(frameId, name)` (requestId 생성 + dispatch + postToCode) + `reset` |

훅은 얇은 어댑터. 로직은 store/dispatcher에 있음.

### `pages/` — 상태별 화면

| 파일              | 책임                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| `main.tsx`        | idle 화면. selection 종류에 따라 토스트/스캔 트리거                                |
| `scan-result.tsx` | success 화면. Tabs(color/typography) + Violation 섹션. counts/sort/split `useMemo` |
| `success.tsx`     | clean 화면 (위반 0)                                                                |

### `components/` — 재사용 UI + 시스템 부품

| 파일                 | 책임                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| `error-boundary.tsx` | 렌더 에러 catch + fallback UI + reset 버튼                                        |
| `message-bridge.tsx` | Providers 안에서 dispatcher 부팅 + 초기 `request-selection`                       |
| `resize-handler.tsx` | rAF throttle drag. pointermove → 큐 → next frame flush, pointerup만 `commit:true` |
| `toast.tsx`          | `toastManager` 싱글톤 + ToastProvider                                             |
| `hero-panel.tsx`     | main/success 공통 패널 슬롯                                                       |
| `loader.tsx`         | loading 스피너                                                                    |

#### `components/violation-card/`

위반 카드 전용 서브트리.

| 파일                       | 책임                                         |
| -------------------------- | -------------------------------------------- |
| `violation-card.tsx`       | 카드 컨테이너. 클릭 시 `requestFocus(nodes)` |
| `violation-breadcrumb.tsx` | 카드 상단 경로 표시                          |
| `token-comparison.tsx`     | used → suggested 토큰 chip + color swatch    |
| `violation-detail.tsx`     | detail 텍스트 + AI 추천 뱃지                 |
| `utils.ts`                 | `isHexColor` 등 헬퍼                         |
| `index.ts`                 | barrel re-export                             |

---

## 데이터 흐름

```
[사용자 액션]
   └─> hook (use-scan.start) ─postToCode─> plugin/bus ─dispatch─> handlers/scan
                                                                       └─ figma API
                                                                       └─ postToUi(requestId)
   <── window.message ── ui/bus/client (단일 listener)
                              └─ dispatcher ─ store action (requestId 매칭 후 set)
                                                  └─ useSyncExternalStore notify
                                                          └─ React re-render
```

특별 경로

- **selection 변화**: `figma.on('selectionchange')` → handler emit → store → 모든 구독 컴포넌트.
- **focus 토스트**: dispatcher가 `isActiveFocus()`로 stale 차단.
- **resize**: UI rAF 큐 → pointermove 시 `commit` 없음 → sandbox apply only / pointerup commit → persist.
