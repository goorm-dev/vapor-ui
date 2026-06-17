import meow from 'meow';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import { buildReport, writeReport } from '~/report/report';
import { translatePropsInfo } from '~/translator/translator';
import type { TranslatableDoc } from '~/types';

export class CliError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CliError';
    }
}

export interface CliOptions {
    input: string;
    output: string;
}

export interface RunOptions {
    /**
     * Override the translation pipeline runner. Used by tests to avoid hitting the LLM.
     */
    runPipeline?: (
        docs: TranslatableDoc[],
        outputDir: string,
    ) => ReturnType<typeof translatePropsInfo>;
    /** Override env lookup for tests. */
    env?: NodeJS.ProcessEnv;
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
        throw new CliError('Missing required option: --input');
    }
    if (!output) {
        throw new CliError('Missing required option: --output');
    }

    return { input, output };
}

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
    const value = env[name]?.trim();
    if (!value) {
        throw new CliError(`Missing required environment variable: ${name}`);
    }
    return value;
}

interface InputDoc {
    doc: TranslatableDoc;
    raw: Record<string, unknown>;
    fileName: string;
}

function readInputDocs(inputDir: string): InputDoc[] {
    if (!existsSync(inputDir)) {
        throw new CliError(`Input directory does not exist: ${inputDir}`);
    }
    const entries = readdirSync(inputDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => entry.name)
        .sort();

    const docs: InputDoc[] = [];
    for (const fileName of entries) {
        const filePath = join(inputDir, fileName);
        let raw: unknown;
        try {
            raw = JSON.parse(readFileSync(filePath, 'utf-8'));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new CliError(`Failed to parse ${fileName}: ${message}`);
        }

        const doc = normalizeDoc(raw, fileName);
        docs.push({ doc, raw: raw as Record<string, unknown>, fileName });
    }
    return docs;
}

function normalizeDoc(raw: unknown, fileName: string): TranslatableDoc {
    if (typeof raw !== 'object' || raw === null) {
        throw new CliError(`${fileName}: expected an object at top level`);
    }
    const record = raw as Record<string, unknown>;
    const name = record['name'];
    if (typeof name !== 'string' || !name) {
        throw new CliError(`${fileName}: missing required string field "name"`);
    }
    const description =
        typeof record['description'] === 'string' ? record['description'] : undefined;
    const propsRaw = record['props'];
    const props = Array.isArray(propsRaw)
        ? propsRaw.map((prop, index) => normalizeProp(prop, fileName, index))
        : [];
    return { name, description, props };
}

function normalizeProp(
    raw: unknown,
    fileName: string,
    index: number,
): TranslatableDoc['props'][number] {
    if (typeof raw !== 'object' || raw === null) {
        throw new CliError(`${fileName}: props[${index}] is not an object`);
    }
    const record = raw as Record<string, unknown>;
    const name = record['name'];
    if (typeof name !== 'string' || !name) {
        throw new CliError(`${fileName}: props[${index}] missing "name"`);
    }
    const description =
        typeof record['description'] === 'string' ? record['description'] : undefined;
    return { name, description };
}

function applyTranslationsToRaw(
    rawDocs: Pick<InputDoc, 'raw' | 'fileName'>[],
    translatedDocs: TranslatableDoc[],
): { fileName: string; content: Record<string, unknown> }[] {
    return rawDocs.map((entry, index) => {
        const translation = translatedDocs[index];
        if (!translation) {
            return { fileName: entry.fileName, content: entry.raw };
        }
        const merged: Record<string, unknown> = { ...entry.raw };
        if (translation.description !== undefined) {
            merged['description'] = translation.description;
        }
        const originalProps = Array.isArray(entry.raw['props']) ? entry.raw['props'] : [];
        merged['props'] = originalProps.map((prop, propIndex) => {
            if (typeof prop !== 'object' || prop === null) return prop;
            const translatedProp = translation.props[propIndex];
            if (!translatedProp) return prop;
            return {
                ...(prop as Record<string, unknown>),
                ...(translatedProp.description !== undefined
                    ? { description: translatedProp.description }
                    : {}),
            };
        });
        return { fileName: entry.fileName, content: merged };
    });
}

function writeKoFiles(
    outputDir: string,
    files: { fileName: string; content: Record<string, unknown> }[],
): string[] {
    const koDir = join(outputDir, 'ko');
    mkdirSync(koDir, { recursive: true });
    const writtenFiles: string[] = [];
    for (const { fileName, content } of files) {
        const filePath = join(koDir, basename(fileName));
        writeFileSync(filePath, JSON.stringify(content, null, 4) + '\n', 'utf-8');
        writtenFiles.push(filePath);
    }
    return writtenFiles;
}

export async function run(argv: string[], options: RunOptions = {}): Promise<RunResult> {
    const cliOptions = parseCliArgs(argv);
    const env = options.env ?? process.env;

    requireEnv(env, 'LITELLM_API_KEY');
    requireEnv(env, 'LITELLM_BASE_URL');

    const inputDir = resolve(cliOptions.input);
    const outputDir = resolve(cliOptions.output);

    const inputDocs = readInputDocs(inputDir);
    const docs = inputDocs.map((entry) => entry.doc);

    const runner = options.runPipeline ?? translatePropsInfo;
    const result = await runner(docs, outputDir);

    const merged = applyTranslationsToRaw(inputDocs, result.props);
    const writtenFiles = writeKoFiles(outputDir, merged);

    writeReport(buildReport(result.componentReports, result.batchFallbacks), outputDir);
    const reportPath = join(outputDir, '.i18n-report.md');

    return { options: cliOptions, writtenFiles, reportPath };
}
