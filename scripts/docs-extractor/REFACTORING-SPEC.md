# docs-extractor 리팩토링 스펙

## Overview

React 컴포넌트의 Props 타입을 추출하여 JSON으로 출력하는 CLI 도구의 리팩토링 계획.
vapor-ui 디자인 시스템의 문서화 자동화를 위한 핵심 인프라.

## Goals

1. **다국어 지원**: 출력 경로를 언어별로 분리하여 외부 번역 시스템(Crowdin) 연동 준비
2. **Sprinkles Props 선택적 추출**: vars.* 토큰 사용 여부 기반으로 sprinkles props 필터링
3. **설정 파일 도입**: 컴포넌트별 커스텀 옵션을 TypeScript 설정 파일로 관리
4. **Base-UI Props 완전 지원**: 래핑 컴포넌트의 모든 Base-UI props 추출
5. **Property.type 구조 개선**: `string[]` → `type: string, values?: string[]` 분리
6. **테스트 전면 재작성**: 새 모듈 구조에 맞춘 테스트 코드 재설계

## Non-Goals

- AI 기반 자동 번역 (Crowdin 등 외부 시스템에서 처리)
- 실시간 타입 체킹 또는 린팅 기능
- 문서 사이트 빌드 통합 (별도 빌드 파이프라인에서 처리)
- Compound component 출력 구조 변경 (현재 sub-component별 파일 유지)
- Props source 필드 추가 (vapor-ui / base-ui / variants 구분)

---

## Technical Design

### 1. 아키텍처

```
docs-extractor/
├── src/
│   ├── bin/cli.ts                    # CLI 엔트리포인트
│   ├── cli/
│   │   ├── index.ts                  # CLI 메인 로직
│   │   └── options.ts                # 옵션 파싱 및 검증
│   ├── config/
│   │   ├── loader.ts                 # 설정 파일 로딩 (NEW)
│   │   ├── schema.ts                 # 설정 스키마 정의 (NEW)
│   │   └── defaults.ts               # 기본 설정값 (NEW)
│   ├── core/
│   │   ├── props-extractor.ts        # Props 추출 (리팩토링)
│   │   ├── type-resolver.ts          # 타입 변환
│   │   ├── default-variants.ts       # defaultVariants 추출
│   │   ├── base-ui-type-resolver.ts  # Base-UI 타입 매핑
│   │   ├── declaration-source.ts     # 선언 위치 기반 필터링
│   │   ├── sprinkles-analyzer.ts     # Sprinkles props 분석 (NEW)
│   │   ├── html-attributes.ts        # HTML 속성 목록
│   │   ├── type-cleaner.ts           # 타입 정제
│   │   ├── scanner.ts                # 파일 스캔
│   │   ├── project.ts                # ts-morph 프로젝트 관리
│   │   └── config.ts                 # tsconfig 감지
│   ├── output/
│   │   ├── writer.ts                 # 파일 출력 (NEW)
│   │   └── formatter.ts              # JSON 포맷팅 (NEW)
│   ├── i18n/
│   │   └── path-resolver.ts          # 언어별 경로 처리 (NEW)
│   ├── types/
│   │   └── props.ts                  # 타입 정의 (수정)
│   └── index.ts                      # Public API
├── generated/
│   └── sprinkles-meta.json           # 빌드 시 생성된 sprinkles 메타데이터
├── test/
│   └── ...                           # 전면 재작성
└── docs-extractor.config.ts          # 프로젝트 설정 예시
```

### 2. 설정 파일 스키마

```typescript
// docs-extractor.config.ts
import { defineConfig } from '@vapor-ui/docs-extractor';

export default defineConfig({
  global: {
    outputDir: './output',
    languages: ['ko', 'en'],
    defaultLanguage: 'ko',
    filterExternal: true,
    filterSprinkles: true,
    filterHtml: true,
    includeHtml: ['className', 'style'],
  },

  sprinkles: {
    // 빌드 시 생성된 메타데이터 경로
    metaPath: './generated/sprinkles-meta.json',
    // 전역 포함할 sprinkles props (token 기반)
    include: ['padding', 'paddingX', 'paddingY', 'margin', 'gap', 'color'],
  },

  // 컴포넌트별 설정 - 파일 경로로 식별
  components: {
    'button/button.tsx': {
      sprinkles: ['padding', 'paddingX', 'paddingY'],
    },
    'box/box.tsx': {
      sprinklesAll: true,  // 모든 sprinkles props 포함
    },
    'flex/flex.tsx': {
      sprinkles: ['gap', 'alignItems', 'justifyContent'],
    },
    'dialog/dialog.tsx': {
      exclude: ['internalProp'],  // 특정 props 제외
    },
  },
});
```

