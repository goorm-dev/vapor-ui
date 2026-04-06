import meow from 'meow';

import { CliError, resolveOptions } from '~/cli/options';
import { extract } from '~/extract';

async function runCli(): Promise<void> {
    const cli = meow(
        `
  Usage
    $ ts-api-extractor

  Options
    --component, -n   Component name to process (default: all components)
    --all, -a         Include all props (node_modules + sprinkles + html)
    --verbose, -v     Enable verbose output
    --config          Config file path
    --no-config       Ignore config file discovery

  Examples
    $ ts-api-extractor
    $ ts-api-extractor --component Tabs
    $ ts-api-extractor -n Button -a
    $ ts-api-extractor --config ./docs-extractor.config.mjs
`,
        {
            importMeta: import.meta,
            flags: {
                component: { type: 'string', shortFlag: 'n' },
                all: { type: 'boolean', shortFlag: 'a', default: false },
                verbose: { type: 'boolean', shortFlag: 'v', default: false },
                config: { type: 'string' },
                noConfig: { type: 'boolean', default: false },
            },
        },
    );

    const resolved = await resolveOptions({
        component: cli.flags.component,
        all: cli.flags.all,
        verbose: cli.flags.verbose,
        config: cli.flags.config,
        noConfig: cli.flags.noConfig,
    });

    extract({
        tsconfigPath: resolved.tsconfigPath,
        targetFiles: resolved.targetFiles,
        config: resolved.config,
        outputDir: resolved.outputDir,
        all: resolved.all,
        verbose: resolved.verbose,
    });
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

runCli().catch(handleCliError);
