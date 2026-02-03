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

// Build icon component to name map for O(1) lookup
const iconComponentToNameMap = new Map(
    Object.entries(allIcons).map(([name, component]) => [component, name]),
);

// Build symbol and symbol-black categories from SYMBOL_ICONS array to preserve order
const symbolIcons: { [key: string]: FunctionComponent<IconProps> } = {};
const symbolBlackIcons: { [key: string]: FunctionComponent<IconProps> } = {};

for (const icon of SYMBOL_ICONS) {
    const iconName = iconComponentToNameMap.get(icon);
    if (!iconName) continue;

    if (iconName.endsWith('ColorIcon')) {
        symbolIcons[iconName] = icon;
    } else {
        symbolBlackIcons[iconName] = icon;
    }
}

// Build basic and outline categories from allIcons
const basicIcons: { [key: string]: FunctionComponent<IconProps> } = {};
const outlineIcons: { [key: string]: FunctionComponent<IconProps> } = {};

for (const [key, value] of Object.entries(allIcons)) {
    if (typeof value !== 'function') continue;
    if (symbolIconSet.has(value)) continue;

    if (key.endsWith('OutlineIcon')) {
        outlineIcons[key] = value;
    } else if (key.endsWith('Icon')) {
        basicIcons[key] = value;
    }
}

export const VAPOR_ICONS: VaporIconsType = {
    basic: basicIcons,
    outline: outlineIcons,
    symbol: symbolIcons,
    'symbol-black': symbolBlackIcons,
};
