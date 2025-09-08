import type { UIMessage } from '~/figma-messages';
import { FigmaAPIService } from '~/services/figma-api';

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
            await FigmaAPIService.createPaletteSections({
                generatedPalette: msg.data.generatedPalette,
            });
            break;
        case 'create-figma-variables':
            await FigmaAPIService.createFigmaVariables(
                msg.data.generatedPalette,
                msg.data.collectionName,
            );
            break;
        case 'create-semantic-palette-sections':
            await FigmaAPIService.createSemanticPaletteSections({
                generatedSemanticPalette: msg.data.generatedSemanticPalette,
                dependentTokens: msg.data.dependentTokens,
            });
            break;
        case 'create-semantic-figma-variables':
            await FigmaAPIService.createSemanticFigmaVariables(
                msg.data.generatedSemanticPalette,
                msg.data.collectionName,
            );
            break;
        default:
            console.warn('알 수 없는 메시지 유형:', msg);
    }
};
