import borderRadiusRaw from '~/common/tokens/border-radius.json';
import dimensionRaw from '~/common/tokens/dimension.json';
import shadowRaw from '~/common/tokens/shadow.json';
import spaceRaw from '~/common/tokens/space.json';

export type TokenValueIndex = {
    tokens: Record<string, string>;
    valueToTokens: Map<string, string[]>;
};

export type DimensionSchemas = {
    space: TokenValueIndex;
    dimension: TokenValueIndex;
    borderRadius: TokenValueIndex;
    shadow: TokenValueIndex;
};

type DimensionValue = { value: number; unit: string };
type Node = { $value?: string | object; [k: string]: unknown };

/**
 * Stringify a token $value.
 * For dimension objects `{ value: 8, unit: "px" }` → `"8px"`.
 * For shadow objects → JSON string (identity for downstream lookup).
 * For plain strings → identity.
 */
function stringify(v: string | object): string {
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && v !== null && 'value' in v && 'unit' in v) {
        const dv = v as DimensionValue;
        return `${dv.value}${dv.unit}`;
    }
    return JSON.stringify(v);
}

function flatten(root: unknown, rootKey: string): TokenValueIndex {
    const tokens: Record<string, string> = {};
    const valueToTokens = new Map<string, string[]>();

    const walk = (node: Node, path: string) => {
        if (!node || typeof node !== 'object') return;
        if ('$value' in node && node.$value !== undefined) {
            const value = stringify(node.$value as string | object);
            tokens[path] = value;
            const arr = valueToTokens.get(value) ?? [];
            arr.push(path);
            valueToTokens.set(value, arr);
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v as Node, path ? `${path}.${k}` : k);
        }
    };

    const r = (root as Record<string, unknown>)[rootKey] as Node | undefined;
    if (r) walk(r, rootKey);
    return { tokens, valueToTokens };
}

/**
 * space.json, dimension.json, border-radius.json all use:
 *   { size: { <key>: { ... } } }
 * Extract via the `size` wrapper then delegate to `flatten` with the inner key.
 */
function flattenSized(raw: { size?: Record<string, Node> }, innerKey: string): TokenValueIndex {
    return flatten(raw.size ?? {}, innerKey);
}

export function loadDimensionSchemas(): DimensionSchemas {
    return {
        space: flattenSized(spaceRaw as { size?: Record<string, Node> }, 'space'),
        dimension: flattenSized(dimensionRaw as { size?: Record<string, Node> }, 'dimension'),
        borderRadius: flattenSized(borderRadiusRaw as { size?: Record<string, Node> }, 'borderRadius'),
        shadow: flatten(shadowRaw, 'shadow'),
    };
}
