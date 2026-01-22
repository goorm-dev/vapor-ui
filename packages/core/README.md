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
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

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

_For comprehensive documentation, examples, and API references, please visit the [Documentation](https://vapor-ui.goorm.io)_

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

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/goorm-dev/vapor-ui/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=goorm-dev/vapor-ui" alt="contrib.rocks image" />
</a>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Vapor Team - vapor.ui@goorm.io

Project Link: [https://github.com/goorm-dev/vapor-ui](https://github.com/goorm-dev/vapor-ui)

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

<!-- Technology badges -->

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript.badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[VanillaExtract.badge]: https://img.shields.io/badge/Vanilla%20Extract-DB7093?style=for-the-badge&logo=css3&logoColor=white
[VanillaExtract-url]: https://vanilla-extract.style/
[BaseUI.badge]: https://img.shields.io/badge/Base%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white
[BaseUI-url]: https://base-ui.com/
