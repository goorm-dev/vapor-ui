import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { postToCode } from '~/common/messages';

import { startMessageBridge } from './messages/router';
import { ToastProvider, toastManager } from './components/toast';

type Props = { children: ReactNode };

export const Providers = ({ children }: Props) => {
    useEffect(() => {
        const stop = startMessageBridge();
        postToCode({ type: 'request-selection' });

        return stop;
    }, []);

    return (
        <ToastProvider toastManager={toastManager} timeout={3000}>
            {children}
        </ToastProvider>
    );
};
