import * as allIcons from '@vapor-ui/icons';
import type { IconType } from '@vapor-ui/icons';

import { SYMBOL_ICONS } from '~/constants/icon';

export const ICON_LIST = ['basic', 'outline', 'symbol', 'symbol-black'] as const;

const initialVaporIcons: {
    [key in (typeof ICON_LIST)[number]]: { [key: string]: IconType };
} = {
    basic: {},
    outline: {},
    symbol: {},
    'symbol-black': {},
};

// Create a Set of SymbolIcons constructor references for fast lookup
const symbolIconSet = new Set(SYMBOL_ICONS);

export const VAPOR_ICONS = Object.entries(allIcons).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
        if (symbolIconSet.has(value)) {
            if (key.endsWith('ColorIcon')) {
                acc.symbol[key] = value;
            } else {
                acc['symbol-black'][key] = value;
            }
        } else if (key.endsWith('OutlineIcon')) {
            acc.outline[key] = value;
        } else if (key.endsWith('Icon')) {
            acc.basic[key] = value;
        }
    }
    return acc;
}, initialVaporIcons);
