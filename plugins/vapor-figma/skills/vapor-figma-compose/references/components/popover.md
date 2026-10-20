---
component: Popover
page: '❖ Popover (33182:3034)'
reviewedAt: 2026-10-01
---

# Popover

트리거를 클릭·호버하면 뜨는 작은 오버레이다. 추가 정보·옵션·도구를 준다. 모달보다 덜 방해하고 툴팁보다 인터랙션을 더 허용한다.

## 컴포넌트와 key

| 이름            | 종류                        | key                                        | 용도                                    |
| --------------- | --------------------------- | ------------------------------------------ | --------------------------------------- |
| 💙Popover       | COMPONENT_SET (12 variants) | `6b9d3ec103313d506a68456678c717281b79b5a0` | 배치하는 컴포넌트 (Popup + Arrow)       |
| 💙Popover.Popup | COMPONENT                   | `f510473708e958a92ff1754a53a1b4dfc099f86e` | 팝업 본체만 필요할 때                   |
| SlotLayer       | COMPONENT                   | `3914875c50bc970daf11a7fa7702ea7e2d912630` | Popup 본문 placeholder (🟨 접두사 없음) |

## 구조 — 어디를 바꾸나

```
💙Popover                        variant: side (top · bottom · left · right) · align (start · center · end)
├─ 💙Popover.Popup               (비노출)
│  └─ vertical layout › horizontal layout › body
│     └─ SlotLayer               (비노출) → swap: 본문 로컬 컴포넌트
└─ Popover.Arrow                 (비노출) 건드리지 않는다
```

- 텍스트·boolean·instance swap 속성이 하나도 없다. 본문은 사다리 4번(SlotLayer swap)으로만 채운다.
- 라이브러리에 swap 대상이 없다. 제목(Title)·설명(Description)·버튼 등을 **로컬 컴포넌트로 만들어** swap한다. 텍스트는 Text Style, 색은 토큰 변수.
- Popup·SlotLayer 모두 노출(exposed)되지 않았다. `popover.findOne(n => n.type === 'INSTANCE' && n.name === 'SlotLayer')`로 깊이 찾아 `swapComponent()`.

## 알려진 버그와 우회

- 본문 placeholder 이름이 `SlotLayer`(🟨 접두사 없음)다. 접두사로 찾으면 안 걸린다. 이름 정확히 일치로 찾는다.
- 화살표 컴포넌트 이름 `"Popover.Arrow "`(끝 공백, 💙 접두사 없음).
- **placeholder 흔적**: swap한 SlotLayer에 placeholder fill·테두리가 남으면 `fills = []`, `strokes = []`.

## Variant 선택 기준

| 속성  | 값     | 언제                                                            |
| ----- | ------ | --------------------------------------------------------------- |
| side  | top    | 아래 공간이 부족하거나 하단 요소를 가릴 수 있을 때              |
|       | left   | 오른쪽 공간이 부족하거나 레이아웃 흐름상 왼쪽이 자연스러울 때   |
|       | right  | 기본. 가장 일반적. 읽기 방향과 같은 흐름                        |
|       | bottom | 위쪽 공간이 부족하거나 드롭다운처럼 아래로 펼칠 때              |
| align | start  | 트리거가 왼쪽에 치우쳤거나 콘텐츠를 왼쪽 기준으로 정렬할 때     |
|       | center | 기본                                                            |
|       | end    | 트리거가 오른쪽에 치우쳤거나 콘텐츠를 오른쪽 기준으로 정렬할 때 |

## Guidelines

1. **상세 정보와 상호작용 요소를 넣는다.** 맥락상 필요한 상세 정보나 즉시 할 수 있는 가벼운 작업에 쓴다. 타이틀·본문으로 위계를 만들고, 이미지·버튼·링크를 둘 수 있다. 짧은 읽기 전용 텍스트만이면 Tooltip을 쓴다.
2. **트리거와 시각적 연결을 유지한다.** Arrow가 트리거를 향하게 하고, 트리거 위치에 맞춰 방향·정렬을 맞춘다. 트리거를 완전히 가리거나 너무 멀리 두지 않는다.
3. **Dialog와 구분한다.** 트리거를 직접 눌러 뜨는 보조 인터랙션(non-modal)에 쓴다. 명확한 확인이 필요한 중요 결정에는 Dialog를 쓴다.

## Usecase

- 계층이 있는 상세 정보: Title(요약 강조) + Description(보완 설명).
- 맥락을 유지한 간단한 입력: 페이지 전환·모달 없이 Popover 안에 체크박스·입력 필드를 두고 바로 설정을 바꾼다.
