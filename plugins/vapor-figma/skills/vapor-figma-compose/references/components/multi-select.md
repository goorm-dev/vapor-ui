---
component: MultiSelect
page: '❖ MultiSelect (34407:14196)'
reviewedAt: 2026-10-01
---

# MultiSelect

여러 항목을 고를 수 있는 드롭다운 입력이다.

## 컴포넌트와 key

| 이름                            | 종류                        | key                                        | 용도                                                           |
| ------------------------------- | --------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| 💙MultiSelect                   | COMPONENT_SET (12 variants) | `298e34d17af8e5483aa128f2a100636edb1f9d96` | 배치하는 컴포넌트 (Trigger + Popup)                            |
| 💙MultiSelect.Trigger           | COMPONENT_SET (16 variants) | `21361e3fa498aeb3accffc345520a7395d2ebabe` | 트리거만 필요할 때 (폼 안의 닫힌 상태)                         |
| 💙 MultiSelect.Popup            | COMPONENT                   | `58159e1c6b5a02ae6c921e269e382812cefef459` | 팝업 본체                                                      |
| 💙 MultiSelect.Item             | COMPONENT_SET (2 variants)  | `819f3c293c408d817afd6d82d168af41fed82103` | 옵션 항목                                                      |
| 💙 MultiSelect.Group            | COMPONENT                   | `792290da1bc480361ff114fca38fd90ae93e6777` | GroupLabel + Item 5개 + Separator                              |
| 💙MultiSelect.GroupLabel        | COMPONENT                   | `43eb2d7fb990ac782733aac162b5ebf9eb87a770` | 그룹 제목                                                      |
| 💙\bMultiSelect.Separator       | COMPONENT                   | `b5ddba7c9e517dc901dccc903880226c546566c9` | 그룹 구분선                                                    |
| 🟨MultiSelect.Trigger/SlotLayer | COMPONENT_SET (16 variants) | `12e35bceba83a70c42d0e82ed91adf42d2f41aff` | 트리거 안 값 표시 (텍스트 / Badge)                             |
| 🟨\bMultiselect/SlotLayer       | COMPONENT_SET (5 variants)  | `6256466a299aab5ff86bfeae976ab023e73b870e` | Popup 내용 (프리셋 목록 또는 placeholder)                      |
| 🟨Select.item/SlotLayer         | COMPONENT (Select 페이지)   | `6b7889293e3ffa028e0ce741ef46abd0240327f0` | Item 내용 (라벨 + 아이콘 + 체크). MultiSelect.Item이 실제로 씀 |

## 구조 — 어디를 바꾸나

```
💙MultiSelect                              variant: side · align
├─ 💙MultiSelect.Trigger                   (exposed) variant: size · disabled · invalid · readOnly
│  ├─ 🔶InteractionLayer/Normal            건드리지 않는다
│  └─ 🟨MultiSelect.Trigger/SlotLayer      (exposed) variant: value · size · type · multiline
│     ├─ type=text  : Placeholder ← Text#31108:0 (TEXT) 선택값 요약 또는 placeholder
│     └─ type=badge : 💙Badge ×8 (속성은 Badge 쪽)
└─ 💙 MultiSelect.Popup                    (exposed)
   └─ 🟨\bMultiselect/SlotLayer            (exposed) variant: type · hasLeadingIcon
      │   type=default → 💙 MultiSelect.Item ×5
      │   type=group   → 💙 Select.Group ×2 (Select 페이지 컴포넌트)
      │   type=slot    → placeholder → swap: 로컬 컴포넌트
      └─ 💙 MultiSelect.Item               variant: disabled
         ├─ 🔶InteractionLayer/Normal/omitFocus
         └─ 🟨Select.item/SlotLayer        (exposed)
            ├─ ❤️SlotIcon ← LeadingIcon#33229:0 (INSTANCE_SWAP) · 보임 = hasLeadingIcon#33229:1 (BOOLEAN)
            ├─ Nav Item   (TEXT 레이어, 속성 없음) 옵션 라벨
            └─ checkbox.item (체크 표시) ← Checked#33229:2 (BOOLEAN)
```

