import type { ColorPaletteResult } from '@vapor-ui/color-generator';

import { figmaNoticeService } from '../services/figma-notification';
import { figmaUIService } from '../services/figma-ui-service';
import { figmaVariableService } from '../services/figma-variable-service';

export const primitiveController = {
    async createPaletteSections(data: { generatedPalette: ColorPaletteResult }): Promise<void> {
        const { generatedPalette } = data;

        const themeOrder: (keyof ColorPaletteResult)[] = ['base', 'light', 'dark'];

        const sortedThemes = themeOrder
            .filter((theme) => theme in generatedPalette)
            .map((theme) => [theme, generatedPalette[theme]] as const);

        figmaNoticeService.paletteCreating();
        try {
            for (const [theme, themeData] of sortedThemes) {
                if (themeData && themeData.tokens) {
                    await figmaUIService.generatePalette(themeData, theme);
                }
            }

            figmaNoticeService.paletteCreated();
        } catch (error) {
            figmaNoticeService.paletteCreateFailed();
            throw error;
        }
    },

    /**
     * Primitive Figma Variables 생성
     * - Base colors 포함 (white, black)  
     * - Light/Dark 테마별 변수
     */
    async createFigmaVariables(data: {
        generatedPalette: ColorPaletteResult;
        collectionName: string;
    }): Promise<void> {
        try {
            await figmaVariableService.createPrimitiveVariables(
                data.generatedPalette,
                data.collectionName,
            );

            figmaNoticeService.variablesCreated();
        } catch (error) {
            figmaNoticeService.variablesCreateFailed();
            throw error;
        }
    },
} as const;