### 3. Sprinkles 분석 시스템

#### 3.1 빌드 시 메타데이터 생성

```bash
# package.json scripts
{
  "prebuild": "node scripts/generate-sprinkles-meta.ts"
}
```

```typescript
// scripts/generate-sprinkles-meta.ts
// sprinkles.css.ts를 AST 파싱하여 각 prop이 vars.* 토큰을 사용하는지 분석

interface SprinklesMeta {
  tokenProps: string[];      // vars.* 토큰을 사용하는 props
  nonTokenProps: string[];   // 순수 CSS 값만 사용하는 props
  propDefinitions: {
    [propName: string]: {
      usesToken: boolean;
      tokenPath?: string;    // e.g., "vars.size.space"
      cssProperty: string;   // e.g., "padding"
    };
  };
}
```

#### 3.2 생성된 메타데이터 예시

```json
{
  "tokenProps": [
    "padding", "paddingX", "paddingY", "paddingTop", "paddingRight",
    "paddingBottom", "paddingLeft", "margin", "marginX", "marginY",
    "gap", "rowGap", "columnGap", "color", "backgroundColor", "borderColor"
  ],
  "nonTokenProps": ["display", "position", "overflow", "cursor"],
  "propDefinitions": {
    "padding": {
      "usesToken": true,
      "tokenPath": "vars.size.space",
      "cssProperty": "padding"
    },
    "display": {
      "usesToken": false,
      "cssProperty": "display"
    }
  }
}
```

#### 3.3 메타데이터 없을 때 동작

- **경고 메시지 출력**: "sprinkles-meta.json not found. Sprinkles filtering disabled."
- **sprinkles 필터링 비활성화**: 전체 포함 또는 전체 제외로 동작
- **추출은 계속 진행**: 다른 기능에는 영향 없음

### 4. 다국어 지원 (i18n)

#### 4.1 출력 구조

```
output/
├── ko/
│   ├── button.json
│   ├── tabs-root.json
│   └── ...
└── en/
    ├── button.json
    ├── tabs-root.json
    └── ...
```

#### 4.2 CLI 사용법

```bash
# 기본 (설정 파일의 defaultLanguage)
pnpm extract ./packages/core

# 특정 언어로 출력
pnpm extract ./packages/core --lang en

# 모든 언어로 출력
pnpm extract ./packages/core --lang all
```

#### 4.3 Crowdin 연동 워크플로우

1. **extractor 실행**: `pnpm extract --lang ko` → `output/ko/*.json` 생성
2. **CI에서 Crowdin 업로드**: `crowdin upload sources`
3. **번역 완료 후 다운로드**: `crowdin download`
4. **번역된 파일 배포**: `output/en/*.json` 등 언어별 파일 생성

> **Note**: extractor는 소스 파일 추출만 담당. Crowdin 연동은 별도 CI/CD 스크립트에서 처리.

### 5. Base-UI Props 추출

#### 5.1 동작 방식

```typescript
// vapor-ui가 래핑만 하는 경우
export namespace CollapsibleRoot {
  type PrimitiveRootProps = VComponentProps<typeof BaseCollapsible.Root>;
  export interface Props extends PrimitiveRootProps {}
}
```

- **전체 Base-UI props 포함**: 래핑 컴포넌트도 모든 Base-UI props 문서화
- **d.ts JSDoc 추출 시도**: `node_modules/@base-ui/react`의 `.d.ts` 파일에서 JSDoc 추출
- **추출 실패 시 생략**: description 없이 타입 정보만 제공

#### 5.2 출력 예시

```json
{
  "name": "CollapsibleRoot",
  "displayName": "Collapsible.Root",
  "props": [
    {
      "name": "open",
      "type": "boolean | undefined",
      "values": ["boolean", "undefined"],
      "required": false,
      "description": "Whether the collapsible is open."
    },
    {
      "name": "onOpenChange",
      "type": "(open: boolean) => void | undefined",
      "values": ["(open: boolean) => void", "undefined"],
      "required": false
    }
  ]
}
```

---

## Data Model

### Property 인터페이스 (변경)

```typescript
// 기존
interface Property {
  name: string;
  type: string[];         // union의 각 값을 배열로
  required: boolean;
  description?: string;
  defaultValue?: string;
}

// 변경 후
interface Property {
  name: string;
  type: string;           // 전체 타입 문자열 (e.g., "boolean | undefined")
  values?: string[];      // union의 개별 값들 (e.g., ["boolean", "undefined"])
  required: boolean;
  description?: string;
  defaultValue?: string;
}
```

