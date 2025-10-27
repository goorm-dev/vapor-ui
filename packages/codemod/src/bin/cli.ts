#!/usr/bin/env node
import { input, select } from '@inquirer/prompts';
import { execSync } from 'child_process';
import { globbySync } from 'globby';
import isGitClean from 'is-git-clean';
import meow from 'meow';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'path';
import picocolors from 'picocolors';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const require = createRequire(import.meta.url);
const transformerDirectory = path.join(dirName, '../src', 'transforms');

function checkGitStatus(force: boolean) {
    let clean = false;
    let errorMessage = 'Unable to determine if git directory is clean';

    try {
        clean = isGitClean.sync();
        errorMessage = 'Git directory is not clean';
    } catch (err: unknown) {
        if (
            err &&
            typeof err === 'object' &&
            'stderr' in err &&
            typeof err.stderr === 'string' &&
            err.stderr.indexOf('Not a git repository') >= 0
        ) {
            clean = true;
        }
    }

    if (!clean) {
        if (force) {
            console.log(`WARNING: ${errorMessage}. Forcibly continuing.`);
        } else {
            console.log('Thank you for using vapor-ui!');
            console.log(
                picocolors.yellow(
                    '\nERROR: For safety, codemods can only be run on a clean git directory.',
                ),
            );
            console.log(
                '\nIf you understand the risks, you may use the --force flag to override this safety check.',
            );
            process.exit(1);
        }
    }
}

function resolveTransformer(transformerDirectory: string, transformer: string) {
    return globbySync(`${transformerDirectory}/${transformer}/index.{mjs,js}`)[0] || null;
}
function runTransform({
    files,
    flags,
    parser,
    transformer,
}: {
    files: string[];
    flags: { dry?: boolean; jscodeshift?: string };
    parser: string;
    transformer: string;
}) {
    const transformerPath = resolveTransformer(transformerDirectory, transformer);

    let args: string[] = [];

    const { dry, jscodeshift } = flags;

    args.push(`--parser=${parser}`);
    if (dry) {
        args.push(`--dry`);
    }

    if (parser === 'tsx') {
        args.push(`--extensions=tsx,ts,jsx,js`);
    } else {
        args.push(`--extensions=jsx,js`);
    }

    args = args.concat([`--transform=${transformerPath || ''}`]);

    if (jscodeshift) {
        args = args.concat(jscodeshift);
    }

    args = args.concat(files);

    const jscodeshiftExecutable = require.resolve('jscodeshift/bin/jscodeshift.js');
    const command = `node ${jscodeshiftExecutable} ${args.join(' ')}`;

    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        throw error;
    }
}

