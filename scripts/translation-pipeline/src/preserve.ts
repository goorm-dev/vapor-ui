import type { PreservationViolation } from '~/domain';

/**
 * 결정론 문자열 보존 체크 (KAN-10).
 *
 * LLM 판정은 문자열 단위에서 신뢰도가 낮다는 조사 결과(KAN-12)에 따라,
 * "틀리면 개발자가 잘못 구현하는" 종류의 오류는 LLM이 아니라 여기서 잡는다.
 */

const BACKTICK_SPAN = /`[^`\n]+`/g;
const URL = /https?:\/\/[^\s)>\]"']+/g;
// ponytail: 험프 2개 이상만 식별자로 본다. `Button`처럼 험프 하나인 컴포넌트명은
// 평범한 영어 단어(Whether, This)와 구별할 수 없어 일부러 흘려보낸다.
// 오탐이 문제되면 여기서 실제 컴포넌트·prop 이름 사전을 받도록 바꿀 것.
const MULTI_HUMP_IDENTIFIER = /\b[A-Za-z][a-z0-9]*(?:[A-Z][a-z0-9]*)+\b/g;
const MARKDOWN_LINE_MARKER = /^\s*(#{1,6}|[-*+]|\d+\.|>|\|)(?=\s|\|)/;

function unique(values: string[]): string[] {
    return [...new Set(values)];
}

function stripBacktickSpans(text: string): string {
    return text.replace(BACKTICK_SPAN, ' ');
}

/** 줄머리 마크다운 마커의 순서 + 코드펜스 개수 = 구조 시그니처 */
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

    // 문장 끝 구두점은 URL이 아니다
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
