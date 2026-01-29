# TypeScript API Extractor

React 컴포넌트의 Props 타입을 추출하여 JSON으로 출력하는 CLI 도구.

## 목적

- **주요 소비자**: 문서 생성 시스템 (정적 사이트 빌드, LLM 컨텍스트)
- **사용 목적**: API 문서, Props 테이블 자동 생성

## 설치

```bash
pnpm --filter=typescript-api-extractor build
```

## 사용법

```bash
pnpm --filter=typescript-api-extractor extract <path> [options]
```

### 옵션

| 옵션                  | 단축 | 설명                                                                |
| --------------------- | ---- | ------------------------------------------------------------------- |
| `--tsconfig`          | `-c` | tsconfig.json 경로 (기본: 자동 감지)                                |
| `--component`         | `-n` | 추출할 컴포넌트 이름 (예: Tabs, Button). 생략 시 모든 컴포넌트 추출 |
| `--output`            | `-o` | 출력 파일 경로 (기본: stdout)                                       |
| `--output-dir`        | `-d` | 컴포넌트별 파일 출력 디렉토리                                       |
| `--all`               | `-a` | 모든 props 포함 (node_modules + sprinkles)                          |
| `--sprinkles`         | `-s` | sprinkles props 포함                                                |
| `--include`           |      | 특정 props 포함 (여러 번 사용 가능)                                 |
| `--include-html`      |      | HTML 속성 포함 화이트리스트 (예: `--include-html className style`)  |
| `--ignore`            | `-i` | 추가 무시 패턴                                                      |
| `--no-default-ignore` |      | 기본 무시 패턴 비활성화                                             |

### 예시

```bash
# 단일 파일 출력
pnpm --filter=typescript-api-extractor extract ./packages/core --component Tabs --output ./tabs.json

# 모든 컴포넌트 추출
pnpm --filter=typescript-api-extractor extract ./packages/core --output-dir ./output

# 컴포넌트별 파일 출력
pnpm --filter=typescript-api-extractor extract ./packages/core --component Tabs --output-dir ./output
# 결과: output/tabs-root.json, output/tabs-list.json, ...

# sprinkles props 포함
pnpm --filter=typescript-api-extractor extract ./packages/core --component Button --sprinkles

# HTML 속성 포함
pnpm --filter=typescript-api-extractor extract ./packages/core --component Button --include-html className style
```

## 출력 형식

### 단일 파일 (`--output`)

```json
[
  {
    "props": [
      {
        "name": "TabsRoot.Props",
        "description": "컴포넌트 설명 (JSDoc)",
        "props": [...]
      }
    ]
  }
]
```

### 컴포넌트별 파일 (`--output-dir`)

파일명은 **kebab-case**를 사용: `tabs-root.json`, `tabs-list.json`

```json
{
    "name": "TabsRoot.Props",
    "description": "컴포넌트 설명 (JSDoc)",
    "props": [
        {
            "name": "className",
            "type": "undefined | string",
            "optional": true,
            "description": "CSS class applied to the element..."
        },
        {
            "name": "variant",
            "type": "undefined | \"fill\" | \"line\"",
            "optional": true,
            "defaultValue": "fill"
        }
    ]
}
```

### Property 타입

```typescript
interface Property {
    name: string; // prop 이름
    type: string; // 타입 문자열 (TypeScript 문법 그대로)
    optional: boolean; // 선택적 여부
    description?: string; // JSDoc 설명 (있는 경우만)
    defaultValue?: string; // 기본값 (있는 경우만, defaultVariants에서 추출)
    values?: string[]; // union 압축 시 원본 값 배열 (10개 이상일 때)
}
```

## Props 정렬 순서

Props는 다음 순서로 정렬됩니다:

1. **base-ui props**: `@base-ui`에서 온 props
2. **custom props**: 컴포넌트 파일에서 직접 정의된 props
3. **variants props**: `.css.ts` 파일의 recipe variants에서 온 props

각 그룹 내에서는 알파벳순으로 정렬됩니다.

## 타입 변환 규칙

### 1. Literal Union 타입

```typescript
// Before (TypeScript)
orientation?: "horizontal" | "vertical"

// After (JSON)
"type": "undefined | \"horizontal\" | \"vertical\""
```

### 2. Boolean 타입

```typescript
// Before (TypeScript)
loop?: boolean

// After (JSON)
"type": "undefined | boolean"
```

### 3. State 콜백 제거

```typescript
// Before (TypeScript)
className?: string | ((state: Component.State) => string)

// After (JSON)
"type": "undefined | string"
```

### 4. Render Props 단순화

```typescript
// Before (TypeScript)
render?: ReactElement | ComponentRenderFn<HTMLProps, State>

// After (JSON)
"type": "ReactElement | ((props: HTMLProps) => ReactElement) | undefined"
```

### 5. Generic 타입 처리

Generic 타입은 기본 constraint로 해석합니다.

