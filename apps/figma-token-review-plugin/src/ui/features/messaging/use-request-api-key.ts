import { useEffect } from 'react';

import { apiKeyActions } from '../api-key';

export const useRequestApiKey = () => {
    useEffect(() => {
        apiKeyActions.requestSync();
    }, []);
};
