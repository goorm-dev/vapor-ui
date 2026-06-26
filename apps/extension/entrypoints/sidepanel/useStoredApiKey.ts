import { useEffect, useState } from 'react';

import { storage } from 'wxt/utils/storage';

const keyStore = storage.defineItem<string>('local:linearApiKey', { fallback: '' });

// sidepanel은 key를 입력·검증하지 않는다. popup이 저장한 값을 읽기만 한다(등록용).
export const useStoredApiKey = (): string => {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        void keyStore.getValue().then(setApiKey);
        const unwatch = keyStore.watch((next) => setApiKey(next ?? ''));
        return unwatch;
    }, []);

    return apiKey;
};
