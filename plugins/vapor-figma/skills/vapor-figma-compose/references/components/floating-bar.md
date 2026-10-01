---
component: FloatingBar
page: '❖ FloatingBar (36666:52)'
reviewedAt: 2026-10-01
---

# FloatingBar

화면 위에 떠서 현재 맥락의 액션·설정·정보를 모아 보여주는 컨텍스트 툴바다.

## 컴포넌트와 key

| 이름                    | 종류      | key                                        | 용도                                               |
| ----------------------- | --------- | ------------------------------------------ | -------------------------------------------------- |
| FloatingBar.Popup       | COMPONENT | `9ee156dfa4da480b1691f8e7158d7e900861a561` | 배치하는 컴포넌트 (바 본체 421×64)                 |
| FloatingBar.Root        | COMPONENT | `769257e4e8632cfa980b7c7b51bd6901e7381a77` | 화면 영역(982×622) 안에 Popup이 놓인 예시 컨테이너 |
| 🟨FloatingBar/SlotLayer | COMPONENT | `26aa43c3e6f1d41ce978c70d380b27c27c5f6906` | Popup 안의 콘텐츠 placeholder                      |

## 구조 — 어디를 바꾸나

```
FloatingBar.Root                  속성 없음
└─ FloatingBar.Popup              (비노출) 속성 없음
   └─ 🟨FloatingBar/SlotLayer     (비노출) → swap: 로컬 컴포넌트
      └─ Slot (TEXT, placeholder)
```

- 속성이 하나도 없다. 내용은 전부 🟨FloatingBar/SlotLayer를 swap해서 채운다(사다리 4번).
- 라이브러리 swap 대상이 없다. 선택 개수 텍스트 + 💙Button/💙IconButton 2~3개 + 닫기 IconButton을 담은 **로컬 컴포넌트**를 만들어 swap한다.
- SlotLayer가 exposed instance가 아니다. Popup instance에서 `popup.findOne(n => n.type === 'INSTANCE' && n.name === '🟨FloatingBar/SlotLayer')`로 찾는다.

## 알려진 버그와 우회

- 공개 컴포넌트에 💙 접두사가 없다(`FloatingBar.Popup`, `FloatingBar.Root`). 💙로 필터링하면 안 잡힌다. 이름 또는 key로 찾는다.
- 중첩 instance(Root 안 Popup, Popup 안 SlotLayer)가 exposed되지 않아 속성 패널에 드러나지 않는다. 위처럼 직접 찾는다.

## Variant 선택 기준

- 페이지에 해당 내용 없음 (variant 없음. Anatomy는 Container 하나 + Slot Layer)

## Guidelines

1. **선택된 항목이 있을 때만 표시한다.** 하나 이상 선택되면 나타나고, 모두 해제되면 사라진다. 선택이 없는데 항상 노출하지 않는다.
2. **액션은 핵심만 3~4개 이하.** 핵심 액션 2~3개만 담는다. 6개 이상 나열하지 않는다. 자주 안 쓰는 액션은 더보기(⋯) 메뉴로 뺀다.
3. **선택 해제용 닫기 수단을 준다.** Close(X) 아이콘·버튼·ESC·바깥 클릭으로 닫히고 전체 선택이 해제된다. 항목을 하나씩 해제해야만 사라지게 하지 않는다.

## Usecase

- 다중 선택 일괄 처리: 테이블/리스트에서 체크박스로 여러 항목을 골라 일괄 액션. 선택된 항목 수를 명확히 표시.
- 데이터 테이블 행 선택 후 내보내기(Export): 필요한 행만 골라 CSV·Excel로 추출.
