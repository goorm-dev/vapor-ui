<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
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
    Automated code migration tools for Vapor UI. Easily upgrade your codebase when components have breaking changes.
    <br />
    <a href="https://vapor-ui.goorm.io"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://vapor-ui.goorm.io">View Demo</a>
    &middot;
    <a href="https://github.com/goorm-dev/vapor-ui/issues/new">Report Bug</a>
    &middot;
    <a href="https://github.com/goorm-dev/vapor-ui/issues/new">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#available-transforms">Available Transforms</a></li>
    <li><a href="#support">Support</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

@vapor-ui/codemod is an automated code migration tool built on jscodeshift that helps you safely upgrade your Vapor UI codebase when components have breaking changes. With 18 transforms covering both components and icons, it handles complex restructuring including component renames, prop migrations, and import path updates.

Key features:

- **Safe Migrations**: Git safety checks ensure your working directory is clean before running transforms
- **Interactive CLI**: Run without arguments to see and select from all available transforms
- **Dry Run Mode**: Preview changes before writing them to disk
- **18 Transforms**: Comprehensive coverage of component and icon migrations from @goorm-dev/vapor-core to @vapor-ui/core
- **Smart Transformations**: Handles imports, prop renames, value conversions, and component restructuring
- **Multiple File Types**: Supports TypeScript, JSX, TSX, and JavaScript files

> **Note:**
>
> As there is no official major version of Vapor UI yet, this package currently only provides the codemods that were used internally for component migration.
>
> Codemods to assist with migration **will be added in the future if breaking changes occur** in subsequent Vapor UI versions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![jscodeshift][jscodeshift.badge]][jscodeshift-url]
- [![TypeScript][TypeScript.badge]][TypeScript-url]
- [![Node.js][Node.badge]][Node-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Using @vapor-ui/codemod is straightforward. The recommended approach is to use npx, which requires no installation.

### Prerequisites

- Node.js >= 14
- A clean Git working directory (or use `--force` to bypass)
- A project using Vapor UI components

### Installation

The recommended way to use @vapor-ui/codemod is via npx (no installation needed):

```sh
npx @vapor-ui/codemod
```

Alternatively, you can install it globally:

```sh
npm install -g @vapor-ui/codemod
```

Or using pnpm:

```sh
pnpm add -g @vapor-ui/codemod
```

Or using yarn:

```sh
yarn global add @vapor-ui/codemod
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Interactive Mode

Run without arguments to see an interactive list of all available transforms:

```sh
npx @vapor-ui/codemod
```

This will prompt you to select a transform and specify the path to transform.

**Example Terminal Output:**

```
? Which transform would you like to apply? (Use arrow keys)
❯ internal/icons/migrate-icons-import
  internal/core/alert
  internal/core/avatar
  internal/core/badge
  internal/core/button
  internal/core/dropdown
  (Move up and down to reveal more choices)

? On which files or directory should the codemod be applied?
  ./src

Processing 45 files...
Spawning 4 workers...
Sending 12 files to free worker...
✓ All done.
Results:
12 ok
0 skipped
0 errors
```

### Direct Mode

Specify the transform and path directly:

```sh
npx @vapor-ui/codemod <transform> <path>
```

Example:

```sh
npx @vapor-ui/codemod internal/core/button src
```

### Dry Run Mode

Preview changes without writing to files:

```sh
npx @vapor-ui/codemod internal/core/button src --dry
```

### Common Options

- `--force` - Bypass Git safety checks and forcibly run codemods
- `--dry` - Dry run. Changes are not written to files
- `--parser` - Specify the parser: babel, babylon, flow, ts, or tsx (default: tsx)
- `--extensions` - Comma-separated list of file extensions (default: tsx,ts,jsx,js)
- `--jscodeshift` - Pass options directly to jscodeshift ([see more options](https://jscodeshift.com/run/cli))

### Before/After Examples

#### Example 1: Button Component

**Before:**

```tsx
import { Button } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Button shape="fill" color="primary">
            Primary
        </Button>
        <Button shape="outline" color="primary">
            Secondary
        </Button>
        <Button shape="invisible" color="primary">
            Tertiary
        </Button>
    </>
);
```

**After:**

```tsx
import { Button } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Button variant="fill" colorPalette="primary">
            Primary
        </Button>
        <Button variant="outline" colorPalette="primary">
            Secondary
        </Button>
        <Button variant="ghost" colorPalette="primary">
            Tertiary
        </Button>
    </>
);
```

**Changes:**

- Import path: `@goorm-dev/vapor-core` → `@vapor-ui/core`
- Prop rename: `shape` → `variant`
- Prop rename: `color` → `colorPalette`
- Value conversion: `invisible` → `ghost`

#### Example 2: Dropdown Component

**Before:**

```tsx
import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Dropdown>
            <Dropdown.Trigger>Open</Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content>
                    <Dropdown.Item>Item 1</Dropdown.Item>
                    <Dropdown.Item>Item 2</Dropdown.Item>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
