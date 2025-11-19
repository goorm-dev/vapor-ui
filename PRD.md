# PRD: Figma to React (Vapor-UI) Transpiler

## PRD 변경 이력

### metadata 역할 변경

2.4 / 5.3 / 6.2.2 / 6.5 / 10 / 10.4 섹션 내용 참고

### component.metadata.json -> component.metadata.ts로 변경3 / 9

✅ Section 2.4: metadata.json → component.metadata.ts
✅ Section 4.2: 디렉토리 구조에서 loader.ts 제거
✅ Section 5.3: 함수형 타입 추가
✅ Section 6.5: ValueTransformFn 지원
✅ Section 9: 직접 import 방식
✅ Section 10.1: TypeScript 예시로 완전 교체
✅ Section 10.3: 함수형 augmentation 예시
✅ Section 10.5: TypeScript vs JSON 비교 (신규)
✅ Section 14: TypeScript 사용 언급

## 1. 개요

본 문서는 Figma 노드(컴포넌트, 프레임)를 `Vapor-UI` 디자인 시스템의 React 컴포넌트 코드로 변환하는 트랜스파일러의 기술 명세입니다.

Figma 노드 데이터와 개발 코드에 대한 명세는 DUMMY_DATA.md에 명세되어있습니다.

**핵심 목표**: Figma 디자인의 의미를 분석하여 Vapor-UI API에 맞는 시맨틱하고 재사용 가능한 고품질 React 코드를 생성합니다.

**실행 환경**: Figma **Codegen Panel** (Output 전용)

---

## 2. 핵심 원칙

### 2.1. Props = Variants (시맨틱 매핑)

Vapor-UI 컴포넌트 스펙은 4가지로 구분되며, 트랜스파일러는 이를 명확히 구분 처리합니다.

#### ✅ 변환 대상

- **논리적 상태 (Logical States)**: `disabled`, `checked` 등
    - 예: `disabled={true}`
- **시각 옵션 (Visual Options)**: `size`, `color` 등
    - 예: `size="lg"`

#### ❌ 변환 제외 대상

- **인터랙션 상태 (Interaction States)**: `hovered`, `focused` 등
    - 이유: CSS Pseudo-class로 처리
- **내부 구성 (Content Options)**: `hasLeadingIcon` 등
    - 이유: React에서는 `leadingIcon` prop으로 처리
- **기능 Props**: `href`, `onClick`, `as` 등
    - 이유: Codegen Panel에서 주입 불가. 개발자가 직접 추가

### 2.2. Props = Sprinkles (스타일 매핑)

Figma의 개별 스타일 오버라이드(width, backgroundColor 등)를 Sprinkles Prop으로 변환합니다.

**예시**:

```tsx
<Button
    variant="primary" // Variant Prop
    disabled // Variant Prop
    width="$075" // Sprinkle Prop
    color="$danger-200" // Sprinkle Prop
/>
```

### 2.3. 중간 표현 (IR)

Figma 원시 구조와 React 코드 생성을 분리하기 위해 Intermediate Representation을 사용합니다.

**3단계 파이프라인**:

```
Figma Node → Raw IR → Semantic IR → React Code
```

### 2.4. Convention over Configuration

**핵심 철학**: Figma가 Single Source of Truth입니다.

```
Figma Variants = React Props (기본 규칙, 100% 자동)
component.metadata.ts = 예외 규칙만 명시 (opt-in)
```

**이점**:

- ✅ 디자이너가 자유롭게 variant 추가 가능 (개발자 개입 불필요)
- ✅ Figma에서 variant 변경 시 자동으로 코드에 반영
- ✅ 휴먼 에러 최소화 (동기화 불필요)
- ✅ metadata는 정말 필요한 것(augmentation, 예외)만 포함

**규칙**:

1. Figma의 모든 variants는 **자동으로** camelCase React props로 변환
2. component.metadata.ts는 **예외 처리**만 기록 (제외, 이름 변환, 값 변환)
3. 인터랙션 상태(`hover`, `focus` 등)는 자동으로 제외

### 2.5. 메타데이터 기반 시맨틱 보강

디자이너가 그릴 수 없는 순수 기능 컴포넌트(`Tabs.Panel`, `Dialog.Portal`)를 `component.metadata.ts`를 통해 지능적으로 주입합니다.

**Two-Pass 아키텍처**:

1. **Pass 1**: Figma 트리를 1:1 순회하여 Raw IR 생성
2. **Pass 2**: 메타데이터 규칙에 따라 Raw IR을 변환하여 Semantic IR 생성

---

## 3. Vapor-UI API 명세

### 3.1. Sprinkles Props

