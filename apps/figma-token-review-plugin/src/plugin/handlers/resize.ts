import { on } from '../messages';

export const DEFAULT_SIZE = { width: 500, height: 600 };
export const MIN_SIZE = { width: 360, height: 480 };

export function initResize(): void {
    on('resize', async (msg) => {
        if (msg.type !== 'resize') return;

        const width = Math.max(MIN_SIZE.width, Math.round(msg.width));
        const height = Math.max(MIN_SIZE.height, Math.round(msg.height));

        figma.ui.resize(width, height);
    });
}
