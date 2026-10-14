---
component: Button
page: '❖ Button (1:1032)'
reviewedAt: 2026-10-01
---

# Button

사용자가 행동을 실행할 수 있도록 돕는다.

## 컴포넌트와 key

| 이름               | 종류                         | key                                        | 용도                                                        |
| ------------------ | ---------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| 💙Button           | COMPONENT_SET (144 variants) | `a0f09d9423ea8755dc676de31815001872e69c5a` | 배치하는 컴포넌트                                           |
| 🟨Button/SlotLayer | COMPONENT                    | `4b73794da2266958e30ac88838a1d8e35f40d653` | 라벨·아이콘 슬롯 (Button 안에 exposed instance로 들어 있음) |

## 구조 — 어디를 바꾸나

```
💙Button                         variant: size · colorPalette · disabled · variant
├─ 🔶InteractionLayer/Normal     (exposed) 건드리지 않는다
└─ 🟨Button/SlotLayer            (exposed)
   ├─ ❤️SlotIcon  ← LeadingIcon#  (INSTANCE_SWAP) · 보임 = hasLeadingIcon# (BOOLEAN)
   ├─ BUTTON      ← taxt#         (TEXT) 라벨
   └─ ❤️SlotIcon  ← TrailingIcon# (INSTANCE_SWAP) · 보임 = hasTrailingIcon# (BOOLEAN)
```

- 라벨·아이콘은 💙Button이 아니라 **안쪽 🟨Button/SlotLayer instance**의 속성이다. `button.findOne(n => n.type === 'INSTANCE' && n.name === '🟨Button/SlotLayer').setProperties({...})`.
- 아이콘은 `hasLeadingIcon#`을 `true`로 켠 뒤 `LeadingIcon#`에 아이콘 컴포넌트 id를 넣는다(`Icon [goorm]` 라이브러리 아이콘을 `importComponentByKeyAsync`로 불러와 `.id`).

## 알려진 버그와 우회

- `variant`의 ghost 값이 `"\bghost"`다(백스페이스 제어문자). 정의에서 읽은 값을 그대로 쓴다.
- 라벨 속성 이름이 `taxt#42854:26`(오타). `startsWith('taxt#')`로 찾는다.

## Variant 선택 기준

| 속성         | 값        | 언제                                                      |
| ------------ | --------- | --------------------------------------------------------- |
| colorPalette | primary   | 가장 주요한 액션. 한 화면에 primary는 하나                |
|              | secondary | 보조 기능. 주로 primary 옆 보조 버튼                      |
|              | success   | 성공·완료 같은 긍정 결과 액션. primary와 함께 쓰지 않는다 |
|              | warning   | 주의가 필요한 액션. danger보다 덜 위험                    |
|              | danger    | 삭제처럼 되돌리기 힘든 액션. 남발하지 않는다              |
|              | contrast  | 배경과 대비를 강하게 줄 때                                |
| size         | sm        | 테이블·리스트 같은 고밀도 공간, 보조 기능                 |
|              | md        | 기본. 범용                                                |
|              | lg        | 강조가 필요한 주요 액션                                   |
|              | xl        | 랜딩 페이지 CTA                                           |
| variant      | fill      | 주목도 최고                                               |
|              | outline   | fill보다 낮음                                             |
|              | ghost     | 주목도 최저 (배경·테두리 없음)                            |
| disabled     | true      | 조건 미충족·일시 제한으로 상호작용 불가                   |

## Guidelines

1. **Primary Button은 한 화면에 하나만 둔다.** 핵심 액션 하나에만 primary. 여러 버튼에 같은 강조를 쓰지 않는다.
2. **버튼 위계가 시각적으로 명확해야 한다.** 여러 버튼이 있으면 우선순위가 즉시 보이게, 중요도가 다른 행동을 같은 스타일로 두지 않는다.
3. **버튼 하나에 행동 하나.**
4. **위험한 행동은 즉시 구분된다.** 되돌릴 수 없는 행동은 별도 스타일(danger)과 명확한 문구.

## Usecase

- 기본: 텍스트만.
- 좌측 아이콘: 기능의 성격·상태 힌트.
- 우측 아이콘: 화살표·더보기 등.
- 양쪽 아이콘: 힌트 + 액션 아이콘.
- 가로 정렬: 연관 액션을 나란히. 간격은 버튼 사이즈에 맞춘다.
- 세로 정렬: 모바일이나 강조가 필요할 때.
