# CLAUDE.md

This coding convention applies to files under `apps/website/**`.
It is an English translation and adaptation of [`.gemini/styleguide.md`](../../.gemini/styleguide.md), updated to match the current website code and the public API exposed by `@vapor-ui/core`.

# 0. Review Response Style

- Provide code review responses in Korean.
- If repository-level AI tooling is configured to use a different review language, follow that tool configuration for the final output language.

# 1. Development Environment

---

- **Package Manager**: PNPM v10.5.1+
- **Node.js**: v20.19+
- **Linting & Formatting**: Use ESLint v9+ and Prettier v3.3+. IDE integration and Git Hook setup are recommended.

# 2. Git & Version Control

---

## 2.1. Branch Strategy

- Use semantic branch names that clearly describe the purpose of the change.
- Prefer branch names that map directly to the work being done, for example `add-coderabbit-settings`, `fix-dialog-focus`, or `docs-update-radio-group`.
- Do not assume Git Flow prefixes such as `feature/*`, `release/*`, or `hotfix/*` are required unless the repository workflow explicitly calls for them.

## 2.2. Commit Messages (Conventional Commits & SemVer)

- Follow Conventional Commits.
- Keep scopes and subjects clear and consistent with the component, page, or document being changed.
- If a change also affects a published package, remember that the actual package version bump is determined by Changesets, not by the commit type alone.

## 2.3. Pull Request (PR)

- Fill out the PR template thoroughly.
- Include screenshots for UI changes when relevant.
- Keep documentation updates aligned with component and content changes.

# 3. Coding Style

---

## 3.1. Modules (Import & Export)

- Prefer path aliases over deep relative imports when aliases are available.
- Prefer named exports over `default export` unless the framework or local file pattern clearly requires otherwise.
- When writing docs examples for Vapor UI components, use the **current public API** from `@vapor-ui/core`.

  ```tsx
  import { Button, Dialog, RadioGroup, TextInput } from '@vapor-ui/core';

  <Button>Click me</Button>;
  <TextInput placeholder="Email" />;

  <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Popup />
  </Dialog.Root>;

  <RadioGroup.Root>{/* ... */}</RadioGroup.Root>;
  ```

- Do not document outdated APIs such as `Button.Root` for standalone components.

## 3.2. Naming Conventions

- **`camelCase`**: variables and functions
- **`PascalCase`**: components, interfaces, types, and enums
- **`CONSTANT_CASE`**: constants
- **`kebab-case`**: files and directories where the framework and routing rules allow it

## 3.3. Strings, Whitespace, and Semicolons

- Prefer single quotes for simple strings.
- Use template literals when they improve readability.
- Use 4-space indentation unless the local file already follows a different formatter-controlled convention.
- Keep semicolons.

## 3.4. Conditional Statements and Function Structure

- Use early returns to reduce deep nesting.

# 4. TypeScript

---

## 4.1. React Component Props & Types

- Avoid `React.FC`.
- Use explicit prop types.

## 4.2. Type vs. Interface

- Prefer `interface` for props and object shapes.
- Prefer `type` for unions, intersections, and utility-heavy aliases.

## 4.3. Null & Undefined

- Prefer `undefined` for optional values.
- Use `null` when browser APIs, refs, or third-party APIs require it.

# 5. File & Folder Structure

---

## 5.1. Naming (Files and Directories)

- Use `kebab-case` for files and directories where the framework and route conventions allow it.

## 5.2. Colocation

- Keep related page logic, UI, and content helpers close to the route or feature they belong to.

# 6. React Components and UI Usage

---

## 6.1. Accessibility (WAI-ARIA)

- Follow WAI-ARIA patterns.
- Flag accessibility regressions in navigation, dialogs, menus, forms, and interactive content.

## 6.2. Public API Accuracy

- Documentation and usage examples must reflect the current public API from `packages/core`.
- Standalone components remain standalone, for example `Button`, `TextInput`, and `IconButton`.
- Compound components remain namespace-based, for example `Dialog.Root`, `Dialog.Trigger`, and `RadioGroup.Root`.

## 6.3. Composition Patterns

- When consuming `@vapor-ui/core`, follow the composition API the component exposes.
- In the current codebase, this primarily means compound namespaces and `render`-based composition for Vapor UI components.
- Use `asChild` only when the specific component or external library explicitly supports it.

## 6.4. UI Consistency

- Prefer using Vapor UI public components in docs and product surfaces when they represent the intended design system usage.
- If the website uses a third-party primitive for app-specific behavior, keep that choice intentional and do not let it drift into Vapor UI documentation examples.

# 7. Styling

---

- Keep styling readable and consistent with the existing website structure.
- Prefer reusable patterns over one-off styling that obscures the example or documentation intent.

# 8. Testing

---

- When tests are added for website UI, prioritize rendering behavior, interaction flows, and accessibility expectations that matter to end users.
- Keep any website-specific tests aligned with the actual documented behavior of `@vapor-ui/core` examples and website-only UI features.

# 9. Documentation

---

## 9.1. Storybook and Docs Alignment

- Keep website documentation aligned with Storybook and the actual `@vapor-ui/core` API.
- If a component API changes, update website examples and explanatory content in the same change when possible.

## 9.2. Vapor Docs Content Rules

- Use the website for use-case documentation, subcomponent composition examples, and variant showcases.
- Do not use emojis in titles.
- When displaying a single string value, omit surrounding single quotes.
  Example: `string`
- When displaying union types, separate values with spaces using inline code.
  Example: `small` `medium` `large`
