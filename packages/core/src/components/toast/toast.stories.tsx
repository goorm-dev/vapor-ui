import { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toast } from '.';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Text } from '../text';
import { VStack } from '../v-stack';

export default {
    title: 'Toast',
    component: Toast.Toaster,
} satisfies Meta<typeof Toast.Toaster>;

type Story = StoryObj<typeof Toast.Toaster>;

export const Default: Story = {
    render: (args) => {
        const handleClick = (colorPalette: 'danger' | 'success' | 'info') => {
            const id = Toast.toastManager.add({
                title: 'Notification',
                description: 'This is a toast notification.',
                colorPalette,
                action: (
                    <Button
                        colorPalette="secondary"
                        onClick={() =>
                            Toast.toastManager.update(id, {
                                title: 'Updated',
                                colorPalette: 'success',
                            })
                        }
                    >
                        Action
                    </Button>
                ),
            });
        };

        return (
            <Toast.Toaster {...args}>
                <Button colorPalette="secondary" onClick={() => handleClick('danger')}>
                    Danger
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('success')}>
                    Success
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('info')}>
                    Info
                </Button>
            </Toast.Toaster>
        );
    },
};

const CustomToastList = () => {
    const { toasts } = Toast.useToastManager();

    return toasts.map((toast) => {
        return (
            <Toast.RootPrimitive
                key={toast.id}
                toast={toast}
                backgroundColor="$white"
                border="1px solid"
                borderColor="$normal"
                padding="$200"
            >
                <Toast.ContentPrimitive>
                    <VStack>
                        <Toast.TitlePrimitive color="$normal-200" />
                        <Toast.DescriptionPrimitive color="$normal-200" />
                    </VStack>
                    <Toast.ClosePrimitive
                        render={<IconButton aria-label="Close toast" size="sm" variant="ghost" />}
                        position="absolute"
                        color="$normal-200"
                        style={{ right: 8, top: 8 }}
                    />
                </Toast.ContentPrimitive>
            </Toast.RootPrimitive>
        );
    });
};

export const Custom: Story = {
    render: () => {
        const toastManager = Toast.createToastManager();
        const handleToast = () => {
            toastManager.add({
                title: 'Custom Toast',
                description: 'This is a custom toast content.',
            });
        };

        return (
            <>
                <Text>Custom Toast</Text>
                <Button colorPalette="primary" onClick={handleToast}>
                    Show Toast
                </Button>
                <Toast.ProviderPrimitive toastManager={toastManager} timeout={3500}>
                    <Toast.PortalPrimitive>
                        <Toast.ViewportPrimitive>
                            <CustomToastList />
                        </Toast.ViewportPrimitive>
                    </Toast.PortalPrimitive>
                </Toast.ProviderPrimitive>
            </>
        );
    },
};

export const TestBed: Story = {
    render: (args) => {
        const handleClick = (colorPalette: 'danger' | 'success' | 'info', description?: string) => {
            const updateToast = (id: string) =>
                Toast.toastManager.update(id, {
                    title: 'Updated',
                    colorPalette: 'success',
                });

            const id = Toast.toastManager.add({
                title: 'Notification',
                description: description ?? 'This is a toast notification.',
                colorPalette,
                action: <Button onClick={() => updateToast(id)}>Update</Button>,
            });
        };

        useEffect(() => {
            handleClick('danger', 'This is a toast notification.');
            handleClick('success', 'This is a toast notification.This is a toast notification.');
            handleClick(
                'info',
                'This is a toast notification.This is a toast notification.This is a toast notification.',
            );
        }, []);

        return (
            <Toast.Toaster {...args} limit={6}>
                <Button colorPalette="secondary" onClick={() => handleClick('danger')}>
                    Danger
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('success')}>
                    Success
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('info')}>
                    Info
                </Button>
            </Toast.Toaster>
        );
    },
};
