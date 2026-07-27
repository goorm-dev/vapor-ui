import { passes } from '../engine/engine';
import { composite, tokenField } from '../engine/factories';
import type { EmissionOf, ExtractionRule } from '../engine/types';
import type { PaddingDir, PaddingField } from '../padding';
import { derivePaddingEmissions } from '../padding';
import { readBoundToken } from '../variables';

export const PADDING_FIELDS: readonly PaddingField[] = [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
];

/**
 * gap (itemSpacing) 단일 필드 추출 — tokenField 패턴.
 */
export const gapRule: ExtractionRule<'spaces'> = tokenField({
    name: 'space:gap',
    category: 'spaces',
    property: 'gap',
    field: 'itemSpacing',
});

/**
 * padding 4방향 추출 + derivePaddingEmissions 로 최소 표현 축약.
 * 팩토리 함수로 노출해 RULES 테이블에서 호출 시점에 인스턴스를 생성한다.
 */
export function paddingRule(): ExtractionRule<'spaces'> {
    return composite({
        name: 'space:padding',
        category: 'spaces',
        filterKeys: [...PADDING_FIELDS],
        read: async (node, ctx): Promise<EmissionOf['spaces'][]> => {
            const dirs: PaddingDir[] = [];

            for (const f of PADDING_FIELDS) {
                if (!passes(ctx.filter, f)) continue;
                const v = (node as unknown as Record<string, unknown>)[f];
                if (typeof v !== 'number') continue;

                const { token, appliedToken, status } = await readBoundToken(
                    node,
                    ctx.boundVariables,
                    f,
                );
                dirs.push({ field: f, value: v, token, appliedToken, status });
            }

            return derivePaddingEmissions(dirs).map(
                ({ property, source }) =>
                    ({
                        property,
                        value: `${source.value}px`,
                        token: source.token,
                        appliedToken: source.appliedToken,
                        tokenStatus: source.status,
                    }) as unknown as EmissionOf['spaces'],
            );
        },
    });
}
