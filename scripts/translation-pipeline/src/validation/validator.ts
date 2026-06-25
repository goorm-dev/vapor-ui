import type { MqmCategory, MqmError } from '~/types';

export const MQM_EVALUATOR_PROMPT = `You are a design-system documentation translation quality evaluator. Respond ONLY with a single JSON object — no explanation, no markdown, no code fences.

Evaluate the Korean translation of a JSDoc comment using the MQM taxonomy below. For each error, return the exact substring from the source (source_span) and the exact substring from the translation (mt_span) that contains the error.

Use one of these categories exactly:

Standard dimensions:
- Terminology/Component name inconsistency — PascalCase component names (e.g. Breadcrumb, Button, TextInput) are translated, romanized, or rendered inconsistently; the original English spelling must be preserved exactly
- Terminology/Token name altered — design token names are translated, altered, or normalized
- Terminology/Prop name mistranslated — camelCase prop names (e.g. asChild, onClick, isDisabled) or quoted enum values (e.g. "sm", "ghost") are translated, romanized, or altered; HTML/ARIA attributes (e.g. aria-label, data-state) must also be preserved exactly
- Accuracy/Mistranslation — source meaning is distorted or communicated differently
- Accuracy/Omission — important source information is missing
- Accuracy/Addition — information not present in the source is added
- Fluency/Unnatural phrasing — grammatically valid but awkward literal phrasing. Flag these patterns even if grammatically correct: "~를 제어합니다" (prefer "~지정합니다" or "~설정합니다"), "~를 수행합니다" (use a direct verb), "~에 적용되는" (prefer "~에 줄"), "~를 반환하는 함수입니다" (prefer dropping final 이다), abstract-noun subjects where the component or developer should be the subject
- Fluency/Style inconsistency — tone and voice are inconsistent within the docs
- Fluency/Grammatical error — grammar error in Korean

Design-system specific dimensions:
- Markup & Code/Code block translated — text inside code blocks or inline code is translated or altered
- Markup & Code/Link / anchor broken — hrefs, anchors, or link targets are damaged
- Markup & Code/Markdown structure altered — heading, table, list, emphasis, or inline-code structure is changed
- Cross-reference/Inter-page inconsistency — the same term is translated differently across pages
- Cross-reference/See also mismatch — related-document link text no longer matches its target
- Locale/Number / unit format — number or unit formatting is wrong for Korean docs
- Locale/Directional text — LTR/RTL directionality is broken

Severity:
- critical: a developer could implement incorrectly, or a mandatory rule is violated. Examples: prop/type mistranslation, code block translation, broken markdown/code structure.
- major: seriously harms understanding or trust. Examples: behavior description distorted, important explanation omitted, non-source content added.
- minor: lowers expression quality but does not block understanding. Examples: awkward literal phrasing, typo, style inconsistency.

Write explanation in Korean. Keep category and severity values in English exactly as specified.
If no errors exist, return errors as an empty array.`;

// MqmCategory 유니온에서 파생 — 카테고리 추가/삭제는 types.ts 한 곳에서만
export const MQM_CATEGORY_VALUES = [
    'Terminology/Component name inconsistency',
    'Terminology/Token name altered',
    'Terminology/Prop name mistranslated',
    'Accuracy/Mistranslation',
    'Accuracy/Omission',
    'Accuracy/Addition',
    'Fluency/Unnatural phrasing',
    'Fluency/Style inconsistency',
    'Fluency/Grammatical error',
    'Markup & Code/Code block translated',
    'Markup & Code/Link / anchor broken',
    'Markup & Code/Markdown structure altered',
    'Cross-reference/Inter-page inconsistency',
    'Cross-reference/See also mismatch',
    'Locale/Number / unit format',
    'Locale/Directional text',
] satisfies MqmCategory[];

export const MQM_SEVERITY_VALUES = ['minor', 'major', 'critical'] satisfies MqmError['severity'][];

const MQM_CATEGORIES: Set<MqmCategory> = new Set(MQM_CATEGORY_VALUES);
const MQM_SEVERITIES = new Set<MqmError['severity']>(MQM_SEVERITY_VALUES);

export function isMqmError(value: unknown): value is MqmError {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const error = value as Record<string, unknown>;
    return (
        typeof error.category === 'string' &&
        MQM_CATEGORIES.has(error.category as MqmError['category']) &&
        typeof error.severity === 'string' &&
        MQM_SEVERITIES.has(error.severity as MqmError['severity']) &&
        typeof error.source_span === 'string' &&
        error.source_span.trim().length > 0 &&
        typeof error.mt_span === 'string' &&
        error.mt_span.trim().length > 0 &&
        typeof error.explanation === 'string'
    );
}
