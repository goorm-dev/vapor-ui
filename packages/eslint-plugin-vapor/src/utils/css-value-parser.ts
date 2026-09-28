export interface ParsedValueToken {
    type: 'var';
    name: string;
    offset: number;
    /** Part came from a var() fallback expression. */
    inFallback?: boolean;
}
export interface ParsedValueHex {
    type: 'hex';
    raw: string;
    normalized: string;
    offset: number;
    /** Part came from a var() fallback expression. */
    inFallback?: boolean;
}
export interface ParsedValueDimension {
    type: 'dimension';
    raw: string;
    value: number;
    unit: string;
    offset: number;
    /** Part came from a var() fallback expression. */
    inFallback?: boolean;
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

            for (const c of cssVariableFallbacks(node)) {
                walk(c);
            }
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

        // @eslint/css never parses var() fallbacks — everything after the
        // comma arrives as a single unparsed Raw node. Re-scan its text so
        // hex/dimension/var values inside a fallback are visible to rules.
        // Raw ⇒ fallback also means every extracted part is tagged
        // inFallback below. (Custom-property declaration values are Raw too,
        // but the scope rules skip those properties entirely.)
        if (isRaw(node)) {
            out.push(...parseRawText(node.value, offsetOf(node)));
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

// Unparsed text chunk, e.g. everything after the comma in `var(--x, <raw>)`
function isRaw(node: NodeLike): node is NodeLike & { value: string } {
    return node.type === 'Raw' && typeof node.value === 'string';
}

const RAW_VAR_RE = /var\(\s*(--[a-zA-Z0-9-]+)/g;
const RAW_HEX_RE = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
// Sign is part of the match so `-8px` parses as value -8, never a bare `8px`
// whose replacement range would corrupt the value. The lookbehind keeps digits
// inside identifiers (`--dimension-150`) and hex literals from matching.
const RAW_DIMENSION_RE = /(?<![\w#.-])(-?\d*\.?\d+)([a-z]+|%)/gi;

function parseRawText(text: string, base: number): ParsedValuePart[] {
    const parts: ParsedValuePart[] = [];

    for (const m of Array.from(text.matchAll(RAW_VAR_RE))) {
        parts.push({
            type: 'var',
            name: m[1],
            offset: base + m.index + m[0].indexOf(m[1]),
            inFallback: true,
        });
    }
    for (const m of Array.from(text.matchAll(RAW_HEX_RE))) {
        parts.push({
            type: 'hex',
            raw: m[0],
            normalized: normalizeHex(m[1]),
            offset: base + m.index,
            inFallback: true,
        });
    }
    for (const m of Array.from(text.matchAll(RAW_DIMENSION_RE))) {
        parts.push({
            type: 'dimension',
            raw: m[0],
            value: Number(m[1]),
            unit: m[2],
            offset: base + m.index,
            inFallback: true,
        });
    }

    return parts.sort((a, b) => a.offset - b.offset);
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