| 카테고리       | Prop                                                                    | 값 타입                     |
| -------------- | ----------------------------------------------------------------------- | --------------------------- |
| **Layout**     | `position`, `display`                                                   | `string`                    |
| **Flexbox**    | `alignItems`, `justifyContent`, `flexDirection`                         | `string`                    |
|                | `gap`                                                                   | Space Tokens                |
| **Spacing**    | `padding`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight` | Space Tokens                |
|                | `margin`, `marginTop`, `marginBottom`, `marginLeft`, `marginRight`      | Space/Negative Space Tokens |
| **Dimensions** | `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`     | Dimension Tokens            |
| **Visual**     | `border`, `borderColor`, `borderRadius`                                 | Border/Radius Tokens        |
|                | `backgroundColor`                                                       | Background Color Tokens     |
|                | `color`                                                                 | Color Tokens                |
|                | `opacity`                                                               | `number`                    |
| **Behavior**   | `pointerEvents`, `overflow`, `textAlign`                                | `string`                    |

**Shorthands**:

- `paddingX` → `paddingLeft`, `paddingRight`
- `paddingY` → `paddingTop`, `paddingBottom`
- `marginX`, `marginY` (동일 패턴)

### 3.2. 디자인 토큰

#### Space Tokens

`$000`, `$025`, `$050`, `$075`, `$100`, `$150`, `$175`, `$200`, `$225`, `$250`, `$300`, `$400`, `$500`, `$600`, `$700`, `$800`, `$900`

**Negative Space** (margin 전용): `-$025` ~ `-$900`

#### Dimension Tokens

`$025`, `$050`, `$075`, `$100`, `$150`, `$175`, `$200`, `$225`, `$250`, `$300`, `$400`, `$500`, `$600`, `$700`, `$800`

#### Radius Tokens

`$000`, `$050`, `$100`, `$200`, `$300`, `$400`, `$500`, `$600`, `$700`, `$800`, `$900`

#### Color Tokens

**Background Colors**:

- Semantic: `primary-100`, `primary-200`, `secondary-100`, `success-100`, `success-200`, `warning-100`, `warning-200`, `danger-100`, `danger-200`, `hint-100`, `hint-200`, `contrast-100`, `contrast-200`, `canvas`, `surface-100`, `surface-200`
- Primitives: `blue-050`~`blue-900`, `cyan-050`~`cyan-900`, `grape-050`~`grape-900`, `gray-000`~`gray-950`, `green-050`~`green-900`, `lime-050`~`lime-900`, `orange-050`~`orange-900`, `pink-050`~`pink-900`, `red-050`~`red-900`
- Base: `black`, `white`

**Text Colors**:

- Semantic: `primary-100`, `primary-200`, `secondary-100`, `secondary-200`, `success-100`, `success-200`, `warning-100`, `warning-200`, `danger-100`, `danger-200`, `hint-100`, `hint-200`, `contrast-100`, `contrast-200`, `normal-100`, `normal-200`, `button-primary`

**Border Colors**:

- `primary`, `secondary`, `success`, `warning`, `danger`, `contrast`, `hint`, `normal`

### 3.3. 🚧 Sprinkles API 개선 필요 사항

현재 Sprinkles는 Figma의 모든 속성을 커버하지 못합니다. 다음 항목을 `sprinkles.css.ts`에 추가해야 합니다:

#### A. Effects (그림자)

```typescript
boxShadow: vars.shadows; // $sm, $md, $lg 등
```

#### B. Typography

```typescript
fontFamily: vars.font.family;
fontSize: vars.font.size;
fontWeight: vars.font.weight;
lineHeight: vars.font.lineHeight;
letterSpacing: vars.font.letterSpacing;
```

#### C. 제약 없는 속성 수정

```typescript
// ❌ Before
display: true;
overflow: true;

// ✅ After
display: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'];
position: ['static', 'relative', 'absolute', 'fixed', 'sticky'];
overflow: ['visible', 'hidden', 'scroll', 'auto'];
textAlign: ['left', 'center', 'right', 'justify'];
alignItems: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'];
justifyContent: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'];
```

#### D. Border 세분화

```typescript
borderWidth: spaceTokens;
borderStyle: ['solid', 'dashed', 'dotted', 'none'];
borderColor: colorTokens; // 프리미티브 색상 포함
```

#### E. Color 토큰 확장

```typescript
// color, borderColor가 primitives도 지원하도록 확장
colorTokens: [...semanticColors, ...primitiveColors];
```

#### F. zIndex

```typescript
zIndex: vars.zIndex; // { '10': 10, '100': 100, 'modal': 9999 }
```

---

## 4. 아키텍처 설계

### 4.1. Pipeline Architecture

본 트랜스파일러는 **3단계 파이프라인**으로 구성됩니다:

```
Stage 1: Parse      → Figma Node를 Raw IR로 변환
Stage 2: Transform  → Raw IR을 Semantic IR로 보강
Stage 3: Generate   → Semantic IR을 React 코드로 생성
```

**특징**:

- 순수 함수 기반
- 각 단계는 독립적으로 테스트 가능
- 함수 조합 (`pipe`, `compose`)

### 4.2. 디렉토리 구조

```
src/
├── domain/                      # 📐 타입, 규칙, 상수
│   ├── types/
│   │   ├── figma.ts             # Figma 노드 타입
│   │   ├── ir.ts                # IR 타입 (Raw, Semantic)
│   │   ├── vapor-ui.ts          # Vapor-UI 컴포넌트 타입
│   │   └── index.ts
│   │
│   ├── rules/                   # 비즈니스 규칙 (데이터)
│   │   ├── variant-mapping.ts   # Variant 기본 규칙
│   │   ├── sprinkles-mapping.ts # Style → Sprinkles 매핑
│   │   ├── filter-rules.ts      # 노드 필터링
│   │   └── index.ts
│   │
│   └── constants/
│       ├── tokens.ts            # Space, Dimension, Color 토큰
│       └── component-specs.ts
│
├── pipeline/                    # 🔄 3단계 파이프라인
│   ├── 1-parse/                 # Stage 1: Figma → Raw IR
│   │   ├── traverse.ts          # 트리 순회 오케스트레이터
│   │   ├── mappers/
│   │   │   ├── component.ts     # ComponentNode → IR
│   │   │   ├── text.ts          # TextNode → IR
│   │   │   ├── layout.ts        # AutoLayout → IR
│   │   │   └── index.ts
│   │   └── filters/
│   │       └── apply-filters.ts # 필터 규칙 적용
│   │
│   ├── 2-transform/             # Stage 2: Raw IR → Semantic IR
│   │   ├── augment.ts           # 메타데이터 기반 보강
│   │   ├── transformers/
│   │   │   ├── inject-functional-components.ts
│   │   │   ├── optimize-nesting.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── 3-generate/              # Stage 3: Semantic IR → Code
│       ├── codegen.ts           # JSX 생성
│       ├── builders/
│       │   ├── jsx.ts           # JSX 노드 생성
│       │   ├── imports.ts       # Import 문 생성
│       │   ├── props.ts         # Props 포맷팅
│       │   └── index.ts
│       └── formatter.ts         # Prettier
│
├── infrastructure/              # 🔌 외부 인터페이스
│   ├── metadata/
│   │   ├── types.ts             # 메타데이터 타입 정의
│   │   ├── component.metadata.ts # ✅ 메타데이터 (TypeScript)
│   │   └── validator.ts         # 메타데이터 검증
│   │
│   └── figma/
│       ├── variable-cache.ts    # Figma Variables 캐싱
│       └── node-utils.ts
│
├── utils/                       # 🛠️ 범용 유틸리티
│   ├── color.ts                 # 색상 변환
│   ├── dimension.ts             # 크기 변환
│   ├── fp.ts                    # pipe, compose, memoize
│   └── index.ts
│
└── index.ts                     # Public API
```

---

## 5. 타입 정의

### 5.1. Intermediate Representation

```typescript
// domain/types/ir.ts

