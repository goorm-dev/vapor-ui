---
component: Textarea
page: '❖ Textarea (34407:14194)'
reviewedAt: 2026-10-01
---

# Textarea

사용자가 여러 줄의 텍스트를 입력하는 컴포넌트다.

## 컴포넌트와 key

| 이름                 | 종류                        | key                                        | 용도                                                     |
| -------------------- | --------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| 💙Textarea           | COMPONENT_SET (32 variants) | `8317f1f40d31ca4976c83389f7ffe5fa0f937eb4` | 배치하는 컴포넌트                                        |
| 🟨Textarea/SlotLayer | COMPONENT_SET (2 variants)  | `4a2c2e640c14d690233ebece41c418a2bd6c114b` | 텍스트 슬롯 (Textarea 안에 exposed instance로 들어 있음) |

## 구조 — 어디를 바꾸나

```
💙Textarea                     variant: size · disabled · invalid · readOnly · resizing
├─ 🔶InteractionLayer/Field    (exposed) 건드리지 않는다
└─ 🟨Textarea/SlotLayer        (exposed) variant: value (false=placeholder | true=입력값)
   └─ Placeholder  ← Text#31108:0 (TEXT)
```

- 텍스트와 `value`는 💙Textarea가 아니라 **안쪽 🟨Textarea/SlotLayer instance**의 속성이다. `textarea.findOne(n => n.type === 'INSTANCE' && n.name === '🟨Textarea/SlotLayer').setProperties({...})`.
- 입력된 값을 보여줄 때는 `value=true`로 바꾼 뒤 `Text#`에 값을 넣는다.

## 알려진 버그와 우회

- 조합 32개만 있다(속성 5개 조합 64개 중). 없는 조합은 `setProperties`가 실패한다. variant 이름 목록을 먼저 읽어 확인한다.

## Variant 선택 기준

| 속성                           | 값   | 언제                                |
| ------------------------------ | ---- | ----------------------------------- |
| size                           | sm   | 고밀도의 작은 공간                  |
|                                | md   | 기본 입력 필드                      |
|                                | lg   | 공간이 넓거나 강조할 때             |
|                                | xl   | 가장 큰 사이즈. 강조가 필요할 때    |
| resizing                       | true | 마우스로 크기를 조정할 수 있는 상태 |
| disabled                       | true | 상호작용 불가. 입력·수정 불가       |
| invalid                        | true | 필수 항목 누락·잘못된 입력          |
| readOnly                       | true | 수정은 불가, 읽기·복사는 허용       |
| value (SlotLayer, 디자인 전용) | true | 텍스트가 입력된 상태 표시           |

## Guidelines

1. **목적에 맞게 쓴다.** 여러 줄 설명·자유 서술에 쓴다. 짧고 정형화된 값 입력에는 쓰지 않는다.
2. **충분한 입력 공간.** 기본 높이를 3–5줄로 둔다. 한 줄 높이나 내용이 잘리는 고정 높이를 쓰지 않는다.
3. **작성 방향을 안내한다.** Placeholder에는 간단한 작성 예시·힌트. Placeholder를 Label 대체나 긴 설명으로 쓰지 않는다.
4. **작성 흐름을 방해하지 않는다.** Validation은 포커스 아웃·제출 시점에. 타이핑 중 즉시 에러를 띄우지 않는다.

## Usecase

- 플레이스홀더에 예시 텍스트를 넣는다. 입력 후 사라지므로 장기 참고 정보는 헬퍼 텍스트나 레이블로 준다.
