import { useCallback, useEffect, useState } from 'react';

import { clearImages } from '~/utils/data/image-store';
import { clearItems, getItems, watchItems } from '~/utils/data/session-store';

export interface UseQaSession {
    count: number;
    /** 수집한 QA 항목과 이미지를 모두 비운다(비가역). */
    reset: () => Promise<void>;
}

// 팝업은 수집 항목의 개수만 필요하다(sidepanel은 항목 전체를 쓰므로 별도 훅).
export const useQaSession = (): UseQaSession => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        void getItems().then((items) => setCount(items.length));
        const unwatch = watchItems((items) => setCount(items?.length ?? 0));
        return unwatch;
    }, []);

    const reset = useCallback(async () => {
        await clearItems();
        await clearImages();
    }, []);

    return { count, reset };
};
