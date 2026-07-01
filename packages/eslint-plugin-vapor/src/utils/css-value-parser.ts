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
        const offset = node.loc?.start?.offset ?? 0;
        if (node.type === 'Function' && node.name === 'var') {
            const first = node.children?.[0];
            if (first?.type === 'Identifier' && typeof first.name === 'string') {
                out.push({
                    type: 'var',
                    name: first.name,
                    offset: first.loc?.start?.offset ?? offset,
                });
            }
            return;
        }
        if (node.type === 'Hash' && typeof node.value === 'string') {
            out.push({
                type: 'hex',
                raw: `#${node.value}`,
                normalized: normalizeHex(node.value),
                offset,
            });
            return;
        }
        if (node.type === 'Dimension' && node.value != null && typeof node.unit === 'string') {
            const num = typeof node.value === 'number' ? node.value : Number(node.value);
            out.push({
                type: 'dimension',
                raw: `${node.value}${node.unit}`,
                value: num,
                unit: node.unit,
                offset,
            });
            return;
        }
        if (Array.isArray(node.children)) {
            for (const c of node.children) walk(c);
        }
    }

    walk(root);
    return out;
}
