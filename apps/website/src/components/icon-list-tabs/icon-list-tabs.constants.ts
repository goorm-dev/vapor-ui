import type { FunctionComponent } from 'react';

import * as allIcons from '@vapor-ui/icons';
import type { IconProps } from '@vapor-ui/icons';

import { SYMBOL_ICONS } from '~/constants/icon';

export const ICON_LIST = ['basic', 'outline', 'symbol', 'symbol-black'] as const;

type VaporIconsType = {
    [key in (typeof ICON_LIST)[number]]: { [key: string]: FunctionComponent<IconProps> };
};

// Create a Set of SymbolIcons constructor references for fast lookup
const symbolIconSet = new Set(SYMBOL_ICONS);

// Build symbol and symbol-black categories from SYMBOL_ICONS array to preserve order
const symbolIcons: { [key: string]: FunctionComponent<IconProps> } = {};
const symbolBlackIcons: { [key: string]: FunctionComponent<IconProps> } = {};

for (const icon of SYMBOL_ICONS) {
    const iconName = Object.entries(allIcons).find(([, value]) => value === icon)?.[0];
    if (iconName) {
        if (iconName.endsWith('ColorIcon')) {
            symbolIcons[iconName] = icon;
        } else {
            symbolBlackIcons[iconName] = icon;
        }
    }
}

// Build basic and outline categories from allIcons
const basicIcons: { [key: string]: FunctionComponent<IconProps> } = {};
const outlineIcons: { [key: string]: FunctionComponent<IconProps> } = {};

for (const [key, value] of Object.entries(allIcons)) {
    if (typeof value === 'function' && !symbolIconSet.has(value)) {
        if (key.endsWith('OutlineIcon')) {
            outlineIcons[key] = value;
        } else if (key.endsWith('Icon')) {
            basicIcons[key] = value;
        }
    }
}

export const VAPOR_ICONS: VaporIconsType = {
    basic: basicIcons,
    outline: outlineIcons,
    symbol: symbolIcons,
    'symbol-black': symbolBlackIcons,
};
