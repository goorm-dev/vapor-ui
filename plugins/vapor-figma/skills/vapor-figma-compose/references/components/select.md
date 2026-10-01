---
component: Select
page: '❖ Select (33182:3032)'
reviewedAt: 2026-10-01
---

# Select

정해진 항목 중 하나를 고르게 하는 드롭다운 입력이다.

## 컴포넌트와 key

| 이름                        | 종류                        | key                                        | 용도                                                |
| --------------------------- | --------------------------- | ------------------------------------------ | --------------------------------------------------- |
| 💙Select                    | COMPONENT_SET (12 variants) | `f587c9265287983a195f5884ea8ca2cb5ea87215` | 배치하는 컴포넌트 (Trigger + 열린 Popup)            |
| 💙Select.Trigger            | COMPONENT_SET (16 variants) | `9a5741ce156e73d0fc6a1ae0f13cfdd1faa915b3` | 닫힌 상태 입력 필드만 필요할 때                     |
| 🟨Select.Trigger/SlotLayer  | COMPONENT_SET (2 variants)  | `799c73e774b75a28536a50feb3756fd72f5ae599` | Trigger 텍스트 슬롯 (exposed)                       |
| 💙 Select.Popup             | COMPONENT                   | `6188553d7adc68db9c0d4b9f442221356b24c52c` | 옵션 목록 패널                                      |
| 🟨\bSelect/SlotLayer        | COMPONENT_SET (5 variants)  | `1d87ccc91b59e29068462733e107edd3a9c2062c` | Popup 안 목록 슬롯 (Popup 내부용, 직접 import 불가) |
| 🟨\bSelect/SlotLayer (중복) | COMPONENT_SET (5 variants)  | `d3ed8647afccab7c13c3adca4aaa0c65736b9ca7` | 따로 import할 때 쓰는 쪽                            |
| 💙 Select.Item              | COMPONENT_SET (2 variants)  | `0adcd3188ea26e1647ada34e18199cf693e22139` | 옵션 한 줄                                          |
| 🟨Select.item/SlotLayer     | COMPONENT                   | `6b7889293e3ffa028e0ce741ef46abd0240327f0` | Item 라벨·아이콘·체크 슬롯 (exposed)                |
| 💙 Select.Group             | COMPONENT                   | `dfbb0e73f45d2791fd80bf919de10e6f2e2aca01` | GroupLabel + Item ×5 + Separator                    |
| 💙Select.GroupLabel         | COMPONENT                   | `67dfac75b7ef388b077302474df743ef89550206` | 그룹 제목                                           |
| 💙\bSelect.Separator        | COMPONENT                   | `b12073f2fedfb12f65955e40f40d1f2f731d53f3` | 그룹 구분선                                         |

## 구조 — 어디를 바꾸나

```
💙Select                         variant: side (bottom · top · right · left) · align (start · center · end)
├─ 💙Select.Trigger              (exposed) variant: size · disabled · invalid · readOnly
│  ├─ 🔶InteractionLayer/Normal  (exposed) 건드리지 않는다
│  └─ 🟨Select.Trigger/SlotLayer (exposed) variant: value (false · true)
│     ├─ Placeholder  ← Text#31108:0 (TEXT) 표시 문구
│     └─ ❤️ChevronDownOutlineIcon
└─ 💙 Select.Popup               (exposed)
   └─ 🟨\bSelect/SlotLayer       (exposed) variant: type (slot · default · group) · hasLeadingIcon
      └─ 💙 Select.Item ×5       (exposed, type=default일 때) variant: disabled
         ├─ 🔶InteractionLayer/Normal/omitFocus (exposed) 건드리지 않는다
         └─ 🟨Select.item/SlotLayer (exposed)
            ├─ ❤️SlotIcon  ← LeadingIcon#33229:0 (INSTANCE_SWAP) · 보임 = hasLeadingIcon#33229:1 (BOOLEAN)
            ├─ Nav Item    (TEXT 레이어, 속성 없음) 옵션 라벨
            └─ checkbox.item  보임 = Checked#33229:2 (BOOLEAN) — 선택 체크 표시
```

- Trigger 문구는 **🟨Select.Trigger/SlotLayer**의 `Text#31108:0`. 선택된 값처럼 보이게 하려면 같은 instance의 `value=true`.
- 목록 형태는 🟨\bSelect/SlotLayer의 `type`으로 바꾼다: `default`(Item 나열) · `group`(그룹) · `slot`(빈 placeholder → 로컬 컴포넌트 swap).
- 선택된 옵션 표시는 해당 Item의 🟨Select.item/SlotLayer `Checked#`를 true로.