// Raw IR (Pass 1 출력)
interface RawIR {
    type: 'component' | 'element' | 'text';
    componentName: string;
    props: Record<string, unknown>;
    children: (RawIR | string)[];
    metadata: {
        figmaNodeId: string;
        figmaNodeName: string;
        figmaNodeType: string;
    };
}

// Semantic IR (Pass 2 출력)
interface SemanticIR extends RawIR {
    imports: Set<string>; // 필요한 Import
    semanticType?: SemanticType; // 시맨틱 타입
}

type SemanticType = 'trigger' | 'panel' | 'content' | 'portal';
```

### 5.2. Figma 노드 타입

```typescript
// domain/types/figma.ts

interface FigmaNode {
    id: string;
    name: string;
    type: NodeType;
    visible: boolean;
    children?: FigmaNode[];

    // InstanceNode 전용
    componentProperties?: ComponentProperties;
    mainComponent?: ComponentNode;

    // Layout
    layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
    primaryAxisAlignItems?: string;
    counterAxisAlignItems?: string;
    itemSpacing?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;

    // Style
    fills?: Paint[];
    strokes?: Paint[];
    effects?: Effect[];
    opacity?: number;

    // Text
    characters?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: LineHeight;
    textAlignHorizontal?: string;
}

type NodeType = 'COMPONENT' | 'INSTANCE' | 'FRAME' | 'TEXT' | 'VECTOR' | 'GROUP';

interface ComponentProperties {
    [key: string]: {
        type: 'VARIANT' | 'INSTANCE_SWAP' | 'TEXT' | 'BOOLEAN';
        value: string | boolean;
    };
}
```

### 5.3. 컴포넌트 메타데이터

```typescript
// infrastructure/metadata/types.ts

export interface ComponentMetadata {
    name: string; // 컴포넌트 이름 (예: "Button")
    package: string; // 패키지 (예: "@vapor-ui/core")

    // ✅ variantOverrides: 예외만 명시 (opt-in)
    variantOverrides?: {
        [figmaProperty: string]: {
            exclude?: boolean; // 변환 제외 여부
            propName?: string; // React prop 이름 (기본: camelCase)
            valueTransform?: ValueTransformFn | ValueTransformPreset;
        };
    };

    // ✅ augmentations: Figma에 없는 정보 주입
    augmentations?: AugmentRule[];

    // 서브컴포넌트
    subComponents?: Record<string, SubComponentMetadata>;
}

// ✅ 함수형 변환 지원
export type ValueTransformFn = (value: string) => unknown;

// 자주 쓰는 변환 프리셋
export type ValueTransformPreset = 'toLowerCase' | 'toUpperCase' | 'toBoolean' | 'toNumber';

export interface AugmentRule {
    type: 'inject' | 'wrap' | 'replace';

    // ✅ 문자열 패턴 또는 함수
    target: string | TargetMatcherFn;

    component: string; // 주입할 컴포넌트
    position?: 'before' | 'after' | 'wrap';

    // ✅ 정적 props 또는 동적 함수
    props?: Record<string, string> | PropGeneratorFn;
}

// 타겟 매칭 함수
export type TargetMatcherFn = (node: RawIR, context: AugmentContext) => boolean;

// Props 생성 함수
export type PropGeneratorFn = (
    child: RawIR,
    index: number,
    siblings: RawIR[],
) => Record<string, unknown>;

export interface SubComponentMetadata {
    name: string;
    package: string;
    variantOverrides?: ComponentMetadata['variantOverrides'];
}

