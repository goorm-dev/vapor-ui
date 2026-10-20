---
component: Table
page: '❖ Table (35545:2231)'
reviewedAt: 2026-10-01
---

# Table

구조화된 데이터를 행(Row)과 열(Column)로 나눠 보여준다.

## 컴포넌트와 key

| 이름                      | 종류                        | key                                        | 용도                                                 |
| ------------------------- | --------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| 💙Table                   | COMPONENT                   | `28678707bad2c0e093f3073e423f28397cc6a713` | 배치하는 컴포넌트 (Header·Body·Footer)               |
| 💙Table.Header            | COMPONENT                   | `fa0e23a3999c461c1216a057229deb26c05842d1` | 머리 영역                                            |
| 💙Table.Body              | COMPONENT                   | `5c6129e3164d70a987cf511302e4b8b305951093` | 본문 영역                                            |
| 💙Table.Footer            | COMPONENT                   | `5d8612f3a822c13549bdc85d8cd07a42c6a9a6d3` | 바닥 영역                                            |
| 💙Table.Row               | COMPONENT                   | `1923386cb72a5057c04fc3c91324a359047baff1` | 행 (네이티브 slot에 셀 나열)                         |
| 💙Table.Column            | COMPONENT                   | `5a39b94aab96994d9233140e4d6df3285b843e33` | 열 (네이티브 slot에 셀 나열)                         |
| 💙Table.ColumnGroup       | COMPONENT                   | `31a1bb20e208e21a7bb757fc85da0c7ff6cb8de2` | 열 묶음 (네이티브 slot에 Column 나열)                |
| 💙Table.Heading           | COMPONENT                   | `e6db9f9e6338b3e10b526d1697264058e42b563f` | 머리 셀                                              |
| 💙Table.Cell              | COMPONENT                   | `83ffb2297fbf0af47c879243dd7386011f13e58c` | 본문 셀                                              |
| 🟨Table/SlotLayer         | COMPONENT                   | `1a13410c8281e17b4e41d29c6e1519ff6f862203` | Header·Body·Footer 안의 placeholder                  |
| 🟨Table.Row/SlotLayer     | COMPONENT_SET (3 variants)  | `8888449a604f86e72834a2da955cc72646f72ae9` | Header·Body 슬롯 swap 대상 (Row 감쌈. `type`·`fill`) |
| 🟨Table.Column/SlotLayer  | COMPONENT_SET (24 variants) | `baf9ab392ffbf5d8165afc8fcaaf5a389f8d589b` | 열 단위 swap 대상 (Column 감쌈)                      |
| 🟨Table.cell/SlotLayer    | COMPONENT_SET (12 variants) | `fac64bf1359ff817c5f668dd813bf5a5832b3b5e` | Row·Column 안의 셀 (`Type`=heading·cell)             |
| 🟨Table.Heading/SlotLayer | COMPONENT                   | `bf9ccd663a01f62c1afd37ba3690df6b58287374` | 머리 셀 내용 (Heading 안 exposed)                    |
| 🟨Table.Cell/SlotLayer    | COMPONENT                   | `4de09cd9582cdd027d389de8ca28c2803e219c4f` | 본문 셀 내용 (Cell 안 exposed)                       |

## 구조 — 어디를 바꾸나

