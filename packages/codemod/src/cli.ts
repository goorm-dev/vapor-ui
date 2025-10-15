#!/usr/bin/env node

import meow from "meow";
import isGitClean from "is-git-clean";
import chalk from "chalk";
import { globbySync } from "globby";
import { input, select } from "@inquirer/prompts";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const require = createRequire(import.meta.url);
const transformerDirectory = path.join(dirName, "../src", "transforms");

function checkGitStatus(force: boolean) {
  let clean = false;
  let errorMessage = "Unable to determine if git directory is clean";

  try {
    clean = isGitClean.sync();
    errorMessage = "Git directory is not clean";
  } catch (err: any) {
    if (err && err.stderr && err.stderr.indexOf("Not a git repository") >= 0) {
      clean = true;
    }
  }

  if (!clean) {
    if (force) {
      console.log(`WARNING: ${errorMessage}. Forcibly continuing.`);
    } else {
      console.log("Thank you for using vapor-ui!");
      console.log(
        chalk.yellow(
          "\nERROR: For safety, codemods can only be run on a clean git directory."
        )
      );
      console.log(
        "\nIf you understand the risks, you may use the --force flag to override this safety check."
      );
      process.exit(1);
    }
  }
}

function resolveTransformer(transformerDirectory: string, transformer: string) {
  return (
    globbySync(`${transformerDirectory}/${transformer}/index.{mjs,js}`)[0] ||
    null
  );
}
function runTransform({
  files,
  flags,
  parser,
  transformer,
}: {
  files: string[];
  flags: any;
  parser: string;
  transformer: string;
  answers: any;
}) {
  const transformerPath = resolveTransformer(transformerDirectory, transformer);

  let args: string[] = [];

  const { dry, print, explicitRequire } = flags;

  if (dry) {
    args.push("--dry");
  }
  if (print) {
    args.push("--print");
  }

  if (explicitRequire === "false") {
    args.push("--explicit-require=false");
  }

  args.push("--verbose=2");

  args.push("--ignore-pattern=**/node_modules/**");

  args.push("--parser", parser);

  if (parser === "tsx") {
    args.push("--extensions=tsx,ts,jsx,js");
  } else {
    args.push("--extensions=jsx,js");
  }

  args = args.concat(["--transform", transformerPath || ""]);

  if (flags.jscodeshift) {
    args = args.concat(flags.jscodeshift);
  }

  args = args.concat(files);

  const jscodeshiftExecutable = require.resolve(
    "jscodeshift/bin/jscodeshift.js"
  );
  const command = `node ${jscodeshiftExecutable} ${args.join(" ")}`;

  console.log(`Executing command: ${command}`);

  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    throw error;
  }
}

const TRANSFORMER_INQUIRER_CHOICES = [
  {
    name: "update-callout: Update Callout component usage to new API",
    value: "update-callout",
  },
];
const run = async () => {
  const cli = meow(
    `Usage
      $ npx @vapor-ui/migrate <transform> <path> <...options>
    
        transform    One of the choices from https://github.com/goorm-dev/vapor-ui/tree/main/packages/codemod
        path         Files or directory to transform. Can be a glob like src/**.test.js

    Options
      --force            Bypass Git safety checks and forcibly run codemods
      --dry              Dry run (no changes are made to files)
      --print            Print transformed files to your terminal
      --explicit-require Transform only if React is imported in the file (default: true)

      --jscodeshift  (Advanced) Pass options directly to jscodeshift
    `,
    {
      importMeta: import.meta,
      flags: {
        force: {
          type: "boolean",
          default: false,
          aliases: ["f"],
        },
        dry: {
          type: "boolean",
          default: false,
          aliases: ["d"],
        },
        print: {
          type: "boolean",
          default: false,
          aliases: ["p"],
        },
        explicitRequire: {
          type: "boolean",
          default: true,
        },
        jscodeshift: {
          type: "string",
          default: "",
          aliases: ["j"],
        },
      },
    }
  );

  if (!cli.flags.dry) {
    checkGitStatus(cli.flags.force);
  }

  const answers: { [key: string]: string } = {};

  if (!cli.input[1]) {
    answers.files = await input({
      message: "On which files or directory should the codemods be applied?",
      default: ".",
      transformer: (value) => value.trim(),
    });
  }

  if (!cli.input[0]) {
    answers.transformer = await select({
      message: "Which transform would you like to apply?",
      choices: TRANSFORMER_INQUIRER_CHOICES,
    });
  }
  if (!cli.flags.parser) {
    answers.parser = await select({
      message: "Which parser should be used?",
      choices: [
        { name: "tsx (for .tsx, .ts, .jsx, .js files)", value: "tsx" },
        { name: "babel (for .jsx, .js files)", value: "babel" },
      ],
      default: "tsx",
    });
  }

  const files = globbySync(cli.input[1] || answers.files);

  const selectedTransformer = cli.input[0] || answers.transformer;
  const selectedParser: string = (cli.flags.parser as string) || answers.parser;

  if (!files.length) {
    console.log(chalk.red(`No files found matching ${files.join(" ")}`));
    return null;
  }

  return runTransform({
    files,
    flags: cli.flags,
    parser: selectedParser,
    transformer: selectedTransformer,
    answers: answers,
  });
};

run();
