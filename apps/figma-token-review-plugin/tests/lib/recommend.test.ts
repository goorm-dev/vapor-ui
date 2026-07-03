import { describe, expect, it } from 'vitest';

import { loadColorSchema } from '~/ui/lib/loaders/color';
import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { applyRecommendations } from '~/ui/lib/recommend';
import type { Violation } from '~/common/schemas';

const colorSchema = loadColorSchema('light');
const dim = loadDimensionSchemas();

function v(partial: Partial<Violation>): Violation {
    return {
        nodeId: 'n',
        name: 's',
        property: 'fill',
        token: null,
        value: null,
        type: 'token-not-used',
        severity: 'high',
        detail: '',
        suggested: [],
        ...partial,
    };
}

// -----------------------------------------------------------------------
// Helper: find a hex that has at least one background-role semantic token
// -----------------------------------------------------------------------
function findBgHex(): { hex: string; tokens: string[] } {
    for (const [hex, tokens] of colorSchema.hexIndex) {
        const hasBg = tokens.some((t) => colorSchema.semantic[t]?.role === 'background');
        if (hasBg) return { hex, tokens: tokens.filter((t) => colorSchema.semantic[t]?.role === 'background') };
    }
    throw new Error('No background-role hex found in hexIndex');
}

describe('applyRecommendations', () => {
    // Case 1: Raw color → 동일 hex+스코프 semantic 후보
    it('raw color(token-not-used, fill)는 동일 hex + background role 토큰을 suggested에 담는다', () => {
        const { hex, tokens } = findBgHex();
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'fill', value: hex })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested.length).toBeGreaterThan(0);
        for (const s of out[0].suggested) {
            expect(tokens).toContain(s);
        }
    });

    // Case 1b: Raw color with no scope match → primitive fallback
    it('raw color(token-not-used)에서 scope 일치 없으면 동일 hex primitive 토큰 반환', () => {
        // Find a hex that exists in primitive but NOT in hexIndex (semantic) — or use a hex
        // that has only foreground semantics paired with a fill property (expects background).
        // Strategy: find any primitive hex that has ONLY foreground semantics.
        // If none, pick any primitive and a property whose allowed roles don't include any semantic for that hex.
        let testHex: string | null = null;
        let expectedPrimKey: string | null = null;

        for (const [primKey, primHex] of Object.entries(colorSchema.primitive)) {
            const semTokens = colorSchema.hexIndex.get(primHex.toLowerCase()) ?? [];
            // All semantic tokens for this hex must be foreground-only
            const allForeground = semTokens.length > 0 && semTokens.every(
                (t) => colorSchema.semantic[t]?.role === 'foreground',
            );
            if (allForeground) {
                testHex = primHex;
                expectedPrimKey = primKey;
                break;
            }
            // Or hex not in semantic at all (pure primitive)
            if (semTokens.length === 0) {
                testHex = primHex;
                expectedPrimKey = primKey;
                break;
            }
        }

        if (!testHex || !expectedPrimKey) return; // no suitable primitive found, skip

        // Use property 'fill' (expects 'background' role) — no foreground semantic will scope-match
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'fill', value: testHex })],
            { colorSchema, ...dim },
        );
        // Primitive key must appear in suggestions (primitive fallback path)
        expect(out[0].suggested).toContain(expectedPrimKey);
        // All suggested tokens must be primitive keys (not semantic paths)
        for (const s of out[0].suggested) {
            expect(colorSchema.semantic[s]).toBeUndefined();
        }
    });

    // Case 2: Raw dimension/space/radius/shadow → 동일 value 토큰
    it('raw space(token-not-used, padding)는 동일 value space 토큰을 suggested에 담는다', () => {
        const [[value]] = dim.space.valueToTokens.entries();
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'padding', value })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested.length).toBeGreaterThan(0);
        expect(dim.space.valueToTokens.get(value)).toEqual(expect.arrayContaining(out[0].suggested));
    });

    it('raw dimension(token-not-used, width)는 동일 value dimension 토큰을 suggested에 담는다', () => {
        const [[value]] = dim.dimension.valueToTokens.entries();
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'width', value })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested.length).toBeGreaterThan(0);
        expect(dim.dimension.valueToTokens.get(value)).toEqual(expect.arrayContaining(out[0].suggested));
    });

    it('raw borderRadius(token-not-used, borderRadius)는 동일 value borderRadius 토큰을 suggested에 담는다', () => {
        const [[value]] = dim.borderRadius.valueToTokens.entries();
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'borderRadius', value })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested.length).toBeGreaterThan(0);
        expect(dim.borderRadius.valueToTokens.get(value)).toEqual(expect.arrayContaining(out[0].suggested));
    });

    it('raw shadow(token-not-used, shadow)는 동일 value shadow 토큰을 suggested에 담는다', () => {
        const [[value]] = dim.shadow.valueToTokens.entries();
        const out = applyRecommendations(
            [v({ type: 'token-not-used', property: 'shadow', value })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested.length).toBeGreaterThan(0);
        expect(dim.shadow.valueToTokens.get(value)).toEqual(expect.arrayContaining(out[0].suggested));
    });

    // Case 3: Primitive-used → 동일 hex+스코프 semantic
    it('primitive-used(fill-on-text)는 동일 hex + foreground role 토큰을 suggested에 담는다', () => {
        // Find a primitive token that maps to a foreground semantic hex
        const fgEntry = Object.entries(colorSchema.semantic).find(
            ([, m]) => m.role === 'foreground' && m.hex && m.status !== 'do-not-use',
        );
        if (!fgEntry) return;
        const [fgToken, fgMeta] = fgEntry;
        const hex = fgMeta.hex!;
        // Build a primitive key whose value matches this hex
        const primitiveKey = Object.entries(colorSchema.primitive).find(([, v]) => v.toLowerCase() === hex.toLowerCase())?.[0];

        const out = applyRecommendations(
            [v({ type: 'primitive-used', property: 'fill-on-text', token: primitiveKey ?? 'colors.blue.600', value: hex })],
            { colorSchema, ...dim },
        );
        // Should suggest the matching foreground semantic token
        expect(out[0].suggested).toContain(fgToken);
    });

    // Case 4: Scope mismatch → 해당 property scope + 같은 위계(grade)
    it('role-mismatch(fill, foreground token .100)는 background role의 .100 토큰을 suggested에 담는다', () => {
        // token = colors.foreground.primary.100, property = fill (expects background)
        const token = 'colors.foreground.primary.100';
        const out = applyRecommendations(
            [v({ type: 'role-mismatch', property: 'fill', token })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested.length).toBeGreaterThan(0);
        for (const s of out[0].suggested) {
            const meta = colorSchema.semantic[s];
            expect(meta?.role).toBe('background');
            expect(s.endsWith('.100')).toBe(true);
        }
    });

    // Case 5: do-not-use → fallback chain (same-grade sibling)
    it('do-not-use(colors.background.secondary.100)는 동위계(grade=100) 다른 family background 토큰을 suggested에 담는다', () => {
        const token = 'colors.background.secondary.100';
        const out = applyRecommendations(
            [v({ type: 'do-not-use', property: 'fill', token })],
            { colorSchema, ...dim },
        );
        // Fallback #3: same grade (.100), same role (background), different family, not do-not-use
        expect(out[0].suggested.length).toBeGreaterThan(0);
        for (const s of out[0].suggested) {
            const meta = colorSchema.semantic[s];
            expect(meta?.status).not.toBe('do-not-use');
            expect(meta?.role).toBe('background');
            expect(s.endsWith('.100')).toBe(true);
            expect(s).not.toContain('background.secondary');
        }
    });

    // Case 6: fg-grade-mismatch → same family .200
    it('fg-grade-mismatch(.100 token)는 동일 family의 .200 토큰을 suggested에 담는다', () => {
        const token = 'colors.foreground.primary.100';
        const out = applyRecommendations(
            [v({ type: 'fg-grade-mismatch', property: 'fill-on-text', token })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested).toEqual(['colors.foreground.primary.200']);
    });

    it('fg-grade-mismatch(.200 token)는 suggested가 []', () => {
        const token = 'colors.foreground.primary.200';
        const out = applyRecommendations(
            [v({ type: 'fg-grade-mismatch', property: 'fill-on-text', token })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested).toEqual([]);
    });

    // Case 7: Unknown / fg-grade-ambiguous / typo-raw / typo-styled-override → []
    it('unknown-token은 suggested가 []', () => {
        const out = applyRecommendations([v({ type: 'unknown-token' })], { colorSchema, ...dim });
        expect(out[0].suggested).toEqual([]);
    });

    it('fg-grade-ambiguous는 suggested가 []', () => {
        const out = applyRecommendations([v({ type: 'fg-grade-ambiguous' })], { colorSchema, ...dim });
        expect(out[0].suggested).toEqual([]);
    });

    it('typo-raw는 suggested가 []', () => {
        const out = applyRecommendations([v({ type: 'typo-raw' })], { colorSchema, ...dim });
        expect(out[0].suggested).toEqual([]);
    });

    it('typo-styled-override는 suggested가 []', () => {
        const out = applyRecommendations([v({ type: 'typo-styled-override' })], { colorSchema, ...dim });
        expect(out[0].suggested).toEqual([]);
    });

    // Heuristic pass-through
    it('heuristic=true인 violation은 suggested를 변경하지 않는다', () => {
        const original = ['colors.background.primary.100'];
        const out = applyRecommendations(
            [v({ type: 'role-mismatch', property: 'fill', token: 'colors.foreground.primary.100', suggested: original, heuristic: true })],
            { colorSchema, ...dim },
        );
        expect(out[0].suggested).toEqual(original);
    });

    // Immutability: input array is not mutated
    it('입력 violations 배열을 변경하지 않는다', () => {
        const input = [v({ type: 'token-not-used', property: 'fill', value: '#000000' })];
        const before = [...input[0].suggested];
        applyRecommendations(input, { colorSchema, ...dim });
        expect(input[0].suggested).toEqual(before);
    });
});
