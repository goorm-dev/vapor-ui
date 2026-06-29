import type { ReactNode } from 'react';

import { ToastProvider, toastManager } from './components/toast';
import { useBridge } from './hooks/use-bridge';

type Props = { children: ReactNode };

export const Providers = ({ children }: Props) => {
    useBridge();

    return (
        <ToastProvider toastManager={toastManager} timeout={3000}>
            {children}
        </ToastProvider>
    );
};
