---
component: Callout
page: '❖ Callout (32800:854)'
reviewedAt: 2026-10-01
---

# Callout

사용자 액션에 대한 피드백이나 서비스 메시지를 제공한다.

## 컴포넌트와 key

| 이름                | 종류                       | key                                        | 용도                                                           |
| ------------------- | -------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| 💙Callout           | COMPONENT_SET (6 variants) | `52743fcc6e6e192592878e3ac8614b3283553766` | 배치하는 컴포넌트                                              |
| 🟨Callout/SlotLayer | COMPONENT                  | `5ace610b8dc867f2efb062f5890c04e7f3cc6898` | 아이콘·메시지 슬롯 (Callout 안에 exposed instance로 들어 있음) |
| 💙Callout.Icon      | COMPONENT                  | `0d3ee588b7e3a87c2bcff8686563b4c808d9da4a` | 기본 좌측 아이콘 (InfoCircle)                                  |

## 구조 — 어디를 바꾸나

```
💙Callout                        variant: colorPalette
└─ 🟨Callout/SlotLayer           (exposed)
   ├─ 💙Callout.Icon  ← LeadingIcon#39885:5 (INSTANCE_SWAP) · 보임 = hasLeadingIcon#39885:7 (BOOLEAN)
   └─ Callout         (TEXT, 속성 없음) 메시지
```

- 아이콘은 **안쪽 🟨Callout/SlotLayer instance**에서 `hasLeadingIcon#`을 켜고 `LeadingIcon#`에 아이콘 컴포넌트 id를 넣는다.
- 메시지 텍스트에는 TEXT 속성이 없다. SlotLayer 안 `Callout` 텍스트 레이어의 `characters`를 직접 바꾼다(사다리 5번, 폰트 로드 후). 2줄(제목+설명)이 필요하면 SlotLayer를 로컬 컴포넌트로 swap한다(사다리 4번).

## 알려진 버그와 우회

- **메시지 텍스트 속성 없음**: `Callout` 텍스트 레이어가 어떤 TEXT 속성과도 연결되지 않는다. 위처럼 `characters`를 override한다.
- 페이지 문서는 "Callout/slot을 with Icon으로 교환"이라고 하지만 페이지에 `with Icon` 컴포넌트는 없다. 실제로는 `hasLeadingIcon#` BOOLEAN으로 켠다.

## Variant 선택 기준

| colorPalette | 언제                                      |
| ------------ | ----------------------------------------- |
| primary      | 주요 정보                                 |
| success      | 성공·완료 관련 정보                       |
| warning      | 주의가 필요한 정보                        |
| danger       | 경고성 정보. warning보다 위험도가 높을 때 |
| contrast     | 배경과 대조시켜 정보를 강조할 때          |
| hint         | 일반 정보                                 |

## Guidelines

1. **닫을 수 없다.** 안내·경고 위계라 닫기 버튼을 두지 않는다.
2. **border를 유지한다.** 접근성 대비 3:1을 위해 border가 있다. 컴포넌트 그대로 쓰고 border를 제거하지 않는다.

## Usecase

- 아이콘 변경: 메시지 성격에 맞는 아이콘으로 바꿔 쓸 수 있다.
- 2줄 구성: 한 줄로 줄이기 어려우면 제목과 설명 두 줄로. 무리한 축약보다 온전한 문장.
