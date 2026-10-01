---
component: Card
page: '❖ Card (1:1037)'
reviewedAt: 2026-10-01
---

# Card

이미지·텍스트·일부 기능 버튼을 담는 컨테이너로 콘텐츠를 제공한다.

## 컴포넌트와 key

| 이름             | 종류                       | key                                        | 용도                                   |
| ---------------- | -------------------------- | ------------------------------------------ | -------------------------------------- |
| 💙Card           | COMPONENT                  | `78e6c7c76ec04503d5b9c9b416e257587ba04103` | 배치하는 컴포넌트 (Header·Body·Footer) |
| 💙Card.Header    | COMPONENT                  | `afb794cddbdff1571925962a6cdf955e40472110` | 제목 영역                              |
| 💙Card.Body      | COMPONENT_SET (2 variants) | `574ec215897841f97c3a3b60f0628356d82b1121` | 본문 영역 (`hasPadding`)               |
| 💙Card.Footer    | COMPONENT                  | `609a14f28a060e7e950804d592f2814b15b4e73a` | 액션 버튼 영역                         |
| 🟨Card/SlotLayer | COMPONENT                  | `da659c4c62b32bf216c8d42eb3b496b7702d4713` | Header·Body·Footer 안의 placeholder    |

## 구조 — 어디를 바꾸나

```
💙Card                           속성 없음
├─ 💙Card.Header   (비노출)
│  └─ 🟨Card/SlotLayer  → swap: 제목 로컬 컴포넌트
├─ 💙Card.Body     (exposed)  variant: hasPadding (true · false)
│  └─ 🟨Card/SlotLayer  → swap: 본문 로컬 컴포넌트
└─ 💙Card.Footer   (비노출)
   └─ 🟨Card/SlotLayer  → swap: 버튼 묶음 로컬 컴포넌트 (💙Button, 속성은 button.md)
```

- 세 슬롯 모두 🟨Card/SlotLayer placeholder다. 라이브러리 swap 대상이 없으므로 **로컬 컴포넌트로 만들어** swap한다(사다리 4번). 텍스트는 Text Style, 색은 토큰 변수.
- Header·Footer는 exposed가 아니라 패널에 속성이 안 보인다. `card.findOne(n => n.name === '💙Card.Header').findOne(n => n.name === '🟨Card/SlotLayer')`처럼 찾아 `swapComponent()`한다.
- 영역을 생략하려면 해당 Header/Footer instance를 `visible = false`(사다리 5번).

## 알려진 버그와 우회

- 페이지 문서는 "Card/Slot을 Card.Title로 교환"이라고 하지만 페이지에 `Card.Title` 컴포넌트는 없다. 제목도 로컬 컴포넌트로 swap한다.
- Header·Footer 노출을 켜고 끄는 BOOLEAN 속성이 없다. `visible` override로 처리한다.

## Variant 선택 기준

| 속성                   | 값    | 언제                                |
| ---------------------- | ----- | ----------------------------------- |
| hasPadding (Card.Body) | true  | 기본. 본문에 안쪽 여백              |
|                        | false | 이미지처럼 가장자리까지 채울 콘텐츠 |

- 페이지 Anatomy & Variants에 variant 의미 설명은 없다. 위는 속성 이름 기준이다.

## Guidelines

1. **Card 하나에 목적 하나.** 하나의 주제만 담고, 콘텐츠와 액션이 명확히 연결되게 한다.
2. **모달처럼 쓰지 않는다.** dim과 함께 화면 중앙에 띄우지 않는다. 그럴 땐 Dialog.
3. **Footer 버튼은 2개까지.** 3개 이상 두지 않는다.

## Usecase

- Card header: 카드 콘텐츠를 대표하는 제목. 명사형으로 함축적으로 쓴다(컴포넌트 description).
- Footer 버튼: 콘텐츠와 연결된 행동 유도(CTA).
- 일부 요소만: 상황에 따라 일부 영역을 생략.
