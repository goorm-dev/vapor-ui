import type { ColorPaletteCollection } from '@vapor-ui/color-generator';
import { createFigmaVariables } from '../utils/figma-variables';

/**
 * Creates Figma Variables from semantic color palette (excludes base colors)
 */
export async function handleCreateSemanticFigmaVariables(
    generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>, 
    collectionName: string
): Promise<void> {
    return createFigmaVariables(generatedSemanticPalette, {
        collectionName,
        includeBase: false,
        notificationMessage: '✅ Semantic Figma Variables created successfully!'
    });
}