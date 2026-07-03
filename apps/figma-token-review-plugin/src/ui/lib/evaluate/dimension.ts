import type { Conformant, DimensionUsage, Violation } from '~/common/schemas';
import type { TokenValueIndex } from '~/ui/lib/loaders/dimension';

export function evaluateDimension(
    usages: DimensionUsage[],
    schema: TokenValueIndex,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const base = {
            nodeId: u.nodeId,
            name: u.name,
            property: u.property,
            token: u.token,
            value: u.value,
            detail: '',
            suggested: [] as string[],
        };

        if (u.tokenStatus === 'raw') {
            violations.push({
                ...base,
                type: 'token-not-used',
                severity: 'high',
                detail: `${u.property}에 raw value(${u.value})가 직접 입력되었습니다.`,
            });
            continue;
        }

        if (u.tokenStatus === 'unknown' || !u.token || !(u.token in schema.tokens)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                detail: 'dimension 스키마에 등록되지 않은 토큰입니다.',
            });
            continue;
        }

        conformant.push({ nodeId: u.nodeId, name: u.name, property: u.property, token: u.token });
    }

    return { violations, conformant };
}
