import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildReport, renderReport, writeReport } from '~/translate/report';
import type { ComponentReport, TranslationReport } from '~/translate/report';

function makeTmpDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'report-test-'));
}

const unverifiedOutcome = {
    id: 'component.description',
    source: 'A button component.',
    translated: 'Button 컴포넌트.',
    assurance: 'unverified' as const,
    reportable: true,
    reason: 'final_quality_gate_failed' as const,
    initialTranslation: 'Button component.',
    initialEvaluation: {
        verdict: 'FAIL' as const,
        errors: [
            {
                severity: 'major' as const,
                category: 'Accuracy/Mistranslation' as const,
                source_span: 'button',
                mt_span: 'component',
                explanation: '오역입니다.',
            },
        ],
    },
    finalEvaluation: {
        verdict: 'FAIL' as const,
        errors: [
            {
                severity: 'minor' as const,
                category: 'Fluency/Unnatural phrasing' as const,
                source_span: 'component',
                mt_span: '컴포넌트.',
                explanation: '어색합니다.',
            },
        ],
    },
    events: [{ stage: 'mqm' as const, message: 'Final MQM failed.' }],
};

describe('buildReport', () => {
    it('aggregates verified, unverified, cached, and gate-skipped counts', () => {
        const components: ComponentReport[] = [
            {
                name: 'Button',
                totalTexts: 5,
                verified: 3,
                unverified: 2,
                cached: 1,
                gateSkipped: 1,
                unverifiedOutcomes: [unverifiedOutcome],
            },
            {
                name: 'Divider',
                totalTexts: 0,
                verified: 0,
                unverified: 0,
                cached: 0,
                gateSkipped: 0,
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
            gateSkippedCount: 1,
            components,
        });
    });
});

describe('renderReport', () => {
    it('renders the ADR summary columns including components with zero units', () => {
        const report: TranslationReport = {
            generatedAt: '2026-05-08T00:00:00.000Z',
            totalComponents: 2,
            totalTexts: 2,
            verifiedCount: 1,
            unverifiedCount: 1,
            cachedCount: 0,
            gateSkippedCount: 0,
            components: [
                {
                    name: 'Button',
                    totalTexts: 2,
                    verified: 1,
                    unverified: 1,
                    cached: 0,
                    gateSkipped: 0,
                    unverifiedOutcomes: [unverifiedOutcome],
                },
                {
                    name: 'Divider',
                    totalTexts: 0,
                    verified: 0,
                    unverified: 0,
                    cached: 0,
                    gateSkipped: 0,
                    unverifiedOutcomes: [],
                },
            ],
        };

        const output = renderReport(report);

        expect(output).toContain(
            '| Component | Total Texts | Verified | Unverified | Cached | Gate Skipped |',
        );
        expect(output).toContain('| Button | 2 | 1 | 1 | 0 | 0 |');
        expect(output).toContain('| Divider | 0 | 0 | 0 | 0 | 0 |');
    });

    it('renders details only for reportable unverified outcomes', () => {
        const report = buildReport([
            {
                name: 'Button',
                totalTexts: 3,
                verified: 1,
                unverified: 2,
                cached: 0,
                gateSkipped: 1,
                unverifiedOutcomes: [unverifiedOutcome],
            },
        ]);

        const output = renderReport(report);

        expect(output).toContain('## Unverified Details');
        expect(output).toContain('### Button — component.description');
        expect(output).toContain('Reason: `final_quality_gate_failed`');
        expect(output).toContain('Source: `A button component.`');
        expect(output).toContain('Output: `Button 컴포넌트.`');
        expect(output).toContain('Initial translation: `Button component.`');
        expect(output).toContain('Initial MQM errors');
        expect(output).toContain('Final MQM errors');
        expect(output).toContain('Final MQM failed.');
        expect(output).not.toContain('quality_gate_disabled');
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

    it('does nothing when outputDir is empty string', () => {
        const report = buildReport([]);
        expect(() => writeReport(report, '')).not.toThrow();
    });

    it('writes .i18n-report.md to outputDir', () => {
        const report = buildReport([
            {
                name: 'Button',
                totalTexts: 2,
                verified: 2,
                unverified: 0,
                cached: 0,
                gateSkipped: 0,
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
