import meow from 'meow';
import { join, resolve } from 'node:path';

import { readInputDocs } from '~/input';
import { applyTranslationsToRaw, formatWithPrettier, writeKoFiles } from '~/output';
import { buildReport, writeReport } from '~/report';
import { translatePropsInfo } from '~/translator';

export interface CliOptions {
    input: string;
    output: string;
}

export interface RunResult {
    options: CliOptions;
    writtenFiles: string[];
    reportPath: string;
}

const HELP_TEXT = `
  Usage
    $ translation-pipeline --input <dir> --output <dir>

  Options
    --input, -i      Directory containing EN JSON files (required)
    --output, -o     Directory where ko/, .translation-cache.json, .i18n-report.md are written (required)

  Examples
    $ translation-pipeline --input ./generated/en --output ./generated
`;

export function parseCliArgs(argv: string[]): CliOptions {
    const cli = meow(HELP_TEXT, {
        argv,
        importMeta: import.meta,
        flags: {
            input: { type: 'string', shortFlag: 'i' },
            output: { type: 'string', shortFlag: 'o' },
        },
    });

    const input = cli.flags.input?.trim();
    const output = cli.flags.output?.trim();

    if (!input) {
        throw new Error('Missing required option: --input');
    }
    if (!output) {
        throw new Error('Missing required option: --output');
    }

    return { input, output };
}

function requireEnv(name: string): void {
    if (!process.env[name]?.trim()) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
}

export async function run(argv: string[]): Promise<RunResult> {
    const cliOptions = parseCliArgs(argv);

    requireEnv('LITELLM_API_KEY');
    requireEnv('LITELLM_BASE_URL');

    const inputDir = resolve(cliOptions.input);
    const outputDir = resolve(cliOptions.output);

    const inputDocs = readInputDocs(inputDir);
    const result = await translatePropsInfo(
        inputDocs.map((entry) => entry.doc),
        outputDir,
    );

    const writtenFiles = writeKoFiles(outputDir, applyTranslationsToRaw(inputDocs, result.props));
    formatWithPrettier(writtenFiles);

    writeReport(buildReport(result.componentReports, result.batchFallbacks), outputDir);

    return { options: cliOptions, writtenFiles, reportPath: join(outputDir, '.i18n-report.md') };
}
