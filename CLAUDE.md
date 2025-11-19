# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vapor UI is a monorepo React component library built with TypeScript, focused on accessibility and developer experience. It uses pnpm workspace management with Turborepo for efficient builds and development.

## Development Commands

### Essential Commands
- `pnpm install` - Install all dependencies
- `pnpm dev` - Start development mode for all apps
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run all test suites
- `pnpm lint` - Run ESLint across all packages
- `pnpm typecheck` - Type-check all TypeScript code

### Package-Specific Commands
- `pnpm core <command>` - Run commands in @vapor-ui/core
- `pnpm icons <command>` - Run commands in @vapor-ui/icons
- `pnpm hooks <command>` - Run commands in @vapor-ui/hooks
- `pnpm sb <command>` - Run commands in Storybook
- `pnpm website <command>` - Run commands in documentation website

### Testing & Quality
- `pnpm test:regressions` - Run visual regression tests (requires Storybook build)
- `pnpm test:update-snapshots` - Update visual test snapshots
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Release Process
- `pnpm changeset` - Add a changeset for versioning
- `pnpm version` - Version packages based on changesets
- `pnpm release` - Build and publish packages

## Architecture & Key Patterns

### Monorepo Structure
The project follows a clear separation between reusable packages (`packages/`) and applications (`apps/`):

**Core Packages:**
- `@vapor-ui/core` - Main component library with design tokens
- `@vapor-ui/icons` - SVG icon components
- `@vapor-ui/hooks` - Reusable React hooks
- `@vapor-ui/color-generator` & `@vapor-ui/css-generator` - Build-time utilities

**Applications:**
- `website` - Next.js documentation site
- `storybook` - Component development and testing
- `figma-plugin` & `figma-codegen-plugin` - Design tool integrations

### Build System Architecture
- **Turborepo** manages task execution with proper dependency graphs
- **TypeScript** provides type safety across all packages
- **Vanilla Extract** powers the CSS-in-JS styling system
- **pnpm** handles workspace dependencies and linking

### Component Design Patterns
- Components use a **compound component pattern** for composition
- **Sprinkles API** enables flexible styling through props
- **Design tokens** provide consistent spacing, colors, and typography
- **Accessibility-first** approach with ARIA support built-in

### Testing Strategy
- **Vitest** for unit and integration tests
- **Playwright** for visual regression testing
- **Storybook** serves as both documentation and test environment
- Tests are colocated with components in `__tests__` directories

## Key Dependencies & Requirements

### Runtime Requirements
- Node.js 20.19+ (see `.nvmrc`)
- pnpm 10.5.1 (defined in `package.json`)

### Development Workflow
- **Husky** manages git hooks for code quality
- **Changesets** handles semantic versioning
- **Conventional Commits** for consistent commit messages
- **ESLint + Prettier** for code quality and formatting

### Figma Integration
The project includes specialized tooling for design-to-code workflows:
- Figma plugins for component generation
- Design token synchronization
- Variable caching for performance (see `PRD.md` and `TASKS.md`)

## Important Notes

### Task Management
Always consult and update `TASKS.md` when working on the figma-codegen-plugin implementation. The file contains a comprehensive breakdown of the PRD requirements into actionable development tasks organized by priority phases.

### Design System Philosophy
Vapor UI follows the principle of "Props = Variants" where Figma component variants map directly to React component props, enabling semantic code generation from design files.

### Performance Considerations
- The Figma integration requires careful variable caching to avoid timeout issues
- Build times are optimized through Turborepo's incremental builds
- Package interdependencies are managed through the turbo.json configuration