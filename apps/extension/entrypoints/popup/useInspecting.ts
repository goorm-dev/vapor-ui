import { useCallback, useEffect, useState } from 'react';

import { getActiveTabId } from '~/utils/browser/active-tab';
import { sendMessage } from '~/utils/messaging';

export type InspectingStatus = 'loading' | 'on' | 'off' | 'unsupported';

export interface UseInspecting {
    status: InspectingStatus;
    /** 현재 상태를 뒤집어 활성 탭 content에 전달하고 팝업을 닫는다. */
    toggle: () => Promise<void>;
}

export const useInspecting = (): UseInspecting => {
    const [status, setStatus] = useState<InspectingStatus>('loading');

    useEffect(() => {
        let active = true;

        void (async () => {
            const tabId = await getActiveTabId();
            if (tabId == null) {
                if (active) setStatus('unsupported');
                return;
            }

            try {
                const on = await sendMessage('getInspecting', undefined, tabId);
                if (active) setStatus(on ? 'on' : 'off');
            } catch {
                // content 미주입(chrome://·빈 새 탭·PDF 뷰어 등) → 쓸 수 없는 페이지.
                if (active) setStatus('unsupported');
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const toggle = useCallback(async () => {
        if (status !== 'on' && status !== 'off') return;

        const tabId = await getActiveTabId();
        if (tabId == null) return;

        await sendMessage('setInspecting', { on: status !== 'on' }, tabId);
        window.close();
    }, [status]);

    return { status, toggle };
};
