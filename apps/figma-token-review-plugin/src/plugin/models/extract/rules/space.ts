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

export const gapRule: ExtractionRule<'spaces'> = tokenField({
    name: 'space:gap',
    category: 'spaces',
    property: 'gap',
    field: 'itemSpacing',
});

// 4방향 동시 참조로 shorthand 축약 — 방향별 tokenField 로 분리 불가.
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
