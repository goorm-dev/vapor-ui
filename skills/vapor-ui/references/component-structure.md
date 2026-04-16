# Vapor UI Component Structure

## Component Discovery Flow

```
index.ts → components/{name}/index.ts → (index.parts.ts or {component}.tsx exports) → generated JSON docs
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

| File                      | Purpose                        |
| ------------------------- | ------------------------------ |
| `index.ts`                | Main entry point with exports  |
| `index.parts.ts`          | Sub-component parts (optional) |
| `{component}.tsx`         | Component implementation       |
| `{component}.css.ts`      | Styles                         |
| `{component}.test.tsx`    | Tests                          |
| `{component}.stories.tsx` | Storybook stories              |

### Step 3: Parts Discovery

**If `index.parts.ts` exists:**

`index.ts` usually exports a namespace:

```ts
export * as Avatar from './index.parts';
```

And `index.parts.ts` maps sub-parts:

```ts
export {
    AvatarRoot as Root,
    AvatarImagePrimitive as ImagePrimitive,
    AvatarFallbackPrimitive as FallbackPrimitive,
} from './avatar';
```

**If only `index.ts` exists:**

```ts
export * from './button';
```

### Step 4: JSON Documentation

JSON docs are generated per exported API entry (component or part), not always one file per component folder.

Examples:

- Single component export: `button.json`
- Namespaced parts export: `card-root.json`, `card-header.json`, ...

Generated files are located at:

`apps/website/public/components/generated/*.json`

## JSON Schema

```json
{
    "name": "CardRoot",
    "displayName": "Card.Root",
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

| Field          | Type               | Description                                    |
| -------------- | ------------------ | ---------------------------------------------- |
| `name`         | string             | Prop name                                      |
| `type`         | string \| string[] | Type definition                                |
| `required`     | boolean            | Whether prop is required                       |
| `description`  | string             | Prop description                               |
| `defaultValue` | unknown            | Default value (optional, type depends on prop) |

### Component-level Schema

| Field            | Type   | Description                              |
| ---------------- | ------ | ---------------------------------------- |
| `name`           | string | Exported symbol name                     |
| `displayName`    | string | Display name used in docs                |
| `description`    | string | Component description                    |
| `props`          | array  | Props definitions                        |
| `defaultElement` | string | Default rendered HTML element (optional) |

## Examples Location

Component examples are located at:

```
apps/website/src/components/demo/examples/{component}/
```

Example files follow naming conventions:

- `default-{component}.tsx` - Basic usage
- `{component}-{variant}.tsx` - Variant demonstrations

Note: `{component}-examples.tsx` is not a guaranteed convention in the current codebase.
