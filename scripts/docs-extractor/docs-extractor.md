## 1. 개요 (Introduction)

### 1.1. 목적

본 문서는 `ts-morph` 라이브러리(TypeScript Compiler API 래퍼)를 기반으로 작성된 대상 컴포넌트의 코드를 정적으로 분석하고, 컴포넌트 및 Props에 대한 메타데이터를 추출하는 도구의 기능 요구사항을 정의한다. 이를 통해 문서화 사이트(Storybook, Docz 등)에 자동으로 JSON 형식의 데이터를 추출 및 제공하여 연동하는 것을 목표로 한다.

### 1.2. 시스템 범위

- `ts-morph`를 활용한 TypeScript AST(Abstract Syntax Tree) 파싱 및 순회
- TypeScript TypeChecker를 활용한 상속(`extends`), 교차 타입 평가 및 JSDoc 메타데이터 추출
- 추출된 데이터를 표준화된 포맷(예: JSON)으로 반환

## 2. 기능 요구사항 (Functional Requirements)

### 2.1. 환경 설정 및 파일 로드 (Environment Setup & File Loading)

| **ID**       | **기능명**                        | **상세 설명**                                                                                                                                | **비고**                               |
| ------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **REQ-E-01** | **ts-morph Project 초기화**       | `ts-morph`의 `Project` 인스턴스를 생성하며, 작업 디렉토리의 `tsconfig.json` 경로를 주입하여 컴파일러 옵션을 시스템에 동기화한다.             |                                        |
| **REQ-E-01A** | **Tsconfig 자동 탐색** | 주어진 디렉토리에서 시작해 상위 디렉토리로 계속 올라가며 `tsconfig.json` 파일을 자동으로 찾는 기능. REQ-E-01의 `Project` 초기화 시 수동 경로 대신 자동 검색 가능. | `findTsconfig()` 사용 |
| **REQ-E-02** | **대상 소스 파일 로드**           | `packages/core/src/components/**/*.tsx` 패턴을 사용하여 분석 대상 파일을 `Project`에 로드한다.                                               | `project.addSourceFilesAtPaths()` 활용 |
| **REQ-E-02A** | **파일 필터링 옵션 시스템** | 파일 스캔 시 제외할 패턴을 설정 가능. 기본 제외 대상: `.stories.tsx`, `.css.ts`, `.test.tsx`. `ScannerOptions` 인터페이스로 커스텀 제외 패턴 추가 가능. | `skipDefaultExcludes` 옵션 지원 |
| **REQ-E-02B** | **내보낸 노드 조회** | SourceFile의 모든 내보낸 선언을 맵 형태로 조회. 키는 선언명, 값은 ExportedDeclarations 배열로 반환. | `getExportedNodes()` 활용 |
| **REQ-E-03** | **사용자 정의 설정(Config) 로드** | 프로젝트 루트의 설정 파일(예: `docs-extractor.config.ts`, `docs-extractor.config.js` 등)을 로드하여 추출기 실행 시 필요한 세부 규칙(예: HTML Props 화이트리스트)을 적용한다. | `docs-extractor.config.*` 파일 지원 |
| **REQ-E-03A** | **설정 파일 자동 검색** | 현재 디렉토리에서 설정 파일을 순서대로 검색 (`docs-extractor.config.ts` → `.js` → `.mjs`). 가장 먼저 발견된 파일 사용. | `findConfigFile()` 활용 |
| **REQ-E-03B** | **설정 파일 로드 및 검증 파이프라인** | 설정 파일 로드, 동적 import(jiti), 스키마 검증(Zod), 에러 핸들링 통합. 파일 미존재/읽기 실패/검증 실패 시 기본 설정으로 폴백. 반환: `{ config, configPath?, source }` | `loadConfig()` 사용 |

### 2.1.1. CLI 대화형 모드 (Interactive Mode)

CLI 인자 미제공 시 사용자 프롬프트 기반의 대화형 모드 활성화 (`@inquirer/prompts` 라이브러리 활용):

