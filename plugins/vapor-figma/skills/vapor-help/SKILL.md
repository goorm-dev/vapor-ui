---
name: vapor-help
description: Vapor Figma plugin 길잡이. `/vapor-help`로 명시 호출해야만 돌며, 설치·첫 시작과 포함 스킬(vapor-figma-compose, vapor-cs-report-jira)의 역할·선택 기준을 대화로 안내한다. 질문에 답하고 다음에 보낼 prompt 예시를 돌려줄 뿐 작업을 실행하지 않는다.
disable-model-invocation: true
---

# Vapor Figma plugin — 길잡이

사용자의 질문에 답하고, 다음에 Claude에게 보낼 prompt 예시 한 개를 돌려주고, 답이 어느 파일에서 왔는지 공개 링크로 밝힌다.

**질문에는 답만 하고, 작업은 시작하지 않는다.** 사용자가 "뭘 할 수 있어?", "어떻게 써?"라고 물은 것이지 "지금 해줘"가 아니다. 실제 작업은 사용자가 이 스킬이 돌려준 prompt를 다시 보내면서 시작한다. 설명 한 번과 작업 한 번을 섞으면 사용자가 되돌아보기 어렵고, 토큰도 두 배로 든다.

반대로 "지금 Dialog 시안 만들어 봐", "이 토큰 깨진 거 Jira에 올려줘" 같은 **작업 요청**은 질문이 아니다. 해당 스킬([`vapor-figma-compose`](../vapor-figma-compose/SKILL.md), [`vapor-cs-report-jira`](../vapor-cs-report-jira/SKILL.md))을 그대로 쓰면 된다 — `/vapor-help`가 가로채지 않는다.

## 이 파일의 역할

이 SKILL.md는 **길잡이 map**이다. 각 스킬의 상세(prerequisite, 전체 사용 예시, 보고 형식, 적용 범위의 경계 규칙 등)는 라우팅 대상 SKILL.md가 소유한다. **라우팅할 때는 그 파일을 먼저 읽고 그 내용을 믿는다. 이 map의 요약과 어긋나면 그쪽을 따른다** — 라이브러리와 규칙은 계속 바뀌고, map 요약은 뒤처질 수 있다.

설치된 skills의 로컬 경로는 사용자가 열지 못할 수 있다. 사용자에게 링크를 보여줄 때는 공개 저장소의 경로로 바꿔서 보여준다:

- 플러그인 전체: `https://github.com/goorm-dev/vapor-ui/tree/main/plugins/vapor-figma`
- README: `https://github.com/goorm-dev/vapor-ui/blob/main/plugins/vapor-figma/README.md`
- 각 스킬: `https://github.com/goorm-dev/vapor-ui/blob/main/plugins/vapor-figma/skills/<skill-name>/SKILL.md`

## 사용자가 뭘 원하는지 파악한다

대화 맥락과 메시지에서 추론한다. "Dialog 시안 어떻게 만들어?", "token 깨진 거 어떻게 보고해?" 처럼 상황이 명확하면 바로 해당 섹션으로 간다.

애매하면 아래 선택지 중 하나만 **한 번** 묻고, 사용자가 고른 섹션만 답한다. 여러 섹션을 미리 쏟아내지 않는다:

- 처음이야, 설치·첫 시작부터 알려줘
- Figma에서 Vapor 컴포넌트로 시안을 만들고 싶어
- Figma 라이브러리 결함을 Vapor 팀에 보고하고 싶어
- 둘 중 어떤 스킬을 써야 할지 모르겠어

## 설치·첫 시작

