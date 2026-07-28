/* eslint-disable @typescript-eslint/no-explicit-any -- Figma effect shape is intentionally loose. */
import type { ExtractionRule } from '../engine/types';
import { shadowToCss } from '../paint';
import { readEffectStyleToken } from '../variables';

/** 노드당 effectStyleId 는 1개 → 토큰 1회 조회로 모든 shadow 항목이 공유. */
export function shadowRule(): ExtractionRule<'shadows'> {
    return {
        name: 'shadow',
        category: 'shadows',
        filterKeys: ['effects', 'effectStyleId'],
        extract: async (node) => {
            const effects: any[] = Array.isArray((node as any).effects)
                ? (node as any).effects
                : [];
            const shadows = effects.filter(
                (eff: any) => eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW',
            );

            if (shadows.length === 0) return [];

            const { token, status } = await readEffectStyleToken(node);
            return shadows.map((eff: any) => ({
                value: shadowToCss(eff),
                token,
                tokenStatus: status,
            }));
        },
    };
}
