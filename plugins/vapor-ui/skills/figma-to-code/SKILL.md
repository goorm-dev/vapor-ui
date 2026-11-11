---
name: figma-to-code
description: Figma 시안을 vapor-ui 코드로 구현하고, 관문 1(컴포넌트 재현율)을 통과할 때까지 최대 2회 고친 뒤 시각 점수까지 잰다. "이 시안을 vapor-ui로 구현해줘", "이 Figma 시안 코드로 옮겨줘", "figma to code", "vapor-ui로 시안 구현", "구현하고 점수 보여줘"처럼 Figma URL과 함께 구현을 요청하면 이 스킬을 쓴다. 채점 없이 구현만 원한다고 분명히 말하면 implement-figma 스킬을 쓴다.
---

# Figma 시안 구현부터 시각 점수까지

아래 스킬을 순서대로 부른다. 각 스킬의 SKILL.md를 읽고 그대로 따른다. 플러그인으로 설치했다면 이름 앞에 `vapor-ui:`가 붙는다.

## 시작 전

Figma URL과 코드를 쓸 위치를 받는다. 아래가 갖춰졌는지 먼저 확인한다. 빠진 것이 있으면 모두 한꺼번에 알리고, `/vapor-ui:setup`을 실행하라고 안내한 뒤 멈춘다.

- Figma MCP 서버 연결
- `@vapor-ui/figma-blueprint` 설치. `@vapor-ui/core`가 설치된 폴더(모노레포면 앱 폴더)에서 아래를 실행해 grep이 성공하면 설치돼 있다. `npx --no figma-blueprint`는 설치돼 있어도 종료 코드 1로 끝나고 npm 경고가 앞에 붙을 수 있으니, 출력을 파일로 받은 뒤 확인한다.

    ```bash
    npx --no figma-blueprint >"${TMPDIR:-/tmp}/figma-blueprint-check.out" 2>&1
    grep -q '^usage: figma-blueprint' "${TMPDIR:-/tmp}/figma-blueprint-check.out"
    ```

- `FIGMA_ACCESS_TOKEN`

## 흐름

1. **implement-figma**로 구현한다. 진입점(시안을 구현한 화면 컴포넌트) 경로와 쓰거나 고친 파일 경로를 모은다.
2. **check-components**에 진입점과 쓰거나 고친 파일을 넘긴다. 이 결과가 "개선 전"이다.
3. 관문 1이 통과할 때까지 고치고 2번을 다시 돌린다. **최대 2회**까지만 고친다.
    - check-components의 `failures`·`evidence` 줄만 고친다. 통과한 부분은 건드리지 않는다.
    - 다시 돌릴 때 check-components의 정답 트리는 다시 뽑지 않고, 검증 서브에이전트는 새로 띄운다.
    - check-components의 채점 불가 항목(정답 트리의 `unscorable`, `unscorable` 판정)은 고칠 대상이 아니다. 고칠 줄이 남지 않으면 회차가 남아도 멈춘다.
    - `reason: "no library instances in the design"`이 붙은 `unscorable`은 시안에 채점할 라이브러리 인스턴스가 없다는 뜻이다. 코드를 고치지 않고 멈추며, 보고에 이 사유를 적는다.
    - 관문 스킬이 실행 오류로 멈췄으면 고치지 않는다. 오류를 보고하고 멈춘다.
    - "`pass`, 단 `<pkg>` 미채점"은 고칠 줄이 없는 상태로 본다. 패키지 설치나 업그레이드 안내는 흐름을 멈추지 말고 최종 보고에 담는다.
4. **visual-score**로 시각 점수를 잰다. 시안 입력으로 check-components가 쓴 `blueprint.json`을 넘긴다. 앱 URL, selector, 로그인 상태 파일은 이때 묻는다. 관문을 통과하지 못했어도 잰다. visual-score가 시각 점수를 건너뛰었으면 그 사실과 이유를 보고에 적는다.

## 보고

**사용자가 요청한 언어로 보고한다.** 한국어로 요청했으면 한국어로 쓴다. 스킬 문서나 도구 출력의 언어를 따라가지 않는다.

관문 결과와 상관없이 항상 아래 표를 낸다. 고치지 않았으면 "개선 후" 열은 "개선 전"과 같다.

| 항목           | 개선 전                             | 개선 후   |
| -------------- | ----------------------------------- | --------- |
| 관문 1 재현율  | `ok/scorable`, pass·fail·unscorable | 같은 형식 |
| 관문 1 제외 수 | 사유별 n                            | 사유별 n  |

표 아래에 남은 실패 항목을 파일과 줄 번호로 모두 적고, 시각 점수 3종(Block-Match, Position, Layout IoU)과 visual-score가 낸 고칠 단서(렌더되지 않은 시안 글자 줄, IoU가 낮은 컴포넌트 종류)를 적는다. 고친 횟수와 각 회차에 무엇을 고쳤는지 한 줄씩 적는다.
