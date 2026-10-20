---
component: Tabs
page: '❖ Tabs (33159:1050)'
reviewedAt: 2026-10-01
---

# Tabs

같은 맥락 안에서 여러 콘텐츠 섹션을 전환하게 한다.

## 컴포넌트와 key

| 이름                    | 종류                        | key                                        | 용도                                                           |
| ----------------------- | --------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| 💙Tabs                  | COMPONENT_SET (32 variants) | `ed108ce61888e1d3756fd94656731c203ed932cd` | 배치하는 컴포넌트 (Tabs.Button ×5)                             |
| Tabs.Button             | COMPONENT_SET (2 variants)  | `fb1479d01247a948d581000992931039577dcba7` | 탭 하나. 💙 접두사 없음 (Tabs 안에 exposed instance)           |
| 🟨Tabs.Button/SlotLayer | COMPONENT_SET (2 variants)  | `154825e81aaf35f088ad3d58c501a4011f898863` | 라벨·아이콘·선택 상태 슬롯 (Tabs.Button 안에 exposed instance) |

`🟨Tabs.Button/SlotLayerselected`(`987859b6e53fbf1727ff2ed257085e181e57c150`)는 선택 표시용 내부 파트다. 직접 쓰지 않는다.

## 구조 — 어디를 바꾸나

```
💙Tabs                           variant: size · orientation · variant · disabled
└─ Tabs.Button  ×5               (exposed) variant: disabled
   └─ 🟨Tabs.Button/SlotLayer    (exposed) variant: selected (첫 번째만 true)
      ├─ 🔶InteractionLayer/Light (exposed) 건드리지 않는다
      ├─ ❤️SlotIcon  ← LeadingIcon#33159:5  (INSTANCE_SWAP) · 보임 = hasLeadingIcon#33159:6 (BOOLEAN)
      ├─ Nav Item    (TEXT 레이어, 속성 없음) 라벨
      └─ ❤️SlotIcon  ← TrailingIcon#33159:7 (INSTANCE_SWAP) · 보임 = hasTrailingIcon#33159:8 (BOOLEAN)
```

- 아이콘·선택 상태는 💙Tabs도 Tabs.Button도 아니라 **각 탭의 🟨Tabs.Button/SlotLayer instance**의 속성이다.
- 선택 탭을 바꾸려면 SlotLayer의 `selected`를 옮긴다(기존 true → false, 대상 → true).
- 탭 개수는 5개 고정이다. 줄이려면 남는 Tabs.Button의 `visible = false`(사다리 5번).

## 알려진 버그와 우회

- **라벨 텍스트 속성 없음**: 라벨 레이어 `Nav Item`이 TEXT 속성과 연결되지 않았다. 각 🟨Tabs.Button/SlotLayer 안의 `Nav Item` TEXT 노드 `characters`를 직접 바꾼다(사다리 5번, 폰트 로드 후).
- 탭 컴포넌트 이름 `"Tabs.Button "`(끝 공백, 💙 접두사 없음). 이름 비교는 `trim()` 후에.
- 문서에는 모양이 `line · plain · fill` 세 가지로 적혀 있지만 `variant` 속성 값은 `line | fill`뿐이다. plain은 Figma에 없다.
- 선택 표시 파트 이름이 `🟨Tabs.Button/SlotLayerselected`(구분자 없이 붙음).

## Variant 선택 기준

| 속성        | 값         | 언제                                                                    |
| ----------- | ---------- | ----------------------------------------------------------------------- |
| size        | sm         | 공간이 제한된 영역, 보조 UI                                             |
|             | md         | 기본. 일반적인 콘텐츠 전환                                              |
|             | lg         | 주요 네비게이션 영역 등 강조가 필요할 때                                |
|             | xl         | 시각적 집중이 필요한 대시보드·대형 화면                                 |
| variant     | line       | 하단 가로 구분선 포함. 아래 콘텐츠와 시각적으로 분리할 때               |
|             | fill       | 배경색 채움. 시각적 강조가 필요할 때                                    |
| orientation | horizontal | 기본. 페이지 상단 배치                                                  |
|             | vertical   | 세로 탭이 필요한 레이아웃                                               |
| disabled    | true       | 탭 그룹 전체 비활성(선택·키보드 불가). 개별 탭은 Tabs.Button `disabled` |
| selected    | true       | (SlotLayer) 현재 활성 탭. 색·라인으로 다른 탭과 명확히 구분             |

## Guidelines

1. **탭은 2~5개.** 핵심 그룹 3~4개를 권장한다. 6개 이상 나열하지 않는다. 모바일 스크롤 탭에서는 활성 탭이 항상 화면 안에 완전히 보이게 한다.
2. **같은 위계의 콘텐츠에만.** 중요도가 같은 항목을 나열한다. 메인 메뉴와 하위 상세처럼 위계가 다른 콘텐츠를 탭으로 묶지 않는다.
3. **단일 계층 유지.** 탭 안에 탭을 중첩(Tabs > Tabs)하지 않는다. 하위 분류는 탭 내부에 필터 등을 조합한다.
4. **스크롤 인터랙션을 고려한다.** 상단 내비게이션 바로 아래 탭은 스크롤 시 상단 고정할 수 있다. 내비게이션 아래로 숨기지 않는다.
5. **콘텐츠 전환 용도로만.** 클릭 시 하단 콘텐츠 영역만 교체한다(로딩은 스켈레톤). 페이지 내 스크롤 이동이나 URL 이동에 쓰지 않는다. 페이지 이동은 NavigationMenu.

## Usecase

- 기본 탭은 선택된 상태로 진입한다. 첫 번째 탭을 기본으로 권장.
- 라벨은 짧고 명확한 명사형. 2줄이 되지 않게.
- 라벨 앞 아이콘: 인지 속도를 높일 때. 모든 항목에 의미 없는 아이콘을 똑같이 달지 않는다.
- Badge: Tabs.Button에 포함된 항목 수를 표시.
