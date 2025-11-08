import type { SemanticResult, ThemeResult } from '@vapor-ui/color-generator';

/* -------------------------------------------------------------------------------------------------
 * Message Types
 * -----------------------------------------------------------------------------------------------*/

type CreateUnifiedPaletteSectionsMessage = {
    type: 'create-unified-palette-sections';
    data: {
        generatedTheme: ThemeResult;
        semanticTokens: SemanticResult;
    };
};

type CreateUnifiedFigmaVariablesMessage = {
    type: 'create-unified-figma-variables';
    data: {
        generatedTheme: ThemeResult;
        collectionName: string;
    };
};

// Keep legacy message types for backward compatibility during transition
type CreatePaletteSectionsMessage = {
    type: 'create-palette-sections';
    data: { generatedPalette: any };
};

type CreateFigmaVariablesMessage = {
    type: 'create-figma-variables';
    data: { generatedPalette: any; collectionName: string };
};

type CreateBrandPaletteSectionsMessage = {
    type: 'create-brand-palette-sections';
    data: {
        generatedBrandPalette: any;
        dependentTokens: any;
    };
};

type CreateBrandFigmaVariablesMessage = {
    type: 'create-brand-figma-variables';
    data: {
        generatedBrandPalette: any;
        collectionName: string;
    };
};

export type UIMessage =
    | CreateUnifiedPaletteSectionsMessage
    | CreateUnifiedFigmaVariablesMessage
    | CreatePaletteSectionsMessage
    | CreateFigmaVariablesMessage
    | CreateBrandPaletteSectionsMessage
    | CreateBrandFigmaVariablesMessage;

/* -------------------------------------------------------------------------------------------------
 * Message Utilities
 * -----------------------------------------------------------------------------------------------*/

/**
 * Posts message from UI to Plugin
 * @param message - Message to send to plugin
 */
export function postMessage(message: UIMessage): void {
    parent.postMessage({ pluginMessage: message }, '*');
}
