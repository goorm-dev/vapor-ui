import type {
    ColorPaletteCollection,
    ThemeDependentTokensCollection,
} from '@vapor-ui/color-generator';

// ============================================================================
// Request Types
// ============================================================================
export interface PaletteCreationRequest {
    generatedPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>;
}

export interface SemanticPaletteCreationRequest {
    generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>;
    dependentTokens: ThemeDependentTokensCollection;
}

export interface FigmaVariableCreationRequest {
    generatedPalette: ColorPaletteCollection;
    collectionName: string;
}

export interface SemanticFigmaVariableCreationRequest {
    generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>;
    collectionName: string;
}

// ============================================================================
// UI Types
// ============================================================================
export interface ColorRowData {
    name: string;
    hex: string;
    oklch?: string;
    codeSyntax?: string;
}

export interface SemanticColorRowData extends ColorRowData {
    primitiveCodeSyntax?: string;
}
