---
'@vapor-ui/core': minor
---

`InputGroup`을 addon 슬롯을 가진 시각적 박스로 다시 설계하고, 그룹 상태를 자식에 전파하는 래퍼 파트를 추가했습니다.

`InputGroup.Root`가 테두리·배경·focus 링을 소유하고, 입력 컨트롤을 `InputGroup.LeadingAddon` / `InputGroup.TrailingAddon` 슬롯(아이콘·라벨·아이콘 버튼)과 함께 묶습니다.

그룹 상태를 자식과 공유하려면 새 래퍼 `InputGroup.Input` / `InputGroup.Button`을 씁니다. `<InputGroup.Root disabled>`는 그 안의 `Input`·`Button`을 실제로 비활성화합니다. `InputGroup.Button render={<Select.Trigger />}`로 Select를 그룹에 편입할 수 있습니다. 래퍼를 쓰지 않고 raw `TextInput`·`IconButton`을 직접 넣으면 그룹 상태를 받지 못합니다.

`readOnly`와 `invalid`는 그룹이 전파하지 않습니다. 값을 담은 컨트롤이 그 상태를 직접 소유하고(`<InputGroup.Input readOnly invalid />` 또는 `Field`·`Select.Root`로 지정), `Root`가 `:has([data-readonly])`와 `:has([aria-invalid='true'])`로 배경과 테두리에 반영합니다.

`disabled` 시각은 세 곳을 봅니다. `Root`의 prop, 값 컨트롤의 `:disabled`, 편입된 Select 트리거의 `:disabled`입니다. 값을 담지 않는 보조 버튼은 여기에 들어가지 않으므로, 입력이 비었을 때 clear 버튼만 꺼도 그룹은 흐려지지 않습니다. 반대로 `<Field.Root disabled>`처럼 바깥에서 값 컨트롤이 꺼지면 그룹도 함께 흐려집니다.

BREAKING CHANGE: `InputGroup.Root`에서 `invalid` prop을 제거했습니다. 그룹 테두리는 자식 컨트롤의 `aria-invalid`로만 켜지므로, `<InputGroup.Root invalid>` 대신 값을 담는 컨트롤에 `invalid`를 지정하세요.

BREAKING CHANGE: `InputGroup.Root`에서 `readOnly` prop을 제거했습니다. 읽기전용은 값을 담은 컨트롤이 소유합니다. `<InputGroup.Root readOnly>` 대신 `<InputGroup.Input readOnly />`를 쓰세요. 그룹의 회색 배경은 그대로 나타납니다.

BREAKING CHANGE: `InputGroup.Counter`와 `useInputGroup` 훅을 제거했습니다. 이제 `InputGroup.Root`는 글자 수 카운트 컨텍스트를 제공하지 않습니다.