export interface AugmentContext {
    depth: number;
    parent?: RawIR;
    siblings: RawIR[];
}
```

---

## 6. Stage 1: Parse (Figma → Raw IR)

### 6.1. 트리 순회

```typescript
// pipeline/1-parse/traverse.ts

export const createTraverser = async (options: TraverseOptions) => {
    // 1. Figma Variables 캐싱 (성능 최적화)
    const variableCache = await initializeVariableCache();

    // 2. 순회 함수 (재귀)
    const traverse = (node: FigmaNode): RawIR | RawIR[] | null => {
        // [Filter] 노드 필터링
        const filterResult = applyFilters(node);

        if (filterResult.action === 'skip') {
            return null;
        }

        if (filterResult.action === 'unwrap-children') {
            // ContentLayer 등 투명 컨테이너
            return node.children?.map(traverse).flat().filter(Boolean) ?? [];
        }

        // [Map] 노드 타입별 매핑
        const mapper = selectMapper(node.type, node.name);
        const ir = mapper(node, { variableCache });

        // [Recurse] 자식 순회
        if ('children' in node && node.children) {
            const childIRs = node.children.map(traverse).flat().filter(Boolean);

            ir.children = childIRs;
        }

        return ir;
    };

    return traverse;
};
```

### 6.2. 노드별 매퍼

#### 6.2.1. Layout Mapper (Auto Layout → Flex)

```typescript
// pipeline/1-parse/mappers/layout.ts

export const createLayoutMapper = (config: MapperConfig) => {
    return (node: FigmaNode, context: Context): RawIR => {
        const { layoutMode, primaryAxisAlignItems, counterAxisAlignItems, itemSpacing } = node;

        // Layout Props
        const layoutProps = {
            flexDirection: mapFlexDirection(layoutMode),
            alignItems: mapAlignItems(counterAxisAlignItems),
            justifyContent: mapJustifyContent(primaryAxisAlignItems),
            gap: mapSpaceToken(itemSpacing, context.variableCache),
        };

        // Sprinkle Props (스타일 오버라이드)
        const sprinkleProps = extractSprinkleProps(node, context);

        return {
            type: 'element',
            componentName: 'Flex',
            props: { ...layoutProps, ...sprinkleProps },
            children: [],
            metadata: {
                figmaNodeId: node.id,
                figmaNodeName: node.name,
                figmaNodeType: node.type,
            },
        };
    };
};

// 헬퍼 함수
const mapFlexDirection = (mode: string) => {
    const map = {
        HORIZONTAL: 'row',
        VERTICAL: 'column',
    };
    return map[mode] ?? 'row';
};
```

#### 6.2.2. Component Mapper (💙 → Vapor-UI 컴포넌트)

```typescript
// pipeline/1-parse/mappers/component.ts

export const createComponentMapper = (config: MapperConfig) => {
    const { metadata } = config;

    return (node: FigmaNode, context: Context): RawIR => {
        // 컴포넌트 이름 추출 (💙Button → Button)
        const componentName = extractComponentName(node.name);

        // [1] Variant Props (자동 매핑 + 예외 처리)
        const variantProps = extractVariantProps(
            node.componentProperties,
            metadata.getComponent(componentName)?.variantOverrides,
        );

        // [2] Sprinkle Props (스타일 오버라이드)
        const sprinkleProps = extractSprinkleProps(node, context);

        return {
            type: 'component',
            componentName,
            props: { ...variantProps, ...sprinkleProps },
            children: [],
            metadata: {
                figmaNodeId: node.id,
                figmaNodeName: node.name,
                figmaNodeType: node.type,
            },
        };
    };
};

// ✅ 개선된 Variant Props 추출 (Convention over Configuration)
const extractVariantProps = (
    properties: ComponentProperties,
    overrides?: VariantOverrides, // optional!
): Record<string, unknown> => {
    const props: Record<string, unknown> = {};

    for (const [key, prop] of Object.entries(properties)) {
        if (prop.type !== 'VARIANT') continue;

        // [1] 기본 제외 규칙: 인터랙션 상태 자동 제외
        if (isInteractionState(key)) continue;

        // [2] 예외 규칙 확인 (있을 때만)
        const override = overrides?.[key];

        if (override?.exclude) continue; // 제외 규칙

        // [3] 기본 규칙: Figma key를 camelCase로 변환
        const propName = override?.propName ?? camelCase(key);

        // [4] 값 변환 (규칙이 있을 때만)
        const propValue = override?.valueTransform
            ? applyTransform(prop.value, override.valueTransform)
            : prop.value;

        props[propName] = propValue;
    }

    return props;
};

// 인터랙션 상태 판별
const isInteractionState = (key: string): boolean => {
    const patterns = /^(hover|focus|active|pressed|state)$/i;
    return patterns.test(key);
};
```

#### 6.2.3. Text Mapper (TextNode → Text)

```typescript
// pipeline/1-parse/mappers/text.ts

export const createTextMapper = (config: MapperConfig) => {
    return (node: FigmaNode, context: Context): RawIR => {
        // 텍스트 스타일 Props
        const textProps = {
            fontSize: mapFontSizeToken(node.fontSize),
            fontWeight: node.fontWeight,
            lineHeight: mapLineHeight(node.lineHeight),
            textAlign: node.textAlignHorizontal?.toLowerCase(),
        };

        // 색상 Props
        const colorProps = extractTextColor(node.fills, context.variableCache);

        return {
            type: 'text',
            componentName: 'Text',
            props: { ...textProps, ...colorProps },
            children: [node.characters ?? ''],
            metadata: {
                figmaNodeId: node.id,
                figmaNodeName: node.name,
                figmaNodeType: 'TEXT',
            },
        };
    };
};
```

### 6.3. 필터링 규칙

```typescript
// pipeline/1-parse/filters/apply-filters.ts

