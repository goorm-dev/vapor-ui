---
component: Radio
page: '❖ Radio/RadioCard/RadioGroup (34525:16084)'
reviewedAt: 2026-10-01
---

# Radio · RadioGroup · RadioCard

여러 옵션 중 하나만 선택하게 한다. RadioCard는 카드 형태 선택지, RadioGroup은 그룹 라벨과 옵션 묶음이다.

## 컴포넌트와 key

| 이름                   | 종류                        | key                                        | 용도                                        |
| ---------------------- | --------------------------- | ------------------------------------------ | ------------------------------------------- |
| 💙RadioGroup           | COMPONENT_SET (14 variants) | `954b9c15efbd2714202862c4a41e59b37d91fb48` | 배치하는 컴포넌트 (그룹 라벨 + 옵션 3개)    |
| 💙RadioGroup.Label     | COMPONENT                   | `2fdbd657a63073fe55e8971b844f8601cdfcf34d` | 그룹 라벨                                   |
| 🟨RadioGroup/SlotLayer | COMPONENT_SET (4 variants)  | `61c71db38512277c5d9243fa6ec78a5a671e186e` | 옵션 영역 (native SLOT 속성)                |
| 💙Radio                | COMPONENT_SET (8 variants)  | `478087a31ff61069fff3fa2cb5104285d3ac0126` | 라디오 원 단독 (라벨 없음)                  |
| 🟨Radio/SlotLayer      | COMPONENT_SET (2 variants)  | `85a9b1ab82bda5cec1e9664f4180b67ea2e234b0` | 선택 dot (Radio 안에 exposed instance)      |
| 💙RadioCard            | COMPONENT_SET (4 variants)  | `971463ce409c7685fea22a258c2176c16f299ad9` | 카드형 선택지                               |
| 🟨RadioCard/SlotLayer  | COMPONENT_SET (2 variants)  | `0e1840ad2ac05acd263ae6c2290fb0e01e4cdf5e` | 선택 상태 (RadioCard 안에 exposed instance) |
| 🟨RadioCard/slot       | COMPONENT                   | `15ced6757c50a378d3b33c75d74663da6e84ef68` | 카드 내용 placeholder (swap 대상 자리)      |

## 구조 — 어디를 바꾸나

```
💙RadioGroup                     variant: size · invalid · disabled · readOnly · required
├─ 💙RadioGroup.Label            (exposed)
│  └─ 🟨Field.Label/SlotLayer    (비노출) required#36344:0 (BOOLEAN)
│     └─ Label                   (TEXT 레이어, 속성 없음) 그룹 라벨
└─ 🟨RadioGroup/SlotLayer        (exposed) variant: orientation (vertical · horizontal) · type (radio · RadioCard)
   └─ Slot  ← Slot#51050:0       (native SLOT)
      └─ 💙Field.label ×3        (비노출) — 라벨+라디오 한 줄. 속성은 Field 문서
         └─ 🟨Field.Label/SlotLayer (side=right)
            ├─ 🟨Field/SlotLayer        (type=Radio)
            └─ 🟨Field.Label/SlotLayer  (required#36344:0)

💙Radio                          variant: disabled · invalid · readOnly · size
├─ 🔶InteractionLayer/Normal/omitPressed (exposed) 건드리지 않는다
└─ 🟨Radio/SlotLayer             (exposed) variant: selected (true · false)

💙RadioCard                      variant: size · invaild · readOnly · disabled
├─ 🔶InteractionLayer/Normal/omitPressed (exposed) 건드리지 않는다
├─ 🟨RadioCard/SlotLayer         (exposed) variant: selected
└─ 🟨RadioCard/slot              (비노출) → swap: 카드 내용 로컬 컴포넌트
```

- 선택 여부는 💙Radio·💙RadioCard가 아니라 **안쪽 🟨…/SlotLayer의 `selected`**다.
- 💙Radio에는 라벨이 없다. 라벨이 있는 한 줄은 RadioGroup 안의 💙Field.label이다.
- 그룹 가로·세로 배치와 radio/RadioCard 전환은 🟨RadioGroup/SlotLayer의 `orientation`·`type`.
- 🟨RadioGroup/SlotLayer는 SlotLayer swap이 아니라 **Figma native SLOT 속성**(`Slot#51050:0`, `Slot#51050:5`)을 쓴다. default variant(`vertical, radio`)에서는 `Slot#51050:0`만 레이어에 연결된다.

## 알려진 버그와 우회

- **그룹 라벨 텍스트 속성 없음**: 💙RadioGroup.Label 안 `Label` TEXT 레이어가 속성과 연결되지 않았다. 중첩 🟨Field.Label/SlotLayer(비노출)를 찾아 `characters`를 직접 바꾼다(사다리 5번).
- **RadioCard 속성 이름 오타** `invaild`(invalid 아님). 💙Radio·💙RadioGroup은 `invalid`라 이름이 다르다. 정의에서 읽은 이름을 그대로 쓴다.
- 💙RadioCard `size` 값은 `md` 하나뿐이다.
- 🟨Radio/SlotLayer의 `readOnly`·`invalid` variant는 값이 `false` 하나뿐이다(의미 없는 속성).
- 🟨RadioCard/SlotLayer description이 "Input Field와 같은 입력 필드에서 사용합니다."로 RadioCard와 맞지 않는다. 무시한다.
- **placeholder 흔적**: 🟨RadioCard/slot을 swap하면 placeholder fill·테두리가 남을 수 있다. `fills = []`, `strokes = []`.

## Variant 선택 기준

| 속성                 | 값   | 언제                                                          |
| -------------------- | ---- | ------------------------------------------------------------- |
| size (RadioGroup)    | md   | 기본. 일반 폼. 선택지가 여럿일 때 가독성을 유지하며 공간 절약 |
|                      | lg   | 터치 인터페이스에서 쉽게 선택. 선택지가 적고 중요도가 높을 때 |
| selected (SlotLayer) | true | 해당 옵션을 선택(On)                                          |
| disabled             | true | 비활성. 클릭·포커스 차단                                      |
| invalid (`invaild`)  | true | 유효성 검증 실패·형식 불일치(필수 누락 등)                    |
| readOnly             | true | 값을 읽을 수 있지만 수정 불가 (disabled와 달리 포커스 가능)   |
| required             | true | (RadioGroup) 필수 입력 표시                                   |

## Guidelines

1. **기본값을 미리 선택해 둔다.** 라디오는 한 번 선택하면 해제할 수 없다. 데이터 손실 위험이 없으면 대다수가 고를 옵션을 기본값으로.
2. **클릭 영역을 넓힌다.** 라디오 옆 텍스트 라벨을 클릭해도 선택되게 한다.
3. **옵션이 많으면 수직 나열.** 수직(vertical)이 기본, 수평(horizontal)도 가능.
4. **(RadioCard) 줄바꿈에 주의.** 옵션 텍스트가 짧고 길이가 비슷할 때만 가로 배치. 텍스트가 길거나 4개 이상이면 기본 수직 라디오 그룹을 쓴다.

## Usecase

- 그룹이 있으면 Group Label을 제공한다(무엇을 고르는지).
- 여러 옵션 중 하나만 고르는 상호 배타적 선택. 중복 선택은 Checkbox.
- 옵션 하나하나의 시각적 비중이 중요하면 Card와 조합(RadioCard).
- (RadioCard) 2~3개 고정의 짧은 단답형 선택지.
- (RadioCard) 옵션을 가로로 배치해 폼 세로 길이를 줄일 때.
