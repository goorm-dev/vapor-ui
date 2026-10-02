---
component: TextInput
page: '❖ TextInput (34413:14198)'
reviewedAt: 2026-10-01
---

# TextInput

한 줄의 짧은 텍스트를 입력받는 필드다.

## 컴포넌트와 key

| 이름                  | 종류                        | key                                        | 용도                                                             |
| --------------------- | --------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| 💙TextInput           | COMPONENT_SET (16 variants) | `c2997cf93bb259beb7d9de15a290f453cec4e4f0` | 배치하는 컴포넌트                                                |
| 🟨TextInput/SlotLayer | COMPONENT_SET (2 variants)  | `dd827a126312f4e8926f99a1f020d577d80bed72` | 텍스트·아이콘 슬롯 (TextInput 안에 exposed instance로 들어 있음) |

- 라벨·도움말이 붙는 입력은 💙TextInput을 직접 두지 말고 **💙Field(`type=TextInput`)로 감싼다**(field.md). 검색에 나오는 `💙TextInput.Field (deprecated)`, `🟣TextInputPattern`은 쓰지 않는다.

## 구조 — 어디를 바꾸나

```
💙TextInput                    variant: size · disabled · invalid · readOnly
├─ 🔶InteractionLayer/Field    (exposed) 건드리지 않는다
└─ 🟨TextInput/SlotLayer       (exposed) variant: value (false=placeholder | true=입력값)
   ├─ ❤️SlotIcon  ← LeadingIcon#34741:3  (INSTANCE_SWAP) · 보임 = deprecated(hasLeadingIcon)#34741:0 (BOOLEAN)
   ├─ Placeholder ← Text#31108:0         (TEXT)
   └─ ❤️SlotIcon  ← TrailingIcon#34741:9 (INSTANCE_SWAP) · 보임 = deprecated(hasTrailingIcon)#34741:6 (BOOLEAN)
```

- 텍스트·아이콘·`value`는 💙TextInput이 아니라 **안쪽 🟨TextInput/SlotLayer instance**의 속성이다. `input.findOne(n => n.type === 'INSTANCE' && n.name === '🟨TextInput/SlotLayer').setProperties({...})`.
- 아이콘은 `deprecated(hasLeadingIcon)#`을 `true`로 켠 뒤 `LeadingIcon#`에 아이콘 컴포넌트 id를 넣는다.

## 알려진 버그와 우회

- 아이콘 표시 BOOLEAN 이름이 `deprecated(hasLeadingIcon)#…`, `deprecated(hasTrailingIcon)#…`다. 이름은 deprecated지만 현재 ❤️SlotIcon의 `visible`에 연결된 유일한 토글이다. 페이지 문서의 `hasLeading`/`hasTrailing`과 이름이 다르니 `startsWith('deprecated(hasLeadingIcon)')`로 찾는다.
- 페이지 소개 문구가 "프로필 이미지 혹은 텍스트를 UI 상에 나타냅니다"로 Avatar 문구가 잘못 들어가 있다. 이 파일의 한 줄 설명은 Usecase 문구로 대신했다.
- 조합 16개만 있다(속성 4개 조합 32개 중). 없는 조합은 `setProperties`가 실패한다. variant 이름 목록을 먼저 읽어 확인한다.

## Variant 선택 기준

| 속성                           | 값   | 언제                             |
| ------------------------------ | ---- | -------------------------------- |
| size                           | sm   | 고밀도의 작은 공간               |
|                                | md   | 기본 입력 필드                   |
|                                | lg   | 공간이 넓거나 강조할 때          |
|                                | xl   | 가장 큰 사이즈. 강조가 필요할 때 |
| invalid                        | true | 필수 항목 누락·잘못된 입력       |
| readOnly                       | true | 수정은 불가, 읽기·복사는 허용    |
| disabled                       | true | 상호작용 불가                    |
| value (SlotLayer, 디자인 전용) | true | 텍스트가 입력된 상태 표시        |

## Guidelines

1. **Label로 무엇을 입력할지 알린다.** Label은 명사형으로 input 위에 항상 보이게 고정한다. Label과 겹치면 placeholder는 비운다. Placeholder를 label 대신 쓰지 않는다(입력 시작 시 사라진다).
2. **버튼 위치는 액션의 시급성에 맞춘다.** 검색·등록처럼 즉시 실행은 필드 우측(Inline), 로그인·가입처럼 여러 필드 입력 후 제출은 필드 하단(Stacked). Inline 버튼은 높이를 필드와 같게 맞춘다.
3. **정보의 연관성에 따라 배열한다.** 기본은 수직으로 쌓는다. 날짜 범위·주소처럼 강하게 연결된 필드는 수평으로 묶는다.
4. **검색창은 '~하세요' 형태의 대화형 문구.** 라벨 없이 단독으로 쓰는 검색 인풋은 구체적인 행동을 제안하는 문장형 placeholder를 쓴다.

## Usecase

- 이름·전화번호·검색어 등 한 줄짜리 짧은 값. 문장 단위 긴 글은 Textarea.
- 입력값이 복잡하거나 양식이 정해져 있으면 placeholder에 실제 예시 값을 넣는다.
- 수정은 불가하지만 내용을 보여줘야 하면 disabled가 아니라 readOnly.
