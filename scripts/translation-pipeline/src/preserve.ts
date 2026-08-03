import type { PreservationViolation } from '~/domain';

const BACKTICK_SPAN = /`[^`\n]+`/g;
const URL = /https?:\/\/[^\s)>\]"']+/g;
const MULTI_HUMP_IDENTIFIER = /\b[A-Za-z][a-z0-9]*(?:[A-Z][a-z0-9]*)+\b/g;
const MARKDOWN_LINE_MARKER = /^\s*(#{1,6}|[-*+]|\d+\.|>|\|)(?=\s|\|)/;

function unique(values: string[]): string[] {
    return [...new Set(values)];
}

function stripBacktickSpans(text: string): string {
    return text.replace(BACKTICK_SPAN, ' ');
}

function markdownSignature(text: string): string {
    const markers = text
        .split('\n')
        .map((line) => line.match(MARKDOWN_LINE_MARKER)?.[1] ?? '')
        .filter(Boolean);
    const fences = (text.match(/```/g) ?? []).length;
    return `${markers.join('|')}::${fences}`;
}

export function checkPreservation(source: string, translated: string): PreservationViolation[] {
    const violations: PreservationViolation[] = [];

    for (const span of unique(source.match(BACKTICK_SPAN) ?? [])) {
        if (!translated.includes(span)) {
            violations.push({ rule: 'backtick_span', expected: span });
        }
    }

    const urls = unique(source.match(URL) ?? []).map((url) => url.replace(/[.,;:!?]+$/, ''));
    for (const url of urls) {
        if (!translated.includes(url)) {
            violations.push({ rule: 'url', expected: url });
        }
    }

    const bareSource = stripBacktickSpans(source);
    for (const identifier of unique(bareSource.match(MULTI_HUMP_IDENTIFIER) ?? [])) {
        if (!translated.includes(identifier)) {
            violations.push({ rule: 'identifier', expected: identifier });
        }
    }

    const expectedSignature = markdownSignature(source);
    if (markdownSignature(translated) !== expectedSignature) {
        violations.push({ rule: 'markdown_structure', expected: expectedSignature });
    }

    return violations;
}

export function describeViolation(violation: PreservationViolation): string {
    switch (violation.rule) {
        case 'backtick_span':
            return `인라인 코드 \`${violation.expected}\`가 번역문에 그대로 남아 있지 않습니다.`;
        case 'url':
            return `URL ${violation.expected}이 변형됐습니다.`;
        case 'identifier':
            return `식별자 ${violation.expected}가 번역·변형됐습니다. 원문 철자를 그대로 쓰세요.`;
        case 'markdown_structure':
            return `마크다운 구조가 달라졌습니다. 원문 구조: ${violation.expected}`;
    }
}
