import type { UIMessage } from '~/common/messages';

import { brandController, primitiveController } from './controllers';

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
        case 'create-palette-sections':
            await primitiveController.createPaletteSections(msg.data);
            break;
        case 'create-figma-variables':
            await primitiveController.createFigmaVariables(msg.data);
            break;
        case 'create-brand-palette-sections':
            await brandController.createBrandPaletteSections(msg.data);
            break;
        case 'create-brand-figma-variables':
            await brandController.createBrandFigmaVariables(msg.data);
            break;
        default:
            console.warn('알 수 없는 메시지 유형:', msg);
    }
};
