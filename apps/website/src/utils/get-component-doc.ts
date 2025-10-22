import fs from 'fs';
import { markdownTable } from 'markdown-table';
import path from 'path';

interface PropItem {
    prop: string;
    type: string;
    default: string | number | null;
    description: string;
}

/**
 * Replace <PropsTable file="..." section="..." /> tags inside MDX content
 * with static markdown tables, so LLM can parse component docs without runtime.
 *
 * @param text MDX source string
 * @returns string with PropsTable tags replaced by markdown tables
 */
export const replaceComponentDoc = (text: string) => {
    // Replace PropsTable tags
    return text.replace(
        /<ComponentPropsTable\s+file="([^"]+)"(?:\s+section="([^"]+)")?\s*\/>/g,
        (_, file: string, section: string | undefined) => {
            try {
                const jsonPath = path.join(process.cwd(), 'public', 'components', `${file}.json`);
                const jsonRaw = fs.readFileSync(jsonPath, 'utf-8');
                const json = JSON.parse(jsonRaw);
                const items = json[section || 'props'] || [];
                if (!Array.isArray(items) || items.length === 0) {
                    return `> ⚠️ props information not found for \`${file}\` (${section || 'props'})`;
                }

                const propItems: PropItem[] = items;

                const escapePipes = (value: string | number | null | undefined) =>
                    String(value ?? '').replace(/\|/g, '\\|');

                const table = markdownTable([
                    ['prop', 'type', 'default', 'description'],
                    ...propItems.map(({ prop, type, default: def, description }) => [
                        `\`${escapePipes(prop)}\``,
                        `\`${escapePipes(type)}\``,
                        def !== null && def !== undefined ? `\`${escapePipes(def)}\`` : '',
                        escapePipes(description),
                    ]),
                ]);

                // Surround the table with blank lines to ensure proper Markdown rendering
                return `\n${table}\n`;
            } catch (err) {
                return `> ⚠️ error reading props for \`${file}\` (${section || 'props'}): ${(err as Error).message}`;
            }
        },
    );
};
