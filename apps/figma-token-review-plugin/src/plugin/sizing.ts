export const SIZE_KEY = 'ui-size';
export const DEFAULT_SIZE = { width: 800, height: 600 };
export const MIN_SIZE = { width: 360, height: 480 };

export async function restoreSavedSize(): Promise<void> {
    const saved = await figma.clientStorage.getAsync(SIZE_KEY);

    if (!saved || typeof saved.width !== 'number' || typeof saved.height !== 'number') return;

    figma.ui.resize(Math.max(MIN_SIZE.width, saved.width), Math.max(MIN_SIZE.height, saved.height));
}
