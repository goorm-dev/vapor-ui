---
component: Toast
page: '❖ Toast (36861:17903)'
reviewedAt: 2026-10-01
---

# Toast

사용자 동작의 결과나 상태 변화를 흐름을 방해하지 않고 잠깐 알리는 임시 알림이다.

## 컴포넌트와 key

| 이름                      | 종류                       | key                                        | 용도                             |
| ------------------------- | -------------------------- | ------------------------------------------ | -------------------------------- |
| 💙Toast.Add               | COMPONENT_SET (3 variants) | `f1f8c6a8200ccff583495a0db690b7d3e575793f` | 배치하는 컴포넌트                |
| 💙toast.Add/💙Toast.Close | COMPONENT                  | `f4f444086542de6a35841efa9bfafcdc892ac42b` | 닫기 버튼 (Toast.Add 안, 비노출) |

## 구조 — 어디를 바꾸나

```
💙Toast.Add                         variant: colorPalette (info · success · danger)
│                                   Title#36861:2 · Description#36861:3 (TEXT) · LeadingIcon#36881:4 (INSTANCE_SWAP) · close#38611:0 (BOOLEAN)
├─ icon+title+description
│  ├─ icon / ❤️WarningIcon          (연결된 속성 없음)
│  └─ title+description
│     ├─ Toast.Title       ← Title#36861:2
│     └─ Toast.Description ← Description#36861:3
└─ action+close
   ├─ 💙Button                      (exposed) 액션 버튼. 속성은 button.md
   └─ 💙toast.Add/💙Toast.Close     보임 = close#38611:0
```

- 제목·설명·close는 바깥 💙Toast.Add에서 바로 바꾼다.
- 액션 버튼 라벨은 **exposed 💙Button 안의 🟨Button/SlotLayer** 속성이다(button.md).

## 알려진 버그와 우회

- **`LeadingIcon#36881:4`가 실제 레이어와 연결되지 않음.** 기본 variant의 `❤️WarningIcon`에 아무 속성 참조가 없다. 속성을 바꿔도 아이콘이 안 바뀐다. 아이콘을 바꾸려면 `❤️WarningIcon` instance를 `swapComponent()`로 교체한다(사다리 3번).
- 닫기 컴포넌트 이름이 `💙toast.Add/💙Toast.Close`(소문자 toast, 접두사 중복). 이름 비교 대신 `close#` 속성으로 켜고 끈다.
- 기본 variant가 `colorPalette=danger`다. 배치 후 의도한 값으로 바꾼다.

## Variant 선택 기준

| colorPalette | 언제                                                     |
| ------------ | -------------------------------------------------------- |
| info         | 중립적 정보·안내. 상태 안내·프로세스 정보 등 가벼운 정보 |
| success      | 사용자 액션이 정상 완료됐다는 긍정 피드백                |
| danger       | 오류·실패를 신속히 알림. 수정이 필요한 상황              |

- Title: 핵심 내용을 한눈에 전달하는 짧은 텍스트. Description: 상세 설명, 필수 아님.
- Action: 재시도·상세 페이지 이동 같은 즉시 실행 가능한 버튼.

## Guidelines

1. **흐름을 끊지 않는 가벼운 정보에만.** 메시지는 1~2줄, 이미 완료된 행동의 결과나 추가 행동이 필요 없는 경우. 사용자 결정을 요구하거나 중요한 정보 전달에 쓰지 않는다.
2. **짧고 명료하게 전달하고 사라지게.** 우측 상단, 액션 직후 노출, 3~5초 후 자동 닫힘. 너무 빨리 사라지게 하지 않는다.
3. **CTA는 선택적·보조 액션 하나만.** 재시도·상세 이동처럼 즉시 수행 가능한 버튼. 행동을 강요하는 액션이나 여러 버튼을 넣지 않는다.

## Usecase

- UX 라이팅: 능동형으로, 느낌표·물음표·이모지를 자제하고 마침표로 끝낸다.
- 액션 결과가 실패하거나 작업 error를 안내할 때.
- 즉시 취소/되돌리기(Undo)는 fill 버튼으로 next action을 제안한다.
