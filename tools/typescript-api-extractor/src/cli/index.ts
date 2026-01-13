import meow from 'meow';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { addSourceFiles, createProject } from '~/core/project';
import { extractProps } from '~/core/props-extractor';

import type { RawCliOptions } from './options.js';
import { resolveOptions } from './options.js';

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
    $ ts-api-extractor [path]

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
    $ ts-api-extractor  # Interactive mode: prompts for path and components
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

export async function run() {
    const rawOptions: RawCliOptions = {
        path: inputPath,
        tsconfig: cli.flags.tsconfig,
        ignore: cli.flags.ignore ?? [],
        defaultIgnore: cli.flags.defaultIgnore,
        component: cli.flags.component,
        output: cli.flags.output,
        outputDir: cli.flags.outputDir,
        all: cli.flags.all,
        sprinkles: cli.flags.sprinkles,
        include: cli.flags.include,
        includeHtml: cli.flags.includeHtml,
    };

    const resolved = await resolveOptions(rawOptions);

    const hasFileOutput = resolved.outputMode.type !== 'stdout';

    logProgress('Parsing components...', hasFileOutput);

    const project = createProject(resolved.tsconfigPath);
    const sourceFiles = addSourceFiles(project, resolved.targetFiles);

    const total = sourceFiles.length;
    const results = sourceFiles.map((sf, index) => {
        const componentName = path.basename(sf.getFilePath(), '.tsx');
        logProgress(`Processing ${componentName} (${index + 1}/${total})`, hasFileOutput);
        return extractProps(sf, resolved.extractOptions);
    });

    const allProps = results.flatMap((r) => r.props);
    logProgress(`Done! Extracted ${allProps.length} components.`, hasFileOutput);

    if (resolved.outputMode.type === 'directory') {
        const outputDir = resolved.outputMode.path;
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
    } else if (resolved.outputMode.type === 'file') {
        const outputPath = resolved.outputMode.path;
        const output = allProps.length === 1 ? allProps[0] : allProps;
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        console.log(`Written to ${outputPath}`);
        formatWithPrettier([outputPath]);
    } else {
        const output = allProps.length === 1 ? allProps[0] : allProps;
        console.log(JSON.stringify(output, null, 2));
    }
}
