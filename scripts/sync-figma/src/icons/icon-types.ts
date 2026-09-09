import { FIGMA_ICONS_BASIC_NODE_IDS, FIGMA_ICONS_SYMBOL_NODE_IDS } from './constants';

/**
 * Script information by npm script
 */
type IconType = {
    id: string;
    nodeIds: string[];
    targetPath: string;
};

const ICON_TYPES: Record<string, IconType> = {
    basic: {
        id: 'basic',
        nodeIds: FIGMA_ICONS_BASIC_NODE_IDS,
        targetPath: 'packages/icons/src/components/basic-icons',
    },
    symbol: {
        id: 'symbol',
        nodeIds: FIGMA_ICONS_SYMBOL_NODE_IDS,
        targetPath: 'packages/icons/src/components/symbol-icons',
    },
};

export type { IconType };

export { ICON_TYPES };
