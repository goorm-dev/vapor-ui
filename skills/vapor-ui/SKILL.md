---
name: vapor-ui
description: 옮겨진 스킬. vapor-ui 컴포넌트·아이콘 조회와 Figma 시안 구현은 vapor-ui 플러그인으로 옮겨졌다. "vapor-ui components", "vapor-ui 사용법", "아이콘 찾기", "figma to code", "vapor-ui로 시안 구현"처럼 요청하면 이 스킬이 설치 방법을 안내한다.
---

# vapor-ui 스킬은 플러그인으로 옮겨졌다

`components`나 `implement-figma` 스킬이 함께 설치돼 있으면 이 스킬은 무시하고 그 스킬로 요청을 처리한다. 둘 다 없을 때만 요청을 처리하지 말고 아래를 사용자에게 그대로 전한 뒤 멈춘다. 이 스킬은 다음 릴리스에서 지워진다.

> vapor-ui 스킬은 `vapor-ui` 플러그인으로 옮겨졌습니다. 컴포넌트 조회(`components`), 시안 구현(`implement-figma`), 채점(`check-components`, `check-styling`, `visual-score`), 전체 흐름(`figma-to-code`)으로 나뉘었습니다.
>
> Claude Code:
>
> ```
> /plugin marketplace add goorm-dev/vapor-ui
> /plugin install vapor-ui@vapor-ui
> ```
>
> 그 밖의 에이전트:
>
> ```
> npx skills add goorm-dev/vapor-ui
> ```
>
> 설치한 뒤 이 `vapor-ui` 스킬은 지워도 됩니다.