```typescript
// Before (TypeScript)
interface Props<T extends HTMLElement> { ... }

// After (JSON)
// T를 HTMLElement로 대체하여 처리
```

### 6. Large Union 압축

Union 멤버가 **10개 이상**이면 압축 표현을 사용하고, 원본 값은 `values` 필드에 보존합니다.

```typescript
// Before (TypeScript)
icon?: "home" | "user" | "settings" | ... (15개)

// After (JSON)
{
  "name": "icon",
  "type": "string (15 variants)",
  "values": ["home", "user", "settings", ...]
}
```

### 7. Intersection 타입 처리

Intersection 타입은 **flatten하여 통합**합니다.

```typescript
// Before (TypeScript)
interface Props extends BaseProps & CustomProps & HTMLAttributes<HTMLDivElement> { ... }

// After (JSON)
// 모든 타입의 props를 하나의 리스트로 통합
```

### 8. Props 이름 충돌

Intersection으로 인해 같은 이름의 prop이 다른 타입을 가질 경우, **모든 타입을 union으로 병합**합니다.

## defaultValue 추출

`defaultValue`는 같은 디렉토리 내의 `.css.ts` 파일에서 `defaultVariants`를 참조하여 추출합니다.

### 파일 매핑 규칙

```
Button/
  Button.tsx        <- Props 타입 정의
  Button.css.ts     <- defaultVariants 정의
```

```typescript
// Button.css.ts
export const buttonRecipe = recipe({
  variants: {
    variant: { primary: {...}, secondary: {...} },
    size: { sm: {...}, md: {...}, lg: {...} }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
})
```

결과:

```json
{
  "name": "variant",
  "type": "undefined | \"primary\" | \"secondary\"",
  "defaultValue": "primary"
},
{
  "name": "size",
  "type": "undefined | \"sm\" | \"md\" | \"lg\"",
  "defaultValue": "md"
}
```

`defaultVariants`에 없는 prop은 `defaultValue` 필드를 **생략**합니다.

## 컴포넌트 설명

컴포넌트의 `description`은 **컴포넌트 export 문의 JSDoc**에서 추출합니다.

```typescript
/**
 * 탭 컴포넌트의 루트 컨테이너입니다.
 */
export const Button = ...
```

## 지원하는 컴포넌트 구조

```typescript
// 지원하는 패턴: namespace + Props interface
export namespace Button {
    export interface Props extends BaseProps {
        variant?: 'primary' | 'secondary';
    }
}
```

### Compound Component 패턴

Compound Component(Tabs.Root, Tabs.List 등)는 **각각 별도 파일**로 출력됩니다.

```
output/
  tabs-root.json
  tabs-list.json
  tabs-trigger.json
  tabs-panel.json
```

### Polymorphic Component

`asChild` 등 polymorphic 패턴은 **기본 타입만** 추출합니다. 동적 타입 변경은 문서화하지 않습니다.

### Re-export 처리

`export * from './Button'` 같은 re-export는 **원본 파일을 추적**하여 추출합니다.

## 필터링

### 기본 필터링

다음은 **기본적으로 필터링**됩니다:

- `node_modules` 외부 라이브러리 props (단, `@base-ui`는 포함)
- `sprinkles.css` 파일에서 온 props
- HTML 네이티브 속성 (`className`, `style`, `id`, `onClick` 등)

### 필터링 옵션

| 옵션                        | 동작                                   |
| --------------------------- | -------------------------------------- |
| `--all`                     | 모든 props 포함                        |
| `--sprinkles`               | sprinkles props 포함                   |
| `--include-html <props...>` | 지정된 HTML 속성만 포함 (화이트리스트) |
| `--include <prop>`          | 특정 prop 강제 포함                    |

### 필터링 기준

- **sprinkles props**: `sprinkles.css` 파일명으로 판단
- **recipe variants**: `.css.ts` 파일 확장자로 판단
- **base-ui props**: `@base-ui` 패키지 경로로 판단

## tsconfig.json 감지

`--tsconfig` 옵션을 생략하면 **현재 디렉토리에서 상위로 검색**하여 자동 감지합니다.

## 에러 처리

**Fail Fast** 전략을 사용합니다:

- 첫 번째 에러 발생 시 즉시 중단
- 상세한 에러 메시지 출력

## CLI 동작

### 진행 상황 표시

기본적으로 진행 상황을 표시합니다:

```
Parsing components...
Processing Button (1/25)
Processing Tabs (2/25)
...
Done! Extracted 25 components.
```

### 파일 덮어쓰기

기존 파일이 있으면 **자동으로 덮어씁니다**.

### Exit Code

- `0`: 성공
- `1`: 에러 발생

## 제한사항

- vapor-ui의 namespace + Props interface 패턴만 지원
- `@base-ui`만 node_modules에서 예외적으로 포함
- JSDoc은 description만 추출 (@default, @example 등 미지원)
- deprecation 정보 미추적
