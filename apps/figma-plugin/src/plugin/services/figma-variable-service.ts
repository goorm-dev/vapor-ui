import type { PaletteChip, ThemeResult } from '@vapor-ui/color-generator';

import { Logger } from '~/common/logger';
import { hexToFigmaColor } from '~/plugin/utils/color';

/* -------------------------------------------------------------------------------------------------
 * Internal Types
 * -----------------------------------------------------------------------------------------------*/

/**
 * Internal type for token container used within Figma plugin
 * This is not exported from color-generator as it's an implementation detail
 */
interface TokenContainer {
    tokens: Record<string, PaletteChip | string>;
    metadata?: {
        type: string;
        theme: string;
    };
}

/* -------------------------------------------------------------------------------------------------
 * Public API
 * -----------------------------------------------------------------------------------------------*/

export const figmaVariableService = {
    /**
     * Creates Figma variables from primitive color palette (base, light, dark)
     * This is a convenience wrapper around the generic createVariables function.
     */
    async createPrimitiveVariables(
        palette: { base?: TokenContainer; light: TokenContainer; dark: TokenContainer },
        collectionName: string,
    ): Promise<void> {
        await createVariables({
            palette,
            collectionName,
            context: 'Primitive',
        });
    },

    /**
     * Creates Figma variables from brand color palette (light, dark)
     * This is a convenience wrapper around the generic createVariables function.
     */
    async createBrandVariables(
        palette: { light: TokenContainer; dark: TokenContainer },
        collectionName: string,
    ): Promise<void> {
        await createVariables({
            palette,
            collectionName,
            context: 'Brand',
        });
    },

    /**
     * Creates Figma variables from unified theme result (new architecture)
     * Handles the new ThemeResult structure with palettes array format
     */
    async createUnifiedVariables(themeResult: ThemeResult, collectionName: string): Promise<void> {
        try {
            Logger.variables.creating(collectionName);

            // Convert new ThemeResult structure to the format expected by createVariables
            const convertedPalette: Record<string, TokenContainer> = {};

            // Convert lightModeTokens
            if (themeResult.lightModeTokens) {
                convertedPalette.light = {
                    tokens: {
                        // Convert palettes array to flat structure
                        ...themeResult.lightModeTokens.palettes.reduce(
                            (acc: Record<string, PaletteChip>, palette) => {
                                Object.values(palette.chips).forEach((chip) => {
                                    acc[chip.name] = chip;
                                });
                                return acc;
                            },
                            {},
                        ),
                        // Add background canvas (convert BackgroundCanvas to PaletteChip format)
                        'color-background-canvas': {
                            name: themeResult.lightModeTokens.backgroundCanvas.name,
                            hex: themeResult.lightModeTokens.backgroundCanvas.hex,
                            oklch: themeResult.lightModeTokens.backgroundCanvas.oklch,
                            codeSyntax: themeResult.lightModeTokens.backgroundCanvas.codeSyntax,
                            deltaE: 0,
                        },
                    },
                    metadata: {
                        theme: 'light',
                        type: 'primitive',
                    },
                };
            }

            // Convert darkModeTokens
            if (themeResult.darkModeTokens) {
                convertedPalette.dark = {
                    tokens: {
                        // Convert palettes array to flat structure
                        ...themeResult.darkModeTokens.palettes.reduce(
                            (acc: Record<string, PaletteChip>, palette) => {
                                Object.values(palette.chips).forEach((chip) => {
                                    acc[chip.name] = chip;
                                });
                                return acc;
                            },
                            {},
                        ),
                        // Add background canvas (convert BackgroundCanvas to PaletteChip format)
                        'color-background-canvas': {
                            name: themeResult.darkModeTokens.backgroundCanvas.name,
                            hex: themeResult.darkModeTokens.backgroundCanvas.hex,
                            oklch: themeResult.darkModeTokens.backgroundCanvas.oklch,
                            codeSyntax: themeResult.darkModeTokens.backgroundCanvas.codeSyntax,
                            deltaE: 0,
                        },
                    },
                    metadata: {
                        theme: 'dark',
                        type: 'primitive',
                    },
                };
            }

            // Add base tokens if available
            if (themeResult.baseTokens) {
                convertedPalette.base = {
                    tokens: themeResult.baseTokens,
                    metadata: {
                        theme: 'base',
                        type: 'primitive',
                    },
                };
            }

            await createVariables({
                palette: convertedPalette,
                collectionName,
                context: 'Unified',
            });

            Logger.variables.created(collectionName, Object.keys(convertedPalette).length);
        } catch (error) {
            Logger.variables.error('통합 변수 생성 실패', error);
            throw error;
        }
    },

    /**
     * Exposing the generic function for more complex use cases.
     */
    createVariables,
} as const;

