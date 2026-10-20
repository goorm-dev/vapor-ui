---
component: Switch
page: '❖ Switch (32800:1415)'
reviewedAt: 2026-10-01
---

# Switch

이진 상태(on/off)를 전환하는 토글 방식 입력 요소다.

## 컴포넌트와 key

| 이름     | 종류                        | key                                        | 용도              |
| -------- | --------------------------- | ------------------------------------------ | ----------------- |
| 💙Switch | COMPONENT_SET (24 variants) | `000bdceb1e4302cd136c0aa34c5d423d53309564` | 배치하는 컴포넌트 |

## 구조 — 어디를 바꾸나

```
💙Switch                                  variant: size · checked · disabled · readOnly · invaild
└─ 🔶InteractionLayer/Normal/omitPressed  (exposed) 건드리지 않는다
```

- TEXT·BOOLEAN·INSTANCE_SWAP 속성이 없다. variant만 바꾼다(사다리 1번).
- 라벨 텍스트는 💙Switch에 포함돼 있지 않다. **라벨이 필요하면 💙Field(`type=Switch`, `side=left|right`)로 감싸는 게 표준 경로다**(field.md). Field를 쓸 수 없을 때만 Text Style을 쓴 로컬 텍스트를 auto-layout으로 붙인다.

## 알려진 버그와 우회

- invalid 속성 이름이 `invaild`(오타). 정의에서 읽은 이름을 그대로 쓴다: `Object.keys(defs).find(k => k.startsWith('inva'))`.
- 조합 24개만 있다(속성 5개 조합 48개 중). 없는 조합을 `setProperties`로 넣으면 실패한다. variant 이름 목록을 먼저 읽어 확인한다.

## Variant 선택 기준

| 속성     | 값   | 언제                                                      |
| -------- | ---- | --------------------------------------------------------- |
| size     | sm   | 모바일 등 공간 절약, 보조 설정                            |
|          | md   | 기본. 일반 설정 화면                                      |
|          | lg   | 주요 설정·중요한 토글                                     |
| checked  | true | 기능이 활성화(On)된 상태                                  |
| disabled | true | 조건 미충족·일시 제한으로 상호작용 불가                   |
| invaild  | true | 필수 항목 누락 등 유효하지 않은 상태                      |
| readOnly | true | 현재 값은 의미가 있지만 사용자가 직접 수정할 수 없는 상태 |

## Guidelines

1. **레이블은 상태가 아니라 기능을 설명한다.** '켜기/끄기' 같은 상태어 대신 제어 대상을 명사형으로(알림 설정, 방해 금지 모드). '알림 켜기'처럼 동사를 넣거나 질문형으로 쓰지 않는다.

## Usecase

- 상태 변경을 즉시 적용할 때만 쓴다. 저장·반영에 추가 조작이 필요하면 Checkbox나 Button이 맞다.
