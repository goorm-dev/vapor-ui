# CLAUDE.md

This coding convention applies to files under `packages/core/**`.
It is an English translation and adaptation of [`.gemini/styleguide.md`](../../.gemini/styleguide.md), updated to match the current implementation in `packages/core`.

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
- Delete working branches after the PR is merged.

## 2.2. Commit Messages (Conventional Commits & SemVer)

Follow the [Conventional Commits specification](https://www.conventionalcommits.org/). This supports [SemVer](https://semver.org/) based versioning and automated changelog generation.

**Format:**

```bash
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### 2.2.1. Primary Commit Types & SemVer Guidance

- **Important**: In this repository, package version bumps are decided by **Changesets** in `.changeset/*.md`, not inferred automatically from commit types alone.
- Commit types should communicate change intent clearly.
- When a package release is needed, the changeset level (`patch`, `minor`, `major`) must match the actual impact of the change.

- **`feat`**: Add a new feature, such as a component or prop. This will often pair with a **`minor` changeset** when it introduces new user-facing capability.

  Example:

  ```bash
  feat(Avatar): add new Avatar component
  feat(Button): implement iconPosition prop for icon placement
  ```

- **`fix`**: Fix a bug. This will often pair with a **`patch` changeset** when it corrects behavior without introducing a breaking API change.

  Example:

  ```bash
  fix(Input): correct placeholder color in disabled state
  fix(Modal): resolve issue where modal content is not scrollable
  ```

- **`BREAKING CHANGE`**: Introduce an API-breaking change. Add `!` after the type or specify `BREAKING CHANGE:` in the footer. This should pair with a **`major` changeset**.

  Example:

  ```text
  feat(Button)!: change 'kind' prop to 'variant' for clarity

  BREAKING CHANGE: Button component's `kind` prop has been renamed to `variant`.
  Migrate `kind="primary"` to `variant="solid"`.
  Migrate `kind="secondary"` to `variant="outline"`.
  ```

### 2.2.2. Other Commit Types

- `docs`: Documentation changes.
- `style`: Code style changes without logic changes.
- `refactor`: Refactoring without behavioral changes.
- `test`: Add or update tests.
- `perf`: Performance improvements.
- `chore`: Maintenance work such as build or package configuration.

- These commit types do **not** imply "no release". If the change affects published package behavior or API, add an appropriate changeset even when the commit type is `chore`, `refactor`, or another non-`feat`/`fix` type.

### 2.2.3. Scope (Optional)

- Specify the scope of the change, usually the component name.

### 2.2.4. Subject

- Use present tense and imperative mood.
- Start with a lowercase letter.
- Do not end with a period.
- Keep it within 50 characters when possible.

## 2.3. Pull Request (PR)

- Fill out the PR template thoroughly, including change summary, tests, and related issues.
- Include screenshots for UI changes when relevant.
- Add tests, documentation updates, and changesets when the change requires them.
- Request review from the appropriate maintainers or code owners according to the repository workflow.

# 3. Coding Style

---

## 3.1. Modules (Import & Export)

- **Use absolute paths**: Prefer `tsconfig.json` path aliases such as `~/*` over deep relative imports.

  ```tsx
  import { createContext } from '~/libs/create-context';
  ```

- **Alias primitive dependencies clearly**: Current components are primarily built on **Base UI**, and imports commonly use explicit aliases such as:

  ```tsx
  import { Button as BaseButton } from '@base-ui/react/button';
  import { Dialog as BaseDialog } from '@base-ui/react/dialog';
  ```

- **Prefer named exports** over `default export`.

- **Export prop types following the local module pattern**:
  - Many components expose namespace-scoped types such as `Button.Props`, `DialogRoot.Props`, and `RadioGroupRoot.Props`.
  - Some modules also export direct type names such as `PaginationRootProps`.
  - Preserve the existing public API style of the module instead of forcing a single naming convention across all components.

## 3.2. Naming Conventions

- **`camelCase`**: variables and functions
- **`PascalCase`**: components, interfaces, types, and enums
- **`CONSTANT_CASE`**: constants
- **`kebab-case`**: files and directories

## 3.3. Strings, Whitespace, and Semicolons

- **Strings**: Prefer template literals when they improve readability. Use single quotes for simple strings.
- **Indentation**: 4 spaces.
- **Semicolons**: Always use semicolons at the end of statements.
- Follow the repository Prettier configuration.

## 3.4. Conditional Statements and Function Structure

- **Early Return**: When nesting exceeds 3 levels, use early returns to improve readability.

  ```tsx
  function processUser(user: User) {
      if (!user) return null;
      if (!user.isActive) return null;
      if (!user.permissions.canEdit) return null;

      return editUser(user);
  }
  ```

# 4. TypeScript

---

## 4.1. React Component Props & Types

- **Avoid `React.FC`**: Define components with arrow functions and explicit prop types.

## 4.2. Type vs. Interface

- **`interface`**: Use for component props and object shapes. It supports `extends`.
- **`type`**: Use for unions, intersections, and utility-heavy composite types.

## 4.3. Null & Undefined

- Prefer **`undefined`** for optional values, defaulting behavior, and absent props.
- Use **`null`** where React refs, DOM APIs, observers, animations, and abort signals require it. This is an expected exception in the current codebase.
- Actively use Optional Chaining (`?.`) and Nullish Coalescing (`??`) where they improve clarity.

## 4.4. Array Types

- Use `T[]` syntax.

## 4.5. Enum

- Enum names and members should use `PascalCase`.
- Prefer `as const` objects when they provide clearer values and better tree-shaking.

## 4.6. Constants

- Use `CONSTANT_CASE`.
- Strengthen immutability and type inference with `as const`.

# 5. File & Folder Structure

---

## 5.1. Naming (Files and Directories)

- All files and directories should use `kebab-case`.

## 5.2. Singular vs. Plural

- **Components**: Prefer singular names, for example `Button.tsx`. Plural is acceptable for list-like components, for example `Tabs.tsx`.
- **Utility and hook collections**: Use plural directory names, for example `hooks/`, `utils/`.

## 5.3. Component Folders (Colocation)

Keep related code such as implementation, styles, stories, and tests in the component folder.

### 5.3.1. Subcomponent Strategy

- Compound components expose subcomponents as namespace members such as `Dialog.Root`, `Dialog.Trigger`, and `RadioGroup.Root`.

### 5.3.2. Entry Point Strategy

- **Standalone component entrypoint (`src/components/[component]/index.ts`)**
  - Re-export the implementation directly.
  - Public usage remains standalone, for example `<Button />`, `<TextInput />`.

  ```tsx
  export * from './button';
  ```

- **Compound component entrypoint (`src/components/[component]/index.ts`)**
  - Export a namespace from `index.parts.ts`.

  ```tsx
  export * as Dialog from './index.parts';
  ```

- **Compound component parts file (`src/components/[component]/index.parts.ts`)**
  - Re-export internal implementation symbols as public namespace members such as `Root`, `Trigger`, `Popup`, and `Close`.

  ```tsx
  export {
      DialogRoot as Root,
      DialogTrigger as Trigger,
      DialogPopup as Popup,
  } from './dialog';
  ```

- **Component group entrypoint (`src/components/index.ts`)**
  - This file is not used. If it exists, remove it.

- **Library root entrypoint (`src/index.ts`)**
  - Re-export each component entrypoint.

- **Public API example**:

  ```tsx
  import { Button, Dialog, RadioGroup, TextInput } from '@vapor-ui/core';

  <Button variant="solid">Click me</Button>;

  <TextInput placeholder="Email" />;

  <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Popup>
          <Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup>
  </Dialog.Root>;

  <RadioGroup.Root>
      {/* ... */}
  </RadioGroup.Root>;
  ```

# 6. React Components

---

## 6.1. Accessibility (WAI-ARIA)

- Follow WAI-ARIA patterns.
- Current primitives are primarily built on **Base UI**. Prefer Base UI patterns unless the local module already uses a different integration for a clear reason.

## 6.2. Component API Shapes

- Use **standalone components** for simple components such as `Button` and `TextInput`.
- Use **compound namespaces** for multi-part components such as `Dialog`, `Menu`, `Popover`, `RadioGroup`, and similar overlays or composite controls.

## 6.3. Controlled / Uncontrolled Components

- Default to uncontrolled behavior and support the controlled pattern (`value` / `onChange`) when needed.

## 6.4. Trigger Pattern (Overlay)

- Overlay components should clearly separate `{Component}.Trigger`, popup/content, overlay, and close behavior.

## 6.5. Minimize Props & Typing

- Use `React.ComponentPropsWithoutRef<ElementType>`, `VComponentProps<typeof Primitive>`, or equivalent utility types and define only the component-specific props explicitly.

## 6.6. Icon Handling

- Prefer passing icons through `children` or directly using named icon components.

## 6.7. Ref Forwarding

- Use `React.forwardRef` and support ref forwarding.

## 6.8. Composition APIs

- Follow the composition API that the component already exposes.
- In the current codebase, this primarily means Base UI `render`-based composition and namespace-based compound APIs.
- Do not assume `asChild` is the default or primary composition pattern in `packages/core`.

## 6.9. ARIA Props

- Keep standard ARIA prop names such as `aria-*`.
- Provide abstracted props only for internally managed ARIA behavior.

## 6.10. Developer-only Props

- Developer convenience props should be clearly documented in Storybook or equivalent docs.

## 6.11. Input Components

- Provide separate components for each HTML `<input>` type where that results in a clearer API, for example `TextInput`, `Checkbox`, and `Radio`.

## 6.12. Function Parameters

- When a function has 3 or more parameters, prefer an object parameter.

## 6.13. Props Handling

### 6.13.1. Props Merge

- Merge style, variant, and primitive props explicitly and predictably.

### 6.13.2. Prop Type Definitions

- **Standard HTML element props**:
  - Use `React.ComponentPropsWithoutRef<ElementType>` or
  - `React.ComponentPropsWithRef<ElementType>`.

- **Base UI component props**:
  - Prefer utility types derived from the primitive, for example `VComponentProps<typeof BaseDialog.Trigger>` or `ComponentPropsWithoutRef<typeof BaseDialog.Root>`.
  - This keeps declarations concise and resilient to primitive updates.

  ```tsx
  import type { ComponentPropsWithoutRef } from 'react';
  import { Dialog as BaseDialog } from '@base-ui/react/dialog';

  type DialogPrimitiveProps = Omit<
      ComponentPropsWithoutRef<typeof BaseDialog.Root>,
      'disablePointerDismissal'
  >;

  export namespace DialogRoot {
      export interface Props extends DialogPrimitiveProps {
          closeOnClickOverlay?: boolean;
      }
  }
  ```

### 6.13.3. Avoid `defaultProps`

- Do not use class component `defaultProps` or `Component.defaultProps = { ... }` on function components.
- Use parameter defaults instead.

## 6.14. Compound Components

Use the compound pattern to support flexible UI composition when a component has multiple interactive parts.

### 6.14.1. Export Strategy

- Implement the parts in the main component file, for example `dialog.tsx`.
- Export the public namespace through `index.parts.ts`.
- Re-export the namespace from `index.ts`.
- Do **not** assume `Object.assign` is the standard export mechanism in this repository. The current implementation standard is namespace re-export through `index.parts.ts`.

  ```tsx
  // dialog/index.ts
  export * as Dialog from './index.parts';
  ```

  ```tsx
  // dialog/index.parts.ts
  export {
      DialogRoot as Root,
      DialogTrigger as Trigger,
      DialogPortalPrimitive as PortalPrimitive,
      DialogOverlayPrimitive as OverlayPrimitive,
      DialogPopup as Popup,
      DialogClose as Close,
  } from './dialog';
  ```

### 6.14.2. Type Grouping

- Multiple prop types for compound components can be grouped and managed together.
- In practice, the current codebase often exposes namespace-scoped prop types alongside each part, for example `DialogRoot.Props` and `DialogTrigger.Props`.
- If a module already uses a direct exported type name, preserve that module's existing API.

# 7. Styling (Vanilla Extract)

---

## 7.1. `style` Function (Basic)

- Define static style rules.

## 7.2. `recipe` Function (Variants)

- Define styles for component states and variants using `base`, `variants`, `defaultVariants`, and `compoundVariants`.

### 7.2.1. Variant Type Declarations

- Multiple variant types created with Vanilla Extract `recipe` may be merged into a single type when necessary.
- Prefer the simplest typing approach that remains maintainable.

## 7.3. CSS Variables

- Define design tokens such as colors and fonts as CSS variables and reference them through the `vars` object.
- Avoid hard-coded values.

## 7.4. Responsive Design

- Use `@media` inside `style` and `recipe`.
- Prefer a mobile-first approach.
- Consider using Vanilla Extract `sprinkles` when it fits the local module.

## 7.5. Class Name Management (`clsx`)

- Use `clsx` for dynamic class name composition.

# 8. Testing

---

- Use **Vitest** for unit and component tests.
- Use **`@testing-library/react`** and **`@testing-library/user-event`** for rendering and interactions.
- Add **`vitest-axe`** accessibility checks for public components when feasible.
- Cover keyboard, pointer, focus, open/close, and controlled/uncontrolled behavior where applicable.
- Use fake timers for delay-driven behavior such as tooltip or hover timing.
- Keep tests colocated with the component they cover.

# 9. Documentation

---

## 9.1. Storybook

- `Docs`: generated automatically with Storybook `autodocs`
- `Test Bed`: used for visual regression testing

## 9.2. Vapor Docs (`apps/website`)

- `use case`: combinations of subcomponents or listings of specific variants
- Do not use emojis in titles.
- When displaying a single string value, omit surrounding single quotes.
- When displaying union types, separate values with spaces using inline code.
