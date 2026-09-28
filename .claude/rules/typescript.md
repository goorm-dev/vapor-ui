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

## React Components

Never use `React.FC`. Use plain function or arrow function with an explicit props type instead.

`React.FC` implicitly adds `children?: ReactNode` to every component, making it unclear whether children are intentional. It also breaks with `defaultProps` (`LibraryManagedAttributes` stops working), doesn't support generics, and was removed from the Create React App TypeScript template in React 18.

```tsx
// ❌
const Button: React.FC<Props> = ({ children }) => { ... }

// ✅
interface Props {
    children?: React.ReactNode; // only when actually needed
}
const Button = ({ children }: Props) => { ... }
```

## Type vs. Interface

- **`interface`**: component props and extendable object shapes — prefer `interface` because `extends` catches type conflicts at definition time, whereas `type &` intersection silently produces `never` for conflicting property types and only surfaces the error at the use site. `interface` is also faster for the TypeScript compiler when inheritance is involved.
- **`type`**: unions, intersections, computed/conditional types, and single-line literal unions

```ts
// ✅ interface for props (catches conflicts early)
interface ButtonProps {
    variant?: 'solid' | 'outline';
}

// ✅ type for unions and computed types
type ButtonSize = 'sm' | 'md' | 'lg';
type Flatten<T> = T extends Array<infer U> ? U : T;
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

Constants use `CONSTANT_CASE`. Apply `as const` only to object constants — primitive values are already narrowed:

```ts
// ✅
const MAX_RETRY_COUNT = 3;

// ❌ redundant — 3 is already a literal type
const MAX_RETRY_COUNT = 3 as const;
```
