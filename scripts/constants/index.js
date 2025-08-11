import {
    FIGMA_ICONS_BASIC_NODE_IDS,
    FIGMA_ICONS_SYMBOL_COLOR_NODE_ID,
    FIGMA_ICONS_SYMBOL_DEFAULT_NODE_ID,
} from './figma.js';

/**
 * Script information by npm script
 */
const ICON_TYPES = {
    basic: {
        id: 'basic',
        nodeIds: FIGMA_ICONS_BASIC_NODE_IDS,
        targetPath: 'packages/icons/src/components/basic-icons',
    },
    symbol: {
        id: 'symbol',
        nodeIds: FIGMA_ICONS_BASIC_NODE_IDS,
        targetPath: 'packages/icons/src/components/symbol-icons',
    },
};

export { ICON_TYPES };
