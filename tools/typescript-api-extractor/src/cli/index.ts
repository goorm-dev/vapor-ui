import meow from 'meow';
import fs from 'node:fs';
import path from 'node:path';

import { findTsconfig } from '~/core/config';
import { addSourceFiles, createProject } from '~/core/project';
import { extractProps } from '~/core/props-extractor';
import { findComponentFiles, findFileByComponentName } from '~/core/scanner';

import { promptComponentSelection } from './prompts';

const cli = meow(
    `
  Usage
    $ ts-api-extractor <path>

  Options
    --tsconfig, -c       Path to tsconfig.json (default: auto-detect)
    --ignore, -i         Additional ignore patterns (added to defaults)
    --no-default-ignore  Disable default ignore patterns (.stories.tsx, .css.ts)
    --component, -n      Component name to process (e.g., Button, TextInput)
    --output, -o         Output file path (default: stdout)
    --all, -a            Include all props (node_modules + sprinkles)
    --sprinkles, -s      Include sprinkles props
    --include            Include specific props (can be used multiple times)

  Examples
    $ ts-api-extractor ./packages/core
    $ ts-api-extractor ./packages/core --component Tabs
    $ ts-api-extractor ./packages/core --sprinkles
    $ ts-api-extractor ./packages/core --include padding --include margin
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
            output: {
                type: 'string',
                shortFlag: 'o',
            },
            all: {
                type: 'boolean',
                shortFlag: 'a',
                default: false,
            },
            sprinkles: {
                type: 'boolean',
                shortFlag: 's',
                default: false,
            },
            include: {
                type: 'string',
                isMultiple: true,
            },
        },
    },
);

const [inputPath] = cli.input;
const cwd = process.env.INIT_CWD || process.cwd();

async function run() {
    if (!inputPath) {
        cli.showHelp();
        return;
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

    const extractOptions = {
        filterExternal: !cli.flags.all,
        filterSprinkles: !cli.flags.all && !cli.flags.sprinkles,
        include: cli.flags.include,
    };
    const results = sourceFiles.map((sf) => extractProps(sf, extractOptions));
    const json = JSON.stringify(results, null, 2);

    if (cli.flags.output) {
        const outputPath = path.resolve(cwd, cli.flags.output);
        fs.writeFileSync(outputPath, json);
        console.log(`Written to ${outputPath}`);
    } else {
        console.log(json);
    }
}

run();
