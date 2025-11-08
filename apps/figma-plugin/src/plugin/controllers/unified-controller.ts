import type { PaletteChip, SemanticResult, ThemeResult } from '@vapor-ui/color-generator';

import { figmaNoticeService } from '../services/figma-notification';
import { figmaUIService } from '../services/figma-ui-service';
import { figmaVariableService } from '../services/figma-variable-service';
import { sortThemesByOrder } from '../utils/theme-sorter';

/**
 * Internal type for UI service data structure
 * Maps new API structure to the format expected by figma-ui-service
 */
interface ThemeData {
    tokens: Record<string, PaletteChip | string>;
    metadata?: {
        theme: string;
        type: string;
    };
}

/**
 * Converts ThemeResult structure to the format expected by figma-ui-service
 */
function convertThemeResultToThemeData(
    themeResult: ThemeResult,
    mode: 'lightModeTokens' | 'darkModeTokens',
): ThemeData {
    const modeData = themeResult[mode];

    return {
        tokens: {
            // Add background canvas token
            'color-background-canvas': {
                name: modeData.backgroundCanvas.name,
                hex: modeData.backgroundCanvas.hex,
                oklch: modeData.backgroundCanvas.oklch,
                codeSyntax: modeData.backgroundCanvas.codeSyntax,
                deltaE: 0,
            },
            // Add all palette chips
            ...modeData.palettes.reduce(
                (acc, palette) => {
                    Object.values(palette.chips).forEach((chip) => {
                        acc[chip.name] = chip;
                    });
                    return acc;
                },
                {} as Record<string, PaletteChip>,
            ),
        },
    };
}

/**
 * Converts SemanticResult to the format expected by figma-ui-service
 */
function convertSemanticResultToThemeData(
    semanticTokens: SemanticResult['lightModeTokens'] | SemanticResult['darkModeTokens'],
): ThemeData {
    // Convert SemanticTokens interface to Record<string, string> for UI service
    return {
        tokens: { ...semanticTokens },
    };
}

export const unifiedController = {
    async createUnifiedPaletteSections(data: {
        generatedTheme: ThemeResult;
        semanticTokens: SemanticResult;
    }): Promise<void> {
        const { generatedTheme, semanticTokens } = data;

        figmaNoticeService.paletteCreating();
        try {
            // 1. Create base tokens section
            if (generatedTheme.baseTokens) {
                const baseThemeData: ThemeData = {
                    tokens: generatedTheme.baseTokens,
                };
                await figmaUIService.generatePalette(baseThemeData, 'base');
            }

            // 2. Create primitive palette sections for light and dark modes
            const sortedThemes = sortThemesByOrder(generatedTheme, [
                'lightModeTokens',
                'darkModeTokens',
            ] as const);

            for (const [theme, themeData] of sortedThemes) {
                if (themeData && themeData.palettes) {
                    const convertedThemeData = convertThemeResultToThemeData(generatedTheme, theme);
                    const themeName = theme === 'lightModeTokens' ? 'light' : 'dark';
                    console.log('convertedThemeData', convertedThemeData);

                    await figmaUIService.generatePalette(convertedThemeData, themeName);
                }
            }

            // 3. Create semantic tokens sections
            if (semanticTokens) {
                const semanticLightData = convertSemanticResultToThemeData(
                    semanticTokens.lightModeTokens,
                );
                const semanticDarkData = convertSemanticResultToThemeData(
                    semanticTokens.darkModeTokens,
                );

                console.log('semanticLightData', semanticLightData);

                await figmaUIService.generatePalette(semanticLightData, 'semantic-light');
                await figmaUIService.generatePalette(semanticDarkData, 'semantic-dark');
            }

            figmaNoticeService.paletteCreated();
        } catch (error) {
            figmaNoticeService.paletteCreateFailed();
            throw error;
        }
    },

    async createUnifiedFigmaVariables(data: {
        generatedTheme: ThemeResult;
        collectionName: string;
    }): Promise<void> {
        figmaNoticeService.variableCreating();
        try {
            await figmaVariableService.createUnifiedVariables(
                data.generatedTheme,
                data.collectionName,
            );

            figmaNoticeService.variablesCreated();
        } catch (error) {
            figmaNoticeService.variablesCreateFailed();
            throw error;
        }
    },
} as const;
