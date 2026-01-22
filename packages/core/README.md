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

<h3 align="center">vapor-ui</h3>

  <p align="center">
    An open-source component library for building high-quality, accessible web applications. Features easy customization and AI-friendly components.
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
      <a href="#about-the-project">Vapor UI</a>
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
    <li><a href="#support">Support</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- Vapor UI -->

## Vapor UI

Vapor UI is a modern, accessible React component library designed to help developers build high-quality web applications quickly. With 34+ components built on top of Base UI primitives and styled with Vanilla Extract, Vapor UI provides a flexible foundation that's easy to customize and integrate into your projects.

Key features:

- **Accessible by Default**: Built on Base UI components with ARIA compliance
- **Fully Typed**: Written in TypeScript with comprehensive type definitions
- **Customizable**: Easy theming and styling with Vanilla Extract CSS-in-JS
- **AI-Friendly**: Components designed for easy integration with AI-assisted development
- **Modern Stack**: React 17+, 18+, and 19+ support

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![React][React.js]][React-url]
- [![TypeScript][TypeScript.badge]][TypeScript-url]
- [![Vanilla Extract][VanillaExtract.badge]][VanillaExtract-url]
- [![Base UI][BaseUI.badge]][BaseUI-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Getting started with Vapor UI is quick and easy. Follow these steps to add it to your React project.

### Prerequisites

- Node.js >= 20.19
- React ^17.0.0 || ^18.0.0 || ^19.0.0
- A package manager (npm, pnpm, or yarn)

### Installation

Install the core package along with icons and hooks:

```sh
npm i @vapor-ui/core @vapor-ui/icons @vapor-ui/hooks
```

Or using pnpm:

```sh
pnpm add @vapor-ui/core @vapor-ui/icons @vapor-ui/hooks
```

Or using yarn:

```sh
yarn add @vapor-ui/core @vapor-ui/icons @vapor-ui/hooks
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

Here's a quick example of how to use Vapor UI components in your React application:

```jsx
import { Box, Button, Flex } from '@vapor-ui/core';

function App() {
    return (
        <Box padding="4">
            <Flex direction="column" gap="2">
                <Button variant="fill" colorPalette="primary">
                    Primary Button
                </Button>
                <Button variant="outline" colorPalette="secondary">
                    Secondary Button
                </Button>
            </Flex>
        </Box>
    );
}
```

### More Examples

**Using with TypeScript:**

```tsx
import { Button, type ButtonProps } from '@vapor-ui/core';

interface CustomButtonProps extends ButtonProps {
  label: string;
}

function CustomButton({ label, ...props }: CustomButtonProps) {
  return <Button {...props}>{label}</Button>;
}
```

**Theming:**

```tsx
import { Box } from '@vapor-ui/core';

function ThemedComponent() {
  return (
    <Box
      padding="4"
      backgroundColor="primary"
      color="white"
      borderRadius="md"
    >
      Themed Box
    </Box>
  );
}
```

_For comprehensive documentation, examples, and API references, please visit the [Documentation](https://vapor-ui.goorm.io)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORT -->

## Support

If you need help with Vapor UI, here are some resources:

### Documentation
- [Official Documentation](https://vapor-ui.goorm.io) - Comprehensive guides and API references
- [Component Examples](https://vapor-ui.goorm.io/components) - Interactive component demos

### Getting Help
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/goorm-dev/vapor-ui/issues)
- **Discord**: Join our community for real-time discussions at [Discord](https://discord.gg/PMqxs3xaHC)
- **Email**: Contact the Vapor team at vapor.ui@goorm.io

### Common Questions
- **Installation issues?** Check our [Getting Started guide](https://vapor-ui.goorm.io/getting-started)
- **Component not working?** Review the [component documentation](https://vapor-ui.goorm.io/components)
- **Styling questions?** See our [Theming guide](https://vapor-ui.goorm.io/theming)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] First stable v1.0.0 release
- [ ] Additional component variants
- [ ] Enhanced theming capabilities
- [ ] Improved accessibility features

See the [open issues](https://github.com/goorm-dev/vapor-ui/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for detailed guidelines on:
- Setting up your development environment
- Making changes and testing
- Code quality standards
- Pull request process

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

Special thanks to the open-source projects that make Vapor UI possible:

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Base UI](https://base-ui.com/) - Unstyled React components and hooks
- [Vanilla Extract](https://vanilla-extract.style/) - Zero-runtime CSS-in-JS
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types

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

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript.badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[VanillaExtract.badge]: https://img.shields.io/badge/Vanilla%20Extract-DB7093?style=for-the-badge&logo=css3&logoColor=white
[VanillaExtract-url]: https://vanilla-extract.style/
[BaseUI.badge]: https://img.shields.io/badge/Base%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white
[BaseUI-url]: https://base-ui.com/
