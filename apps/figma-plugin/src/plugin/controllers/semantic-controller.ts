import type {
    ColorPaletteCollection,
} from '@vapor-ui/color-generator';

import { figmaUIService } from '../services/figma-ui-service';
import { figmaVariableService } from '../services/figma-variable-service';

export const semanticController = {
    /**
     * Semantic 팔레트 섹션 생성
     * - Primary color 기반
     * - Dependent tokens 처리
     * - Primitive + Semantic token 표시
     */
    async createSemanticPaletteSections(data: {
        generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>;
        dependentTokens: { light: Record<string, string>; dark: Record<string, string> };
    }): Promise<void> {
        await figmaUIService.createSemanticPaletteSections({
            generatedSemanticPalette: data.generatedSemanticPalette,
            dependentTokens: data.dependentTokens,
        });
    },

    /**
     * Semantic Figma Variables 생성
     * - Light/Dark 모드 지원
     * - Semantic token 구조
     */
    async createSemanticFigmaVariables(data: {
        generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>;
        collectionName: string;
    }): Promise<void> {
        await figmaVariableService.createSemanticVariables(
            data.generatedSemanticPalette,
            data.collectionName,
        );
    },
} as const;
