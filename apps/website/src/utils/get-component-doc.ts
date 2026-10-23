import { markdownTable } from 'markdown-table';

import { readComponentApi } from '~/utils/component-api';

export const replaceComponentDoc = (text: string) => {
    return text.replace(
        /<ComponentPropsTable\s+componentName="([^"]+)"\s*\/>/g,
        (_, componentName: string) => {
            try {
                const json = readComponentApi(componentName, 'en');

                if (!json) {
                    return `> ⚠️ Spec file not found: \`${componentName}.json\``;
                }

                const items = json.props;

                if (items.length === 0) {
                    return `> ⚠️ Props not found in \`${componentName}.json\``;
                }

                const escapeContent = (value: string | number | boolean | null | undefined) => {
                    let str = String(value ?? '');

                    str = str.replace(/\|/g, '\\|');
                    str = str.replace(/</g, '&lt;');
                    str = str.replace(/>/g, '&gt;');
                    str = str.replace(/\n/g, '<br/>');

                    return str;
                };

                const table = markdownTable([
                    ['Prop', 'Type', 'Default', 'Description'],
                    ...items.map((item) => {
                        const name = item.required
                            ? `**${escapeContent(item.name)}**`
                            : `\`${escapeContent(item.name)}\``;

                        let typeStr = '';
                        if (Array.isArray(item.type)) {
                            typeStr = item.type
                                .map((t) => `\`${String(t).replace(/\|/g, '\\|')}\``)
                                .join(', ');
                        } else {
                            typeStr = `\`${String(item.type).replace(/\|/g, '\\|')}\``;
                        }

                        const defaultVal =
                            item.defaultValue !== undefined && item.defaultValue !== null
                                ? `\`${escapeContent(item.defaultValue)}\``
                                : '-';

                        const description = escapeContent(item.description);

                        return [name, typeStr, defaultVal, description];
                    }),
                ]);

                return `\n${table}\n`;
            } catch (err) {
                return `> ⚠️ Error rendering props for \`${componentName}\`: ${(err as Error).message}`;
            }
        },
    );
};
