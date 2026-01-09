import meow from 'meow';
import path from 'node:path';

import { findTsconfig } from '~/core/config';
import { addSourceFiles, createProject, getExportedNodes } from '~/core/project';
import { findComponentFiles } from '~/core/scanner';

const cli = meow(
    `
  Usage
    $ ts-api-extractor docs-generate <path>

  Options
    --tsconfig, -c       Path to tsconfig.json (default: auto-detect)
    --ignore, -i         Additional ignore patterns (added to defaults)
    --no-default-ignore  Disable default ignore patterns (.stories.tsx, .css.ts)

  Examples
    $ ts-api-extractor docs-generate ./packages/core
    $ ts-api-extractor docs-generate ./packages/core --ignore .test.tsx
    $ ts-api-extractor docs-generate ./packages/core --no-default-ignore --ignore .git
`,
    {
        importMeta: import.meta,
        flags: {
            tsconfig: {
                type: 'string',
                shortFlag: 'c',
            },
            ignore: {
                type: 'string',
                shortFlag: 'i',
                isMultiple: true,
            },
            defaultIgnore: {
                type: 'boolean',
                default: true,
            },
        },
    },
);

const [command, inputPath] = cli.input;
const cwd = process.env.INIT_CWD || process.cwd();

async function run() {
    if (command === 'docs-generate') {
        if (!inputPath) {
            console.error('Error: path is required');
            process.exit(1);
        }

        const absolutePath = path.resolve(cwd, inputPath);
        const tsconfigPath = cli.flags.tsconfig
            ? path.resolve(cwd, cli.flags.tsconfig)
            : findTsconfig(absolutePath);

        if (!tsconfigPath) {
            console.error('Error: tsconfig.json not found');
            process.exit(1);
        }

        const ignore = cli.flags.ignore ?? [];
        const noDefaultIgnore = !cli.flags.defaultIgnore;
        const files = await findComponentFiles(absolutePath, { ignore, noDefaultIgnore });

        if (files.length === 0) {
            console.log('No .tsx files found');
            return;
        }

        const project = createProject(tsconfigPath);
        const sourceFiles = addSourceFiles(project, files);

        for (const sourceFile of sourceFiles) {
            const exported = getExportedNodes(sourceFile);
            if (exported.size > 0) {
                console.log(`\n${sourceFile.getFilePath()}`);
                for (const [name] of exported) {
                    console.log(`  - ${name}`);
                }
            }
        }
    } else {
        cli.showHelp();
    }
}

run();
