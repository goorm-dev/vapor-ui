---
'@vapor-ui/core': minor
---

`InputGroup`을 addon 슬롯을 가진 시각적 박스로 다시 설계하고, 그룹 상태를 자식에 전파하는 래퍼 파트를 추가했습니다.

`InputGroup.Root`가 테두리·배경·focus 링을 소유하고, 입력 컨트롤을 `InputGroup.LeadingAddon` / `InputGroup.TrailingAddon` 슬롯(아이콘·라벨·아이콘 버튼)과 함께 묶습니다.

그룹 상태를 자식과 공유하려면 새 래퍼 `InputGroup.Input` / `InputGroup.Button`을 씁니다. `<InputGroup.Root disabled>`는 그 안의 `Input`·`Button`을 실제로 비활성화하고, `<InputGroup.Root readOnly>`는 `Input`만 읽기전용으로 만듭니다(버튼은 살아 있어 password 토글·clear가 동작). `InputGroup.Button render={<Select.Trigger />}`로 Select를 그룹에 편입할 수 있습니다. 래퍼를 쓰지 않고 raw `TextInput`·`IconButton`을 직접 넣으면 그룹 상태를 받지 못합니다.

`invalid`는 그룹이 전파하지 않습니다. 잘못된 값을 담은 컨트롤이 `aria-invalid`를 직접 소유하고(`<InputGroup.Input invalid />` 또는 `Field`·`Select.Root`로 지정), `Root`가 `:has([aria-invalid='true'])`로 테두리에 danger를 반영합니다.

BREAKING CHANGE: `InputGroup.Root`에서 `invalid` prop을 제거했습니다. 그룹 테두리는 자식 컨트롤의 `aria-invalid`로만 켜지므로, `<InputGroup.Root invalid>` 대신 값을 담는 컨트롤에 `invalid`를 지정하세요.

BREAKING CHANGE: `InputGroup.Counter`와 `useInputGroup` 훅을 제거했습니다. 이제 `InputGroup.Root`는 글자 수 카운트 컨텍스트를 제공하지 않습니다.
