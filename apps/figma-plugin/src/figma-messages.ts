import type { ColorPaletteCollection } from '@vapor-ui/color-generator';

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

export type UIMessage = CreatePaletteSectionsMessage | CreateFigmaVariablesMessage;

// ============================================================================
// Message  Utilities
// ============================================================================

export function postMessage(message: UIMessage): void {
    parent.postMessage({ pluginMessage: message }, '*');
}
