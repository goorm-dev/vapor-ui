---
name: vapor-cs-report-jira
description: Vapor UI Figma 라이브러리를 사용하는 디자이너가 작업 중 발견한 CS/버그/문제를 Atlassian Jira의 VAPOR 프로젝트에 "CS" 이슈 타입(label=figma)으로 발행하는 스킬. 사용자(주로 디자이너)가 "디자인 시스템 팀에 보고", "vapor 팀에 Jira 티켓 발행", "CS 보내줘", "지라 티켓 올려줘", "vapor CS 등록", "vapor 피그마 이슈 티켓화", "슬랙으로 공유해줘", "채널에 알려줘", "vapor 팀에 알려줘" 라고 말하거나, 대화 중 Vapor Figma 라이브러리 컴포넌트(variant 누락, 토큰 어긋남, Auto Layout 깨짐, 인스턴스 override 이상, publish 반영 지연 등) 결함이 서술되고 사용자가 암시적으로 "제보해줘", "저쪽에 알려줘", "티켓으로 올려" 라고 할 때 반드시 사용. Vapor 디자인 시스템 팀 CS 접수 창구는 Jira VAPOR 프로젝트 하나로 정해져 있으므로, 사용자가 Slack/채널 공유 뉘앙스로 요청해도 이 스킬이 받아 Jira 발행 흐름으로 처리한다. 사용자 명시 요청 없어도 Vapor 라이브러리 결함이 draft된 상태라면 "이거 Jira 티켓으로 올릴까요?" 제안 트리거. 양식(제목 / 관련 패키지·컴포넌트 / 문제 설명) 구성, Figma URL 본문 삽입, 미리보기 + 사용자 명시 승인 후 발행. 담당자는 지정하지 않고 Jira 팀 트리아지에 맡긴다(assignee 필드 생략, 미리보기에도 담당자 라인 미포함). 패키지·컴포넌트는 Figma 라이브러리 기준(npm 패키지 아님).
---

# Vapor CS Report (Jira) — Figma 전용

Vapor UI **Figma 라이브러리** 결함을 Atlassian **Jira**에 CS 티켓으로 발행한다.

- 프로젝트 키: `VAPOR`
- 이슈 타입: `CS`
- 라벨: `["figma"]` **고정** — 이 라벨은 Vapor 디자인 시스템 팀의 **Figma 전용 트리아지 큐**를 가리키는 식별자. 이 스킬이 만드는 모든 티켓은 반드시 `figma` 라벨이 붙는다. 다른 라벨(`dev`, `code`, 공란 등)로 바꾸거나 추가하지 않는다.
- 담당자: **지정하지 않음** — `assignee` 필드를 아예 포함하지 않고 티켓을 만든다. Jira가 알아서 미지정 상태로 처리하고, 디자인 시스템 팀이 받아서 수동 트리아지한다. 미리보기와 발행 어디에서도 담당자 라인/문구를 표시하지 않는다.

## 적용 범위 — Figma 라이브러리 결함만

Vapor 디자인 시스템 팀의 CS 접수 창구는 **용도별로 완전히 분리**돼 있다:

| 구분                                            | 접수 창구                                   | 처리 주체                 |
| ----------------------------------------------- | ------------------------------------------- | ------------------------- |
| **Figma 라이브러리 결함**                       | Jira VAPOR `CS` (label=figma) — **이 스킬** | Vapor 디자인 트리아지     |
| **코드 패키지(`@vapor-ui/*`) 런타임/빌드 이슈** | 별도 **Slack 워크플로우 봇**                | Vapor 엔지니어링 트리아지 |

두 창구는 담당자·우선순위 규칙·수정 흐름이 다르다. 섞여 들어오면 둘 다 지연되므로 이 스킬은 **Figma 라이브러리 범주**만 받는다.

### 이 스킬 범주 (Figma 라이브러리 결함)

Figma 라이브러리 **파일 자체**에 있는 결함:

- 컴포넌트 variant 누락/오동작 (예: `state=hover`가 잘못 렌더)
- 디자인 토큰 바인딩 어긋남 (border/background/text color/spacing 토큰 끊김)
- Auto Layout 설정 오류 (padding/gap/alignment)
- 인스턴스 override 비정상 동작
- 라이브러리 publish 반영 지연·실패
- 아이콘·일러스트 누락
- Figma 컴포넌트 구조/속성 네이밍 혼선
- Figma 라이브러리 문서/설명 부정확

### 이 스킬 범주가 **아닌** 것 (코드 CS로 라우팅)

코드 패키지(`@vapor-ui/core`, `@vapor-ui/icons` 등)의 **런타임·빌드 시점** 이슈:

