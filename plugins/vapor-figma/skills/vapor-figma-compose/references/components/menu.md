---
component: Menu
page: '❖ Menu (33182:3031)'
reviewedAt: 2026-10-01
---

# Menu

트리거를 누르면 열려서, 여러 액션 중 하나를 골라 실행하게 하는 목록이다.

## 컴포넌트와 key

| 이름                            | 종류                        | key                                        | 용도                                           |
| ------------------------------- | --------------------------- | ------------------------------------------ | ---------------------------------------------- |
| 💙Menu                          | COMPONENT_SET (12 variants) | `0f27fad4b9a88deb3a203bed776c8fcd0dbe1e55` | 배치하는 컴포넌트 (트리거 표시 + Popup)        |
| 💙Menu.Popup                    | COMPONENT                   | `edf9d23cdefeb22d47b2dce519e0beb39abafd90` | 팝업 본체만 필요할 때                          |
| 💙Menu.Item                     | COMPONENT_SET (2 variants)  | `ad58cf1d7333c8a5e3a29de35180b04c331d42c9` | 일반 액션 항목                                 |
| 💙Menu.CheckboxItem             | COMPONENT_SET (2 variants)  | `5a5d377b3ea4299fbff68cd02de0aa46dd1e6786` | 체크 항목 (이름 끝 공백 주의)                  |
| 💙Menu.RadioItem                | COMPONENT_SET (2 variants)  | `449e3894b518e0bc822ec6e4659d0a862179abda` | 라디오 항목 (이름 끝 공백 주의)                |
| 💙Menu.SubTriggerItem           | COMPONENT_SET (2 variants)  | `ed46f80c0c571a7c87dc27888666596bf49c206e` | 서브메뉴를 여는 항목 (› 아이콘 + SubmenuPopup) |
| 💙Menu.SubmenuPopup             | COMPONENT                   | `8ee1efa0c3983807df123ec744566f4d1322b533` | 서브메뉴 팝업                                  |
| 💙Menu.Group                    | COMPONENT                   | `0b6efa0490d187c14621b5c265488ec9a835f95d` | GroupLabel + Item 4개 + Separator              |
| 💙Menu.GroupLabel               | COMPONENT                   | `4634b45485a6fabed8060fde0def88dd3476f19c` | 그룹 제목                                      |
| 💙Menu.Separator                | COMPONENT                   | `719cd2bc5b32e19e5ad0b6c4c7dc37304492bb85` | 그룹 구분선                                    |
| 🟨Menu/SlotLayer                | COMPONENT_SET (11 variants) | `8c2284f99d51d5e5cc4847abd9cca7f3ba6de4b1` | Popup 내용 (프리셋 목록 또는 placeholder)      |
| 🟨Menu/SlotLayer                | COMPONENT                   | `a1243111f321f0535a370b32b8f30a4a53140e60` | 각 Item 내용 (라벨 + 아이콘)                   |
| 🟨Menu.SubTriggerItem/SlotLayer | COMPONENT                   | `beb40a7f410fd89f02bdbe3fc06b767530b2fbd4` | SubTriggerItem 안의 SubmenuPopup 표시 토글     |

## 구조 — 어디를 바꾸나

```
💙Menu                                variant: side · align
└─ 💙Menu.Popup                       (exposed)
   └─ 🟨Menu/SlotLayer (set)          (exposed) variant: type · hasLeadingIcon · Checkbox/Radio
      │   type=default   → 💙Menu.Item ×5  (Checkbox/Radio=true면 💙Menu.CheckboxItem ×5)
      │   type=subtrigger→ 💙Menu.SubTriggerItem ×5
      │   type=group     → 💙Menu.Group ×2
      │   type=slot      → placeholder → swap: 로컬 컴포넌트
      └─ 💙Menu.Item                  variant: disabled
         ├─ 🔶InteractionLayer/Normal/omitFocus  건드리지 않는다
         └─ 🟨Menu/SlotLayer (comp)   (exposed)
            ├─ ❤️SlotIcon  ← LeadingIcon#33182:1  (INSTANCE_SWAP) · 보임 = hasLeadingIcon#33182:2 (BOOLEAN)
            ├─ Nav Item    (TEXT 레이어, 속성 없음) 라벨
            └─ ❤️SlotIcon  ← TrailingIcon#36106:1 (INSTANCE_SWAP) · 보임 = hasTrailingIcon#36106:0 (BOOLEAN)

💙Menu.SubTriggerItem 추가분:
   ├─ ❤️ChevronRightOutlineIcon
   └─ 🟨Menu.SubTriggerItem/SlotLayer (exposed)
      └─ 💙Menu.SubmenuPopup  보임 = hasPopup#36582:0 (BOOLEAN)
         └─ 🟨Menu/SlotLayer (set, 비노출) type=slot
```

