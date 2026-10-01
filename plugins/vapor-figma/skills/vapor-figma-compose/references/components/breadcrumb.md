---
component: Breadcrumb
page: '❖ Breadcrumb (33036:431)'
reviewedAt: 2026-10-01
---

# Breadcrumb

현재 페이지의 경로 탐색과 이동 링크로 쓴다.

## 컴포넌트와 key

| 이름                   | 종류                       | key                                        | 용도                                 |
| ---------------------- | -------------------------- | ------------------------------------------ | ------------------------------------ |
| 💙Breadcrumb           | COMPONENT_SET (4 variants) | `20a26ce1f4194806ddfe9ac722905a0865811bf9` | 배치하는 컴포넌트 (Item·구분자 묶음) |
| 💙Breadcrumb.Item      | COMPONENT_SET (2 variants) | `c0e99d67ac40c6e13a078be1bc463aa3ee853f5f` | 경로 항목 하나                       |
| 💙Breadcrumb.Separator | COMPONENT                  | `20a34d210d9478541e45d84d7916ec845c783c72` | 구분자 (`/`)                         |
| 💙Breadcrumb.Ellipsis  | COMPONENT                  | `b3af5494f77f0b2458539c5bf55849232e867bdb` | 중간 경로 축약 (`…`)                 |

## 구조 — 어디를 바꾸나

```
💙Breadcrumb                     variant: size (sm · md · lg · xl)
├─ 💙Breadcrumb.Item          (exposed)  current=false
├─ 💙Breadcrumb.Separator
├─ 💙Breadcrumb.Ellipsis
├─ 💙Breadcrumb.Separator
├─ 💙Breadcrumb.Item          (exposed, 숨김)
├─ 💙Breadcrumb.Separator     (숨김)
├─ 💙Breadcrumb.Item          (exposed, 숨김)
├─ 💙Breadcrumb.Separator     (숨김)
└─ 💙Breadcrumb.Item          (비노출)   current=true

💙Breadcrumb.Item                variant: current
├─ current=false: Page          ← Text#3017:14      (TEXT) · 🔶InteractionLayer/Text (건드리지 않는다)
└─ current=true:  Selected Page ← page name#3017:17 (TEXT)
```

- 라벨은 💙Breadcrumb이 아니라 **각 💙Breadcrumb.Item instance**의 속성이다.
- Item 라벨 속성이 variant마다 다르다. `current=false`는 `Text#`, `current=true`는 `page name#`을 바꾼다. 다른 쪽을 바꾸면 화면에 반영되지 않는다.
- 마지막 Item(현재 위치)은 exposed가 아니다. `bc.children.filter(n => n.name === '💙Breadcrumb.Item').at(-1)`로 찾아 `page name#`을 바꾼다.
- 숨겨진 Item·Separator를 보이게 하는 BOOLEAN 속성은 없다. 경로를 늘리려면 해당 레이어 `visible = true` override(사다리 5번). 3단계 이하면 Ellipsis와 뒤 Separator를 숨긴다.

## 알려진 버그와 우회

- `size`의 sm 값이 `"\bsm"`이다(백스페이스 제어문자). 정의에서 읽은 값을 그대로 쓴다.
- Item 노출(visible)이 속성으로 연결되어 있지 않다. 위 override로 처리한다.

## Variant 선택 기준

| 속성    | 값    | 언제                                                               |
| ------- | ----- | ------------------------------------------------------------------ |
| size    | sm    | 고밀도 페이지·사이드바·패널처럼 공간이 제한된 곳, 조용한 위치 안내 |
|         | md    | 기본. 대부분의 페이지 상단 내비게이션                              |
|         | lg    | GNB·페이지 헤더처럼 주변 요소가 클 때, 버튼·탭과 크기 맞춤         |
|         | xl    | 페이지 타이틀 바로 아래 등 위치 파악이 중요한 대형 레이아웃        |
| current | false | 선택 가능한 일반 경로 항목                                         |
| (Item)  | true  | 현재 위치. 색·굵기로 구분                                          |

## Guidelines

1. **시작과 끝은 항상 노출.** 4단계 이상이면 중간 경로를 `…`(Ellipsis)로 축약하되 최상위 경로와 현재 위치는 남긴다. 공간이 부족해도 최상위 경로를 축약하지 않는다.
2. **현재 위치는 구분하고 링크를 걸지 않는다.** 마지막 항목은 색을 달리해 클릭 불가로 보이게 한다. 자기 자신으로 가는 링크를 걸지 않는다.

## Usecase

- 경로 3단계 이하: 모든 경로를 노출.
- 경로 4단계 이상: 중간 경로를 Breadcrumb.Ellipsis로 축약.
