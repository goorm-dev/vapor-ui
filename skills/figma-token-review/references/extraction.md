# 1단계: 통합 추출 (extraction)

`scripts/extract.figma.js`는 `use_figma`에 전달하는 read-only 고정 스크립트다. 에이전트는 상단
`ROOT_ID`·`MODE` 두 상수만 치환하고 로직은 손대지 않는다. 결함을 발견하면 파일 자체를 고치고
이 문서·테스트를 함께 갱신한다(매 실행 즉석 재작성 금지 — 재작성 드리프트가 정확도의 최대 위협).

## 무엇을 뽑나

한 트리 순회에서 색상과 typography를 함께 추출한다.

- **색상**: 노드의 `boundVariables.fills`/`strokes`와 미바인딩 SOLID fill/stroke.
- **typography**: TEXT 노드를 `getStyledTextSegments`로 분류.
- **배경**: foreground 판정(4축)을 위해 텍스트 요소의 조상 배경을 함께 분류.

## alias 체인은 끝까지 해석한다

vapor는 component-specific 토큰(`vapor-primary` 등)이 Figma에만 정의돼 있고, 이게 semantic을 한 겹
감싼다. MCP `get_variable_defs`는 진입점 이름 + 최종 hex만 주고 중간 semantic을 평탄화로 숨기므로
검증에 부적합하다. 그래서 `getVariableByIdAsync`를 재귀(`walk`)로 따라가 **체인 어딘가의 semantic
단계 이름**을 복원한다.

- **판정 기준 토큰 = 진입점(component)이 아니라 체인이 도달한 semantic.** `vapor-primary`가
  `foreground-primary-200`을 거치면 2·4축 판정은 `foreground-primary-200` 기준.
- **mode 고정**: 노드의 `resolvedVariableModes[collectionId]`로 light/dark 체인을 정하고,
  값이 없을 때만 해당 변수의 첫 mode를 fallback으로 사용한다.
- **collection 단계 판별**은 이름 기준(`tierOf`): primitive/semantic/component. semantic 단계 변수의 `.name`이 복원원.
- **스키마 키 변환**: `color-foreground-primary-200` → `colors.foreground.primary.200`
  (`color-`→`colors.`, 하이픈→점). 변환 키가 스키마에 실제 있는지는 evaluate가 판정한다.

## tokenStatus — 정직성

- **`ok`**: 체인이 semantic에 도달. `token`에 스키마 키.
- **`unknown`**: 바인딩은 있으나 체인이 semantic 미도달(오타·깨진 별칭·remote import 실패). `token=null`.
  hex가 같다고 token을 추론해 채우지 않는다.
- **`raw`**: 변수 미바인딩 SOLID paint. `token=null`. → 1축 위반.

remote 변수는 `importVariableByKeyAsync`를 한 번 시도하고 재조회한다. 그래도 실패면 체인 중단 → `unknown`
(거짓 통과 금지).

## 배경 식별 (4축 입력)

`classifyBackground`는 텍스트 노드의 조상 체인에서 **가장 가까운 불투명 SOLID fill**을 배경으로 채택한다.

- `white` (#ffffff) / `other` (그 외 불투명 색) / `transparent` (불투명 배경 못 찾음).
- **`ambiguous`**: fill은 있는데 노드나 fill이 반투명이라 그 아래 색과 섞이는 경우. z-order 겹침·
  opacity 트릭으로 배경이 불확실한 케이스 → 단정하지 않고 보류(evaluate가 info로 처리).
- z-order 정밀 재구성(Polychrom)은 범위 밖. "파란 fill 오판 전례"를 피하는 게 설계 제약 —
  확실하지 않으면 `ambiguous`로 떨어뜨려 오판을 막는다.

## 출력 형식 (evaluate 입력과 1:1)

동일 평가 입력 요소는 `nodeIds`/`count`로 그룹핑(손실 없는 압축). 반환 객체:

```jsonc
{
    "mode": "both",
    "viewport": "pc",
    "schemaMode": "light",
    "stats": {
        "visited": 24,
        "textNodes": 6,
        "colorGroups": 11,
        "typoGroups": 4,
    },
    "colors": [
        {
            "nodeIds": ["1:2"],
            "count": 1,
            "name": "bg",
            "property": "fill",
            "token": "colors.background.primary.100",
            "hex": "#c6e6ff",
            "tokenStatus": "ok",
            "background": null,
        },
        {
            "nodeIds": ["3:4"],
            "count": 1,
            "name": "text",
            "property": "text",
            "token": "colors.foreground.primary.100",
            "hex": "#0043b3",
            "tokenStatus": "ok",
            "background": { "kind": "other", "hex": "#2a6ff3" },
        },
    ],
    "typography": [
        {
            "nodeIds": ["5:6"],
            "count": 1,
            "name": "label",
            "characters": "안내",
            "textStyle": "subtitle1",
            "viewport": "pc",
            "appliedStatus": "styled-clean",
            "overriddenFields": [],
            "resolved": { "fontSize": 14, "lineHeight": {}, "fontName": {} },
        },
    ],
}
```

`schemaMode`는 루트가 고정한 변수 mode 이름에 "dark"가 있으면 `dark`, 아니면 `light`. evaluate CLI가
이걸로 light/dark 색 스키마를 고른다(의미 메타는 동일, 값·dark gradeRules 판정에만 영향).

## 추출 직후 셀프체크

- **semantic 변환 완전성**: component 진입점이 빠짐없이 semantic으로 복원됐나? `unknown`이 비정상적으로
  많으면 alias 역추적 실패(시안 결함이 아니라 추출/스키마 문제)일 수 있다 — 시안 결함과 구분하라.
- raw로 잡힌 텍스트 세그먼트가 node-level 바인딩 hex와 동일한 중복이 아닌지(코드 블록처럼 세그먼트마다
  색이 다를 때만 진짜 raw).
