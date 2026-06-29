import type { ReactNode } from 'react';

import { ToastProvider, toastManager } from './components/toast';
import { useBridge, useRequestSelection } from './features/messaging';

type Props = { children: ReactNode };

export const Providers = ({ children }: Props) => {
    useBridge();
    useRequestSelection();

    return (
        <ToastProvider toastManager={toastManager} timeout={3000}>
            {children}
        </ToastProvider>
    );
};
