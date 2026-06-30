# figma-token-review-plugin: Deterministic / LLM 책임 분리 설계

작성일: 2026-06-30
대상 컴포넌트: `apps/figma-token-review-plugin`
참조 스킬: `skills/figma-token-review` (Claude Code용, 본 작업으로 수정하지 않음)

---

## 1. 배경 & 목적

현재 plugin은 LiteLLM `/v1/messages`에 RawExtract JSON을 보내고, system prompt에 임베드한 `figma-token-review` 스킬 본문을 근거로 LLM이 결정론 + 의미 판정을 모두 수행한다. 그 결과:

- 결정론 항목(raw, do-not-use, scope-mismatch, fg-grade)도 LLM의 reasoning에 맡겨져 run-to-run 변동이 생긴다.
- 토큰 비용이 RawExtract 전체 + 스킬 본문 + 스키마 메타에 비례한다.
- 스킬의 의도("결정론과 의미를 분리한다")가 런타임에서 깨진다.

본 설계는 **결정론은 plugin이, 의미 판정은 LLM이** 수행하도록 책임을 잘라 다음을 달성한다.

- 결정론 항목의 100% 재현성
- LLM 호출당 토큰 큰 폭 절감 (스키마/추출 전체 → 의미 판정 대상 노드 + rubric 서브셋)
- 검사 범위를 vapor 전체 토큰(color, space, dimension, borderRadius, shadow, textStyle)으로 확장
- skill (`skills/figma-token-review`) 본체는 무수정 — Claude Code 사용 흐름 유지

## 2. Goals / Non-goals

### Goals

- Plugin은 frame 트리를 순회해 다음을 결정론으로 평가하고 추천한다.
    - 적용된 토큰이 property의 허용 스코프에 맞는지
    - Primitive 토큰 적용 시 동일 hex + 같은 스코프 semantic 후보 추천
    - Raw value 적용 시 토큰 후보 추천(스코프·hex 기반)
- LLM은 다음 두 항목만 분석한다.
    - 텍스트 위계(text styles)가 시안 내 텍스트들의 위계에 맞게 적용되었는지
    - fill/stroke의 semantic color가 노드의 역할·상태·상황에 적절히 대응하는지
    - 자기 영역의 대안 토큰 추천(결정론으로 fail 처리된 노드의 대안은 LLM이 추천하지 않는다)
- 출력은 6 카테고리(color, space, dimension, typography, borderRadius, shadow)로 분리된 단일 JSON. plugin UI가 이 JSON을 파싱해 섹션·카드를 구성한다.

### Non-goals

- skill (`skills/figma-token-review`)의 SKILL.md / scripts / references 변경
- WCAG 명도비 계산
- CI 헤드리스 검증
- Figma MCP 활용(plugin은 Figma 런타임 안에서 `figma.*` API를 직접 쓴다)
- 스크린샷 기반 시각 판정(MVP 범위 외, v2 후보)
- 의도(intent) 자연어 입력 UI — 사용자가 frame과 함께 자연어 의도(예: "선택된 탭 강조하려 했어")를 plugin UI에 입력해 LLM 판정의 기준 컨텍스트로 사용하는 흐름. MVP는 받지 않으며 skill의 "역할 추론(신뢰도 낮음)" 모드와 동등.

## 3. 책임 분담 요약

| 영역 | Plugin (결정론) | LLM (의미 판정) |
| --- | --- | --- |
| 토큰 합법성 | ✅ 모두 | ❌ |
| 스코프 매칭(property→role) | ✅ | ❌ |
| Primitive→Semantic 대체 가능 여부 | ✅ (동일 hex + 같은 스코프) | ❌ |
| Raw→Token 대체 후보 | ✅ | ❌ |
| Do-not-use 검출 (토큰 메타에 명시된 `status: 'do-not-use'` 플래그 단순 lookup) | ✅ | ❌ |
| when / avoid 상황 묘사 적합성 | ❌ | ✅ |
| fg-grade(배경/전경 짝) | ✅ | ❌ |
| TextStyle 미바인딩 검출 | ✅ | ❌ |
| 텍스트 **위계 적합성** | ❌ | ✅ |
| Semantic color **의미 적합성**(역할/상태/상황) | ❌ | ✅ |
| 자기 영역의 대안 토큰 추천 | 결정론 fail 노드 | LLM 의미 판정 항목 |

원칙: **LLM은 일체 결정론 분석을 하지 않는다.** LLM이 결정론을 흉내내는 비용·오탐을 피한다.

## 4. Plugin 결정론 모듈

### 4.1 구조

