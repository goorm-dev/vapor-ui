---
name: check-components
description: 관문 1. Figma 시안이 요구하는 vapor-ui 컴포넌트와 props가 코드에 모두 들어갔는지 검증한다. figma-blueprint로 정답 트리를 뽑고, 새 검증 서브에이전트가 코드를 직접 읽어 노드마다 판정하고, tally.mjs로 집계한다. "컴포넌트 재현율 확인", "시안 컴포넌트 다 들어갔어?", "check components"처럼 말하거나 Figma 시안 구현을 검증할 때 쓴다.
---

# 관문 1: 컴포넌트 재현율

## 준비

- Figma URL(노드 하나).
- **진입점**: 시안을 구현한 화면 컴포넌트 파일. 이번 세션에서 구현했다면 그 파일이고, 아니면 사용자에게 묻는다. 진입점이 쓰는 다른 파일은 검증자가 따라가므로 모으지 않는다.
- 이번 세션이 쓰거나 고친 파일 목록. 없으면 빈 목록이다.
- `@vapor-ui/core`가 설치된 패키지 폴더에서 실행한다. 모노레포면 앱 폴더다. 이 폴더의 절대 경로가 아래의 `<root>`다.
- `FIGMA_ACCESS_TOKEN`이 비어 있으면 `/vapor-ui:setup`을 실행하라고 안내하고 멈춘다.

## 1. 정답 트리 뽑기

```bash
OUT="${TMPDIR:-/tmp}/vapor-check-components"; mkdir -p "$OUT"
npx --no figma-blueprint "<Figma URL>" --json >"$OUT/blueprint.json" 2>"$OUT/blueprint.err"
```

`--no`는 npm에서 이름이 같은 다른 패키지를 내려받지 않게 한다. stderr는 파일로 따로 받아 읽는다. 섞이면 npm 경고와 안내 줄 때문에 JSON을 읽을 수 없다.

| 종료 코드 | 뜻                                                                    |
| --------- | --------------------------------------------------------------------- |
| 0         | 정답 트리를 냈다                                                      |
| 2         | 정답 트리를 냈지만 읽지 못한 인스턴스가 `unscorable`에 있다. 계속한다 |
| 1         | 실행 오류다                                                           |

**stdout이 JSON이 아니면 실행 오류다.** 검증을 진행하지 않는다. stderr를 그대로 전하고 멈춘다.

| stderr                              | 조치                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| `npm error 404` … `figma-blueprint` | `/vapor-ui:setup`을 실행하라고 안내한다                    |
| `403`                               | `FIGMA_ACCESS_TOKEN`이 시안 파일을 읽을 수 있는지 확인한다 |

JSON이 나와도 stderr에 `@vapor-ui/<pkg> is not installed` 또는 `@vapor-ui/<pkg> ships no figma-blueprint tables`가 있으면 그 패키지는 채점되지 않았다. composites 컴포넌트는 정답 트리의 `unscorable`에 `not-installed`로 남는다. core·icons 컴포넌트는 정답 트리에서 빠지므로, 시안에 있으면 거짓 `pass`가 나올 수 있다.

- `pass`여도 그냥 합격으로 보고하지 않는다. "`pass`, 단 `<pkg>` 미채점"으로 보고한다. 시안에 그 패키지 컴포넌트가 있는지는 이 결과로 알 수 없다.
- `/vapor-ui:setup`을 실행하라고 안내한다. setup이 그 패키지를 설치하거나 정답 표가 들어 있는 버전으로 올린다.

- 이 줄이 특정 `unscorable` 항목의 원인이라고 단정하지 않는다. JSON 항목에는 패키지가 없다. 설치하거나 올린 뒤 다시 돌려서 남는 항목이 vapor-ui 쪽 원인이다.

## 2. 검증 서브에이전트

새 서브에이전트를 띄운다(Claude Code는 `Agent` 도구, `general-purpose`). 프롬프트는 `references/verifier.md` 전문을 그대로 붙이고, 그 아래에 입력 다섯 줄만 붙인다. 경로는 모두 절대 경로다.

