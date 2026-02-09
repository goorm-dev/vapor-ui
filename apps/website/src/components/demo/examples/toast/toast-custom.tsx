import type { PropsWithChildren } from 'react';

import { Button, HStack, IconButton, Toast, VStack } from '@vapor-ui/core';
import { InfoCircleIcon } from '@vapor-ui/icons';

const toastManager = Toast.createToastManager();

export default function Custom() {
    // const { add } = Toast.useToastManager();

    const showToast = () => {
        const removeToast = (id: string) => {
            toastManager.close(id);
        };

        const id = toastManager.add({
            title: 'This is a custom toast message!',
            description: 'Here is a description for the custom toast message.',
            colorPalette: 'info',
            icon: <InfoCircleIcon />,

            actionProps: {
                children: 'Undo',
                onClick: () => removeToast(id),
            },
        });
    };

    return (
        <ToastProvider>
            <Button onClick={showToast}>Show Toast</Button>
        </ToastProvider>
    );
}

const ToastProvider = (props: PropsWithChildren) => {
    return (
        <div>
            {props.children}

            <Toast.ProviderPrimitive toastManager={toastManager} timeout={3500}>
                <Toast.PortalPrimitive>
                    <Toast.ViewportPrimitive>
                        <ToastList />
                    </Toast.ViewportPrimitive>
                </Toast.PortalPrimitive>
            </Toast.ProviderPrimitive>
        </div>
    );
};

const ToastList = () => {
    const { toasts } = Toast.useToastManager();

    return toasts.map((toast) => {
        return (
            <Toast.RootPrimitive
                key={toast.id}
                toast={toast}
                $styles={{
                    backgroundColor: '$basic-white',
                    border: '1px solid',
                    borderColor: '$border-normal',
                    padding: '$200',
                }}
            >
                <Toast.ContentPrimitive>
                    <HStack $styles={{ gap: '$100' }}>
                        <Toast.IconPrimitive $styles={{ marginBlock: '3px' }} />

                        <VStack>
                            <Toast.TitlePrimitive $styles={{ color: '$fg-normal-200' }} />
                            <Toast.DescriptionPrimitive $styles={{ color: '$fg-normal-200' }} />
                        </VStack>
                    </HStack>

                    <Toast.ActionPrimitive />
                    <Toast.ClosePrimitive
                        render={<IconButton aria-label="Close toast" size="sm" variant="ghost" />}
                        $styles={{
                            position: 'absolute',
                            color: '$fg-normal-200',
                            right: '8px',
                            top: '8px',
                        }}
                    />
                </Toast.ContentPrimitive>
            </Toast.RootPrimitive>
        );
    });
};
