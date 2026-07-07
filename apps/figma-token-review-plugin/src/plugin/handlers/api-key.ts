import { postToUi } from '~/common/messages';

import { on } from '../messages';

const STORAGE_KEY = 'litellm-api-key';

async function readKey(): Promise<string | null> {
    const raw = await figma.clientStorage.getAsync(STORAGE_KEY);
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

async function emit(): Promise<void> {
    const key = await readKey();
    postToUi({ type: 'api-key:state', state: { hasKey: key !== null, key } });
}

export function initApiKey(): void {
    on('api-key:get', async () => {
        await emit();
    });

    on('api-key:set', async (msg) => {
        if (msg.type !== 'api-key:set') return;
        const trimmed = msg.value.trim();
        if (trimmed.length === 0) {
            await figma.clientStorage.deleteAsync(STORAGE_KEY);
        } else {
            await figma.clientStorage.setAsync(STORAGE_KEY, trimmed);
        }
        await emit();
    });

    on('api-key:clear', async () => {
        await figma.clientStorage.deleteAsync(STORAGE_KEY);
        await emit();
    });

    void emit();
}
