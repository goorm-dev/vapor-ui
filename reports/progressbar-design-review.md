# ProgressBar 설계 검증

이 문서는 2026-08-27 개정본 `reports/progressbar-design.md`를 접근성 요구사항 46건, Notion 컴포넌트
구성 원칙, Figma Meter 원본, `@base-ui/react@1.6.0` 소스와 대조한 결과다. 검증 중 설계안이 개정되어
초판의 미결 사항이 반영됐으므로 최신 파일 해시
`29119c299e6d93b021ee272c8cae1cfefff907bd22680b345c11570aa59597ae`를 기준으로 다시 판정했다.

전체 판정은 **CONDITIONAL**이다. 책임 분해, 세 API 결정, Spec 5분류는 통과한다. 다만 indeterminate
노드의 접근성 트리 노출, `invalid`의 비색상 단서, `border-danger` 대비, 30%·1.5s 잠정값을 확인하기
전에는 최종 PASS로 바꿀 수 없다.

## 판정 요약

| 항목                    | 판정        | 한 줄 근거                                                                                                  |
| ----------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| A. 미결 쟁점 3건        | PASS        | 개정본이 `invalid`, `ProgressBar.Status`, `paused`를 채택해 Notion 허용 분류와 접근성 통로를 함께 만족한다. |
| B. 그 밖의 확인 4건     | CONDITIONAL | `aria-valuetext` 기본 제거, md/lg 글자 크기, 5파트 중첩은 타당하고 정적 30% 표현만 검증 대기로 남았다.      |
| C. 46건 커버리지        | PASS        | §1.0/§1.1/§1.2에서 7+15+10+14의 46개 ID가 각각 정확히 한 번 나온다.                                         |
| D. Notion Spec 5분류    | PASS        | `indeterminate`를 논리 Variant로 올리고 `value={null}` Codegen 매핑을 명시해 초판의 오분류를 고쳤다.        |
| E. Color / Measurements | CONDITIONAL | Meter 토큰·size 값과 overflow 근거는 확인됐지만 `border-danger`, 30%, 1.5s는 아직 확정 근거가 없다.         |
| Base UI 미지원 표본     | PASS        | 개정본의 clamp·범위 검증·value text·현지화·error/live-region·motion 관련 판정이 1.6.0 소스와 일치한다.      |

