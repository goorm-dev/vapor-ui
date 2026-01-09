import meow from 'meow';
import path from 'node:path';

import { findTsconfig } from '~/core/config';
import { addSourceFiles, createProject, getNamespaces } from '~/core/project';
import { findComponentFiles, findFileByComponentName } from '~/core/scanner';
import { promptComponentSelection } from './prompts';

const cli = meow(
    `
  Usage
    $ ts-api-extractor docs-generate <path>

  Options
    --tsconfig, -c       Path to tsconfig.json (default: auto-detect)
    --ignore, -i         Additional ignore patterns (added to defaults)
    --no-default-ignore  Disable default ignore patterns (.stories.tsx, .css.ts)
    --component, -n      Component name to process (e.g., Button, TextInput)

  Examples
    $ ts-api-extractor docs-generate ./packages/core
    $ ts-api-extractor docs-generate ./packages/core --component Button
    $ ts-api-extractor docs-generate ./packages/core -n TextInput
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
            component: {
                type: 'string',
                shortFlag: 'n',
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

        const allFiles = await findComponentFiles(absolutePath, { ignore, noDefaultIgnore });

        if (allFiles.length === 0) {
            console.log('No .tsx files found');
            return;
        }

        let targetFiles: string[];
        let componentName = cli.flags.component;

        if (!componentName) {
            const result = await promptComponentSelection();

            if (result.type === 'all') {
                targetFiles = allFiles;
            } else {
                componentName = result.name;
            }
        }

        if (componentName) {
            const file = findFileByComponentName(allFiles, componentName);

            if (!file) {
                console.error(`Error: Component "${componentName}" not found`);
                process.exit(1);
            }

            targetFiles = [file];
        }

        const project = createProject(tsconfigPath);
        const sourceFiles = addSourceFiles(project, targetFiles!);

        for (const sourceFile of sourceFiles) {
            const namespaces = getNamespaces(sourceFile);

            if (namespaces.length > 0) {
                console.log(`\n${sourceFile.getFilePath()}`);
                console.log('  Namespaces:');
                for (const name of namespaces) {
                    console.log(`    - ${name}`);
                }
            }
        }
    } else {
        cli.showHelp();
    }
}

run();
