import type { UIMessage } from '../figma-messages';
import { handleCreatePaletteSections } from './handlers/create-palette-sections';

// ============================================================================
// Figma Plugin Setup
// ============================================================================

figma.showUI(__html__);
figma.ui.resize(400, 400);

// ============================================================================
// Message Handler
// ============================================================================

figma.ui.onmessage = async (msg: UIMessage) => {
    switch (msg.type) {
        case 'create-palette-sections':
            handleCreatePaletteSections(msg.data.generatedPalette);
            break;
        // case 'update-primary-color':
        //     handleUpdatePrimaryColor(msg.data.color);
        //     break;
        default:
            console.warn('Unknown message type:', msg);
    }
};

