# CLAUDE.md

이 문서의 규칙은 `packages/figma-blueprint/**`에서 지킨다. 설계와 모듈별 책임, `--json` 형식은 [RFC-0002](../../docs/rfcs/0002-figma-blueprint.md)가 원본이다. 여기에는 코드와 lint가 알려 주지 않는 것만 적는다.

## 1. 명령과 빌드 순서

- 스크립트는 루트에서 `pnpm figma-blueprint build`, `lint`, `typecheck`, `test`처럼 하나씩 부른다.
- 템플릿 변경을 릴리스 전에 보려면 이 패키지를 빌드한 뒤 레포 루트에서 `node packages/figma-blueprint/bin/figma-blueprint.mjs <URL | tree.json> --repo .`을 실행한다. `--repo`는 설치된 패키지 대신 레포 소스의 템플릿과 표를 쓴다.
- `src`를 고쳤으면 core, composites, icons보다 이 패키지를 먼저 빌드한다. 세 패키지의 `build`는 끝에 `figma-blueprint ship`을 부르고, `ship`은 이 패키지의 `dist/`를 실행한다. `pnpm build`는 turbo가 순서를 맞추지만 `pnpm core build`는 맞추지 않는다.

## 2. 모듈 경계

- import 방향, `blueprint/`의 순수성, `fetch` 위치는 `eslint.config.mjs`가 강제한다. `pnpm figma-blueprint lint`의 오류 문구가 어긴 규칙을 알려 준다.
- import가 막히면 `except`를 넓히기 전에 코드를 그 결정을 맡은 모듈로 옮긴다. 어느 모듈이 무엇을 맡는지는 RFC-0002 "패키지 구성" 표를 본다.
- 파일 하나로 끝나는 모듈은 `src/` 루트에 두고, 내부 파일이 여럿인 모듈만 폴더로 만든다. 루트 파일은 폴더들 사이의 서로 다른 층에 있어서, 정리하려고 폴더에 넣으면 폴더 사이에 순환이 생기거나 zone에 걸린다.
- 새 모듈을 만들면 `eslint.config.mjs`에 zone도 추가한다. zone이 없는 루트 파일은 무엇이든 import할 수 있다.

## 3. 패키지 밖 계약

아래는 이 패키지의 테스트가 지켜 주지 않는다. 바꾸면 같은 변경에서 상대편도 고친다.

- **`--json`의 `version`.** 필드를 바꾸거나 지우면 올린다. `plugins/vapor-ui/skills/visual-score/scripts/visual.mjs`가 `version !== 4`로 정확히 비교하므로 그 검사와 테스트 기대값을 함께 고친다.
- **`figma-blueprint/tables.json`의 모양.** `check-components` 스킬(`scripts/tally.mjs`, `references/verifier.md`)이 version 없이 직접 읽는다.
- **stderr 문구.** 플러그인 스킬이 `usage: figma-blueprint`, `403`, `is not installed`, `ships no figma-blueprint tables`를 문자열로 찾는다. 문구를 바꾸면 `plugins/vapor-ui/skills/`에서 같은 문자열을 찾아 고친다.
- **`FIGMA_KEY`.** 이미 배포된 core, composites, icons의 컴파일된 템플릿이 `Symbol.for('@vapor-ui/figma-blueprint')`로 대역을 찾는다. 바꾸지 않는다. `catalog.test.ts`가 이 값에서 실패하면 기대값이 아니라 코드를 되돌린다.
- **JS API.** `index.ts`의 export는 npm에 게시된 API다. 시그니처를 바꾸면 changeset에 적는다.

## 4. 레포의 데이터 파일

### `packages/<pkg>/figma-entries.json`

