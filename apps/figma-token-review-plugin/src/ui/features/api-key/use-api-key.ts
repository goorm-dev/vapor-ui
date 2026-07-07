import { useStore } from '../../shared/create-store';
import { apiKeyActions, apiKeyStore } from './store';

export function useApiKey() {
    const state = useStore(apiKeyStore);

    return {
        state,
        save: apiKeyActions.save,
        clear: apiKeyActions.clear,
    };
}
