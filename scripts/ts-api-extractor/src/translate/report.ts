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
    /** LLM 호출 실패로 검증/재번역이 degraded 처리된 텍스트 수 */
    degradedCount: number;
}

export interface TranslationReport {
    generatedAt: string;
    totalComponents: number;
    totalTexts: number;
    initialFailCount: number;
    finalFailCount: number;
    /** 전체 degraded 텍스트 수 */
    totalDegradedCount: number;
    components: ComponentReport[];
}

export function buildReport(components: ComponentReport[]): TranslationReport {
    return {
        generatedAt: new Date().toISOString(),
        totalComponents: components.length,
        totalTexts: components.reduce((sum, c) => sum + c.totalTexts, 0),
        initialFailCount: components.reduce((sum, c) => sum + c.initial.failCount, 0),
        finalFailCount: components.reduce((sum, c) => sum + c.final.failCount, 0),
        totalDegradedCount: components.reduce((sum, c) => sum + c.degradedCount, 0),
        components,
    };
}

function sanitizeMarkdown(s: string): string {
    return s
        .replace(/[\r\n]+/g, ' ')
        .replace(/[#\-*_>`[\]()+]/g, (c) => `\\${c}`)
        .trim();
}

function escapeTableCell(s: string): string {
    return sanitizeMarkdown(s).replace(/\|/g, '\\|');
}

function inlineCodeCell(value: string): string {
    const normalized = value.replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|').trim();
    const longest = Math.max(0, ...(normalized.match(/`+/g)?.map((m) => m.length) ?? [0]));
    const fence = '`'.repeat(longest + 1);
    const pad = normalized.startsWith('`') || normalized.endsWith('`') ? ' ' : '';
    return `${fence}${pad}${normalized}${pad}${fence}`;
}

function renderErrorRows(errors: MqmError[]): string[] {
    return errors.map((e) => {
        const sourceSpan = inlineCodeCell(e.source_span);
        const mtSpan = inlineCodeCell(e.mt_span);
        const explanation = escapeTableCell(e.explanation);
        return `| ${e.severity.toUpperCase()} | ${e.category} | ${sourceSpan} | ${mtSpan} | ${explanation} |`;
    });
}

function renderStageTable(label: string, stage: MqmStageReport, totalTexts: number): string[] {
    const status =
        stage.failCount === 0
            ? `${label}: PASS`
            : `${label}: FAIL (${stage.failCount}/${totalTexts})`;

    if (stage.errors.length === 0) {
        return [`### ${status}`];
    }

    return [
        `### ${status}`,
        '',
        '| Severity | Category | Source | MT | Explanation |',
        '|---|---|---|---|---|',
        ...renderErrorRows(stage.errors),
    ];
}

function renderComponentSummary(c: ComponentReport): string {
    const status = c.final.failCount === 0 ? 'PASS' : 'FAIL';
    return `| ${c.name} | ${c.initial.failCount}/${c.totalTexts} | ${c.final.failCount}/${c.totalTexts} | ${status} |`;
}

function renderComponentDetails(c: ComponentReport, open = false): string {
    const summary =
        c.final.failCount === 0
            ? `${c.name} — Initial FAIL (${c.initial.failCount}/${c.totalTexts}), Final PASS`
            : `${c.name} — Final FAIL (${c.final.failCount}/${c.totalTexts}), Initial FAIL (${c.initial.failCount}/${c.totalTexts})`;
    const lines = [`<details${open ? ' open' : ''}>`, `<summary>${summary}</summary>`, ''];

    lines.push(...renderStageTable('Initial MQM', c.initial, c.totalTexts));
    lines.push('', ...renderStageTable('Final MQM', c.final, c.totalTexts));
    lines.push('', '</details>');

    return lines.join('\n');
}

export function renderReport(report: TranslationReport): string {
    const passRate =
        report.totalTexts > 0
            ? (((report.totalTexts - report.finalFailCount) / report.totalTexts) * 100).toFixed(1)
            : '100.0';
    const finalFailures = report.components.filter((component) => component.final.failCount > 0);
    const recovered = report.components.filter(
        (component) => component.initial.failCount > 0 && component.final.failCount === 0,
    );
    const cleanPasses = report.components.filter(
        (component) => component.initial.failCount === 0 && component.final.failCount === 0,
    );

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
        `| LLM degraded (no validation) | ${report.totalDegradedCount} |`,
        '',
        '## Component Summary',
        '',
        '| Component | Initial | Final | Status |',
        '|---|---:|---:|---|',
        ...report.components.map(renderComponentSummary),
        '',
        '## Final Failures',
        '',
        ...(finalFailures.length > 0
            ? finalFailures.map((component) => renderComponentDetails(component, true))
            : ['No final MQM failures.']),
        '',
        '## Recovered After Postprocess',
        '',
        ...(recovered.length > 0
            ? recovered.map((component) => renderComponentDetails(component))
            : ['No recovered MQM failures.']),
        '',
        '## Passed Without MQM Errors',
        '',
        ...(cleanPasses.length > 0
            ? [
                  '| Component | Texts |',
                  '|---|---:|',
                  ...cleanPasses.map(
                      (component) => `| ${component.name} | ${component.totalTexts} |`,
                  ),
              ]
            : ['No components passed without MQM errors.']),
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
