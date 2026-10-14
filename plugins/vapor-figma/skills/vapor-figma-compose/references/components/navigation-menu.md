---
component: NavigationMenu
page: '❖ NavigationMenu (956:907)'
reviewedAt: 2026-10-01
---

# NavigationMenu

여러 콘텐츠 섹션 사이를 오가게 하는 내비게이션이다. 누르면 페이지가 이동한다.

## 컴포넌트와 key

| 이름                           | 종류                       | key                                        | 용도                                            |
| ------------------------------ | -------------------------- | ------------------------------------------ | ----------------------------------------------- |
| 💙NavigationMenu               | COMPONENT                  | `ac6e74f3b6267495b8837ccc796bac4c27c1e7da` | 배치하는 컴포넌트 (list 하나를 감싼 루트)       |
| 💙NavigationMenu.list          | COMPONENT_SET (8 variants) | `bdf712f0c319f43e09da694edac07eeca5842624` | 항목 목록 (size · orientation)                  |
| 💙NavigationMenu.Link          | COMPONENT_SET (9 variants) | `3812f4c1caa3e0965802e0018d4900462f8419f8` | 페이지 이동 링크 항목                           |
| 💙NavigationMenu.Trigger       | COMPONENT_SET (2 variants) | `a056e50b6134dc3ba848c958b3688f0b0fbb3b07` | 하위 패널을 여는 항목 (⌄ 아이콘)                |
| 💙NavigationMenu.Content       | COMPONENT                  | `2cdb507c52f4afdfbc37b25803552d2f021b50ef` | Trigger가 여는 패널 (💙Popover 기반)            |
| 💙NavigationMenu.group         | COMPONENT                  | `3a6760cd5860768bd2fa104463cd3dd982b2d7f8` | GroupLabel + list (레거시 list 참조, 아래 버그) |
| 💙NavigationMenu.GroupLabel    | COMPONENT                  | `a99f8d8ffebab98a46a152628e93c2c7018be71a` | 그룹 제목                                       |
| 🟨NavigationMenuItem/SlotLayer | COMPONENT_SET (2 variants) | `fb3ea8f064a7b8e17e77b5555c9c719e15a2d45b` | list 안 각 항목 자리 (Link ↔ Trigger 전환)      |
| 🟨NavigationMenu/SlotLayer     | COMPONENT                  | `f79fd699be3cb40d6ece5a472b15061f22cc3d6d` | Link 내용 (라벨 + 아이콘)                       |
| 🟨NavigationMenu/SlotLayer     | COMPONENT_SET (4 variants) | `72aaa37c589365ed35c6486ad870af4494bafc0c` | Trigger 내용 (라벨 + 아이콘 + ⌄)                |

## 구조 — 어디를 바꾸나

```
💙NavigationMenu                          속성 없음
└─ 💙NavigationMenu.list                  (exposed) variant: size · orientation
   └─ 🟨NavigationMenuItem/SlotLayer ×5   (exposed) variant: type (Link | Collapsible.Trigger)
      ├─ type=Link
      │  └─ 💙NavigationMenu.Link         (exposed) variant: disabled · current · align
      │     ├─ 🔶InteractionLayer/Light   건드리지 않는다
      │     └─ Content = 🟨NavigationMenu/SlotLayer (comp, exposed)
      │        ├─ ❤️SlotIcon ← LeadingIcon#31044:1 (INSTANCE_SWAP) · 보임 = hasLeadingIcon#31562:6 (BOOLEAN)
      │        └─ Nav Item   ← Text#31562:8 (TEXT) 라벨
      └─ type=Collapsible.Trigger
         ├─ 💙NavigationMenu.Trigger      (exposed) variant: disabled
         │  └─ 🟨NavigationMenu/SlotLayer (set, exposed) variant: size
         │     ├─ ❤️SlotIcon ← LeadingIcon#35154:5 (INSTANCE_SWAP) · 보임 = hasLeadingIcon#35154:0 (BOOLEAN)
         │     ├─ Nav Item   (TEXT 레이어, 속성 없음) 라벨
         │     └─ ❤️ChevronDownOutlineIcon
         └─ 💙NavigationMenu.Content      보임 = hasPanel#35052:0 (BOOLEAN, ItemSlotLayer)
            └─ 💙Popover
```

