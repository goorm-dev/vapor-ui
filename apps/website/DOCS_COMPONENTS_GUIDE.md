# 컴포넌트 문서화 가이드라인 (v3)

이 문서는 Vapor UI의 모든 컴포넌트 문서를 일관된 형식과 품질로 작성하기 위한 공식 가이드입니다. 이 가이드를 따르면 누구나 쉽게 명확하고 유용한 문서를 작성할 수 있습니다.

## 핵심 원칙

1.  **데이터 기반 (Data-Driven):** 모든 Prop 정보는 `.json` 파일에 먼저 정의됩니다. 문서는 이 데이터를 기반으로 렌더링되므로, 데이터의 정확성이 가장 중요합니다.
2.  **사용자 중심 (User-Centric):** 사용자가 컴포넌트를 즉시 이해하고 사용할 수 있도록, 가장 간단한 예제를 먼저 보여주고 실용적인 사용 패턴을 제시합니다.
3.  **일관성 (Consistency):** 모든 문서는 표준 구조와 네이밍 컨벤션을 따라, 사용자가 어떤 문서를 보더라도 익숙한 환경에서 정보를 찾을 수 있도록 합니다.

## 컴포넌트 패턴 이해하기

문서 작성 전, 컴포넌트가 **단순 컴포넌트**인지 **복합 컴포넌트**인지 파악해야 합니다. 두 패턴은 문서 구조와 작성 방식에 차이가 있습니다.

- **단순 컴포넌트 (Simple Components)**: `Badge`, `Button`처럼 단일 컴포넌트로 모든 기능이 제공됩니다. Props를 통해 직접 제어합니다.
- **복합 컴포넌트 (Compound Components)**: `Avatar`처럼 `Avatar.Root`, `Avatar.Image` 등 여러 하위 컴포넌트를 조합하여 기능을 완성합니다. Context API를 통해 상태를 공유하는 경우가 많습니다.

## 문서 작성 프로세스

문서 작성은 항상 아래의 세 단계를 따릅니다.

1.  **1단계: 데이터 정의 (`[componentName].json`)**
2.  **2단계: 데모 코드 작성 (`/examples/*.tsx`)**
3.  **3단계: 콘텐츠 작성 (`[componentName].mdx`)**

---

## 1단계: 데이터 정의 (`[componentName].json`)

Props Table에 표시될 모든 정보는 `.json` 파일에 정의합니다. 이 단계는 두 컴포넌트 패턴 모두 동일합니다.

### 파일 구조

- `props`: 컴포넌트의 메인(Root) Props.
- `[subComponentName]Props`: 하위 컴포넌트가 존재할 경우, 해당 하위 컴포넌트의 Props. (예: `imageProps`, `fallbackProps`)

### 참조

- 타입에 대한 데이터는 packages/core/dist/components/[copmponentName]에 있는 타입 정의 파일을 기반으로 작성한다.

### Prop 객체 필드

| 필드          | 타입       | 설명                                                       | 예시                                     |
| ------------- | ---------- | ---------------------------------------------------------- | ---------------------------------------- |
| `prop`        | `string`   | Prop의 이름입니다.                                         | `"size"`                                 |
| `type`        | `string[]` | Prop이 받을 수 있는 타입 또는 옵션 목록입니다.             | `["sm", "md", "lg"]`, `["string"]`       |
| `default`     | `string`   | Prop의 기본값입니다. 기본값이 없으면 `null`로 지정합니다.  | `"md"`, `null`                           |
| `description` | `string`   | Prop에 대한 한글 설명입니다. 명확하고 간결하게 작성합니다. | `"아바타 컴포넌트의 크기를 조절합니다."` |

---

## 2단계: 데모 코드 작성 (`/examples/*.tsx`)

`.mdx` 파일의 `<Demo>` 컴포넌트에서 보여줄 실제 React 코드를 작성합니다.

### 데모 시스템 공통 규칙

- **파일 경로**: `/src/components/demo/examples/{demo-name}.tsx`
- **파일-데모 연결**: `<Demo name="demo-name">`의 `name`과 `.tsx` 파일명은 정확히 일치해야 합니다.
- **함수 네이밍**: 데모의 `name`을 `PascalCase`로 변환하여 함수명으로 사용합니다. (예: `avatar-size` -> `AvatarSize`)
- **Import**: `import { Component } from '@vapor-ui/core';` 와 같이 단일 구문으로 가져옵니다.
- **필수 생성**: `.mdx` 파일에서 사용하는 모든 `<Demo name="demo-name">` 태그에 대해 반드시 해당하는 `.tsx` 파일을 생성해야 합니다. 파일이 없으면 오류가 발생합니다.

### 컴포넌트 패턴별 코드 내용

#### 단순 컴포넌트 데모