```
apps/figma-token-review-plugin/src/
├── plugin/              # Figma main thread (figma.* API)
│   ├── extract/         # frame 트리 순회 + 스타일 추출
│   │   ├── color.ts
│   │   ├── space.ts     # padding + gap
│   │   ├── dimension.ts # width + height
│   │   ├── radius.ts
│   │   ├── shadow.ts
│   │   └── typography.ts
│   └── code.ts          # entry, postMessage
├── common/
│   ├── schemas.ts       # 확장된 도메인 타입
│   └── tokens/          # vapor 토큰 schema (skill assets에서 수동 복사)
│       ├── semantic-color.light.json
│       ├── semantic-color.dark.json
│       ├── primitive-color.light.json
│       ├── primitive-color.dark.json
│       ├── text-style.json
│       ├── typography.json
│       ├── space.json
│       ├── dimension.json
│       ├── border-radius.json
│       └── shadow.json
└── ui/
    ├── lib/
    │   ├── scope.ts         # property → 허용 token role/scope SSOT
    │   ├── evaluate/
    │   │   ├── color.ts
    │   │   ├── space.ts
    │   │   ├── dimension.ts
    │   │   ├── typography.ts
    │   │   ├── radius.ts
    │   │   └── shadow.ts
    │   ├── recommend.ts     # 대안 추천 규칙(섹션 4.4)
    │   └── rubric.ts        # LLM 입력용 rubric 서브셋 생성기
    └── features/llm/        # LLM 호출(섹션 5)
```

### 4.2 RawExtract 확장

각 스타일 카테고리는 노드별 사용(`*Usage`) 배열로 추출된다. 기존 `colors`, `typography`에 다음 추가:

- `spaces: SpaceUsage[]` — padding(top/right/bottom/left), itemSpacing(gap)
- `dimensions: DimensionUsage[]` — width, height (auto/fill은 제외)
- `radii: RadiusUsage[]` — cornerRadius(균일·개별), rectangleCornerRadii
- `shadows: ShadowUsage[]` — effects 중 DROP_SHADOW/INNER_SHADOW

각 Usage 공통 필드: `nodeId`, `nodeIds?`, `count?`, `name`, `property`, `token` (string | null), `value` (string — `'12px'` 등 원시 표기), `tokenStatus: 'ok' | 'raw' | 'unknown'`. color/typography는 기존 구조 유지하되 통일된 `value` 필드 추가.

### 4.3 스코프 매핑 (property → 허용 role)

`ui/lib/scope.ts`에 TypeScript 상수로 정의 (skill 무수정 정책에 따름):

```ts
export const PROPERTY_SCOPE: Record<Property, ReadonlyArray<Role>> = {
  fill: ['background'],
  'fill-on-text': ['foreground'],
  stroke: ['border', 'foreground'],
  padding: ['space'],
  gap: ['space'],
  width: ['dimension'],
  height: ['dimension'],
  borderRadius: ['borderRadius'],
  shadow: ['shadow'],
};
```

`role`은 semantic-color.json의 `accessibility.role`과 space/dimension/radius/shadow JSON의 카테고리 키에서 도출. text 노드의 fill은 `fill-on-text`로 별도 분기 (skill `evaluate.mjs`의 stroke role 분기와 같은 정책).

Typography는 스코프 매핑을 두지 않는다. 결정론은 skill 3축 정책 그대로 — textStyle 미바인딩(`typo-raw`)과 부분 오버라이드(`typo-styled-override`)만 검사한다. font-family / font-size를 분리해서 검사·추천하지 않으며(textStyle 바인딩 시 정의상 일치), 위계 적합성은 LLM 의미 판정의 역할이다.

### 4.4 대안 추천 규칙 (`recommend.ts`)

LLM이 결정론 fail의 대안을 추천하지 않으므로 plugin이 모든 결정론 위반의 `suggested[]`를 채운다.

| 케이스 | 추천 우선순위 |
| --- | --- |
| Raw (color) | 1) 동일 hex + 스코프 맞는 semantic 2) 동일 hex primitive 3) `[]` |
| Raw (dimension / space / radius / shadow) | 1) 스코프 맞는 동일 value 토큰 2) `[]` |
| Primitive 사용 (color) | 1) 동일 hex + 스코프 맞는 semantic 2) `[]` |
| Scope mismatch | 1) 해당 property 스코프 + 같은 위계 토큰 2) `[]` |
| Do-not-use | skill SKILL.md의 do-not-use 대체 정의 그대로(skill JSON 메타에 후보 있음) |
| fg-grade-mismatch | `.200` 동위계 fg (기존 evaluate.mjs와 동일) |
| Unknown-token / fg-grade-ambiguous | `[]` (사람 검토) |
| `typo-raw` (textStyle 미바인딩) | `[]` — 결정론으로 위계를 알 수 없으므로 비움. LLM 의미 판정이 `typography[]`에서 자기 추천 제공 가능 |
| `typo-styled-override` | `[]` — 의도 가능성 있어 추천 보류 |