- React 컴포넌트가 런타임에 잘못된 DOM/스타일 렌더
- Props/TypeScript 타입 오류
- 번들·tree-shaking·SSR 문제
- CSS 토큰이 코드 레벨에서 적용 안 됨
- `npm install` / peer dep 충돌
- 접근성(a11y) 코드 레벨 결함
- Storybook/문서 사이트 코드 결함

이런 요청이 오면 **티켓 생성하지 않고 중단**하고 다음 문구로 안내한다:

> "이 요청은 코드 패키지(`@vapor-ui/*`) 런타임/빌드 쪽 이슈로 보여요. Vapor UI 코드 관련 CS는 Figma 라이브러리와 접수 창구가 달라서(Slack 워크플로우 봇), 거기로 올려주시면 더 빨리 처리돼요. 이 스킬은 Figma 라이브러리 전용이라 여기서는 티켓을 만들지 않을게요."

Slack 워크플로우 봇 자체를 이 스킬이 호출하지는 않는다 — 사용자가 직접 올리도록 안내만.

### 애매한 경우 — 사용자에게 묻기

같은 증상이 Figma와 코드 양쪽에서 모두 나타날 수 있는 경우가 있다. 예:

- "Button hover 색이 틀려" — Figma variant 바인딩 문제일 수도, 코드 CSS 토큰 적용 실패일 수도 있음
- "Card 패딩이 안 맞아" — Figma Auto Layout 설정 문제일 수도, 코드 컴포넌트 CSS 문제일 수도 있음

이럴 때 추측 금지. 다음과 같이 구체적으로 물어서 범주를 확정한 뒤 진행한다:

> "확인하고 싶은 게 있어요. 이 문제를 **Figma 파일**에서 보셨어요(라이브러리 컴포넌트를 insert했을 때), 아니면 **코드로 구현한 화면**(실제 브라우저/앱)에서 보셨어요? 각각 접수 창구가 달라서요."

사용자 응답:

- **Figma에서 봤다** → 이 스킬로 진행
- **코드/브라우저에서 봤다** → 위 "코드 CS로 라우팅" 안내 후 중단
- **둘 다** → 두 창구 모두 올려야 함을 알려주되, 이 스킬에서는 Figma 쪽만 티켓 생성 (코드 쪽은 사용자가 Slack 워크플로우 봇으로 별도 접수)

## 보고 창구는 Jira 하나

Vapor 디자인 시스템 팀 CS 접수 창구는 **Jira VAPOR 프로젝트 하나**로 정해져 있다. 이유: 티켓 형태가 아닌 메시지(채팅·DM·채널 공유 등)는 추적·우선순위 분류·수정 이력 관리가 불가능해 팀이 놓치는 사례가 반복됐기 때문. 그래서 이 스킬의 결과물은 항상 **Jira 티켓 발행 or 중단**, 둘 중 하나다.

### 사용자가 Slack/채널로 보내달라고 하면

- 디자이너가 "슬랙으로 보내줘", "채널에 공유해줘", "`#team-px-vapor-internal`로 알려" 같은 요청을 하는 경우가 종종 있다. 이 스킬은 **Slack API/MCP 도구를 어떤 상황에서도 호출하지 않는다** (`slack_send_message`, `slack_schedule_message`, `slack_create_canvas` 등 금지).
- 대신 다음 한 문장으로 안내한 뒤 그대로 이 스킬의 Jira 발행 흐름으로 진행:
    > "Vapor 디자인 시스템 팀 CS 접수 창구는 Jira VAPOR 프로젝트로 정해져 있어요. Jira 티켓으로 발행해드릴게요."
- 그 뒤 1·2·3단계(양식 매핑 → 미리보기 → 승인 후 `createJiraIssue`)를 그대로 수행한다. 사용자가 "그래도 슬랙으로만"이라고 거절하면 발행 중단하고 사용자에게 직접 슬랙 메시지를 작성하라고 안내 (스킬이 대신 보내지 않음).

핵심: **Slack으로 바로 전송하는 경로는 어떤 트리거에서도 발생하지 않는다.**

## 선행 조건: cloudId 확보

세션에서 cloudId 미보유 시 1회 호출.

```
mcp__plugin_atlassian_atlassian__getAccessibleAtlassianResources()
```

반환값에서 goorm 조직 cloudId 확보 후 재사용. 2개 이상 리소스 반환되면 사용자에게 어느 사이트인지 확인.

## 1. 양식 매핑

