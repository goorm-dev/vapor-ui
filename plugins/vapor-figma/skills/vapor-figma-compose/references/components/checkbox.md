---
component: Checkbox
page: '❖ Checkbox (32800:56)'
reviewedAt: 2026-10-01
---

# Checkbox

여러 항목 중 복수 선택을 가능하게 하는 입력 컴포넌트다.

## 컴포넌트와 key

| 이름                           | 종류                        | key                                        | 용도                                  |
| ------------------------------ | --------------------------- | ------------------------------------------ | ------------------------------------- |
| 💙Checkbox                     | COMPONENT_SET (30 variants) | `7bbbc1ccd74df4f19c84c2142fdeb0e47fe8be9d` | 배치하는 컴포넌트 (박스만, 라벨 없음) |
| 🟨Checkbox/CheckboxCheckedIcon | COMPONENT                   | `abea3457973e8818901573b2df1dbf47eb273adf` | 체크 아이콘 (내부 파트)               |
| 🟨Checkbox/CheckboxMixedIcon   | COMPONENT                   | `550adea8ec942012f0b6574133488841905d670a` | indeterminate 아이콘 (내부 파트)      |

## 구조 — 어디를 바꾸나

```
💙Checkbox                       variant: size · checked · disabled · indeterminate · invalid · readOnly
├─ 🔶InteractionLayer/Normal/omitPressed  (exposed) 건드리지 않는다
└─ Indicator
   └─ 🟨Checkbox/CheckboxCheckedIcon      (비노출)
```

- TEXT·BOOLEAN·INSTANCE_SWAP 속성이 없다. 상태는 모두 variant로 고른다. 아이콘을 직접 바꾸지 않는다(indeterminate는 variant로).
- 라벨은 컴포넌트에 없다. 옆에 텍스트를 두는 Field 등 조합으로 만든다(Text Style 사용).

## 알려진 버그와 우회

- `readOnly` 값에 `"Default"`가 있다. `"Default"`는 `checked=false, indeterminate=false` 조합(md·lg)에만 있고, 그 조합에는 `readOnly=true`가 없다. 해당 조합의 읽기 전용 상태가 필요하면 정의에서 읽은 값 목록으로 존재 여부를 먼저 확인한다.
- variant는 30개뿐이라 모든 조합이 있지 않다(예: `checked=true`와 `indeterminate=true` 동시 불가, readOnly는 disabled·invalid와 조합 없음). `setProperties` 전에 대상 조합이 있는지 `children` 이름으로 확인한다.

## Variant 선택 기준

| 속성          | 값   | 언제                                                  |
| ------------- | ---- | ----------------------------------------------------- |
| size          | md   | 기본. 일반 폼                                         |
|               | lg   | 가독성을 높이거나 클릭 영역을 넓힐 때                 |
| checked       | true | 선택(On). Active 대신 Checked 상태를 쓴다             |
| indeterminate | true | 하위 항목 일부만 선택된 부분 선택(Mixed)              |
| disabled      | true | 조건 미충족·일시 제한으로 상호작용 불가               |
| invalid       | true | 필수 누락·잘못된 입력 등 유효성 실패                  |
| readOnly      | true | 값은 보이지만 수정 불가 (Disabled와 달리 포커스 가능) |

## Guidelines

1. **클릭 영역을 넓힌다.** 옆 텍스트 라벨을 눌러도 체크되게 한다. 하위 항목 일부 선택은 indeterminate로 표현한다.
2. **옵션이 많으면 수직 나열.** 수직 배치가 기본, 수평도 가능하다.

## Usecase

- Label은 명확하고 구체적으로 쓴다.
- 그룹이면 Group Label을 제공한다 (예: "관심있는 주제를 선택하세요.").
- 조합해 버튼형 선택 UI: Field를 Card로 묶어 카드 버튼처럼 복수 선택.
- 확약: 주의사항·약관·경고를 읽고 이해했음을 스스로 체크하게 할 때.
