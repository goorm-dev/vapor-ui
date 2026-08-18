# eval: Dialog

표가 깨지면 실패하는 최소 검증. 스킬을 `Dialog`로 돌리고 아래와 대조한다.

## 입력

> Dialog 만들려고 하는데 접근성 기준 뽑아줘

## 기대 성질 (8개)

`interactive` `modal` `overlay` `ui-boundary` `text` `pointer-target` `visible-label` `icon`

`composite` 아님 — Dialog 자체는 자식 항목을 roving tabindex로 관리하지 않는다.
`transient` 아님 — hover로 뜨고 지지 않는다.
`status-message` 아님 — Dialog는 포커스를 옮긴다.

## 기대 SC (27건)

WCAG 24: 1.1.1, 1.3.1, 1.3.2, 1.3.3, 1.3.4, 1.4.3, 1.4.4, 1.4.5, 1.4.10, 1.4.11, 1.4.12,
2.1.1, 2.1.2, 2.4.3, 2.4.6, 2.4.7, 2.4.11, 2.5.2, 2.5.3, 2.5.8, 3.1.2, 3.2.1, 3.2.4, 4.1.2

KWCAG 고유 3: 5.4.4, 8.1.1, 8.2.1

## 회귀 신호

- **2.4.11이 빠지면** → `overlay`/`modal` 트리거 소실. Dialog가 포커스된 배경 요소를 가리는
  문제를 못 잡는다
- **1.4.13이 들어오면** → `transient` 오추론. Dialog는 호버 콘텐츠가 아니다
- **4.1.2에 KWCAG 8.2.1이 안 붙으면** → KWCAG 대응 열 파손
- **제외 목록에 2.4.1·2.4.2·3.1.1이 없으면** → 페이지 수준 제외 사유가 리포트에서 누락

## base-ui 실측 (2026-08-14 완료)

기본 `modal` 설정에서 4.1.2·1.3.2·2.4.3·2.1.2 충족 확인. 단 수단은 `aria-modal`도 네이티브
`<dialog>`도 아닌 배경 `aria-hidden`이다. 전문과 명령은
`references/baseui-verify.md` § 실측 예 참조.

`modal="trap-focus"` 조합은 **미실측** — 백드롭이 꺼져 AT에게만 배경이 숨겨지므로 1.3.2
판정이 뒤집힐 수 있다. 다음 회차 과제.
