import {
    transformPrimitivePalettesToBasicColorData,
    transformSemanticTokensToSemanticColorData,
} from '../utils/color-generator-adapter';

export const BasicColorData = transformPrimitivePalettesToBasicColorData();
export const SemanticColorData = transformSemanticTokensToSemanticColorData();

export type {
    BasicColorData as BasicColorDataType,
    SemanticColorData as SemanticColorDataType,
    ColorGroup,
    ColorShadeItem,
} from '../types/color-tokens';
