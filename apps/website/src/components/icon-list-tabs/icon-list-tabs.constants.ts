import * as allIcons from '@vapor-ui/icons';
import type { IconType } from '@vapor-ui/icons';

export const ICON_LIST = ['basic', 'outline'] as const;

const initialVaporIcons: {
    [key in (typeof ICON_LIST)[number]]: { [key: string]: IconType };
} = {
    basic: {},
    outline: {},
};

export const VAPOR_ICONS = Object.entries(allIcons).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
        if (key.endsWith('OutlineIcon')) {
            acc.outline[key] = value;
        } else if (key.endsWith('Icon')) {
            acc.basic[key] = value;
        }
    }
    return acc;
}, initialVaporIcons);
