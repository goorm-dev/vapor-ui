---
component: InputGroup
page: '❖ InputGroup (47458:666)'
reviewedAt: 2026-10-01
---

# InputGroup

입력 필드에 글자 수 같은 보조 요소를 함께 배치해 입력을 돕는다. TextInput 또는 Textarea와 결합해 쓴다.

## 컴포넌트와 key

| 이름                   | 종류                       | key                                        | 용도                                            |
| ---------------------- | -------------------------- | ------------------------------------------ | ----------------------------------------------- |
| 💙InputGroup           | COMPONENT                  | `e30f2d2b6eeb6de6dead47a9b18280cfc660e3e9` | 배치하는 컴포넌트 (입력 + 카운터)               |
| 🟨InputGroup/SlotLayer | COMPONENT_SET (2 variants) | `d8c2af93489fa9c295fc27ba056dd267a986cabe` | 입력 슬롯. `type`으로 TextInput / Textarea 전환 |
| 💙InputGroup.Counter   | COMPONENT                  | `1c883146deb7ec352db40b92e91788f82008887e` | 글자 수 카운터 (`00/30`)                        |

## 구조 — 어디를 바꾸나

```
💙InputGroup                     속성 없음
├─ 🟨InputGroup/SlotLayer        (exposed)  variant: type ("textinpput" · "textarea")
│  └─ 💙TextInput | 💙Textarea   (exposed)  속성은 text-input.md / textarea.md
└─ 💙InputGroup.Counter          (비노출)
   └─ 00/30        (TEXT, 속성 없음)
```

- 입력 종류는 **🟨InputGroup/SlotLayer의 `type`**으로 바꾼다. placeholder·size·상태는 그 안 💙TextInput/💙Textarea instance 속성이다.
- 카운터 텍스트는 TEXT 속성이 없다. `ig.findOne(n => n.name === '💙InputGroup.Counter').findOne(n => n.type === 'TEXT')`의 `characters`를 직접 바꾼다(사다리 5번, 폰트 로드 후).

## 알려진 버그와 우회

- SlotLayer `type` 값 오타: `"textinpput"`(p 두 개). 정의에서 읽은 값을 그대로 쓴다.
- **카운터 텍스트 속성 없음**: `00/30` 텍스트 레이어가 어떤 TEXT 속성과도 연결되지 않는다. 위처럼 `characters`를 override한다.

## Variant 선택 기준

| 속성 (SlotLayer) | 값         | 언제         |
| ---------------- | ---------- | ------------ |
| type             | textinpput | 한 줄 입력   |
|                  | textarea   | 여러 줄 입력 |

- 페이지 Anatomy & Variants에 variant 의미 설명은 없다. 위는 슬롯 내용 기준이다.

## Guidelines

1. **Field와 함께 쓴다.** 카운트는 입력을 보조하는 요소라 입력 필드와 하나의 그룹으로 보여야 한다. Field 컴포넌트와 함께 써서 입력 항목을 명확히 한다.

## Usecase

- 텍스트 길이 제한이 있는 입력: 사용자가 길이를 의식하며 써야 할 때.
