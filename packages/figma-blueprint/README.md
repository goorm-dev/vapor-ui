<p>
  <a href="https://www.npmjs.com/package/@vapor-ui/figma-blueprint">
    <img src="https://img.shields.io/npm/v/@vapor-ui/figma-blueprint.svg" alt="npm version">
  </a>
</p>

# @vapor-ui/figma-blueprint

Builds the vapor-ui element tree a Figma design requires, through Code Connect templates. The `check-components` and `visual-score` skills of the [vapor-ui Claude plugin](https://github.com/goorm-dev/vapor-ui/tree/main/plugins/vapor-ui) run this CLI to grade code against a design.

## Installation

Install it as a dev dependency in the folder where `@vapor-ui/core`, `@vapor-ui/composites`, and `@vapor-ui/icons` are installed. It reads the templates those packages ship, so it needs versions that include a `figma-blueprint/` folder. The plugin README lists the [minimum versions](https://github.com/goorm-dev/vapor-ui/blob/main/plugins/vapor-ui/README.md#필요한-환경). It needs Node.js 22.18 or later.

```sh
# pnpm
pnpm add -D @vapor-ui/figma-blueprint

# npm
npm install -D @vapor-ui/figma-blueprint

# yarn
yarn add -D @vapor-ui/figma-blueprint
```

## Usage

```sh
npx figma-blueprint "https://www.figma.com/design/<file>/<name>?node-id=<id>" --json
npx figma-blueprint tree.json
```

A Figma URL needs `FIGMA_ACCESS_TOKEN`, read from the environment or from a `.env` file in the current directory. A saved tree needs no token. Save one node entry from the response of the Figma REST API `GET /v1/files/:key/nodes`.

The command exits with one of three codes:

- `0`: every library instance in the design was read.
- `2`: the tree is printed, but some instances could not be read (`unscorable`), so the design cannot be fully graded.
- `1`: the design or a template could not be read. The error goes to stderr.

Run `npx figma-blueprint` with no arguments to print the full usage. There is no `--help` flag.

[RFC-0002, Output and exit codes](https://github.com/goorm-dev/vapor-ui/blob/main/docs/rfcs/0002-figma-blueprint.md#출력과-종료-코드) describes the `--json` format. The `ship`, `entries`, and `library` commands and the `--repo` flag are for the vapor-ui repository itself. [RFC-0002, Package layout](https://github.com/goorm-dev/vapor-ui/blob/main/docs/rfcs/0002-figma-blueprint.md#패키지-구성) describes them.

## License

MIT License © 2025 goorm, Inc
