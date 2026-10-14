---
component: Field
page: '❖ Field (34419:32188)'
reviewedAt: 2026-10-01
---

# Field

폼 요소에 라벨, help text, 유효성 검사 메시지를 붙인다.

## 컴포넌트와 key

| 이름                          | 종류                       | key                                        | 용도                                                              |
| ----------------------------- | -------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| 💙Field                       | COMPONENT                  | `5df009b6efdda299cd4909d6a7c3c0abd6fae1e1` | 배치하는 컴포넌트 (Label + 입력 슬롯 + Description·Success·Error) |
| 💙Field.label                 | COMPONENT                  | `d4cfbeb5a835abdeb54aca3cabf0352012e82ae8` | 라벨 + 입력 슬롯만 필요할 때                                      |
| 💙Field.Description           | COMPONENT                  | `33f226dbdd62d7343275fd30bb22f93d44569004` | help text                                                         |
| 💙Field.Success               | COMPONENT                  | `3415fbcb3b29bf23db72dfed12042ed52c0a5309` | 성공 메시지                                                       |
| 💙Field.Error                 | COMPONENT                  | `441f9141d462ed76c039194519c73d3527736aa0` | 에러 메시지                                                       |
| 🟨Field.Label/SlotLayer       | COMPONENT_SET (3 variants) | `9bcb2f3ab3ca0a9fbf9ba8768457dfb66dc12937` | 라벨 위치(`side`) + 입력 슬롯 묶음                                |
| 🟨Field.Label/SlotLayer       | COMPONENT                  | `cc121e6c4fe2c8d0bcdaa61a1776eec648032461` | 라벨 텍스트 + 필수 표시(`*`)                                      |
| 🟨Field/SlotLayer             | COMPONENT_SET (9 variants) | `7d8b261c6665031524a0bbe5f8131088898d3ed2` | 입력 컨트롤 자리 (`type`으로 프리셋 선택 또는 swap)               |
| 🟨Field.Description/SlotLayer | COMPONENT                  | `2ac03b81b08d6aa52c6caf1a31ae9cb430fd4a57` | Description 텍스트 + 아이콘                                       |
| 🟨Field.Success/SlotLayer     | COMPONENT                  | `cef049a42fdcbb66f1b22c8e81b41c8afdd08336` | Success 텍스트 + 아이콘                                           |
| 🟨Field.Error/SlotLayer       | COMPONENT                  | `db0772cf168a8b609f23ca83a66a8e5f7a61f3c1` | Error 텍스트 + 아이콘                                             |

## 구조 — 어디를 바꾸나

```
💙Field                                 속성 없음
├─ 🟨Field.Label/SlotLayer (set)         (exposed) variant: side (top · left · right)
│  ├─ 🟨Field.Label/SlotLayer (comp)     (exposed)
│  │  ├─ Label   (TEXT 레이어, 속성 없음) 라벨 문구
│  │  └─ *       보임 = required#36344:0 (BOOLEAN)
│  └─ 🟨Field/SlotLayer                  (exposed) variant: type → 입력 컨트롤 자리
├─ 💙Field.Description                   (exposed)
│  └─ 🟨Field.Description/SlotLayer      (exposed)
│     ├─ ❤️InfoCircleIcon   보임 = hasLeadingIcon#34419:0 (BOOLEAN)
│     └─ Description (TEXT 레이어, 속성 없음)
├─ 💙Field.Success                       (exposed)
│  └─ 🟨Field.Success/SlotLayer          (exposed)
│     ├─ ❤️CheckCircleIcon  보임 = hasLeadingIcon#34420:1 (BOOLEAN)
│     └─ Success (TEXT 레이어, 속성 없음)
└─ 💙Field.Error                         (exposed)
   └─ 🟨Field.Error/SlotLayer            (exposed)
      ├─ ❤️InfoCircleIcon   보임 = hasLeadingIcon#34420:2 (BOOLEAN)
      └─ Error (TEXT 레이어, 속성 없음)
```

