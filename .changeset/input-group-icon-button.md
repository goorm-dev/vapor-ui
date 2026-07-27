---
'@vapor-ui/core': minor
---

`InputGroup.IconButton`을 추가했습니다. clear·비밀번호 토글처럼 그룹 안에 자주 들어가는 아이콘 버튼을 위한 편의 파트로, 기본 `render`가 `IconButton`이고 그룹의 compact 밀도에 맞춰 크기가 정렬됩니다. `InputGroup.Button`과 같은 레이어·상태 정의를 공유합니다.

```tsx
<InputGroup.TrailingAddon>
    <InputGroup.IconButton aria-label="clear" variant="ghost">
        <CloseOutlineIcon />
    </InputGroup.IconButton>
</InputGroup.TrailingAddon>
```

또한 `readOnly` 시각을 `invalid`와 대칭으로 맞췄습니다. 그룹 배경(gray)은 이제 값 컨트롤의 `data-readonly`를 `:has()`로 관찰해 켜집니다. `<InputGroup.Input readOnly />`는 물론, 그룹에 편입한 `<Select.Root readOnly>`의 읽기전용 상태도 그룹 배경이 함께 반영합니다.