- **Default Demo**: `<Badge>Hello</Badge>`처럼, 최소한의 props를 가진 단일 컴포넌트 인스턴스로 작성합니다.
- **Property Demo**: `<div class="flex flex-wrap gap-2">` 컨테이너를 사용하여 여러 옵션을 체계적으로 보여줍니다.
- **컨테이너**: 필수적이지 않다면 `<>` (Fragment)를 사용해도 좋습니다.

#### 복합 컴포넌트 데모

- **Default Demo**: `<Avatar.Root><Avatar.Image /></Avatar.Root>`처럼, 하위 컴포넌트 간의 **조합 관계**를 보여주는 패턴으로 작성합니다.
- **Property Demo**: 조합된 상태에서 특정 기능의 옵션을 보여줍니다.
- **Examples Demo**: `Avatar.Simple` 사용법, 이미지 로딩 실패 등 다양한 조합 전략과 엣지 케이스를 보여줍니다.
- **컨테이너**: 복잡한 구조를 가지므로 항상 `div` 컨테이너를 사용하고, `gap-4` 등 충분한 여백을 줍니다.

---

## 3단계: 콘텐츠 작성 (`[componentName].mdx`)

데이터와 데모 코드가 준비되면, 컴포넌트 패턴에 맞는 표준 구조에 따라 `.mdx` 파일을 작성합니다.

### 단순 컴포넌트 표준 구조

## ` ``markdown

title: 'ComponentName'
site_name: 'ComponentName - Vapor Core'
description: '컴포넌트의 핵심 역할을 한글로 간결하게 설명합니다.'

---

<Demo name="default-[componentName]" />

## Property

### FeatureName

{컴포넌트}의 {기능}은(는) {옵션} 으로 제공합니다.
<Demo name="[componentName]-[featureName]" />

## Props Table

### ComponentName

이 컴포넌트는 `{html-element}` 요소를 기반으로... (HTML 요소 정보 포함)
<ComponentPropsTable file="[componentName]" section="props" />
` ``

### 복합 컴포넌트 표준 구조

## ` ``markdown

title: 'ComponentName'
site_name: 'ComponentName - Vapor Core'
description: '컴포넌트의 핵심 역할을 한글로 간결하게 설명합니다.'

---

<Demo name="default-[componentName]" />

## Property

### FeatureName

<Demo name="[componentName]-[featureName]" />

## Examples

### UsagePattern

[사용 패턴에 대한 설명]
<Demo name="[componentName]-[usagePattern]" />

## Props Table

### ComponentName.Root

[Root 컴포넌트의 역할과 컨텍스트에 대한 설명]
<ComponentPropsTable file="[componentName]" section="props" />

### ComponentName.SubComponent

[하위 컴포넌트의 역할과 특징 설명]
<ComponentPropsTable file="[componentName]" section="subComponentProps" />
` ``

---

## 문서화 체크리스트

### 단순 컴포넌트 체크리스트

- [ ] **Frontmatter**: `title`, `site_name`, `description`이 모두 채워졌는가?
- [ ] **JSON 파일**: 모든 Prop이 `[componentName].json` 파일에 정확히 정의되었는가?
- [ ] **데모 파일**: `default` 데모가 단일 컴포넌트 인스턴스로 작성되었는가?
- [ ] **데모 파일 생성**: 모든 `<Demo name="demo-name">` 태그에 대해 `/src/components/demo/examples/demo-name.tsx` 파일이 생성되었는가?
- [ ] **Property Section**: 모든 기능 옵션을 `gap-2` 컨테이너로 시연하는가?
- [ ] **Examples Section**: **(불필요)** 이 섹션이 없는 것을 확인했는가?
- [ ] **Props Table**: 단일 테이블이며, 기반 HTML 요소에 대한 설명이 포함되었는가?
- [ ] **네이밍 컨벤션**: 모든 데모 `name`과 함수명이 규칙을 따르는가?

### 복합 컴포넌트 체크리스트

- [ ] **Frontmatter**: `title`, `site_name`, `description`이 모두 채워졌는가?
- [ ] **JSON 파일**: 모든 **하위 컴포넌트** Prop이 `[componentName].json` 파일에 정의되었는가?
- [ ] **데모 파일**: `default` 데모가 컴포넌트 조합 패턴을 보여주는가?
- [ ] **데모 파일 생성**: 모든 `<Demo name="demo-name">` 태그에 대해 `/src/components/demo/examples/demo-name.tsx` 파일이 생성되었는가?
- [ ] **Property Section**: `gap-4` 컨테이너를 사용하여 기능을 시연하는가?
- [ ] **Examples Section**: **(필수)** 다양한 조합 패턴과 엣지 케이스를 보여주는가?
- [ ] **Props Table**: 모든 하위 컴포넌트에 대한 테이블과 역할 설명이 포함되었는가?
- [ ] **네이밍 컨벤션**: 모든 데모 `name`과 함수명이 규칙을 따르는가?
- [ ] `Simple` 버전이 있다면 관련 문서가 포함되었는가?
