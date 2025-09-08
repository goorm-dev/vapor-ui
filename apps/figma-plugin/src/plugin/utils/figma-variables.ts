import type { ColorToken } from '@vapor-ui/color-generator';

// ============================================================================
// Types
// ============================================================================

export interface BaseColorTokens {
    white: ColorToken;
    black: ColorToken;
}

export interface ThemeTokens {
    [colorName: string]:
        | {
              [shade: string]: ColorToken;
          }
        | { canvas: ColorToken };
}

export interface FigmaVariablesConfig {
    collectionName: string;
    includeBase?: boolean;
    notificationMessage?: string;
}

// ============================================================================
// Core Figma Variable Operations
// ============================================================================

/**
 * Creates or gets existing variable collection
 */
export async function createOrGetCollection(name: string): Promise<VariableCollection> {
    const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const existing = existingCollections.find((collection) => collection.name === name);

    return existing || figma.variables.createVariableCollection(name);
}

/**
 * Creates or updates a Figma variable with color and code syntax
 */
export async function createVariable(
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

/**
 * Updates an existing Figma variable
 */
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

/**
 * Creates a new Figma variable
 */
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

/**
 * Converts hex color to Figma RGB color format
 */
export function hexToFigmaColor(hex: string): RGB {
    const cleanHex = hex.replace('#', '');

    return {
        r: parseInt(cleanHex.substring(0, 2), 16) / 255,
        g: parseInt(cleanHex.substring(2, 4), 16) / 255,
        b: parseInt(cleanHex.substring(4, 6), 16) / 255,
    };
}

// ============================================================================
// Color Processing Utilities
// ============================================================================

/**
 * Sorts color shades by numeric value (050, 100, 200, etc.)
 */
export function sortColorShades(shades: [string, ColorToken][]): [string, ColorToken][] {
    return shades.sort(([a], [b]) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return numA - numB;
    });
}

/**
 * Filters and sorts color shades from color palette
 */
export function getValidColorShades(colorShades: unknown): [string, ColorToken][] {
    if (typeof colorShades !== 'object' || !colorShades) {
        return [];
    }

    const entries = Object.entries(colorShades).filter(
        ([_, colorToken]) => typeof colorToken === 'object' && colorToken && 'hex' in colorToken,
    ) as [string, ColorToken][];

    return sortColorShades(entries);
}

// ============================================================================
// Variable Creation Strategies
// ============================================================================

/**
 * Creates base color variables (white, black)
 */
export async function createBaseVariables(
    collection: VariableCollection,
    baseColors: BaseColorTokens,
): Promise<void> {
    await Promise.all([
        createVariable(collection, 'base/white', baseColors.white.hex, baseColors.white.codeSyntax),
        createVariable(collection, 'base/black', baseColors.black.hex, baseColors.black.codeSyntax),
    ]);
}

/**
 * Creates theme-specific variables for a color family
 */
export async function createThemeVariables(
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

// ============================================================================
// Mode-based Variable Creation for Semantic Colors
// ============================================================================

/**
 * Creates or gets existing variable collection with light and dark modes
 */
export async function createOrGetSemanticCollection(name: string): Promise<{
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
    const lightMode = existingModes.find(mode => mode.name === 'Light');
    const darkMode = existingModes.find(mode => mode.name === 'Dark');

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

/**
 * Creates or updates a semantic Figma variable with light and dark mode values
 */
export async function createSemanticVariable(
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

/**
 * Creates semantic theme variables with mode support
 */
export async function createSemanticThemeVariables(
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

        if (colorName === 'background' && lightColorShades && 'canvas' in lightColorShades && 
            darkColorShades && 'canvas' in darkColorShades) {
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

/**
 * Creates semantic Figma variables with light and dark modes
 */
export async function createSemanticFigmaVariables(
    palette: { light: ThemeTokens; dark: ThemeTokens },
    config: FigmaVariablesConfig,
): Promise<void> {
    console.log('Creating Semantic Figma Variables with modes...', palette);

    const { collection, lightModeId, darkModeId } = await createOrGetSemanticCollection(config.collectionName);

    // Create semantic variables with light and dark modes
    await createSemanticThemeVariables(collection, lightModeId, darkModeId, palette.light, palette.dark);

    console.log('Semantic Figma Variables creation completed');
}

// ============================================================================
// Main Factory Function
// ============================================================================

/**
 * Generic function to create Figma variables from color palette
 */
export async function createFigmaVariables(
    palette: { light: ThemeTokens; dark: ThemeTokens; base?: BaseColorTokens },
    config: FigmaVariablesConfig,
): Promise<void> {
    console.log(
        `Creating ${config.includeBase ? 'Full' : 'Semantic'} Figma Variables...`,
        palette,
    );

    const collection = await createOrGetCollection(config.collectionName);

    // Create base variables if included
    if (config.includeBase && palette.base) {
        await createBaseVariables(collection, palette.base);
    }

    // Create theme variables
    await Promise.all([
        createThemeVariables(collection, 'light', palette.light),
        createThemeVariables(collection, 'dark', palette.dark),
    ]);

    console.log('Figma Variables creation completed');
}
