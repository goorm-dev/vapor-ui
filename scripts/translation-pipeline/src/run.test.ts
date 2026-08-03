import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TranslatableDoc, TranslationOutcome } from '~/domain';
import { parseCliArgs, run } from '~/run';
import * as translatorModule from '~/translator';
import type { TranslateResult } from '~/translator';

function passthroughRunner(docs: TranslatableDoc[]): Promise<TranslateResult> {
    const translatedProps = docs.map((doc) => ({
        ...doc,
        description: doc.description ? `[ko]${doc.description}` : doc.description,
        props: doc.props.map((prop) => ({
            ...prop,
            description: prop.description ? `[ko]${prop.description}` : prop.description,
        })),
    }));
    const componentReports = docs.map((doc) => ({
        name: doc.name,
        totalTexts: (doc.description ? 1 : 0) + doc.props.filter((p) => p.description).length,
        verified: (doc.description ? 1 : 0) + doc.props.filter((p) => p.description).length,
        unverified: 0,
        cached: 0,
        unverifiedOutcomes: [] as TranslationOutcome[],
    }));
    return Promise.resolve({ props: translatedProps, componentReports, batchFallbacks: [] });
}

describe('parseCliArgs', () => {
    it('returns input and output when both are provided', () => {
        const result = parseCliArgs(['--input', './en', '--output', './out']);
        expect(result).toEqual({ input: './en', output: './out' });
    });

    it('throws when --input is missing', () => {
        expect(() => parseCliArgs(['--output', './out'])).toThrow(/--input/);
    });

    it('throws when --output is missing', () => {
        expect(() => parseCliArgs(['--input', './en'])).toThrow(/--output/);
    });
});

describe('cli run', () => {
    let workDir: string;

    beforeEach(() => {
        workDir = mkdtempSync(join(tmpdir(), 'translation-pipeline-cli-'));
        vi.stubEnv('LITELLM_API_KEY', 'test-key');
        vi.stubEnv('LITELLM_BASE_URL', 'https://example.test');
        vi.spyOn(translatorModule, 'translatePropsInfo').mockImplementation(passthroughRunner);
    });

    afterEach(() => {
        rmSync(workDir, { recursive: true, force: true });
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('throws when --input is missing', async () => {
        await expect(run(['--output', join(workDir, 'out')])).rejects.toThrow(/--input/);
    });

    it('throws when --output is missing', async () => {
        await expect(run(['--input', join(workDir, 'en')])).rejects.toThrow(/--output/);
    });

    it('throws when LITELLM_API_KEY is missing', async () => {
        vi.stubEnv('LITELLM_API_KEY', '');
        const inputDir = join(workDir, 'en');
        mkdirSync(inputDir, { recursive: true });
        await expect(run(['--input', inputDir, '--output', join(workDir, 'out')])).rejects.toThrow(
            /LITELLM_API_KEY/,
        );
    });

    it('throws when LITELLM_BASE_URL is missing', async () => {
        vi.stubEnv('LITELLM_BASE_URL', '');
        const inputDir = join(workDir, 'en');
        mkdirSync(inputDir, { recursive: true });
        await expect(run(['--input', inputDir, '--output', join(workDir, 'out')])).rejects.toThrow(
            /LITELLM_BASE_URL/,
        );
    });

    it('reads EN JSON files and writes ko/ + .i18n-report.md', async () => {
        const inputDir = join(workDir, 'en');
        const outputDir = join(workDir, 'out');
        mkdirSync(inputDir, { recursive: true });

        const button: Record<string, unknown> = {
            name: 'Button',
            description: 'A clickable button.',
            props: [
                {
                    name: 'size',
                    type: ['"sm"', '"md"'],
                    required: false,
                    description: 'Size of the button.',
                },
                { name: 'className', type: ['string'], required: false },
            ],
        };
        writeFileSync(join(inputDir, 'button.json'), JSON.stringify(button), 'utf-8');

        const result = await run(['--input', inputDir, '--output', outputDir]);

        expect(result.writtenFiles).toHaveLength(1);
        const koPath = join(outputDir, 'ko', 'button.json');
        expect(existsSync(koPath)).toBe(true);
        const koContent = JSON.parse(readFileSync(koPath, 'utf-8')) as {
            name: string;
            description: string;
            props: { name: string; description?: string; type?: string[] }[];
        };
        expect(koContent.name).toBe('Button');
        expect(koContent.description).toBe('[ko]A clickable button.');
        expect(koContent.props[0].description).toBe('[ko]Size of the button.');
        expect(koContent.props[0].type).toEqual(['"sm"', '"md"']);
        expect(koContent.props[1].name).toBe('className');
        expect(koContent.props[1].description).toBeUndefined();

        expect(existsSync(result.reportPath)).toBe(true);
        const reportContent = readFileSync(result.reportPath, 'utf-8');
        expect(reportContent).toContain('Translation Quality Report');
        expect(reportContent).toContain('| Button |');
    });

    it('throws when input directory does not exist', async () => {
        await expect(
            run(['--input', join(workDir, 'missing'), '--output', join(workDir, 'out')]),
        ).rejects.toThrow(/Input directory does not exist/);
    });
});
