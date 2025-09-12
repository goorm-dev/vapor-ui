import type { ColorPaletteResult } from '@vapor-ui/color-generator';

// ============================================================================
// Message Types
// ============================================================================

type CreatePaletteSectionsMessage = {
    type: 'create-palette-sections';
    data: { generatedPalette: Pick<ColorPaletteResult, 'light' | 'dark'> };
};

type CreateFigmaVariablesMessage = {
    type: 'create-figma-variables';
    data: { generatedPalette: ColorPaletteResult; collectionName: string };
};

type CreateBrandPaletteSectionsMessage = {
    type: 'create-brand-palette-sections';
    data: { 
        generatedBrandPalette: Pick<ColorPaletteResult, 'light' | 'dark'>;
        dependentTokens: { light: Record<string, string>; dark: Record<string, string> };
    };
};

type CreateBrandFigmaVariablesMessage = {
    type: 'create-brand-figma-variables';
    data: { generatedBrandPalette: Pick<ColorPaletteResult, 'light' | 'dark'>; collectionName: string };
};

export type UIMessage = CreatePaletteSectionsMessage | CreateFigmaVariablesMessage | CreateBrandPaletteSectionsMessage | CreateBrandFigmaVariablesMessage;

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