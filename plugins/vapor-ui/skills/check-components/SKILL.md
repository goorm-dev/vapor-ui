---
name: check-components
description: 관문 1. Figma 시안의 vapor-ui 컴포넌트와 props가 코드에 빠짐없이 들어갔는지 `figma-eval compare`로 채점한다. "컴포넌트 재현율 확인", "시안 컴포넌트 다 들어갔어?", "check components", "figma-eval compare 돌려줘"처럼 말하거나 Figma 시안 구현을 검증할 때 쓴다.
---

# 관문 1: 컴포넌트 재현율

## 준비

- 입력은 Figma URL(노드 하나)과 화면 코드 경로들이다. 이번에 쓴 파일뿐 아니라, 화면이 렌더하는 컴포넌트를 정의한 기존 파일도 넣는다. 넘긴 파일 밖에서 그려지는 컴포넌트는 `missing`이 된다. 경로를 모르면 묻는다. 디렉터리도 받는다. 경로는 명령을 실행하는 폴더 기준으로 넘긴다.
- `@vapor-ui/core`가 설치된 패키지 폴더에서 실행한다. 모노레포면 앱 폴더다.
- `FIGMA_ACCESS_TOKEN`이 비어 있으면 Figma 개인 토큰을 넣으라고 안내하고 멈춘다.

## 실행

```bash
npx --no figma-eval compare "<Figma URL>" <경로...> --json 2>"${TMPDIR:-/tmp}/figma-eval-compare.err"
```

`--no`는 npm에서 이름이 같은 다른 패키지를 내려받지 않게 한다. stderr는 파일로 따로 받아 읽는다. 섞이면 npm 경고와 안내 줄 때문에 JSON을 읽을 수 없다.

**stdout이 JSON이 아니면 채점 결과가 아니라 실행 오류다.** 종료 코드가 1이어도 `fail`로 세지 않는다. stderr를 그대로 전하고 멈춘다.

| stderr                         | 조치                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `npm error 404` … `figma-eval` | `@vapor-ui/figma-eval`을 devDependency로 설치하라고 안내한다 |
| `ENOENT`                       | 경로가 실행 폴더 기준인지 확인하고 다시 돌린다               |
| `403`                          | `FIGMA_ACCESS_TOKEN`이 시안 파일을 읽을 수 있는지 확인한다   |

JSON이 나와도 stderr에 `@vapor-ui/<pkg> is not installed` 또는 `@vapor-ui/<pkg> ships no figma-eval tables`가 있으면 그 패키지 컴포넌트는 채점되지 않았다. 시안에 그 패키지 컴포넌트가 있으면 거짓 `pass`가 나오거나 `unscorable` 항목이 생긴다.

- `pass`여도 그냥 합격으로 보고하지 않는다. "`pass`, 단 `<pkg>` 미채점"으로 보고한다. 시안에 그 패키지 컴포넌트가 있는지는 이 결과로 알 수 없다.
- `node_modules/@vapor-ui/<pkg>`가 없으면 설치를, 있으면 `@vapor-ui/figma-eval`과 같은 릴리스로 올리기를 안내한다. 예전 버전은 채점 표가 없어서 설치돼 있어도 `is not installed`로 찍힐 수 있다.
- 이 줄이 특정 `unscorable` 항목의 원인이라고 단정하지 않는다. JSON에는 항목의 패키지가 없다. 설치하거나 올린 뒤 다시 돌려서 남는 항목이 vapor-ui 쪽 원인이다.

## 결과 읽기

JSON이 나왔을 때 종료 코드와 `result`는 같다.

| 종료 코드 | `result`     | 뜻                                            |
| --------- | ------------ | --------------------------------------------- |
| 0         | `pass`       | 정답 집합의 모든 줄이 코드에 있다             |
| 1         | `fail`       | 빠졌거나 props가 다른 줄이 있다               |
| 2         | `unscorable` | 시안 일부를 확인할 수 없어 점수를 내지 않았다 |

보고에는 아래를 모두 담는다.

- 재현율 `ok/total (recall)`
- `status: "mismatch"` 줄마다 `line`, `diff`, `closest`(가장 가까운 코드 위치)
- `status: "missing"` 줄마다 `line`
- 제외(`excluded`) 개수와 사유별 개수. 사유는 컴포넌트가 스스로 그리는 아이콘·파트라서 코드에 쓸 수 없는 인스턴스다. 실패가 아니다.
- `unscorable`이면 `cause`와 `message`. 합격이라고 말하지 않는다. 채점되지 않은 패키지가 없는데도 남는 항목은 vapor-ui 쪽 Code Connect 누락이나 템플릿 오류라 사용자 코드로는 고칠 수 없다. `unscorable`이어도 `rows`의 `missing`·`mismatch`는 사용자 코드로 고칠 수 있다.

`line`은 정답 JSX 한 줄이고, `data-in`은 그 요소의 부모 컴포넌트다. 문구와 레이아웃은 보지 않는다.
