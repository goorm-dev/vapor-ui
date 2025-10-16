# @vapor-ui/codemod

Automated code migration tools for Vapor UI using jscodeshift. This package helps you upgrade your codebase when Vapor UI components have breaking changes.

## Usage

```bash
npx @vapor-ui/codemod <transform-name> <path> [...options]
```

### Options

-   `--force` Bypass Git safety checks and forcibly run codemods
-   `--parser` Specify the parser to be used. One of: tsx, babel
-   `--dry` (Advanced) Dry run. Changes are not written to files.
-   `--jscodeshift` (Advanced) Pass options directly to jscodeshift.
    [See more options](https://jscodeshift.com/run/cli)

### Examples

```bash
# Transform all files in src/ directory
npx @vapor-ui/codemod update-callout src/

# Dry run to preview changes
npx @vapor-ui/codemod update-callout src/ --dry

# Transform specific file types
npx @vapor-ui/codemod update-callout src/ --extensions tsx,ts

# Pass options directly to jscodeshift (e.g., for verbose output)
npx @vapor-ui/codemod update-callout src/ --jscodeshift="--verbose=2"
```

## Available Transforms

| You can run the command without specifying a transform to be prompted with an interactive list. This allows you to see all available options and choose the one you need.

### For internal

Converts `@goorm-dev/vapor-icons` to `@vapor-ui/icons` component.

```bash
npx @vapor-ui/codemod internal/icons/migrate-icons-import path
```