- 항목 수는 list 안 🟨NavigationMenuItem/SlotLayer 5개 고정이다. 줄이려면 instance를 `visible = false`, 늘리려면 로컬 컴포넌트로 list 대체를 검토한다.
- **Link 라벨**은 Link 안 `Content` 레이어(🟨NavigationMenu/SlotLayer COMPONENT)의 `Text#…`. 레이어 이름이 `Content`라서 🟨 이름으로 찾으면 안 잡힌다. `link.findOne(n => n.type === 'INSTANCE' && Object.keys(n.componentProperties).some(k => k.startsWith('Text#')))`.
- **Trigger 라벨**은 TEXT 속성이 없다 → Trigger 안 🟨NavigationMenu/SlotLayer(set)의 `Nav Item` `characters` 직접 수정(사다리 5번).
- 현재 페이지는 해당 Link의 `current=true`.

## 알려진 버그와 우회

- `🟨NavigationMenu/SlotLayer` 이름이 COMPONENT(Link용, TEXT 속성 있음)와 COMPONENT_SET(Trigger용, TEXT 속성 없음) 두 개에 쓰인다. key·속성으로 구분한다.
- Trigger 라벨에 TEXT 속성이 없다(위 우회).
- 레거시 중복: 💙NavigationMenu.group 안의 `💙NavigationMenu.list` instance는 페이지에 없는 다른 컴포넌트(key `30027c926ad53074c1cd2bc8c4d49f0474f54ad6`)를 바라본다. 현행 list(`bdf712f0…`)와 다르다. 그룹이 필요하면 GroupLabel + 현행 list로 로컬 컴포넌트를 만든다.
- `hasPanel#35052:0`은 `type=Link` variant에서는 어떤 레이어와도 연결되지 않는다. `type=Collapsible.Trigger`에서만 Content 보임을 제어한다.
- 이름 대소문자가 섞여 있다: `.list`, `.group`(소문자) vs `.Link`, `.Trigger`, `.GroupLabel`.

## Variant 선택 기준

| 속성                    | 값                    | 언제                                             |
| ----------------------- | --------------------- | ------------------------------------------------ |
| size (list)             | sm                    | 모바일·제한된 공간, 아이콘 중심 최소 UI          |
|                         | md                    | 일반 웹·앱 기본                                  |
|                         | lg                    | 대형 화면, 주요 메뉴 강조, 넉넉한 클릭/터치 영역 |
|                         | xl                    | 멀리서도 인식해야 하거나 터치 조작               |
| orientation (list)      | horizontal            | 화면 상단 가로 배치, 주요 메뉴 탐색              |
|                         | vertical              | 화면 좌측 세로 배치, 계층 구조나 많은 항목       |
| disabled (Link·Trigger) | true                  | 상호작용 불가                                    |
| current (Link)          | true                  | 현재 페이지. 사용자의 현재 위치 강조             |
| align (Link)            | center · left · right | 항목 내용 정렬                                   |
| type (ItemSlotLayer)    | Link                  | 페이지 이동                                      |
|                         | Collapsible.Trigger   | 하위 메뉴 패널을 여는 항목                       |

## Guidelines

1. **서비스 위계에 맞는 논리적 순서.** 비즈니스 중요도·사용 빈도 순으로, 가장 자주 찾는 핵심 카테고리를 좌측 또는 상단에 둔다.
2. **페이지 간 '이동'에만 쓴다.** 새 페이지로 가거나 URL이 바뀔 때 쓴다. 같은 페이지 안에서 콘텐츠만 바꾸거나 필터링하면 Tabs를 쓴다.

## Usecase

- 기본 형태: 텍스트만으로 위치 전달.
- 좌측 아이콘: 텍스트 앞 아이콘으로 시각적 힌트.
- 팝오버 형태: 단순 링크가 아니라 여러 옵션을 담아야 하면 NavigationMenu.Trigger로 하위 메뉴(Content)를 연다.
