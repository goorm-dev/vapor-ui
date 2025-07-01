# Thanks for contributing to Vapor UI!

Hello! Thank you for your interest in contributing to the Vapor UI open-source design system project. Your contributions are invaluable in making our project richer and more robust.

This document guides you through setting up your development environment, our branching strategy, coding style, Pull Request process, and more. Please read this guide carefully before you start contributing.

## How Can I Contribute?

There are many ways to contribute to Vapor UI:

- **Bug Reports:** If you find something wrong, please don't hesitate to open an [Issue](https://github.com/goorm-dev/vapor-ui/issues).
- **Feature Requests:** Have a new idea? Suggest it through an [Issue](https://github.com/goorm-dev/vapor-ui/issues).
- **Documentation:** We welcome all contributions, such as fixing typos, improving unclear sections, or adding new examples.
- **Code Contributions:** Fixing bugs in existing components or improving test code are core contributions to the project.

## Getting Started

### 1. Development Environment

Our project uses the following development environment:

- **Package Manager**: `pnpm` v10+
- **Node.js**: v20+
- **Linting & Formatting**: ESLint, Prettier

First, fork and clone the project, then install the dependencies and run the development server with the commands below:

```bash
# Clone the project
git clone [https://github.com/](https://github.com/)<YOUR_USERNAME>/vapor-ui.git
cd vapor-ui

# Install dependencies with PNPM
pnpm install

# Run the Storybook development server
pnpm storybook
```

Now you can start developing components by viewing the Storybook at `http://localhost:9009`.

## Git & Version Management

We follow clear rules to keep the project's commit history clean and to automate version management.

### 1. Branching Strategy (GitHub Flow)

We follow the **GitHub Flow** strategy. The goal is to always keep the `main` branch in a deployable state.

- **`main` Branch:** This is the core branch of the project. All changes are ultimately merged into the `main` branch.
- **Workflow:**
    1.  Create a new branch from `main` for new features or bug fixes. The branch name should clearly describe the work being done.
    2.  Complete your work and make commits on the new branch.
    3.  When the work is done, open a Pull Request (PR) targeting the `main` branch.
    4.  Once the PR passes code reviews and CI tests, it is merged into the `main` branch.
    5.  After the merge, delete the feature branch.

```bash
# Update the main branch to the latest version
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b create-button-loading-state
```

### 2. Commit Messages (Conventional Commits)

All commits must follow the **Conventional Commits specification**. This is essential for automating SemVer-based versioning and change tracking.

**Commit Format:**
`<type>(<scope>): <subject>`

- **Main Types and Their Effect on Versioning**:

    - `feat`: Used for adding a new feature. **(Results in a MINOR version bump)**
        - `feat(Avatar): add new Avatar component`
    - `fix`: Used for bug fixes. **(Results in a PATCH version bump)**
        - `fix(Input): correct placeholder color in disabled state`
    - `feat!`, `fix!`, or adding `BREAKING CHANGE:` in the footer: Used for significant changes that are not backward-compatible. **(Results in a MAJOR version bump)**
        - `feat(Button)!: change 'kind' prop to 'variant' for clarity`

- **Other Types**:

    - `docs`, `style`, `refactor`, `test`, `perf`, `chore`, etc. These types generally do not affect the version number.

- **Scope**: Specifies the part of the codebase affected, written in lowercase (e.g., `modal`, `hooks`).
- **Subject**: A concise description of the change in the present tense, imperative mood, under 50 characters. (e.g., `add support for dark mode`)

## Managing Changes with Changesets

If your changes affect users (e.g., adding a feature, fixing a bug), you **must add a changeset.** Along with commit messages, changesets are used for version management and release note generation.

```bash
pnpm changeset
```

Run the command above and follow the prompts to specify which packages have changed, the version level (Major, Minor, Patch), and a detailed description of the changes in Markdown format.

## Coding Style and Conventions

We follow the style guide defined in `.gemini/styleguide.md`. When you create a Pull Request, **Gemini Code Assist** will automatically review your code based on this style guide, so please familiarize yourself with it before contributing.

Key conventions include:

### 1. File and Folder Structure

- **Naming**: All files and directories use `kebab-case` (e.g., `text-input.tsx`).
- **Component Structure (Colocation)**: All related files for a component—implementation (`*.tsx`), styles (`*.css.ts`), stories (`*.stories.tsx`), and tests (`*.test.tsx`)—are located within the same component folder.
    ```bash
    src/components/text-input/
    ├── index.ts
    ├── text-input.tsx
    ├── text-input.css.ts
    ├── text-input.stories.tsx
    └── text-input.test.tsx
    ```
- **Entry Point (`index.ts`)**: Clearly defines and exports the public API (components, types, etc.) of a component. We use a strategy of exporting namespaces and types separately.

### 2. TypeScript & React

- **Avoid `React.FC`**: Define components using arrow functions with explicit prop types.
- **Type vs. Interface**: Use `interface` for extensible object structures like component props, and `type` for complex types like unions/intersections.
- **Use `as const`**: We recommend using `as const` for constants instead of `enum` to benefit from tree-shaking and clearer type inference.
- **Prop Types**: Inherit standard HTML attributes using `React.ComponentPropsWithoutRef` and define only the component-specific props to minimize redundancy.
- **Compound Components**: Use `Object.assign` to export sub-components on the main component, allowing for an intuitive API like `Dialog.Trigger`.

### 3. Styling (Vanilla Extract)

- **`recipe` function**: Use this to define styles for different states of a component, such as `variant` or `size`.
- **CSS Variables**: All design tokens (colors, spacing, font sizes, etc.) must be used via predefined CSS variables (`vars`). Avoid hardcoding values.
- **`classnames`**: Use the `classnames` library for conditionally combining class names.

## Testing and Documentation

- **Testing**: All new features and fixes must be accompanied by tests. Test files are located within the respective component folder.
- **Documentation (Storybook)**: Visual tests and usage documentation for components are managed through Storybook.
    - When adding a new component or feature, you must write stories that cover its various `variants` and `use cases`.

## Pull Request (PR) Process

1.  After completing your work on a `feature` branch, create a PR targeting the `main` branch.
2.  Fill out all sections of the PR template, including a description of changes, testing details, and any related issues.
3.  When you open a PR, **[Gemini Code Assist](https://github.com/apps/gemini-code-assist)** will automatically review your code for compliance with our style guide. Please address all requested changes.
4.  You must receive an **`approve`** from at least two code reviewers.
5.  Once all conditions are met, the PR will be merged into `main` using the **Squash and merge** method.

## Release Process

Vapor UI uses **`changesets`** and **GitHub Actions** to automate the release process.

1.  A PR with a changeset file is merged into the `main` branch.
2.  A push to the `main` branch triggers the `.github/workflows/release.yml` workflow.
3.  The `changesets/action` detects changes and automatically creates a **Release Pull Request** that bumps the versions of the relevant packages and updates their `CHANGELOG.md` files.
4.  Once this **Release Pull Request** is merged into `main`, the workflow executes the `pnpm run release` script to build the changed packages, publish the new versions to NPM, and create a GitHub Release.

## Community

If you have questions or want to connect with other contributors, please join our Discord channel!

- **[Join the Vapor UI Discord Channel](https://discord.gg/PMqxs3xaHC)**

---

Thank you again for contributing to Vapor UI. Your participation helps make our community healthier and more vibrant. If you have any questions, feel free to ask them in an Issue.
