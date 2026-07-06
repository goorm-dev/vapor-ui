/* eslint-disable @typescript-eslint/no-explicit-any */
export type Visitors = Record<string, (node: any, parent: any | null) => void>;

function isNode(value: unknown): value is { type: string } {
    return typeof value === 'object' && value !== null && typeof (value as any).type === 'string';
}

export function walk(node: unknown, visitors: Visitors, parent: any = null): void {
    if (!isNode(node)) return;
    for (const key of Object.keys(node)) {
        if (key === 'type' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') continue;
        const child = (node as any)[key];
        if (Array.isArray(child)) {
            for (const item of child) walk(item, visitors, node);
        } else {
            walk(child, visitors, node);
        }
    }
    const visitor = visitors[(node as any).type];
    if (visitor) visitor(node, parent);
}
