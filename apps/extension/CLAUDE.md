# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Vapor QA — 웹페이지 UI 요소를 핀하고 메모를 남겨 모은 뒤 Linear 이슈 하나로 등록하는 브라우저 확장. WXT + React. 사용자용 전체 흐름·기능 표는 `docs/extension-mvp.md` 참고.

## Commands

| 작업                   | 명령                                                     |
| ---------------------- | -------------------------------------------------------- |
| 개발 (HMR로 확장 띄움) | `pnpm dev`                                               |
| 프로덕션 빌드          | `pnpm build`                                             |
| 타입 체크              | `pnpm typecheck` (= `tsc --noEmit`)                      |
| 테스트 전체            | `pnpm test` (= `vitest --run`)                           |
| 단일 테스트            | `pnpm exec vitest run utils/dom/fiber-component.test.ts` |
| watch 테스트           | `pnpm exec vitest utils/dom/fiber-component`             |
| lint                   | `pnpm lint`                                              |

변경 후 검증 3종 세트: `pnpm typecheck` → `pnpm test` → `pnpm build`.

**vitest는 반드시 `vitest.config.ts`의 `WxtVitest()` 플러그인을 거쳐야 한다.** 이게 없으면 `~/` alias를 resolve 못 해 크로스 디렉토리 import를 쓰는 테스트가 깨진다(vitest는 `.wxt/tsconfig.json` alias를 직접 못 읽음). 이 파일을 지우지 말 것.

## Imports

- 디렉토리 경계를 넘는 import은 `~/` alias(extension 루트 기준): `~/utils/dom/selector`. `../../utils/...` 상대경로로 되돌리지 말 것.
- `./` 형제 import은 상대경로 유지 — alias로 바꾸지 말 것.
- `~/*`는 WXT가 `.wxt/tsconfig.json`에 자동 생성하므로 `tsconfig.json`에 alias를 또 적지 말 것(중복).
- `utils/linear`·`utils/messaging`은 폴더의 `index.ts`다 — 파일명 없이 `~/utils/linear`로 import(`/index` 붙이지 말 것).
- `utils/` 모듈은 도메인 1단계로 분류: `data/`(저장소), `dom/`(요소 분석), `linear/`(이슈 통합), `messaging/`(메시지 규약+world간 프로토콜). 새 모듈은 맞는 도메인에, 어디에도 안 맞으면 새 도메인 폴더. 깊이는 1단계 유지(`utils/dom/x`까지).

## Architecture — 4개 실행 컨텍스트

확장은 **origin·world가 다른 4개 컨텍스트**로 나뉘고 `@webext-core/messaging`(`utils/messaging/index.ts`의 `ProtocolMap`)으로 통신한다. 새 메시지를 추가하려면 먼저 `ProtocolMap`에 시그니처를 정의한다.

```
popup (확장 origin)      ── 아이콘 클릭 시 뜨는 창. API 키 입력 · 인스펙터 토글 · 리셋
sidepanel (확장 origin)  ── 항목 검토 + Linear 등록
background (확장 origin)  ── 서비스 워커. captureVisibleTab · IndexedDB(이미지) · 메시지 라우팅
content script           ── inspector.content/. 페이지에 주입.
  ├ isolated world: 오버레이/메모/캡처 트리거 (index.ts)
  └ MAIN world:     fiber 계보 읽기 (fiber-reader.ts) ← postMessage로 위임
```

세 가지 비직관적 결정이 구조 전체를 지배한다 — 건드리기 전에 이유를 알아야 한다:

1. **캡처·이미지 저장이 background에 모여 있다.** content script의 IndexedDB는 *주입된 페이지 origin*이라 확장 origin인 sidepanel이 못 읽는다. 그래서 `captureVisibleTab`과 이미지 저장을 background로 모아 origin을 일치시킨다(`background.ts`의 `captureAndStore`). 이미지 blob은 `image-store.ts`(IndexedDB `vapor-qa`)에, 메타데이터는 `session-store.ts`(wxt `storage` = `local:qaItems`)에 따로 산다.