- 트리거 값 문구는 🟨MultiSelect.Trigger/SlotLayer의 `Text#…`(type=text일 때). 선택 전이면 `value=false`, 선택 후 `value=true`. Badge 형태(`type=badge`)는 `value=true`만 있다.
- Trigger와 그 SlotLayer에 각각 `size`가 있다. 둘을 같은 값으로 맞춘다.
- 옵션 라벨은 Item 안 🟨Select.item/SlotLayer의 `Nav Item` TEXT 레이어. **TEXT 속성이 없다** → `characters` 직접 수정(사다리 5번). 선택 표시는 같은 instance의 `Checked#…`.
- 항목 수가 프리셋(5개)과 다르면 `type=slot`으로 두고 💙 MultiSelect.Item instance를 쌓은 로컬 컴포넌트로 swap한다.

## 알려진 버그와 우회

- 이름에 백스페이스 제어문자: `"🟨\bMultiselect/SlotLayer"`(소문자 s), `"💙\bMultiSelect.Separator"`. 이름 비교 대신 key로 찾는다.
- 이모지 뒤 공백: `"💙 MultiSelect.Popup"`, `"💙 MultiSelect.Item"`, `"💙 MultiSelect.Group"`. 다른 파트는 공백 없음.
- 레거시 중복: 🟨MultiSelect.item/SlotLayer(`66a30e576e35e52d30d0a6e1882a6dea441d5696`)가 있지만 💙 MultiSelect.Item은 🟨Select.item/SlotLayer를 쓴다. 이 컴포넌트는 속성이 없어 아이콘·체크를 조작할 수 없다. 쓰지 않는다.
- 💙 MultiSelect.Group은 💙MultiSelect.GroupLabel이 아니라 **💙Select.GroupLabel**을 담고 있고, Popup `type=group` 프리셋은 💙 Select.Group/💙 Select.Item을 쓴다. 다중 선택 그룹이 필요하면 💙 MultiSelect.Group을 쓰거나 로컬 컴포넌트로 만든다.
- Item 라벨에 TEXT 속성이 없다(위 우회).

## Variant 선택 기준

| 속성                          | 값                   | 언제                                            |
| ----------------------------- | -------------------- | ----------------------------------------------- |
| size (Trigger)                | sm                   | 고밀도의 작은 공간                              |
|                               | md                   | 기본 입력 필드                                  |
|                               | lg                   | 공간이 넓거나 강조할 때                         |
|                               | xl                   | 가장 큼. 강조가 필요할 때                       |
| side (💙MultiSelect)          | bottom               | 기본                                            |
|                               | top                  | 아래 공간이 부족할 때                           |
|                               | left                 | 가로 레이아웃에서 오른쪽 공간이 부족할 때       |
|                               | right                | 왼쪽 공간이 부족할 때                           |
| align (💙MultiSelect)         | start · center · end | Popup 정렬 위치. 위치에 따라 달라질 수 있다     |
| readOnly                      | true                 | 수정 불가, 읽기·복사만 허용                     |
| disabled                      | true                 | 상호작용 불가                                   |
| invalid                       | true                 | 필수 누락·잘못된 입력                           |
| value (Design Only)           | true                 | 선택된 값이 있을 때                             |
| type (Trigger SlotLayer)      | text                 | 단일 선택 또는 소수 항목                        |
|                               | badge                | 다중 선택을 태그처럼 보여줄 때                  |
| multiline (Trigger SlotLayer) | true                 | 선택이 많아 모든 값을 줄바꿈해 노출할 때 (Wrap) |
|                               | false                | 높이 고정. 초과분은 +N 요약 (Truncate)          |

## Guidelines

1. **복수 선택이 꼭 필요할 때만.** 선택지가 5개 이상이고 복수 선택일 때 쓴다. 2~3개뿐이면 지양하고 복수는 Checkbox, 단일은 Radio를 쓴다.
2. **선택된 항목을 Trigger에 항상 노출한다.** 텍스트나 태그로 표시하고 공간이 넘치면 +N 요약. 잘리거나 스크롤해야 보이게 하지 않는다.
3. **레이아웃에 따라 multiline을 고른다.** 높이가 유연하면 Wrap(`multiline=true`), 높이 고정이면 Truncate(+N).
4. **선택 상태를 명확히 표시한다.** 선택된 옵션은 시각적으로 강조. 선택 여부가 구분되지 않는 스타일은 쓰지 않는다.

## Usecase

- 항목이 많을 때: 스크롤 가능한 드롭다운, 그룹화 또는 검색 추가.
- Item 안 아이콘: 빠른 식별·상징 의미가 필요할 때만. 장식용으로 쓰지 않는다.
- 값 표시: Text는 단일·소수, Badge는 다중을 태그처럼, Multiline은 많은 값을 모두 노출할 때.
- 선택 초기화 수단(초기화 버튼, 전체 해제)을 항상 제공한다.
