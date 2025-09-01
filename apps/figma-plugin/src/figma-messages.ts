import type { ColorPaletteCollection } from '@vapor-ui/color-generator';

// ============================================================================
// Message Types
// ============================================================================

type CreatePaletteSectionsMessage = {
    type: 'create-palette-sections';
    data: { generatedPalette: Pick<ColorPaletteCollection, 'light' | 'dark'> };
};

// 새로운 메시지 타입 예시
type UpdatePrimaryColorMessage = {
    type: 'update-primary-color';
    data: { color: string };
};

export type UIMessage = CreatePaletteSectionsMessage | UpdatePrimaryColorMessage;

// ============================================================================
// Message  Utilities
// ============================================================================

export function postMessage(message: UIMessage): void {
    parent.postMessage({ pluginMessage: message }, '*');
}
