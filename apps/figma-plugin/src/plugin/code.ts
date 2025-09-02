import type { UIMessage } from '../figma-messages';
import { handleCreateFigmaVariables } from './handlers/create-figma-variables';
import { handleCreatePaletteSections } from './handlers/create-palette-sections';

// ============================================================================
// Figma Plugin Setup
// ============================================================================

figma.showUI(__html__);
figma.ui.resize(400, 600);

// ============================================================================
// Message Handler
// ============================================================================

figma.ui.onmessage = async (msg: UIMessage) => {
    switch (msg.type) {
        case 'create-palette-sections':
            handleCreatePaletteSections(msg.data.generatedPalette);
            break;
        case 'create-figma-variables':
            await handleCreateFigmaVariables(msg.data.generatedPalette, msg.data.collectionName);
            break;
        default:
            console.warn('Unknown message type:', msg);
    }
};