const TRANSFORMER_INQUIRER_CHOICES = [
    {
        name: 'internal/icons: Migrate @goorm-dev/vapor-icons to @vapor-ui/icons',
        value: 'internal/icons/migrate-icons-import',
    },
    {
        name: 'internal/core/alert: Migrate Alert component to @vapor-ui/core Callout',
        value: 'internal/core/alert',
    },
    {
        name: 'internal/core/avatar: Migrate Avatar component to @vapor-ui/core',
        value: 'internal/core/avatar',
    },
    {
        name: 'internal/core/badge: Migrate Badge component to @vapor-ui/core',
        value: 'internal/core/badge',
    },
    {
        name: 'internal/core/breadcrumb: Migrate Breadcrumb component to @vapor-ui/core',
        value: 'internal/core/breadcrumb',
    },
    {
        name: 'internal/core/button: Migrate Button component to @vapor-ui/core',
        value: 'internal/core/button',
    },
    {
        name: 'internal/core/card: Migrate Card component to @vapor-ui/core',
        value: 'internal/core/card',
    },
    {
        name: 'internal/core/checkbox: Migrate Checkbox component to @vapor-ui/core',
        value: 'internal/core/checkbox',
    },

    {
        name: 'internal/core/collapsible: Migrate Collapsible component to @vapor-ui/core',
        value: 'internal/core/collapsible',
    },
    {
        name: 'internal/core/dialog: Migrate Dialog component to @vapor-ui/core',
        value: 'internal/core/dialog',
    },
    {
        name: 'internal/core/dropdown: Migrate Dropdown component to @vapor-ui/core',
        value: 'internal/core/dropdown',
    },
    {
        name: 'internal/core/icon-button: Migrate IconButton component to @vapor-ui/core',
        value: 'internal/core/icon-button',
    },
    {
        name: 'internal/core/nav: Migrate Nav component to @vapor-ui/core',
        value: 'internal/core/nav',
    },
    {
        name: 'internal/core/popover: Migrate Popover component to @vapor-ui/core',
        value: 'internal/core/popover',
    },
    {
        name: 'internal/core/radio-group: Migrate RadioGroup component to @vapor-ui/core',
        value: 'internal/core/radio-group',
    },
    {
        name: 'internal/core/switch: Migrate Switch component to @vapor-ui/core',
        value: 'internal/core/switch',
    },
    {
        name: 'internal/core/tabs: Migrate Tabs component to @vapor-ui/core',
        value: 'internal/core/tabs',
    },
    {
        name: 'internal/core/text: Migrate Text component to @vapor-ui/core',
        value: 'internal/core/text',
    },
    {
        name: 'internal/core/text-input: Migrate TextInput component to @vapor-ui/core',
        value: 'internal/core/text-input',
    },
];
const run = async () => {
    const cli = meow(
        `Usage
      $ npx @vapor-ui/migrate <transform> <files> [...options]
    
        transform    One of the choices from https://github.com/goorm-dev/vapor-ui/tree/main/packages/codemod
        files       Files or directory to transform. Can be a glob like src/**.test.js

    Options
      --force            Bypass Git safety checks and forcibly run codemods
      --parser           Specify the parser to be used. One of: tsx, babel
      --dry              (Advanced) Dry run. Changes are not written to files.
      --jscodeshift      (Advanced) Pass options directly to jscodeshift.
                        See more options: https://jscodeshift.com/run/cli
    `,
        {
            importMeta: import.meta,
            flags: {
                force: {
                    type: 'boolean',
                    default: false,
                    aliases: ['f'],
                },
                dry: {
                    type: 'boolean',
                    default: false,
                    aliases: ['d'],
                },
                parser: {
                    type: 'string',
                    default: '',
                    aliases: ['p'],
                },
                jscodeshift: {
                    type: 'string',
                    default: '',
                    aliases: ['j'],
                },
            },
        },
    );

    if (!cli.flags.dry) {
        checkGitStatus(cli.flags.force);
    }

    const answers: { [key: string]: string } = {};

    if (!cli.input[1]) {
        answers.files = await input({
            message: 'On which files or directory should the codemods be applied?',
            default: '.',
            transformer: (value) => value.trim(),
        });
    }

    if (!cli.input[0]) {
        answers.transformer = await select({
            message: 'Which transform would you like to apply?',
            choices: TRANSFORMER_INQUIRER_CHOICES,
        });
    }
    if (!cli.flags.parser) {
        answers.parser = await select({
            message: 'Which parser should be used?',
            choices: [
                { name: 'tsx (for .tsx, .ts, .jsx, .js files)', value: 'tsx' },
                { name: 'babel (for .jsx, .js files)', value: 'babel' },
            ],
            default: 'tsx',
        });
    }

    const files = globbySync(cli.input[1] || answers.files);

    if (!files.length) {
        console.log(picocolors.red(`No files found matching ${files.join(' ')}`));
        return null;
    }

    return runTransform({
        files: globbySync(cli.input[1] || answers.files),
        flags: cli.flags,
        parser: (cli.flags.parser as string) || answers.parser,
        transformer: cli.input[0] || answers.transformer,
    });
};

run();