"같은 위계"는 정수 등급(100/200, 050/100/150…)이 일치하는 것. 다중 후보가 가능하면 배열에 모두 포함하고 plugin UI가 표시.

### 4.5 결정론 위반 타입

기존 8개 + 신규 1개:

```ts
type ViolationType =
  | 'token-not-used'        // raw value 사용 (모든 카테고리)
  | 'primitive-used'        // 신규: primitive 사용, semantic 대체 가능 (color 한정)
  | 'unknown-token'         // 바인딩 있으나 스키마 미도달 (오타 등)
  | 'do-not-use'
  | 'role-mismatch'         // = scope mismatch (property가 허용하는 role 위반)
  | 'fg-grade-mismatch'
  | 'fg-grade-ambiguous'
  | 'typo-raw'              // textStyle 미바인딩
  | 'typo-styled-override'; // textStyle 적용 후 일부 필드 오버라이드
```

severity 정책:

- `token-not-used`: high (모든 카테고리)
- `primitive-used`: info (대체 가능 안내)
- `unknown-token`, `do-not-use`, `role-mismatch`, `fg-grade-mismatch`, `typo-raw`: high
- `fg-grade-ambiguous`, `typo-styled-override`: info

## 5. LLM 모듈

### 5.1 호출 단위

Plugin이 결정론을 끝낸 후 LLM은 **단일 호출**로 두 의미 판정을 동시에 처리한다. 별 호출로 분리하지 않는다(왕복·캐시 효율).

### 5.2 LLM 입력 (user message)

```jsonc
{
  "context": {
    "schemaMode": "light" | "dark",
    "viewport": "pc" | "tablet" | "mobile",
    "frameName": "<root frame name>"
  },
  "judgmentTargets": {
    "typography": [
      // textStyle이 바인딩된 텍스트 노드만(결정론 통과)
      { "nodeId": "...", "name": "label", "characters": "...", "textStyle": "subtitle1",
        "parentName": "...", "siblingIndex": 0, "totalSiblings": 3 }
    ],
    "semanticColor": [
      // semantic color가 적용된 fill/stroke 노드만(결정론 통과)
      { "nodeId": "...", "name": "alert", "property": "fill", "token": "colors.background.danger.100",
        "parentName": "...", "neighbors": ["..."], "characters": "삭제됨" }
    ]
  },
  "rubric": {
    // judgmentTargets에 실제 등장한 토큰의 when/avoid 서브셋만
    "textStyle": { "subtitle1": { "rank": 9, "totalRanks": 16, "when": [...], "avoid": [...], "$description": "..." } },
    "color": { "colors.background.danger.100": { "when": [...], "avoid": [...], "role": "background", "$description": "..." } }
  }
}
```

- **결정론 fail 노드는 보내지 않는다.** LLM은 자기 영역에서만 판정·추천한다.
- 원시 RawExtract / 전체 스키마 / 결정론 결과 자체는 보내지 않는다.
- 스크린샷 미사용 (MVP).
- viewport 의존 규칙은 rubric의 `when` 항목에 의존(예: `"mobile viewports → heading1"`).

### 5.3 LLM 출력 스키마

LLM은 plugin이 합성할 `heuristic` 위반/추천 목록만 낸다. JSON only, markdown 금지.

```jsonc
{
  "typography": [
    {
      "nodeId": "...",
      "name": "label",
      "token": "subtitle1",
      "verdict": "FAIL" | "PASS",
      "confidence": "HIGH" | "MED" | "LOW",
      "reasoning": "Korean prose",
      "suggested": ["body2"]  // verdict=FAIL일 때만 채움. 자기 영역의 textStyle 후보만.
    }
  ],
  "semanticColor": [
    {
      "nodeId": "...",
      "name": "alert",
      "property": "fill",
      "token": "colors.background.danger.100",
      "verdict": "FAIL" | "PASS",
      "confidence": "HIGH" | "MED" | "LOW",
      "reasoning": "Korean prose",
      "suggested": ["colors.background.warning.100"]
    }
  ]
}
```

### 5.4 LLM system prompt

`prompt.ts`에 embed. 구성:

- (정적, cache_control: ephemeral) "당신은 vapor 디자인 토큰의 의미 판정자다. 결정론 분석은 일체 하지 않는다. 너의 일은 (a) 텍스트 위계 적합성, (b) semantic color 의미 적합성 두 가지뿐이다." + 위 출력 스키마 + hard rules
- (정적, cache_control: ephemeral) 의미 판정 가이드(skill SKILL.md의 의미 판정 섹션과 동등한 내용을 prompt 전용으로 재기술)

skill 본문 / extraction.md / limitations.md / scripts는 더 이상 embed하지 않는다. (의미 판정에 필요한 부분만 prompt에 직접 기술)

### 5.5 prompt caching

system 블록 2개 전부 정적. 두 번째 블록 끝에 `cache_control: { type: 'ephemeral' }` 1개. 5분 TTL, 호출 burst에서 90% 절감.

### 5.6 출력 합성

Plugin이 결정론 결과 + LLM 결과를 카테고리별 `EvaluateOutput`으로 합성한다(섹션 6 참조). LLM 항목은 `heuristic: true` 플래그 + `confidence` + `reasoning`을 단 채 동일 `violations[]`에 들어간다.

## 6. 최종 출력 JSON

```ts
type Severity = 'high' | 'info';
type Confidence = 'HIGH' | 'MED' | 'LOW';

type Violation = {
  nodeId: string;
  nodeIds?: string[];
  count?: number;
  name: string;
  property: Property;       // 신규: 'fill' | 'stroke' | 'padding' | ...
  token: string | null;
  value: string | null;     // 신규: 원시값 문자열 (`'#abc123'`, `'17px'` 등)
  type: ViolationType;
  severity: Severity;
  detail: string;           // Korean
  suggested: string[];
  // LLM 항목 전용
  heuristic?: true;
  confidence?: Confidence;
  reasoning?: string;       // Korean
};

type EvaluateOutput = {
  violations: Violation[];
  conformant: Conformant[];
  summary: {
    total: number;
    conformCount: number;
    conformanceRate: number | null;
    highViolations: number;
    infoFlags: number;
    heuristicViolations: number; // 신규: heuristic 항목 수(참고용)
  };
};

type ScanPayload = {
  color: EvaluateOutput;
  space: EvaluateOutput;         // padding + gap
  dimension: EvaluateOutput;     // width + height
  typography: EvaluateOutput;
  borderRadius: EvaluateOutput;
  shadow: EvaluateOutput;
};
```

### 적합률 계산 정책

- 분모: 카테고리 내 전체 평가 요소(`total`)
- 부적합으로 카운트하는 위반:
    - severity == 'high' && (heuristic 아님)
    - severity == 'high' && heuristic && confidence == 'HIGH'
- 부적합으로 카운트하지 않는 위반(`infoFlags`로만 카운트):
    - severity == 'info'
    - heuristic && confidence != 'HIGH'
- conformant는 결정론 통과 항목만. LLM PASS는 violations에도 conformant에도 기록하지 않음(MVP 노이즈 회피).

### space 와 dimension 분리

vapor에서 `space`(padding/gap용 토큰셋)와 `dimension`(width/height용 토큰셋)은 별도 스코프다. 통합하지 않는다. ScanPayload에서 `space`와 `dimension`은 각자 `EvaluateOutput`을 가진다. `property` 필드로 세부 구분(`space.property ∈ {'padding','gap'}`, `dimension.property ∈ {'width','height'}`).

## 7. 데이터 흐름

```
[Figma]
   │ (selection: frame)
   ▼
[plugin/extract]   ── extracts ──▶  RawExtract (확장본)
   │
   ▼
[ui/lib/evaluate]  ── per category deterministic check ──▶  detResults
   │
   ├──▶  [ui/lib/rubric] ── select judgmentTargets + rubric subset
   │             │
   │             ▼
   │        [features/llm]  ── single POST /v1/messages ──▶ llmResults
   │             │
   ▼             ▼
[merge] ── ScanPayload (6 categories, violations[heuristic+det], conformant, summary)
   │
   ▼
[ui rendering]
```

## 8. skill (`skills/figma-token-review`)와의 관계

- skill 본체는 **무수정**. SKILL.md, scripts, references, assets 어떤 파일도 본 PR에서 손대지 않는다.
- plugin은 skill의 schema JSON을 **수동 복사**해 `common/tokens/`에 둔다(`semantic-color.*`, `text-style.json`, `typography.json`). 동기화는 운영 규율로 보장한다.
- space/dimension/borderRadius/shadow는 `skills/token-lint/assets/`에서 수동 복사한다(같은 모노레포의 별 skill — 이번 작업은 token-lint도 무수정).
- 위 수동 복사는 drift 위험이 있다. 운영 가드:
    - 복사 시점의 source SHA(파일 hash)를 `common/tokens/MANIFEST.json`에 기록
    - CI에서 source ↔ plugin 복사본 diff가 발생하면 경고(실패는 아님)

