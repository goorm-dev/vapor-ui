---
name: figma-to-code
description: Figma 시안을 vapor-ui 코드로 구현하고, 관문 2개(컴포넌트 재현율, absolute·하드코딩 값)를 통과할 때까지 최대 2회 고친 뒤 시각 점수까지 잰다. "시안 구현하고 채점까지", "figma to code 전체 흐름", "구현하고 점수 보여줘"처럼 구현과 검증을 한 번에 원할 때 쓴다. 구현만 원하면 implement-figma 스킬을 쓴다.
---

# Figma 시안 구현부터 시각 점수까지

아래 스킬을 순서대로 부른다. 각 스킬의 SKILL.md를 읽고 그대로 따른다. 플러그인으로 설치했다면 이름 앞에 `vapor-ui:`가 붙는다.

## 시작 전

Figma URL과 코드를 쓸 위치를 받는다. 아래가 갖춰졌는지 먼저 확인하고, 빠진 것이 있으면 모두 한꺼번에 알리고 멈춘다.

- Figma MCP 서버 연결
- `@vapor-ui/figma-eval` 설치. `npx --no figma-eval 2>&1 | grep -q '^usage: figma-eval'`이 성공하면 설치돼 있다. `npx --no figma-eval`은 설치돼 있어도 종료 코드 1로 끝나고 npm 경고가 앞에 붙을 수 있으니, 종료 코드나 첫 줄로 판단하지 않는다.
- `FIGMA_ACCESS_TOKEN`

## 흐름

1. **implement-figma**로 구현한다. 쓰거나 고친 파일 경로를 모으고, figma-eval을 실행할 폴더(`@vapor-ui/core`가 설치된 폴더) 기준 경로로 바꿔 둔다.
2. **check-components**와 **check-styling**을 그 경로로 돌린다. 이 결과가 "개선 전"이다.
3. 두 관문이 모두 통과할 때까지 고치고 2번을 다시 돌린다. **최대 2회**까지만 고친다.
    - check-components의 `missing`·`mismatch` 줄과 check-styling의 실패 줄만 고친다. 통과한 부분은 건드리지 않는다.
    - check-components가 `unscorable`이어도 `rows`의 `missing`·`mismatch`는 고친다. `unscorable` 항목은 고칠 대상이 아니다. 고칠 줄이 남지 않으면 회차가 남아도 멈춘다.
    - 관문 스킬이 실행 오류로 멈췄으면 고치지 않는다. 오류를 보고하고 멈춘다.
    - "`pass`, 단 `<pkg>` 미채점"은 고칠 줄이 없는 상태로 본다. 패키지 설치나 업그레이드 안내는 흐름을 멈추지 말고 최종 보고에 담는다.
4. **visual-score**로 시각 점수를 잰다. 앱 URL, selector, 로그인 상태 파일은 이때 묻는다. 관문을 통과하지 못했어도 잰다.

## 보고

관문 결과와 상관없이 항상 아래 표를 낸다. 고치지 않았으면 "개선 후" 열은 "개선 전"과 같다.

| 항목            | 개선 전                          | 개선 후   |
| --------------- | -------------------------------- | --------- |
| 관문 1 재현율   | `ok/total`, pass·fail·unscorable | 같은 형식 |
| 관문 2 실패 수  | n, pass·fail                     | 같은 형식 |
| styling 예외 수 | 종류별 n                         | 종류별 n  |
| compare 제외 수 | 사유별 n                         | 사유별 n  |

표 아래에 남은 실패 항목을 파일과 줄 번호로 모두 적고, 시각 점수 3종(Block-Match, Position, Layout IoU)을 적는다. 고친 횟수와 각 회차에 무엇을 고쳤는지 한 줄씩 적는다.
