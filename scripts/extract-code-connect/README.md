# @vapor-ui/extract-code-connect

Figma 컴포넌트(URL 또는 MCP `get_context_for_code_connect` JSON)에서 `getProperties` 기반
parserless Code Connect 템플릿 `<kebab>.figma.ts`를 생성하는 CLI.

추출·렌더 규칙: `docs/superpowers/specs/2026-09-02-gen-code-connect-design.md`
패키지 설계: `docs/superpowers/specs/2026-09-03-extract-code-connect-cli-design.md`

## 소비 패키지에서 사용

```jsonc
// packages/<pkg>/package.json
"scripts": { "figma:gen": "extract-code-connect" },
"devDependencies": { "@vapor-ui/extract-code-connect": "workspace:*" }
```

```bash
pnpm --filter @vapor-ui/extract-code-connect build   # 최초 1회 (turbo test/typecheck 는 자동 선행)
pnpm <pkg> figma:gen "<figma-url>" [--force] [--from-json <p>] [--out <p>] [--utils <p>]
```

CLI 는 현재 작업 디렉터리를 소비 패키지 루트로 본다.

| 항목                   | 결정                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| 출력 기본 경로         | `src/components/<kebab>/<kebab>.figma.ts`                                   |
| `imports` 패키지명     | `figma.config.json` `packageImportPath` → 없으면 `package.json` `name`      |
| `getProperties` import | `--utils` (기본 `src/utils/figma-utils`) 를 출력 파일 기준 상대경로로 변환  |
| 루트 태그              | `src/components/<kebab>/index.parts.ts` 존재 → `<Pascal.Root>`              |
| `FIGMA_TOKEN`          | 환경변수 → 없으면 `<cwd>/.env`. `--from-json` 이면 불필요                   |

## 새 패키지에 도입하기 (예: core)

1. `src/utils/figma-utils.ts` 를 composites 에서 복사한다 (`getProperties`, `findChild`).
2. `figma.config.json` 에 `packageImportPath` 를 두거나 `package.json` `name` 에 맡긴다.
3. 위 devDependency·스크립트를 추가한다.

## 개발

```bash
pnpm --filter @vapor-ui/extract-code-connect test
pnpm --filter @vapor-ui/extract-code-connect typecheck
pnpm --filter @vapor-ui/extract-code-connect lint
```

테스트는 구현 파일 옆 `<name>.test.ts`. fixture 는 `src/fixtures/`.
