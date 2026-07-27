import type { Conformant, RadiusUsage, Violation } from '~/common/schemas';
import type { TokenValueIndex } from '~/ui/lib/loaders/dimension';

export function evaluateRadius(
    usages: RadiusUsage[],
    schema: TokenValueIndex,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const displayToken = u.appliedToken ?? u.token;
        const base = {
            nodeId: u.nodeId,
            name: u.name,
            property: 'borderRadius' as const,
            token: displayToken,
            value: u.value,
            origin: 'rule' as const,
            message: '',
            suggested: [] as string[],
            wasDs: u.wasDs,
        };

        if (u.tokenStatus === 'raw') {
            violations.push({
                ...base,
                token: null,
                type: 'token-not-used',
                severity: 'high',
                message: `borderRadius에 raw value(${u.value})가 직접 입력되었습니다.`,
            });
            continue;
        }

        if (u.tokenStatus === 'unknown' || !u.token || !(u.token in schema.tokens)) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                message: 'borderRadius 스키마에 등록되지 않은 토큰입니다.',
            });
            continue;
        }

        conformant.push({
            nodeId: u.nodeId,
            name: u.name,
            property: 'borderRadius',
            token: u.token,
        });
    }

    return { violations, conformant };
}
