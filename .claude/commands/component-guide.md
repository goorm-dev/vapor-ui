# Component Documentation Guide for {{component}}

Follow this guide to create comprehensive documentation for the `{{component}}` component.

## Component Pattern Analysis

First, determine if `{{component}}` is a **Simple Component** or **Compound Component**:

- **Simple Components**: Single component with direct prop control (e.g., `Badge`, `Button`)
- **Compound Components**: Multiple sub-components working together (e.g., `Avatar.Root`, `Avatar.Image`)

## Step 1: Data Definition (`{{component}}.json`)

Create `/src/components/demo/{{component}}.json` with the following structure:

```json
{
    "props": [
        {
            "prop": "propName",
            "type": ["option1", "option2"],
            "default": "defaultValue",
            "description": "Korean description of the prop"
        }
    ]
}
```

For compound components, add sub-component props:

```json
{
  "props": [...],
  "subComponentProps": [...]
}
```

**Reference**: Use type definitions from `packages/core/dist/components/{{component}}/` for accurate prop information.

## Step 2: Demo Code (`/examples/*.tsx`)

Create demo files in `/src/components/demo/examples/` following these patterns:

### Required Demos:

- `default-{{component}}.tsx` - Basic usage example
- Property demos for each feature (e.g., `{{component}}-size.tsx`)

### Demo Code Template:

```tsx
import { {{component}} } from '@vapor-ui/core';

export function Default{{component}}() {
  return <{{component}}>Content</{{component}}>;
}
```

### Container Guidelines:

- **Simple Components**: Use `<div className="flex flex-wrap gap-2">` for property demos
- **Compound Components**: Use `<div className="flex flex-wrap gap-4">` for more spacing

## Step 3: Content Writing (`{{component}}.mdx`)

### Simple Component Structure:

```markdown
---
title: '{{component}}'
site_name: '{{component}} - Vapor Core'
description: 'Brief Korean description of the component'
---

<Demo name="default-{{component}}" />

## Property

### FeatureName

{{component}}의 기능은 옵션으로 제공합니다.
<Demo name="{{component}}-feature" />

## Props Table

### {{component}}

이 컴포넌트는 `element-name` 요소를 기반으로 합니다.
<ComponentPropsTable file="{{component}}" section="props" />
```

### Compound Component Structure:

```markdown
---
title: '{{component}}'
site_name: '{{component}} - Vapor Core'
description: 'Brief Korean description of the component'
---

<Demo name="default-{{component}}" />

## Property

### FeatureName

<Demo name="{{component}}-feature" />

## Examples

### UsagePattern

[Usage pattern description]
<Demo name="{{component}}-usage" />

## Props Table

### {{component}}.Root

[Root component role description]
<ComponentPropsTable file="{{component}}" section="props" />

### {{component}}.SubComponent

[Sub-component role description]
<ComponentPropsTable file="{{component}}" section="subComponentProps" />
```

## Quality Checklist

### Simple Component:

- [ ] JSON file with all props defined
- [ ] Default demo shows single component instance
- [ ] Property demos use `gap-2` containers
- [ ] Single props table with HTML element info
- [ ] No Examples section

### Compound Component:

- [ ] JSON file with all sub-component props
- [ ] Default demo shows component composition
- [ ] Property demos use `gap-4` containers
- [ ] Examples section with various patterns
- [ ] Props tables for all sub-components
- [ ] Simple version documented if available

## Key Principles

1. **Data-Driven**: All prop info defined in JSON first
2. **User-Centric**: Show simplest example first
3. **Consistency**: Follow standard structure and naming

Remember: Every `<Demo name="demo-name">` must have a corresponding `.tsx` file, or the build will fail.
