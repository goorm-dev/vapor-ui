---
description: TypeScript and coding style conventions for packages/core
paths:
    - 'packages/core/src/**/*.ts'
    - 'packages/core/src/**/*.tsx'
---

# TypeScript Rules (`packages/core`)

## Naming Conventions

| Target                               | Convention      |
| ------------------------------------ | --------------- |
| Variables, functions                 | `camelCase`     |
| Components, interfaces, types, enums | `PascalCase`    |
| Constants                            | `CONSTANT_CASE` |
| Files, directories                   | `kebab-case`    |

## Type vs. Interface

- **`interface`**: component props and object shapes (supports `extends`)
- **`type`**: unions, intersections, utility-heavy composite types

```ts
// ✅ interface for props
interface ButtonProps {
    variant?: 'solid' | 'outline';
}

// ✅ type for unions
type ButtonSize = 'sm' | 'md' | 'lg';
```

## Null & Undefined

- Prefer `undefined` for optional values, absent props, and default behavior.
- Use `null` only where browser APIs, React refs, observers, animations, or abort signals require it.
- Use optional chaining (`?.`) and nullish coalescing (`??`) actively.

```ts
// ✅
const value = user?.name ?? 'Anonymous';

// ❌
const value = user && user.name ? user.name : 'Anonymous';
```

## Array Types

Use `T[]` syntax, not `Array<T>`:

```ts
// ✅
const items: string[] = [];

// ❌
const items: Array<string> = [];
```

## Enums & Constants

- Enum names and members: `PascalCase`.
- Prefer `as const` objects over enums when values need to be tree-shaken or used as string literals.

```ts
// ✅ as const (preferred)
const ButtonVariant = {
    Solid: 'solid',
    Outline: 'outline',
} as const;

// Use enum when PascalCase members and type safety are more important than tree-shaking
enum Direction {
    Up,
    Down,
}
```

Constants use `CONSTANT_CASE` with `as const`:

```ts
const MAX_RETRY_COUNT = 3 as const;
```

## Coding Style

- **Indentation**: 4 spaces.
- **Semicolons**: always.
- **Strings**: single quotes for simple strings; template literals when they improve readability.
- **Early return**: when nesting exceeds 3 levels.

```tsx
function processUser(user: User) {
    if (!user) return null;
    if (!user.isActive) return null;
    if (!user.permissions.canEdit) return null;

    return editUser(user);
}
```

- **Function parameters**: prefer an object parameter when a function has 3 or more parameters.
