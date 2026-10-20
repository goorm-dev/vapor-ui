---
component: Dialog
page: '❖ Dialog (32430:1897)'
reviewedAt: 2026-10-01
---

# Dialog

현재 페이지 위에 오버레이로 띄워 사용자가 주요 작업에 집중하게 한다.

## 컴포넌트와 key

| 이름                      | 종류                       | key                                        | 용도                                        |
| ------------------------- | -------------------------- | ------------------------------------------ | ------------------------------------------- |
| 💙Dialog                  | COMPONENT_SET (3 variants) | `8d3b8f457fd498e1789857600411cabf64c905a1` | 배치하는 컴포넌트 (dim 배경 포함 1440×1080) |
| 💙Dialog.Popup            | COMPONENT_SET              | `bd2cec866e0f9969c298f3635151b6cd84d4ce00` | 팝업 본체만 필요할 때                       |
| 🟨Dialog/SlotLayer        | COMPONENT                  | `7c413b024a21090e1027fb72a3e1a207bc4cddde` | Header·Body·Footer 안의 placeholder         |
| 🟨Dialog.Header           | COMPONENT_SET              | `008ff41d94d0fc659575bdcc3deffb2a01c4d045` | Header 슬롯 swap 대상 (제목 + close)        |
| 🟨Dialog.footer/SlotLayer | COMPONENT_SET              | `15d1dc489734a6e669e111a4232fd7562239a2ab` | Footer 슬롯 swap 대상 (버튼 2개)            |

## 구조 — 어디를 바꾸나

```
💙Dialog                         variant: size (md · lg · xl)
└─ 💙Dialog.Popup
   ├─ 💙Dialog.Header
   │  └─ 🟨Dialog/SlotLayer  → swap: 🟨Dialog.Header (close=true|false)
   │                               └─ 🟨Dialog.Header (중첩, 비노출) ← Text#38858:0 제목
   ├─ 💙Dialog.Body
   │  └─ 🟨Dialog/SlotLayer  → swap: 본문 로컬 컴포넌트
   └─ 💙Dialog.Footer
      └─ 🟨Dialog/SlotLayer  → swap: 🟨Dialog.footer/SlotLayer ("\bType": Default | Stacked)
                                     └─ 💙Button ×2 (속성은 button.md)
```

- 세 슬롯 모두 🟨Dialog/SlotLayer placeholder다. 사다리 4번(SlotLayer swap)으로 채운다.
- Body에는 라이브러리 swap 대상이 없다. 본문을 **로컬 컴포넌트로 만들어** swap한다. 텍스트는 Text Style(`body2` 등), 색은 토큰 변수.

## 알려진 버그와 우회

- **Header 제목 (variant마다 구조가 다르다)**: `close=false`는 swap한 instance의 `Text#38858:0`이 바로 제목에 연결된다. `close=true`에서는 바깥 속성이 텍스트와 연결되지 않고, 안쪽 **중첩 🟨Dialog.Header instance**의 같은 속성이 연결돼 있었다(2026-10-01 확인). 바깥에 먼저 넣고, 제목이 안 바뀌었으면 중첩 instance에 넣는다.
    ```js
    const setTitle = (inst, text) => {
        const k = Object.keys(inst.componentProperties).find((p) => p.startsWith('Text#'));
        inst.setProperties({ [k]: text });
    };
    setTitle(slot, '제목');
    const title = slot.findOne((n) => n.type === 'TEXT');
    if (title.characters !== '제목') {
        const nested = slot.findOne(
            (n) => n.type === 'INSTANCE' && n.name.includes('Dialog.Header'),
        );
        if (nested) setTitle(nested, '제목');
    }
    ```
- **placeholder 흔적**: swap한 세 instance에 회색 fill과 옅은 테두리가 남는다. `fills = []`, 테두리가 남으면 `strokes = []`.
- **Footer 속성 이름** `"\bType"`(백스페이스 제어문자). 정의에서 읽은 이름을 그대로 쓴다.
- **Footer 버튼 기본값**: 🟨Dialog.footer/SlotLayer 안 💙Button 2개는 `size=lg`, 왼쪽 `secondary`·오른쪽 `primary`(둘 다 fill)다. 삭제처럼 되돌릴 수 없는 확인은 오른쪽을 `colorPalette=danger`로 바꾼다(button.md Guideline 4).
- **Body 텍스트**: 본문은 Text Style `body2`, 색 `foreground/foreground-normal`로 만든 경우 검증을 통과했다(2026-10-01). 보조 문구가 따로 있으면 `foreground/foreground-hint` 계열을 실시간으로 찾아 쓴다.

## Variant 선택 기준

| size | 언제                                   |
| ---- | -------------------------------------- |
| md   | 기본. 일반 상황                        |
| lg   | 내용이 많거나 복잡할 때                |
| xl   | 넓은 공간이 필요한 정보 제공·편집 기능 |

Footer `"\bType"`: 버튼 문구가 길어 가로 배치가 어려우면 `Stacked`.

## Guidelines

1. **Footer 버튼은 우측 정렬.** 긍정(확인·저장)과 부정(취소) 버튼을 Footer 우측에 둔다. Description과 시선이 충돌하는 좌측 정렬은 피한다.
2. **닫기는 하나만.** Footer에 취소·닫기 버튼이 있으면 Header의 close 아이콘을 없앤다(🟨Dialog.Header `close=false`). 닫기 동작 버튼은 하나만 둔다.
3. **Popover와 구분한다.** Dialog는 화면을 dim으로 가리고 작업을 강제한다. 삭제·제출처럼 확인이 필수인 중요한 결정에 쓴다. 버튼을 눌러 부가 정보를 띄우는 것은 Popover다.

## Usecase

- 단순 정보 전달: '확인' 버튼 하나만.
- 모바일·시각 강조: Footer 버튼을 컨테이너 너비에 맞춰 fill.
- 긴 버튼 문구: 버튼을 세로로 쌓는 Stacked.
