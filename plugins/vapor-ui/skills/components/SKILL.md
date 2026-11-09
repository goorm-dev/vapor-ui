---
name: components
description: vapor-ui 컴포넌트 목록, props, 예제 코드, 아이콘을 사용자 레포에 설치된 버전 기준으로 조회한다. "vapor-ui 컴포넌트 뭐 있어", "Button props 알려줘", "Avatar 예제", "arrow 아이콘 찾아줘", "vapor-ui로 로그인 폼 만들어줘"처럼 컴포넌트·아이콘을 묻거나 vapor-ui로 화면을 짜 달라고 할 때 쓴다. Figma 시안을 코드로 옮기는 일은 implement-figma 스킬이 한다.
---

# vapor-ui 컴포넌트·아이콘 조회

스크립트는 이 스킬 폴더의 `scripts/`에 있고 GitHub의 해당 버전 태그에서 소스를 읽는다. 사용자가 버전을 말하지 않으면 먼저 감지한다.

```bash
node scripts/detect-version.mjs [앱 경로]   # CORE: x.y.z / ICONS: x.y.z
```

컴포넌트 스크립트에는 `CORE`, 아이콘 스크립트에는 `ICONS` 버전을 넘긴다.

| 알고 싶은 것       | 명령                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 컴포넌트 목록      | `node scripts/get-component-list.mjs <CORE>`                               |
| props와 설명       | `node scripts/get-component-info.mjs <CORE> <component> [part]`            |
| 예제 코드          | `node scripts/get-component-examples.mjs <CORE> <component> [example]`     |
| 아이콘 목록과 검색 | `node scripts/get-icon-list.mjs <ICONS> [keyword] [--outline \| --filled]` |

컴포넌트 이름은 폴더 이름(kebab-case)이다. 모르면 목록부터 본다. 파일 구조와 URL 규칙은 `references/component-structure.md`, `references/url-patterns.md`에 있다.

## 화면을 짜 달라는 요청

1. 목록에서 쓸 컴포넌트를 고른다.
2. 고른 컴포넌트마다 props와 예제를 읽는다.
3. vapor-ui 컴포넌트와 `VStack`·`HStack`·`Box`·`Grid`로만 짠다. 간격·색은 `$css`의 토큰으로 쓴다.

## 오류

| 증상                | 조치                                             |
| ------------------- | ------------------------------------------------ |
| Component not found | 목록으로 이름을 확인한다                         |
| Failed to fetch     | `detect-version.mjs`를 다시 돌려 버전을 확인한다 |
