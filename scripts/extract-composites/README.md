# extract-composites

Figma composite 컴포넌트 문서를 재사용 가능한 CLI로 추출. JSON + 이미지(@2x PNG + WebP) + Code Connect 코드 산출.

**Jira**: [VAPOR-246](https://goorm-io.atlassian.net/browse/VAPOR-246) (Epic: [VAPOR-53](https://goorm-io.atlassian.net/browse/VAPOR-53))

## 설치

```bash
pnpm install
```

## 사용

```bash
# repo 루트 .env에 FIGMA_TOKEN=... 저장
pnpm -C scripts/extract-composites extract \
  "https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/-Composites--Vapor-Design-System?node-id=2192-33676"
```

### Options

| Flag              | 기본                                                    | 설명                                                 |
| ----------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| `<figma-url>`     | required                                                | Figma Dev Mode 링크. `fileKey` + `nodeId` 파싱       |
| `--slug <slug>`   | 캔버스 `name` kebab-case                                | output 디렉토리 이름 override                        |
| `--label <label>` | `React`                                                 | Code Connect label                                   |
| `--skip <names>`  | `Properties,Specifications,작성예정,Related components` | 평탄화 후 제외할 섹션 이름                           |
| `--clean`         | false                                                   | output 디렉토리 전체 삭제 후 재생성 (기본 overwrite) |

## 출력

```
apps/website/public/composites/<slug>/
├── index.json
├── images/
│   ├── anatomy.webp
│   └── <section>-<nn>.webp
└── examples/
    └── examples-<nn>.tsx
```

모든 이미지는 WebP (quality 80, @2x 소스 PNG → sharp 변환).

### `index.json` 스키마

```jsonc
{
  "slug": "dialog",
  "name": "Dialog",
  "description": "...",
  "source": {
    "fileKey": "he4tiAGOKGPl0Fm56ZpJsy",
    "nodeId": "2192:33676",
    "extractedAt": "2026-10-15T..."
  },
  "sections": {
    "anatomy": {
      "title": "Anatomy",
      "image": "images/anatomy.webp",
      "items": [{ "name": "Backdrop", "optional": false }, ...]
    },
    "examples": {
      "title": "Examples",
      "items": [{
        "subtitle": "Form",
        "description": "사용자의 정보 입력이 필요할 경우 사용하세요",
        "code": "examples/examples-01.tsx",
        "codeLabel": "React"
      }]
    },
    "doDont": {
      "title": "Do + Don't",
      "items": [{
        "subtitle": "Scroll",
        "do":   { "image": "images/do-dont-01-do.webp",   "caption": "..." },
        "dont": { "image": "images/do-dont-01-dont.webp", "caption": "..." }
      }]
    },
    "pattern": {
      "title": "Pattern",
      "items": [{
        "subtitle": "...",
        "description": "...",
        "image": "images/pattern-01.webp"
      }]
    }
  }
}
```

필드는 역할별 **선택적**. 섹션 없으면 key 생략. 모든 image는 WebP 상대 경로 문자열.

## 추출 알고리즘

1. **URL 파싱** → `fileKey`, `nodeId`
2. **컴포넌트 메타**
    - `name`: cover 프레임 Header 내 TEXT name=`component name`
    - `slug`: `kebabCase(canvasName)`
    - `description`: cover 프레임 Header 내 TEXT name=`component description`
3. **섹션 평탄화**
    - top-level + 2nd-level 프레임 자동 평탄화 (Overview, Best practices unwrap)
    - skip list: `Properties`, `Specifications`, `작성예정`, `Related components`, cover frame
    - 섹션 key 매핑: `Do + Don't` → `doDont`, 외는 camelCase
4. **섹션 title**: 섹션 FRAME 직속 `Component guide/Header` 내 TEXT name=`section title`
5. **items 메타 (공통)**: `Component guide/Content block` 안 **shallow** `Component guide/Text` 수집 (중첩 Component guide/Text 내부 미탐색)
    - placeholder (`body`, `section title`, `section subtitle` 리터럴) 제외
    - y 좌표 정렬 → 1번째 = `subtitle`, 2번째 = `description`
6. **섹션별 특수 룰**
    - **anatomy**: Sample 1장 → 섹션 레벨 `image`. "Anatomy name" FRAME 안 "description" rows → items `[{name, optional}]`
    - **examples**: Content block > Sample slot > 첫 non-Component-guide instance → Code Connect fetch (label 기본 React). 매핑 없으면 warning + `code: null`
    - **doDont**: Content block > Wrapper > `Do`/`Don't` FRAME > Sample → do/dont 쌍 image. caption = `Component guide/do+don't description` TEXT
    - **pattern/기타**: 각 Sample = 1 item + subtitle/description + image
7. **이미지**: Figma REST PNG @2x → `sharp` WebP quality 80 (쌍 저장)

## 정책

- **Idempotency**: 기본 overwrite. `--clean` 플래그만 디렉토리 초기화
- **종료 코드**: 성공 0, warning 있어도 0, 치명 에러 1
- **로깅**: 콘솔 요약 (`warnings: N, errors: 0`)
- **Env 로딩**: dotenv (CLI 내부, worktree 루트 → 메인 레포 fallback)

## 비범위 (후속 티켓)

- `Related components` 섹션 (구조 변경 여지 큼 — 현재 skip)
- `Specifications` 섹션
- 렌더링 (Fumadocs `/docs/composites/<slug>` 라우트)
- S3 업로드 자동화
- 다중 컴포넌트 batch (`--manifest`)

## 참고

- 유사 패키지: [`scripts/ts-api-extractor/`](../ts-api-extractor)
- 아이콘 추출: [`scripts/icon-extractor/`](../icon-extractor)
