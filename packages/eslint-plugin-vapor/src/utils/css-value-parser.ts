export interface ParsedValueToken {
    type: 'var';
    name: string;
    offset: number;
}
export interface ParsedValueHex {
    type: 'hex';
    raw: string;
    normalized: string;
    offset: number;
}
export interface ParsedValueDimension {
    type: 'dimension';
    raw: string;
    value: number;
    unit: string;
    offset: number;
}
export type ParsedValuePart = ParsedValueToken | ParsedValueHex | ParsedValueDimension;

interface NodeLike {
    type?: string;
    name?: string;
    value?: string | number;
    unit?: string;
    children?: NodeLike[];
    loc?: { start?: { offset?: number } };
}

function normalizeHex(raw: string): string {
    const hex = raw.toLowerCase();
    if (hex.length === 3) {
        return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }
    if (hex.length === 4) {
        return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    return `#${hex}`;
}

export function parseDeclarationValue(valueNode: unknown): ParsedValuePart[] {
    const out: ParsedValuePart[] = [];
    const root = valueNode as NodeLike;

    function walk(node: NodeLike | undefined): void {
        if (!node) return;

        if (isCSSVariable(node)) {
            const parsed = parseCSSVariable(node);
            if (parsed) out.push(parsed);
            for (const c of cssVariableFallbacks(node)) walk(c);
            return;
        }
        if (isHexColor(node)) {
            out.push(parseHexColor(node));
            return;
        }
        if (isDimension(node)) {
            out.push(parseDimension(node));
            return;
        }
        if (Array.isArray(node.children)) {
            for (const c of node.children) walk(c);
        }
    }

    walk(root);
    return out;
}

function offsetOf(node: NodeLike | undefined): number {
    return node?.loc?.start?.offset ?? 0;
}

// `var(--x[, <fallback>])` — Function node whose name is 'var'
function isCSSVariable(node: NodeLike): boolean {
    return node.type === 'Function' && node.name === 'var';
}

// `#fff` / `#ffffff` — hex color literal
function isHexColor(node: NodeLike): node is NodeLike & { value: string } {
    return node.type === 'Hash' && typeof node.value === 'string';
}

// `8px`, `1.5rem` — numeric value with a unit suffix
function isDimension(node: NodeLike): node is NodeLike & { value: string | number; unit: string } {
    return node.type === 'Dimension' && node.value != null && typeof node.unit === 'string';
}

function parseCSSVariable(node: NodeLike): ParsedValueToken | null {
    const first = node.children?.[0];
    if (first?.type !== 'Identifier' || typeof first.name !== 'string') return null;
    return { type: 'var', name: first.name, offset: offsetOf(first) };
}

// Children after the identifier are the fallback expression:
// `var(--x, <fallback>)`. Downstream rules must still see hex/dimension/var
// nodes inside the fallback.
function cssVariableFallbacks(node: NodeLike): readonly NodeLike[] {
    return node.children?.slice(1) ?? [];
}

function parseHexColor(node: NodeLike & { value: string }): ParsedValueHex {
    return {
        type: 'hex',
        raw: `#${node.value}`,
        normalized: normalizeHex(node.value),
        offset: offsetOf(node),
    };
}

function parseDimension(
    node: NodeLike & { value: string | number; unit: string },
): ParsedValueDimension {
    const num = typeof node.value === 'number' ? node.value : Number(node.value);
    return {
        type: 'dimension',
        raw: `${node.value}${node.unit}`,
        value: num,
        unit: node.unit,
        offset: offsetOf(node),
    };
}
