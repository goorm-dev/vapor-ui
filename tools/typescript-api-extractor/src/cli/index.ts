import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import meow from 'meow';

import { findTsconfig } from '~/core/config';
import { addSourceFiles, createProject } from '~/core/project';
import { extractProps } from '~/core/props-extractor';
import { findComponentFiles, findFileByComponentName } from '~/core/scanner';

function toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function logProgress(message: string, hasFileOutput: boolean) {
    if (hasFileOutput) {
        console.error(message);
    }
}

function formatWithPrettier(filePaths: string[]) {
    if (filePaths.length === 0) return;
    try {
        execSync(`npx prettier --write ${filePaths.join(' ')}`, { stdio: 'inherit' });
    } catch {
        // prettier not available, skip formatting
    }
}

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
    --output-dir, -d     Output directory for per-component files
    --all, -a            Include all props (node_modules + sprinkles + html)
    --sprinkles, -s      Include sprinkles props
    --include            Include specific props (can be used multiple times)
    --include-html       Include specific HTML attributes (e.g., --include-html className style)

  Examples
    $ ts-api-extractor ./packages/core
    $ ts-api-extractor ./packages/core --component Tabs
    $ ts-api-extractor ./packages/core --component Tabs --output-dir ./output
    $ ts-api-extractor ./packages/core --sprinkles
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
            outputDir: {
                type: 'string',
                shortFlag: 'd',
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
            includeHtml: {
                type: 'string',
                isMultiple: true,
            },
        },
    },
);

const [inputPath] = cli.input;
const cwd = process.cwd();

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
    const componentName = cli.flags.component;

    if (componentName) {
        const file = findFileByComponentName(allFiles, componentName);

        if (!file) {
            console.error(`Error: Component "${componentName}" not found`);
            process.exit(1);
        }

        targetFiles = [file];
    } else {
        // --component 옵션 없으면 모든 컴포넌트 추출
        targetFiles = allFiles;
    }

    const hasFileOutput = !!(cli.flags.output || cli.flags.outputDir);

    logProgress('Parsing components...', hasFileOutput);

    const project = createProject(tsconfigPath);
    const sourceFiles = addSourceFiles(project, targetFiles!);

    const extractOptions = {
        filterExternal: !cli.flags.all,
        filterSprinkles: !cli.flags.all && !cli.flags.sprinkles,
        filterHtml: !cli.flags.all,
        includeHtmlWhitelist: cli.flags.includeHtml?.length
            ? new Set(cli.flags.includeHtml)
            : undefined,
        include: cli.flags.include,
    };

    const total = sourceFiles.length;
    const results = sourceFiles.map((sf, index) => {
        const componentName = path.basename(sf.getFilePath(), '.tsx');
        logProgress(`Processing ${componentName} (${index + 1}/${total})`, hasFileOutput);
        return extractProps(sf, extractOptions);
    });

    const allProps = results.flatMap((r) => r.props);
    logProgress(`Done! Extracted ${allProps.length} components.`, hasFileOutput);

    if (cli.flags.outputDir) {
        const outputDir = path.resolve(cwd, cli.flags.outputDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const writtenFiles: string[] = [];
        for (const prop of allProps) {
            const fileName = toKebabCase(prop.name) + '.json';
            const filePath = path.join(outputDir, fileName);
            fs.writeFileSync(filePath, JSON.stringify(prop, null, 2));
            writtenFiles.push(filePath);
            console.log(`Written to ${filePath}`);
        }
        formatWithPrettier(writtenFiles);
    } else if (cli.flags.output) {
        const outputPath = path.resolve(cwd, cli.flags.output);
        const output = allProps.length === 1 ? allProps[0] : allProps;
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        console.log(`Written to ${outputPath}`);
        formatWithPrettier([outputPath]);
    } else {
        const output = allProps.length === 1 ? allProps[0] : allProps;
        console.log(JSON.stringify(output, null, 2));
    }
}

run();
