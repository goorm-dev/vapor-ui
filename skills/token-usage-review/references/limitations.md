# 한계 (정직하게)

이 스킬이 무엇을 단정할 수 없는지 — 통과로 위장하지 않기 위한 정직성 기록.

- **contrast 검사는 전경 hex와 배경 hex를 둘 다 알아야 한다.** 노드 트리에서 배경을 못 잡으면 "미검사"로 남는다 — 통과로 오해하지 마라. **contrast 요구치는 토큰 키 prefix로 role을 파생해 정한다(`colors.foreground.*`→4.5:1, `colors.border.*`→3:1, 그 외 대비 요구 없음, `evaluate.mjs`의 `RATIO_BY_ROLE`).** 런타임 "미검사"는 요구치 누락이 아니라 배경 hex 추출 실패 때문이다. 같은 제약이 `foreground-surface` 검사에도 적용된다(배경 hex 없으면 보류).
    - **한계(role 파생)**: "토큰 키 prefix = role"을 가정하므로, 같은 prefix 안에서 대비 요구가 갈리는 토큰이 생기면 자동으로 잡지 못한다(자동 검증 안전망은 두지 않았다). 그런 변경이 생기면 `RATIO_BY_ROLE`/`expectedRatioForToken`을 사람이 직접 고쳐야 한다 — 테스트 회귀로 방어한다.

- **배경↔전경 매핑은 "가장 가까운 불투명 조상 fill" 휴리스틱이다.** 통합 추출 스크립트는 트리 부모-자식 중첩으로 전경의 배경 hex를 잡지만, 이 세 경우는 부모 fill만으로 단정할 수 없다 — ① z-order 형제 겹침(같은 부모 안에서 아래 형제가 실제 배경), ② `layoutPositioning === "ABSOLUTE"`(흐름에서 빠진 요소), ③ 반투명 배경의 알파 합성. 상용 도구(Stark·Contrast)조차 "바로 뒤 색" 휴리스틱 + 수동 fallback에 의존한다. 잡히면 쓰되 **불확실하면 `backgroundHex: null`로 두어 미검사(info)로 보류**한다 — 완전 자동 판정을 목표 삼지 않는다. 통과로 위장하지 마라.

- **`unknown-token`(오타/스키마 미등록)은 부적합으로 카운트하지 않는다(info).** 변수 바인딩 자체는 정상이고 이름만 스키마 키와 어긋난 경우라(예: `color-backgroud-primary`), 진짜 raw(`token-not-used`, high)와 분리해 info로 둔다. "스키마에 없는 토큰명을 썼다"는 사실은 리포트에 남기되 적합률은 깎지 않는다 — 디자이너가 토큰을 쓰려 한 의도는 인정하고 이름 정정만 권한다.

- **의미 판정(LLM 단계)은 추론이라 confidence가 낮을 수 있다.** 특히 의도 미제공 시. 리포트는 그 불확실성을 숨기지 않는다.

- **component→semantic 역추적(통합 추출 1단계)은 read-only Plugin API에 의존한다.** 변수가 remote(team library, `variable.remote === true`)면 `getVariableByIdAsync`가 `null`을 줄 수 있어 체인을 못 따라간다 — `importVariableByKeyAsync`를 한 번 시도하는 예외 방어가 있으나 그래도 실패하면 보수적으로 `token: null`(미검사로 통과시키지 않고 진짜 위반 후보로 둔다). 또한 light/dark 중 **어느 mode를 보는지에 따라 체인이 달라질 수 있어** `resolvedVariableModes`로 mode를 고정한다 — 시안에 두 mode 데모가 모두 있으면 각각 별도 요소로 평가한다.

- **현재 스키마는 색상 토큰 41개만 다룬다.** spacing/typography는 스키마가 확장되면 같은 파이프라인에 얹는다.
