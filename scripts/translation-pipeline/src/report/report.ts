import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
    type MqmError,
    type TranslatableDoc,
    type TranslationOutcome,
    type TranslationUnit,
    getTranslationUnitKey,
} from '~/types';

export interface ComponentReport {
    name: string;
    totalTexts: number;
    verified: number;
    unverified: number;
    cached: number;
    unverifiedOutcomes: TranslationOutcome[];
}

export interface BatchFallbackReportEntry {
    componentName: string;
    reason: string;
}

export interface TranslationReport {
    generatedAt: string;
    totalComponents: number;
    totalTexts: number;
    verifiedCount: number;
    unverifiedCount: number;
    cachedCount: number;
    /** 실행 전체 PASS율 (verified / total) */
    passRate: number;
    /** 실패 사유별 건수 */
    reasonCounts: Record<string, number>;
    /** MQM 카테고리별 오류 건수 */
    categoryCounts: Record<string, number>;
    /** 결정론 보존 규칙별 위반 건수 */
    violationCounts: Record<string, number>;
    components: ComponentReport[];
    batchFallbacks: BatchFallbackReportEntry[];
}

export function buildComponentReports(
    props: TranslatableDoc[],
    units: TranslationUnit[],
    outcomes: Map<string, TranslationOutcome>,
): ComponentReport[] {
    return props.map((component, componentIndex) => {
        const componentUnits = units.filter((unit) => unit.componentIndex === componentIndex);
        const componentOutcomes = componentUnits
            .map((unit) => outcomes.get(getTranslationUnitKey(unit)) ?? outcomes.get(unit.id))
            .filter((outcome): outcome is TranslationOutcome => outcome !== undefined);

        return {
            name: component.name,
            totalTexts: componentUnits.length,
            verified: componentOutcomes.filter((outcome) => outcome.assurance === 'verified')
                .length,
            unverified: componentOutcomes.filter((outcome) => outcome.assurance === 'unverified')
                .length,
            cached: componentOutcomes.filter((outcome) => outcome.reason === 'cache_hit').length,
            unverifiedOutcomes: componentOutcomes.filter(
                (outcome) => outcome.assurance === 'unverified' && outcome.reportable,
            ),
        };
    });
}

function tally(values: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const value of values) {
        counts[value] = (counts[value] ?? 0) + 1;
    }
    return counts;
}

export function buildReport(
    components: ComponentReport[],
    batchFallbacks: BatchFallbackReportEntry[] = [],
): TranslationReport {
    const totalTexts = components.reduce((sum, component) => sum + component.totalTexts, 0);
    const verifiedCount = components.reduce((sum, component) => sum + component.verified, 0);
    const reportedOutcomes = components.flatMap((component) => component.unverifiedOutcomes);

    return {
        generatedAt: new Date().toISOString(),
        totalComponents: components.length,
        totalTexts,
        verifiedCount,
        unverifiedCount: components.reduce((sum, component) => sum + component.unverified, 0),
        cachedCount: components.reduce((sum, component) => sum + component.cached, 0),
        passRate: totalTexts === 0 ? 1 : verifiedCount / totalTexts,
        reasonCounts: tally(reportedOutcomes.map((outcome) => outcome.reason)),
        categoryCounts: tally(
            reportedOutcomes.flatMap((outcome) =>
                (outcome.errors ?? []).map((error) => error.category),
            ),
        ),
        violationCounts: tally(
            reportedOutcomes.flatMap((outcome) =>
                (outcome.violations ?? []).map((violation) => violation.rule),
            ),
        ),
        components,
        batchFallbacks,
    };
}

