---
component: IconButton
page: '❖ IconButton (32283:2142)'
reviewedAt: 2026-10-01
---

# IconButton

텍스트 없이 아이콘만으로 특정 작업이나 기능을 실행하는 버튼이다.

## 컴포넌트와 key

| 이름                   | 종류                         | key                                        | 용도                                                       |
| ---------------------- | ---------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| 💙IconButton           | COMPONENT_SET (288 variants) | `0ae436f8c145b2b091994a0cf250edea8a63a01c` | 배치하는 컴포넌트                                          |
| 🟨IconButton/SlotLayer | COMPONENT                    | `d5610b3ab3f8923c5ccb2737b28f4d619fc4bea8` | 아이콘 슬롯 (IconButton 안에 exposed instance로 들어 있음) |

## 구조 — 어디를 바꾸나

```
💙IconButton                      variant: size · colorPalette · variant · disabled · shape
├─ 🔶InteractionLayer/Normal      (exposed) 건드리지 않는다
└─ 🟨IconButton/SlotLayer         (exposed)
   └─ ❤️HeartIcon  ← Icon#31044:0 (INSTANCE_SWAP)
```

- 아이콘은 💙IconButton이 아니라 **안쪽 🟨IconButton/SlotLayer instance**의 `Icon#…` 속성이다. `iconButton.findOne(n => n.type === 'INSTANCE' && n.name === '🟨IconButton/SlotLayer').setProperties({ [iconKey]: icon.id })`.
- 아이콘 컴포넌트는 `Icon [goorm]` 라이브러리에서 `importComponentByKeyAsync`로 불러와 `.id`를 넣는다. 기본값은 HeartIcon이라 반드시 바꾼다.

## 알려진 버그와 우회

- 확인된 것 없음 (2026-10-01 기준)
- 참고: 문서 텍스트는 colorPalette에 `hint`가 있다고 적었지만 실제 값은 primary·secondary·success·warning·danger·contrast다. 정의에서 읽은 값을 쓴다.

## Variant 선택 기준

| 속성         | 값        | 언제                                                                    |
| ------------ | --------- | ----------------------------------------------------------------------- |
| colorPalette | primary   | 가장 주요한 액션. 한 화면에 primary는 하나                              |
|              | secondary | 보조 기능. 주로 primary 옆 보조 버튼                                    |
|              | success   | 성공·완료 같은 긍정 결과 액션. primary와 함께 쓰지 않는다               |
|              | warning   | 주의가 필요한 액션. danger보다 덜 위험                                  |
|              | danger    | 삭제처럼 되돌리기 힘든 액션. 남발하지 않는다                            |
|              | contrast  | 배경과 대비를 강하게 줄 때                                              |
| size         | sm        | 테이블·리스트 같은 고밀도 공간, 보조 기능                               |
|              | md        | 기본. 범용, 중요도 중간                                                 |
|              | lg        | 강조가 필요한 주요 액션                                                 |
|              | xl        | 매우 강조가 필요한 액션                                                 |
| variant      | fill      | 주목도 최고. 가장 중요한 주요 액션                                      |
|              | outline   | fill보다 낮음. 보조 액션, fill과 함께                                   |
|              | ghost     | 주목도 최저. 툴바·리스트처럼 반복 나열되거나 UI를 방해하지 않아야 할 때 |
| shape        | square    | 정사각형 영역 (기본)                                                    |
|              | circle    | 원형 영역                                                               |
| disabled     | true      | 조건 미충족·일시 제한으로 상호작용 불가                                 |

## Guidelines

1. **아이콘 하나에 명확한 행동 하나.** 텍스트 없이 의미를 전달하므로 널리 인식되는 의미의 아이콘만 쓴다.
2. **한 화면에서 같은 아이콘은 같은 의미.** 같은 아이콘에 여러 의미를 줘야 하면 텍스트 버튼으로 바꾸거나 툴팁·레이블을 함께 준다.

## Usecase

- 페이지에 해당 내용 없음