### PropsInfo 인터페이스 (유지)

```typescript
interface PropsInfo {
  name: string;           // namespace 이름
  displayName: string;    // 표시 이름
  description?: string;   // 컴포넌트 설명
  props: Property[];      // props 목록
  defaultElement?: string; // 기본 렌더링 요소
}
```

### ExtractorConfig 인터페이스 (신규)

```typescript
interface ExtractorConfig {
  global: {
    outputDir: string;
    languages: string[];
    defaultLanguage: string;
    filterExternal: boolean;
    filterSprinkles: boolean;
    filterHtml: boolean;
    includeHtml?: string[];
  };
  sprinkles: {
    metaPath: string;
    include?: string[];
  };
  components: {
    [filePath: string]: ComponentConfig;  // 파일 경로로 식별
  };
}

interface ComponentConfig {
  sprinkles?: string[];      // 포함할 sprinkles props
  sprinklesAll?: boolean;    // 모든 sprinkles 포함
  exclude?: string[];        // 제외할 props
  include?: string[];        // 강제 포함할 props
}
```

---

## CLI Interface

### 기존 옵션 (유지)

| 옵션 | 단축 | 설명 |
|------|------|------|
| `--tsconfig` | `-c` | tsconfig.json 경로 |
| `--component` | `-n` | 추출할 컴포넌트 이름 |
| `--output` | `-o` | 출력 파일 경로 |
| `--output-dir` | `-d` | 출력 디렉토리 |
| `--all` | `-a` | 모든 props 포함 |
| `--include` | | 특정 props 포함 |
| `--include-html` | | HTML 속성 화이트리스트 |
| `--ignore` | `-i` | 무시 패턴 |

### 제거된 옵션

| 옵션 | 대체 방법 |
|------|----------|
| `--sprinkles` | 설정 파일의 `sprinkles` 섹션 사용 |

### 신규 옵션

| 옵션 | 단축 | 설명 |
|------|------|------|
| `--config` | | 설정 파일 경로 (기본: docs-extractor.config.ts) |
| `--lang` | `-l` | 출력 언어 (ko, en, all) |
| `--no-config` | | 설정 파일 무시 |

---

## Implementation Plan

### Phase 1: 기반 구조 (High Priority)

#### 1.1 설정 파일 시스템 구현
- `src/config/loader.ts` - 설정 파일 로딩
- `src/config/schema.ts` - Zod 스키마 정의
- `src/config/defaults.ts` - 기본값 정의
- `defineConfig()` 헬퍼 함수 및 타입

#### 1.2 Sprinkles 메타데이터 생성기
- `scripts/generate-sprinkles-meta.ts` 작성
- sprinkles.css.ts AST 파싱 로직
- vars.* 토큰 사용 여부 분석
- `generated/sprinkles-meta.json` 출력

### Phase 2: 핵심 기능 개선 (High Priority)

#### 2.1 props-extractor.ts 리팩토링
- 설정 파일 기반 필터링 로직
- Sprinkles 메타데이터 연동
- 컴포넌트별 옵션 적용
- Property.type 구조 변경 (string[] → string + values)

#### 2.2 Base-UI JSDoc 추출 개선
- d.ts 파일에서 JSDoc 추출 로직
- description 없을 때 graceful fallback

### Phase 3: 출력 시스템 (Medium Priority)

#### 3.1 다국어 출력 경로 지원
- `src/i18n/path-resolver.ts` 구현
- `--lang` CLI 옵션 추가
- 언어별 디렉토리 생성

#### 3.2 출력 모듈 분리
- `src/output/writer.ts` - 파일 출력 로직
- `src/output/formatter.ts` - JSON 포맷팅

### Phase 4: 테스트 및 문서화 (Medium Priority)

#### 4.1 테스트 전면 재작성
- 새 모듈 구조에 맞춘 테스트 설계
- 설정 파일 로딩 테스트
- Sprinkles 필터링 테스트
- Base-UI props 추출 테스트
- 다국어 출력 테스트

#### 4.2 문서 업데이트
- spec.md 업데이트
- 설정 파일 예시 문서화
- CLI 옵션 문서화

### Phase 5: 마이그레이션 (High Priority)

#### 5.1 문서 사이트 코드 수정
- Property.type 구조 변경에 따른 코드 수정
- `type: string[]` → `type: string, values?: string[]` 대응
- 동시 배포 준비

---

## Edge Cases

