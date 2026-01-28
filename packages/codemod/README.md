<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![NPM Version][npm-shield]][npm-url]
[![MIT License][license-shield]][license-url]
[![Beta][beta-shield]][beta-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/goorm-dev/vapor-ui">
    <img src="https://statics.goorm.io/gds/docs/images/vapor-log.svg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">@vapor-ui/codemod</h3>

  <p align="center">
    Automated code migration tools for Vapor UI using jscodeshift
    <br />
    <a href="https://vapor-ui.goorm.io"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/goorm-dev/vapor-ui/issues/new">Report Bug</a>
    &middot;
    <a href="https://github.com/goorm-dev/vapor-ui/issues/new">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about">About</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#available-transforms">Available Transforms</a></li>
    <li><a href="#options">Options</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#support">Support</a></li>
    <li><a href="#authors">Authors</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## About

`@vapor-ui/codemod` is a CLI tool that helps you automatically migrate your codebase when Vapor UI components have breaking changes. Built on [jscodeshift](https://github.com/facebook/jscodeshift), it provides safe and reliable code transformations.

**Key Features:**

- **Safe Migrations**: Git safety checks prevent running on uncommitted changes
- **Interactive Mode**: Run without arguments to see all available transforms
- **Flexible Parsing**: Support for TypeScript, TSX, JavaScript, and JSX files
- **Dry Run Support**: Preview changes before applying them

> **Note:** As Vapor UI is currently in beta, this package provides codemods for migrating from beta versions. Additional codemods will be added as breaking changes occur in future releases.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

### Requirements

- **Node.js**: >= 14
- **Git**: Required for safety checks (can be bypassed with `--force`)

### Install

You can run the codemod directly using `npx` without installing:

```bash
npx @vapor-ui/codemod <transform> <path>
```

Or install it as a dev dependency:

```bash
# npm
npm install -D @vapor-ui/codemod

# pnpm
pnpm add -D @vapor-ui/codemod

# yarn
yarn add -D @vapor-ui/codemod
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

### Basic Usage

```bash
npx @vapor-ui/codemod <transform> <path> [...options]
```

### Interactive Mode

Run the command without specifying a transform to see an interactive list of all available options:

```bash
npx @vapor-ui/codemod
```

### Examples

**Migrate to v1:**

```bash
npx @vapor-ui/codemod v1/migrate src/
```

**Dry run to preview changes:**

```bash
npx @vapor-ui/codemod v1/migrate src/ --dry
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Available Transforms

### `v1/migrate`

Migrates code from `@base-ui-components/react@beta` to `@base-ui/react@1.1.0`. This transform applies the following changes:

#### Features

- **Smart Import Detection**: Only transforms components imported from `@vapor-ui/core`
- **Alias Support**: Handles aliased imports (e.g., `import { Menu as VaporMenu }`)
- **Component-Specific Logic**: Different transformation rules per component

#### Transformations

| Transformation                | Component              | Notes                               |
| ----------------------------- | ---------------------- | ----------------------------------- |
| `loop` → `loopFocus`          | Menu, Select, Toolbar  | Prop rename                         |
| `trackAnchor` → `disableAnchorTracking` | Popover, Menu, Tooltip | Boolean inversion                   |
| `hoverable` → `disableHoverablePopup`   | Tooltip                | Boolean inversion                   |
| **Hover Props (Root → Trigger)** |                        |                                     |
| `openOnHover`                 | Menu, Popover          | Moved from Root to Trigger          |
| `delay`                       | Menu, Popover, Tooltip | Moved from Root to Trigger          |
| `closeDelay`                  | Menu, Popover          | Moved from Root to Trigger          |

> **Note:**
> - Boolean props `trackAnchor` and `hoverable` are **inverted** when transformed to their `disable*` equivalents
> - Tooltip **does not** move `closeDelay` prop (only `delay` is moved)

#### Examples

**Menu with all transformations:**

```tsx
// Before
<Menu.Root openOnHover delay={200} closeDelay={100} loop>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.PositionerPrimitive trackAnchor>
    <Menu.Popup>Content</Menu.Popup>
  </Menu.PositionerPrimitive>
</Menu.Root>

// After
<Menu.Root loopFocus>
  <Menu.Trigger openOnHover delay={200} closeDelay={100}>Open</Menu.Trigger>
  <Menu.PositionerPrimitive disableAnchorTracking={false}>
    <Menu.Popup>Content</Menu.Popup>
  </Menu.PositionerPrimitive>
</Menu.Root>
```

**Tooltip with hover props:**

```tsx
// Before
<Tooltip.Root hoverable={false} delay={500} closeDelay={200}>
  <Tooltip.Trigger>Hover</Tooltip.Trigger>
  <Tooltip.Popup>Content</Tooltip.Popup>
</Tooltip.Root>

// After (closeDelay stays on Root)
<Tooltip.Root disableHoverablePopup={true} closeDelay={200}>
  <Tooltip.Trigger delay={500}>Hover</Tooltip.Trigger>
  <Tooltip.Popup>Content</Tooltip.Popup>
</Tooltip.Root>
```

**Aliased imports:**

```tsx
// Before
import { Menu as VaporMenu } from '@vapor-ui/core';

<VaporMenu.Root loop>
  <VaporMenu.Trigger>Open</VaporMenu.Trigger>
</VaporMenu.Root>

// After
<VaporMenu.Root loopFocus>
  <VaporMenu.Trigger>Open</VaporMenu.Trigger>
</VaporMenu.Root>
```

#### Usage

```bash
npx @vapor-ui/codemod v1/migrate src/
```

---

## Options

| Option                 | Description                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `--force`              | Bypass Git safety checks and forcibly run codemods                                                   |
| `--dry`                | Dry run mode. Changes are not written to files                                                       |
| `--parser <parser>`    | Parser to use: `babel`, `babylon`, `flow`, `ts`, `tsx` (default: `tsx`)                              |
| `--extensions <ext>`   | Comma-separated file extensions to transform (default: `tsx,ts,jsx,js`)                              |
| `--jscodeshift <args>` | Pass options directly to jscodeshift. [See jscodeshift CLI options](https://jscodeshift.com/run/cli) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

We welcome contributions to `@vapor-ui/codemod`! Here's how you can help:

### Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `pnpm install` (from the repository root)
3. **Navigate to codemod package**: `cd packages/codemod`

### Development Workflow

**Run tests:**
```bash
pnpm test
```

**Run tests in watch mode:**
```bash
pnpm test:watch
```

**Lint your code:**
```bash
pnpm lint
```

**Type check:**
```bash
pnpm typecheck
```

**Build the package:**
```bash
pnpm build
```

### Adding a New Transform

1. Create a new directory under `src/transforms/` (e.g., `src/transforms/v2/migrate/`)
2. Implement your transform logic in `index.ts`
3. Add test fixtures in `__testfixtures__/` directory:
   - `*.input.tsx` - Input code before transformation
   - `*.output.tsx` - Expected output after transformation
4. Create a test file in `__tests__/` directory
5. Register your transform in `src/bin/cli.ts`
6. Update the README.md with documentation

### Code Quality

- Write tests for all new transforms
- Follow the existing code style
- Ensure all tests pass before submitting
- Run linter and type checker

### Submitting Changes

1. Create a new branch: `git checkout -b feature/my-new-transform`
2. Make your changes and commit: `git commit -m "feat: add v2/migrate transform"`
3. Push to your fork: `git push origin feature/my-new-transform`
4. Open a Pull Request with a clear description

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Support

- **Documentation**: [vapor-ui.goorm.io](https://vapor-ui.goorm.io)
- **Issues**: [GitHub Issues](https://github.com/goorm-dev/vapor-ui/issues)
- **Email**: vapor.ui@goorm.io

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Authors

Maintained by the Vapor UI team at [Goorm](https://goorm.io).

Special thanks to all contributors who have helped improve this project:
- [Contributors](https://github.com/goorm-dev/vapor-ui/graphs/contributors)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[npm-shield]: https://img.shields.io/npm/v/@vapor-ui/codemod.svg?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/@vapor-ui/codemod
[license-shield]: https://img.shields.io/github/license/goorm-dev/vapor-ui.svg?style=for-the-badge
[license-url]: https://github.com/goorm-dev/vapor-ui/blob/main/LICENSE
[beta-shield]: https://img.shields.io/badge/status-beta-orange?style=for-the-badge
[beta-url]: https://github.com/goorm-dev/vapor-ui/releases
