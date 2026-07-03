/* -------------------------------------------------------------------------------------------------
 * Unified Recommend module
 *
 * applyRecommendations(violations, ctx) — violation type/property에 따라
 * suggested[] 를 채워 새 배열로 반환 (입력 violations[] 불변).
 * heuristic === true 인 violation은 pass-through.
 * -----------------------------------------------------------------------------------------------*/
import type { Property, Violation } from '~/common/schemas';
import type { ColorSchema } from '~/ui/lib/loaders/color';
import type { TokenValueIndex } from '~/ui/lib/loaders/dimension';
import { PROPERTY_SCOPE } from '~/ui/lib/scope';

export type RecommendCtx = {
    colorSchema: ColorSchema;
    space: TokenValueIndex;
    dimension: TokenValueIndex;
    borderRadius: TokenValueIndex;
    shadow: TokenValueIndex;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Return the TokenValueIndex for a given non-color property.
 * Returns null for color properties (fill, fill-on-text, stroke).
 */
function dimensionIndex(property: Property, ctx: RecommendCtx): TokenValueIndex | null {
    switch (property) {
        case 'padding':
        case 'paddingTop':
        case 'paddingRight':
        case 'paddingBottom':
        case 'paddingLeft':
        case 'paddingVertical':
        case 'paddingHorizontal':
        case 'gap':
            return ctx.space;
        case 'width':
        case 'height':
            return ctx.dimension;
        case 'borderRadius':
            return ctx.borderRadius;
        case 'shadow':
            return ctx.shadow;
        default:
            return null;
    }
}

/**
 * For raw color or primitive-used: look up hex in hexIndex, filter by property scope.
 * Priority: scope-matched semantics → same-hex primitives → []
 */
function colorSuggestions(hex: string | null, property: Property, schema: ColorSchema): string[] {
    if (!hex) return [];
    const key = hex.toLowerCase();
    const candidates = schema.hexIndex.get(key) ?? [];
    const allowedRoles = (PROPERTY_SCOPE as Record<string, ReadonlyArray<string>>)[property] ?? [];

    const scoped = candidates.filter((token) => {
        const meta = schema.semantic[token];
        return (
            meta && meta.role && allowedRoles.includes(meta.role) && meta.status !== 'do-not-use'
        );
    });

    if (scoped.length > 0) return scoped;

    // No scope-matched semantic — fall back to primitive tokens with the same hex
    return Object.entries(schema.primitive)
        .filter(([, v]) => v.toLowerCase() === key)
        .map(([k]) => k);
}

/**
 * For raw dimension/space/radius/shadow: look up value in the appropriate index.
 */
function valueSuggestions(value: string | null, index: TokenValueIndex): string[] {
    if (!value) return [];
    return index.valueToTokens.get(value) ?? [];
}

/**
 * For scope (role) mismatch: suggest semantic tokens that match the property's allowed roles
 * and share the same grade segment as the violating token.
 */
function scopeMismatchSuggestions(
    token: string | null,
    property: Property,
    schema: ColorSchema,
): string[] {
    if (!token) return [];
    const grade = token.split('-').pop() ?? '';
    const allowedRoles = (PROPERTY_SCOPE as Record<string, ReadonlyArray<string>>)[property] ?? [];

    return Object.entries(schema.semantic)
        .filter(([path, meta]) => {
            if (meta.status === 'do-not-use') return false;
            if (!meta.role || !allowedRoles.includes(meta.role)) return false;
            if (grade && path.split('-').pop() !== grade) return false;
            return true;
        })
        .map(([path]) => path);
}

/**
 * For do-not-use tokens: 3-step fallback chain.
 * 1. meta.replacement (string | string[]) explicit field
 * 2. meta.avoid 우변 `colors\.[a-zA-Z0-9.]+` 정규식 추출 (dedup 포함)
 * 3. 동위계(same grade) + same role + different family + status !== 'do-not-use'
 */
function doNotUseSuggestions(token: string | null, schema: ColorSchema): string[] {
    if (!token) return [];
    const meta = schema.semantic[token];
    if (!meta) return [];

    // Fallback 1: explicit replacement field (not present in current schema but forward-compat)
    const replacement = (meta as unknown as Record<string, unknown>)['replacement'];
    if (replacement) {
        if (typeof replacement === 'string') return [replacement];
        if (Array.isArray(replacement)) return replacement as string[];
    }

    // Fallback 2: parse avoid[] for token refs
    const fromAvoid = (meta.avoid ?? [])
        .flatMap((line) => Array.from(line.matchAll(/color-[a-zA-Z0-9-]+/g), (m) => m[0]))
        .filter(
            (cand) =>
                cand !== token &&
                cand in schema.semantic &&
                schema.semantic[cand].status !== 'do-not-use',
        );
    if (fromAvoid.length > 0) return Array.from(new Set(fromAvoid));

    // Fallback 3: same grade + same role + different family + not do-not-use
    const parts = token.split('-');
    // Expected structure: color-<role>-<family>-<grade>
    if (parts.length < 4) return [];
    const grade = parts[parts.length - 1];
    const role = parts[1];
    const family = parts[2];

    return Object.entries(schema.semantic)
        .filter(([path, m]) => {
            if (m.status === 'do-not-use') return false;
            const p = path.split('-');
            if (p.length < 4) return false;
            const pGrade = p[p.length - 1];
            const pRole = p[1];
            const pFamily = p[2];
            return pGrade === grade && pRole === role && pFamily !== family;
        })
        .map(([path]) => path);
}

/**
 * For fg-grade-mismatch (.100 token): suggest same family .200 token if it exists.
 */
function fgGradeMismatchSuggestions(token: string | null, schema: ColorSchema): string[] {
    if (!token) return [];
    const parts = token.split('-');
    const grade = parts[parts.length - 1];
    // Only handle -100 → -200 substitution
    if (grade !== '100') return [];

    const base = parts.slice(0, -1).join('-');
    const candidate = `${base}-200`;
    if (schema.semantic[candidate] && schema.semantic[candidate].status !== 'do-not-use') {
        return [candidate];
    }
    return [];
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

export function applyRecommendations(violations: Violation[], ctx: RecommendCtx): Violation[] {
    return violations.map((violation) => {
        // llm origin pass-through — never modify
        if (violation.origin === 'llm') return violation;

        let suggested: string[] = [];

        const { type, property, token, value } = violation;

        switch (type) {
            case 'token-not-used': {
                // Check if this is a color property
                const idx = dimensionIndex(property, ctx);
                if (idx !== null) {
                    // Dimension / space / radius / shadow raw value
                    suggested = valueSuggestions(value, idx);
                } else {
                    // Color raw value
                    suggested = colorSuggestions(value, property, ctx.colorSchema);
                }
                break;
            }

            case 'primitive-used': {
                // Same hex + scope semantic only (no primitive fallback)
                const meta = token ? ctx.colorSchema.semantic[token] : null;
                const hex = meta?.hex ?? value;
                const allowedRoles =
                    (PROPERTY_SCOPE as Record<string, ReadonlyArray<string>>)[property] ?? [];
                const candidates = hex
                    ? (ctx.colorSchema.hexIndex.get(hex.toLowerCase()) ?? [])
                    : [];
                suggested = candidates.filter((t) => {
                    const m = ctx.colorSchema.semantic[t];
                    return (
                        m && m.role && allowedRoles.includes(m.role) && m.status !== 'do-not-use'
                    );
                });
                break;
            }

            case 'role-mismatch': {
                suggested = scopeMismatchSuggestions(token, property, ctx.colorSchema);
                break;
            }

            case 'do-not-use': {
                suggested = doNotUseSuggestions(token, ctx.colorSchema);
                break;
            }

            case 'fg-grade-mismatch': {
                suggested = fgGradeMismatchSuggestions(token, ctx.colorSchema);
                break;
            }

            case 'typo-raw':
            case 'typo-styled-override':
                // suggested already filled by evaluateTypography — do not overwrite
                return violation;

            case 'unknown-token':
                if (property === 'textStyle') {
                    // typography path — evaluateTypography already set suggested (currently [])
                    return violation;
                }
                suggested = [];
                break;

            // Color-side ambiguous / LLM-defense types → no suggestions
            case 'fg-grade-ambiguous':
            case 'semantic-misfit':
            case 'typo-hierarchy':
                suggested = [];
                break;

            default:
                suggested = [];
        }

        return { ...violation, suggested };
    });
}
