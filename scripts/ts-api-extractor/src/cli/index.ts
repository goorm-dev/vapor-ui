import meow from 'meow';

import { extract } from '#app/extract';
import { resolveOptions } from '#cli/options';
import { createConsoleReporter } from '#cli/reporter';
import { ExtractorError } from '#domain/errors';
import { formatWithPrettier } from '#infrastructure/fs/file-writer';

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

    const reporter = createConsoleReporter(resolved.config.verbose);

    const { writtenFiles } = extract({
        tsconfigPath: resolved.tsconfigPath,
        targetFiles: resolved.targetFiles,
        config: resolved.config,
        reporter,
        // Only a full run knows which files are stale.
        removeStale: !cli.flags.component,
    });

    // Formatting is a CLI convenience, not part of extraction: it shells out to
    // prettier, so keeping it here leaves extract() free of child_process.
    formatWithPrettier(writtenFiles, reporter);
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof ExtractorError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

runCli().catch(handleCliError);
