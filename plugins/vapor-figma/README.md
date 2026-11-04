# vapor-figma

Claude Code에서 Vapor UI를 사용하는 디자이너의 Figma 작업을 돕는 plugin입니다. 디자이너가 Vapor UI Figma 라이브러리를 쓰면서 겪는 반복 작업을 Claude에게 넘길 수 있도록, 작업 흐름별 스킬을 묶어 제공합니다.

## 필요한 것

- Claude Code
- 아래 "스킬" 섹션의 각 스킬이 요구하는 외부 plugin / 권한
- Figma 파일에서 `Vapor Design System`, `[V2.0] [Goorm theme] Foundation` 라이브러리 사용 권한

## 설치

```bash
/plugin marketplace add goorm-dev/vapor-ui
/plugin install vapor-figma@vapor-ui
```

새 버전은 `/plugin marketplace update vapor-ui`로 받습니다.

## 사용 안내

plugin 자체 사용법·스킬 선택·상황별 안내는 Claude Code에서 `/vapor-help`로 물어볼 수 있습니다. 설치·첫 시작부터 각 스킬의 역할, 상황에 맞는 스킬 선택, 범위 안팎 구분까지 대화 형식으로 답합니다. 이 README에는 설치와 각 스킬 요약만 두고, 상세 사용법은 `/vapor-help`가 각 스킬의 SKILL.md를 live로 참조해 안내합니다.

## 스킬

이 plugin에 포함된 스킬은 서로 독립적으로 동작합니다. 요청에 맞으면 Claude가 알아서 부르고, 아래 이름으로 직접 호출해도 됩니다.

### `vapor-figma:vapor-help`

이 plugin의 길잡이 스킬입니다. `/vapor-help`로 명시 호출할 때만 돌고, 질문에 답하고 다음에 보낼 prompt 예시를 돌려줄 뿐 작업을 실행하지 않습니다. 설치·첫 시작, 포함 스킬의 역할·사용 예시, 상황별 선택 기준을 안내합니다.

**사용 예시**

```
/vapor-help 결제 확인 Dialog 시안 어떻게 만들어?
/vapor-help Button hover 토큰 어긋난 거 어디로 보고해?
/vapor-help 이 plugin으로 뭘 할 수 있어?
```


### `vapor-figma:vapor-figma-compose`

Vapor core 라이브러리(`Vapor Design System`)의 🟢 Stable 컴포넌트로 Figma 시안을 구성합니다. 시안 속 컴포넌트를 detach하지 않고 라이브러리 원본과 연결된 instance로 유지하는 것이 목표이며, Composites·Alpha·Archive·Deprecated 컴포넌트는 다루지 않습니다.

**필요한 외부 의존성**

- Figma 공식 plugin (`figma@claude-plugins-official`) — Figma MCP 서버, `figma-use` 스킬

**사용 예시**

```
https://www.figma.com/design/<fileKey>/... 여기에 결제 확인 Dialog 시안 만들어줘
```

### `vapor-figma:vapor-cs-report-jira`

Vapor Figma 라이브러리를 쓰다가 발견한 결함(variant 누락, 토큰 어긋남, Auto Layout 깨짐, 인스턴스 override 이상, publish 반영 지연 등)을 Jira `VAPOR` 프로젝트에 `CS` 이슈(label=figma)로 보고합니다. 미리보기를 보여준 뒤 사용자 명시 승인이 있을 때만 발행하며, 담당자는 지정하지 않고 팀 트리아지에 맡깁니다. `@vapor-ui/*` 코드 패키지 런타임/빌드 이슈는 범위 밖이며, 그런 요청에는 별도 Slack 워크플로우 봇으로 접수하도록 안내만 하고 티켓을 만들지 않습니다.

**필요한 외부 의존성**

- Atlassian 공식 plugin (`atlassian@claude-plugins-official`) — Atlassian MCP (`createJiraIssue`, `getAccessibleAtlassianResources`)
- goorm Atlassian 사이트의 `VAPOR` 프로젝트에 이슈 생성 권한

**사용 예시**

```
이 Button hover state에 토큰이 어긋나 있어. 디자인 시스템 팀에 Jira 티켓으로 올려줘
```