| **ID**       | **기능명**                         | **상세 설명**                                                                                               | **비고** |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| **REQ-CLI-01** | **경로 입력 프롬프트** | 사용자에게 컴포넌트 경로 입력 요청. 기본값 '.'. 절대 경로로 변환 및 존재 여부 즉시 검증. | 프롬프트 밸리데이션 |
| **REQ-CLI-02** | **디렉토리 스캔 결과 검증** | findComponentFiles로 수집한 .tsx 파일 목록 검증. 파일을 ScannedComponent 객체로 변환 (filePath + componentName). 스캔 결과 0개 시 CliError 발생. | 스캔 후 검증 |
| **REQ-CLI-03** | **컴포넌트 선택 프롬프트** | 체크박스로 단일/복수 컴포넌트 선택. '[ 전체 선택 ]' 메타 옵션 지원. 선택된 파일 경로 배열 반환. | 멀티셀렉트 UI |
| **REQ-CLI-04** | **옵션 통합 해결** | 5단계 파이프라인: Path → Tsconfig → Scan → Selection → Options. 각 단계 실패 시 CliError 발생. `ResolvedCliOptions` 반환. | `resolveOptions()` 함수 |

### 2.2. 컴포넌트 식별 및 정보 추출 (Component-level Analysis)

| **ID**       | **기능명**                         | **상세 설명**                                                                                               | **비고** |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| **REQ-C-01** | **컴포넌트 식별 (Identification)** | `namespace` 모듈과 그 내부에 선언된 `interface Props`를 기반으로 분석 대상 컴포넌트를 특정한다.             |          |
| **REQ-C-01A** | **컴포넌트 파일명 정규화 및 매칭** | 컴포넌트명을 소문자로 변환하고 하이픈 제거 (예: `Button-Group` → `buttongroup`). 여러 파일 중에서 주어진 컴포넌트명과 일치하는 파일 검색. | `normalizeComponentName()`, `findFileByComponentName()` 활용 |
| **REQ-C-01B** | **내보낸 namespace 모듈 조회** | 소스 파일에서 `export namespace` 형태로 선언된 모든 namespace 모듈 검색. `ModuleDeclarationKind.Namespace` 타입이며 `isExported()` 조건 필터링. | `getExportedNamespaces()` 사용 |
| **REQ-C-01C** | **Props 인터페이스 검색** | 주어진 namespace 내에서 `interface Props`를 찾음. 내보낸(`isExported()`) Props 인터페이스만 선택. | `findExportedInterfaceProps()` 활용 |
| **REQ-C-02** | **Component Description 추출**     | 컴포넌트 선언부 상단의 JSDoc에서 `jsDoc.getDescription()`을 통해 태그를 제외한 순수 설명 텍스트를 추출한다. |          |
| **REQ-C-03** | **기본 렌더링 요소(Default Element) 추출** | 컴포넌트 정의 내 `render` 속성에서 JSX 요소 태그명 추출. 자체 폐쇄 요소(`<div />`) 또는 일반 요소 모두 지원. 예: `Button` 컴포넌트에서 `render: button || <div />` → `"div"` 추출. | `getDefaultElement()` 사용 |
| **REQ-C-04** | **컴포넌트별 추출 옵션 커스터마이징** | 컴포넌트별 설정으로 추출 옵션 오버라이드. `sprinklesAll`, `sprinkles[]`, `component-specific include` 지원. | 다중 설정 병합 |
| **REQ-C-05** | **컴포넌트 선택 검증** | 스캔된 컴포넌트 목록에서 요청 컴포넌트 매칭. 유효하면 파일 경로 반환, 아니면 가용 목록 반환. | `validateComponent()` 활용 |

### 2.3. Props 정보 추출 (Props-level Analysis)

| **ID**       | **기능명**                           | **상세 설명**                                                                                                                                                                                                      | **비고**                    |
| ------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| **REQ-P-01** | **전체 병합 Props 식별**             | `interface Props`의 최종 평가된 Type 객체에서 상속된 모든 속성 심볼을 확보한다.                                                                                                                                    | 상속 구조 평탄화 (Flatten)  |
| **REQ-P-02** | **Base UI/System Props 필터링 분석** | 외부 라이브러리(`@base-ui` 등)에서 상속된 속성 중, 기본 HTML DOM 속성은 **기본적으로 추출에서 제외**한다. 단, Config 파일에 명시된 화이트리스트(Whitelist) 속성(예: `className`, `onClick`)은 예외적으로 추출한다. | 과도한 HTML 속성 추출 방지  |
| **REQ-P-03** | **Style Variants Props 분석**        | `RecipeVariants`에서 추론된 유니온 타입을 리터럴 배열 형태로 추출한다.                                                                                                                                             | ex) `["sm", "md"]`          |
| **REQ-P-04** | **Variants DefaultValue 역추적**     | `recipe` 함수 정의부의 `defaultVariants` 객체를 AST 수준에서 역추적하여 기본값을 매핑한다.                                                                                                                         | vanilla-extract 컨벤션 대응 |
| **REQ-P-05** | **Props 메타데이터 추출**            | 각 속성의 JSDoc 설명 및 `Symbol.isOptional()`을 통한 필수 여부(`required`)를 추출한다.                                                                                                                             |                             |

