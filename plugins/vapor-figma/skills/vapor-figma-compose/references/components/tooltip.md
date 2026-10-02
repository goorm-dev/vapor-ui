---
component: Tooltip
page: '❖ Tooltip (33235:30091)'
reviewedAt: 2026-10-01
---

# Tooltip

호버(또는 클릭) 시 상황에 맞는 도움말·정보를 보여준다.

## 컴포넌트와 key

| 이름            | 종류                        | key                                        | 용도                               |
| --------------- | --------------------------- | ------------------------------------------ | ---------------------------------- |
| 💙Tooltip       | COMPONENT_SET (12 variants) | `eb84b7288746454956af16e158e37bfa7a056c62` | 배치하는 컴포넌트 (Popup + 화살표) |
| 💙Tooltip.Popup | COMPONENT                   | `660355097a18a5188a32396b5bf4ab9df1380ed1` | 화살표 없는 본체만 필요할 때       |

## 구조 — 어디를 바꾸나

```
💙Tooltip                  variant: side (top · bottom · right · left) · align (center · start · end)
├─ 💙Tooltip.Popup         (비노출)
│  └─ ✍️ Text              (TEXT 레이어, 속성 없음)
└─ Tooltip.arrow
```

- TEXT·BOOLEAN·INSTANCE_SWAP 속성이 하나도 없다. 위치는 variant로만 바꾼다.

## 알려진 버그와 우회

- **문구에 TEXT 속성이 없다.** `✍️ Text` 레이어가 속성에 연결되지 않았고, 💙Tooltip.Popup은 💙Tooltip 안에서 exposed도 아니다. 사다리 5번: `tooltip.findOne(n => n.type === 'TEXT' && n.name === '✍️ Text')`를 찾아 폰트 로드 후 `characters`를 바꾼다.

## Variant 선택 기준

| 속성  | 값     | 언제                                                      |
| ----- | ------ | --------------------------------------------------------- |
| side  | top    | 기본 권장. 시선 흐름에 맞고 커서가 내용을 가리지 않는다   |
|       | bottom | 화면 최상단(Header·GNB) 요소이거나 위쪽 공간이 부족할 때  |
|       | left   | 화면 우측 끝 요소. 툴팁이 화면 밖으로 잘리는 것을 막을 때 |
|       | right  | 세로 리스트·좌측 사이드바                                 |
| align | center | 기본. 특별한 이유가 없으면                                |
|       | start  | 좌측 정렬 흐름 유지, 트리거가 화면 왼쪽 구석일 때         |
|       | end    | 트리거가 화면 오른쪽 구석이라 center면 잘릴 때            |

## Guidelines

1. **없어도 사용에 지장 없는 보조 정보만.** 정보(i) 아이콘이나 기능이 모호한 버튼의 라벨로 쓴다. 중요한 정보는 주요 콘텐츠에 둔다. 툴팁이 화면 밖으로 잘리지 않게 한다.
2. **텍스트만으로 구성한다.** 읽기 전용 1~2줄, 40자 이내. '더보기' 링크·버튼을 넣지 않는다(커서를 옮기면 닫힌다). 내용이 길거나 복사가 필요하면 Popover를 쓴다.

컴포넌트 description(💙Tooltip.Popup): icon-only 버튼의 기능 명칭은 명사형으로, 보충 설명은 사용자가 얻는 이점에 집중해 쓴다.

## Usecase

- 아이콘 버튼의 기능 식별: 텍스트 라벨 없는 아이콘 버튼에 정확한 기능명을 보여준다.
- 모바일에서는 쓰지 않는다(hover 기반). 텍스트 라벨을 함께 표시하는 방식으로 대체한다.
