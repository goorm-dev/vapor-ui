import { on } from '../messages';
import { clearKey, readKey, writeKey } from '../models/api-key-store';
import { sendApiKeyState } from '../views/ui-port';

async function emit(): Promise<void> {
    const key = await readKey();
    sendApiKeyState({ hasKey: key !== null, key });
}

export default function initApiKey(): void {
    on('api-key:get', async () => {
        await emit();
    });

    on('api-key:set', async (msg) => {
        if (msg.type !== 'api-key:set') return;
        await writeKey(msg.value);
        await emit();
    });

    on('api-key:clear', async () => {
        await clearKey();
        await emit();
    });

    void emit();
}
