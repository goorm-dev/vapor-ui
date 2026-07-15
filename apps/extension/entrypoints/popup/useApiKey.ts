import { useCallback, useEffect, useState } from 'react';

import { storage } from 'wxt/utils/storage';

import { LinearAuthError, verifyKey } from '~/utils/linear';

const keyStore = storage.defineItem<string>('local:linearApiKey', { fallback: '' });

export type ApiKeyStatus = 'loading' | 'needKey' | 'verifying' | 'ready' | 'error';

export interface UseApiKey {
    status: ApiKeyStatus;
    apiKey: string;
    errorMessage?: string;
    /** key를 검증하고 통과 시 저장 + ready 전환. */
    submit: (key: string) => Promise<void>;
}

export const useApiKey = (): UseApiKey => {
    const [status, setStatus] = useState<ApiKeyStatus>('loading');
    const [apiKey, setApiKey] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>();

    // 최초 진입: 저장된 key가 있으면 낙관적으로 ready 진입 후 백그라운드 재검증.
    useEffect(() => {
        let active = true;

        void keyStore
            .getValue()
            .then(async (saved) => {
                if (!active) return;
                if (!saved) {
                    setStatus('needKey');
                    return;
                }

                setApiKey(saved);
                setStatus('ready');

                try {
                    await verifyKey(saved);
                } catch (e) {
                    if (!active) return;
                    // 키가 그새 무효화됐으면 입력 화면으로 복귀.
                    if (e instanceof LinearAuthError) {
                        setApiKey('');
                        await keyStore.removeValue();
                        setStatus('needKey');
                    }
                    // 네트워크 등 일시 오류면 낙관적 ready 유지.
                }
            })
            .catch(() => {
                // storage 읽기 자체가 실패하면 loading 스피너가 영구 고착되므로
                // 입력 화면으로 폴백해 팝업을 사용 가능 상태로 둔다.
                if (active) setStatus('needKey');
            });

        return () => {
            active = false;
        };
    }, []);

    const submit = useCallback(async (key: string) => {
        const trimmed = key.trim();
        if (!trimmed) {
            setErrorMessage('API 키를 입력해주세요.');
            setStatus('error');
            return;
        }

        setStatus('verifying');
        setErrorMessage(undefined);

        try {
            await verifyKey(trimmed);
            await keyStore.setValue(trimmed);
            setApiKey(trimmed);
            setStatus('ready');
        } catch (e) {
            setErrorMessage(e instanceof Error ? e.message : '검증에 실패했습니다.');
            setStatus('error');
        }
    }, []);

    return { status, apiKey, errorMessage, submit };
};
