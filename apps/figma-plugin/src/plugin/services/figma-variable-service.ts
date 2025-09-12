import type { ColorPaletteResult, ColorToken } from '@vapor-ui/color-generator';

import { getValidColorShades, hexToFigmaColor } from '~/plugin/utils/color';
import { Logger } from '~/common/logger';
import { figmaNoticeService } from './figma-notification';

// ============================================================================
// Types
// ============================================================================

interface BaseColorTokens {
    white: ColorToken;
    black: ColorToken;
}

interface ThemeTokens {
    [colorName: string]:
        | {
              [shade: string]: ColorToken;
          }
        | { canvas: ColorToken };
}

// ============================================================================
// Public Service
// ============================================================================

export const figmaVariableService = {
    /**
     * Creates primitive Figma variables (includes base colors)
     */
    async createPrimitiveVariables(
        palette: ColorPaletteResult,
        collectionName: string,
    ): Promise<void> {
        try {
            Logger.variables.creating(collectionName);

            const collection = await createOrGetCollection(collectionName);

            // Create base variables
            if (palette.base) {
                await createBaseVariables(collection, palette.base.tokens as unknown as BaseColorTokens);
            }

            // Create theme variables
            await Promise.all([
                createThemeVariables(collection, 'light', palette.light.tokens as unknown as ThemeTokens),
                createThemeVariables(collection, 'dark', palette.dark.tokens as unknown as ThemeTokens),
            ]);

            // Verify creation
            const collections = await figma.variables.getLocalVariableCollectionsAsync();
            const targetCollection = collections.find((c) => c.name === collectionName);
            const variables = await figma.variables.getLocalVariablesAsync();
            const variableCount = variables.filter(
                (v) => v.variableCollectionId === targetCollection?.id,
            ).length;

            if (variableCount === 0) {
                throw new Error('변수가 생성되지 않았습니다');
            }

            Logger.variables.created(collectionName, variableCount);
            figmaNoticeService.variablesCreated();
        } catch (error) {
            Logger.variables.error('Primitive Figma 변수 생성 실패', error);
            figmaNoticeService.variablesCreateFailed();
        }
    },

    /**
     * Creates brand Figma variables (with light/dark modes)
     * Alias for createSemanticVariables for backward compatibility
     */
    async createBrandVariables(
        palette: Pick<ColorPaletteResult, 'light' | 'dark'>,
        collectionName: string,
    ): Promise<void> {
        return this.createSemanticVariables(palette, collectionName);
    },

    /**
     * Creates semantic Figma variables (with light/dark modes)
     */
    async createSemanticVariables(
        palette: Pick<ColorPaletteResult, 'light' | 'dark'>,
        collectionName: string,
    ): Promise<void> {
        try {
            Logger.variables.creating(collectionName);

            const { collection, lightModeId, darkModeId } =
                await createOrGetSemanticCollection(collectionName);

            // Create semantic variables with light and dark modes
            await createSemanticThemeVariables(
                collection,
                lightModeId,
                darkModeId,
                palette.light.tokens as unknown as ThemeTokens,
                palette.dark.tokens as unknown as ThemeTokens,
            );

            // Verify creation
            const collections = await figma.variables.getLocalVariableCollectionsAsync();
            const targetCollection = collections.find((c) => c.name === collectionName);
            const variables = await figma.variables.getLocalVariablesAsync();
            const variableCount = variables.filter(
                (v) => v.variableCollectionId === targetCollection?.id,
            ).length;

            if (variableCount === 0) {
                throw new Error('시맨틱 변수가 생성되지 않았습니다');
            }

            Logger.variables.created(collectionName, variableCount);
            figmaNoticeService.variablesCreated();
        } catch (error) {
            Logger.variables.error('Semantic Figma 변수 생성 실패', error);
            figmaNoticeService.variablesCreateFailed();
        }
    },
} as const;

// ============================================================================
// Collection Management
// ============================================================================

async function createOrGetCollection(name: string): Promise<VariableCollection> {
    const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const existing = existingCollections.find((collection) => collection.name === name);

    return existing || figma.variables.createVariableCollection(name);
}

async function createOrGetSemanticCollection(name: string): Promise<{
    collection: VariableCollection;
    lightModeId: string;
    darkModeId: string;
}> {
    const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
    let collection = existingCollections.find((collection) => collection.name === name);

    if (!collection) {
        collection = figma.variables.createVariableCollection(name);
    }

    // Ensure we have light and dark modes
    let lightModeId = collection.defaultModeId;
    let darkModeId: string;

    const existingModes = collection.modes;
    const lightMode = existingModes.find((mode) => mode.name === 'Light');
    const darkMode = existingModes.find((mode) => mode.name === 'Dark');

    if (lightMode && darkMode) {
        lightModeId = lightMode.modeId;
        darkModeId = darkMode.modeId;
    } else if (lightMode) {
        lightModeId = lightMode.modeId;
        darkModeId = collection.addMode('Dark');
    } else if (darkMode) {
        // Rename default mode to Light and use existing dark mode
        collection.renameMode(collection.defaultModeId, 'Light');
        lightModeId = collection.defaultModeId;
        darkModeId = darkMode.modeId;
    } else {
        // Rename default mode to Light and create Dark mode
        collection.renameMode(collection.defaultModeId, 'Light');
        lightModeId = collection.defaultModeId;
        darkModeId = collection.addMode('Dark');
    }

    return { collection, lightModeId, darkModeId };
}

