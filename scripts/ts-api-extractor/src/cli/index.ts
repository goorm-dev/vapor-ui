import meow from 'meow';

import { resolveOptions } from '~/cli/options';
import { createConsoleReporter } from '~/cli/reporter';
import { extract } from '~/app/extract';
import { ExtractorError } from '~/domain/errors';

async function runCli(): Promise<void> {
    const cli = meow(
        `
  Usage
    $ ts-api-extractor

  Options
    --component, -n   Component name to process (default: all components)
    --config          Config file path

  Examples
    $ ts-api-extractor
    $ ts-api-extractor --component Tabs
    $ ts-api-extractor --config ./docs-extractor.config.mjs
`,
        {
            importMeta: import.meta,
            flags: {
                component: { type: 'string', shortFlag: 'n' },
                config: { type: 'string' },
            },
        },
    );

    const resolved = await resolveOptions({
        component: cli.flags.component,
        configPath: cli.flags.config,
    });

    extract({
        tsconfigPath: resolved.tsconfigPath,
        targetFiles: resolved.targetFiles,
        config: resolved.config,
        reporter: createConsoleReporter(resolved.config.verbose),
    });
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof ExtractorError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

runCli().catch(handleCliError);