[README](https://github.com/goorm-dev/vapor-ui/blob/main/plugins/vapor-figma/README.md)의 설치 두 줄을 터미널에 입력한다:

```bash
/plugin marketplace add goorm-dev/vapor-ui
/plugin install vapor-figma@vapor-ui
```

업데이트는 `/plugin marketplace update vapor-ui`.

**선행 조건** — 쓰려는 스킬에 맞춰서만 챙기면 된다:

| 스킬 | 외부 의존성 |
|---|---|
| `vapor-figma-compose` | Figma 공식 plugin (`figma@claude-plugins-official`) — Figma MCP 서버와 `figma-use` 스킬이 필요 |
| `vapor-cs-report-jira` | Atlassian 공식 plugin (`atlassian@claude-plugins-official`) — Jira에 이슈를 발행 / goorm Atlassian 사이트의 `VAPOR` 프로젝트 이슈 생성 권한 |

두 스킬 모두 Figma 라이브러리 `Vapor Design System`, `[V2.0] [Goorm theme] Foundation` 사용 권한이 필요하다. 권한이 없으면 Vapor 디자인 시스템 팀에 요청한다.

**상태를 묻는 것은 답이 바뀌는 경우에만 한다.** 예:

- 질문이 Figma 시안 작성인데 사용자가 Figma 공식 plugin이 깔려 있는지 모를 때: 설치 명령어 한 줄만 알려주고 넘어간다.
- 질문이 Jira CS 보고인데 사용자가 Atlassian 공식 plugin이 없다고 하면: 설치 명령어 한 줄만.
- 그 외에는 상태를 미리 물어보지 않는다.

## 스킬 고르기

| 하고 싶은 것 | 스킬 |
|---|---|
| Vapor core 라이브러리의 Stable 컴포넌트로 Figma 시안을 만들거나 고치고, 라이브러리와 연결된 instance를 유지하고 싶다 | [`vapor-figma-compose`](../vapor-figma-compose/SKILL.md) |
| Figma 라이브러리 자체 결함(variant 누락·토큰 어긋남·Auto Layout 깨짐·instance override 이상·publish 반영 지연 등)을 Jira `VAPOR` 프로젝트에 `CS` 티켓(label=figma)으로 올리고 싶다 | [`vapor-cs-report-jira`](../vapor-cs-report-jira/SKILL.md) |
| plugin 자체 안내가 필요하다 | `/vapor-help` (이 스킬) |

**추천 전에 그 SKILL.md를 읽는다.** 사용자에게 보여줄 예시 prompt는 그 파일의 `description` frontmatter나 본문에 적힌 사용자 발화 중 하나를 뽑아 쓴다. 이 map이 임의로 지어내지 않는다 — 라이브러리/권한 요구나 적용 범위가 바뀌었을 수 있다.

## 경계가 애매할 때

실제 요청이 한쪽에 깔끔하게 들어맞지 않는 경우가 있다. 자주 생기는 네 가지:

- **시안을 만들다가 라이브러리 결함을 발견한 경우.** compose가 조립 중 발견한 variant·토큰 어긋남·Auto Layout 깨짐은 그냥 두지 말고 `vapor-cs-report-jira`로 이어 Jira `VAPOR` 프로젝트에 CS 티켓(label=figma)으로 정식 접수한다 — Vapor 팀이 트리아지할 창구는 Jira다. compose가 보고에 결함을 정리해 두면 그 내용 그대로 cs-report-jira에 넘기면 된다. `/vapor-help`는 이 흐름만 안내하고 직접 전환하지는 않는다 — 디자이너가 "이거 Jira 티켓으로 올려줘"처럼 명시 요청하면 그때 cs-report-jira가 받는다.
- **Figma 라이브러리 결함 vs 코드 패키지 결함.** `vapor-cs-report-jira`는 **Figma 라이브러리 결함만** 받는다. `@vapor-ui/*` npm 패키지의 런타임·빌드 이슈는 범위 밖이고 별도 Slack 워크플로우 봇으로 안내한다. 상세 분기 규칙은 [`vapor-cs-report-jira`의 "적용 범위" 섹션](https://github.com/goorm-dev/vapor-ui/blob/main/plugins/vapor-figma/skills/vapor-cs-report-jira/SKILL.md)에 있다 — 사용자가 애매한 사례를 들고 오면 거기로 안내한다.
- **코드 생성(Figma → React 등).** 이 plugin에는 코드 생성 스킬이 없다. Vapor UI 코드 문서나 다른 plugin/도구를 쓴다.
- **토큰 리뷰·접근성 리뷰 등 다른 검수.** 이 plugin에는 없다. 사용자가 묻는 그대로 "이 plugin 범위 밖"임을 밝히고, 알고 있는 다른 Vapor 리소스가 있으면 알려주되 지어내지 않는다.

## `/vapor-help`가 다루지 **않는** 것

범위를 선명하게 두면 사용자가 다른 창구로 더 빨리 도달한다:

- `@vapor-ui/*` npm 패키지(core·icons·hooks 등) 사용법·버그·설정
- Vapor UI 디자인 토큰 개념 전반, 컴포넌트 상세 명세 — 공식 문서 사이트 소관
- 비 Vapor Figma 라이브러리 작업
- Figma 공식 plugin / Atlassian 공식 plugin 자체 사용법
- Claude Code 자체 설치·설정·사용법

이 중 하나를 질문받으면 "이 plugin 범위 밖"임을 짧게 밝히고, 알고 있는 적절한 창구만 안내한다. 추측으로 답하거나 Vapor UI 문서를 지어내지 않는다.

## 답하는 방식

- **답을 먼저** 말한다. 섹션 번호나 "먼저 X를 확인해 보세요" 같은 서론 없이 결론부터.
- **예시 prompt 한 개**를 코드 블록으로 보여준다. 디자이너가 그걸 복사해 다시 보내는 흐름이 된다 — 그러니 사용자가 실제로 쓸 법한 자연스러운 문장이어야 한다.
- **출처를 밝힌다** — 어떤 SKILL.md의 어느 섹션에서 가져왔는지, 위의 공개 링크 패턴으로.
- **짧게 끊는다.** 사용자가 "전체 map 보여줘", "스킬 전부 설명해 줘"처럼 명시하지 않는 한 테이블 전체·설명 전체를 매번 쏟아내지 않는다.
- 같은 세션에서 이미 답한 공통 전제(설치 안내, 외부 plugin 요구 등)는 되풀이하지 않는다.
- 사용자가 명시적으로 "지금 그 작업 해 줘"로 넘어가면 그때는 해당 스킬이 직접 받으면 된다. `/vapor-help`가 작업 모드로 전환하지 않는다.
