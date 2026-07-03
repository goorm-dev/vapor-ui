import type { Conformant, TypographyUsage, Violation } from '~/common/schemas';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

export function evaluateTypography(
    usages: TypographyUsage[],
    schema: TextStyleSchema,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const base = {
            nodeId: u.nodeId,
            name: u.name,
            property: 'textStyle' as const,
            token: u.textStyle,
            value: null,
            origin: 'rule' as const,
            message: '',
            suggested: [] as string[],
        };

        if (u.appliedStatus === 'raw') {
            violations.push({
                ...base,
                type: 'typo-raw',
                severity: 'high',
                message: `Text Style이 바인딩되지 않은 raw 텍스트입니다 ("${u.characters}").`,
            });
            continue;
        }

        if (u.appliedStatus === 'styled-override') {
            violations.push({
                ...base,
                type: 'typo-styled-override',
                severity: 'info',
                message: `Text Style "${u.textStyle}" 적용 후 ${u.overriddenFields.join(', ')} 필드가 오버라이드되었습니다.`,
            });
            continue;
        }

        if (u.textStyle && !(u.textStyle in schema.styles)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                message: `등록되지 않은 Text Style 이름입니다: ${u.textStyle}.`,
            });
            continue;
        }

        if (u.textStyle) {
            conformant.push({
                nodeId: u.nodeId,
                name: u.name,
                property: 'textStyle',
                token: u.textStyle,
            });
        }
    }

    return { violations, conformant };
}