interface FilterResult {
    action: 'pass' | 'skip' | 'unwrap-children';
}

export const applyFilters = (node: FigmaNode): FilterResult => {
    // [1] InteractionLayer 필터링
    if (node.name.startsWith('🔶InteractionLayer')) {
        return { action: 'skip' };
    }

    // [2] ContentLayer 투명화
    if (node.type === 'INSTANCE' && node.name.includes('/ContentLayer')) {
        return { action: 'unwrap-children' };
    }

    // [3] 이미지 노드 제외
    if (node.fills?.some((f) => f.type === 'IMAGE')) {
        return { action: 'skip' };
    }

    // [4] 벡터 노드 제외 (아이콘 제외)
    if (['VECTOR', 'LINE', 'STAR'].includes(node.type) && !node.name.includes('❤️')) {
        return { action: 'skip' };
    }

    // [5] AutoLayout 없는 FRAME/GROUP → 투명 컨테이너
    if (['FRAME', 'GROUP'].includes(node.type) && node.layoutMode === 'NONE') {
        return { action: 'unwrap-children' };
    }

    return { action: 'pass' };
};
```

### 6.4. Sprinkles 매핑

```typescript
// domain/rules/sprinkles-mapping.ts

export const extractSprinkleProps = (
    node: FigmaNode,
    context: Context,
): Record<string, unknown> => {
    const props: Record<string, unknown> = {};

    // Dimensions
    if (node.width) props.width = mapDimensionToken(node.width);
    if (node.height) props.height = mapDimensionToken(node.height);

    // Spacing
    if (node.paddingLeft) props.paddingLeft = mapSpaceToken(node.paddingLeft);
    if (node.paddingRight) props.paddingRight = mapSpaceToken(node.paddingRight);
    if (node.paddingTop) props.paddingTop = mapSpaceToken(node.paddingTop);
    if (node.paddingBottom) props.paddingBottom = mapSpaceToken(node.paddingBottom);

    // Colors
    if (node.fills?.length) {
        const bgColor = extractBackgroundColor(node.fills, context.variableCache);
        if (bgColor) props.backgroundColor = bgColor;
    }

    // Border
    if (node.strokes?.length) {
        const borderColor = extractBorderColor(node.strokes, context.variableCache);
        if (borderColor) props.borderColor = borderColor;
    }

    if (node.cornerRadius) {
        props.borderRadius = mapRadiusToken(node.cornerRadius);
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
        props.opacity = node.opacity;
    }

    return props;
};
```

### 6.5. 기본 Variant 규칙

```typescript
// domain/rules/variant-mapping.ts

// ✅ 기본 규칙 (metadata 없이도 동작)
export const DEFAULT_VARIANT_RULES = {
    // 자동 camelCase 변환
    namingConvention: 'camelCase' as const,

    // 자동 타입 추론
    booleanKeywords: ['disabled', 'checked', 'loading', 'readOnly', 'required'],

    // 자동 제외 (인터랙션 상태)
    excludePatterns: [/^(hover|focus|active|pressed|state)$/i],
};

// 값 변환 함수
export const applyTransform = (
    value: string | boolean,
    transform: ValueTransformFn | ValueTransformPreset,
): unknown => {
    if (typeof transform === 'function') {
        return transform(value as string);
    }

    switch (transform) {
        case 'toLowerCase':
            return (value as string).toLowerCase();
        case 'toUpperCase':
            return (value as string).toUpperCase();
        case 'toBoolean':
            return value === 'true' || value === true;
        case 'toNumber':
            return Number(value);
        default:
            return value;
    }
};
```

---

## 7. Stage 2: Transform (Raw IR → Semantic IR)

### 7.1. 메타데이터 기반 보강

```typescript
// pipeline/2-transform/augment.ts

export const createAugmenter = (metadata: ComponentMetadata[]) => {
    const augment = (rawIR: RawIR): SemanticIR => {
        // 1. 기능 컴포넌트 주입
        let ir = injectFunctionalComponents(rawIR, metadata);

        // 2. Nesting 최적화
        ir = optimizeNesting(ir);

        // 3. Import 수집
        ir.imports = collectImports(ir);

        return ir;
    };

    return augment;
};
```

### 7.2. 기능 컴포넌트 주입

```typescript
// pipeline/2-transform/transformers/inject-functional-components.ts

export const injectFunctionalComponents = (
    ir: RawIR,
    metadata: ComponentMetadata[],
): SemanticIR => {
    // 메타데이터에서 augmentation 규칙 찾기
    const componentMeta = metadata.find((m) => m.name === ir.componentName);

    if (!componentMeta?.augmentations) {
        return { ...ir, imports: new Set() };
    }

    // 각 규칙 적용
    let result = ir;
    for (const rule of componentMeta.augmentations) {
        result = applyAugmentRule(result, rule);
    }

    return { ...result, imports: new Set() };
};

// Augmentation 규칙 적용
const applyAugmentRule = (ir: RawIR, rule: AugmentRule): RawIR => {
    switch (rule.type) {
        case 'wrap':
            return wrapChildren(ir, rule);
        case 'inject':
            return injectComponent(ir, rule);
        case 'replace':
            return replaceComponent(ir, rule);
        default:
            return ir;
    }
};