```
💙Table
├─ 💙Table.Header (exposed) └─ 🟨Table/SlotLayer (비노출) → swap 후보: 🟨Table.Row/SlotLayer
├─ 💙Table.Body   (exposed) └─ 🟨Table/SlotLayer (exposed) → swap 후보: 🟨Table.Row/SlotLayer · 🟨Table.Column/SlotLayer · 로컬 컴포넌트
└─ 💙Table.Footer (비노출)  └─ 🟨Table/SlotLayer (비노출)

🟨Table.Row/SlotLayer           variant: type (cell · heading) · fill · Slot#50468:0 (SLOT)
└─ 💙Table.Row                  Slot#50634:1 (네이티브 SLOT)
   └─ 🟨Table.cell/SlotLayer ×N  variant: Type (heading · cell) · fill · sticky · checked · height
      └─ 💙Table.Heading (기본 Type=heading에서 확인)

💙Table.Heading
└─ 🟨Table.Heading/SlotLayer    (exposed)
   ├─ 💙Checkbox       보임 = hasCheckbox#35689:8
   ├─ ❤️SlotIcon       ← LeadingIcon#35545:1 (INSTANCE_SWAP) · 보임 = hasLeadingIcon#35545:0
   ├─ Table.Heading    (TEXT 레이어, 속성 없음)
   ├─ ❤️SlotIcon       ← TrailingIcon#35642:1 · 보임 = hasTrailingIcon#35642:0
   ├─ wrapper(💙IconButton)  보임 = isSortable#35689:0
   └─ wrapper(💙IconButton)  보임 = isCollapsible#35689:1

💙Table.Cell
└─ 🟨Table.Cell/SlotLayer       (exposed)
   ├─ 💙Checkbox       보임 = hasChceckBox#35651:5
   ├─ ❤️SlotIcon       ← LeadingIcon#35562:3 · 보임 = hasLeadingIcon#35562:2
   ├─ 💙Avatar         보임 = hasAvatar#35651:6 (라벨은 Avatar의 label# 속성)
   ├─ Table.Cell       (TEXT 레이어, 속성 없음) 본문
   ├─ Table.Cell       (TEXT 레이어, 속성 없음) 설명 · 보임 = hasDescription#35651:4
   ├─ ❤️SlotIcon       ← TrailingIcon#35642:3 · 보임 = hasTrailingIcon#35642:2
   └─ wrapper(💙Badge) 보임 = showBadge#35651:7
```

- 🟨Table/SlotLayer의 swap 대상은 페이지에 명시돼 있지 않다. 위 swap 후보는 이름·구조로 본 추정이다. 페이지 Slot 안내: 목록에 없는 요소는 로컬 컴포넌트로 만들어 swap한다.
- 셀 아이콘·체크박스·뱃지 토글은 💙Table.Heading / 💙Table.Cell이 아니라 **안쪽 🟨…/SlotLayer instance**의 속성이다.
- `Row`·`Column`·`ColumnGroup`·`Table.Row/SlotLayer`에는 **Figma 네이티브 SLOT 속성**(`Slot#…`)이 있다. 다른 컴포넌트의 🟨SlotLayer(swap placeholder)와 달리 셀 개수를 slot 안에서 늘리고 줄인다.

## 알려진 버그와 우회

- **셀 텍스트에 TEXT 속성이 없다.** 🟨Table.Heading/SlotLayer의 `Table.Heading`, 🟨Table.Cell/SlotLayer의 `Table.Cell` 두 레이어 모두 속성에 연결되지 않았다. 사다리 5번(링크 유지 override)으로 TEXT 레이어의 `characters`를 바꾼다(폰트 로드 후).
- 속성 이름 오타: `hasChceckBox#35651:5`(Checkbox). `startsWith('hasChceckBox')`로 찾는다.
- 이름 대소문자 불일치: `🟨Table.cell/SlotLayer`(소문자 cell)와 `🟨Table.Cell/SlotLayer`는 다른 컴포넌트다. 앞은 셀 variant 래퍼, 뒤는 셀 내용. variant 이름도 `Type`(cell/SlotLayer)과 `type`(Row/SlotLayer)으로 대소문자가 다르다.
- 💙Table.Footer는 💙Table 안에서 exposed가 아니다. Footer 슬롯을 바꾸려면 instance 안을 직접 찾아 들어간다.

## Variant 선택 기준

- 페이지에 해당 내용 없음 (Anatomy & Variants 섹션에 Layer 정의만 있다)

## Guidelines

- 페이지에 해당 내용 없음

## Usecase

- 페이지에 해당 내용 없음
