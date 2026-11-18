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

A Figma URL needs `FIGMA_ACCESS_TOKEN`, read from the environment or from a `.env` file in the current directory. A saved tree needs no token. Save one node entry from the response of the Figma REST API `GET /v1/files/:key/nodes`. The scope `file_content:read` is enough to run the CLI on a design. The scope `current_user:read` only matters for the [usage record](#telemetry).

The command exits with one of three codes:

- `0`: every library instance in the design was read.
- `2`: the tree is printed, but some instances could not be read (`unscorable`), so the design cannot be fully graded.
- `1`: the design or a template could not be read. The error goes to stderr.

Run `npx figma-blueprint` with no arguments to print the full usage. There is no `--help` flag.

[RFC-0002, Output and exit codes](https://github.com/goorm-dev/vapor-ui/blob/main/docs/rfcs/0002-figma-blueprint.md#출력과-종료-코드) describes the `--json` format. The `ship`, `entries`, and `library` commands and the `--repo` flag are for the vapor-ui repository itself. [RFC-0002, Package layout](https://github.com/goorm-dev/vapor-ui/blob/main/docs/rfcs/0002-figma-blueprint.md#패키지-구성) describes them.

## Telemetry

When a `@goorm.io` Figma account runs `figma-blueprint <figma URL>` without `--repo`, the CLI sends one usage record to `https://vapor-ui.goorm.io/api/figma-blueprint/usage` after the run. goorm uses the records to see which designs people run the CLI on and how the runs end. Accounts on any other domain send nothing.

### What is sent

| Field     | Value                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fileKey` | The file key from the URL. For a branch URL, the branch key.                                                                                                                              |
| `nodeId`  | The `node-id` from the URL, written as `1:2`. An empty string when the URL has no `node-id`.                                                                                              |
| `version` | The installed version of `@vapor-ui/figma-blueprint`.                                                                                                                                     |
| `outcome` | `ok` when the CLI exits with 0, `unscorable` when it exits with 2, `error` when it exits with 1.                                                                                          |
| `stage`   | Only when `outcome` is `error`. Where the run failed: `catalog` (loading the installed `@vapor-ui` packages), `fetch` (reading the frame from Figma), or `blueprint` (building the tree). |
| `status`  | Only when `outcome` is `error` and Figma answered with an HTTP error, such as `403` or `404`.                                                                                             |

The server stores the time it received each record.

### What is never sent

- Your email address. The CLI reads it from Figma (`GET /v1/me`) to check the domain and does not send it.
- Error messages, because they can contain local paths.
- File paths and anything else from your project.
- The Figma access token.
- The content of the design, such as layer names, text, or the node tree. A record names the design only by its file key and node id.

### When it is sent

A record is sent only when all of these hold:

- The input is a Figma URL. A `tree.json` file never sends a record.
- `--repo` is not set.
- `FIGMA_ACCESS_TOKEN` is set, and Figma reports an email that ends in `@goorm.io` for it. A token without the `current_user:read` scope sends nothing.
- `DO_NOT_TRACK` is not `1` or `true`.

`figma-blueprint entries`, `library`, and `ship` never send a record.

The record cannot change the CLI. The output and the exit code are the same with or without it. After the run, the CLI waits at most 1.5 seconds for the account check and the request together, then exits. It ignores any failure.

### Turn it off

Set `DO_NOT_TRACK=1` (or `true`) in the environment, or in the `.env` file in the directory where you run the CLI. With it set, the CLI makes no request to Figma's account endpoint and no request to goorm.

```sh
DO_NOT_TRACK=1 npx figma-blueprint 'https://www.figma.com/design/<fileKey>/<name>?node-id=1-2'
```

## License

MIT License © 2025 goorm, Inc
