import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildReport, renderReport, writeReport } from '~/translate/report';
import type { ComponentReport, TranslationReport } from '~/translate/report';

function makeTmpDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'report-test-'));
}

describe('buildReport', () => {
    it('aggregates totalTexts and failCount across components', () => {
        const components: ComponentReport[] = [
            {
                name: 'Button',
                totalTexts: 5,
                failCount: 1,
                errors: [],
                initial: { failCount: 2, errors: [] },
                final: { failCount: 1, errors: [] },
            },
            {
                name: 'Avatar',
                totalTexts: 3,
                failCount: 0,
                errors: [],
                initial: { failCount: 0, errors: [] },
                final: { failCount: 0, errors: [] },
            },
        ];
        const report = buildReport(components);
        expect(report.totalComponents).toBe(2);
        expect(report.totalTexts).toBe(8);
        expect(report.failCount).toBe(1);
        expect(report.initialFailCount).toBe(2);
        expect(report.finalFailCount).toBe(1);
        expect(report.components).toBe(components);
    });

    it('handles empty component list', () => {
        const report = buildReport([]);
        expect(report.totalComponents).toBe(0);
        expect(report.totalTexts).toBe(0);
        expect(report.failCount).toBe(0);
        expect(report.initialFailCount).toBe(0);
        expect(report.finalFailCount).toBe(0);
    });

    it('sets generatedAt to a valid ISO timestamp', () => {
        const before = Date.now();
        const report = buildReport([]);
        const after = Date.now();
        const ts = new Date(report.generatedAt).getTime();
        expect(ts).toBeGreaterThanOrEqual(before);
        expect(ts).toBeLessThanOrEqual(after);
    });
});

describe('renderReport', () => {
    it('shows 100.0% pass rate when totalTexts is 0', () => {
        const report: TranslationReport = {
            generatedAt: '2026-04-21T00:00:00.000Z',
            totalComponents: 0,
            totalTexts: 0,
            failCount: 0,
            initialFailCount: 0,
            finalFailCount: 0,
            components: [],
        };
        const output = renderReport(report);
        expect(output).toContain('Pass rate | 100.0%');
    });

    it('calculates pass rate correctly for non-zero texts', () => {
        const report: TranslationReport = {
            generatedAt: '2026-04-21T00:00:00.000Z',
            totalComponents: 1,
            totalTexts: 10,
            failCount: 2,
            initialFailCount: 3,
            finalFailCount: 2,
            components: [
                {
                    name: 'Button',
                    totalTexts: 10,
                    failCount: 2,
                    errors: [],
                    initial: { failCount: 3, errors: [] },
                    final: { failCount: 2, errors: [] },
                },
            ],
        };
        const output = renderReport(report);
        expect(output).toContain('Pass rate | 80.0%');
    });

    it('renders PASS status for component with no failures', () => {
        const report: TranslationReport = {
            generatedAt: '2026-04-21T00:00:00.000Z',
            totalComponents: 1,
            totalTexts: 3,
            failCount: 0,
            initialFailCount: 1,
            finalFailCount: 0,
            components: [
                {
                    name: 'Avatar',
                    totalTexts: 3,
                    failCount: 0,
                    errors: [],
                    initial: { failCount: 1, errors: [] },
                    final: { failCount: 0, errors: [] },
                },
            ],
        };
        const output = renderReport(report);
        expect(output).toContain('| Avatar | 1/3 | 0/3 | PASS |');
        expect(output).toContain('## Recovered After Postprocess');
        expect(output).toContain('<summary>Avatar — Initial FAIL (1/3), Final PASS</summary>');
    });

    it('renders FAIL status with error details for component with failures', () => {
        const report: TranslationReport = {
            generatedAt: '2026-04-21T00:00:00.000Z',
            totalComponents: 1,
            totalTexts: 4,
            failCount: 1,
            initialFailCount: 2,
            finalFailCount: 1,
            components: [
                {
                    name: 'Dialog',
                    totalTexts: 4,
                    failCount: 1,
                    errors: [
                        {
                            severity: 'major',
                            category: 'Accuracy/Mistranslation',
                            source_span: 'Close',
                            mt_span: '닫기X',
                            explanation: 'Translation contains extraneous character',
                        },
                    ],
                    initial: {
                        failCount: 2,
                        errors: [
                            {
                                severity: 'major',
                                category: 'Accuracy/Addition',
                                source_span: 'Open',
                                mt_span: '열기 열기',
                                explanation: 'Duplicated phrase',
                            },
                        ],
                    },
                    final: {
                        failCount: 1,
                        errors: [
                            {
                                severity: 'major',
                                category: 'Accuracy/Mistranslation',
                                source_span: 'Close',
                                mt_span: '닫기X',
                                explanation: 'Translation contains extraneous character',
                            },
                        ],
                    },
                },
            ],
        };
        const output = renderReport(report);
        expect(output).toContain('## Component Summary');
        expect(output).toContain('| Dialog | 2/4 | 1/4 | FAIL |');
        expect(output).toContain('## Final Failures');
        expect(output).toContain(
            '<summary>Dialog — Final FAIL (1/4), Initial FAIL (2/4)</summary>',
        );
        expect(output).toContain('| Severity | Category | Source | MT | Explanation |');
        expect(output).toContain('| MAJOR | Accuracy/Mistranslation |');
        expect(output).toContain('`Close`');
        expect(output).toContain('extraneous character');
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
                failCount: 0,
                errors: [],
                initial: { failCount: 0, errors: [] },
                final: { failCount: 0, errors: [] },
            },
        ]);
        writeReport(report, tmpDir);
        const filePath = path.join(tmpDir, '.i18n-report.md');
        expect(fs.existsSync(filePath)).toBe(true);
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('Translation Quality Report');
        expect(content).toContain('Button');
    });

    it('creates intermediate directories if they do not exist', () => {
        const nested = path.join(tmpDir, 'deep', 'nested');
        const report = buildReport([]);
        writeReport(report, nested);
        expect(fs.existsSync(path.join(nested, '.i18n-report.md'))).toBe(true);
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
