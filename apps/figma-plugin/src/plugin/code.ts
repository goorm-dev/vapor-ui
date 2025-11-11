import { Logger } from '~/common/logger';
import type { UIMessage } from '~/common/messages';
import { loadDefaultFont } from '~/plugin/utils/figma-font';

import { unifiedController } from './controllers';
import { figmaNoticeService } from './services/figma-notification';

/* -------------------------------------------------------------------------------------------------
 * Figma Plugin Setup
 * -----------------------------------------------------------------------------------------------*/

async function initializeFonts(): Promise<void> {
    const requiredFonts = [
        { family: 'Inter', style: 'Bold' },
        { family: 'Inter', style: 'Medium' },
        { family: 'Inter', style: 'Regular' },
    ] as const;

    // 기본 폰트 로드 시도 (Pretendard 또는 Inter Regular)
    try {
        await loadDefaultFont();
    } catch (error) {
        Logger.warn('Default font loading failed, continuing with Inter', error);
    }

    // 필요한 Inter 폰트 스타일들 로드
    for (const font of requiredFonts) {
        try {
            await figma.loadFontAsync(font);
            Logger.info(`Font loaded: ${font.family} ${font.style}`);
        } catch (error) {
            Logger.error(`Failed to load font: ${font.family} ${font.style}`, error);
        }
    }
}

async function initializePlugin(): Promise<void> {
    try {
        // 폰트를 먼저 로드
        await initializeFonts();

        // UI 표시
        figma.showUI(__html__);
        figma.ui.resize(400, 600);

        Logger.info('Plugin initialized successfully');
    } catch (error) {
        Logger.error('Plugin initialization failed', error);

        // 에러가 발생해도 UI는 표시
        figma.showUI(__html__);
        figma.ui.resize(400, 600);

        // UI에 에러 알림
        figma.ui.postMessage({
            type: 'initialization-error',
            message: 'Font loading failed. Some features may not work correctly.',
        });
    }
}

initializePlugin();

/* -------------------------------------------------------------------------------------------------
 * Message Router
 * -----------------------------------------------------------------------------------------------*/

figma.ui.onmessage = async (msg: UIMessage) => {
    switch (msg.type) {
        case 'palette-generation-started':
            figmaNoticeService.paletteCreating();
            break;
        case 'variable-generation-started':
            figmaNoticeService.variableCreating();
            break;
        case 'create-unified-palette-sections':
            await unifiedController.createUnifiedPaletteSections(msg.data);
            break;
        case 'create-unified-figma-variables':
            await unifiedController.createUnifiedFigmaVariables(msg.data);
            break;
        default:
            console.warn('알 수 없는 메시지 유형:', msg);
    }
};