### 2.3.1. CLI 옵션 빌더 (CLI Options Builder)

CLI 플래그 및 설정 파일을 내부 추출 옵션으로 변환:

| **ID**       | **기능명**           | **상세 설명**                                                   | **비고** |
| ------------ | -------------------- | --------------------------------------------------------------- | -------- |
| **REQ-OPT-01** | **추출 옵션 빌더** | RawCliOptions를 ExtractOptions로 변환. `--all` 플래그에 따라 filterExternal/filterSprinkles/filterHtml 토글. HTML 화이트리스트 Set 생성. | `buildExtractOptions()` 함수 |
| **REQ-OPT-02** | **컴포넌트별 추출 옵션 빌더** | 기본 ExtractOptions에 컴포넌트별 설정 오버라이드. `sprinklesAll`, `sprinkles[]`, `component-specific include` 지원. 다중 설정 병합. | `buildComponentExtractOptions()` 함수 |

### 2.4. 시스템 및 입출력 (System I/O)

| **ID**       | **기능명**           | **상세 설명**                                                   | **비고** |
| ------------ | -------------------- | --------------------------------------------------------------- | -------- |
| **REQ-S-01** | **JSON 구조체 반환** | 추출된 데이터를 정의된 스키마에 맞춰 JSON 배열 형태로 반환한다. |          |
| **REQ-S-02** | **CLI 에러 처리** | CLI 실행 시 발생하는 에러를 구분하기 위한 커스텀 CliError 클래스. 일반 Error와 구분하여 종료 코드 및 메시지 처리 다르게 적용. | 에러 분류 및 사용자 친화적 메시지 |
| **REQ-S-03** | **출력 모드 결정** | outputDir 옵션 있으면 directory 모드(파일 쓰기), 없으면 stdout 모드(JSON 콘솔 출력). `OutputMode` 타입: `{ type: 'stdout' } \| { type: 'directory'; path: string }` | 출력 대상 선택 |
| **REQ-S-04** | **컴포넌트별 설정 조회** | ExtractorConfig에서 파일 경로 패턴 매칭. 경로 정규화 후 endsWith/includes 로직으로 검색. 윈도우/유닉스 경로 구분자 자동 처리. | `getComponentConfig()` 활용 |

## 3. 데이터 모델 예시 (Data Model Specification)

```
{
  "componentName": "Menu",
  "description": "사용자에게 선택 가능한 목록을 제공하는 메뉴 컴포넌트입니다.",
  "props": [
    {
      "name": "orientation",
      "type": ["horizontal", "vertical"],
      "required": false,
      "description": "메뉴의 시각적 방향입니다.\n로빙 포커스가 위/아래 또는 왼쪽/오른쪽 화살표 키를 사용하는지 제어합니다.",
      "defaultValue": "vertical"
    }
  ]
}
```

## 4. 제약 사항 및 가정 (Constraints & Assumptions)

- **구현 기반:** `ts-morph` 라이브러리를 핵심 종속성으로 사용한다.
- **타입 추출 기준:** TypeChecker 기반의 실질적 타입 평가 결과를 우선한다.
- **주석 추출 정책:** JSDoc 태그는 제외하고 순수 설명 텍스트만 추출하는 것을 원칙으로 한다.
- **Config 기반 제어:** 문서화에 노출할 HTML DOM 기본 속성은 코드에 하드코딩하지 않고, 별도의 환경 설정 파일(Config)을 통해 주입받아 동적으로 필터링한다.
- **설정 파일 포맷:** TypeScript, JavaScript 양쪽 모두 지원. 검색 순서: `docs-extractor.config.ts` → `.js` → `.mjs`. Zod 스키마로 검증되며, 검증 실패 시 기본 설정으로 폴백.
- **대화형 모드 요구사항:** CLI 인자 미제공 시 `@inquirer/prompts` 라이브러리 필수. 미설치 시 명확한 설치 가이드 메시지 제공.
- **파일 필터링 기본값:** `.stories.tsx` (스토리북), `.css.ts` (스타일), `.test.tsx` (테스트) 파일은 기본 제외. `--no-exclude-defaults` 플래그로 무시 가능.

