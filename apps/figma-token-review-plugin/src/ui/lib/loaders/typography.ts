import textStyleRaw from '~/common/tokens/text-style.json';
import typographyRaw from '~/common/tokens/typography.json';

const NS = 'io.goorm.vapor';

export type TextStyleMeta = {
    rank: number;
    when: string[];
    avoid: string[];
    description: string | null;
    fontSize: number | null;
};

export type TextStyleSchema = {
    order: string[];
    styles: Record<string, TextStyleMeta>;
};

type Node = {
    $description?: string;
    $extensions?: { [key: string]: Record<string, unknown> };
    $value?: { fontSize?: unknown };
};

function loadFontSizeTable(): Record<string, number> {
    const root = typographyRaw as {
        typography?: { fontSize?: Record<string, { $value?: { value?: unknown } }> };
    };
    const raw = root.typography?.fontSize ?? {};
    const out: Record<string, number> = {};
    for (const [key, node] of Object.entries(raw)) {
        if (key.startsWith('$')) continue;
        const value = node?.$value?.value;
        if (typeof value === 'number') out[key] = value;
    }
    return out;
}

function resolveFontSize(alias: unknown, table: Record<string, number>): number | null {
    if (typeof alias !== 'string') return null;
    const m = alias.match(/^\{typography\.fontSize\.([^}]+)\}$/);
    if (!m) return null;
    const key = m[1];
    return typeof table[key] === 'number' ? table[key] : null;
}

export function loadTextStyleSchema(): TextStyleSchema {
    const root = textStyleRaw as { textStyle?: Record<string, Node | unknown> };
    const fontSizeTable = loadFontSizeTable();
    const order: string[] = [];
    const styles: Record<string, TextStyleMeta> = {};
    const entries = Object.entries(root.textStyle ?? {});
    for (const [name, node] of entries) {
        if (name.startsWith('$') || typeof node !== 'object' || !node) continue;
        const meta = ((node as Node).$extensions?.[NS] ?? {}) as Record<string, unknown>;
        const alias = (node as Node).$value?.fontSize;
        styles[name] = {
            rank: order.length,
            when: Array.isArray(meta.when) ? (meta.when as string[]) : [],
            avoid: Array.isArray(meta.avoid) ? (meta.avoid as string[]) : [],
            description:
                typeof (node as Node).$description === 'string'
                    ? ((node as Node).$description ?? null)
                    : null,
            fontSize: resolveFontSize(alias, fontSizeTable),
        };
        order.push(name);
    }
    return { order, styles };
}
