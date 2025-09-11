import type { ColorPaletteCollection } from '@vapor-ui/color-generator';

/**
 * Creates Figma Variables from generated color palette using group structure
 */
export async function handleCreateFigmaVariables(
    generatedPalette: ColorPaletteCollection, 
    collectionName: string
): Promise<void> {
    try {
        console.log('Creating Figma Variables...', generatedPalette);

        // Create or get single variable collection
        const collection = await createOrGetCollection(collectionName);

        // Create base variables (white, black)
        await createVariable(collection, 'base/white', generatedPalette.base.white.hex);
        await createVariable(collection, 'base/black', generatedPalette.base.black.hex);

        // Create theme-specific variables with group structure
        for (const themeName of ['light', 'dark'] as const) {
            const themeData = generatedPalette[themeName];

            for (const [colorName, colorShades] of Object.entries(themeData)) {
                // Handle background special case
                if (colorName === 'background' && 'canvas' in colorShades) {
                    await createVariable(
                        collection,
                        `${themeName}/${colorName}/canvas`,
                        colorShades.canvas.hex
                    );
                } else {
                    // Handle color shades (050, 100, 200, etc.) - sort by numeric value
                    const sortedShades = Object.entries(colorShades)
                        .filter(([_, colorToken]) => typeof colorToken === 'object' && 'hex' in colorToken)
                        .sort(([a], [b]) => {
                            // Convert shade strings to numbers for proper sorting
                            const numA = parseInt(a, 10);
                            const numB = parseInt(b, 10);
                            return numA - numB;
                        });

                    for (const [shade, colorToken] of sortedShades) {
                        await createVariable(
                            collection,
                            `${themeName}/${colorName}/${shade}`,
                            colorToken.hex
                        );
                    }
                }
            }
        }

        figma.notify('✅ Figma Variables created successfully!');
        console.log('Figma Variables creation completed');
    } catch (error) {
        console.error('Error creating Figma Variables:', error);
        figma.notify('❌ Failed to create Figma Variables');
    }
}

/**
 * Creates or gets existing variable collection
 */
async function createOrGetCollection(name: string): Promise<VariableCollection> {
    // Check if collection already exists
    const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const existing = existingCollections.find(collection => collection.name === name);

    if (existing) {
        return existing;
    }

    // Create new collection
    return figma.variables.createVariableCollection(name);
}

/**
 * Creates a simple variable without modes
 */
async function createVariable(
    collection: VariableCollection,
    name: string,
    hexColor: string
): Promise<Variable> {
    // Check if variable already exists
    const existingVariables = await figma.variables.getLocalVariablesAsync();
    const existing = existingVariables.find(
        variable => variable.name === name && variable.variableCollectionId === collection.id
    );

    if (existing) {
        // Update existing variable
        existing.setValueForMode(collection.defaultModeId, hexToFigmaColor(hexColor));
        return existing;
    }

    // Create new variable
    const variable = figma.variables.createVariable(name, collection, 'COLOR');
    variable.setValueForMode(collection.defaultModeId, hexToFigmaColor(hexColor));
    return variable;
}

/**
 * Converts hex color to Figma RGB color format
 */
function hexToFigmaColor(hex: string): RGB {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    return { r, g, b };
}