// 예시: Tabs.Panel로 children 감싸기
const wrapChildren = (ir: RawIR, rule: AugmentRule): RawIR => {
    // target 패턴에 맞는 children 찾기
    const matchedChildren = ir.children.filter((child) => matchesTarget(child, rule.target));

    // 각 child를 rule.component로 감싸기
    const wrappedChildren = matchedChildren.map((child, index) => ({
        type: 'component',
        componentName: rule.component,
        props: {
            ...parseProps(rule.props, { index }),
        },
        children: [child],
        metadata: { ...child.metadata },
    }));

    return {
        ...ir,
        children: wrappedChildren,
    };
};
```

---

## 8. Stage 3: Generate (Semantic IR → Code)

### 8.1. JSX 생성

```typescript
// pipeline/3-generate/codegen.ts

export const generateReactCode = async (
    ir: SemanticIR,
    options: CodegenOptions = {},
): Promise<string> => {
    // 1. Import 문 생성
    const imports = generateImports(ir.imports);

    // 2. JSX 생성 (재귀)
    const jsx = generateJSX(ir);

    // 3. 컴포넌트 조합
    const code = `
    ${imports}

    export default function GeneratedComponent() {
      return (
        ${jsx}
      );
    }
  `;

    // 4. Prettier 포맷팅
    return await format(code, {
        parser: 'typescript',
        semi: true,
        singleQuote: true,
        ...options.prettierConfig,
    });
};
```

### 8.2. JSX 빌더

```typescript
// pipeline/3-generate/builders/jsx.ts

const generateJSX = (node: SemanticIR | string, depth = 0): string => {
    // 텍스트 노드
    if (typeof node === 'string') {
        return node;
    }

    const { componentName, props, children } = node;
    const indent = '  '.repeat(depth);

    // Props 문자열 생성
    const propsStr = Object.entries(props)
        .map(([key, value]) => formatProp(key, value))
        .join(' ');

    // Self-closing
    if (!children || children.length === 0) {
        return `${indent}<${componentName}${propsStr ? ' ' + propsStr : ''} />`;
    }

    // With children
    const childrenStr = children.map((child) => generateJSX(child, depth + 1)).join('\n');

    return `${indent}<${componentName}${propsStr ? ' ' + propsStr : ''}>
${childrenStr}
${indent}</${componentName}>`;
};

// Prop 포맷팅
const formatProp = (key: string, value: unknown): string => {
    if (typeof value === 'boolean') {
        return value ? key : '';
    }

    if (typeof value === 'string') {
        return `${key}="${value}"`;
    }

    return `${key}={${JSON.stringify(value)}}`;
};
```

---

## 9. Public API

```typescript
// src/index.ts
import { metadata } from './infrastructure/metadata/component.metadata';
import { createTraverser } from './pipeline/1-parse/traverse';
import { createAugmenter } from './pipeline/2-transform/augment';
import { generateReactCode } from './pipeline/3-generate/codegen';

export const createTranspiler = async (options: TranspilerOptions = {}) => {
    // 1. 메타데이터 (직접 import)
    const componentMetadata = options.metadata ?? metadata;

    // 2. 파이프라인 생성
    const parse = await createTraverser({ metadata: componentMetadata });
    const transform = createAugmenter(componentMetadata);
    const generate = (ir: SemanticIR) => generateReactCode(ir, options);

    // 3. 파이프라인 조합
    const transpile = async (node: FigmaNode): Promise<string> => {
        const rawIR = parse(node);
        const semanticIR = transform(rawIR);
        return generate(semanticIR);
    };

    return {
        // 원샷 변환
        transpile,

        // 디버깅용 API
        toRawIR: (node: FigmaNode) => parse(node),
        toSemanticIR: (node: FigmaNode) => transform(parse(node)),
    };
};

// 사용 예시
const transpiler = await createTranspiler({
    // metadata는 자동으로 import됨 (옵션으로 override 가능)
    optimize: true,
});

