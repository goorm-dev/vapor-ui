<p align="center">
  <a href="https://github.com/goorm-dev/vapor-ui/actions">
    <img src="https://img.shields.io/github/check-runs/goorm-dev/vapor-ui/main?label=CI" alt="CI status" />
  </a>
  <a href="https://npmjs.org/package/eslint-plugin-vapor">
    <img src="https://img.shields.io/npm/v/eslint-plugin-vapor.svg" alt="npm version">
  </a>
  <a href="https://github.com/goorm-dev/vapor-ui/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/eslint-plugin-vapor.svg" alt="license">
  </a>
</p>

# eslint-plugin-vapor

An ESLint plugin focused on accessibility and code consistency for Vapor UI projects.

## Why?

This plugin helps ensure accessibility (a11y) and consistent code quality when using Vapor UI components by automatically detecting and suggesting improvements for issues in your JSX/TSX code. For issues that cannot be caught by static analysis alone, we recommend using additional tools in your actual rendering environment.

## Installation

```sh
# pnpm
pnpm add -D eslint-plugin-vapor

# npm
npm install --save-dev eslint-plugin-vapor

# yarn
yarn add -D eslint-plugin-vapor
```

> Requires `eslint`, `eslint-plugin-jsx-a11y`, and `typescript-eslint` as peerDependencies.
>
> Please follow these instructions for proper setup and configurations of peer dependencies.
>
> - [eslint-plugin-jsx-a11y guide](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y?tab=readme-ov-file#installation)
> - [typescript-eslint guide](https://typescript-eslint.io/getting-started/#step-1-installation).

## Usage

### Flat Config (`eslint.config.js`)

```js
import vapor from 'eslint-plugin-vapor';

export default [
    vapor.configs.flat,
    // ...your custom config
];
```

### Legacy Config (`.eslintrc`)

```json
{
    "plugins": ["vapor"],
    "extends": ["plugin:vapor/legacy"]
}
```

## Supported Rules

| Rule                               | Description                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `vapor/icon-button-has-aria-label` | Requires `aria-label` on IconButton components                                                            |
| `vapor/navigation-has-aria-label`  | Requires `aria-label` on NavigationMenu.Root and Breadcrumb.Root                                          |
| `vapor/avatar-has-alt-text`        | Requires `alt` on Avatar.Root when `src` is present                                                       |
| `vapor/dialog-should-have-title`   | Requires an accessible name (Title component or aria-label/aria-labelledby) on Dialog/Popover/Sheet.Popup |

## Example

**Icon Button**

```tsx
// bad
<IconButton />

// great
<IconButton aria-label="Close" />
```

**Navigations**

```tsx
// bad
<NavigationMenu.Root />

// great
<NavigationMenu.Root aria-label="Main navigation" />
```

**Avatar**

```tsx
// bad
<Avatar.Root src="foo.png" />

// great
<Avatar.Root src="foo.png" alt="Profile image" />
```

**Dialogs**

```tsx
// bad
<Dialog.Popup />

// great
<Dialog.Popup aria-label="Settings" />

// or
<Dialog.Popup>
    <Dialog.Title>Settings</Dialog.Title>
</Dialog.Popup>
```

## Creating a new rule

To add a new rule:

1. Create a file in `src/rules/`
2. Register it in `src/index.ts`
3. Add tests (`src/rules/[rule].test.ts]/`) and documentation

## License

MIT License © 2025 goorm, Inc
