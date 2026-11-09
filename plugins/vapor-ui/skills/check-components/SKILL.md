---
name: check-components
description: 관문 1. Figma 시안의 vapor-ui 컴포넌트와 props가 코드에 빠짐없이 들어갔는지 `figma-eval compare`로 채점한다. "컴포넌트 재현율 확인", "시안 컴포넌트 다 들어갔어?", "check components", "figma-eval compare 돌려줘"처럼 말하거나 Figma 시안 구현을 검증할 때 쓴다.
---

# 관문 1: 컴포넌트 재현율

## 준비

- 입력은 Figma URL(노드 하나)과 구현한 파일 경로들이다. 경로를 모르면 묻는다. 디렉터리도 받는다.
- `@vapor-ui/core`가 설치된 패키지 폴더에서 실행한다. 모노레포면 앱 폴더다.
- `FIGMA_ACCESS_TOKEN`이 비어 있으면 Figma 개인 토큰을 넣으라고 안내하고 멈춘다.

## 실행

```bash
npx --no figma-eval compare "<Figma URL>" <경로...> --json
```

`--no`는 npm에서 이름이 같은 다른 패키지를 내려받지 않게 한다. `figma-eval`을 찾지 못하면 `@vapor-ui/figma-eval`을 devDependency로 설치하라고 안내하고 멈춘다.

stderr에 `@vapor-ui/<pkg> ships no figma-eval tables`가 나오면 그 패키지 컴포넌트는 채점되지 않는다. 패키지를 `@vapor-ui/figma-eval`과 같은 릴리스로 올리라고 알린다.

## 결과 읽기

종료 코드와 `result`는 같다.

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
- `unscorable`이면 `cause`와 `message`. 합격이라고 말하지 않는다. 대부분 vapor-ui 쪽 Code Connect 누락이라 사용자 코드로는 고칠 수 없다.

`line`은 정답 JSX 한 줄이고, `data-in`은 그 요소의 부모 컴포넌트다. 문구와 레이아웃은 보지 않는다.
