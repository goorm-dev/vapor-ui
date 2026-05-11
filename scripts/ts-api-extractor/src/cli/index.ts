import meow from 'meow';
import path from 'node:path';

import { CliError } from '~/cli/input';
import { resolveRunContext } from '~/cli/context';
import { extract } from '~/extract';

// Load .env from cwd (website app root when running via turbo)
try {
    process.loadEnvFile(path.resolve(process.cwd(), '.env'));
} catch {
    // File does not exist — proceed without it
}

async function runCli(): Promise<void> {
    const cli = meow(
        `
  Usage
    $ ts-api-extractor

  Options
    --component, -n   Component name to process (default: all components)
    --package, -p     Package name to extract from (default: core)
    --verbose, -v     Enable verbose logging

  Examples
    $ ts-api-extractor
    $ ts-api-extractor --component Tabs
    $ ts-api-extractor --package hooks
`,
        {
            importMeta: import.meta,
            flags: {
                component: { type: 'string', shortFlag: 'n' },
                package: { type: 'string', shortFlag: 'p' },
                verbose: { type: 'boolean', shortFlag: 'v', default: false },
            },
        },
    );

    const resolved = await resolveRunContext({
        component: cli.flags.component,
        package: cli.flags.package,
        verbose: cli.flags.verbose,
    });

    await extract(resolved);
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

runCli().catch(handleCliError);
