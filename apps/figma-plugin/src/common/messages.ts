import type { ColorPaletteCollection, ThemeDependentTokensCollection } from '@vapor-ui/color-generator';

// ============================================================================
// Message Types
// ============================================================================

type CreatePaletteSectionsMessage = {
    type: 'create-palette-sections';
    data: { generatedPalette: Pick<ColorPaletteCollection, 'light' | 'dark'> };
};

type CreateFigmaVariablesMessage = {
    type: 'create-figma-variables';
    data: { generatedPalette: ColorPaletteCollection; collectionName: string };
};

type CreateSemanticPaletteSectionsMessage = {
    type: 'create-semantic-palette-sections';
    data: { 
        generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>;
        dependentTokens: ThemeDependentTokensCollection;
    };
};

type CreateSemanticFigmaVariablesMessage = {
    type: 'create-semantic-figma-variables';
    data: { generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>; collectionName: string };
};

export type UIMessage = CreatePaletteSectionsMessage | CreateFigmaVariablesMessage | CreateSemanticPaletteSectionsMessage | CreateSemanticFigmaVariablesMessage;

// ============================================================================
// Message Utilities
// ============================================================================

/**
 * Posts message from UI to Plugin
 * @param message - Message to send to plugin
 */
export function postMessage(message: UIMessage): void {
    parent.postMessage({ pluginMessage: message }, '*');
}