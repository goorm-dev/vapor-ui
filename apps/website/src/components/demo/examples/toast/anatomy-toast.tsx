'use client';

import { useEffect } from 'react';

import { Button, Toast } from '@vapor-ui/core';

const toastManager = Toast.createToastManager();

function ToastList() {
    const { toasts } = Toast.useToastManager();

    return (
        <Toast.PortalPrimitive data-part="PortalPrimitive">
            <Toast.ViewportPrimitive data-part="ViewportPrimitive">
                {toasts.map((toast) => (
                    <Toast.RootPrimitive key={toast.id} toast={toast} data-part="RootPrimitive">
                        <Toast.ContentPrimitive data-part="ContentPrimitive">
                            <Toast.IconPrimitive data-part="IconPrimitive" />
                            <Toast.TitlePrimitive data-part="TitlePrimitive" />
                            <Toast.DescriptionPrimitive data-part="DescriptionPrimitive" />
                            <Toast.ActionPrimitive data-part="ActionPrimitive" />
                            <Toast.ClosePrimitive data-part="ClosePrimitive" />
                        </Toast.ContentPrimitive>
                    </Toast.RootPrimitive>
                ))}
            </Toast.ViewportPrimitive>
        </Toast.PortalPrimitive>
    );
}

function App() {
    useEffect(() => {
        toastManager.add({
            title: 'Notification',
            description: 'Your changes have been saved.',
        });
    }, []);

    return (
        <Button
            onClick={() =>
                toastManager.add({
                    title: 'Notification',
                    description: 'Your changes have been saved.',
                })
            }
        >
            Add Toast
        </Button>
    );
}

export default function AnatomyToast() {
    return (
        <Toast.ProviderPrimitive
            data-part="ProviderPrimitive"
            toastManager={toastManager}
            timeout={60000}
        >
            <App />
            <ToastList />
        </Toast.ProviderPrimitive>
    );
}
