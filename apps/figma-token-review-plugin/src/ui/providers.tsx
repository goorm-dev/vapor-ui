import type { ReactNode } from 'react';

import { ToastProvider, toastManager } from './components/toast';

type Props = { children: ReactNode };

export const Providers = ({ children }: Props) => (
    <ToastProvider toastManager={toastManager} timeout={3000}>
        {children}
    </ToastProvider>
);
