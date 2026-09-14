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
        // 하나만 뽑을 때 정리하면 나머지 문서가 전부 날아간다.
        prune: !cli.flags.component,
    });
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

runCli().catch(handleCliError);
