---
component: Spinner
page: '❖ Spinner (31066:61026)'
reviewedAt: 2026-10-01
---

# Spinner

콘텐츠나 데이터를 불러오는 동안 처리 중임을 알린다.

## 컴포넌트와 key

| 이름      | 종류                       | key                                        | 용도              |
| --------- | -------------------------- | ------------------------------------------ | ----------------- |
| 💙Spinner | COMPONENT_SET (6 variants) | `7fdcb2ba08b5bce349bdefdda2ea99bd3256be21` | 배치하는 컴포넌트 |

## 구조 — 어디를 바꾸나

```
💙Spinner                        variant: size (md · lg · xl) · colorPalette (primary · inherit)
```

- 중첩 instance·텍스트·boolean 속성이 없다. variant만 바꾼다.
- 로딩 설명 텍스트('저장 중' 등)는 Spinner에 없다. 옆에 Text Style을 쓴 텍스트를 따로 둔다.
- 버튼 안 로딩: 💙Button의 아이콘 슬롯(`LeadingIcon#`)에 Spinner를 넣고 `colorPalette=inherit` (button.md).

## 알려진 버그와 우회

- 확인된 것 없음 (2026-10-01 기준)

## Variant 선택 기준

| 속성         | 값      | 언제                                                                     |
| ------------ | ------- | ------------------------------------------------------------------------ |
| colorPalette | primary | 단독 사용. background-primary-200 적용                                   |
|              | inherit | 상위 컴포넌트 색을 따른다. Button Leading/Trailing 아이콘 자리에 넣을 때 |
| size         | md      | Button sm·md 아이콘과 같은 크기. 테이블·리스트 같은 고밀도 공간          |
|              | lg      | Button lg 아이콘과 같은 크기                                             |
|              | xl      | Button xl 아이콘과 같은 크기                                             |

## Guidelines

1. **로딩 중 같은 액션 반복을 막는다.** Spinner가 보이는 동안 버튼을 disabled로 하거나 오버레이로 인터랙션을 차단해 중복 요청을 막는다.
2. **로딩 목적 텍스트를 함께 둔다.** '저장 중', '불러오는 중'처럼 현재 작업을 설명한다. Spinner만 단독으로 두지 않는다.
3. **시계 방향 원형 회전.** 노출부터 사라질 때까지 멈추지 않고 반복. 완료 전 임의로 멈추거나 역방향으로 돌리지 않는다.

## Usecase

- 버튼 로딩 상태: 비동기 작업 버튼 안에 표시. inherit로 버튼 슬롯과 같은 색.
- 전체 화면·섹션 로딩: 페이지 진입·주요 데이터 로딩 중 콘텐츠 영역에 오버레이.
- 인라인 콘텐츠 로딩: 특정 영역을 비동기로 불러올 때 그 영역 안에 표시.
