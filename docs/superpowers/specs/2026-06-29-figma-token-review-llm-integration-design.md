# Figma Token Review Plugin — LiteLLM Integration Design Spec

- Date: 2026-06-29
- Author: noah.choi
- Status: Draft (awaiting implementation)
- Supersedes (partial): §11 "LiteLLM Swap Point" of `2026-06-25-figma-token-review-plugin-design.md`

## 1. Goal

Replace the fixture-based `callEvaluator` in `apps/figma-token-review-plugin` with a real LLM call routed through the internal LiteLLM proxy. The LLM runs the `figma-token-review` skill via Anthropic Agent Skills (Path X) so that:

1. Plugin sandbox extracts the selected frame into a `RawExtract` JSON (figma plugin API only).
2. UI sends `RawExtract` to LiteLLM with the `figma-token-review` skill attached. The LLM executes the skill's deterministic scripts (`evaluate.mjs`, `typography-evaluate.mjs`) via the `code_execution` tool and adds semantic judgement.
3. LLM returns a `ScanPayload` matching the existing schema; UI stores it without further sandbox round-trip.

The Figma plugin sandbox cannot make network calls (`manifest.networkAccess.allowedDomains = ["none"]`), so all HTTP work lives in the UI iframe with the proxy host added to `allowedDomains`.

## 2. Non-Goals

- Auto-fix or write-back of suggested tokens.
- Multi-frame batch scanning.
- Streaming UX (single JSON response is sufficient).
- Public/external plugin distribution (API key is bundled at build time — internal only).
- Skill SSOT consolidation. `extract.figma.js` is ported into the plugin; deterministic scripts/assets stay on the server-side skill attachment.

## 3. Data Flow

```
[Sandbox]                          [UI]                       [liteLLM proxy / Anthropic]
selection ─scan req─►
  extract logic (TS port of
  .claude/skills/figma-token-review/scripts/extract.figma.js)
  RawExtract ──postToUi──►
                                deterministic + semantic via LLM:
                                build messages + skill ref
                                  ─POST /v1/messages─►
                                                      Agent Skills loop:
                                                        code_execution runs
                                                        evaluate.mjs +
                                                        typography-evaluate.mjs
                                                      semantic judgement
                                  ◄─ScanPayload JSON─
                                zod validate → store update
                  (no echo back to sandbox)
```

Skill 4 steps mapped:

| Skill step                                                         | Owner                                     |
| ------------------------------------------------------------------ | ----------------------------------------- |
| 1. Extraction (`extract.figma.js`)                                 | Sandbox (ported)                          |
| 2. Deterministic check (`evaluate.mjs`, `typography-evaluate.mjs`) | LLM `code_execution` via skill attachment |
| 3. Semantic judgement (LLM)                                        | LLM main loop                             |
| 4. Output assembly                                                 | LLM (returns final JSON)                  |

## 4. Sandbox Changes (`src/plugin/`)

### 4.1 `call-evaluator.ts` — keep filename

New responsibility: produce `RawExtract`. **Do not rename the file.**

```ts
export async function callEvaluator(frameId: string): Promise<RawExtract> {
    // 1:1 TS port of .claude/skills/figma-token-review/scripts/extract.figma.js
    // top-level wrapper rewritten to accept frameId via plugin API
}
```

### 4.2 `src/shared/schema.ts` additions

```ts
export type RawExtract = {
    schemaMode: 'light' | 'dark';
    viewport: { width: number; height: number };
    colors: ColorUsage[]; // alias 끝까지 역추적된 사용 + 그룹화 포함
    typography: TypographyUsage[];
    stats: { nodeCount: number /* extract.figma.js와 동일 */ };
};

export type CodeMsg =
    | { type: 'selection'; state: SelectionState }
    | { type: 'extract-result'; payload: RawExtract } // 신규
    | { type: 'extract-error'; message: string } // 신규
    | { type: 'scan-result'; payload: ScanPayload } // sandbox는 보내지 않음. UI evaluator가 LLM 응답 후 자체 bus에 emit해서 기존 scan store 핸들러 재사용
    | { type: 'scan-error'; message: string }
    | { type: 'focus-result'; resolved: number; missing: number }
    | { type: 'focus-error'; message: string };
```

`ColorUsage`, `TypographyUsage`는 `extract.figma.js`가 산출하는 구조 그대로 TS 타입화.

### 4.3 `handlers/scan.ts`

- `callEvaluator` 호출 후 `postToUi({ type: 'extract-result', payload })`.
- LLM 호출은 UI 담당, sandbox 왕복 불필요.
- `activeRequestId` race guard 그대로 유지.

### 4.4 Porting rule

`extract.figma.js`는 1:1 mechanical 포팅. 로직 재작성 금지(skill SKILL.md: 재작성 드리프트가 최대 위협). 원본 파일 변경 시 플러그인 포팅본도 수동 동기화. 동기화 책임은 plugin 변경 PR 작성자에게 있음.