const code = await transpiler.transpile(figmaNode);
```

---

## 10. 컴포넌트 메타데이터 명세

### 10.1. 기본 구조 (Convention over Configuration)

```typescript
// infrastructure/metadata/component.metadata.ts
import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata[] = [
    // ✅ 단순 컴포넌트 (예외 없음)
    {
        name: 'Button',
        package: '@vapor-ui/core',
        // variantOverrides 없음 = 모든 Figma variants가 자동으로 props로!
    },

    // ✅ 예외가 있는 컴포넌트
    {
        name: 'CustomButton',
        package: '@vapor-ui/core',
        variantOverrides: {
            // ⚠️ 예외만 명시
            State: {
                exclude: true, // 인터랙션 상태 제외
            },
            Size: {
                propName: 'buttonSize', // 이름 충돌 해결
                valueTransform: 'toLowerCase', // 프리셋 사용
            },
        },
    },

    // ✅ 함수형 변환
    {
        name: 'StatusBadge',
        package: '@vapor-ui/core',
        variantOverrides: {
            Status: {
                // 복잡한 변환 로직 (함수)
                valueTransform: (value) => {
                    // Figma: "In Progress" → React: "inProgress"
                    return value
                        .split(' ')
                        .map((word, i) => (i === 0 ? word.toLowerCase() : capitalize(word)))
                        .join('');
                },
            },
            Priority: {
                // 타입 변환
                valueTransform: (value) => {
                    const priorities = ['low', 'medium', 'high'];
                    return priorities.indexOf(value.toLowerCase());
                },
            },
        },
    },

    // ✅ Augmentation (Portal 주입)
    {
        name: 'Dialog',
        package: '@vapor-ui/core',
        augmentations: [
            {
                type: 'wrap',
                target: 'Dialog.Content',
                component: 'Dialog.Portal',
            },
        ],
        subComponents: {
            Root: { name: 'Root', package: '@vapor-ui/core' },
            Trigger: { name: 'Trigger', package: '@vapor-ui/core' },
            Content: { name: 'Content', package: '@vapor-ui/core' },
        },
    },

    // ✅ 동적 Augmentation (함수형 target + props)
    {
        name: 'Tabs',
        package: '@vapor-ui/core',
        augmentations: [
            {
                type: 'wrap',
                // 복잡한 매칭 로직 (함수)
                target: (node) => {
                    return (
                        node.componentName === 'Tabs' &&
                        !['Tabs.Trigger', 'Tabs.List'].includes(node.name)
                    );
                },
                component: 'Tabs.Panel',
                // 동적 props 생성 (함수)
                props: (child, index) => ({
                    value: `${index}`,
                }),
            },
        ],
    },
];

// 헬퍼 함수 (같은 파일에 정의 가능)
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
```

### 10.2. 우선순위

```
1순위: Figma variants (자동 매핑, camelCase)
2순위: metadata.variantOverrides (예외 처리)
3순위: DEFAULT_VARIANT_RULES (fallback)
```

### 10.3. Augmentation 예시

#### Tabs.Panel 주입

```typescript
{
  type: 'wrap',
  // 함수형 target (복잡한 매칭 로직)
  target: (node) => {
    return node.componentName === 'Tabs'
      && !['Tabs.Trigger', 'Tabs.List'].includes(node.name);
  },
  component: 'Tabs.Panel',
  // 동적 props 생성
  props: (child, index) => ({
    value: `${index}`,
  }),
}
```

**Before**:

```tsx
<Tabs>
    <Tabs.Trigger>Tab 1</Tabs.Trigger>
    <Tabs.Trigger>Tab 2</Tabs.Trigger>
    <Box>Content 1</Box>
    <Box>Content 2</Box>
</Tabs>
```

**After**:

```tsx
<Tabs>
    <Tabs.Trigger>Tab 1</Tabs.Trigger>
    <Tabs.Trigger>Tab 2</Tabs.Trigger>
    <Tabs.Panel value="0">
        <Box>Content 1</Box>
    </Tabs.Panel>
    <Tabs.Panel value="1">
        <Box>Content 2</Box>
    </Tabs.Panel>
</Tabs>
```

### 10.4. 실전 시나리오

#### 시나리오 1: 디자이너가 Button에 `loading` variant 추가

**❌ 이전 방식 (Configuration)**:

1. 디자이너: Figma에 `loading` variant 추가
2. 개발자: metadata.json에 수동 추가 필요
3. 휴먼 에러: 개발자가 깜빡하면 codegen 안 됨

**✅ 새로운 방식 (Convention)**:

1. 디자이너: Figma에 `loading` variant 추가
2. ✅ 끝! 자동으로 `loading` prop 생성

#### 시나리오 2: Variant 이름 변경

**❌ 이전 방식**:

1. Figma에서 변경 불가 (metadata에 고정됨)
2. 또는 metadata 수동 업데이트 필요

**✅ 새로운 방식**:

1. Figma: `size` → `buttonSize` 변경
2. ✅ 자동으로 `buttonSize` prop 생성
3. 필요시 metadata에 override 추가

### 10.5. TypeScript vs JSON

#### 왜 TypeScript인가?

| 측면            | JSON        | TypeScript             |
| --------------- | ----------- | ---------------------- |
| **타입 안전성** | ❌ 없음     | ✅ 컴파일 타임 검증    |
| **IDE 지원**    | ❌ 제한적   | ✅ 자동완성, 오류 표시 |
| **주석**        | ❌ 불가     | ✅ 가능                |
| **함수**        | ❌ 문자열만 | ✅ 실제 함수           |
| **복잡한 로직** | ❌ 불가     | ✅ 가능                |
| **동적 값**     | ❌ 정적만   | ✅ 런타임 계산         |

#### 실제 비교

**❌ JSON의 한계**:

```json
{
    "variantOverrides": {
        "Status": {
            "valueTransform": "toLowerCase" // 단순 변환만 가능
        }
    }
}
```

**✅ TypeScript의 강력함**:

```typescript
{
  variantOverrides: {
    Status: {
      // 복잡한 로직을 함수로 표현
      valueTransform: (value) => {
        const map = {
          'In Progress': 'inProgress',
          'Not Started': 'notStarted',
          'Completed': 'completed',
        };
        return map[value] ?? value.toLowerCase();
      },
    },
    Priority: {
      // 타입 변환, 배열 인덱스 계산
      valueTransform: (value) => {
        const priorities = ['low', 'medium', 'high'];
        return priorities.indexOf(value.toLowerCase());
      },
    },
  },
}
```

#### 추가 장점

**1. 타입 안전성**:

```typescript
// ✅ IDE가 오타를 즉시 발견
{
  name: 'Button',
  packge: '@vapor-ui/core',  // ← 빨간 줄 표시!
}
```

**2. 자동완성**:

```typescript
{
    augmentations: [
        {
            type: '...', // ← 'wrap' | 'inject' | 'replace' 자동완성!
        },
    ];
}
```

**3. 주석으로 문서화**:

```typescript
{
  name: 'Dialog',
  // Dialog.Content를 Portal로 감싸서 z-index 이슈 해결
  augmentations: [
    {
      type: 'wrap',
      target: 'Dialog.Content',
      component: 'Dialog.Portal',
    },
  ],
}
```

---

## 11. 성능 최적화

### 11.1. Figma Variables 캐싱

```typescript
// infrastructure/figma/variable-cache.ts