- 항목 수·종류는 Popup 안 🟨Menu/SlotLayer(set)의 `type`·`Checkbox/Radio`로 프리셋을 고른다. 프리셋이 안 맞으면 `type=slot`으로 두고 로컬 컴포넌트(💙Menu.Item 등 instance를 auto-layout으로 쌓은 것)로 swap한다.
- 라벨은 각 Item 안 🟨Menu/SlotLayer(comp)의 `Nav Item` TEXT 레이어다. **TEXT 속성이 없다** → `characters` 직접 수정(사다리 5번).
- 아이콘은 같은 instance의 `hasLeadingIcon#…`을 켜고 `LeadingIcon#…`에 아이콘 id. 세트의 `hasLeadingIcon` variant는 프리셋 목록 전체에 아이콘을 켠 버전일 뿐이다.
- 서브메뉴 내용은 SubmenuPopup 안의 🟨Menu/SlotLayer(set)다. exposed가 아니라 `findOne`으로 찾는다.

## 알려진 버그와 우회

- 이름 끝에 공백이 있다: `"💙Menu.CheckboxItem "`, `"💙Menu.RadioItem "`. 이름 비교는 `trim()` 후 하거나 key로 찾는다.
- `🟨Menu/SlotLayer`라는 이름이 COMPONENT_SET(Popup 내용)과 COMPONENT(Item 내용) 두 개에 쓰인다. key·속성으로 구분한다.
- Item 라벨에 TEXT 속성이 없다(위 우회).
- 🟨Menu/SlotLayer(set)의 `Checkbox/Radio=true` 프리셋은 CheckboxItem만 쓴다. RadioItem 목록이 필요하면 `type=slot` + 로컬 컴포넌트로 만든다.

## Variant 선택 기준

| 속성                 | 값     | 언제                           |
| -------------------- | ------ | ------------------------------ |
| side (💙Menu)        | bottom | 기본. 트리거 아래              |
|                      | top    | 트리거 위                      |
|                      | left   | 트리거 왼쪽                    |
|                      | right  | 트리거 오른쪽                  |
| align (💙Menu)       | start  | 트리거 시작 지점에 정렬        |
|                      | center | 트리거 중앙에 정렬             |
|                      | end    | 트리거 끝 지점에 정렬          |
| disabled (Item 계열) | true   | 선택·키보드 인터랙션 불가 항목 |

## Guidelines

1. **파괴적 액션은 시각적으로 강조한다.** 삭제·초기화처럼 되돌릴 수 없는 동작은 텍스트 컬러(danger 등)를 다르게. 모든 항목을 같은 색으로 두지 않는다. 오클릭 방지를 위해 가급적 메뉴 맨 아래에 둔다.
2. **노출 위치와 방향을 고려한다.** 트리거에 붙여 열고, 화면 끝이면 방향(상/하/좌/우)을 조정해 잘리지 않게 한다. 트리거와 멀리 떨어지거나 화면 경계에서 잘린 채 두지 않는다.
3. **항목이 많으면 구분선으로 그룹을 나눈다.** 연관 항목끼리 묶고 그룹 사이에만 Separator. 모든 항목 사이에 넣으면 List처럼 보인다.

## Usecase

- Label: '수정', '복사'처럼 결과를 예측할 수 있는 명확한 명사형.
- 아이콘: 항목 앞에 의미 있는 아이콘으로 인지 속도를 높인다. 모든 항목에 똑같이 넣거나 의미 없는 아이콘은 생략.
- 설정성 항목(CheckboxItem / RadioItem): 즉시 상태가 바뀌는 설정을 메뉴 안에서 처리. 일반 액션과 섞지 말고 별도 group으로 묶는다.
- 서브메뉴: 하위 항목이 있음을 알리는 시각적 단서(›)를 준다.
