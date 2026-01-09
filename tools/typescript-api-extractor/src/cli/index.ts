import meow from 'meow';

import { findComponentFiles } from '~/core/scanner';

const cli = meow(
    `
  Usage
    $ ts-api-extractor <command> <path>

  Commands
    docs-generate  Find component files in given path

  Examples
    $ ts-api-extractor docs-generate ./src
`,
    {
        importMeta: import.meta,
    },
);

const [command, inputPath] = cli.input;

async function run() {
    if (command === 'docs-generate') {
        if (!inputPath) {
            console.error('Error: path is required');
            process.exit(1);
        }

        const files = await findComponentFiles(inputPath);
        files.forEach((file) => {
            console.log(file);
        });
    } else {
        cli.showHelp();
    }
}

run();
