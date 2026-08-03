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

  Examples
    $ ts-api-extractor
    $ ts-api-extractor --component Tabs
`,
        {
            importMeta: import.meta,
            flags: {
                component: { type: 'string', shortFlag: 'n' },
            },
        },
    );

    const resolved = await resolveOptions({ component: cli.flags.component });

    extract({
        tsconfigPath: resolved.tsconfigPath,
        targetFiles: resolved.targetFiles,
        config: resolved.config,
    });
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

runCli().catch(handleCliError);