// ============================================================================
// Variable Creation
// ============================================================================

async function createVariable(
    collection: VariableCollection,
    name: string,
    hexColor: string,
    codeSyntax?: string,
): Promise<Variable> {
    const existingVariables = await figma.variables.getLocalVariablesAsync();
    const existing = existingVariables.find(
        (variable) => variable.name === name && variable.variableCollectionId === collection.id,
    );

    if (existing) {
        return updateExistingVariable(existing, collection, hexColor, codeSyntax);
    }

    return createNewVariable(collection, name, hexColor, codeSyntax);
}

function updateExistingVariable(
    variable: Variable,
    collection: VariableCollection,
    hexColor: string,
    codeSyntax?: string,
): Variable {
    variable.setValueForMode(collection.defaultModeId, hexToFigmaColor(hexColor));

    if (codeSyntax) {
        variable.setVariableCodeSyntax('WEB', codeSyntax);
    }

    return variable;
}

function createNewVariable(
    collection: VariableCollection,
    name: string,
    hexColor: string,
    codeSyntax?: string,
): Variable {
    const variable = figma.variables.createVariable(name, collection, 'COLOR');
    variable.setValueForMode(collection.defaultModeId, hexToFigmaColor(hexColor));

    if (codeSyntax) {
        variable.setVariableCodeSyntax('WEB', codeSyntax);
    }

    return variable;
}

async function createSemanticVariable(
    collection: VariableCollection,
    lightModeId: string,
    darkModeId: string,
    name: string,
    lightColor: string,
    darkColor: string,
    lightCodeSyntax?: string,
): Promise<Variable> {
    const existingVariables = await figma.variables.getLocalVariablesAsync();
    const existing = existingVariables.find(
        (variable) => variable.name === name && variable.variableCollectionId === collection.id,
    );

    let variable: Variable;
    if (existing) {
        variable = existing;
    } else {
        variable = figma.variables.createVariable(name, collection, 'COLOR');
    }

    // Set values for both modes
    variable.setValueForMode(lightModeId, hexToFigmaColor(lightColor));
    variable.setValueForMode(darkModeId, hexToFigmaColor(darkColor));

    // Set code syntax (using light mode syntax as primary)
    if (lightCodeSyntax) {
        variable.setVariableCodeSyntax('WEB', lightCodeSyntax);
    }

    return variable;
}

// ============================================================================
// Variable Creation Strategies
// ============================================================================

async function createBaseVariables(
    collection: VariableCollection,
    baseColors: BaseColorTokens,
): Promise<void> {
    await Promise.all([
        createVariable(collection, 'base/white', baseColors.white.hex, baseColors.white.codeSyntax),
        createVariable(collection, 'base/black', baseColors.black.hex, baseColors.black.codeSyntax),
    ]);
}

async function createThemeVariables(
    collection: VariableCollection,
    themeName: 'light' | 'dark',
    themeData: ThemeTokens,
): Promise<void> {
    const variablePromises: Promise<Variable>[] = [];

    for (const [colorName, colorShades] of Object.entries(themeData)) {
        if (colorName === 'background' && colorShades && 'canvas' in colorShades) {
            // Handle background canvas
            variablePromises.push(
                createVariable(
                    collection,
                    `${themeName}/${colorName}/canvas`,
                    colorShades.canvas.hex,
                    colorShades.canvas.codeSyntax,
                ),
            );
        } else {
            // Handle color shades (050, 100, 200, etc.)
            const validShades = getValidColorShades(colorShades);

            for (const [shade, colorToken] of validShades) {
                variablePromises.push(
                    createVariable(
                        collection,
                        `${themeName}/${colorName}/${shade}`,
                        colorToken.hex,
                        colorToken.codeSyntax,
                    ),
                );
            }
        }
    }

    await Promise.all(variablePromises);
}

async function createSemanticThemeVariables(
    collection: VariableCollection,
    lightModeId: string,
    darkModeId: string,
    lightTheme: ThemeTokens,
    darkTheme: ThemeTokens,
): Promise<void> {
    const variablePromises: Promise<Variable>[] = [];

    // Process each color family
    for (const [colorName, lightColorShades] of Object.entries(lightTheme)) {
        const darkColorShades = darkTheme[colorName];

        if (
            colorName === 'background' &&
            lightColorShades &&
            'canvas' in lightColorShades &&
            darkColorShades &&
            'canvas' in darkColorShades
        ) {
            // Handle background canvas
            variablePromises.push(
                createSemanticVariable(
                    collection,
                    lightModeId,
                    darkModeId,
                    `${colorName}/canvas`,
                    lightColorShades.canvas.hex,
                    darkColorShades.canvas.hex,
                    lightColorShades.canvas.codeSyntax,
                ),
            );
        } else {
            // Handle color shades (050, 100, 200, etc.)
            const lightShades = getValidColorShades(lightColorShades);
            const darkShades = getValidColorShades(darkColorShades);

            for (const [shade, lightColorToken] of lightShades) {
                const darkColorToken = darkShades.find(([darkShade]) => darkShade === shade)?.[1];

                if (darkColorToken) {
                    variablePromises.push(
                        createSemanticVariable(
                            collection,
                            lightModeId,
                            darkModeId,
                            `${colorName}/${shade}`,
                            lightColorToken.hex,
                            darkColorToken.hex,
                            lightColorToken.codeSyntax,
                        ),
                    );
                }
            }
        }
    }

    await Promise.all(variablePromises);
}