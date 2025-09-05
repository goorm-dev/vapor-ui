import type { ColorPaletteCollection } from '@vapor-ui/color-generator';
import { createFigmaVariables } from '../utils/figma-variables';

/**
 * Creates Figma Variables from generated color palette (includes base colors)
 */
export async function handleCreateFigmaVariables(
    generatedPalette: ColorPaletteCollection, 
    collectionName: string
): Promise<void> {
    return createFigmaVariables(generatedPalette, {
        collectionName,
        includeBase: true,
        notificationMessage: '✅ Figma Variables created successfully!'
    });
}