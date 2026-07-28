import type { ApiKeyState } from '~/common/messages';
import { postToCode } from '~/common/messages';

import { createStore } from '../../shared/create-store';

export type ApiKeyStoreState =
    | { kind: 'unknown' }
    | { kind: 'missing' }
    | { kind: 'present'; key: string };

export const apiKeyStore = createStore<ApiKeyStoreState>({ kind: 'unknown' });

export const apiKeyActions = {
    apply(state: ApiKeyState): void {
        if (state.hasKey && state.key) {
            apiKeyStore.setState({ kind: 'present', key: state.key });
        } else {
            apiKeyStore.setState({ kind: 'missing' });
        }
    },

    requestSync(): void {
        postToCode({ type: 'api-key:get' });
    },

    save(value: string): void {
        postToCode({ type: 'api-key:set', value });
    },

    clear(): void {
        postToCode({ type: 'api-key:clear' });
    },
};

export function currentApiKey(): string | null {
    const s = apiKeyStore.getState();
    return s.kind === 'present' ? s.key : null;
}
