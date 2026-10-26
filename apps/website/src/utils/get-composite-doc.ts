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

export const replaceCompositeDoc = (text: string) => {
    let result = text;

    result = result.replace(/<DoImage([\s\S]*?)\/>/g, (_, raw: string) => {
        const attrs = parseAttrs(raw);
        return `**Do**: ${toDoDontCaption(attrs)}\n\n${toImage(attrs)}\n`;
    });

    result = result.replace(/<DontImage([\s\S]*?)\/>/g, (_, raw: string) => {
        const attrs = parseAttrs(raw);
        return `**Don't**: ${toDoDontCaption(attrs)}\n\n${toImage(attrs)}\n`;
    });

    result = result.replace(/<DocsImage([\s\S]*?)\/>/g, (_, raw: string) => {
        const attrs = parseAttrs(raw);
        return `${toImage(attrs)}${toCaption(attrs)}\n`;
    });

    result = result.replace(/<\/?DocsGrid\s*>/g, '');

    return result;
};
