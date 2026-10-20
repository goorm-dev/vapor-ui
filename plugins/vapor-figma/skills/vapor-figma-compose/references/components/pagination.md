---
component: Pagination
page: '❖ Pagination (36064:307)'
reviewedAt: 2026-10-01
---

# Pagination

여러 페이지로 나뉜 콘텐츠에서 원하는 페이지로 이동하게 하는 내비게이션이다.

## 컴포넌트와 key

| 이름                        | 종류                       | key                                        | 용도                                             |
| --------------------------- | -------------------------- | ------------------------------------------ | ------------------------------------------------ |
| 💙Pagination                | COMPONENT_SET (8 variants) | `67b043bee93e00bdf099dc796207a3737ab33f8b` | 배치하는 컴포넌트 (Previous + Items + Next)      |
| 💙Pagination.Previous       | COMPONENT                  | `03590384170cf85529c65c5c3b9c253ad5ac3c0d` | 이전 버튼 (‹)                                    |
| 💙Pagination.Next           | COMPONENT                  | `5db71b7eec15d558bdf7995fc74c0ca2c20490ce` | 다음 버튼 (›)                                    |
| 💙Pagination.Items          | COMPONENT                  | `a5ec9696a83510c976287d2ab27aedd2dd040c8e` | 페이지 번호 6개 묶음                             |
| 🟨Pagination.Item/SlotLayer | COMPONENT_SET (2 variants) | `18b93e7125e8ff3ab965c16c469f6e97047b9d96` | 페이지 번호 버튼 하나 (`current`)                |
| 🟨Pagination/SlotLayer      | COMPONENT_SET (2 variants) | `273466dc7c186d01c1bb596cd76d33a21100b87e` | 버튼 내용 (`type`: number = 숫자, icon = 아이콘) |

## 구조 — 어디를 바꾸나

```
💙Pagination                           variant: size · disabled
├─ 💙Pagination.Previous               (비노출)
│  ├─ 🔶InteractionLayer/Normal
│  └─ 🟨Pagination/SlotLayer type=icon → ❤️ChevronLeftOutlineIcon
├─ 💙Pagination.Items                  (비노출)
│  └─ 🟨Pagination.Item/SlotLayer ×6   (비노출) variant: current
│     ├─ 🔶InteractionLayer/Normal     (exposed) 건드리지 않는다
│     └─ 🟨Pagination/SlotLayer        (비노출) variant: type
│        └─ type=number: "1" (TEXT 레이어, 속성 없음) 페이지 번호
│           (5번째 Item만 type=icon)
└─ 💙Pagination.Next                   (비노출)
   ├─ 🔶InteractionLayer/Normal
   └─ 🟨Pagination/SlotLayer type=icon → ❤️ChevronRightOutlineIcon
```

- 💙Pagination에서 바꿀 수 있는 속성은 `size`·`disabled`뿐이다. 중첩 instance가 전부 exposed가 아니라 속성 패널에 안 보인다.
- 현재 페이지: `pg.findAll(n => n.type === 'INSTANCE' && n.name === '🟨Pagination.Item/SlotLayer')`에서 원하는 항목에 `setProperties({ current: 'true' })`.
- 페이지 번호는 각 Item 안 🟨Pagination/SlotLayer(`type=number`)의 TEXT 레이어다. **TEXT 속성이 없다** → `characters` 직접 수정(사다리 5번).
- 생략(…) 표시: 별도 Ellipsis 컴포넌트가 없다. 5번째 Item이 `type=icon`으로 들어 있다.

## 알려진 버그와 우회

- 페이지 번호에 TEXT 속성이 없다(위 우회).
- 중첩 instance(Previous·Items·Next·Item/SlotLayer)가 exposed되지 않는다. `findAll`로 직접 찾는다.
- 문서의 Anatomy에 `Pagination.Ellipsis`가 있지만 대응 컴포넌트가 없다.
- 문서 size 설명이 "Select"로 적혀 있다(다른 페이지 복사 흔적). 의미는 아래 표 기준.

## Variant 선택 기준

| 속성                        | 값     | 언제                            |
| --------------------------- | ------ | ------------------------------- |
| size                        | sm     | 고밀도의 작은 공간              |
|                             | md     | 기본                            |
|                             | lg     | 공간이 넓거나 강조할 때         |
|                             | xl     | 가장 큼. 강조가 필요할 때       |
| disabled                    | true   | 상호작용 불가. 클릭·포커스 차단 |
| current (Item/SlotLayer)    | true   | 현재 페이지                     |
| type (Pagination/SlotLayer) | number | 페이지 번호                     |
|                             | icon   | 아이콘 (이전/다음 화살표 등)    |

## Guidelines

1. **현재 위치와 이동 가능한 범위를 알린다.** 현재 페이지 번호를 시각적으로 강조하고, 첫/마지막 페이지 이동 컨트롤을 준다.
2. **페이지가 많으면 중간 생략(...)을 쓴다.** 번호가 길게 나열되면 너비가 변해 시선이 분산된다. 현재 3이면 `1, 2, [3], 4, 5 ... 10`처럼 현재 주변과 끝 페이지만 보인다.

## Usecase

- 페이지에 해당 내용 없음