/* -------------------------------------------------------------------------------------------------
 * Variable Creation
 * -----------------------------------------------------------------------------------------------*/

interface GroupConfig {
    name: string;
    tokenContainer: TokenContainer;
}

/**
 * Generic function to create variables for any palette structure
 * Supports both grouped and ungrouped variables.
 */
async function createVariables(data: {
    palette: Record<string, TokenContainer | undefined>;
    collectionName: string;
    groupNames?: string[];
    useGroups?: boolean;
    context?: string; // Optional context for more specific error logging
}): Promise<void> {
    const { palette, collectionName, groupNames, useGroups = true, context } = data;

    try {
        Logger.variables.creating(collectionName);

        const collection = await createOrGetCollection(collectionName);

        if (useGroups) {
            // Create groups for specified themes or all available themes
            const themeNames = groupNames || Object.keys(palette);
            const groups: GroupConfig[] = themeNames
                .map((themeName) => {
                    const tokenContainer = palette[themeName];
                    return tokenContainer ? { name: themeName, tokenContainer } : null;
                })
                .filter((g): g is GroupConfig => g !== null); // Filter out nulls and type guard

            await createVariablesFromGroups(collection, groups);
        } else {
            // Create variables without groups (flatten all tokens)
            const allTokens: Record<string, PaletteChip | string> = {};

            Object.values(palette).forEach((tokenContainer) => {
                if (!tokenContainer) return;
                Object.entries(tokenContainer.tokens).forEach(([tokenName, tokenValue]) => {
                    // Use original token name without theme prefix
                    allTokens[tokenName] = tokenValue;
                });
            });

            await createVariablesFromTokens(collection, allTokens, '');
        }

        // Log creation success
        const variables = await figma.variables.getLocalVariablesAsync();
        const variableCount = variables.filter(
            (v) => v.variableCollectionId === collection.id,
        ).length;

        Logger.variables.created(collectionName, variableCount);
    } catch (error) {
        const errorMessage = context ? `${context} 변수 생성 실패` : '변수 생성 실패';
        Logger.variables.error(errorMessage, error);
        throw error;
    }
}

async function createOrGetCollection(name: string): Promise<VariableCollection> {
    const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const existing = existingCollections.find((collection) => collection.name === name);

    return existing || figma.variables.createVariableCollection(name);
}

async function createVariablesFromGroups(
    collection: VariableCollection,
    groups: GroupConfig[],
): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const group of groups) {
        promises.push(
            createVariablesFromTokens(collection, group.tokenContainer.tokens, group.name),
        );
    }

    await Promise.all(promises);
}

async function createVariablesFromTokens(
    collection: VariableCollection,
    tokens: Record<string, PaletteChip | string>,
    groupPrefix: string,
): Promise<void> {
    const variablePromises: Promise<Variable>[] = [];

    Object.entries(tokens).forEach(([tokenName, tokenValue]) => {
        // Only process PaletteChip objects (not string references)
        if (typeof tokenValue === 'object' && tokenValue !== null && 'hex' in tokenValue) {
            const paletteChip = tokenValue as PaletteChip;

            // Create variable name with or without group prefix
            const variableName = groupPrefix
                ? `${groupPrefix}/${formatTokenName(tokenName)}`
                : formatTokenName(tokenName);

            variablePromises.push(
                createVariable(collection, variableName, paletteChip.hex, paletteChip.codeSyntax),
            );
        }
    });

    await Promise.all(variablePromises);
}

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

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/

const PRIMITIVE_PREFIX = 'color-';
const SEMANTIC_PREFIX = 'vapor-color-';

function formatTokenName(tokenName: string): string {
    if (tokenName.startsWith(PRIMITIVE_PREFIX)) {
        const parts = tokenName.substring(PRIMITIVE_PREFIX.length).split('-'); // Remove "color-" prefix

        if (parts.length >= 2) {
            // Handle "color-blue-500" -> "blue/blue-500"
            const colorFamily = parts.slice(0, -1).join('-');
            const shade = parts[parts.length - 1];
            return `${colorFamily}/${colorFamily}-${shade}`;
        } else if (parts.length === 1) {
            // Handle single-part tokens like "color-black" -> "black"
            return parts[0];
        }
    } else if (tokenName.startsWith(SEMANTIC_PREFIX)) {
        // Handle "vapor-color-background-canvas" -> "background/background-canvas"
        const parts = tokenName.substring(SEMANTIC_PREFIX.length).split('-'); // Remove "vapor-color-" prefix
        if (parts.length >= 2) {
            const colorFamily = parts.slice(0, -1).join('-');
            const shade = parts[parts.length - 1];
            return `${colorFamily}/${colorFamily}-${shade}`;
        }
    }

    // Fallback: use original token name with slashes for dashes
    return tokenName.replace(/-/g, '/');
}
