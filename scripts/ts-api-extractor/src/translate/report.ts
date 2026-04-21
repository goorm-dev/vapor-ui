import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { MqmError } from '~/translate/types';

export interface ComponentReport {
    name: string;
    totalTexts: number;
    failCount: number;
    errors: MqmError[];
}

export interface TranslationReport {
    generatedAt: string;
    totalComponents: number;
    totalTexts: number;
    failCount: number;
    components: ComponentReport[];
}

export function buildReport(components: ComponentReport[]): TranslationReport {
    return {
        generatedAt: new Date().toISOString(),
        totalComponents: components.length,
        totalTexts: components.reduce((sum, c) => sum + c.totalTexts, 0),
        failCount: components.reduce((sum, c) => sum + c.failCount, 0),
        components,
    };
}

function sanitizeMarkdown(s: string): string {
    return s
        .replace(/[\r\n]+/g, ' ')
        .replace(/[#\-*_>`[\]()+]/g, (c) => `\\${c}`)
        .trim();
}

function renderComponentSection(c: ComponentReport): string {
    const status = c.failCount === 0 ? '✅ PASS' : `❌ FAIL (${c.failCount}/${c.totalTexts})`;
    const lines = [`### ${c.name} — ${status}`];

    if (c.errors.length > 0) {
        for (const e of c.errors) {
            const source = sanitizeMarkdown(e.source);
            const translation = sanitizeMarkdown(e.translation);
            const message = sanitizeMarkdown(e.message);
            lines.push(
                `- **[${e.severity.toUpperCase()} ${e.category}/${e.type}]** \`${source}\` → \`${translation}\`: ${message}`,
            );
        }
    }

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
        `| MQM failures | ${report.failCount} |`,
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
