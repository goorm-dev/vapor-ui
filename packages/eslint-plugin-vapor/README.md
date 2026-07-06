<p>
  <a href="https://npmjs.org/package/eslint-plugin-vapor">
    <img src="https://img.shields.io/npm/v/eslint-plugin-vapor.svg" alt="npm version">
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

## CSS Design-Token Rules

Lint CSS files for correct use of Vapor design tokens. Requires [`@eslint/css`](https://github.com/eslint/css) (flat-config only).

### Usage

```sh
pnpm add -D @eslint/css
```

```js
// eslint.config.mjs
import css from '@eslint/css';
import vapor from 'eslint-plugin-vapor';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.css', '**/*.scss'],
        plugins: { css, vapor },
        extends: ['vapor/flat/css'],
    },
]);
```

### VS Code setup

The VS Code ESLint extension does not lint `.scss` files by default. Add the following to your `.vscode/settings.json` so the rules run in the editor:

```json
{
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "html",
        "vue",
        "markdown",
        "css",
        "scss"
    ]
}
```

> `eslint.validate` overrides the extension's default list, so include every language you want linted — not just `css` / `scss`. After editing, run **ESLint: Restart ESLint Server** from the command palette.

### Rules

| Rule                            | Severity in preset | Description                                                                  |
| ------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `vapor/no-invalid-design-token` | error              | Disallow `var()` references to Vapor tokens not in the catalog               |
| `vapor/token-scope-mismatch`    | error              | Disallow Vapor tokens used in a property whose semantic scope does not match |
| `vapor/prefer-design-token`     | warn               | Suggest replacing raw CSS values with the nearest Vapor design token         |

### Options

#### `vapor/no-invalid-design-token`

```json
{
    "vapor/no-invalid-design-token": [
        "error",
        {
            "allowCustomTokens": ["--vapor-custom-token-a"]
        }
    ]
}
```

- `allowCustomTokens` (`string[]`, default `[]`): token names to whitelist. Supports `*` glob wildcards. Also merges with `settings.vapor.customTokens` (shared settings).

#### `vapor/token-scope-mismatch`

```json
{
    "vapor/token-scope-mismatch": [
        "error",
        {
            "propertyScopeMap": { "my-custom-prop": ["foreground"] },
            "ignoreProperties": ["--vendor-color"]
        }
    ]
}
```

- `propertyScopeMap` (`Record<string, Scope[]>`, default `{}`): extend or override the built-in property→scope mapping. Merged on top of the built-in catalog.
- `ignoreProperties` (`string[]`, default `[]`): CSS property names to skip entirely.

#### `vapor/prefer-design-token`

```json
{
    "vapor/prefer-design-token": [
        "warn",
        {
            "categories": ["foreground", "background"],
            "ignoreProperties": ["outline-color"],
            "ignoreValues": ["0", "transparent"],
            "maxSuggestions": 3
        }
    ]
}
```

- `categories` (`Scope[]`, default: all categories): restrict suggestions to tokens in the given scope categories (e.g. `"foreground"`, `"background"`, `"border"`, `"dimension"`, `"space"`, `"borderRadius"`, `"shadow"`).
- `ignoreProperties` (`string[]`, default `[]`): CSS property names to skip entirely.
- `ignoreValues` (`string[]`, default `["0","0px","transparent","none","currentcolor","inherit","initial","unset"]`): raw CSS values to skip.
- `maxSuggestions` (`number`, default `3`): maximum number of token suggestions to offer per violation.

### Limits (v1)

- No autofix (suggestions only via IDE quick-fix).
- No shorthand decomposition (e.g. `border` shorthand is not analysed for color parts).
- No dark-theme hex matching (only light-mode token values are indexed).

### Token Sync

Token assets live in `src/data/tokens/` and are copied from `skills/token-lint/assets/`. When the upstream token catalog changes, re-copy the assets and bump the package version.

## License

MIT License © 2025 goorm, Inc
