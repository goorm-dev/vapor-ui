import type { UIMessage } from '~/common/messages';

import { unifiedController } from './controllers';

// ============================================================================
// Figma Plugin Setup
// ============================================================================

figma.showUI(__html__);
figma.ui.resize(400, 600);

// ============================================================================
// Message Router
// ============================================================================

figma.ui.onmessage = async (msg: UIMessage) => {
    switch (msg.type) {
        // Unified message handlers (new architecture)
        case 'create-unified-palette-sections':
            await unifiedController.createUnifiedPaletteSections(msg.data);
            break;
        case 'create-unified-figma-variables':
            await unifiedController.createUnifiedFigmaVariables(msg.data);
            break;
        // Legacy message handlers (deprecated - kept for backward compatibility)
        case 'create-palette-sections':
        case 'create-figma-variables':
        case 'create-brand-palette-sections':
        case 'create-brand-figma-variables':
            console.warn(
                'Legacy message type received:',
                msg.type,
                '- Please update to use unified controller',
            );
            break;
        default:
            console.warn('알 수 없는 메시지 유형:', msg);
    }
};
