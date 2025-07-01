import * as allIcons from '@vapor-ui/icons';
import type { IconType } from '@vapor-ui/icons';
import { markdownTable } from 'markdown-table';

const _ICON_LIST = ['basic', 'outline'] as const;

const initialVaporIcons: {
    [key in (typeof _ICON_LIST)[number]]: { [key: string]: IconType };
} = {
    basic: {},
    outline: {},
};

const VAPOR_ICONS = Object.entries(allIcons).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
        if (key.endsWith('OutlineIcon')) {
            acc.outline[key] = value;
        } else if (key.endsWith('Icon')) {
            acc.basic[key] = value;
        }
    }
    return acc;
}, initialVaporIcons);

/**
 * Generate markdown table for icons by category
 * @param category - 'basic' or 'outline'
 * @returns markdown table string
 */
const getIconTableByCategory = (category: 'basic' | 'outline') => {
    const icons = VAPOR_ICONS[category];
    const iconNames = Object.keys(icons).sort();

    if (iconNames.length === 0) {
        return `> No ${category} icons found`;
    }

    return markdownTable([
        ['Icon Name', 'Import Statement'],
        ...iconNames.map((iconName) => [
            `\`${iconName}\``,
            `\`import { ${iconName} } from '@vapor-ui/icons'\``,
        ]),
    ]);
};

/**
 * Generate complete icon documentation with all categories
 * @returns markdown string with all icon categories
 */
const getCompleteIconDoc = () => {
    const basicTable = getIconTableByCategory('basic');
    const outlineTable = getIconTableByCategory('outline');

    return `## Basic Icons

${basicTable}

## Outline Icons

${outlineTable}`;
};

/**
 * Replace <IconList /> tags inside MDX content with static markdown tables,
 * so LLM can parse icon docs without runtime.
 *
 * @param text MDX source string
 * @returns string with IconList tags replaced by markdown tables
 */
export const replaceIconDoc = (text: string) => {
    const regexp = /<IconList\s*\/>/g;

    return text.replace(regexp, () => {
        return `\n${getCompleteIconDoc()}\n`;
    });
};