## 5. UI Evaluator Module (`src/ui/evaluator/`)

```
src/ui/evaluator/
├ client.ts       # liteLLM HTTP 호출
├ prompt.ts       # system + user 메시지 + skills + tools 빌더
├ parse.ts        # 응답 → ScanPayload zod 검증
└ index.ts        # runEvaluation 진입점
```

### 5.1 `runEvaluation(extract: RawExtract): Promise<ScanPayload>`

```ts
const request = buildRequest(extract);
const response = await postLiteLLM(request, { signal });
return parseScanPayload(response);
```

### 5.2 Dispatcher 연동

UI 측 bus dispatcher가 `extract-result` 수신 → `runEvaluation` 실행 → 결과를 store(`scan` slice)에 `scan-result`로 라우팅. 진행 단계는 store에 `loading.detail: 'extracting' | 'evaluating'`로 표시.

### 5.3 Cancel

scan slice의 `activeRequestId`가 바뀌면 `AbortController.abort()`. 응답 도착해도 stale이면 drop. 기존 sandbox `activeRequestId` 패턴과 의미 동일.

## 6. LiteLLM Request Contract

### 6.1 Endpoint + Auth

```
POST {VITE_LITELLM_BASE_URL}/v1/messages
Authorization: Bearer {VITE_LITELLM_API_KEY}
Content-Type: application/json
anthropic-version: 2023-06-01
```

### 6.2 Body (Path X — Anthropic Agent Skills)

```json
{
    "model": "claude-sonnet-4-6",
    "max_tokens": 8192,
    "skills": [{ "type": "skill", "name": "figma-token-review" }],
    "tools": [{ "type": "code_execution_20250522", "name": "code_execution" }],
    "system": "<§6.3 참고>",
    "messages": [{ "role": "user", "content": "<JSON.stringify({ extract: RawExtract })>" }]
}
```

- `skills` wire format은 사내 프록시 구현에 따라 등록형 / 인라인형으로 갈림. 구현 1차 시도: 등록형 (`name` 참조). 실패 시 인라인(skill 파일 base64 첨부) 폴백. 정확한 포맷은 사내 LiteLLM 문서 확인 후 코드에서 확정. **TBD: 구현 단계에서 wire format 픽스.**
- `code_execution` tool은 skill 내부 스크립트(`evaluate.mjs`, `typography-evaluate.mjs`)를 실행하기 위해 필수.
- `model`은 env `VITE_LITELLM_MODEL`로 override 가능. 기본값 `claude-sonnet-4-6`.

### 6.3 System Prompt 요지

- 역할: vapor 디자인 토큰 reviewer.
- 입력: `RawExtract` JSON (user message).
- 절차: 첨부된 `figma-token-review` skill의 2~4단을 수행. 2단(결정론)은 반드시 `code_execution`으로 `evaluate.mjs` + `typography-evaluate.mjs` 실행. LLM이 결정론 규칙 직접 판정 금지.
- 출력: **마지막 메시지에 JSON 한 개**, 코드펜스/주석/추가 텍스트 금지. 형식 = `ScanPayload`.
- 의미 판정 결과는 `violations[].detail` + `violations[].suggested`에 반영. confidence/reason은 detail 본문에 자연어로 포함 (스키마 변경 회피).

### 6.4 Response → `ScanPayload`

- 응답 `content` 배열의 마지막 `text` block에서 JSON 추출.
- `parse.ts`: `\{.*\}` greedy match → `JSON.parse` → zod `ScanPayloadSchema.parse`.
- 검증 실패 시 throw → UI `scan-error` 토스트 + dev console에 원본 응답 로그.

## 7. Env / Build / Manifest

### 7.1 Env 변수

| 이름                    | 용도                                               | 위치                                        |
| ----------------------- | -------------------------------------------------- | ------------------------------------------- |
| `VITE_LITELLM_BASE_URL` | 프록시 endpoint origin                             | `apps/figma-token-review-plugin/.env.local` |
| `VITE_LITELLM_API_KEY`  | Bearer 토큰                                        | 동일                                        |
| `VITE_LITELLM_MODEL`    | 모델 alias (optional, default `claude-sonnet-4-6`) | 동일                                        |

- `.env.example` commit (값 placeholder).
- `.env.local`은 `apps/figma-token-review-plugin/.gitignore`에 추가.
- Vite는 `VITE_*` prefix 변수를 `import.meta.env`로 자동 노출. 별도 `define` 불필요.

### 7.2 `manifest.json` 변경

```json
"networkAccess": {
  "allowedDomains": ["https://litellm.internal.goorm.io"]
}
```

- 실제 호스트는 사내 BASE_URL에 맞춰 PR 시점에 확정. wildcard 사용 금지(Figma 보안 권고).

### 7.3 Vite 설정

UI 빌드(`vite.config.ui.ts`)에 추가 필요 없음 — `VITE_*` env는 기본 동작으로 inline. Plugin 빌드(`vite.config.plugin.ts`)는 그대로.