## 알려진 버그와 우회

- **이름에 제어문자·공백**: `"🟨\bSelect/SlotLayer"`, `"💙\bSelect.Separator"`(백스페이스), `"💙 Select.Popup"`, `"💙 Select.Item"`, `"💙 Select.Group"`(💙 뒤 공백). 이름으로 찾을 때 `includes('Select.Item')`처럼 부분 일치로.
- **같은 이름 component set 2개**: `🟨\bSelect/SlotLayer`가 `1d87ccc91b59e29068462733e107edd3a9c2062c`(💙 Select.Popup 안에 들어 있는 쪽)와 `d3ed8647afccab7c13c3adca4aaa0c65736b9ca7`(Select 섹션에 있는 중복)로 두 벌이다. 변형 구성은 같다. **`1d87…`은 publish되지 않아 따로 import할 수 없다**(2026-10-01 확인). Popup 안의 슬롯은 그 instance에 `setProperties`로 `type`을 바꾸고, 따로 import가 필요하면 `d3ed…`를 쓴다.
- **옵션 라벨 텍스트 속성 없음**: 🟨Select.item/SlotLayer 안 `Nav Item` TEXT 레이어가 속성과 연결되지 않았다. 각 Item의 🟨Select.item/SlotLayer 안 `Nav Item`의 `characters`를 직접 바꾼다(사다리 5번).
- **그룹 제목 텍스트 속성 없음**: 💙Select.GroupLabel의 `Group Label` TEXT 레이어도 속성이 없다. `characters` 직접 수정.
- 🟨\bSelect/SlotLayer의 `hasLeadingIcon`이 BOOLEAN이 아니라 VARIANT(`"true" | "false"` 문자열)다.
- **값이 선택된 Trigger에 위쪽 화살표**: 🟨Select.Trigger/SlotLayer의 `value=true` variant에는 `ChevronUpOutlineIcon`(❤️ 접두사 없음)이 들어 있다. 닫힌 Trigger라면 그 아이콘 instance를 ❤️ChevronDownOutlineIcon(`0e5a31d13822bb30b2cb1fbde9a44172989d706e`)으로 `swapComponent`한다(2026-10-01 확인).
- **기본값이 있는 Select(정렬 등)**: Guideline 2는 "선택된 값처럼 보이는 기본값을 두지 않는다"이지만, 정렬처럼 실제 기본값이 있는 컨트롤은 `value=true`로 그 값을 보여도 된다. 이 판단을 보고에 적는다.

## Variant 선택 기준

| 속성                      | 값                   | 언제                                      |
| ------------------------- | -------------------- | ----------------------------------------- |
| size (Trigger)            | sm                   | 고밀도의 작은 공간                        |
|                           | md                   | 기본 입력 필드                            |
|                           | lg                   | 공간이 넓거나 강조할 때                   |
|                           | xl                   | 가장 큼. 강조가 필요할 때                 |
| side                      | bottom               | 기본                                      |
|                           | top                  | 아래 공간이 부족할 때                     |
|                           | left                 | 가로 레이아웃에서 오른쪽 공간이 부족할 때 |
|                           | right                | 왼쪽 공간이 부족할 때                     |
| align                     | start · center · end | Popup 정렬 위치. side에 따라 달라짐       |
| disabled                  | true                 | 입력·수정 불가                            |
| invalid                   | true                 | 필수 미선택 등 유효하지 않음              |
| readOnly                  | true                 | 수정 불가, 읽기·복사는 가능               |
| value (Trigger SlotLayer) | true                 | 값이 선택된 상태 (Design Only)            |

## Guidelines

1. **선택 기반 입력에만.** 정해진 옵션 중 고를 때 쓴다. 자유 입력이 필요하면 쓰지 않는다.
2. **기본값과 Placeholder를 구분한다.** Placeholder는 선택을 유도하는 안내 문구. 이미 선택된 값처럼 보이게 기본값을 두지 않는다.
3. **옵션 수에 맞는 패턴.** 옵션이 많으면 그룹화하거나 검색을 제공한다. 긴 목록을 스크롤만으로 탐색하게 하지 않는다.
4. **현재 선택을 명확히 표시.** 선택된 옵션은 시각적으로 강조(Checked). 선택 여부가 구분되지 않는 스타일을 쓰지 않는다.

## Usecase

- 폼에서 정형화된 값 입력: 국가·직군·부서 선택처럼 값이 미리 정의되고 자유 입력이 없을 때.
- 아이콘 포함: 옵션을 빠르게 식별하거나 상징적 의미가 필요할 때만. 장식용으로 쓰지 않는다.
