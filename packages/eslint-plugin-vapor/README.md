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

## License

MIT License © 2025 goorm, Inc
