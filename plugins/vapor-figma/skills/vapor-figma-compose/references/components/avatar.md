---
component: Avatar
page: '❖ Avatar (1:1029)'
reviewedAt: 2026-10-01
---

# Avatar

사용자가 설정한 프로필 이미지 또는 텍스트를 UI에 나타낸다.

## 컴포넌트와 key

| 이름            | 종류                       | key                                        | 용도                                                    |
| --------------- | -------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| 💙Avatar        | COMPONENT_SET (8 variants) | `8c582403a072e2229c07a5312c57d13a99f9166f` | 배치하는 컴포넌트 (텍스트 fallback 형태가 기본)         |
| 🟣AvatarPattern | COMPONENT_SET (2 variants) | `5b839165c91ba87242c716e57c2149f9fb786f17` | 이미지(`type=default`) / fallback(`type=fallback`) 예시 |

## 구조 — 어디를 바꾸나

```
💙Avatar                 variant: size (sm · md · lg · xl) · shape (circle · square)
├─ Label   ← label#7262:9 (TEXT) 이니셜·fallback 텍스트
└─ border  (frame)
```

- 이니셜은 💙Avatar 바깥 속성 `label#7262:9`로 바꾼다. 중첩 instance가 없다.
- 이미지 속성은 없다. 🟣AvatarPattern `type=default`는 💙Avatar instance의 fill을 IMAGE로 바꾸고 Label을 숨긴 형태다. 이미지 아바타가 필요하면 instance fill을 IMAGE paint로 override한다(사다리 5번).

## 알려진 버그와 우회

- 확인된 것 없음 (2026-10-01 기준)

## Variant 선택 기준

| 속성  | 값     | 언제                                          |
| ----- | ------ | --------------------------------------------- |
| size  | sm     | 테이블·작은 목록 같은 고밀도 공간, 보조 정보  |
|       | md     | 기본. 댓글·사용자 목록 등 범용                |
|       | lg     | GNB처럼 버튼 옆에서 크기감을 맞출 때          |
|       | xl     | 프로필 페이지처럼 강조가 필요할 때            |
| shape | circle | 사람·사용자·멤버 등 인간 주체                 |
|       | square | 조직·그룹 등 사람이 아닌 대상이나 구조적 요소 |

## Guidelines

1. **로드 실패 대응과 가독성.** 이미지가 없거나 깨지면 이니셜·기본 아이콘(fallback)을 노출한다. 상태 메시지나 이름을 아바타 이미지 안에 넣지 않고, 이름은 옆에 둔다.
2. **겹칠 때 구분한다.** 여러 아바타를 겹치면 배경색과 같은 테두리(stroke)로 분리한다. +N 영역을 누르면 숨겨진 목록을 툴팁으로 보여준다.

## Usecase

- 사용자 이름 표기: Avatar + 텍스트로 이름·계정 표시.
- User group: 여러 개를 겹쳐(Stack) 표시, 넘치는 수는 +N으로 축약.
- 프로필 이미지 등록: 유효한 이미지가 로드되면 이미지로 표시.