- 라벨·Description·Success·Error 문구는 **TEXT 속성이 없다.** 각 🟨…/SlotLayer 안의 TEXT 레이어(`Label`, `Description`, `Success`, `Error`)의 `characters`를 직접 바꾼다(사다리 5번, 폰트 로드 필요).
- 필수 표시는 안쪽 🟨Field.Label/SlotLayer **COMPONENT** instance의 `required#…`다. 바깥 set instance(`side`)와 이름이 같으니 `componentProperties`에 `required#`로 시작하는 키가 있는 쪽을 고른다.
- 입력 컨트롤은 🟨Field/SlotLayer의 `type`(TextInput·Select·Textarea·Switch 등)으로 고르거나, 해당 💙컴포넌트로 swap한다.
- 쓰지 않는 Description·Success·Error는 instance를 `visible = false`로 숨긴다.

## 알려진 버그와 우회

- 🟨Field/SlotLayer `type`의 checkbox 값이 `"\bcheckbox"`다(백스페이스 제어문자). 정의에서 읽은 값을 그대로 쓴다.
- `🟨Field.Label/SlotLayer`라는 이름이 COMPONENT_SET(`side`)과 그 안의 COMPONENT(`required`) 두 개에 쓰인다. 이름이 아니라 key·속성으로 구분한다.
- 공개 컴포넌트 이름이 `💙Field.label`(소문자 l)이다. 다른 파트는 `Label`. 검색은 대소문자 무시로 한다.
- **SlotLayer 프리셋의 미리보기 패딩·배경**: 🟨Field/SlotLayer `type=TextInput`·`type=Switch` 등에 미리보기용 패딩(위아래 16, 좌우 24)과 배경 fill이 남아 있다. 그대로 두면 입력이 안으로 들여 써진다. 그 instance에 패딩 0, `fills = []`, `layoutSizingHorizontal = 'FILL'`.
- **Label 슬롯 너비 고정**: 🟨Field.Label/SlotLayer가 HUG 288px로 고정돼 바깥 Field를 FILL로 늘려도 따라 늘지 않는다. 그 instance에도 `layoutSizingHorizontal = 'FILL'`. `side=left`(라벨 왼쪽·컨트롤 오른쪽)는 `primaryAxisAlignItems = 'SPACE_BETWEEN'`, `counterAxisAlignItems = 'CENTER'`를 함께 준다.
- 💙Field의 `itemSpacing`이 0이라 입력과 Description 사이 간격이 없다. 라이브러리 기본값이니 그대로 두고 보고한다.

## Variant 선택 기준

| 속성                           | 값                                                                                                 | 언제                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------- |
| side (🟨Field.Label/SlotLayer) | top                                                                                                | 기본. 라벨을 입력 위에  |
|                                | left                                                                                               | 라벨을 입력 왼쪽에      |
|                                | right                                                                                              | 라벨을 입력 오른쪽에    |
| type (🟨Field/SlotLayer)       | default · TextInput · Select · Textarea · Switch · `\bcheckbox` · Radio · Multiselect · InputGroup | 들어갈 입력 컨트롤 종류 |

## Guidelines

1. **Field 하나에 입력 목적 하나.** 여러 정보를 한 Field에 입력하도록 요구하지 않는다.
2. **입력 형식을 미리 안내한다.** 형식·조건을 사전에 알린다. 입력 후 에러 메시지로만 규칙을 전달하지 않는다.
3. **Placeholder만으로 입력 목적을 설명하지 않는다.** Placeholder는 입력을 시작하면 사라진다. 목적은 항상 라벨로 준다.

## Usecase

- 라벨: 짧고 직관적인 문구. 접근성을 위해 항상 필드와 연결.
- 헬퍼 텍스트(Description): 입력 가이드·주의 사항. 보조 정보일 뿐 필수 정보를 대체하지 않는다.
- 성공 상태(Success): 올바르게 입력했음을 표시. 과도한 애니메이션·장식은 피한다.
- 에러 상태(Error): 구체적이고 즉각적인 피드백. "오류 발생" 대신 "이메일 형식이 올바르지 않습니다"처럼 해결 방법을 안내.
