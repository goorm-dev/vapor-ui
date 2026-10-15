---
component: Toolbar
page: '❖ Toolbar (46186:32370)'
reviewedAt: 2026-10-01
---

# Toolbar

버튼·토글·인풋 같은 개별 컨트롤 여러 개를 한 그룹으로 묶어 제공한다.

## 컴포넌트와 key

| 이름                | 종류                        | key                                        | 용도                                                                    |
| ------------------- | --------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| 💙Toolbar           | COMPONENT_SET (16 variants) | `606819a01906b1220faac47caea42a9e960b1daf` | 배치하는 컴포넌트 (네이티브 SLOT `Slot#46629:1`)                        |
| 💙Toolbar.Button    | COMPONENT                   | `7183b1347086611798b29a5d1203835a1943beae` | 툴바 항목 (안의 🟩Toolbar/RenderLayer `type`: toggle·select·iconButton) |
| 💙Toolbar.Input     | COMPONENT                   | `daca71100ab578567357bf62f427c30d146e68aa` | 툴바 인풋 (💙TextInput exposed)                                         |
| 💙Toolbar.Separator | COMPONENT_SET (4 variants)  | `da491dfe8b23758c0d30360109611ebbe3c7e5ce` | 그룹 구분선 (`size`)                                                    |

## 구조 — 어디를 바꾸나

```
💙Toolbar                         variant: size · variant (outline · ghost) · disabled
└─ Slot  ← Slot#46629:1 (네이티브 SLOT, preferred 4개)
   ├─ 💙Toolbar.Button (7183b…)
   │  └─ 🟩Toolbar/RenderLayer   (exposed) variant: size · type (toggle · select · iconButton)
   │     └─ 💙Toggle              (exposed, type=toggle일 때) 속성은 toggle.md
   ├─ 💙Toolbar.Separator         variant: size
   └─ Toolbar.toggleGroup         variant: size
      └─ 💙toggleGroup            (비노출)
```

- 💙Toolbar의 내부 항목은 🟨SlotLayer swap이 아니라 **Figma 네이티브 SLOT**에 들어 있다. 페이지 안내대로 Slot 레이어 > Add instances로 💙Toolbar.Button·Input·Separator를 추가한다.
- 항목 종류는 💙Toolbar.Button 안 **exposed 🟩Toolbar/RenderLayer**의 `type`으로 고른다. 실제 컨트롤(💙Toggle 등)의 상태·아이콘은 그 안의 exposed instance에서 바꾼다.
- 페이지 안내: 💙Toolbar 사이즈에 맞춰 내부 요소의 사이즈를 조절해야 한다. Toolbar와 각 항목의 `size`를 같은 값으로 직접 맞춘다.

## 알려진 버그와 우회

- **같은 이름 `💙Toolbar.Button`이 두 개다.** `7183b1347086611798b29a5d1203835a1943beae`(일반, 🟩Toolbar/RenderLayer)와 `bc7ce1012de4563af7dcefb6e3781d538fe234a7`(설명: "Toolbar.toggleGroup > 💙toggleGroup에만 사용되는 전용 컴포넌트", 🟩Toolbar/Toggle/RenderLayer). 이름이 아니라 key로 고른다. 일반 툴바 항목은 `7183b…`.
- `Toolbar.toggleGroup`에 접두사가 없고, 안의 💙toggleGroup이 exposed가 아니다. 그룹 안 Toggle 상태를 바꾸려면 instance 안을 직접 찾아 들어간다.
- 🟩 접두사(RenderLayer)는 SKILL.md 접두사 규칙에 없는 계층이다. 항목 종류를 정하는 내부 레이어로 보고 `type`만 바꾼다.

## Variant 선택 기준

| 속성     | 값      | 언제                                                     |
| -------- | ------- | -------------------------------------------------------- |
| variant  | outline | Toolbar 컨테이너에 스타일(배경·테두리)이 필요할 때       |
|          | ghost   | 컨테이너 스타일이 필요 없거나, 별도 스타일을 커스텀할 때 |
| size     | sm      | 좁은 공간, 선택지가 여러 개                              |
|          | md      | 기본. 범용, 중요도 중간 액션                             |
|          | lg      | 강조가 필요한 Toolbar                                    |
|          | xl      | 넓은 화면에서 주변 UI 없이 단독                          |
| disabled | true    | 조건 미충족·일시 제한으로 상호작용 불가                  |

## Guidelines

1. **내부 요소 그룹을 시각적으로 구분한다.** 컨트롤을 너무 많이 나열하지 않는다. 늘어나면 Separator로 나눈다.
2. **Toolbar와 내부 요소 사이즈를 같게.** 다른 사이즈를 섞지 않는다.

## Usecase

- 내부 요소 추가: Slot 레이어 > Add instances. 💙Toolbar 사이즈에 맞춰 내부 요소 사이즈를 조절한다.
- Outline: 다른 UI와 결합 없이 단독으로 쓰여 컨테이너 스타일이 필요할 때.
- Ghost: 컨테이너 스타일이 필요 없거나 별도로 커스텀할 때.
