import type { ColorPaletteCollection } from '@vapor-ui/color-generator';

import { figmaUIService } from '../services/figma-ui-service';
import { figmaVariableService } from '../services/figma-variable-service';

export const primitiveController = {
    /**
     * Primitive 팔레트 섹션 생성
     * - 다양한 색상 패밀리 (red, blue, green, etc.)
     * - Contrast ratios 기반 shade 생성
     */
    async createPaletteSections(data: {
        generatedPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>;
    }): Promise<void> {
        await figmaUIService.createPrimitivePaletteSections({
            generatedPalette: data.generatedPalette,
        });
    },

    /**
     * Primitive Figma Variables 생성
     * - Base colors 포함 (white, black)
     * - Light/Dark 테마별 변수
     */
    async createFigmaVariables(data: {
        generatedPalette: ColorPaletteCollection;
        collectionName: string;
    }): Promise<void> {
        await figmaVariableService.createPrimitiveVariables(
            data.generatedPalette,
            data.collectionName,
        );
    },
} as const;
