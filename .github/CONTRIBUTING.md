# Contributing to Vapor UI

[한국어](CONTRIBUTING.ko.md)

Thanks for your interest in contributing to Vapor UI! Your contributions help make our design system better.

## Code of Conduct

We've adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as our Code of Conduct. Please read [the full text](./CODE_OF_CONDUCT.md) to understand what actions will and will not be tolerated.

## Design Principles

- **User Experience First**: Every component should prioritize the best possible user experience
- **Accessibility by Default**: Every component should be accessible and follow WCAG guidelines
- **Composable & Flexible**: Components should be easily composable and customizable
- **Consistent API**: Components should follow similar patterns for predictable usage

## Questions

If you have questions about Vapor UI, check out our [documentation](https://vapor-ui.dev) where we have examples and detailed API references. You can also:

- Open a [GitHub Discussion](https://github.com/goorm-dev/vapor-ui/discussions) for general questions
- Join our [Discord community](https://discord.gg/PMqxs3xaHC) for real-time discussions

## How to Contribute

There are many ways to contribute to Vapor UI:

- **Bug Reports**: If you find something wrong, please don't hesitate to open an [Issue](https://github.com/goorm-dev/vapor-ui/issues).
- **Feature Requests**: If you have a new idea, suggest it through an [Issue](https://github.com/goorm-dev/vapor-ui/issues).
- **Documentation**: We welcome all contributions, such as fixing typos, improving unclear sections, or adding new examples.
- **Code Contributions**: We appreciate fixing bugs in existing components or improving test code as core contributions to the project.

## Preparing a Pull Request

Before working on a large change, please open an issue first to discuss it with maintainers. A good PR is small, focused, and clearly communicates the problem it solves.

1. Fork and clone the repository:

```bash
git clone https://github.com/<YOUR_USERNAME>/vapor-ui.git
cd vapor-ui
git remote add upstream https://github.com/goorm-dev/vapor-ui.git
```

2. Ensure your Node version matches the [.nvmrc](../.nvmrc):

```bash
node -v
```

3. Install dependencies:

```bash
pnpm install
```

4. Start the development server:

```bash
pnpm storybook
```

Now you can view components at `http://localhost:9009`.

## Development Setup

1. Create a new branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b fix/button-loading-state
```

2. Make your changes and test them in Storybook

3. Write tests for your changes and Run the test suite:

```bash
pnpm test
```

5. Add a changeset if your changes affect users:

```bash
pnpm changeset
```

6. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "fix(Button): correct loading state styling"
```

7. Push and create a Pull Request