사용자가 설명한 문제 또는 LLM이 대화 중 발견한 문제를 아래 3개 필드로 정리. 담당자는 양식에 포함하지 않는다(아래 "담당자" 항목 참고).

### 필드 구성

- **제목 (summary)**: 한 줄, 50자 내외, 명사형. 컴포넌트/증상 바로 보이게.
    - 예: `Button / Ghost variant hover 테두리 깜빡임`
    - 예: `TextField label 토큰 색상 어긋남`
    - 예: `Card Auto Layout 간격 미반영`
- **관련 패키지 및 컴포넌트**: **Figma 라이브러리** 기준 (npm 패키지 아님). 포함:
    - 라이브러리명: `Vapor UI - Components`, `Vapor UI - Foundation (Tokens)`, `Vapor Icons` 등
    - 라이브러리 버전/publish 일자: Figma Libraries 패널 라벨
    - 컴포넌트명: Figma 등록 정확한 이름 (`/` 포함, 예 `Button/Ghost/Medium`)
    - variant properties: 예 `size=md, variant=ghost, state=hover`
    - 모르는 항목은 `(확인 필요)` 로 두고 사용자에게 묻는다.
- **문제 설명**: 한 블록 안에 상황·현상·재현 단계·Figma URL 포함.
    - 상황 묘사: 어떤 파일/프레임에서 작업 중 발생했는지
    - 관찰 현상: 눈에 보이는 결과, 다른 variant/컴포넌트와의 차이
    - 재현 단계: 번호 매긴 결정적 단계 (Figma 액션 기준 — 라이브러리 인서트, variant 전환, override 등)
    - Figma URL: 사용자가 제공하면 본문 하단에 `Figma: <URL>` 1줄로 삽입. 없으면 생략.
    - 예상 원인 가설(있을 때만): `추정:` prefix. 모르면 생략, 억지로 채우지 않음.
- **담당자**: 양식에 **포함하지 않는다**. `assignee` 필드를 티켓 payload에 넣지 말고, 미리보기에도 "담당자" 라인을 쓰지 않는다. accountId 매핑/조회도 하지 않는다. 디자인 시스템 팀이 받아서 수동 배정하는 흐름이다.

### 컴포넌트 추출 흐름

대화 맥락에서 다음 신호를 바탕으로 Figma 라이브러리/컴포넌트명 추론:

- 사용자가 작업 중이라 언급한 Figma 파일/프레임/컴포넌트
- Figma URL에 포함된 node 정보 (제공 시)
- 사용자가 명시한 Vapor UI 컴포넌트명

추론한 값은 **반드시 사용자에게 확인** 받고 티켓화. 추측값을 그대로 발행 금지.

정보가 부족하면 미리보기 전에 사용자에게 질문. 라이브러리명·버전·컴포넌트명 3개는 Vapor 팀 1차 분류 키이므로 공란 금지, `(확인 필요)` 로 표시 후 묻는다.

## 2. 미리보기 + 사용자 명시 승인 (필수)

필드가 채워지면 **발행 전** 미리보기 노출, 명시 승인 수신 전 티켓 생성 호출 금지.

미리보기 예시:

```
VAPOR 프로젝트에 아래 CS 티켓 발행 예정:

프로젝트: VAPOR
이슈 타입: CS
라벨: figma

---
[제목]
Button / Ghost variant hover 테두리 깜빡임

[본문 (Jira description)]
## 관련 패키지 및 컴포넌트
- 라이브러리: Vapor UI - Components (v2.4.0, 2026-10-20 publish)
- 컴포넌트: Button/Ghost/Medium
- variant properties: size=md, variant=ghost, state=hover

## 문제 설명
결제 플로우 2단계 화면 작업 중 Button/Ghost/Medium 인스턴스를 Auto Layout frame 안에 배치한 상태에서, variant 패널로 state=default → hover 전환 시 테두리 색이 primary-500 대신 neutral-300 으로 표시됨. default/pressed variant 는 정상. 라이브러리 재publish 후에도 재현됨.

### 재현 단계
1. 아무 Figma 파일에 Vapor UI - Components (v2.4.0) 라이브러리 인서트
2. Button/Ghost/Medium 인스턴스를 Auto Layout frame 안에 배치
3. 오른쪽 variant 패널에서 state=hover 전환
4. 테두리 색이 primary-500 (의도) 대신 neutral-300 렌더링

### 예상 원인
추정: hover variant 의 border-color token binding 이 끊어진 상태로 publish된 듯. TextField hover 는 동일 토큰 정상 반영 중.

Figma: https://www.figma.com/design/XXX?node-id=YYY
---

발행할까요? (yes / no / 수정)
```

사용자 응답:

