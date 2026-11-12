---
name: setup
description: figma-to-code, check-components, visual-score가 쓰는 환경을 앱에 갖춘다. Node 버전, 컴포넌트 패키지의 정답 표, @vapor-ui/figma-blueprint, FIGMA_ACCESS_TOKEN, Figma MCP, Playwright를 확인하고 빠진 것을 설치한다. 처음 쓰기 전에 한 번 실행한다.
disable-model-invocation: true
---

# vapor-ui 하네스 준비

확인은 모두 읽기만 한다. 설치는 사용자가 고른 항목만 실행한다. 몇 번을 다시 돌려도 결과가 같다.

## 1. 앱 폴더 정하기

`@vapor-ui/core`를 dependencies에 둔 `package.json`이 있는 폴더가 앱 폴더다. 모노레포에서 후보가 여럿이면 어느 폴더인지 묻는다. 없으면 vapor-ui를 쓰는 앱이 아니라고 알리고 멈춘다.

아래 명령은 모두 앱 폴더에서 실행한다. 패키지 매니저는 앱 폴더에서 위로 올라가며 처음 만나는 lockfile로 정한다(`pnpm-lock.yaml`, `yarn.lock`, `bun.lock`/`bun.lockb`, `package-lock.json`).

## 2. 확인

먼저 Node를 본다. `node -v`의 major가 22보다 작으면 figma-blueprint가 실행되지 않는다. Node 22 이상으로 올리라고 안내하고 멈춘다.

나머지는 모두 확인한 뒤 한 표로 보여 준다.

| 항목                                    | 확인 명령                                                                                                                               | 준비됨                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `core`, `icons`, `composites`의 정답 표 | 패키지마다 `node -e "require.resolve('@vapor-ui/<pkg>/figma-blueprint/tables.json')"`                                                   | 종료 코드 0              |
| `@vapor-ui/figma-blueprint`             | `npx --no figma-blueprint >"${TMPDIR:-/tmp}/vapor-setup.out" 2>&1; grep -q '^usage: figma-blueprint' "${TMPDIR:-/tmp}/vapor-setup.out"` | grep 성공                |
| `FIGMA_ACCESS_TOKEN`                    | 아래 토큰 확인                                                                                                                          | `200`                    |
| Figma MCP                               | 지금 쓸 수 있는 도구에 Figma MCP 서버의 `get_design_context`가 있는지 본다                                                              | 있음                     |
| Playwright                              | 아래 Playwright 확인                                                                                                                    | 둘 중 하나가 종료 코드 0 |

정답 표 확인이 실패하면 앱 `package.json`에 그 패키지가 있는지 본다. 있으면 정답 표가 없는 예전 버전이고, 없으면 설치되지 않은 것이다. `npx --no figma-blueprint`는 설치돼 있어도 종료 코드 1로 끝나므로 출력으로만 판정한다.

토큰 확인은 셸 환경 변수를 먼저 쓰고, 없으면 앱 폴더의 `.env`를 읽는다. figma-blueprint와 같은 순서다. 토큰 값은 출력하지 않는다.

```bash
node -e "if(require('fs').existsSync('.env'))process.loadEnvFile();const t=process.env.FIGMA_ACCESS_TOKEN;if(!t){console.log('missing');process.exit(1)}fetch('https://api.figma.com/v1/me',{headers:{'X-Figma-Token':t}}).then(r=>console.log(r.status))"
```

`.env`가 있으면 `git check-ignore -q .env`도 실행한다. 실패하면 `.env`가 커밋될 수 있다고 경고한다.

Playwright는 visual-score와 같은 순서로 찾는다. 앱에서 먼저 찾고, 없으면 npm 전역에서 찾는다.

```bash
node -e "require.resolve('playwright')"
node -e "require.resolve(require('path').join(require('child_process').execSync('npm root -g').toString().trim(),'playwright'))"
```

## 3. 설치

빠진 항목의 명령을 모아 한 번에 보여 주고, 실행할 항목을 고르게 한다. 고른 것만 실행한다. `<add>`는 패키지 매니저의 추가 명령이다(`npm install`, `pnpm add`, `yarn add`, `bun add`). `-D`는 devDependency다.

| 빠진 것                     | 명령                                                                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 정답 표가 없는 예전 버전    | `<add> @vapor-ui/<pkg>@^<major>`. major는 앱 `package.json`의 버전 범위에서 읽는다. major가 0이면 `@^0.<minor>`로 올린다                                                           |
| `composites` 미설치         | `<add> @vapor-ui/composites`. 설치하지 않으면 시안의 composites 컴포넌트가 채점 불가로 나온다고 함께 알린다                                                                        |
| `icons` 미설치              | `<add> @vapor-ui/icons`                                                                                                                                                            |
| `@vapor-ui/figma-blueprint` | `<add> -D @vapor-ui/figma-blueprint`                                                                                                                                               |
| Playwright                  | 전역과 앱 devDependency 중 하나를 묻는다. 전역은 `npm install -g playwright` 뒤 `playwright install chromium`, 앱은 `<add> -D playwright` 뒤 `npx playwright install chromium`이다 |

메이저 버전을 넘는 업그레이드는 하지 않는다. 같은 major 안에 정답 표가 있는 버전이 없으면 안내만 한다.

정답 표는 `@vapor-ui/core` 1.7.1, `@vapor-ui/icons` 1.3.3, `@vapor-ui/composites` 0.1.1부터 들어 있고, `@vapor-ui/figma-blueprint`는 0.0.1 이상이 필요하다. 설치나 업그레이드를 안내할 때 이 최소 버전을 함께 알린다. 판정은 버전 숫자가 아니라 위 정답 표 확인으로 한다.

`@vapor-ui/figma-blueprint` 설치가 `404`로 실패하면 아직 npm에 배포되지 않은 것이다. 그렇게 알리고 다음 항목으로 넘어간다.

아래 두 항목은 setup이 대신 하지 않는다. 방법만 안내한다.

- `FIGMA_ACCESS_TOKEN`: Figma 설정의 Security 탭에서 개인 토큰을 만든다. 셸 환경 변수나 앱 폴더의 `.env`에 둔다. 토큰 값을 대화에 붙여 넣지 말라고 함께 말한다. `401`이나 `403`이면 토큰이 만료됐거나 잘못된 것이다.
- Figma MCP: Claude Code에서는 `/plugin install figma@claude-plugins-official`로 Figma 공식 plugin을 설치한다. 다른 에이전트에서는 Figma MCP 서버를 연결한다.

## 4. 보고

설치한 항목을 다시 확인해 2의 표를 한 번 더 보여 준다. 항목마다 준비됨, 설치함, 건너뜀, 사용자가 할 일 중 하나를 적는다. 사용자가 할 일이 남았으면 무엇을 하면 되는지 한 줄씩 적는다. 정답 표나 `@vapor-ui/figma-blueprint`가 준비되지 않은 항목에는 3의 최소 버전을 함께 적는다.
