---
component: SegmentedControl
page: '❖ SegmentedControl (31066:25326)'
reviewedAt: 2026-10-01
---

# SegmentedControl

버튼 토글 형태로, 상호 배타적인 2개 이상 옵션 중 하나를 선택하게 한다.

## 컴포넌트와 key

| 이름                        | 종류                       | key                                        | 용도                                |
| --------------------------- | -------------------------- | ------------------------------------------ | ----------------------------------- |
| 💙SegmentedControl          | COMPONENT_SET (6 variants) | `845449aff5854ea62d5a51a1af512d23023e3aa0` | 배치하는 컴포넌트 (native SLOT 7개) |
| 💙SegmentedControl.Item     | COMPONENT                  | `c9b8b3cb8890612d8ef277fe884b3c44dd7b8bf7` | 텍스트 항목 (💙Button 래핑)         |
| 💙SegmentedControl.IconItem | COMPONENT                  | `3f31f8d0111833cdef4a3db2cd939c5cdf836f2d` | 아이콘 항목 (💙IconButton 래핑)     |

## 구조 — 어디를 바꾸나

```
💙SegmentedControl               variant: size (lg · md · sm) · disabled
├─ Slotlayer   ← Slotlayer#41930:0   (native SLOT, 기본 비어 있음)
├─ Slotlayer2  ← Slotlayer2#41930:42
├─ Slotlayer3  ← Slotlayer3#41930:7
├─ … Slotlayer7 ← Slotlayer7#41930:35
   └─ (넣을 것) 💙SegmentedControl.Item | 💙SegmentedControl.IconItem

💙SegmentedControl.Item
└─ 💙Button                      (비노출) size=md · colorPalette=secondary · variant=outline
   ├─ 🔶InteractionLayer/Normal  건드리지 않는다
   └─ 🟨Button/SlotLayer         (exposed) taxt#42854:26 (TEXT) 라벨 · LeadingIcon#/TrailingIcon# · hasLeadingIcon#/hasTrailingIcon#

💙SegmentedControl.IconItem
└─ 💙IconButton                  (비노출) size=md · colorPalette=secondary · variant=outline · shape=square
   └─ 🟨IconButton/SlotLayer     (exposed) Icon#31044:0 (INSTANCE_SWAP)
```

- 💙SegmentedControl은 SlotLayer swap이 아니라 **Figma native SLOT 속성** 7개(`Slotlayer…#41930:…`)를 쓴다. default variant에서 7개 슬롯 모두 비어 있다. 슬롯에 Item/IconItem instance를 넣는다. 넣는 방법은 조립 직전 실시간으로 확인한다.
- 라벨은 Item의 **중첩 💙Button 안 🟨Button/SlotLayer**의 `taxt#` 속성이다(button.md). 💙Button이 비노출이므로 `item.findOne(n => n.type === 'INSTANCE' && n.name === '🟨Button/SlotLayer')`로 찾는다.
- 선택된 항목 표시 속성(`value`)은 Figma에 없다(문서에 Design Only로만 언급).

## 알려진 버그와 우회

- Item 라벨 속성 이름이 Button 그대로 `taxt#42854:26`(오타). `startsWith('taxt#')`로 찾는다.
- SLOT 속성 이름 `Slotlayer`(소문자 l), 번호 없는 첫 슬롯 + `Slotlayer2`~`Slotlayer7`. ID 순서와 레이어 순서가 다르다(`Slotlayer2#41930:42`가 레이어상 두 번째). 레이어 이름으로 찾는다.
- 문서 size 설명은 "sm, md, lg, xl"이라 적혀 있지만 값은 `lg | md | sm`뿐이다. 기본값은 `lg`.
- **SLOT 채우기**: `sc.findAll(n => n.type === 'SLOT')`의 레이어 순서대로 💙SegmentedControl.Item instance를 `appendChild`한다. 넣은 뒤 노드 id가 `I<sc>;…` 형태로 바뀌므로 라벨 수정은 `slot.children[0]`에서 다시 찾는다.
- **빈 SLOT이 회색 칸으로 남는다**: SLOT이 7개라 3개만 쓰면 나머지 4개가 회색 placeholder로 보이고 너비를 차지한다(510px → 숨기면 174px). 빈 SLOT에 `visible = false`.
- **선택 상태 속성이 없다**: 💙SegmentedControl.Item에 속성이 없다. 검증에서 쓴 우회: 선택 항목은 중첩 💙Button을 기본값 `outline`(흰 배경)으로 두고, 나머지는 `variant`를 `"\bghost"`로 바꾼다(중첩 instance variant override).

## Variant 선택 기준

| 속성     | 값   | 언제                                            |
| -------- | ---- | ----------------------------------------------- |
| size     | sm   | 테이블·리스트 같은 고밀도 공간, 보조 기능       |
|          | md   | 범용. 중요도 중간의 선택 영역                   |
|          | lg   | 강조가 필요한 주요 선택 영역 (Figma 기본값)     |
| disabled | true | 비활성. 조건 미충족·일시 제한으로 상호작용 불가 |

## Guidelines

1. **선택지는 2~5개.** 데스크톱 2~5개, 모바일 최대 4개 권장. 8개 이상이면 Select·Radio를 쓴다.
2. **상호 배타적 선택지.** 겹치지 않는 독립 옵션으로 구성. 여러 항목 동시 선택에는 쓰지 않는다.
3. **레이블은 짧고 균형 있게.** 모든 항목 라벨 길이를 비슷하게. 특정 항목만 길게 쓰지 않는다.
4. **화면 전환 탭으로 쓰지 않는다.** 같은 화면 안 콘텐츠의 필터·정렬 용도. 페이지 이동은 Tabs·내비게이션.

## Usecase

- 뷰 전환: 같은 콘텐츠를 리스트/그리드로.
- 콘텐츠 필터링: 상태·카테고리별 고정 필터. 라벨 길이를 비슷하게, 모두 같은 너비로.
- 기간 범위 선택: 차트·통계의 일/주/월/년 전환.
- 타입·모드 선택: 동등한 위계의 타입이나 모드.
