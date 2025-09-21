import type { ColorToken, TokenContainer } from '@vapor-ui/color-generator';

import { Logger } from '~/common/logger';
import { hexToFigmaColor } from '~/plugin/utils/color';

// ============================================================================
// Types
// ============================================================================

interface GroupConfig {
    name: string;
    tokenContainer: TokenContainer;
}

// ============================================================================
// Public Service
// ============================================================================

export const figmaVariableService = {
    /**
     * Creates Figma variables from primitive color palette (base, light, dark)
     * No light/dark modes - each theme creates separate variables
     */
    async createPrimitiveVariables(
        palette: { base?: TokenContainer; light: TokenContainer; dark: TokenContainer },
        collectionName: string,
    ): Promise<void> {
        try {
            Logger.variables.creating(collectionName);

            const collection = await createOrGetCollection(collectionName);

            // Create groups for each available theme
            const groups: GroupConfig[] = [];

            if (palette.base) {
                groups.push({ name: 'base', tokenContainer: palette.base });
            }
            groups.push({ name: 'light', tokenContainer: palette.light });
            groups.push({ name: 'dark', tokenContainer: palette.dark });

            await createVariablesFromGroups(collection, groups);

            // Log creation success
            const variables = await figma.variables.getLocalVariablesAsync();
            const variableCount = variables.filter(
                (v) => v.variableCollectionId === collection.id,
            ).length;

            Logger.variables.created(collectionName, variableCount);
        } catch (error) {
            Logger.variables.error('Primitive 변수 생성 실패', error);
            throw error;
        }
    },

    /**
     * Creates Figma variables from brand color palette (light, dark)
     * No light/dark modes - each theme creates separate variables
     */
    async createBrandVariables(
        palette: { light: TokenContainer; dark: TokenContainer },
        collectionName: string,
    ): Promise<void> {
        try {
            Logger.variables.creating(collectionName);

            const collection = await createOrGetCollection(collectionName);

            // Create groups for each available theme
            const groups: GroupConfig[] = [
                { name: 'light', tokenContainer: palette.light },
                { name: 'dark', tokenContainer: palette.dark },
            ];

            await createVariablesFromGroups(collection, groups);

            // Log creation success
            const variables = await figma.variables.getLocalVariablesAsync();
            const variableCount = variables.filter(
                (v) => v.variableCollectionId === collection.id,
            ).length;

            Logger.variables.created(collectionName, variableCount);
        } catch (error) {
            Logger.variables.error('Brand 변수 생성 실패', error);
            throw error;
        }
    },

    /**
     * Generic function to create variables for any palette structure
     * Supports both grouped and ungrouped variables
     */
    async createVariables(data: {
        palette: Record<string, TokenContainer>;
        collectionName: string;
        groupNames?: string[]; // If provided, only create variables for these groups
        useGroups?: boolean; // If false, create variables without groups
    }): Promise<void> {
        const { palette, collectionName, groupNames, useGroups = true } = data;

        try {
            Logger.variables.creating(collectionName);

            const collection = await createOrGetCollection(collectionName);

            let groups: GroupConfig[] = [];

            if (useGroups) {
                // Create groups for specified themes or all available themes
                const themeNames = groupNames || Object.keys(palette);
                groups = themeNames
                    .filter((themeName) => palette[themeName]) // Only include existing themes
                    .map((themeName) => ({
                        name: themeName,
                        tokenContainer: palette[themeName],
                    }));

                await createVariablesFromGroups(collection, groups);
            } else {
                // Create variables without groups (flatten all tokens)
                const allTokens: Record<string, ColorToken | string> = {};

                Object.entries(palette).forEach(([_themeName, tokenContainer]) => {
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
            Logger.variables.error('변수 생성 실패', error);
            throw error;
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

// ============================================================================
// Variable Creation
// ============================================================================

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
    tokens: Record<string, ColorToken | string>,
    groupPrefix: string,
): Promise<void> {
    const variablePromises: Promise<Variable>[] = [];

    Object.entries(tokens).forEach(([tokenName, tokenValue]) => {
        // Only process ColorToken objects (not string references)
        if (typeof tokenValue === 'object' && tokenValue !== null && 'hex' in tokenValue) {
            const colorToken = tokenValue as ColorToken;

            // Create variable name with or without group prefix
            const variableName = groupPrefix
                ? `${groupPrefix}/${formatTokenName(tokenName)}`
                : formatTokenName(tokenName);

            variablePromises.push(
                createVariable(collection, variableName, colorToken.hex, colorToken.codeSyntax),
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

// ============================================================================
// Utility Functions
// ============================================================================

function formatTokenName(tokenName: string): string {
    // Convert token names like "color-blue-500" to "blue/500"
    // or "vapor-color-background-canvas" to "background/canvas"

    if (tokenName.startsWith('color-')) {
        // Handle "color-blue-500" -> "blue/500"
        const parts = tokenName.substring(6).split('-'); // Remove "color-" prefix
        if (parts.length >= 2) {
            const colorFamily = parts.slice(0, -1).join('-'); // Join all but last part
            const shade = parts[parts.length - 1];
            return `${colorFamily}/${shade}`;
        }
    } else if (tokenName.startsWith('vapor-color-')) {
        // Handle "vapor-color-background-canvas" -> "background/canvas"
        const parts = tokenName.substring(12).split('-'); // Remove "vapor-color-" prefix
        if (parts.length >= 2) {
            const colorFamily = parts.slice(0, -1).join('-'); // Join all but last part
            const shade = parts[parts.length - 1];
            return `${colorFamily}/${shade}`;
        }
    }

    // Fallback: use original token name with slashes for dashes
    return tokenName.replace(/-/g, '/');
}
