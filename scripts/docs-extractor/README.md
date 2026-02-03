# @vapor-ui/ts-api-extractor

TypeScript AST 기반 컴포넌트 Props 추출 도구. vapor-ui 컴포넌트의 Props 타입 정보를 추출하여 문서화용 JSON 파일을 생성합니다.

## 위치 선택 이유

이 패키지는 `packages/` 대신 `scripts/` 디렉토리에 위치합니다:

- **단일 목적 내부 도구**: vapor-ui 문서 생성만을 위한 도구
- **외부 배포 불필요**: npm publish 예정 없음 (`private: true`)
- **pnpm-workspace.yaml에 명시**: workspace 패키지로 정상 동작

## 설치

프로젝트 내부 도구이므로 별도 설치가 필요 없습니다.

## 사용법

### 기본 실행

```bash
# 전체 컴포넌트 추출
pnpm --filter @vapor-ui/ts-api-extractor exec ts-api-extractor ./packages/core/src/components

# 특정 컴포넌트만 추출
pnpm --filter @vapor-ui/ts-api-extractor exec ts-api-extractor ./packages/core/src/components --component Button

# 출력 디렉토리 지정
pnpm --filter @vapor-ui/ts-api-extractor exec ts-api-extractor ./packages/core/src/components --output-dir ./output
```

### CLI 옵션

| 옵션             | 단축 | 설명                                              |
| ---------------- | ---- | ------------------------------------------------- |
| `--tsconfig`     | `-c` | tsconfig.json 경로 (기본: 자동 감지)              |
| `--exclude`      | `-e` | 제외 패턴 (여러 번 사용 가능)                     |
| `--component`    | `-n` | 특정 컴포넌트만 추출                              |
| `--output-dir`   | `-d` | 출력 디렉토리                                     |
| `--all`          | `-a` | 모든 props 포함 (node_modules + sprinkles + html) |
| `--include`      |      | 특정 props 포함                                   |
| `--include-html` |      | HTML 속성 화이트리스트                            |
| `--config`       |      | 설정 파일 경로                                    |
| `--no-config`    |      | 설정 파일 무시                                    |
| `--lang`         | `-l` | 출력 언어 (ko, en, all)                           |

## 설정 파일

`docs-extractor.config.ts` 파일로 추출 동작을 커스터마이징할 수 있습니다.

```typescript
import { defineConfig } from '@vapor-ui/ts-api-extractor';

export default defineConfig({
    global: {
        outputDir: './output',
        languages: ['ko', 'en'],
        defaultLanguage: 'ko',
        filterExternal: true, // React/DOM 타입 제외
        filterSprinkles: true, // Sprinkles props 제외
        filterHtml: true, // HTML 속성 제외
        includeHtml: ['className', 'style'], // 허용할 HTML 속성
    },
    sprinkles: {
        metaPath: './generated/sprinkles-meta.json',
        include: ['padding', 'margin', 'gap'],
    },
    components: {
        'box/box.tsx': {
            sprinklesAll: true, // Box는 모든 sprinkles 포함
        },
        'flex/flex.tsx': {
            sprinkles: ['gap', 'alignItems', 'justifyContent'],
        },
    },
});
```

설정 파일 예시는 `docs-extractor.config.example.ts`를 참고하세요.

## 아키텍처

```
scripts/docs-extractor/
├── src/
│   ├── bin/cli.ts              # CLI 엔트리포인트
│   ├── cli/                    # CLI 로직, Interactive prompts
│   ├── config/                 # Zod 기반 설정 시스템
│   │   ├── loader.ts           # 설정 파일 로딩 및 검증
│   │   ├── schema.ts           # Zod 스키마 정의
│   │   └── defaults.ts         # 기본값
│   ├── core/                   # Props 추출 핵심 로직
│   │   ├── props-extractor.ts  # Props 추출
│   │   ├── type-resolver.ts    # 타입 변환
│   │   ├── type-cleaner.ts     # 타입 정제
│   │   └── ...
│   ├── output/                 # JSON 출력
│   └── i18n/                   # 다국어 경로 처리
├── generated/                  # 빌드 시 생성되는 메타데이터 (아래 참조)
│   └── sprinkles-meta.json
└── dist/                       # 빌드 산출물
```

### generated/ 폴더

`generated/sprinkles-meta.json`은 `pnpm build` 시 `prebuild` 스크립트에서 자동 생성됩니다:

- **목적**: Sprinkles CSS props의 메타데이터 (토큰 사용 여부, CSS 속성 매핑 등)
- **생성 시점**: 빌드 전 (`scripts/generate-sprinkles-meta.ts` 실행)
- **사용처**: Props 추출 시 sprinkles props 필터링에 활용
- **위치 이유**: 빌드 산출물이므로 소스 코드(`src/`)와 분리, `.gitignore`에 포함 가능

## 출력 형식

추출된 JSON 파일 구조:

```json
{
    "name": "Button",
    "displayName": "Button",
    "description": "버튼 컴포넌트",
    "props": [
        {
            "name": "size",
            "type": ["sm", "md", "lg", "xl"],
            "required": false,
            "description": "버튼 크기",
            "defaultValue": "md"
        }
    ],
    "defaultElement": "button"
}
```

## 개발

```bash
# 빌드
pnpm --filter @vapor-ui/ts-api-extractor build

# 개발 모드 (watch)
pnpm --filter @vapor-ui/ts-api-extractor dev

# 테스트
pnpm --filter @vapor-ui/ts-api-extractor test

# 테스트 (커버리지 포함)
pnpm --filter @vapor-ui/ts-api-extractor test:coverage

# 타입 체크
pnpm --filter @vapor-ui/ts-api-extractor typecheck
```

## 라이선스

Internal use only.
