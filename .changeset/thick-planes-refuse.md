---
'@vapor-ui/core': patch
---

`TextInput`이 Base UI Field 검증이 계산한 `aria-invalid` 속성을 덮어쓰던 문제를 수정합니다.

`TextInput`이 `aria-invalid={invalid}`를 항상 명시적으로 전달해, `invalid` prop이 지정되지 않은 경우 `undefined` 값이 Field 검증 실패 시 Base UI가 계산하는 `aria-invalid="true"`를 덮어쓰고 있었습니다. 그 결과 필드가 시각적으로는 invalid 상태(`data-invalid`)로 보이지만 보조기술에는 invalid로 전달되지 않았습니다. 이제 `invalid` prop이 실제로 지정된 경우에만 해당 속성을 전달합니다.
