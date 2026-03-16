import type { FunctionComponent } from 'react';

import * as allIcons from '@vapor-ui/icons';
import type { IconProps } from '@vapor-ui/icons';

import { SYMBOL_ICONS } from '~/constants/icon';

export const ICON_LIST = ['basic', 'outline', 'symbol', 'symbol-black'] as const;

export type IconCategory = (typeof ICON_LIST)[number];

export type IconItem = {
    name: string;
    icon: FunctionComponent<IconProps>;
};

type VaporIconsType = Record<IconCategory, Record<string, FunctionComponent<IconProps>>>;

export const CATEGORY_LABELS: Record<IconCategory, string> = {
    basic: 'Basic',
    outline: 'Outline',
    symbol: 'Symbol',
    'symbol-black': 'Symbol Black',
};

// Create a Set of SymbolIcons constructor references for fast lookup
const symbolIconSet = new Set(SYMBOL_ICONS);

// Build icon component to name map for O(1) lookup
const iconComponentToNameMap = new Map(
    Object.entries(allIcons).map(([name, component]) => [component, name]),
);

// Build symbol and symbol-black categories from SYMBOL_ICONS array to preserve order
const symbolIcons: Record<string, FunctionComponent<IconProps>> = {};
const symbolBlackIcons: Record<string, FunctionComponent<IconProps>> = {};

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
const basicIcons: Record<string, FunctionComponent<IconProps>> = {};
const outlineIcons: Record<string, FunctionComponent<IconProps>> = {};

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

export const ICON_ITEMS: Record<IconCategory, IconItem[]> = Object.fromEntries(
    ICON_LIST.map((category) => [
        category,
        Object.entries(VAPOR_ICONS[category]).map(([name, icon]) => ({ name, icon })),
    ]),
) as Record<IconCategory, IconItem[]>;

export const ICON_COUNTS: Record<IconCategory, number> = Object.fromEntries(
    ICON_LIST.map((category) => [category, ICON_ITEMS[category].length]),
) as Record<IconCategory, number>;
