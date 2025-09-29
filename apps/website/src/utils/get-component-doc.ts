import fs from 'fs';
import { markdownTable } from 'markdown-table';
import path from 'path';

interface GeneratedProp {
    name: string;
    type: string | string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

interface GeneratedComponentDoc {
    name: string;
    displayName: string;
    props: GeneratedProp[];
    generatedAt: string;
    sourceFile: string;
}

/**
 * Replace <PropsTable file="..." section="..." /> tags inside MDX content
 * with static markdown tables, so LLM can parse component docs without runtime.
 *
 * @param text MDX source string
 * @returns string with PropsTable tags replaced by markdown tables
 */
export const replaceComponentDoc = (text: string) => {
    // Replace ComponentPropsTable tags with generated JSON format
    let result = text.replace(/<ComponentPropsTable\s+file="([^"]+)"\s*\/>/g, (_, file: string) => {
        try {
            const jsonPath = path.join(
                process.cwd(),
                'public',
                'components',
                'generated',
                `${file}.json`,
            );
            const jsonRaw = fs.readFileSync(jsonPath, 'utf-8');
            const doc: GeneratedComponentDoc = JSON.parse(jsonRaw);

            if (!doc.props || doc.props.length === 0) {
                return `> ⚠️ props information not found for \`${file}\``;
            }

            const escapePipes = (value: string | number | null | undefined) =>
                String(value ?? '').replace(/\|/g, '\\|');

            const table = markdownTable([
                ['prop', 'type', 'default', 'description'],
                ...doc.props.map((prop) => {
                    const types = Array.isArray(prop.type) ? prop.type.join(' | ') : prop.type;
                    return [
                        `\`${escapePipes(prop.name)}${!prop.required ? '?' : ''}\``,
                        `\`${escapePipes(types)}\``,
                        prop.defaultValue ? `\`${escapePipes(prop.defaultValue)}\`` : '',
                        escapePipes(prop.description || ''),
                    ];
                }),
            ]);

            // Surround the table with blank lines to ensure proper Markdown rendering
            return `\n${table}\n`;
        } catch (err) {
            return `> ⚠️ error reading props for \`${file}\`: ${(err as Error).message}`;
        }
    });

    return result;
};
