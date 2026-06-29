# Figma Token Review Plugin — 수정사항 설계 spec

날짜: 2026-06-29
대상: `apps/figma-token-review-plugin`
관련 스킬: `.claude/skills/figma-token-review`

## 배경

플러그인은 Figma 프레임을 추출 → LiteLLM(Anthropic 호환) `/v1/messages` 호출 → 응답을
`ScanPayload`로 파싱 → React UI에 렌더하는 흐름까지 완성. API 호출은 동작하지만 4가지 문제 발견:

1. 🟨 / 🔶 prefix 노드도 토큰 검사 대상에 포함됨
2. `suggested` 토큰이 카드에 첫 글자(`h`, `b`, `c`)로만 표시됨
3. AI가 반환하는 violation 객체에 schema 필수 필드(`type`, `severity`, `nodeId`) 누락
4. `detail` / `suggested` 자연어가 영어로 출력됨

`test.json` (실제 API 응답 캡처) 분석 결과:

- `suggested`가 **string**으로 반환됨 (스키마는 `string[]` 요구) → `violation.suggested[0]`이 문자열의 첫 char를 반환 → 카드에 한 글자만 표시되는 정확한 원인
- color violation에 `type`, `severity` 부재 → `PROPERTY_LABEL[violation.type]` undefined
- typography violation은 color shape와 다른 필드 구성(`characters`, `textStyle`, `appliedStatus`) → 통일된 `Violation` 타입 위반
- `summary` 필드명도 schema와 evaluate.mjs 사이 불일치
- `SYSTEM_PROMPT`가 영어이고 한국어 locale 지시 없음 → 자연어 출력이 영어로 흐름

## 목표

- 🟨 / 🔶 (확장 가능한 prefix 목록) prefix 노드는 토큰 추출 자체에서 제외
- AI 응답을 schema 준수 형태로 강제 (필드 / 타입 / 한국어 locale)
- UI 표시 버그 해결 (`suggested[0]` 등)
- color / typography 두 도메인이 동일 `Violation` base shape를 공유

## 비목표

- `parse.ts` normalizer 신설 (이번 스코프 제외 — 프롬프트 강제로 1차 대응)
- evaluate.mjs / typography-evaluate.mjs 로직 변경 (스킬 SSOT)
- UI 시각 디자인 변경

## 설계

### 1. SKIP_PREFIXES 가드

위치: `src/plugin/call-evaluator.ts`

```ts
const SKIP_PREFIXES = ['🟨', '🔶'] as const;

function shouldSkipNode(name: string): boolean {
    return SKIP_PREFIXES.some((p) => name.startsWith(p));
}

async function visit(node: SceneNode): Promise<void> {
    if (shouldSkipNode(node.name)) return;
    visited++;
    // ...
}
```

서브트리 전체 차단 (children 순회 진입 전 return). 추가 prefix 필요 시 배열만 수정.

### 2. SYSTEM_PROMPT 재작성

위치: `src/ui/evaluator/prompt.ts`

다음을 명시:

- **출력 JSON 스키마** (TypeScript-like 표기)
  - `ScanPayload = { color: EvaluateOutput, typography: EvaluateOutput }`
  - `EvaluateOutput = { violations: Violation[], conformant: Conformant[], summary: Summary, rubric: object }`
  - `Violation = { nodeId: string, nodeIds?: string[], count?: number, name: string, token: string | null, type: ViolationType, severity: 'high'|'info', detail: string, suggested: string[] }`
  - `ViolationType` 가능 값 enum 나열 (color 6종 + typography 2종)
  - `Conformant = { nodeId: string, nodeIds?: string[], name: string, token: string }`
  - `Summary = { total: number, conformCount: number, conformanceRate: number|null, highViolations: number, infoFlags: number }`
- **`suggested` 규칙**: 배열만 허용. 토큰 키 1개 이상 또는 빈 배열. 자연어 / "A or B" 형태 금지.
- **`nodeId` 규칙**: 그룹 violation이면 `nodeIds[0]`을 `nodeId`에 복사.
- **typography violation도 동일 base shape**. extra 정보(`characters`, `textStyle` 등)는 `detail`에 자연어로 녹임.
- **언어**: `detail` / `suggested` 외 자연어 필드는 **한국어**. 토큰 키(`colors.foreground.normal.100`) 자체는 영어 유지.
- **출력**: assistant message는 정확히 JSON 객체 하나. 마크다운 펜스 / 설명 금지.

### 3. schema.ts 정합

위치: `src/shared/schema.ts`

- `ViolationType` union에 `typo-raw`, `typo-styled-override` 추가
- `EvaluateOutput.summary` 필드명을 evaluate.mjs 출력에 맞춤:
  ```ts
  summary: {
      total: number;
      conformCount: number;
      conformanceRate: number | null;
      highViolations: number;
      infoFlags: number;
  }
  ```
- `EvaluateOutput.rubric?: Record<string, unknown>` 추가 (LLM이 반환하지만 UI에서 미사용 — 검증 통과용)

### 4. UI PROPERTY_LABEL 확장

위치: `src/ui/components/violation-card/violation-card.tsx`

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

이외 `violation.suggested[0]`는 변경 없음 — 이제 실제 배열을 받으므로 동작.

## 데이터 흐름 (수정 후)

```
[user] -> scan(frameId)
  └─ plugin/handlers/scan
      └─ call-evaluator.callEvaluator(frameId)
          └─ visit() — SKIP_PREFIXES 가드 통과한 노드만 추출
              └─ RawExtract { colors, typography, schemaMode, viewport, stats }
  └─ postToUi(extract-result, payload)
      └─ ui/evaluator/client.postLiteLLM(buildRequest(extract, model))
          └─ Anthropic /v1/messages
              └─ AnthropicMessagesResponse
      └─ ui/evaluator/parse.parseScanPayload(response)
          └─ ScanPayload { color, typography } — schema 준수
      └─ store/scan -> useSyncExternalStore -> ViolationCard 렌더
```

## 영향 받는 파일

1. `src/plugin/call-evaluator.ts` — SKIP_PREFIXES 상수 + visit() 가드
2. `src/ui/evaluator/prompt.ts` — SYSTEM_PROMPT 재작성
3. `src/shared/schema.ts` — `ViolationType` 확장 + `summary` 필드 정합 + `rubric` optional
4. `src/ui/components/violation-card/violation-card.tsx` — `PROPERTY_LABEL`에 typo-* 추가

## 테스트

- **수동**: 실제 Figma 프레임 스캔 → violation 카드에 (a) suggested 토큰명 전체 표시 (b) 한국어 detail (c) 🟨 / 🔶 노드 부재 확인
- **유닛 (가능 시)**: `parse.ts isScanPayload`가 schema 위반 응답을 throw하는지 회귀 케이스 추가

## 위험 / 한계

- 프롬프트 강제만으로 LLM 출력 안정성 100% 보장 불가 — 응답 흔들림 빈도 높으면 후속 `parse.ts` normalizer 단 추가 필요
- `summary` 필드명 변경은 schema 수정이라 향후 UI에서 summary 표시 시점에 영향 — 현재 UI는 summary 직접 표시 없음 (위반 카운트는 array length로 계산)
- `🟨` / `🔶` prefix 정책 자체는 디자인팀 컨벤션 의존. 컨벤션 변경 시 SKIP_PREFIXES 동기화 필요