2. **fiber 계보는 MAIN world에서만 읽힌다.** isolated content script는 페이지의 React fiber expando·`__REACT_DEVTOOLS_GLOBAL_HOOK__`에 접근 불가. 정본 경로: `inspector.content/index.ts`가 `injectScript('/fiber-reader.js')`로 MAIN world 주입 → 노드를 `data-vapor-qa-fiber-target`으로 마킹 → `postMessage`(FIBER_REQUEST/RESPONSE, `messaging/fiber-protocol.ts`)로 계보 회신. `wxt.config.ts`의 `fiber-reader.js` `web_accessible_resources` 선언은 이 경로에 **필수** — 삭제하지 말 것. isolated에서 expando를 직접 읽으려 하지 말 것(안 보임).

3. **이미지 공유 키는 `tabId/pageUrl/scrollX/scrollY/width`다.** 같은 탭·페이지·뷰포트에서만 imageRef를 공유하고 `index`를 올린다(`linear/image-sharing.ts`의 `findSharedImage`). `width`는 `window.innerWidth`다. 탭·URL·너비 중 하나라도 다르면 새로 캡처한다.

## 동작 명세 (버그로 오인하기 쉬운 의도된 동작)

- **인스펙팅 ON/OFF의 정본은 content script 메모리 변수 하나(`inspecting`)** — storage에 저장 안 함. 따라서 **인스펙팅 중 새로고침하면 조용히 OFF로 돌아간다**(content 재주입 → 초기화). 명세이지 버그 아님. `inspector.content/index.ts`에 자동 `setInspecting(true)`를 다시 넣지 말 것 — 인스펙터는 오직 팝업 토글로만 켜진다.
- **popup→content는 `sendMessage('getInspecting'/'setInspecting', ..., tabId)`로 직접 보낸다**(background 미경유). content 미주입 탭은 reject되며 그게 곧 "비지원 탭" 판정 — URL 화이트리스트·폴백 주입 도입 금지(의도).
- **API 키 입력 폼은 popup에만 둔다**(`popup/ApiKeyForm.tsx`·`useApiKey.ts`). sidepanel은 `useStoredApiKey`로 읽기만 — sidepanel에 입력 폼 되돌리지 말 것.
- **사이드패널 상태는 Chrome 142+의 `sidePanel.onOpened/onClosed`가 정본**이다. 포트 수명으로 열림 상태를 추측하지 말 것.
- **저장 경로에서 `clearPinned()`를 element/rect/components 확보 _전에_ 부르지 말 것** — `onUnpin`이 `pinnedElement/pinnedRect/pinnedComponents`를 전부 초기화해 저장할 값을 잃는다(`inspector.content/index.ts`의 `onSaveMemo`). 반드시 값 확보 후 호출.
- **vapor 컴포넌트가 새로 추가되면 fiber 추출 시 빠질 수 있다** — `extractComponentAncestry`는 이름 있는 컴포넌트를 거르되 구조 래퍼(`*Context`/`*Provider`)는 제외한다(벤더 중립). 누락이 잦으면 빌드 스크립트 자동 추출로 승격 고려.

## Linear 통합 함정

- Personal API Key는 `Authorization` 헤더에 값 그대로 — **`Bearer` 접두사 없음**(`utils/linear/index.ts`).
- 합성 이미지는 **base64 data URL을 마크다운에 직접 넣는다**(`linear/build-issue.ts`). Linear가 이미지를 자체 스토리지로 가져간다. 브라우저의 presigned URL PUT 경로를 다시 만들지 말 것.
- `createIssue`는 `teamId`만 주면 Triage 켜진 팀은 자동 Triage 상태(stateId 생략).

## vapor 스타일 prop

vapor의 `DeprecatedSprinkles`(직접 prop `gap`/`justifyContent`/`alignItems` 등 36키, VStack/HStack의 `gap` 포함)는 deprecated. `$css={{ ... }}` 객체로 쓴다(한 태그에 여러 개면 한 객체로 병합). 표준 React `style` prop은 deprecated 아니므로 미변경.
