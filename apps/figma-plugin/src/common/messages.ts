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

export type UIMessage = CreateUnifiedPaletteSectionsMessage | CreateUnifiedFigmaVariablesMessage;

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
