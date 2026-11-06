import { markdownTable } from 'markdown-table';

import { _readComponentApi } from '~/utils/component-api';

const parseAttrs = (raw: string): Record<string, string> => {
    const attrs: Record<string, string> = {};
    for (const match of raw.matchAll(/(\w+)="([^"]*)"/g)) {
        attrs[match[1]!] = match[2]!;
    }
    return attrs;
};

const toImage = (attrs: Record<string, string>) => `![${attrs.alt ?? ''}](${attrs.src ?? ''})`;

const toCaption = (attrs: Record<string, string>) =>
    attrs.caption ? `\n\n*${attrs.caption}*` : '';

const toDoDontCaption = (attrs: Record<string, string>) =>
    attrs.caption ? `${attrs.caption}` : '';

const escapeCell = (value: string | number | boolean | null | undefined): string => {
    let str = String(value ?? '');
    str = str.replace(/\|/g, '\\|');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/\n/g, '<br/>');
    return str;
};

const renderPropsTable = (file: string): string => {
    const json = _readComponentApi(file, 'en');
    if (!json) return `> ⚠️ Spec file not found: \`${file}\``;
    if (json.props.length === 0) return `> ⚠️ Props not found in \`${file}\``;

    const table = markdownTable([
        ['Prop', 'Required', 'Type', 'Default', 'Description'],
        ...json.props.map((item) => {
            const name = `\`${escapeCell(item.name)}\``;
            const required = item.required ? 'Required' : 'Optional';
            const typeStr = item.detailedType
                ? `\`${item.detailedType.replace(/\|/g, '\\|')}\``
                : Array.isArray(item.type)
                  ? item.type.map((t) => `\`${String(t).replace(/\|/g, '\\|')}\``).join(', ')
                  : `\`${String(item.type).replace(/\|/g, '\\|')}\``;
            const defaultVal =
                item.defaultValue !== undefined && item.defaultValue !== null
                    ? `\`${escapeCell(item.defaultValue)}\``
                    : '-';
            return [name, required, typeStr, defaultVal, escapeCell(item.description)];
        }),
    ]);
    return `\n${table}\n`;
};

export const replaceCompositeDoc = (text: string) => {
    let result = text;

    result = result.replace(/<(Dont|Do)Image([\s\S]*?)\/>/g, (_, kind: string, raw: string) => {
        const attrs = parseAttrs(raw);
        const label = kind === 'Do' ? '**Do**' : "**Don't**";
        return `${label}: ${toDoDontCaption(attrs)}\n\n${toImage(attrs)}\n`;
    });

    result = result.replace(/<DocsImage([\s\S]*?)\/>/g, (_, raw: string) => {
        const attrs = parseAttrs(raw);
        return `${toImage(attrs)}${toCaption(attrs)}\n`;
    });

    result = result.replace(/<\/?DocsGrid\s*>/g, '');

    result = result.replace(/<PropsTable\s+file="([^"]+)"\s*\/>/g, (_, file: string) => {
        try {
            return renderPropsTable(file);
        } catch (err) {
            return `> ⚠️ Error rendering props for \`${file}\`: ${(err as Error).message}`;
        }
    });

    result = result.replace(/<DocsTabs\b[^>]*>[\s\S]*?<\/DocsTabs>/g, '');

    return result;
};
