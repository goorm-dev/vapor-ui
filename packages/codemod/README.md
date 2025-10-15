# @vapor-ui/codemod

Automated code migration tools for Vapor UI using jscodeshift. This package helps you upgrade your codebase when Vapor UI components have breaking changes.

## Usage

```bash
npx @vapor-ui/codemod <transform-name> <path>
```

### Options

- `--dry` - Dry run (no changes, print only)
- `--parser <parser>` - Parser to use (default: tsx)
- `--extensions <ext>` - File extensions to transform (default: js,jsx,ts,tsx)

### Examples

```bash
# Transform all files in src/ directory
npx @vapor-ui/codemod update-callout src/

# Dry run to preview changes
npx @vapor-ui/codemod update-callout src/ --dry

# Transform specific file types
npx @vapor-ui/codemod update-callout src/ --extensions tsx,ts
```

## Available Transforms

### update-callout

Migrates `Alert` component to `Callout` component.

```bash
npx @vapor-ui/codemod update-callout path
```