- **yes / 네 / 발행 / ok**: 발행 진행 (3단계).
- **no / 아니 / 취소**: 중단, 티켓 폐기.
- **수정 요청**: 요청 부분만 고쳐 재미리보기.

## 3. 발행

승인 수신 후 `createJiraIssue` 호출.

```
mcp__plugin_atlassian_atlassian__createJiraIssue(
  cloudId=<확보한 cloudId>,
  projectKey="VAPOR",
  issueTypeName="CS",
  summary=<위 [제목]>,
  description=<위 [본문]>,
  additional_fields={
    "labels": ["figma"]
  }
)
```

주의:

- `assignee` 필드 자체를 payload에 넣지 말 것. "unassigned"라는 문자열이나 null을 명시적으로 넣는 것도 아니고 **키 자체를 생략**한다.
- `labels`는 기존 라벨 유지가 필요 없으니 `["figma"]`로 세팅.
- description 포맷은 ADF 변환이 필요할 수 있음 — 플레인 마크다운 전달 후 오류 발생 시 Atlassian MCP의 `getContentFormatGuide` 참고하여 재시도.
- 이슈 타입 `CS` 존재 여부 불확실 시 `getJiraProjectIssueTypesMetadata`로 사전 확인 가능하나, 세션 중 반복 호출 지양 (한 번 성공하면 캐시).

발행 성공 시:

- 반환된 issue key (예: `VAPOR-1234`) 와 browse URL (`https://<site>.atlassian.net/browse/VAPOR-1234`) 사용자에게 보고.

발행 실패 시:

- 에러 원문 그대로 사용자에게 전달. 임의 재시도·추측 교정 금지.
- 흔한 실패: issue type 미존재, 라벨 포맷 오류, 권한 부족. 각 경우 원인 안내하고 사용자 판단 요청.

## 트리거 조건 정리

**호출**:

- 명시 요청: "디자인 시스템 팀에 보고", "vapor CS 등록", "Jira 티켓 발행", "지라 올려", "티켓화해줘", "VAPOR 프로젝트에 올려"
- Slack/채널 뉘앙스 요청: "슬랙으로 공유", "채널에 알려", "`#team-px-vapor-internal`로 보내" — Slack 경로 폐지된 상황이므로 **이 스킬이 받아 Jira 발행 흐름으로 전환** (안내 문구 후 미리보기)
- 대화 중 Vapor Figma 라이브러리 결함(컴포넌트 오동작, variant 누락/오류, 토큰 어긋남, Auto Layout 깨짐, publish 반영 지연, 아이콘 누락 등) 발견 → 사용자에게 "이거 Jira 티켓으로 올릴까요?" 제안
- 암시 요청: 결함 서술 + "저쪽에 알려줘", "제보해줘", "트래킹 해줘"

**호출 금지 (해당 범주 아님 → 중단 + 안내)**:

- 단순 Vapor Figma 라이브러리 사용법 질문 → 내부 지식/문서로 답변 (티켓 아님)
- 디자이너 본인 파일 설계 실수 (라이브러리 자체 결함 아님)
- **Vapor 코드 패키지(`@vapor-ui/*`) 런타임/빌드/타입 이슈** → "코드 CS는 Slack 워크플로우 봇으로 접수" 안내 후 **티켓 생성 중단**. "적용 범위" 섹션의 안내 문구 그대로 사용.
- 다른 프로젝트/다른 이슈 타입 요청 → 이 스킬 범위 밖, 사용자에게 적절한 경로 안내

**애매하면 묻기**:

- Figma 라이브러리 쪽인지 코드 쪽인지 신호가 혼재된 경우(예: "Button hover 색이 틀려"처럼 양쪽 다 가능), **추측 금지**. "적용 범위 > 애매한 경우" 섹션의 질문 템플릿으로 범주 확인 후 분기.

**절대 하지 말 것**:

- Slack 전송 도구(`mcp__claude_ai_Slack__slack_send_message`, `slack_schedule_message`, `slack_create_canvas` 등) 호출 금지. 디자이너가 Slack 뉘앙스로 요청해도 **이 스킬 내 발행 경로는 Jira 단 하나**. 코드 CS용 Slack 워크플로우 봇도 이 스킬이 대신 호출하지 않음 — 사용자가 직접 접수.
- 라벨 `figma` 제거/교체/추가 금지. 다른 라벨(`dev`, `code` 등)을 섞어 발행하면 트리아지가 깨짐.
- 코드 CS에 해당하는 요청을 "그래도 Jira에 올려두자"며 label=figma로 강제 발행 금지. Figma 트리아지 큐가 오염됨.
