---
'@vapor-ui/core': minor
---

`InputGroup`을 addon 슬롯을 가진 시각적 박스로 다시 설계했습니다.

이제 `InputGroup.Root`가 테두리·배경·focus 링을 소유하고, 입력 컨트롤을 `InputGroup.LeadingAddon` / `InputGroup.TrailingAddon` 슬롯(아이콘·라벨·아이콘 버튼)과 함께 묶습니다. `Root`는 `size`·`disabled`·`invalid`·`readOnly`를 받는데, 이 값들은 `data-*`로 그룹의 _시각_ 상태만 켭니다. 안쪽 컨트롤의 실제 비활성화와 `aria-invalid`는 개발자가 명시적으로 지정합니다. `Field` 안에서 쓸 때는 `Root`가 `:has([aria-invalid='true'])`로 검증 상태를 반영합니다.

BREAKING CHANGE: `InputGroup.Counter`와 `useInputGroup` 훅을 제거했습니다. 이제 `InputGroup.Root`는 글자 수 카운트 컨텍스트를 제공하지 않습니다.
