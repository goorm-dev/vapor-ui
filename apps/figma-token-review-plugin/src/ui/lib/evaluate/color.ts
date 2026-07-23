import type { ColorUsage, Conformant, Property, Violation } from '~/common/schemas';
import type { ColorSchema } from '~/ui/lib/loaders/color';
import { suggestLegacyReplacement } from '~/ui/lib/loaders/legacy-color';
import { PROPERTY_SCOPE } from '~/ui/lib/scope';

/**
 * primitive 토큰 키 판별. regex 로 grade 유무를 추정하지 않고 loader 가 만든 primitive 사전을 조회한다.
 * grade 있는 스케일(color-red-100 등)뿐 아니라 grade 없는 원자 primitive(color-white / color-black 등)도 커버.
 */
function isPrimitiveKey(token: string, schema: ColorSchema): boolean {
    return token in schema.primitive;
}

/**
 * ColorUsage.property (ColorProperty = 'fill' | 'stroke' | 'text') 를
 * Violation.property (Property) 로 변환.
 * TEXT/VECTOR 노드의 색상 = 'fill-on-text', 그 외 fill = 'fill', 그 외 = 'stroke'.
 */
function effectiveProperty(u: ColorUsage): Property {
    if (u.property === 'text') return 'fill-on-text';
    if (u.property === 'fill') return 'fill';
    return 'stroke';
}

/**
 * ColorUsage 배열을 결정론으로 판정한다.
 *
 * 판정 순서 (앞 단계에서 해결되면 이후 단계는 건너뜀):
 * 1. raw         → token-not-used (high)
 * 2. unknown     → unknown-token (high)
 * 3. primitive   → conformant (warning 제외)
 * 4. 스키마 미등록 → unknown-token (high)
 * 5. do-not-use  → do-not-use (high)
 * 6. role 불일치  → role-mismatch (high)
 * 7. fg-grade    → fg-grade-mismatch (high) / fg-grade-ambiguous (info)
 * 8. 통과         → conformant
 */
export function evaluateColor(
    usages: ColorUsage[],
    schema: ColorSchema,
): { violations: Violation[]; conformant: Conformant[] } {
    const violations: Violation[] = [];
    const conformant: Conformant[] = [];

    for (const u of usages) {
        const property = effectiveProperty(u);
        const value = u.hex;
        const legacy = suggestLegacyReplacement({ token: u.token, hex: u.hex, property });
        const suggested: string[] = legacy ? [legacy] : [];
        const base = {
            nodeId: u.nodeId,
            nodeIds: u.nodeIds,
            count: u.count,
            name: u.name,
            property,
            token: u.token,
            value,
            origin: 'rule' as const,
            message: '',
            suggested,
        };

        // 1. raw: 변수 바인딩 없이 직접 입력된 색상
        if (u.tokenStatus === 'raw') {
            violations.push({
                ...base,
                type: 'token-not-used',
                severity: 'high',
                message: '변수에 바인딩되지 않은 색이 직접 입력되었습니다.',
            });
            continue;
        }

        // 2. unknown: 바인딩은 있으나 semantic 단계 미도달
        if (u.tokenStatus === 'unknown') {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                message: '바인딩된 변수가 스키마의 semantic 단계에 도달하지 못했습니다.',
            });
            continue;
        }

        // token 이 없으면 판정 불가 — 건너뜀
        if (!u.token) continue;

        // 3. primitive 토큰 직접 사용 — warning 대상에서 제외.
        //    semantic 을 우회한 사용이지만 이슈로 잡지 않고 conformant 로 통과시킨다.
        if (isPrimitiveKey(u.token, schema) && !schema.semantic[u.token]) {
            conformant.push({
                nodeId: u.nodeId,
                nodeIds: u.nodeIds,
                name: u.name,
                property,
                token: u.token,
            });
            continue;
        }

        // 4. 스키마 미등록 토큰
        const meta = schema.semantic[u.token];
        if (!meta) {
            violations.push({
                ...base,
                type: 'unknown-token',
                severity: 'high',
                message: '스키마에 없는 토큰 키입니다.',
            });
            continue;
        }

        // 5. do-not-use 토큰
        if (meta.status === 'do-not-use') {
            violations.push({
                ...base,
                type: 'do-not-use',
                severity: 'high',
                message: '사용이 권장되지 않는 토큰입니다(do-not-use).',
            });
            continue;
        }

        // 6. role mismatch — PROPERTY_SCOPE 기반
        const allowedRoles =
            (PROPERTY_SCOPE as Record<string, ReadonlyArray<string>>)[property] ?? [];
        if (meta.role && !allowedRoles.includes(meta.role)) {
            violations.push({
                ...base,
                type: 'role-mismatch',
                severity: 'high',
                message: `${property} 속성에는 ${allowedRoles.join('/')} role만 허용됩니다 (적용: ${meta.role}).`,
            });
            continue;
        }

        // 7. fg-grade 검사 (gradeRule 있는 foreground + fill-on-text + background 정보 있을 때만)
        //    스키마의 gradeRules 상속으로 loader 가 gradeRule.other 을 채운 토큰만 검사 대상.
        //    - grade '100' 은 pure white / transparent 배경 전용
        //    - grade '200' 은 non-white 배경 전용
        if (
            meta.role === 'foreground' &&
            property === 'fill-on-text' &&
            u.background &&
            meta.gradeRule
        ) {
            const kind = u.background.kind;
            const grade = meta.gradeRule.other;
            if (kind === 'ambiguous') {
                violations.push({
                    ...base,
                    type: 'fg-grade-ambiguous',
                    severity: 'info',
                    message: '배경 식별이 모호해 fg grade 짝 확인이 보류되었습니다.',
                });
                continue;
            }
            if (kind === 'other' && grade === '100') {
                violations.push({
                    ...base,
                    type: 'fg-grade-mismatch',
                    severity: 'high',
                    message: '색상이 있는 배경에서는 foreground 200 grade 사용을 고려하세요.',
                });
                continue;
            }
            if ((kind === 'white' || kind === 'transparent') && grade === '200') {
                violations.push({
                    ...base,
                    type: 'fg-grade-mismatch',
                    severity: 'high',
                    message: '순백/투명 배경에서는 foreground 100 grade 사용을 고려하세요.',
                });
                continue;
            }
        }

        // 8. 통과 → conformant
        conformant.push({
            nodeId: u.nodeId,
            nodeIds: u.nodeIds,
            name: u.name,
            property,
            token: u.token,
        });
    }

    return { violations, conformant };
}
