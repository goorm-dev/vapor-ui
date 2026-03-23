import meow from 'meow';

import { PrettierFormatterAdapter } from '~/adapters/out/formatter/prettier-formatter.adapter';
import { FsOutputWriterAdapter } from '~/adapters/out/fs/fs-output-writer.adapter';
import { ConsoleLoggerAdapter } from '~/adapters/out/logger/console-logger.adapter';
import { TsMorphParserAdapter } from '~/adapters/out/ts-morph/ts-morph-parser.adapter';
import { ExtractComponentMetadataUseCase } from '~/application/use-cases/extract-component-metadata.usecase';
import { formatFileName } from '~/application/utils/filename';
import { CliError, resolveOptions } from '~/cli/options';
import { getComponentExtractOptions } from '~/config';

export async function runCli(): Promise<void> {
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
                component: {
                    type: 'string',
                    shortFlag: 'n',
                },
                all: {
                    type: 'boolean',
                    shortFlag: 'a',
                    default: false,
                },
                verbose: {
                    type: 'boolean',
                    shortFlag: 'v',
                    default: false,
                },
                config: {
                    type: 'string',
                },
                noConfig: {
                    type: 'boolean',
                    default: false,
                },
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

    const useCase = new ExtractComponentMetadataUseCase({
        metadataExtractor: new TsMorphParserAdapter(),
        outputWriter: new FsOutputWriterAdapter(),
        formatter: new PrettierFormatterAdapter(),
        logger: new ConsoleLoggerAdapter(),
        toFileName: formatFileName,
    });

    useCase.execute({
        tsconfigPath: resolved.tsconfigPath,
        targetFiles: resolved.targetFiles,
        extractOptions: resolved.extractOptions,
        outputDir: resolved.outputDir,
        languages: resolved.languages,
        verbose: resolved.verbose,
        resolveExtractOptions: (filePath, baseOptions) =>
            getComponentExtractOptions(baseOptions, filePath, resolved.config),
    });
}

export function handleCliError(error: unknown): never {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}