```

**After:**

```tsx
import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
                <Menu.Item>Item 2</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
    );
}
```

**Changes:**

- Import path: `@goorm-dev/vapor-core` → `@vapor-ui/core`
- Component rename: `Dropdown` → `Menu`
- Explicit root component: `<Dropdown>` → `<Menu.Root>`
- Subcomponent rename: `Dropdown.Portal` → `Menu.Popup`
- `Dropdown.Content` removed and integrated into structure

_For comprehensive documentation, examples, and API references, please visit the [Documentation](https://vapor-ui.goorm.io)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AVAILABLE TRANSFORMS -->

## Available Transforms

You can run the command without specifying a transform to be prompted with an interactive list. This allows you to see all available options and choose the one you need.

> **Note:** These transforms were used internally for migrating components from @goorm-dev/vapor-core to @vapor-ui/core.

### Icon Migration

#### `internal/icons/migrate-icons-import`

Converts `@goorm-dev/vapor-icons` import to `@vapor-ui/icons` import.

```sh
npx @vapor-ui/codemod internal/icons/migrate-icons-import src
```

### Component Migrations

The following 17 component transforms are available:

| Transform                   | Component       | Key Changes                                                          |
| --------------------------- | --------------- | -------------------------------------------------------------------- |
| `internal/core/alert`       | Alert           | Import path, prop migrations                                         |
| `internal/core/avatar`      | Avatar          | Import path, prop migrations                                         |
| `internal/core/badge`       | Badge           | Import path, prop migrations                                         |
| `internal/core/breadcrumb`  | Breadcrumb      | Import path, prop migrations                                         |
| `internal/core/button`      | Button          | `shape` → `variant`, `color` → `colorPalette`, `invisible` → `ghost` |
| `internal/core/card`        | Card            | Import path, prop migrations                                         |
| `internal/core/checkbox`    | Checkbox        | Import path, prop migrations                                         |
| `internal/core/collapsible` | Collapsible     | Import path, prop migrations                                         |
| `internal/core/dialog`      | Dialog          | Import path, component restructuring                                 |
| `internal/core/dropdown`    | Dropdown → Menu | Component rename, `Portal` → `Popup`, explicit `Root`                |
| `internal/core/icon-button` | IconButton      | Import path, prop migrations                                         |
| `internal/core/popover`     | Popover         | Import path, component restructuring                                 |
| `internal/core/radio-group` | RadioGroup      | Import path, prop migrations                                         |
| `internal/core/switch`      | Switch          | Import path, prop migrations                                         |
| `internal/core/tabs`        | Tabs            | Import path, prop migrations                                         |
| `internal/core/text`        | Text            | Import path, prop migrations                                         |
| `internal/core/text-input`  | TextInput       | Import path, prop migrations                                         |

### Usage Pattern

To run a component transform:

```sh
# Interactive mode
npx @vapor-ui/codemod

# Direct mode
npx @vapor-ui/codemod internal/core/<component-name> <path>

# Example: Transform Button components in src directory
npx @vapor-ui/codemod internal/core/button src

# Example: Dry run to preview changes
npx @vapor-ui/codemod internal/core/dropdown src --dry
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORT -->

## Support

If you need help with @vapor-ui/codemod, here are some resources:

### Documentation

- [Vapor UI Documentation](https://vapor-ui.goorm.io) - Comprehensive component documentation
- [Migration Guide](https://vapor-ui.goorm.io/guides/migration) - Detailed migration instructions

### Getting Help

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/goorm-dev/vapor-ui/issues)

### Common Issues

**Git safety check fails:**

```bash
# Use --force to bypass (use with caution)
npx @vapor-ui/codemod <transform> <path> --force
```

**Transform not found:**

```bash
# Run without arguments to see all available transforms
npx @vapor-ui/codemod
```

**Changes not applied:**

```bash
# Use --dry to preview changes first
npx @vapor-ui/codemod <transform> <path> --dry
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Add transforms for v1.0.0 breaking changes (when released)
- [ ] Enhanced error reporting with detailed migration logs
- [ ] Support for complex code patterns and edge cases
- [ ] Interactive conflict resolution for ambiguous transformations
- [ ] Migration report generation with statistics and warnings

See the [open issues](https://github.com/goorm-dev/vapor-ui/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for detailed guidelines on:

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Vapor Team - vapor.ui@goorm.io

Project Link: [https://github.com/goorm-dev/vapor-ui](https://github.com/goorm-dev/vapor-ui)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Special thanks to the open-source projects that make @vapor-ui/codemod possible:

- [jscodeshift](https://github.com/facebook/jscodeshift) - The powerful AST transformation framework that powers this tool
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) - Interactive command-line interface
- [Node.js](https://nodejs.org/) - JavaScript runtime built on Chrome's V8 engine

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/goorm-dev/vapor-ui.svg?style=for-the-badge
[contributors-url]: https://github.com/goorm-dev/vapor-ui/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/goorm-dev/vapor-ui.svg?style=for-the-badge
[forks-url]: https://github.com/goorm-dev/vapor-ui/network/members
[stars-shield]: https://img.shields.io/github/stars/goorm-dev/vapor-ui.svg?style=for-the-badge
[stars-url]: https://github.com/goorm-dev/vapor-ui/stargazers
[issues-shield]: https://img.shields.io/github/issues/goorm-dev/vapor-ui.svg?style=for-the-badge
[issues-url]: https://github.com/goorm-dev/vapor-ui/issues
[license-shield]: https://img.shields.io/github/license/goorm-dev/vapor-ui.svg?style=for-the-badge
[license-url]: https://github.com/goorm-dev/vapor-ui/blob/main/LICENSE
[beta-shield]: https://img.shields.io/badge/status-beta-orange?style=for-the-badge
[beta-url]: https://github.com/goorm-dev/vapor-ui/releases

<!-- Technology badges -->

[jscodeshift.badge]: https://img.shields.io/badge/jscodeshift-FF6C37?style=for-the-badge&logo=javascript&logoColor=white
[jscodeshift-url]: https://github.com/facebook/jscodeshift
[TypeScript.badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Node.badge]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
