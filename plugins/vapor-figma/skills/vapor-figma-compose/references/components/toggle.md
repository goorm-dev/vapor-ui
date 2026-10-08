---
component: Toggle
page: '❖ Toggle/ToggleGroup (43958:7609)'
reviewedAt: 2026-10-01
---

# Toggle / ToggleGroup

항목을 선택하거나 해제한다. ToggleGroup은 Toggle 여러 개를 묶어 다중·단일 선택을 제공한다.

## 컴포넌트와 key

| 이름               | 종류                        | key                                        | 용도                                                   |
| ------------------ | --------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| 💙Toggle           | COMPONENT_SET (32 variants) | `715b8a0043169e6aa20c4ec37589ec524cd3766d` | 단독 토글                                              |
| 💙toggleGroup      | COMPONENT_SET (8 variants)  | `f56464100caef3c7c81dbb6c205afb86456048cf` | 토글 묶음 (💙Toggle ×6 exposed)                        |
| 🟨Toggle/SlotLayer | COMPONENT                   | `994d27653d502e2c746a80c78ec76fd063bd91d7` | 아이콘 슬롯 (Toggle 안에 exposed instance로 들어 있음) |

## 구조 — 어디를 바꾸나

```
💙Toggle                         variant: size · variant (default · accent) · pressed · disabled
├─ 🟨Toggle/SlotLayer            (exposed)
│  └─ ❤️EditIcon  ← icon#44299:0 (INSTANCE_SWAP)
└─ 🔶InteractionLayer/Light      (exposed) 건드리지 않는다

💙toggleGroup                    variant: size · disabled
└─ 💙Toggle ×6                   (모두 exposed) 각각 위 구조
```

- 아이콘은 💙Toggle이 아니라 **안쪽 🟨Toggle/SlotLayer instance**의 `icon#` 속성이다. `toggle.findOne(n => n.type === 'INSTANCE' && n.name === '🟨Toggle/SlotLayer').setProperties({ [iconKey]: iconComponent.id })`.
- toggleGroup에서는 각 💙Toggle instance에 `pressed`·`variant`를 따로 넣는다. 개수를 줄이려면 남는 Toggle을 숨긴다(`visible = false`, 사다리 5번).
- 아이콘 외 텍스트 라벨 슬롯은 없다. 텍스트 토글이 필요하면 🟨Toggle/SlotLayer를 로컬 컴포넌트로 swap한다(사다리 4번).

## 알려진 버그와 우회

- 그룹 컴포넌트 이름이 `💙toggleGroup`(소문자 t). 이름으로 찾을 때 대소문자를 맞춘다.

## Variant 선택 기준

| 속성     | 값      | 언제                                                             |
| -------- | ------- | ---------------------------------------------------------------- |
| variant  | default | 가장 일반적인 상황                                               |
|          | accent  | 강조하고 싶은 기능. ToggleGroup에서 default보다 많이 쓰지 않는다 |
| size     | sm      | 좁은 공간, 선택지가 여러 개                                      |
|          | md      | 기본. 범용, 중요도 중간 액션                                     |
|          | lg      | 강조가 필요한 Toggle                                             |
|          | xl      | 넓은 화면에서 주변 UI 없이 단독                                  |
| pressed  | true    | 선택됨(On)                                                       |
| disabled | true    | 조건 미충족·일시 제한으로 상호작용 불가                          |

toggleGroup의 `size`·`disabled`도 같은 기준.

## Guidelines

Toggle

1. **선택 상태가 유지되는 동작에 쓴다.** '삭제'처럼 한 번 실행되고 끝나는 동작이나 Menu 트리거에는 쓰지 않는다(Button/IconButton).
2. **선택 상태를 즉시 알아보게.** 선택/해제를 배경색으로 구분한다. 배경색 없이 선택 상태를 표현하지 않는다.

ToggleGroup

1. **연관성이 뚜렷한 기능만 묶는다.** 텍스트 스타일 선택, 그리드 선택처럼 같은 성격끼리. 관련 없는 기능이나 Button 같은 다른 요소를 섞지 않는다.
2. **Toggle과 구분한다.** 관련 요소 묶음은 ToggleGroup, 항목이 하나면 단일 Toggle. 관련 요소들을 단일 Toggle 여러 개로 흩어 놓지 않는다.

## Usecase

- 단독 요소의 기능 ON/OFF: 즐겨찾기, Visible/Hidden.
- 이미지 위나 IconButton과 함께 쓸 때는 선택 상태의 배경색을 생략하고, 대신 아이콘 스타일 변화로 선택 상태를 구분한다.
