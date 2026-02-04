# Vapor UI Component Structure

## Component Discovery Flow

```
index.ts → components/{name}/index.ts → index.parts.ts (if exists) → JSON docs
```

### Step 1: Component List

`packages/core/src/index.ts` exports all available components:

```ts
export * from './components/avatar';
export * from './components/button';
export * from './components/card';
// ...
```

### Step 2: Component Folder

Each component folder may contain:

| File | Purpose |
|------|---------|
| `index.ts` | Main entry point with exports |
| `index.parts.ts` | Sub-component parts (optional) |
| `{component}.tsx` | Component implementation |
| `{component}.css.ts` | Styles |
| `{component}.test.tsx` | Tests |
| `{component}.stories.tsx` | Storybook stories |

### Step 3: Parts Discovery

**If `index.parts.ts` exists:**

```ts
export {
    AvatarRoot as Root,
    AvatarImagePrimitive as ImagePrimitive,
    AvatarFallbackPrimitive as FallbackPrimitive,
} from './avatar';
```

**If only `index.ts` exists:**

```ts
export { Button } from './button';
export type { ButtonProps } from './button.types';
```

### Step 4: JSON Documentation

Each exported component has a corresponding JSON file:

`apps/website/public/components/generated/{kebab-case-name}.json`

## JSON Schema

```json
{
  "name": "Root",
  "displayName": "Avatar.Root",
  "description": "Component description",
  "props": [
    {
      "name": "size",
      "type": ["sm", "md", "lg", "xl"],
      "required": false,
      "description": "Size of the component",
      "defaultValue": "md"
    }
  ]
}
```

### Props Schema

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Prop name |
| `type` | string \| string[] | Type definition |
| `required` | boolean | Whether prop is required |
| `description` | string | Prop description |
| `defaultValue` | string | Default value (optional) |

## Examples Location

Component examples are located at:

```
apps/website/src/components/demo/examples/{component}/
```

Example files follow naming conventions:
- `default-{component}.tsx` - Basic usage
- `{component}-{variant}.tsx` - Variant demonstrations
- `{component}-examples.tsx` - Comprehensive examples