export const initializeVariableCache = async (): Promise<VariableCache> => {
    // 모든 Variables를 사전에 로드 (Promise.all)
    const [colorVariables, spaceVariables, dimensionVariables] = await Promise.all([
        figma.variables.getLocalVariablesAsync('COLOR'),
        figma.variables.getLocalVariablesAsync('FLOAT'),
        figma.variables.getLocalVariablesAsync('FLOAT'),
    ]);

    // Map 구조로 캐싱
    const cache = new Map<string, Variable>();

    [...colorVariables, ...spaceVariables, ...dimensionVariables].forEach((v) => {
        cache.set(v.id, v);
    });

    return {
        get: (id: string) => cache.get(id),
        has: (id: string) => cache.has(id),
    };
};
```

### 11.2. 메모이제이션

```typescript
// utils/fp.ts

export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();

    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);

        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
};

// 사용
export const mapSpaceToken = memoize((px: number): SpaceToken => {
    // ...
});
```

### 11.3. 목표 성능

- **3초 이내** 변환 완료 (중형 컴포넌트 기준)
- Variable 캐싱으로 API 호출 최소화
- 순수 함수 메모이제이션으로 중복 계산 제거

---

## 12. 구현 우선순위

### Phase 1: MVP (핵심 기능)

1. ✅ Pipeline 아키텍처 구축
2. ✅ Stage 1: Parse (Layout, Text, Component 매퍼)
3. ✅ Sprinkles 매핑 (기본 속성)
4. ✅ 필터링 규칙
5. ✅ Stage 3: Generate (JSX 생성)

### Phase 2: 고급 기능

1. ✅ Stage 2: Transform (메타데이터 기반 보강)
2. ✅ Augmentation 규칙 엔진
3. ✅ 복잡한 토큰 매핑 (Shadow, Typography)

### Phase 3: 최적화

1. ✅ 성능 최적화 (캐싱, 메모이제이션)
2. ✅ 에러 핸들링
3. ✅ 테스트 커버리지

---

## 13. 테스트 전략

스냅샷 테스트를 진행합니다.

**테스트 데이터**:

- Figma Node → Raw IR 스냅샷
- Raw IR → Semantic IR 스냅샷
- Semantic IR → React Code 스냅샷

**테스트 케이스**:

```typescript
describe('Pipeline Integration', () => {
    it('Button: Figma variants → React props (자동 매핑)', async () => {
        const figmaNode = mockButtonNode({
            componentProperties: {
                size: { type: 'VARIANT', value: 'Large' },
                variant: { type: 'VARIANT', value: 'Primary' },
                disabled: { type: 'VARIANT', value: 'True' },
            },
        });

        const code = await transpiler.transpile(figmaNode);

        expect(code).toMatchSnapshot();
        expect(code).toContain('size="large"'); // camelCase + toLowerCase
        expect(code).toContain('variant="primary"');
        expect(code).toContain('disabled');
    });

    it('Button with new variant (no metadata needed)', async () => {
        const figmaNode = mockButtonNode({
            componentProperties: {
                size: { type: 'VARIANT', value: 'Large' },
                loading: { type: 'VARIANT', value: 'True' }, // 새 variant!
            },
        });

        const code = await transpiler.transpile(figmaNode);

        expect(code).toContain('loading'); // ✅ 자동으로 변환됨!
    });
});
```

---

## 14. 결론

본 PRD는 Figma to React 트랜스파일러의 완전한 기술 명세입니다.

**핵심 설계 원칙**:

- ✅ Pipeline Architecture (3단계)
- ✅ 순수 함수 기반
- ✅ **Convention over Configuration** (Figma = Single Source of Truth)
- ✅ 메타데이터 = 예외 규칙만 명시
- ✅ Sprinkles를 통한 스타일 매핑

**주요 개선 사항**:

1. **자동 매핑**: Figma variants가 자동으로 React props로 변환
2. **디자이너 자유도**: metadata 수정 없이 variant 추가 가능
3. **휴먼 에러 최소화**: 동기화 불필요, Single Source of Truth
4. **metadata 역할 명확화**: 예외 처리 + Augmentation만
5. **TypeScript 메타데이터**: 타입 안전성 + 함수형 로직 지원

**구현 시 유의사항**:

1. 각 파이프라인 단계는 독립적으로 테스트 가능해야 함
2. 모든 매핑 함수는 순수 함수로 작성
3. 메타데이터는 TypeScript로 작성 (타입 안전성 + 함수 지원)
4. 메타데이터는 **예외만** 기록 (opt-in)
5. 성능을 위해 Variable 캐싱과 메모이제이션 활용

이 문서를 기반으로 코드 구현을 시작할 수 있습니다.
