import textStyleRaw from '~/common/tokens/text-style.json';

const NS = 'io.goorm.vapor';

export type TextStyleMeta = {
    rank: number;
    when: string[];
    avoid: string[];
    description: string | null;
};

export type TextStyleSchema = {
    order: string[];
    styles: Record<string, TextStyleMeta>;
};

type Node = { $description?: string; $extensions?: { [key: string]: Record<string, unknown> } };

export function loadTextStyleSchema(): TextStyleSchema {
    const root = textStyleRaw as { textStyle?: Record<string, Node | unknown> };
    const order: string[] = [];
    const styles: Record<string, TextStyleMeta> = {};
    const entries = Object.entries(root.textStyle ?? {});
    for (const [name, node] of entries) {
        if (name.startsWith('$') || typeof node !== 'object' || !node) continue;
        const meta = ((node as Node).$extensions?.[NS] ?? {}) as Record<string, unknown>;
        styles[name] = {
            rank: order.length,
            when: Array.isArray(meta.when) ? (meta.when as string[]) : [],
            avoid: Array.isArray(meta.avoid) ? (meta.avoid as string[]) : [],
            description:
                typeof (node as Node).$description === 'string'
                    ? ((node as Node).$description ?? null)
                    : null,
        };
        order.push(name);
    }
    return { order, styles };
}