## 9. 영향 범위 및 마이그레이션

| 영역 | 영향 |
| --- | --- |
| `src/plugin/code.ts` (extract) | 확장: space/dimension/radius/shadow 추출 추가 |
| `src/common/schemas.ts` | 확장: ScanPayload 6 카테고리, Violation에 `heuristic/confidence/reasoning/property/value` 추가, ViolationType에 `primitive-used` 추가 |
| `src/ui/features/llm/prompt.ts` | 재작성: skill 본문 embed 제거, 의미 판정 전용 system prompt + 새 입력 스키마 |
| `src/ui/features/llm/client.ts` | 거의 무변경(transport). `skills` 필드 제거(완료) |
| `src/ui/features/llm/parse.ts` | 합성 단계 추가(plugin det + llm → ScanPayload) |
| `src/ui/lib/evaluate/*` (신규) | 카테고리별 결정론 평가 |
| `src/ui/lib/scope.ts` (신규) | property → role SSOT |
| `src/ui/lib/recommend.ts` (신규) | 대안 추천 규칙 |
| `src/ui/lib/rubric.ts` (신규) | LLM 입력 rubric 서브셋 생성 |
| `src/common/tokens/*` (신규) | skill / token-lint asset 수동 복사본 |
| UI 컴포넌트 | 6 카테고리 섹션, heuristic 배지, confidence 표시 |
| `vite.config.ui.ts` | `@skill` alias 제거(이번 작업에서 더 이상 skill 본문을 import하지 않음) |

기존 ScanPayload 형상이 바뀌므로 UI 컴포넌트의 prop 타입도 확장된다. UI 변경은 본 작업 범위에 포함한다(분리 PR 아님).

## 10. 테스트 전략

- **결정론 모듈**: `ui/lib/evaluate/*`, `recommend.ts`, `scope.ts`는 순수 함수. 단위 테스트 신규 작성(브라우저 호환). skill의 `evaluate.test.mjs`를 직접 재사용하지 않으나, 동일한 fixture를 참고할 수 있다.
- **LLM 호출**: contract test — 고정 input → JSON 스키마(typography[], semanticColor[]) 만족. 의미 판정 내용은 단정하지 않음.
- **출력 합성**: det + llm 결과 → ScanPayload 합성 로직 단위 테스트.
- **추출**: 기존 fixture(`fixtures/*.json`) 확장으로 새 카테고리 시드.

## 11. 열린 이슈 / v2 후보

- 의도(intent) 자연어 입력 UI — skill의 "역할 추론 신뢰도 낮음" 모드를 plugin UI 헤더에 표시할지 결정
- 스크린샷 image content block — 텍스트 위계 정확도 검증 후 필요시 추가
- skill ↔ plugin token JSON 동기화 자동화(현재는 수동 복사 + MANIFEST hash 검증)
- LLM PASS 항목을 conformant에 노이즈 없이 합치는 방안(현재 MVP는 미기록)
- LLM 비용 추적 — 호출당 input/output 토큰 메트릭 로깅

## 12. 결정 사항 요약 (Q&A)

| 결정 | 값 |
| --- | --- |
| 검사 범위 | color + space + dimension + borderRadius + shadow + textStyle |
| Primitive→Semantic 대체 판정 | 동일 hex + 같은 스코프 (color 한정) |
| 스코프 SSOT | `plugin/src/ui/lib/scope.ts` 상수 |
| 결정론 로직 위치 | plugin 내부 별도 모듈 |
| 출력 분류 축 | 토큰 카테고리 (6개: color, space, dimension, typography, borderRadius, shadow) |
| Primitive severity | info |
| Raw severity | 모두 high |
| LLM 출력 위치 | violations[]에 heuristic + confidence + reasoning |
| 적합률 카운트 | confidence=HIGH heuristic만 부적합 |
| 대안 추천 책임 | plugin이 모든 결정론 fail의 대안 추천. LLM은 자기 영역만 |
| LLM 입력 | 결정론 통과 + 의미 판정 대상 노드 + rubric 서브셋 |
| 스크린샷 | MVP 안 보냄 (구조 데이터만) |
| skill 본체 | 무수정 (plugin이 schema 수동 복사) |
