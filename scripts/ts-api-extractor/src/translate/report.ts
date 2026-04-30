import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { MqmError } from '~/translate/types';

export interface MqmStageReport {
    failCount: number;
    errors: MqmError[];
}

export interface ComponentReport {
    name: string;
    totalTexts: number;
    initial: MqmStageReport;
    final: MqmStageReport;
    /** Final MQM failure count. Kept as a convenience alias for summary consumers. */
    failCount: number;
    /** Final MQM errors. Kept as a convenience alias for summary consumers. */
    errors: MqmError[];
}

export interface TranslationReport {
    generatedAt: string;
    totalComponents: number;
    totalTexts: number;
    initialFailCount: number;
    finalFailCount: number;
    /** Final MQM failure count. Kept for backward-compatible summary rendering. */
    failCount: number;
    components: ComponentReport[];
}

export function buildReport(components: ComponentReport[]): TranslationReport {
    return {
        generatedAt: new Date().toISOString(),
        totalComponents: components.length,
        totalTexts: components.reduce((sum, c) => sum + c.totalTexts, 0),
        initialFailCount: components.reduce((sum, c) => sum + c.initial.failCount, 0),
        finalFailCount: components.reduce((sum, c) => sum + c.final.failCount, 0),
        failCount: components.reduce((sum, c) => sum + c.final.failCount, 0),
        components,
    };
}

function sanitizeMarkdown(s: string): string {
    return s
        .replace(/[\r\n]+/g, ' ')
        .replace(/[#\-*_>`[\]()+]/g, (c) => `\\${c}`)
        .trim();
}

function renderErrors(errors: MqmError[]): string[] {
    return errors.map((e) => {
        const sourceSpan = sanitizeMarkdown(e.source_span);
        const mtSpan = sanitizeMarkdown(e.mt_span);
        const explanation = sanitizeMarkdown(e.explanation);
        return `- **[${e.severity.toUpperCase()} ${e.category}]** \`${sourceSpan}\` → \`${mtSpan}\`: ${explanation}`;
    });
}

function renderStage(label: string, stage: MqmStageReport, totalTexts: number): string[] {
    const status =
        stage.failCount === 0
            ? `${label}: PASS`
            : `${label}: FAIL (${stage.failCount}/${totalTexts})`;

    return [status, ...renderErrors(stage.errors)];
}

function renderComponentSection(c: ComponentReport): string {
    const status =
        c.final.failCount === 0 ? '✅ PASS' : `❌ FAIL (${c.final.failCount}/${c.totalTexts})`;
    const lines = [`### ${c.name} — ${status}`];

    lines.push('', ...renderStage('Initial MQM', c.initial, c.totalTexts));
    lines.push('', ...renderStage('Final MQM', c.final, c.totalTexts));

    return lines.join('\n');
}

export function renderReport(report: TranslationReport): string {
    const passRate =
        report.totalTexts > 0
            ? (((report.totalTexts - report.failCount) / report.totalTexts) * 100).toFixed(1)
            : '100.0';

    const lines = [
        '# Translation Quality Report (MQM)',
        '',
        `Generated: ${report.generatedAt}`,
        '',
        '## Summary',
        '',
        `| Metric | Value |`,
        `|--------|-------|`,
        `| Components | ${report.totalComponents} |`,
        `| Total texts | ${report.totalTexts} |`,
        `| Pass rate | ${passRate}% |`,
        `| Initial MQM failures | ${report.initialFailCount} |`,
        `| Final MQM failures | ${report.finalFailCount} |`,
        '',
        '## Per-component Results',
        '',
        ...report.components.map(renderComponentSection),
        '',
    ];

    return lines.join('\n');
}

export function writeReport(report: TranslationReport, outputDir: string): void {
    if (!outputDir) return;
    try {
        const filePath = join(outputDir, '.i18n-report.md');
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, renderReport(report), 'utf-8');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[report] Failed to write i18n report: ${message}`);
    }
}
