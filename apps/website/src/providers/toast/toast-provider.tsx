'use client';

import type { PropsWithChildren } from 'react';

import { Toast } from '@vapor-ui/core';

export const appToastManager = Toast.createToastManager();

export const AppToastProvider = ({ children }: PropsWithChildren) => {
    return <Toast.Provider toastManager={appToastManager}>{children}</Toast.Provider>;
};
