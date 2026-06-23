<p>
  <a href="https://www.npmjs.com/package/@vapor-ui/core">
    <img src="https://img.shields.io/npm/v/@vapor-ui/core.svg" alt="npm version">
  </a>
</p>

# @vapor-ui/core

An open-source UI component library for building high-quality, accessible web apps and design systems.

## Why?

Vapor UI is a React-based UI library designed with a focus on accessibility, customization, and developer experience. Use it as a foundation layer for your design system or gradually adopt it into existing projects.

## Installation

```sh
# pnpm
pnpm add @vapor-ui/core

# npm
npm install @vapor-ui/core

# yarn
yarn add @vapor-ui/core
```

> For detailed usage instructions, please refer to the [official documentation](https://vapor-ui.goorm.io/docs/getting-started/installation).

## `$style` build-time utility

`@vapor-ui/core` ships a `$style({...})` macro that compiles to atomic class names at build time:

```tsx
import { $style } from '@vapor-ui/core';

export const Box = () => (
    <div
        className={$style({
            padding: { default: '$400', sm: '$200' },
            backgroundColor: '$blue-500',
            color: { default: '$white', _hover: '$blue-100' },
        })}
    />
);
```

The macro requires `@vapor-ui/style-macro/unplugin` in your bundler:

```js
// vite.config.ts | rollup.config.mjs | next.config.mjs
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';

// vite:   plugins: [vaporStyleMacro.vite()]
// rollup: plugins: [vaporStyleMacro.rollup()]
// next webpack: config.plugins.push(vaporStyleMacro.webpack())
```

For raw `@custom-media` resolution (e.g. Next/PostCSS pipelines), also enable the helper:

```js
// postcss.config.mjs
export default {
    plugins: {
        '@vapor-ui/core/postcss': {},
        // …other postcss plugins
    },
};
```

Override breakpoints by passing `{ sm, md, lg }` to the helper. See the migration guide for full details.

## License

MIT License © 2025 goorm, Inc
