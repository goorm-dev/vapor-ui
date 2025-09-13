import type { ColorPaletteResult, SemanticTokensResult } from '@vapor-ui/color-generator';

import { figmaNoticeService } from '../services/figma-notification';
import { figmaUIService } from '../services/figma-ui-service';
import { figmaVariableService } from '../services/figma-variable-service';

export const brandController = {
    async createBrandPaletteSections(data: {
        generatedBrandPalette: Pick<ColorPaletteResult, 'light' | 'dark'>;
        dependentTokens: SemanticTokensResult;
    }): Promise<void> {
        const { generatedBrandPalette, dependentTokens } = data;

        // 테마 순서: light -> dark
        const themeOrder: ('light' | 'dark')[] = ['light', 'dark'];

        const sortedThemes = themeOrder
            .filter((theme) => theme in generatedBrandPalette)
            .map((theme) => [theme, generatedBrandPalette[theme]] as const);

        figmaNoticeService.paletteCreating();
        try {
            // 1. Brand 색상 팔레트 섹션 생성 (generateBrandColorPalette 결과)
            for (const [theme, themeData] of sortedThemes) {
                if (themeData && themeData.tokens) {
                    await figmaUIService.generatePalette(themeData, `brand-${theme}`);
                }
            }

            // 2. Semantic tokens 섹션 생성
            if (dependentTokens?.semantic) {
                await figmaUIService.generateDependentTokensListOnly(
                    dependentTokens.semantic,
                    'semantic-tokens',
                    generatedBrandPalette,
                );
            }

            // 3. Component-specific tokens 섹션 생성
            if (dependentTokens?.componentSpecific) {
                await figmaUIService.generateDependentTokensListOnly(
                    dependentTokens.componentSpecific,
                    'component-tokens',
                    generatedBrandPalette,
                );
            }

            // 모든 팔레트 생성 완료 알림
            figmaNoticeService.brandPaletteCreated();
        } catch (error) {
            // 팔레트 생성 실패 알림
            figmaNoticeService.brandPaletteCreateFailed();
            throw error;
        }
    },

    /**
     * Brand Figma Variables 생성
     * - Light/Dark 모드 지원
     * - Brand token 구조
     */
    async createBrandFigmaVariables(data: {
        generatedBrandPalette: Pick<ColorPaletteResult, 'light' | 'dark'>;
        collectionName: string;
    }): Promise<void> {
        try {
            await figmaVariableService.createBrandVariables(
                data.generatedBrandPalette,
                data.collectionName,
            );

            figmaNoticeService.variablesCreated();
        } catch (error) {
            figmaNoticeService.variablesCreateFailed();
            throw error;
        }
    },
} as const;
