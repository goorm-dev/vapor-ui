import fs from 'fs';
import { markdownTable } from 'markdown-table';
import path from 'path';

import { ComponentAccessibilityDataMap } from '~/constants/accessibility';

interface PropItem {
    prop: string;
    type: string;
    default: string | number | null;
    description: string;
}

interface AccessibilitySectionItem {
    itemKey: string;
    badgeColor?: 'primary' | 'success' | 'warning' | 'danger' | 'contrast' | 'hint';
    descriptions: string[];
    exampleCode?: string;
}

interface AccessibilitySection {
    title?: string;
    headerList: { [key: string]: string };
    items: AccessibilitySectionItem[];
}

interface AccessibilityData {
    headingDescription?: string;
    sections: AccessibilitySection[];
}

/**
 * Normalize accessibility data from various JSON shapes to AccessibilityData structure
 */
const normalizeAccessibilityData = (input: unknown): AccessibilityData => {
    // Case 1: Array input (legacy format)
    if (Array.isArray(input)) {
        if (
            input.length > 0 &&
            typeof input[0] === 'object' &&
            input[0] !== null &&
            'sections' in (input[0] as Record<string, unknown>)
        ) {
            return input[0] as unknown as AccessibilityData;
        }
        return { sections: [] };
    }

    // Case 2: Object input with sections
    if (input && typeof input === 'object') {
        const obj = input as Record<string, unknown>;

        if ('sections' in obj) {
            return obj as unknown as AccessibilityData;
        }

        // Shape with devNote / a11ySupport / keyboardInteractions, etc.
        const headingDescription = obj['headingDescription'] as string | undefined;
        const potentialSectionsKeys = ['devNote', 'a11ySupport', 'keyboardInteractions'];

        const sections = potentialSectionsKeys
            .map((key) => obj[key] as AccessibilitySection | undefined)
            .filter(Boolean) as AccessibilitySection[];

        return {
            headingDescription,
            sections,
        };
    }

    // Fallback: empty
    return { sections: [] };
};

/**
 * Generate markdown table for accessibility section
 */
const generateAccessibilitySectionMarkdown = (section: AccessibilitySection): string => {
    if (!section.items?.length) return '';

    const escapePipes = (value: string | number | null | undefined) =>
        String(value ?? '').replace(/\|/g, '\\|');

    const headers = Object.values(section.headerList);
    const table = markdownTable([
        headers,
        ...section.items.map((item) => [
            `**${escapePipes(item.itemKey)}**`,
            item.descriptions.map((desc) => escapePipes(desc)).join('<br/>'),
        ]),
    ]);

    let result = '';
    if (section.title) {
        result += `### ${section.title}\n\n`;
    }
    result += `${table}\n\n`;

    // Add example code if available
    section.items.forEach((item) => {
        if (item.exampleCode) {
            result += `**${item.itemKey} Example:**\n\`\`\`tsx\n${item.exampleCode}\n\`\`\`\n\n`;
        }
    });

    return result;
};

/**
 * Generate complete accessibility documentation
 */
const generateAccessibilityMarkdown = (file: string): string => {
    if (!(file in ComponentAccessibilityDataMap)) {
        return `> ⚠️ accessibility information not found for \`${file}\``;
    }

    try {
        const accessibilityData = normalizeAccessibilityData(ComponentAccessibilityDataMap[file]);

        if (!accessibilityData.sections.length) {
            return `> No accessibility data available for \`${file}\``;
        }

        let result = '';

        if (accessibilityData.headingDescription) {
            result += `${accessibilityData.headingDescription}\n\n`;
        }

        accessibilityData.sections.forEach((section) => {
            result += generateAccessibilitySectionMarkdown(section);
        });

        return result.trim();
    } catch (err) {
        return `> ⚠️ error reading accessibility data for \`${file}\`: ${(err as Error).message}`;
    }
};

/**
 * Replace <PropsTable file="..." section="..." /> tags inside MDX content
 * with static markdown tables, so LLM can parse component docs without runtime.
 *
 * @param text MDX source string
 * @returns string with PropsTable tags replaced by markdown tables
 */
export const replaceComponentDoc = (text: string) => {
    // Replace PropsTable tags
    let result = text.replace(
        /<PropsTable\s+file="([^"]+)"(?:\s+section="([^"]+)")?\s*\/>/g,
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

    // Replace AccessibilityTable tags
    result = result.replace(/<AccessibilityTable\s+file="([^"]+)"\s*\/>/g, (_, file: string) => {
        return `\n${generateAccessibilityMarkdown(file)}\n`;
    });

    return result;
};
