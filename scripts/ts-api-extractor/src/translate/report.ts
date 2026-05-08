import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { MqmError, TranslationOutcome } from '~/translate/types';

export interface ComponentReport {
    name: string;
    totalTexts: number;
    verified: number;
    unverified: number;
    cached: number;
    gateSkipped: number;
    unverifiedOutcomes: TranslationOutcome[];
}

export interface TranslationReport {
    generatedAt: string;
    totalComponents: number;
    totalTexts: number;
    verifiedCount: number;
    unverifiedCount: number;
    cachedCount: number;
    gateSkippedCount: number;
    components: ComponentReport[];
}

export function buildReport(components: ComponentReport[]): TranslationReport {
    return {
        generatedAt: new Date().toISOString(),
        totalComponents: components.length,
        totalTexts: components.reduce((sum, component) => sum + component.totalTexts, 0),
        verifiedCount: components.reduce((sum, component) => sum + component.verified, 0),
        unverifiedCount: components.reduce((sum, component) => sum + component.unverified, 0),
        cachedCount: components.reduce((sum, component) => sum + component.cached, 0),
        gateSkippedCount: components.reduce((sum, component) => sum + component.gateSkipped, 0),
        components,
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

function renderUnverifiedDetail(component: ComponentReport, outcome: TranslationOutcome): string {
    const lines = [
        `### ${component.name} — ${outcome.id}`,
        '',
        `Reason: ${inlineCode(outcome.reason)}`,
        `Source: ${inlineCode(outcome.source)}`,
        `Output: ${inlineCode(outcome.translated)}`,
    ];

    if (outcome.initialTranslation) {
        lines.push(`Initial translation: ${inlineCode(outcome.initialTranslation)}`);
    }

    const initialErrors = outcome.initialEvaluation?.errors ?? [];
    const finalErrors = outcome.finalEvaluation?.errors ?? [];
    if (initialErrors.length > 0) {
        lines.push('', ...renderMqmErrors('Initial MQM errors', initialErrors));
    }
    if (finalErrors.length > 0) {
        lines.push('', ...renderMqmErrors('Final MQM errors', finalErrors));
    }
    if (outcome.events.length > 0) {
        lines.push('', 'Events:', ...outcome.events.map((event) => `- ${event.message}`));
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
        `| Gate skipped | ${report.gateSkippedCount} |`,
        '',
        '## Component Summary',
        '',
        '| Component | Total Texts | Verified | Unverified | Cached | Gate Skipped |',
        '|---|---:|---:|---:|---:|---:|',
        ...report.components.map(
            (component) =>
                `| ${component.name} | ${component.totalTexts} | ${component.verified} | ${component.unverified} | ${component.cached} | ${component.gateSkipped} |`,
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
