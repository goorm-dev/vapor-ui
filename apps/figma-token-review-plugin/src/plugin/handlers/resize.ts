import { on } from '../bus';
import { MIN_SIZE, SIZE_KEY } from '../sizing';

export function initResize(): void {
    on('resize', async (msg) => {
        if (msg.type !== 'resize') return;

        const width = Math.max(MIN_SIZE.width, Math.round(msg.width));
        const height = Math.max(MIN_SIZE.height, Math.round(msg.height));

        figma.ui.resize(width, height);

        if (msg.commit) {
            await figma.clientStorage.setAsync(SIZE_KEY, { width, height });
        }
    });
}
