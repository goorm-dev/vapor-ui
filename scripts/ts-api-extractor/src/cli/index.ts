import meow from 'meow';
import path from 'node:path';

import { CliError, resolveOptions } from '~/cli/options';
import { extract } from '~/extract';

// Load .env.local from cwd (website app root when running via turbo)
try {
    process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
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
    --config          Config file path
    --translate       Enable translation pipeline (outputs en/ and ko/ subfolders)
    --skip-cache      Skip translation cache (do not read or write cache)
    --verbose, -v     Enable verbose logging

  Examples
    $ ts-api-extractor
    $ ts-api-extractor --component Tabs
    $ ts-api-extractor --config ./docs-extractor.config.mjs
    $ ts-api-extractor --translate
    $ ts-api-extractor --translate --skip-cache --verbose
`,
        {
            importMeta: import.meta,
            flags: {
                component: { type: 'string', shortFlag: 'n' },
                config: { type: 'string' },
                translate: { type: 'boolean', default: false },
                skipCache: { type: 'boolean', default: false },
                verbose: { type: 'boolean', shortFlag: 'v', default: false },
            },
        },
    );

    const resolved = await resolveOptions({
        component: cli.flags.component,
        configPath: cli.flags.config,
    });

    if (cli.flags.translate && resolved.config.translation) {
        resolved.config.translation.enabled = true;
    }
    if (cli.flags.verbose) {
        resolved.config.verbose = true;
    }

    await extract({
        tsconfigPath: resolved.tsconfigPath,
        targetFiles: resolved.targetFiles,
        config: resolved.config,
        skipCache: cli.flags.skipCache,
    });
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

runCli().catch(handleCliError);
