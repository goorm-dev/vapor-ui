---
name: visual-score
description: 실행 중인 앱 화면을 Figma 시안과 비교해 시각 점수(Block-Match, Position, Layout IoU)를 `scripts/visual.mjs`로 잰다. 시안 쪽 정답은 figma-blueprint 정답 트리에서 읽는다. "시각 점수", "시안이랑 화면 얼마나 비슷해", "visual score"처럼 말할 때 쓴다.
---

# 시각 점수

## 실행할 때 묻는 것

아래를 사용자에게 묻는다. 대화에 이미 나왔으면 다시 묻지 않는다.

1. **앱 URL**: 구현한 화면이 뜨는 주소. 앱은 사용자가 띄운다. 띄워 달라고 하면 dev server를 백그라운드로 띄운 뒤 주소를 확인한다. **직접 띄운 서버는 측정이 끝나면 결과와 상관없이 바로 끈다.**

앱 URL이 대화에 없는데 사용자에게 물어볼 수 없는 실행(`claude -p` 같은 비대화형 실행)이면, 서버를 띄우거나 URL을 추측하지 않는다. 시각 점수를 건너뛰고, 건너뛴 사실과 이유를 최종 보고에 적는다.

2. **selector**(선택): 화면이 앱 레이아웃 안에 들어 있으면 그 화면을 감싼 요소의 CSS selector. 주면 그 상자를 원점으로 잰다.
3. **로그인 상태 파일**(선택): 로그인이 필요한 페이지면 Playwright `storageState` JSON 경로.

## 시안 입력

- 같은 흐름에서 check-components가 `$OUT/blueprint.json`을 이미 썼으면 그 파일을 넘긴다. 관문 1과 시각 점수가 같은 시안 스냅숏으로 채점된다.
- 없으면 Figma URL을 넘긴다. 스크립트가 `npx --no figma-blueprint <URL> --json`을 대신 돌린다. 이때만 `@vapor-ui/figma-blueprint` 설치와 `FIGMA_ACCESS_TOKEN`이 필요하다. 토큰이 비어 있으면 안내하고 멈춘다.

## 실행

`@vapor-ui/core`가 설치된 패키지 폴더에서 실행한다. 모노레포면 앱 폴더다. Playwright와 figma-blueprint를 이 폴더 기준으로 찾는다.

```bash
node "<이 스킬 폴더>/scripts/visual.mjs" "<blueprint.json 또는 Figma URL>" "<앱 URL>" [--selector "<css>"] [--storage-state <file>] --json 2>"${TMPDIR:-/tmp}/vapor-visual-score.err"
```

| 종료 코드 | 뜻                                                          |
| --------- | ----------------------------------------------------------- |
| 0         | 점수를 계산했다                                             |
| 2         | 렌더하지 못했다(페이지 오류, 시간 초과, selector를 못 찾음) |
| 1         | 실행 오류다. stdout에 JSON이 없다                           |

종료 코드가 1이면 stderr 파일의 `visual:` 줄을 읽고 아래대로 한 뒤 멈춘다.

| stderr                                     | 조치                                                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `playwright is not installed`              | 안내 문구를 그대로 전한다                                                                             |
| `chromium did not launch`                  | 안내 문구를 그대로 전한다                                                                             |
| `Upgrade @vapor-ui/figma-blueprint`        | 정답 트리가 시각 점수에 쓰는 박스를 담기 전 버전이다. `@vapor-ui/figma-blueprint`를 올리라고 안내한다 |
| `Update the vapor-ui plugin`               | 정답 트리가 이 스크립트보다 새 버전이다. 플러그인을 업데이트하라고 안내한다                           |
| `figma-blueprint failed` … `npm error 404` | `@vapor-ui/figma-blueprint`를 devDependency로 설치하라고 안내한다                                     |
| `figma-blueprint failed` … `403`           | `FIGMA_ACCESS_TOKEN`이 시안 파일을 읽을 수 있는지 확인한다                                            |
| 그 밖                                      | stderr 파일 내용을 그대로 전한다                                                                      |

종료 코드가 2면 `error`를 그대로 전하고, URL·selector·로그인 상태를 다시 묻는다.

## 결과 읽기

- 점수는 기록용이다. 합격선이 없다. 세 점수를 소수 셋째 자리까지 보고한다.
- **Block-Match**: 시안의 글자 줄과 화면의 글자 줄이 문자열로 짝지어진 면적의 비율.
- **Position**: 짝지어진 글자 줄의 위치가 가까운 정도.
- **Layout IoU**: 컴포넌트 종류별 영역이 겹치는 정도. 시안에 잴 컴포넌트가 없으면 `null`이다.
- Block-Match와 Position은 글자를 문자열로 짝짓는다. 실제 데이터를 그리는 화면은 문구가 시안과 달라 점수가 낮게 나온다. 점수가 낮으면 이 원인인지 먼저 확인한다.

## 보고

세 점수 아래에 고칠 단서를 구체적으로 적는다. 점수가 기록용이어도 이 단서는 다음 수정에 쓴다.

- **`unmatchedRef`**: 화면에서 짝을 찾지 못한 시안 글자 줄이다. 줄마다 그대로 적는다. 화면에 없거나 문구가 다르다는 뜻이다. 실제 데이터 때문에 문구가 다른 줄이면 그렇다고 표시한다.
- **`layoutByType`**: 값이 `IoU (시안 개수→화면 개수)`다. 1.00이 아닌 항목을 낮은 순으로 적는다.
    - 화면 개수가 적으면 그 종류의 컴포넌트가 빠졌다.
    - 개수가 같은데 IoU가 낮으면 자리나 크기가 다르다.
    - 화면 개수가 많으면 시안에 없는 컴포넌트를 더 그렸거나 다른 종류를 썼다.
- **`errors`**: 측정 중 난 페이지 오류다. 있으면 그대로 적는다.
