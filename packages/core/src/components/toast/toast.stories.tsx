import { useEffect } from 'react';

import { Toast as BaseToast } from '@base-ui-components/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeartIcon, InfoCircleIcon } from '@vapor-ui/icons';

import { Toast } from '.';
import { Button } from '../button';
import { HStack } from '../h-stack';
import { IconButton } from '../icon-button';
import { Text } from '../text';
import { VStack } from '../v-stack';

export default {
    title: 'Toast',
    component: Toast.Provider,
} satisfies Meta<typeof Toast.Provider>;

type Story = StoryObj<typeof Toast.Provider>;

export const Default: Story = {
    render: (args) => {
        const handleClick = (colorPalette: 'danger' | 'success' | 'info') => {
            const id = Toast.toastManager.add({
                title: 'Notification',
                description: 'This is a toast notification.',
                actionProps: {
                    colorPalette: 'danger',
                    children: 'Update',
                    onClick: () =>
                        Toast.toastManager.update(id, {
                            title: 'Updated',
                            description: '',
                            colorPalette: 'info',
                            actionProps: {},
                        }),
                },
                colorPalette,
            });
        };

        return (
            <Toast.Provider {...args}>
                <Button colorPalette="secondary" onClick={() => handleClick('danger')}>
                    Danger
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('success')}>
                    Success
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('info')}>
                    Info
                </Button>
            </Toast.Provider>
        );
    },
};

const CustomToastList = () => {
    const { toasts } = BaseToast.useToastManager();

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
                    <HStack gap="$100">
                        <Toast.IconPrimitive marginY="3px" />

                        <VStack>
                            <Toast.TitlePrimitive color="$normal-200" />
                            <Toast.DescriptionPrimitive color="$normal-200" />
                        </VStack>
                    </HStack>
                    <Toast.ClosePrimitive
                        render={<IconButton aria-label="Close toast" size="sm" variant="ghost" />}
                        position="absolute"
                        color="$normal-200"
                        style={{ right: 8, top: 8 }}
                    >
                        <InfoCircleIcon />
                    </Toast.ClosePrimitive>
                </Toast.ContentPrimitive>
            </Toast.RootPrimitive>
        );
    });
};

export const Custom: Story = {
    render: () => {
        const toastManager = Toast.createToastManager();
        const handleToast = () => {
            toastManager.add<{ hi: string }>({
                title: 'Custom Toast',
                description: 'This is a custom toast content.',
                icon: <HeartIcon />,
                data: {
                    hi: 'asdf',
                },
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
                    data: { colorPalette: 'success' },
                });

            const id = Toast.toastManager.add({
                title: 'This is Notification. This is Notification. This is Notification. ',
                description: description ?? 'This is a toast notification.',
                colorPalette,
                actionProps: {
                    children: 'Update',
                    onClick: () => updateToast(id),
                },
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
            <Toast.Provider {...args} limit={6} timeout={9999999}>
                <Button colorPalette="secondary" onClick={() => handleClick('danger')}>
                    Danger
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('success')}>
                    Success
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('info')}>
                    Info
                </Button>
            </Toast.Provider>
        );
    },
};