### 1. Base-UI Props 없는 래핑 컴포넌트

**상황**: vapor-ui가 단순 래핑만 하고 추가 props가 없는 경우

**해결**: Base-UI의 모든 props를 vapor-ui props로 노출

### 2. Compound Component 이름 충돌

**상황**: Tabs.Root와 Dialog.Root 같은 이름 충돌

**해결**: 파일명에 부모 컴포넌트 이름 포함 (현재 동작 유지)

```
output/ko/tabs-root.json
output/ko/dialog-root.json
```

### 3. 설정 파일 없는 경우

**상황**: docs-extractor.config.ts가 없는 프로젝트

**해결**: 기본값 사용 (sprinkles 전체 제외)

### 4. sprinkles-meta.json 없는 경우

**상황**: prebuild를 실행하지 않아 메타데이터 파일이 없음

**해결**:
- 경고 메시지 출력
- sprinkles 필터링 비활성화
- 추출은 계속 진행

---

## Testing Strategy

### Unit Tests

```typescript
// config/loader.test.ts
- 설정 파일 로딩 성공/실패
- 스키마 검증
- 기본값 병합
- 파일 경로 기반 컴포넌트 매칭

// core/sprinkles-analyzer.test.ts
- vars.* 토큰 감지
- 메타데이터 로딩
- 필터링 로직
- 메타데이터 없을 때 fallback

// core/props-extractor.test.ts
- 컴포넌트별 설정 적용
- Base-UI props 추출
- Props 정렬
- type 구조 변환 (string[] → string + values)
```

### Integration Tests

```typescript
// 실제 vapor-ui 컴포넌트로 E2E 테스트
- Button 추출 → variants + defaultVariants
- Tabs 추출 → compound component 분리
- Collapsible 추출 → Base-UI props 포함
- Box 추출 → sprinkles props 처리
```

---

## Migration & Rollout

### 하위 호환성

- 기존 CLI 옵션 모두 유지
- 설정 파일 없이도 기존처럼 동작

### Breaking Change: Property.type 구조

```typescript
// 기존
{ type: ["boolean", "undefined"] }

// 변경 후
{ type: "boolean | undefined", values: ["boolean", "undefined"] }
```

**마이그레이션 전략**: 문서 사이트 코드와 동시 수정 및 배포

### 점진적 마이그레이션

1. Phase 1-2 완료 후 내부 테스트
2. 기존 문서 빌드 파이프라인과 호환성 확인
3. 설정 파일 도입은 opt-in
4. 문서 사이트 코드 수정 준비
5. 동시 배포 (extractor + 문서 사이트)
6. 다국어 지원은 Crowdin 연동 준비 완료 후 활성화

### Rollback Plan

- 기존 코드를 별도 브랜치로 보존
- 설정 파일 시스템은 `--no-config`로 비활성화 가능
- 문제 발생 시 이전 버전으로 빠른 롤백

---

## Decision Log

| 날짜 | 결정 사항 | 근거 |
|------|----------|------|
| 2025-01-30 | 다국어: 별도 번역 JSON 파일 | Crowdin 연동 용이 |
| 2025-01-30 | 설정: TypeScript 설정 파일 | 타입 안전성, IDE 지원 |
| 2025-01-30 | Base-UI: 전체 props 포함 | 개발자 친화적 문서화 |
| 2025-01-30 | Crowdin 연동: extractor는 추출만 | 단일 책임 원칙 |
| 2025-01-30 | Sprinkles: 빌드 시 캐시 생성 | 성능 최적화 |
| 2025-01-30 | 테스트: 전면 재작성 | 새 모듈 구조 반영 |
| 2025-01-30 | 출력 구조: sub-component별 파일 유지 | 기존 파이프라인 호환 |
| 2025-01-30 | Token 기준: vars.* 사용 여부 | 명확한 구분 기준 |
| 2025-01-30 | 컴포넌트 식별: 파일 경로 | 정확한 매칭 |
| 2025-01-30 | Base-UI description: 실패 시 생략 | 단순화, 유지보수 용이 |
| 2025-01-30 | Property.type: raw + values 분리 | 더 명확한 구조 |
| 2025-01-30 | Props source 필드: 추가 안 함 | 현재 불필요 |
| 2025-01-30 | type 변경 마이그레이션: 문서 사이트 동시 수정 | 깔끔한 전환 |
| 2025-01-30 | sprinkles-meta 없을 때: 경고 후 계속 | 유연한 동작 |
| 2025-01-30 | Sprinkles CLI 옵션 제거 | 설정 파일만으로 관리, 단순화 |
