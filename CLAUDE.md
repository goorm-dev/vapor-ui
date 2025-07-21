# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vapor UI is an open-source React component library built by Goorm for creating accessible, high-quality web applications. It's a monorepo using pnpm workspaces and Turborepo for efficient development.

## Architecture

### Monorepo Structure
- **packages/core**: Main UI component library with React components using Vanilla Extract for styling
- **packages/icons**: SVG icon components library
- **packages/hooks**: Collection of reusable React hooks
- **packages/eslint-config**: Shared ESLint configuration
- **packages/typescript-config**: Shared TypeScript configuration
- **apps/website**: Next.js documentation site with Fumadocs

### Technology Stack
- **Build System**: Turborepo + pnpm workspaces
- **Styling**: Vanilla Extract CSS-in-JS with Sprinkles utility system
- **UI Foundation**: Radix UI primitives for accessibility
- **Testing**: Vitest for unit tests, Playwright for visual testing
- **Documentation**: Fumadocs (Next.js based)

## Essential Commands

### Development
```bash
# Start development servers (website + core packages)
pnpm dev

# Run website in development mode
pnpm website dev

# Build all packages
pnpm build

# Build specific package
pnpm core build
pnpm icons build
pnpm hooks build
```

### Quality Assurance
```bash
# Run linting across all packages
pnpm lint

# Format code
pnpm format

# Check formatting without modifying
pnpm format:check

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Run visual tests (core package)
pnpm core test:visual
```

### Package Management
```bash
# Work with specific packages
pnpm core [command]    # @vapor-ui/core
pnpm icons [command]   # @vapor-ui/icons
pnpm hooks [command]   # @vapor-ui/hooks
pnpm website [command] # documentation site
```

## Development Guidelines

### Component Development
- Components are located in `packages/core/src/components/`
- Each component has its own folder with: `index.ts`, `[component].tsx`, `[component].css.ts`, `[component].stories.tsx`, `[component].test.tsx`
- Use Vanilla Extract for styling with the established token system
- Build on Radix UI primitives when possible for accessibility
- Follow existing patterns for component structure and exports

### Styling System
- Use Vanilla Extract CSS-in-JS (`*.css.ts` files)
- Leverage the Sprinkles utility system in `packages/core/src/styles/sprinkles.css.ts`
- Design tokens are in `packages/core/src/styles/tokens/`
- Theme system supports both light and dark themes via CSS custom properties

### Testing
- Unit tests use Vitest with Testing Library
- Visual regression tests use Playwright (screenshots in `__tests__/screenshots/`)
- All components should have comprehensive test coverage

### Icon System
- Icons are in `packages/icons/src/components/`
- Two variants: filled icons and outline icons
- SVG components are auto-generated from design assets

## Local Development Setup

1. Ensure Node.js >=20.x is installed
2. Install pnpm globally: `npm install -g pnpm`
3. Install dependencies: `pnpm install`
4. Start development: `pnpm dev`

## Publishing & Releases
- Uses Changesets for version management and publishing
- Run `pnpm release` to build and publish packages
- Version bumping: `pnpm version`

## Notes
- Project is currently pre-release (status: WIP) with first stable release planned for v0.2.0
- Uses MIT license
- Maintained by Vapor Team at Goorm (vapor.ui@goorm.io)