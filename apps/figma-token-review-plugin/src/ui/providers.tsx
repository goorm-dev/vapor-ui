import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { startMessageBridge } from './bus/dispatcher';
import { ToastProvider, toastManager } from './components/toast';
import { postToCode } from './messaging';

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
