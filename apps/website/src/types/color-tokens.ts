import type { PaletteChip, PrimitivePalette, SemanticTokens } from '@vapor-ui/color-generator';

export interface ColorShadeItem {
    name: string;
    value: string;
    basicToken?: string;
}

export interface ColorGroup {
    title: string;
    colorShade: ColorShadeItem[];
}

export type BasicColorData = ColorGroup[];
export type SemanticColorData = ColorGroup[];

export interface ColorSwatchItem {
    name: string;
    variable: string;
    value?: string;
    foreground?: string;
}

export type { PaletteChip, PrimitivePalette, SemanticTokens };
