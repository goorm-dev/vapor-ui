# figma-token-review-plugin — 모듈 이름 정리 spec

날짜: 2026-06-29
대상: `apps/figma-token-review-plugin/src`, `apps/figma-token-review-plugin/ARCHITECTURE.md`
선행 참고: `docs/superpowers/notes/2026-06-29-figma-token-review-plugin-flow.md`

## 배경

플러그인은 두 단계 검증을 거친다.

1. **1단 추출** (plugin 샌드박스): Figma 노드 트리에서 색상/타이포 사용을 모은다. 결정론. LLM 호출 없음.
2. **2단 LLM 판정** (ui iframe): 1단 결과를 LiteLLM(Anthropic 호환 API)에 보내 위반/적합을 판정 받는다.

현재 코드는 두 단계 모두 "evaluator"라는 이름을 쓴다.

- `plugin/call-evaluator.ts` — 사실은 **추출기**. LLM 안 부른다.
- `ui/evaluator/` — 사실은 **LLM 판정기**.

이 이름 충돌이 흐름 다이어그램 §9 첫 항목으로 잡혔다 (참고: notes 파일).

## 목표

- 1단(추출)과 2단(LLM 판정)의 의도가 파일/심볼 이름에서 즉시 드러나도록 한다.
- 의미적 충돌 제거 ("evaluator"가 한 단계에만 붙도록).
- ui 측 LLM 코드는 향후 추가될 수 있는 다른 보조 라이브러리와 함께 `libs/`에 모은다.

## 비목표

- 디스패처/요청 ID/오케스트레이션 분리 — 별도 후속 작업 (flow notes §9 항목 2~5).
- 새 기능, 동작 변경, 로직 리팩터.
- 테스트 도입.

## 설계

### Plugin 측 — 1단 추출

| 항목 | 전                                            | 후                                           |
| ---- | --------------------------------------------- | -------------------------------------------- |
| 파일 | `src/plugin/call-evaluator.ts`                | `src/plugin/extract.ts`                      |
| 함수 | `callEvaluator(frameId): Promise<RawExtract>` | `extractFrame(frameId): Promise<RawExtract>` |

영향: `src/plugin/handlers/scan.ts`의 import 경로 + 호출 식별자 두 군데.

### UI 측 — 2단 LLM 판정

위치 이동: `src/ui/evaluator/` → `src/ui/libs/llm/`

파일 4개 그대로 옮긴다. 내부 구조는 변경하지 않는다.

| 파일 (불변 이름) |
| ---------------- |
| `index.ts`       |
| `client.ts`      |
| `parse.ts`       |
| `prompt.ts`      |

심볼 rename:

| 전                      | 후                        |
| ----------------------- | ------------------------- |
| `EvaluatorEnv`          | `LlmEnv`                  |
| `EvaluatorHttpError`    | `LlmHttpError`            |
| `EvaluatorTimeoutError` | `LlmTimeoutError`         |
| `EvaluatorParseError`   | `LlmParseError`           |
| `runEvaluation`         | `runLlmEvaluation`        |
| `RunEvaluationOptions`  | `RunLlmEvaluationOptions` |

심볼 유지 (도메인-중립 또는 wire 프로토콜 명):

- `postLiteLLM`
- `parseScanPayload`
- `buildRequest`
- `SYSTEM_PROMPT`
- `AnthropicMessagesRequest`
- `AnthropicMessagesResponse`

내부 클래스 `name` 필드 (`this.name = 'EvaluatorHttpError'` 등)도 새 심볼 이름으로 정합.

영향 callsite:

- `src/ui/bus/dispatcher.ts` — import 경로 (`'../evaluator'` → `'../libs/llm'`) + 심볼 4종 (`EvaluatorHttpError` → `LlmHttpError`, `EvaluatorParseError` → `LlmParseError`, `runEvaluation` → `runLlmEvaluation`)

이외 callsite 없음 (grep으로 확인).

`dispatcher.ts` 내부 로컬 함수 `evaluateExtract`는 변경하지 않는다 — 외부 노출 없는 로컬, 문맥상 명확.

### 문서 — ARCHITECTURE.md

`apps/figma-token-review-plugin/ARCHITECTURE.md`의 모듈 트리/설명 중 evaluator 참조를 정리:

- `plugin/call-evaluator` 언급 → `plugin/extract`
- `ui/evaluator` 언급 → `ui/libs/llm`
- 1단/2단 역할 한 문장 명시 (헷갈림 방지).

원본 문서가 압축된 한국어 다이어그램+표 혼합이므로, 새 이름이 일관되게 반영되는 한도 내에서 최소 수정.

## 영향 파일 (총 8)

| 파일                                             | 변경 종류            |
| ------------------------------------------------ | -------------------- |
| `src/plugin/call-evaluator.ts`                   | 이동 + 함수명 변경   |
| `src/plugin/handlers/scan.ts`                    | import + 호출 식별자 |
| `src/ui/evaluator/index.ts`                      | 이동 + 심볼 rename   |
| `src/ui/evaluator/client.ts`                     | 이동 + 심볼 rename   |
| `src/ui/evaluator/parse.ts`                      | 이동 + 심볼 rename   |
| `src/ui/evaluator/prompt.ts`                     | 이동 (변경 없음)     |
| `src/ui/bus/dispatcher.ts`                       | import 경로 + 심볼   |
| `apps/figma-token-review-plugin/ARCHITECTURE.md` | evaluator 참조 정합  |

## 검증

- `pnpm typecheck` PASS
- `pnpm lint` PASS
- `pnpm build` PASS
- 수동: 빌드 산출물(`dist/`)로 플러그인 실행 → 스캔 / focus / clean 흐름 동작 변화 없음

## 위험

- `ui/libs/llm/` 디렉토리에 단일 라이브러리만 들어가는 상태에서 `libs/` 컨테이너 도입 → 후속 보조 모듈이 실제로 늘어나지 않으면 빈 namespace로 남을 수 있음. 받아들임 (향후 확장 의도 명시).
- ARCHITECTURE.md가 압축된 한국어로 작성되어 있어 부분 편집 시 문장이 깨질 위험. 새 이름이 들어가는 줄만 외과적 교체.
- vite alias `~`나 tsconfig path가 evaluator 디렉토리에 결합되어 있으면 추가 수정 필요 — 구현 전 확인.