### 7.4 보안

API 키가 빌드 산출물에 inline됨. 사내 배포 전용. 외부 배포 필요 시 별도 백엔드 프록시 도입(이번 milestone 제외).

## 8. Error Handling / UX

| 종류            | 트리거                         | UI 처리                                        |
| --------------- | ------------------------------ | ---------------------------------------------- |
| `extract-error` | sandbox 추출 실패              | toast + scan store `error`                     |
| `network-error` | fetch 실패 / 5xx / timeout 60s | toast "LLM 응답 없음" + 재시도 버튼            |
| `auth-error`    | 401 / 403                      | toast "API 키 확인"                            |
| `rate-limit`    | 429                            | toast "재시도 중" + 자동 backoff 1회 (2s)      |
| `parse-error`   | JSON 추출/zod 실패             | toast "응답 형식 오류" + dev console 원본 로그 |
| `skill-error`   | code_execution stderr          | toast + 원인 표시                              |

- timeout: 60s (LLM round + code execution 여유).
- 자동 재시도: rate-limit만 1회. 그 외 사용자 수동 재시도.
- Cancel: 다른 frame 선택 시 `AbortController.abort()`. 진행 중 응답 drop.
- 캐시 없음 (1차). 향후 `RawExtract` hash 키 in-memory 캐시 옵션. TBD.

UI loading state는 기존 `idle/loading/clean/success` 유지. `loading.detail` 서브 라벨 추가: `extracting` → `evaluating`.

## 9. Testing

### 9.1 Sandbox 측

- vitest. `globalThis.figma` mock.
- fixture frame trees → `callEvaluator` → 기대 `RawExtract` 스냅샷.
- 케이스: 단일 frame, nested instance, missing variable binding, mixed light/dark, do-not-use 토큰, raw hex (바인딩 없음).
- 포팅 검증: 원본 `extract.figma.js`를 Node로 동일 입력 실행한 출력과 deep-equal. drift 자동 감지.

### 9.2 UI 측

- `prompt.ts`: 빌더 출력 스냅샷 (system + user + skills + tools 배열).
- `parse.ts`: 정상 JSON / 코드펜스 / 깨진 JSON / 스키마 mismatch 케이스.
- `client.ts`: `msw` 또는 fetch mock으로 200 / 401 / 429 / 500 / timeout 경로 검증.

### 9.3 통합

- `scripts/smoke-llm.ts` 로컬 수동 1회. CI 미연동.

### 9.4 게이트

- `pnpm -C apps/figma-token-review-plugin lint`
- `pnpm -C apps/figma-token-review-plugin typecheck`
- `pnpm -C apps/figma-token-review-plugin build`

## 10. File Tree (delta from 2026-06-25 spec)

```
apps/figma-token-review-plugin/
├ .env.example                          # 신규
├ .env.local                            # 신규 (gitignored)
├ manifest.json                         # allowedDomains 갱신
└ src/
   ├ plugin/
   │  ├ call-evaluator.ts               # 책임 교체 (extract만), 파일명 유지
   │  └ handlers/scan.ts                # extract-result 메시지로 변경
   ├ shared/
   │  └ schema.ts                       # RawExtract + Color/TypographyUsage + 새 CodeMsg
   └ ui/
      └ evaluator/                      # 신규 디렉토리
         ├ client.ts
         ├ prompt.ts
         ├ parse.ts
         └ index.ts
```

`fixtures/color.json`, `fixtures/typography.json`은 테스트 비교/스냅샷용으로 보존. 런타임 import 제거.

## 11. Limitations

- API 키 빌드 inline → 사내 한정 배포.
- skill SSOT는 `.claude/skills/figma-token-review/`. 플러그인 포팅본(`call-evaluator.ts` 내부 extract 로직)은 원본 변경 시 수동 동기화 필요. drift 위험은 9.1 deep-equal 테스트로 감지.
- LLM 비결정성: confidence/reason 자연어가 호출마다 다를 수 있음. 결정론 violations 자체는 안정적.
- code_execution timeout 시 의미 판정이 누락될 수 있음. 결정론 출력은 skill 1차 결과로 보존.
- `skills` API wire format은 사내 프록시 스펙에 따라 확정 필요. 구현 단계에서 1차 등록형 → 실패 시 인라인 폴백.

## 12. Open Questions

- 사내 liteLLM 프록시의 `skills` 파라미터 wire format (등록형 vs 인라인) — 구현 시 확인.
- `claude-sonnet-4-6` model alias가 사내 프록시 라우팅에 등록되어 있는지 확인.
- `code_execution_20250522` tool type 사내 프록시 활성화 여부.

## 13. Out of Scope

- 스캔 히스토리 영속화.
- LiteLLM 엔드포인트/키 설정 UI.
- Telemetry / analytics.
- 외부 배포 시 백엔드 프록시 도입.
