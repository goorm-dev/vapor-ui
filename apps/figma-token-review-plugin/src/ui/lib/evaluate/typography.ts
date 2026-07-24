import type { Conformant, TypographyUsage, Violation } from '~/common/schemas';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

function suggestByFontSize(fontSize: number | null, schema: TextStyleSchema): string[] {
    if (fontSize == null) return [];
    return schema.order.filter((name) => schema.styles[name].fontSize === fontSize);
}

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
            const fontSize = typeof u.resolved.fontSize === 'number' ? u.resolved.fontSize : null;
            violations.push({
                ...base,
                type: 'typo-raw',
                severity: 'high',
                message: `Text Style이 바인딩되지 않은 raw 텍스트입니다 ("${u.characters}").`,
                suggested: suggestByFontSize(fontSize, schema),
            });
            continue;
        }

        if (u.appliedStatus === 'styled-override') {
            violations.push({
                ...base,
                type: 'typo-styled-override',
                severity: 'info',
                message: `Text Style "${u.textStyle}" 적용 후 ${u.overriddenFields.join(', ')} 필드가 오버라이드되었습니다.`,
                suggested: u.textStyle ? [u.textStyle] : [],
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

        // 결정론 뷰포트 규칙: mobile 뷰포트에서 display* 스타일은 즉시 FAIL.
        // 프롬프트가 LLM 에게 요구하던 "mobile → display* viewport FAIL" 규칙을 결정론에서 처리.
        if (
            u.textStyle &&
            u.viewport === 'mobile' &&
            u.textStyle.startsWith('display') &&
            u.textStyle in schema.styles
        ) {
            violations.push({
                ...base,
                type: 'typo-viewport-misfit',
                severity: 'high',
                message: `mobile 뷰포트에서 ${u.textStyle}은 부적합. heading1 또는 heading2 사용을 권장.`,
                suggested: ['heading1', 'heading2'].filter((s) => s in schema.styles),
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
