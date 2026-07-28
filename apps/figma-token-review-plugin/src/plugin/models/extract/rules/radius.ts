import type { TokenStatus } from '~/common/schemas';

import type { ExtractionRule } from '../engine/types';
import { readBoundToken } from '../variables';

export const RADIUS_BINDING_FIELDS = [
    'cornerRadius',
    'topLeftRadius',
    'topRightRadius',
    'bottomLeftRadius',
    'bottomRightRadius',
] as const;

/**
 * Figma uniform cornerRadius 는 boundVariables.cornerRadius 없이 corner 필드에
 * 바인딩될 수 있어 5개 필드를 우선순위대로 훑는다 — tokenField 로 못 쪼개는 이유.
 */
export function radiusRule(): ExtractionRule<'radii'> {
    return {
        name: 'radius',
        category: 'radii',
        filterKeys: RADIUS_BINDING_FIELDS,
        extract: async (node, ctx) => {
            const cr = (node as FrameNode).cornerRadius;
            if (typeof cr !== 'number') return [];

            let token: string | null = null;
            let appliedToken: string | null = null;
            let status: TokenStatus = 'raw';

            for (const cf of RADIUS_BINDING_FIELDS) {
                const r = await readBoundToken(node, ctx.boundVariables, cf);
                if (r.status !== 'raw') {
                    token = r.token;
                    appliedToken = r.appliedToken;
                    status = r.status;
                    break;
                }
            }

            return [{ value: `${cr}px`, token, appliedToken, tokenStatus: status }];
        },
    };
}