```text
blueprint: <$OUT/blueprint.json>
entry: <진입점>
root: <root>
changed: <쓰거나 고친 파일, 쉼표로 구분. 없으면 없음>
report: <$OUT/report.json>
```

**생성 맥락은 넘기지 않는다.** 대화 내용, 시안 스크린샷, 무엇을 어떻게 구현했는지, 이전 관문 결과를 넣지 않는다. 자기 코드를 자기가 채점하지 않게 하려는 것이다. 서브에이전트를 띄울 수 없는 에이전트면 `references/verifier.md`대로 직접 판정하고, 보고에 "자기 채점"이라고 적는다.

## 3. 집계

```bash
node "<이 스킬 폴더>/scripts/tally.mjs" "$OUT/blueprint.json" "$OUT/report.json" --root <root> --json
```

| 종료 코드 | `result`     | 뜻                                                                                                                                  |
| --------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 0         | `pass`       | 모든 노드가 `ok`이고 채점 불가가 없다                                                                                               |
| 1         | `fail`       | 채점할 수 있는 노드 중 `ok`가 아닌 것이 있다. `evidence` 실패도 든다                                                                |
| 2         | `unscorable` | 채점할 수 있는 노드는 모두 `ok`지만 정답 트리나 판정에 채점 불가가 있다. 채점할 노드가 하나도 없을 때도 이렇다                      |
| 3         | 없음         | 보고가 형식에 맞지 않거나 정답 트리와 맞지 않는다(판정이 객체가 아님, id 누락·중복·모르는 id·모르는 상태, `note` 없는 `unscorable`) |

3이면 stderr를 붙여 검증 서브에이전트에게 보고를 고치게 하고 다시 집계한다. 직접 판정을 채우지 않는다.

`evidence`는 `ok` 판정의 `at`부터 세 줄 안에 그 태그를 여는 JSX 태그가 없다는 뜻이다. 주석·문자열·import에 적힌 이름은 치지 않는다. 거짓 통과를 막는 기계 검사다.

`reason: "no library instances in the design"`은 정답 트리에 노드도 `unscorable` 항목도 없다는 뜻이다. 시안이 라이브러리 인스턴스를 detach했거나 일반 프레임과 텍스트로만 그려져 있다. 코드로 고칠 문제가 아니다. 코드를 고치지 않고 이 사유를 그대로 보고한다.

## 4. 재확인

`failures`와 `evidence`의 줄마다 인용된 코드를 직접 다시 읽는다. `missing`이면 그 태그를 코드에서 찾는다.

- 판정을 뒤집을 코드 줄을 찾았을 때만 보고 JSON의 그 판정을 고친다. `status`와 `at`을 바꾸고 `note`에 `재확인:`으로 근거를 적는다.
- 줄을 찾지 못하면 판정을 그대로 둔다.
- 고쳤으면 3의 집계를 다시 돌린다. 마지막 집계가 이 관문의 결과다.

## 보고

- 결과와 재현율 `ok/scorable (recall)`, 상태별 개수. 채점할 노드가 하나도 없으면 `recall`은 `null`(텍스트 출력은 `n/a`)이고 재현율을 보고하지 않는다
- `failures`의 줄마다 id, 태그, 상태, `at`, `note`. `changed`가 붙은 줄은 이번 세션이 바꾼 파일이라고 표시한다
- 남은 `evidence` 실패마다 id, 태그, `at`, `reason`
- 재확인에서 고친 판정마다 이전 판정, 새 판정, 근거 줄
- 제외(`excluded`) 개수와 사유별 개수. 컴포넌트가 스스로 그리는 아이콘·파트라서 코드에 쓸 수 없는 인스턴스다. 실패가 아니다
- `unscorable`이면 정답 트리의 `unscorable` 항목마다 `name`, `cause`와, `unscorable` 판정마다 `note`. 합격이라고 말하지 않는다. 채점되지 않은 패키지가 없는데도 남는 정답 트리 항목은 vapor-ui 쪽 Code Connect 누락이나 템플릿 오류라 사용자 코드로는 고칠 수 없다

문구와 레이아웃은 이 관문에서 보지 않는다.
