---
component: Sheet
page: '❖ Sheet (33958:876)'
reviewedAt: 2026-10-01
---

# Sheet

현재 페이지 가장자리에서 오버레이로 열어 사용자가 주요 작업에 집중하게 한다.

## 컴포넌트와 key

| 이름                 | 종류                       | key                                        | 용도                                |
| -------------------- | -------------------------- | ------------------------------------------ | ----------------------------------- |
| 💙Sheet              | COMPONENT_SET (4 variants) | `e4f46127fbab1019657383a4fe8b8d5310155acd` | 배치하는 컴포넌트 (375×496 기본)    |
| 💙Sheet.Popup        | COMPONENT_SET (4 variants) | `8c16b865f5261953ff13b25d98151a19f5ef7387` | 패널 본체만 필요할 때               |
| 💙Sheet.Header       | COMPONENT                  | `28d433de11ee5a0c7381cc4623fa0c3d53c5ca0c` | 제목 영역                           |
| 💙Sheet.Body         | COMPONENT                  | `69f44dcb8bc2a5f0663c1141d15902fb8bd229d4` | 본문 영역                           |
| 💙Sheet.Footer       | COMPONENT                  | `60de3f93a784c96beff3186a1ac4c7a86fb5d384` | 액션 영역                           |
| 💙Sheet.ResizeHandle | COMPONENT_SET (4 variants) | `82ff2d034f7179fa445b20abe4515f173a4559ac` | 크기 조절 핸들                      |
| 🟨Sheet/SlotLayer    | COMPONENT                  | `5d8308f94279dceb5d44c9b33d599a9c122b18df` | Header·Body·Footer 안의 placeholder |

## 구조 — 어디를 바꾸나

```
💙Sheet                          variant: side (left · right · top · bottom)
└─ 💙Sheet.Popup                 (exposed) variant: side · showHandle#45368:0 (BOOLEAN)
   ├─ 💙Sheet.Header             (비노출)
   │  └─ 🟨Sheet/SlotLayer       (비노출) → swap: 제목 로컬 컴포넌트
   ├─ 💙Sheet.Body               (비노출)
   │  └─ 🟨Sheet/SlotLayer       (비노출) → swap: 본문 로컬 컴포넌트
   ├─ 💙Sheet.Footer             (비노출)
   │  └─ 🟨Sheet/SlotLayer       (비노출) → swap: 액션 로컬 컴포넌트 (💙Button 조합)
   └─ 💙Sheet.ResizeHandle       (exposed) 보임 = showHandle#45368:0 · variant: disabled · align (vertical · horizontal)
```

- 세 슬롯 모두 🟨Sheet/SlotLayer placeholder다. 사다리 4번(SlotLayer swap)으로 채운다. 라이브러리 swap 대상이 없으므로 **로컬 컴포넌트를 만들어** swap한다.
- Header·Body·Footer와 그 SlotLayer가 비노출이다. 영역별로 찾는다: `sheet.findOne(n => n.type === 'INSTANCE' && n.name === '💙Sheet.Header').findOne(n => n.name === '🟨Sheet/SlotLayer')`.
- 핸들을 숨기려면 💙Sheet.Popup의 `showHandle#`를 false.

## 알려진 버그와 우회

- **placeholder 흔적**: swap한 SlotLayer에 placeholder fill·테두리가 남으면 `fills = []`, `strokes = []`.
- 💙Sheet와 💙Sheet.Popup 둘 다 `side`를 가진다. 💙Sheet를 쓸 때는 바깥 `side`만 바꾼다.

## Variant 선택 기준

| side   | 언제                                                                |
| ------ | ------------------------------------------------------------------- |
| right  | 리스트 항목 상세, 긴 폼 입력, 필터·설정 패널                        |
| left   | 햄버거 메뉴(GNB), 전체 카테고리·폴더 트리 탐색                      |
| top    | 글로벌 검색바 확장, 상단 내비게이션에서 아래로 펼칠 때 (제한적으로) |
| bottom | 모바일 메뉴 선택, 액션 시트, 필터 설정 (손 조작이 쉬움)             |

크기(defaultSize·minSize·maxSize)는 코드 Root 속성이다. Figma 속성은 없다.

## Guidelines

1. **Header·Footer는 고정하고 Body만 스크롤.** 콘텐츠가 넘쳐도 제목과 액션 버튼은 항상 보인다. Header·Footer 없이 Body만 두지 않는다.
2. **닫는 수단을 여럿 제공.** Close(X) 아이콘, 버튼, ESC, dim 클릭 중 적용해 언제든 빠져나가게 한다.
3. **Sheet 위에 Sheet를 중첩하지 않는다.** 추가 작업은 새 페이지로, 단순 확인만 Confirm Dialog 같은 작은 모달로.

## Usecase

- 맥락을 유지한 상세 탐색: 데이터 그리드·리스트 항목 클릭 시 우측 Sheet로 상세.
- 길고 복잡한 폼: 입력 필드가 많아 넓은 공간·긴 스크롤이 필요할 때.
- 네비게이션·필터 옵션: 모바일·좁은 화면의 햄버거 메뉴, 상세 필터 패널.
