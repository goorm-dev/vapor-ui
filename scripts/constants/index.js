const path = require('path');
const {
    FIGMA_ICONS_BASIC_NODE_IDS,
    FIGMA_ICONS_EXTENSION_NODE_ID,
    FIGMA_ICONS_SYMBOL_DEFAULT_NODE_ID,
    FIGMA_ICONS_SYMBOL_COLOR_NODE_ID,
    FIGMA_ICONS_STACK_DEFAULT_NODE_ID,
    FIGMA_ICONS_STACK_COLOR_NODE_ID,
    FIGMA_RESOURCES_BASIC_IMAGES_NODE_ID,
    FIGMA_RESOURCES_BRAND_IMAGES_NODE_ID,
    FIGMA_RESOURCES_OTHER_BRAND_IMAGES_NODE_ID,
    FIGMA_NODE_TYPES,
} = require('./figma');

/**
 * 리소스 스토리 폴더 절대 경로
 */
const ABSOLUTE_STORY_PATH = path.resolve(__dirname, `../../../stories/foundation/Resources`);

/**
 * 리소스 SVG 파일 절대 경로
 */
const ABSOLUTE_ASSETS_PATH = path.resolve(__dirname, `../../../src/resources`);

/**
 * npm script별 script 정보
 */
const ICON_TYPES = {
    basic: {
        id: 'basic',
        nodeIds: FIGMA_ICONS_BASIC_NODE_IDS,
        storyFileName: 'Basic.jsx',
        storyPath: '/stories/foundation/icons',
        targetPath: '/packages/icons/src/components/basic-icons',
    },
    symbol: {
        id: 'symbol',
        nodeIds: [FIGMA_ICONS_SYMBOL_DEFAULT_NODE_ID, FIGMA_ICONS_SYMBOL_COLOR_NODE_ID].join(','),
        storyFileName: 'Symbol.jsx',
        storyPath: '/stories/foundation/icons',
        targetPath: '/packages/icons/src/components/symbol-icons',
    },
};

module.exports = {
    ABSOLUTE_STORY_PATH,
    ABSOLUTE_ASSETS_PATH,
    ICON_TYPES,
};
