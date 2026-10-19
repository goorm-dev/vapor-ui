# extract-composites

Figma composite 컴포넌트 문서를 vapor-ui website용 MDX 파일로 추출.

**Jira**: [VAPOR-260](https://goorm-io.atlassian.net/browse/VAPOR-260) (후속: [VAPOR-261](https://goorm-io.atlassian.net/browse/VAPOR-261) — Examples 라이브 Preview). Epic [VAPOR-53](https://goorm-io.atlassian.net/browse/VAPOR-53).

## 설치

```sh
pnpm install
```

## 사용

```sh
pnpm -C scripts/extract-composites extract \
  "https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=2192-33676"
```

| 플래그           | 기본값                   | 설명                                                                                                                                         |
| ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `<figma-url>`    | required                 | Figma Dev Mode 링크. `fileKey` + `nodeId` 파싱                                                                                               |
| `--slug <slug>`  | 캔버스 `name` kebab-case | output 파일 이름 override                                                                                                                    |
| `--skip <names>` | —                        | 콤마 구분, 추가 스킵 섹션 이름 (기본 스킵: `Properties`, `Specifications`, `작성예정`, `Related components`, cover frame, canvas 동명 frame) |
| `--clean`        | false                    | MDX + public 디렉토리 삭제 후 추출                                                                                                           |

## 출력

| 경로                                                           | 내용                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/website/content/docs/composites/(components)/<slug>.mdx` | fumadocs 소스 MDX                                        |
| `apps/website/public/composites/<slug>/images/*.webp`          | 섹션별 WebP (anatomy, do-dont-NN-do/dont, pattern-NN, …) |

MDX 상단에 `{/* AUTO-GENERATED — DO NOT EDIT */}` 헤더가 들어감. 수정이 필요하면 **Figma에서** 수정 후 재추출.

## 섹션 매핑

| Figma 섹션      | MDX 템플릿                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `anatomy`       | `## Anatomy` + `<DocsImage>` + ordered list                                                                                    |
| `examples`      | `## Examples` + 각 `### subtitle` + description + TODO 주석 + fallback `<div>` placeholder (VAPOR-261에서 Live Preview로 교체) |
| `doDont`        | `## Do + Don't` + `### subtitle` + `<DocsGrid cols={2}>` + `<DoImage>`/`<DontImage>` 쌍                                        |
| `pattern`       | `## Pattern` + `### subtitle` + description + `<DocsImage>`                                                                    |
| `guidelines` 등 | 동일 generic 패턴                                                                                                              |

## Env

| 변수          | 설명                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| `FIGMA_TOKEN` | 필수. repo 루트 `.env` 자동 로드 (worktree는 메인 레포 `.env`도 fallback). |

## 변경 사항 (VAPOR-260)

- `index.json`, `examples/*.tsx` 생성 로직 제거. MDX 단일 산출물.
- `--label` 플래그 제거 (Code Connect 미사용).
- 경로 하드코딩 (`apps/website/content/...`, `apps/website/public/...`).
- Cover frame 발견 로직 개선: `name === 'Component'` 또는 `name === <canvas name>` 모두 skip.
