import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { postToCode } from '~/common/messages';

import { ToastProvider, toastManager } from './components/toast';
import { startMessageBridge } from './messages/router';

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
