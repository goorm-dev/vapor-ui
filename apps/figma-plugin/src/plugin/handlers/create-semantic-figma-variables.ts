import type { ColorPaletteCollection } from '@vapor-ui/color-generator';
import { createSemanticFigmaVariables } from '../utils/figma-variables';

/**
 * Creates Figma Variables from semantic color palette with light and dark modes
 */
export async function handleCreateSemanticFigmaVariables(
    generatedSemanticPalette: Pick<ColorPaletteCollection, 'light' | 'dark'>, 
    collectionName: string
): Promise<void> {
    return createSemanticFigmaVariables(generatedSemanticPalette, {
        collectionName,
        notificationMessage: '✅ Semantic Figma Variables with Light/Dark modes created successfully!'
    });
}