import fs from 'fs';
import { markdownTable } from 'markdown-table';
import path from 'path';

interface PropDef {
    name: string;
    type: string[] | string;
    required: boolean;
    description: string;
    defaultValue?: string | number | boolean | null;
}

interface ComponentDoc {
    props: PropDef[];
}

export const replaceComponentDoc = (text: string) => {
    return text.replace(
        /<ComponentPropsTable\s+componentName="([^"]+)"\s*\/>/g,
        (_, componentName: string) => {
            try {
                const jsonPath = path.join(
                    process.cwd(),
                    'public',
                    'components/generated',
                    `${componentName}.json`,
                );

                if (!fs.existsSync(jsonPath)) {
                    return `> ⚠️ Spec file not found: \`${componentName}.json\``;
                }

                const jsonRaw = fs.readFileSync(jsonPath, 'utf-8');
                const json: ComponentDoc = JSON.parse(jsonRaw);
                const items = json.props || [];

                if (!Array.isArray(items) || items.length === 0) {
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
