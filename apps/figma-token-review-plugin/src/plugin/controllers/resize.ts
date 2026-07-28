import { on } from '../messages';
import { resizeWindow } from '../views/window';

export function initResize(): void {
    on('resize', async (msg) => {
        if (msg.type !== 'resize') return;
        resizeWindow(msg.width, msg.height);
    });
}
