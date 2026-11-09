---
name: check-styling
description: 관문 2. 구현 코드에 absolute 배치와 하드코딩한 색·px 값이 있는지 `figma-eval styling`으로 검사한다. "하드코딩 값 검사", "absolute 썼는지 봐줘", "check styling", "figma-eval styling 돌려줘"처럼 말하거나 Figma 시안 구현을 검증할 때 쓴다.
---

# 관문 2: absolute·하드코딩 값

## 준비

- 입력은 검사할 파일 경로들이다. 이번에 쓰거나 고친 파일만 넘긴다. 모르면 묻는다.
- Figma 토큰은 필요 없다.

## 실행

```bash
npx --no figma-eval styling <파일...> --json 2>"${TMPDIR:-/tmp}/figma-eval.err"
```

`figma-eval`을 찾지 못하면 `@vapor-ui/figma-eval`을 devDependency로 설치하라고 안내하고 멈춘다. stderr 파일에 `usage: figma-eval` 줄이 있으면 설치된 버전에 `styling` 명령이 없다. 버전을 올리라고 안내하고 멈춘다. 그 밖에 stdout이 JSON이 아니면 실행 오류다. 종료 코드가 1이어도 `fail`로 세지 말고 stderr 파일 내용을 그대로 전한 뒤 멈춘다.

## 결과 읽기

종료 코드 0은 통과, 1은 실패다.

- `absolute`와 색 리터럴(hex·rgb·hsl)은 모두 실패다.
- px 값은 그 속성의 토큰 눈금에 있으면 실패다. 토큰으로 바꿔 쓸 수 있었다는 뜻이다.
- 예외 5종은 관문에서 빼고 개수만 센다. 에셋, sr-only, 1px 테두리, 토큰 눈금 밖 px, 입력창 아이콘이다.

보고에는 실패 항목을 파일과 줄 번호로 모두 적고, 예외는 종류별 개수를 **0개여도** 적는다. 예외가 많으면 토큰으로 옮길 수 있는 값이 숨어 있지 않은지 사용자가 볼 수 있어야 한다.
