# @vapor-ui/codemod

Automated code migration tools for Vapor UI using jscodeshift.
This package helps you upgrade your codebase when Vapor UI components have breaking changes.

> **Note:**
>
> As there is no official major version of Vapor UI yet, this package currently only provides the codemods that were used internally for component migration.
>
> Codemods to assist with migration **will be added in the future if breaking changes occur** in subsequent Vapor UI versions.

## Usage

```bash
npx @vapor-ui/codemod <transform> <path> [...options]
```

### Options

- `--force` Bypass Git safety checks and forcibly run codemods
- `--parser` Specify the parser to be used. One of: babel | babylon | flow | ts | tsx.
  Default is tsx.
- `--extensions` Comma-separated list of file extensions to transform.
  Default is tsx,ts,jsx,js
  `--dry` (Advanced) Dry run. Changes are not written to files.
- `--jscodeshift` (Advanced) Pass options directly to jscodeshift.
  [See more options](https://jscodeshift.com/run/cli)

## Available Transforms

| You can run the command without specifying a transform to be prompted with an interactive list. This allows you to see all available options and choose the one you need.

### For internal

#### `internal/icons/migrate-icons-import`

Converts `@goorm-dev/vapor-icons` import to `@vapor-ui/icons` import.

```sh
npx @vapor-ui/codemod internal/icons/migrate-icons-import src
```
