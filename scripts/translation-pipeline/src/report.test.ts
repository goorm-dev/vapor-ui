import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildComponentReports, buildReport, renderReport, writeReport } from '~/report';
import type { ComponentReport, TranslationReport } from '~/report';
import type { TranslatableDoc, TranslationOutcome, TranslationUnit } from '~/domain';

function makeTmpDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'report-test-'));
}

const unverifiedOutcome = {
    key: 'Button:(description)',
    translated: 'Button 컴포넌트.',
    assurance: 'unverified' as const,
    reportable: true,
    reason: 'quality_gate_failed' as const,
    errors: [
        {
            severity: 'minor' as const,
            category: 'Fluency/Unnatural phrasing' as const,
            source_span: 'component',
            mt_span: '컴포넌트.',
            explanation: '어색합니다.',
        },
    ],
    violations: [],
};

describe('buildReport', () => {
    it('aggregates verified, unverified, and cached counts', () => {
        const components: ComponentReport[] = [
            {
                name: 'Button',
                totalTexts: 5,
                verified: 3,
                unverified: 2,
                cached: 1,
                unverifiedOutcomes: [unverifiedOutcome],
            },
            {
                name: 'Divider',
                totalTexts: 0,
                verified: 0,
                unverified: 0,
                cached: 0,
                unverifiedOutcomes: [],
            },
        ];

        const report = buildReport(components);

        expect(report).toMatchObject({
            totalComponents: 2,
            totalTexts: 5,
            verifiedCount: 3,
            unverifiedCount: 2,
            cachedCount: 1,
            components,
        });
    });
});

describe('renderReport', () => {
    it('renders the summary columns including components with zero units', () => {
        const report: TranslationReport = {
            generatedAt: '2026-05-08T00:00:00.000Z',
            totalComponents: 2,
            totalTexts: 2,
            verifiedCount: 1,
            unverifiedCount: 1,
            cachedCount: 0,
            passRate: 0.5,
            reasonCounts: {},
            categoryCounts: {},
            violationCounts: {},
            batchFallbacks: [],
            components: [
                {
                    name: 'Button',
                    totalTexts: 2,
                    verified: 1,
                    unverified: 1,
                    cached: 0,
                    unverifiedOutcomes: [unverifiedOutcome],
                },
                {
                    name: 'Divider',
                    totalTexts: 0,
                    verified: 0,
                    unverified: 0,
                    cached: 0,
                    unverifiedOutcomes: [],
                },
            ],
        };

        const output = renderReport(report);

        expect(output).toContain('| Component | Total Texts | Verified | Unverified | Cached |');
        expect(output).toContain('| Button | 2 | 1 | 1 | 0 |');
        expect(output).toContain('| Divider | 0 | 0 | 0 | 0 |');
    });

    it('renders "None." in Batch Fallbacks section when there are no fallbacks', () => {
        const report = buildReport(
            [
                {
                    name: 'Button',
                    totalTexts: 1,
                    verified: 1,
                    unverified: 0,
                    cached: 0,
                    unverifiedOutcomes: [],
                },
            ],
            [],
        );
        const output = renderReport(report);
        expect(output).toContain('## Batch Fallbacks');
        expect(output).toContain('| Batch fallbacks | 0 |');
        expect(output).toMatch(/## Batch Fallbacks\n\nNone\./);
    });

    it('renders batch fallback rows when fallbacks occurred', () => {
        const report = buildReport(
            [
                {
                    name: 'Button',
                    totalTexts: 1,
                    verified: 1,
                    unverified: 0,
                    cached: 0,
                    unverifiedOutcomes: [],
                },
            ],
            [
                'batch MQM invalid: missing id "x"',
                'batch postprocess invalid',
            ],
        );
        const output = renderReport(report);
        expect(output).toContain('| Batch fallbacks | 2 |');
        expect(output).toContain('2 chunk(s) were marked unverified.');
        expect(output).toContain('| Reason |');
        expect(output).toContain('| batch MQM invalid: missing id "x" |');
        expect(output).toContain('| batch postprocess invalid |');
    });

    it('renders details only for reportable unverified outcomes', () => {
        const report = buildReport([
            {
                name: 'Button',
                totalTexts: 3,
                verified: 1,
                unverified: 2,
                cached: 0,
                unverifiedOutcomes: [unverifiedOutcome],
            },
        ]);

        const output = renderReport(report);

        expect(output).toContain('## Unverified Details');
        expect(output).toContain('### Button:(description)');
        expect(output).toContain('Reason: `quality_gate_failed`');
        expect(output).toContain('Output: `Button 컴포넌트.`');
        expect(output).toContain('MQM errors');
        expect(output).toContain('어색합니다.');
    });
});

describe('writeReport', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = makeTmpDir();
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('writes .i18n-report.md to outputDir', () => {
        const report = buildReport([
            {
                name: 'Button',
                totalTexts: 2,
                verified: 2,
                unverified: 0,
                cached: 0,
                unverifiedOutcomes: [],
            },
        ]);
        writeReport(report, tmpDir);
        const filePath = path.join(tmpDir, '.i18n-report.md');
        expect(fs.existsSync(filePath)).toBe(true);
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('Translation Quality Report');
        expect(content).toContain('Button');
    });

    it('warns and does not throw when write fails', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const readonlyDir = path.join(tmpDir, 'readonly');
        fs.writeFileSync(readonlyDir, '');
        try {
            const report = buildReport([]);
            expect(() => writeReport(report, readonlyDir)).not.toThrow();
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[report]'));
        } finally {
            warnSpy.mockRestore();
            fs.rmSync(readonlyDir);
        }
    });
});

describe('buildComponentReports', () => {
    const props: TranslatableDoc[] = [
        {
            name: 'Button',
            displayName: 'Button',
            description: 'A button component.',
            props: [{ name: 'size', description: 'Controls the size.' }, { name: 'disabled' }],
        },
    ];

    const units: TranslationUnit[] = [
        {
            kind: 'component.description',
            componentDisplayName: 'Button',
            source: 'A button component.',
        },
        {
            kind: 'prop.description',
            componentDisplayName: 'Button',
            propName: 'size',
            source: 'Controls the size.',
        },
    ];

    it('summarizes verified, unverified, and cached outcomes per component', () => {
        const outcomes = new Map<string, TranslationOutcome>([
            [
                'A button component.',
                {
                    translated: '캐시된 번역',
                    assurance: 'verified',
                    reportable: false,
                    reason: 'cache_hit',
                    errors: [],
                    violations: [],
                },
            ],
            [
                'Controls the size.',
                {
                    translated: '크기를 지정합니다.',
                    assurance: 'unverified',
                    reportable: false,
                    reason: 'batch_mqm_failed',
                    errors: [],
                    violations: [],
                },
            ],
        ]);

        expect(buildComponentReports(props, units, outcomes)).toEqual([
            {
                name: 'Button',
                totalTexts: 2,
                verified: 1,
                unverified: 1,
                cached: 1,
                unverifiedOutcomes: [],
            },
        ]);
    });
});
