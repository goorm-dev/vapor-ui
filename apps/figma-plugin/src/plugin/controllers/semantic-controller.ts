import type { ColorPaletteResult } from '@vapor-ui/color-generator';

import { figmaUIService } from '../services/figma-ui-service';
import { figmaVariableService } from '../services/figma-variable-service';

export const semanticController = {
    /**
     * Semantic 팔레트 섹션 생성
     * - Primary color 기반
     * - Dependent tokens 처리
     * - Primitive + Semantic token 표시
     * - 각 테마(light, dark)별로 개별 섹션 생성
     */
    async createSemanticPaletteSections(data: {
        generatedSemanticPalette: Pick<ColorPaletteResult, 'light' | 'dark'>;
        dependentTokens: { light: Record<string, string>; dark: Record<string, string> };
    }): Promise<void> {
        const { generatedSemanticPalette } = data;
        
        // 테마 순서: light -> dark
        const themeOrder = ['light', 'dark'];
        const sortedThemes = Object.entries(generatedSemanticPalette).sort(([themeA], [themeB]) => {
            const indexA = themeOrder.indexOf(themeA);
            const indexB = themeOrder.indexOf(themeB);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
        
        // 순차적으로 섹션 생성 (기존 섹션 위치를 고려하기 위해)
        for (const [theme, themeData] of sortedThemes) {
            if (themeData && themeData.tokens) {
                await figmaUIService.generatePalette(themeData, `semantic-${theme}`);
            }
        }
    },

    /**
     * Semantic Figma Variables 생성
     * - Light/Dark 모드 지원
     * - Semantic token 구조
     */
    async createSemanticFigmaVariables(data: {
        generatedSemanticPalette: Pick<ColorPaletteResult, 'light' | 'dark'>;
        collectionName: string;
    }): Promise<void> {
        await figmaVariableService.createSemanticVariables(
            data.generatedSemanticPalette,
            data.collectionName,
        );
    },
} as const;