검증 원문은 [Notion 「💙 Component 구성 원칙」](https://app.notion.com/p/1fc4e6997fb080118a45f2bd87a87492)과
[Figma Meter 브랜치](https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/branch/oXY3kjc56sC6PpQkRgT1pB/Vapor-Design-System?node-id=48465-3518)에서
직접 읽었다. Figma MCP는 브랜치 키 `oXY3kjc56sC6PpQkRgT1pB`로 Meter canvas, Color,
Measurements 메타데이터와 원본 스크린샷에 접근했다. Color 구조화 컨텍스트는 Code Connect 연결 여부를
사용자에게 물어야 계속할 수 있어 가져오지 않았지만, 같은 노드의 메타데이터와 원본 해상도 스크린샷으로
표를 확인했다.

## 쟁점 판정

### 쟁점 1 — B안: `invalid` prop

선택은 **B안**이 맞다. `colorPalette="danger"`는 Notion §3.3의 시각 옵션이고 `invalid`는 §3.2의
논리적 상태다. 색상 선택으로 오류 상태를 대신하면 상태 의미가 hue에 종속된다. Notion §3.2는
`invalid`를 허용 예시로 직접 들기 때문에 이 Prop은 Prop 폭발 예외가 아니라 원칙의 적용이다.

개정본은 `invalid` Prop, Figma 논리 Variant, `data-invalid`, `aria-describedby` 통로를 모두 반영했다.
다만 §1.1 B와 §3.5의 “Track 테두리(도형)” 설명은 아직 부정확하다. 기본 1px 테두리가 같은 1px
`border-danger`로 색만 바뀌면 도형 단서가 아니라 hue 단서다. `invalid`에서 2px처럼 굵기를 바꾸거나
다른 비색상 cue를 컴포넌트가 제공하고, 소비자 오류 문구와 함께 써야 한다.

설계안 수정 지시: §1.1 B와 §3.5에 `invalid`의 실제 비색상 cue를 명시한다. `border-danger` 대비도
측정해 3:1 미만이면 토큰 또는 cue를 바꾼다.

### 쟁점 2 — B안: `ProgressBar.Status` 파트

선택은 **B안**이 맞다. 소비자가 임의의 형제 `role="status"`를 만들게 하는 A안은 원문
`status-message-slot`의 vapor 공동 책임을 소비자에게 넘긴다. `ProgressBar.Status`는 Notion §1.2의
기능적 Anatomy이자 §2.4의 무스타일 Slot Layer로 정의할 수 있어 “내부는 비워 둔다”는 철학과 충돌하지
않는다.

개정본은 Status를 기능적 Anatomy로 추가하고 role-bearing progressbar의 자손이 아니라 형제로
렌더한다는 DOM 제약까지 적었다. progressbar 자손이 접근성 트리에서 presentational로 처리될 수 있다는
문제를 피하므로 적절하다. 완료·실패 한 번만 넣고 매 tick을 넣지 않는 소비자 계약도 §1.2에 반영됐다.

설계안 수정 지시: 현재 결정을 유지한다. 구현 단계에서 Status가 실제 접근성 트리상 형제이고
`role="status"`가 유지되는지 회귀 검사만 추가한다.

### 쟁점 3 — B안: `paused` prop

선택은 **B안**이 맞다. `className`은 내부 animation selector와 우선순위를 알아야 하는 탈출구라 안정적인
상태 계약이 아니다. `prefers-reduced-motion`은 사용자 환경설정 대응일 뿐 WCAG 2.2 SC 2.2.2의
일시정지·정지·숨김 메커니즘을 대신하지 않는다.

개정본은 `paused`를 논리 상태와 Figma `state=paused`에 넣고, `[data-paused]`와
`prefers-reduced-motion`이 같은 정적 표현을 쓰게 했다. role, 접근 이름, indeterminate 표시는 유지하고
animation만 제거한다는 계약도 맞다.

설계안 수정 지시: 48 Variant 표에 Codegen 결과를 더 정확히 쓴다. `state=paused`는
`value={null} paused`, `state=invalid`는 `invalid`와 animation 정지를 뜻한다고 명시해 한 축으로 접은
상태와 독립 React Prop의 변환이 결정론적임을 보인다.

세 쟁점에서 접근성 규범과 Notion 원칙은 실제로 충돌하지 않는다. Notion은 접근성·기능 Prop,
논리적 상태, 기능적 Anatomy를 명시적으로 허용한다. 이후 충돌이 생기면 WCAG/KWCAG 및 WAI-ARIA가
내부의 최소 Prop/빈 Slot 설계 편의보다 우선한다.

## 확인 항목 답변

### 1. `aria-valuetext` 기본값을 뒤집는가

**예. 개정본의 결정이 맞다.** Root가 `aria-valuenow`, `aria-valuemin`, `aria-valuemax`를 올바르게
제공하면 보조기기는 범위 의미를 계산할 수 있다. 실제 발화 형식은 보조기기마다 다르지만 범위 정보가
사라지지는 않는다. `aria-valuetext`는 “8개 중 3개”처럼 숫자만으로 의미가 부족할 때만 쓴다.

indeterminate에도 영어 기본 문구를 주입하지 않는 결정이 맞다. 소비자가 `getAriaValueText`를 주면 그
값을 보이는 Value와 함께 쓰고, 주지 않으면 `aria-valuenow`와 `aria-valuetext`를 모두 생략한다.

### 2. indeterminate 정적 표현을 30%로 두는가

**30% 확정은 아직 불가하다.** 왼쪽부터 채운 단색 30% 막대를 멈추면 30% 완료로 오독할 수 있다.
개정본은 30%를 검증 대기 값으로 내리고 paused/reduced-motion에서 중앙 세그먼트 또는 determinate와
다른 패턴, “처리 중” 문구를 쓰도록 바꿨으므로 방향은 맞다. sm 8px 트랙과 좁은 폭에서도 구분되는지
확인한 뒤 수치를 확정해야 한다. 트랙 전체 단색 채움은 100% 완료로 오독되므로 대안이 아니다.

### 3. md와 lg의 글자 크기가 같은가

**맞다.** Figma Meter Measurements 원본은 sm 12px, md 14px, lg 14px이며 “lg에서 굵어지는 것은
트랙이지 문구가 아니다”라고 명시한다. 접근성 기준은 size 단계마다 글자가 커질 것을 요구하지 않고,
200% 확대와 사용자 텍스트 간격에서도 잘리지 않을 것을 요구한다.

### 4. Track 안 Indicator 중첩이 1:1 매핑을 깨는가

**깨지 않는다.** 1:1은 평면 배치가 아니라 시각 레이어 하나가 React 파트 하나와 대응한다는 뜻이다.
Root, Label, Value, Track, Indicator 다섯 레이어와 다섯 React 파트가 각각 대응한다. Status는 Figma에
그리지 않는 기능적 Anatomy이므로 시각적 1:1도 유지된다.

### 기반 구현체 표본 확인

| 개정본 주장                               | 소스 판정 | 근거                                                                                                                                      |
| ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 범위 밖 `value`를 클램프하지 않음         | 확인      | `progress/root/ProgressRoot.mjs:48-54`가 raw value를 ARIA에 쓰고 Indicator도 clamp 없이 퍼센트를 만든다.                                  |
| `max > min` 검증·경고 없음                | 확인      | Root는 기본값만 정하고 `min`/`max`를 그대로 context와 ARIA에 넘긴다. 검증 분기가 없다.                                                    |
| `aria-valuetext`를 항상 생성              | 확인      | `ProgressRoot.mjs:11-16,27,53`의 기본 callback이 determinate와 indeterminate 모두 문자열을 반환한다.                                      |
| 비기본 범위에서 문구와 fill 불일치        | 확인      | fill은 `valueToPercent(value,min,max)`를 쓰고 기본 문구만 `formatNumberValue`의 `value / 100`을 쓴다. 개정본이 초판 표현을 정확히 고쳤다. |
| 보이는 Value와 ARIA 문구 통로 분리        | 확인      | `progress/value/ProgressValue.mjs:21-34`는 `formattedValue`를 표시하고 Root는 별도 `getAriaValueText`를 쓴다.                             |
| indeterminate 문구 현지화 미지원          | 확인      | `ProgressRoot.mjs:12-15`가 locale과 무관하게 `indeterminate progress`를 반환한다.                                                         |
| error/live-region 파트 없음               | 확인      | 공개 `ProgressStatus`는 세 상태뿐이고 Progress 소스에 `aria-live`, `role=status`, `role=alert` 구현이 없다.                               |
| indeterminate 폭·animation 없음           | 확인      | Indicator는 indeterminate일 때 style `{}`를 반환한다. Vapor가 폭과 animation을 모두 정의해야 한다.                                        |
| `data-indeterminate`, 스타일 탈출구 제공  | 확인      | 공통 state mapping과 각 part의 `className`, `style`, `render` 통로가 존재한다.                                                            |
| `() => undefined`는 공식 타입 통로가 아님 | 확인      | `ProgressRoot.d.mts:29`의 callback 반환형은 `string`이다. 개정본이 이를 공식 지원으로 세지 않는다.                                        |

위 경로는 `node_modules/.pnpm/@base-ui+react@1.6.0_.../node_modules/@base-ui/react/` 아래를 기준으로
줄였다.

## 커버리지 대조

개정본 §1은 원문 46건을 다음처럼 정확히 한 번씩 배치한다.

| 원문 구획        | 원문 수 | 설계안 수 | 누락 | 중복 | 오분류 | 판정 |
| ---------------- | ------: | --------: | ---: | ---: | -----: | ---- |
| 기반 구현체 위임 |       7 |         7 |    0 |    0 |      0 | PASS |
| vapor 자체 구현  |      15 |        15 |    0 |    0 |      0 | PASS |
| 공동(통로)       |      10 |        10 |    0 |    0 |      0 | PASS |
| 소비자           |      14 |        14 |    0 |    0 |      0 | PASS |
| 합계             |      46 |        46 |    0 |    0 |      0 | PASS |

초판의 문제였던 `indeterminate-omits-valuenow` 중복, 위임 6건 상세 누락, 시각 계약 8/9건 표기 오류는
개정본에서 모두 고쳐졌다. 소비자 14건에도 원문 ID 열이 추가되어 자동 대조가 가능하다.

커버리지와 충족 여부는 별개다. 다음 두 위임 항목은 ID 분류는 맞지만 실제 만족을 아직 입증하지 못했다.

| 요구사항                       | 판정        | 남은 검증                                                                                                                                                                            |
| ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `platform-api-exposure`        | CONDITIONAL | 로컬 관측에서 indeterminate 노드만 접근성 트리에서 사라졌다. 현재 버전과 대상 브라우저/보조기기에서 재현 여부를 확인하고, 재현되면 base-ui 위임으로 두지 말고 Vapor가 보완해야 한다. |
| `indeterminate-omits-valuenow` | CONDITIONAL | DOM 속성 생략은 소스로 확인됐지만 role-bearing 노드 자체가 접근성 API에 노출되는지 함께 통과해야 한다.                                                                               |

## 설계안 수정 지시

| 설계안 절                      | 고칠 내용                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| §1.0 위임 표                   | indeterminate 접근성 트리 노출을 실제 환경에서 재검증한다. 실패하면 `platform-api-exposure`를 부분/자체 구현으로 올리고 보완책을 설계한다. |
| §1.1 B `status-not-color-only` | `invalid`의 1px hint→1px danger 변경을 “도형 차이”라고 부르지 않는다. 2px border 등 실제 비색상 cue를 정한다.                              |
| §2.2 48 Variant                | `state=indeterminate/paused/invalid` 각각이 생성하는 React Prop 조합과 우선순위를 명시하고 Codegen 회귀 사례를 둔다.                       |
| §3.5 Color                     | `border-danger`와 canvas/track의 대비를 라이트·다크 모드에서 측정한다. 미측정 행이 PASS가 되기 전에는 Color 절을 확정하지 않는다.          |
| §3.6 Measurements              | 30%와 1.5s를 계속 검증 대기로 둔다. 정지 표현 오독 검사와 keyframe의 상대 휘도 변화 횟수를 확인한 뒤 확정값·근거를 함께 기록한다.          |
| §3.6 Measurements              | `overflow: hidden`은 유지한다. clamp 뒤 determinate overflow가 아니라 이동 세그먼트 clip과 Track radius 보존이 근거라는 현재 문구가 맞다.  |

위 다섯 조건을 닫으면 설계안은 PASS로 올릴 수 있다. 그 전까지 Figma 컴포넌트 세트의 수치·색상·motion은
“검증 대기” 상태를 유지해야 한다.
