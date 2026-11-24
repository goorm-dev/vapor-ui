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

## Styling with `css()`

Vapor UI components are styled at build time by [`@vapor-ui/style-macro`](../style-macro). Author inline styles with the `css()` macro — call sites compile down to atomic class names and (for dynamic values) a tiny `style={{ ... }}` prop:

```tsx
import { css } from '@vapor-ui/style-macro';

export const Box = ({ accent }: { accent: string }) => (
    <div
        className={css({
            padding: '$space-400',
            backgroundColor: '$background-primary',
            color: accent,
            ':hover': { color: '$foreground-accent' },
            '@media (min-width: 768px)': { padding: '$space-600' },
        })}
    />
);
```

- `$<axis>-<name>` references a design token (e.g. `$space-400`, `$background-primary`). The macro resolves each one at build time.
- Dynamic values (`color: accent`) are hoisted into CSS variables and emitted into the element's `style` prop automatically — no runtime className dictionary.
- Nested keys drive selectors: `:hover`, `::before`, `[data-active="true"]`, `@media (...)`, `@container (...)`, `&.selected`.

### Bundler setup

Install `@vapor-ui/style-macro` and wire its plugin into your build. Pick the entry that matches your bundler:

```ts
// vite.config.ts
import vaporVitePlugin from '@vapor-ui/style-macro/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [vaporVitePlugin(), react()] });
```

```ts
// next.config.ts
import vaporNextPlugin from '@vapor-ui/style-macro/next';

export default vaporNextPlugin({ mode: 'auto' /* 'webpack' | 'turbopack' */ })({
    // existing NextConfig fields
});
```

Rolldown, Webpack and Turbopack entries are available at `@vapor-ui/style-macro/rolldown`, `@vapor-ui/style-macro/webpack` and `@vapor-ui/style-macro/turbopack`. See the [style-macro README](../style-macro/README.md) for the full option surface, supported value shapes, and the list of build-time errors the macro can raise.

## License

MIT License © 2025 goorm, Inc