function inlineCode(value: string): string {
    const normalized = value.replace(/[\r\n]+/g, ' ').trim();
    const longest = Math.max(0, ...(normalized.match(/`+/g)?.map((match) => match.length) ?? [0]));
    const fence = '`'.repeat(longest + 1);
    const pad = normalized.startsWith('`') || normalized.endsWith('`') ? ' ' : '';
    return `${fence}${pad}${normalized}${pad}${fence}`;
}

function escapeTableCell(value: string): string {
    return value
        .replace(/[\r\n]+/g, ' ')
        .replace(/\|/g, '\\|')
        .trim();
}

function renderMqmErrors(title: string, errors: MqmError[]): string[] {
    if (errors.length === 0) return [];
    return [
        `${title}:`,
        '',
        '| Severity | Category | Source | Output | Explanation |',
        '|---|---|---|---|---|',
        ...errors.map(
            (error) =>
                `| ${error.severity.toUpperCase()} | ${error.category} | ${inlineCode(
                    error.source_span,
                )} | ${inlineCode(error.mt_span)} | ${escapeTableCell(error.explanation)} |`,
        ),
    ];
}

function renderDistribution(title: string, counts: Record<string, number>): string[] {
    const rows = Object.entries(counts).sort(([, a], [, b]) => b - a);
    if (rows.length === 0) return [];
    return [
        `${title}:`,
        '',
        '| Key | Count |',
        '|---|---:|',
        ...rows.map(([key, count]) => `| ${key} | ${count} |`),
        '',
    ];
}

function renderUnverifiedDetail(component: ComponentReport, outcome: TranslationOutcome): string {
    const lines = [
        `### ${component.name} — ${outcome.id}`,
        '',
        `Reason: ${inlineCode(outcome.reason)}`,
        `Output: ${inlineCode(outcome.translated)}`,
    ];

    if (outcome.errors && outcome.errors.length > 0) {
        lines.push('', ...renderMqmErrors('MQM errors', outcome.errors));
    }

    if (outcome.violations && outcome.violations.length > 0) {
        lines.push(
            '',
            'Preservation violations:',
            '',
            ...outcome.violations.map(
                (violation) => `- ${violation.rule}: ${inlineCode(violation.expected)}`,
            ),
        );
    }

    return lines.join('\n');
}

export function renderReport(report: TranslationReport): string {
    const details = report.components.flatMap((component) =>
        component.unverifiedOutcomes.map((outcome) => renderUnverifiedDetail(component, outcome)),
    );

    const lines = [
        '# Translation Quality Report (MQM)',
        '',
        `Generated: ${report.generatedAt}`,
        '',
        '## Summary',
        '',
        '| Metric | Value |',
        '|---|---:|',
        `| Components | ${report.totalComponents} |`,
        `| Total texts | ${report.totalTexts} |`,
        `| Verified | ${report.verifiedCount} |`,
        `| Unverified | ${report.unverifiedCount} |`,
        `| Cached | ${report.cachedCount} |`,
        `| Pass rate | ${(report.passRate * 100).toFixed(1)}% |`,
        `| Batch fallbacks | ${report.batchFallbacks.length} |`,
        '',
        '## Failure Distribution',
        '',
        ...(Object.keys(report.reasonCounts).length === 0
            ? ['No reportable failures.']
            : [
                  ...renderDistribution('By reason', report.reasonCounts),
                  ...renderDistribution('By MQM category', report.categoryCounts),
                  ...renderDistribution('By preservation rule', report.violationCounts),
              ]),
        '',
        '## Batch Fallbacks',
        '',
        ...(report.batchFallbacks.length === 0
            ? ['None.']
            : [
                  `${report.batchFallbacks.length} chunk(s) were marked unverified.`,
                  '',
                  '| Component | Reason |',
                  '|---|---|',
                  ...report.batchFallbacks.map(
                      (entry) => `| ${entry.componentName} | ${escapeTableCell(entry.reason)} |`,
                  ),
              ]),
        '',
        '## Component Summary',
        '',
        '| Component | Total Texts | Verified | Unverified | Cached |',
        '|---|---:|---:|---:|---:|',
        ...report.components.map(
            (component) =>
                `| ${component.name} | ${component.totalTexts} | ${component.verified} | ${component.unverified} | ${component.cached} |`,
        ),
        '',
        '## Unverified Details',
        '',
        ...(details.length > 0 ? details : ['No reportable unverified translations.']),
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