- `figma-blueprint entries`가 만든다. 손으로 고치지 않는다.
- 템플릿 파일을 추가하거나 옮기거나, `// url=` 줄이나 batch 행을 바꾸면 다시 만든다. 빠뜨리면 `entries.test.ts`가 실패한다. 템플릿 본문만 고쳤으면 다시 만들 필요가 없다.
- 토큰은 `packages/figma-blueprint/.env`에 둔다(`.env.example` 참고). Code Connect CLI가 읽는 `packages/core/.env`와 다른 파일이다. 그다음 `pnpm figma-blueprint figma:entries`를 실행한다.
- exit 1은 Figma에 발행되지 않은 URL이 있다는 뜻이다. 그 URL만 빠지고 파일은 이미 다시 쓰였다.
- changeset은 entries가 바뀐 컴포넌트 패키지에 건다. entries는 그 패키지의 `figma-blueprint/tables.json`에 담겨 배포된다.
- composites의 키가 바뀌면 이 패키지에도 changeset을 건다. `packages.ts`가 빌드할 때 composites 키를 번들에 담는다.
- Figma 재발행으로 키만 바뀐 경우는 PR CI가 잡지 못한다. 매주 도는 `.github/workflows/figma-library.yml`이 재생성 PR을 연다.

### `packages/<pkg>/figma-exceptions.json`

- core와 composites에서 일부러 Code Connect를 붙이지 않는 라이브러리 컴포넌트를 `{ "figma": { "<컴포넌트 키>": "<사유>" } }`로 적는다. 사유에는 연결하지 않는 이유를 쓴다.
- 그 컴포넌트가 연결되거나 Figma에서 사라지면 `library`가 예외를 stale로 보고한다. 그때 지운다.

### `packages/<pkg>/figma-blueprint/`

- 컴포넌트 패키지를 빌드할 때 `ship`이 지우고 다시 쓴다. git에 넣지 않고 손으로 고치지 않는다.

## 5. turbo 캐시

- 테스트가 패키지 밖 파일을 새로 읽으면 `turbo.json`의 `@vapor-ui/figma-blueprint#test` inputs에 추가한다. 빌드가 읽으면 `#build`에 추가한다.
- 빠뜨리면 turbo가 캐시된 통과를 재생한다. PR #861이 entries 27개가 빠진 채 통과한 적이 있다(22b3b2612).

## 6. core와 composites 소스에 기대는 부분

- `catalog/tables.ts`는 core와 composites의 소스 관례를 읽어 표를 만든다. recipe 이름과 `defaultVariants`, `displayName`, `index.parts.ts`의 `X as Y`, `index.ts`의 `export * as`가 그 관례다.
- `tables.test.ts`가 실제 레포를 읽으므로 그쪽 이름을 바꾸면 이 패키지 테스트가 깨진다. 의도한 변경이면 추출기를 고친다.

## 7. 템플릿 실행

- `code-connect/stand-in.ts`는 Code Connect `figma` API 중 레포 템플릿이 쓰는 것만 구현한다.
- 대역에 없는 API를 쓰는 템플릿도 빌드와 테스트는 통과한다. 실행할 때 그 인스턴스만 `template-error`로 채점 불가가 된다.
- 템플릿에서 새 API를 보면 대역에 추가하고 fixture 트리로 테스트한다.

## 8. 테스트와 fixture

- 손으로 만든 REST 트리는 `src/__fixtures__/*.json`에, 미니 레포는 `src/__fixtures__/repo/`에 둔다. `__fixtures__`는 lint와 typecheck 대상이 아니므로 실수는 테스트 실패로만 드러난다.
- 실제 시안 트리는 커밋하지 않는다. 비공개 벤치 데이터다.
- 동작을 바꾸지 않는 리팩터는 core, composites, icons의 `ship` 출력이 바이트 단위로 같고 `dist/index.d.mts`가 그대로인지 확인한다.

## 9. 주석

- export에 JSDoc을 달지 않는다. core와 반대다. 의미는 이름과 구조에 담는다.
- 코드로 없앨 수 없는 한계만 주석으로 남기고 `ponytail:` 표시를 붙인다.
