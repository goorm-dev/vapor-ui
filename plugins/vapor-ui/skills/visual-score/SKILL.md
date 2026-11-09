---
name: visual-score
description: 실행 중인 앱 화면을 Figma 시안과 비교해 시각 점수(Block-Match, Position, Layout IoU)를 `figma-eval visual`로 잰다. "시각 점수", "시안이랑 화면 얼마나 비슷해", "visual score", "figma-eval visual 돌려줘"처럼 말할 때 쓴다.
---

# 시각 점수

## 실행할 때 묻는 것

아래를 사용자에게 묻는다. 대화에 이미 나왔으면 다시 묻지 않는다.

1. **앱 URL**: 구현한 화면이 뜨는 주소. 앱은 사용자가 띄운다. 띄워 달라고 하면 dev server를 백그라운드로 띄운 뒤 주소를 확인한다.
2. **selector**(선택): 화면이 앱 레이아웃 안에 들어 있으면 그 화면을 감싼 요소의 CSS selector. 주면 그 상자를 원점으로 잰다.
3. **로그인 상태 파일**(선택): 로그인이 필요한 페이지면 Playwright `storageState` JSON 경로.

`FIGMA_ACCESS_TOKEN`도 필요하다. 비어 있으면 안내하고 멈춘다.

## 실행

```bash
npx --no figma-eval visual "<Figma URL>" "<앱 URL>" [--selector "<css>"] [--storage-state <file>] --json
```

`figma-eval`을 찾지 못하면 `@vapor-ui/figma-eval` 설치를, Playwright가 없다는 안내가 나오면 그 안내를 그대로 전한다. 출력이 `usage: figma-eval`로 시작하면 설치된 버전에 `visual` 명령이 없다. 버전을 올리라고 안내하고 멈춘다.

## 결과 읽기

| 종료 코드 | 뜻                                                          |
| --------- | ----------------------------------------------------------- |
| 0         | 점수를 계산했다                                             |
| 2         | 렌더하지 못했다(페이지 오류, 시간 초과, selector를 못 찾음) |

- 점수는 기록용이다. 합격선이 없다. 세 점수를 소수 셋째 자리까지 보고한다.
- **Block-Match**: 시안과 화면의 글자 상자·컴포넌트 상자가 짝지어지는 정도.
- **Position**: 짝지어진 상자의 위치가 가까운 정도.
- **Layout IoU**: 컴포넌트 종류별 영역이 겹치는 정도.
- Block-Match와 Position은 글자를 문자열로 짝짓는다. 실제 데이터를 그리는 화면은 문구가 시안과 달라 점수가 낮게 나온다. 점수가 낮으면 이 원인인지 먼저 확인한다.
- 종료 코드 2면 원인을 그대로 전하고, URL·selector·로그인 상태를 다시 묻는다.