## 5. 검증 및 테스트 전략 (Validation & Testing Strategy)

### 5.1. 테스트 환경 및 방법

- **도구:** `Vitest` 기반의 단위 및 통합 테스트 환경 구축.
- **Fixture 기반 테스트:** 실제 분석 대상과 유사한 테스트용 `.tsx` 파일(Fixture)을 작성하고, 분석 엔진이 생성한 JSON 결과물을 **Snapshot**과 비교 검증한다.

### 5.2. 핵심 테스트 케이스

- **식별 검증:** `namespace` 내부에 `Props` 인터페이스가 없는 경우나 이름이 불일치하는 경우에 대한 예외 처리 테스트.
- **타입 병합 검증:** 복잡한 `extends` 구조(Base UI + Local Props + Variants)에서 속성이 누락되거나 타입이 `any`로 깨지지 않는지 확인.
- **JSDoc 파싱 검증:** 여러 줄의 주석, 특수 기호, JSDoc 태그가 섞인 환경에서 `getDescription()`이 순수 텍스트만 올바르게 분리하는지 확인.
- **DefaultValue 추론 검증:** 컴포넌트의 구조 분해 할당 기본값과 Vanilla Extract `recipe`의 `defaultVariants` 값이 정확히 우선순위에 따라 매핑되는지 확인.
- **Props 필터링 검증:** Config에 설정된 화이트리스트 목록에 따라 허용되지 않은 HTML 기본 Props가 정상적으로 제외되는지 확인.
- **설정 파일 검증:** TypeScript/JavaScript 설정 파일 동적 로드, Zod 스키마 검증, 검증 실패 시 기본 설정 폴백 동작 확인. 수동 경로 지정 및 자동 검색 모두 테스트.
- **대화형 모드 검증:** 경로 프롬프트 검증, 파일 스캔 후 컴포넌트 목록 표시, 체크박스 선택 및 '전체 선택' 기능 테스트.
- **컴포넌트 파일명 매칭 검증:** 대소문자/하이픈 무시 매칭 로직. `Button-Group`, `button-group`, `ButtonGroup` 모두 동일하게 매칭되는지 확인.

## 6. 아키텍처 및 폴더 구조 (Architecture & Directory Structure)

응집도(Cohesion)는 높이고 결합도(Coupling)는 낮추며 가독성을 극대화하기 위해 역할(Role) 기반으로 계층을 명확히 나누는 구조를 채택한다.

### 6.1. 디렉토리 구조 (Directory Tree)

```
ts-component-analyzer/
├── src/
│   ├── index.ts                 # 메인 엔트리 포인트 (API/CLI 노출)
│   ├── core/                    # [Orchestrator] 전체 흐름 제어 (Project 초기화, Config 로드, Runner)
│   ├── models/                  # [Types] 데이터 구조 (Schema) 및 Config 타입 정의
│   ├── analyzers/               # [High Cohesion] 도메인 단위 분석 (component, props, variants)
│   ├── extractors/              # [Low Coupling] 순수 데이터 추출 함수 (jsdoc, type-string, default-value)
│   ├── io/                      # [Side Effects] 파일 시스템 입출력 (file-loader, config-loader, json-writer)
│   └── utils/                   # [Helpers] 공통 유틸리티 (ast-helpers, type-guards)
├── tests/                       # 검증 및 테스트 (fixtures, integration, unit)
├── tsconfig.json
├── package.json
└── vitest.config.ts
```

### 6.2. 설계 원칙

- **분석기(Analyzers)와 추출기(Extractors)의 분리:** AST의 맥락을 파악하는 제어 로직(`analyzers`)과 특정 노드에서 텍스트 데이터만 뽑아내는 순수 함수(`extractors`)를 분리하여 상호 의존성을 낮춘다.
- **도메인 분리:** `vanilla-extract`와 같은 특정 라이브러리에 종속적인 분석 로직(`variants`)은 범용 분석 모듈과 분리하여 응집도를 높인다.
- **비즈니스 로직과 입출력(I/O) 분리:** 파일 시스템 접근 로직을 `io/` 계층으로 분리하여 핵심 분석 엔진의 테스트 용이성을 확보한다.
