---
component: Badge
page: '❖ Badge (1:1030)'
reviewedAt: 2026-10-01
---

# Badge

이미지·콘텐츠 등의 상태 또는 분류를 시각적으로 표시한다.

## 컴포넌트와 key

| 이름              | 종류                        | key                                        | 용도                                                       |
| ----------------- | --------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| 💙Badge           | COMPONENT_SET (36 variants) | `df27a582d93b371e74ab1d7a89b9c8140ed58e45` | 배치하는 컴포넌트                                          |
| 🟨Badge/SlotLayer | COMPONENT                   | `f7cb9e2ea2de778bc639a851b0806b8b234938cb` | 라벨·아이콘 슬롯 (Badge 안에 exposed instance로 들어 있음) |

## 구조 — 어디를 바꾸나

```
💙Badge                          variant: colorPalette · size · shape
└─ 🟨Badge/SlotLayer             (exposed)
   ├─ ❤️SlotIcon  ← LeadingIcon#31044:5  (INSTANCE_SWAP) · 보임 = hasLeadingIcon#31562:1 (BOOLEAN)
   ├─ BADGE       ← Text#31562:5         (TEXT) 라벨
   └─ ❤️SlotIcon  ← TrailingIcon#31044:6 (INSTANCE_SWAP) · 보임 = hasTrailingIcon#31562:2 (BOOLEAN)
```

- 라벨·아이콘은 💙Badge가 아니라 **안쪽 🟨Badge/SlotLayer instance**의 속성이다. `badge.findOne(n => n.type === 'INSTANCE' && n.name === '🟨Badge/SlotLayer').setProperties({...})`.
- 아이콘은 `hasLeadingIcon#`/`hasTrailingIcon#`을 켠 뒤 `LeadingIcon#`/`TrailingIcon#`에 아이콘 컴포넌트 id를 넣는다.

## 알려진 버그와 우회

- 확인된 것 없음 (2026-10-01 기준)
- 참고: 페이지 문서에는 `hasLeading`, `hasTailing`으로 적혀 있지만 실제 속성 이름은 `hasLeadingIcon#`, `hasTrailingIcon#`이다.

## Variant 선택 기준

| 속성         | 값       | 언제                                                                  |
| ------------ | -------- | --------------------------------------------------------------------- |
| colorPalette | primary  | 강조하고 싶은 정보                                                    |
|              | success  | 성공·완료 같은 긍정 정보                                              |
|              | warning  | 주의가 필요한 정보                                                    |
|              | danger   | 위험하거나 부정적인 정보                                              |
|              | contrast | 기한 종료처럼 더 이상 권장되지 않는 정보                              |
|              | hint     | 부가·기본 정보                                                        |
| size         | sm       | 테이블·리스트 같은 고밀도 공간                                        |
|              | md       | Button·Input sm과 높이가 같아 함께 쓸 때. 고밀도 공간에서 sm보다 강조 |
|              | lg       | Button·Input md와 높이가 같아 함께 쓸 때. 강조가 필요한 정보          |
| shape        | square   | 상태(State) 전달, 높은 밀도로 나열 (예: 진행상태)                     |
|              | pill     | 분류(Classify), 시각적 환기 (예: 카테고리·태그)                       |

## Guidelines

1. **짧게, 의미에 맞는 색.** 문장이 아닌 단어·숫자 등 짧은 텍스트를 쓴다. 숫자나 아이콘 단독도 가능하다.
2. **상호작용 요소가 아니다.** 배지를 클릭 가능한 버튼으로 쓰지 않는다.
3. **띄어쓰지 않는다.** '진행 중' → '진행중', 'D - Day' → 'D-Day'처럼 붙여 써서 하나의 키워드로 읽히게 한다.

## Usecase

- 우측 아이콘: 드롭다운·셀렉트 트리거, 또는 배지 제거.
- 좌측 아이콘: 완료·경고 등 상태 힌트.
- 양쪽 아이콘: 시각적 힌트 + 액션 아이콘.
- 다중 선택 결과: 드롭다운·검색 필터에서 고른 값을 배지로 나열하고 닫기로 해제.
