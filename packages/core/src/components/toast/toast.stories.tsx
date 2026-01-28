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

const toastManager = Toast.createToastManager();

export default {
    title: 'Toast',
    component: Toast.Provider,
} satisfies Meta<typeof Toast.Provider>;

type Story = StoryObj<typeof Toast.Provider>;

export const Default: Story = {
    decorators: [
        (Story) => (
            <Toast.Provider toastManager={toastManager}>
                <Story />
            </Toast.Provider>
        ),
    ],
    render: () => {
        const { add, update } = Toast.useToastManager();

        const handleClick = (colorPalette: 'danger' | 'success' | 'info') => {
            const id = add({
                title: 'Notification',
                description: 'This is a toast notification.',
                actionProps: {
                    colorPalette: 'danger',
                    children: 'Update',
                    onClick: () =>
                        update(id, {
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
            <div>
                <Button colorPalette="secondary" onClick={() => handleClick('danger')}>
                    Danger
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('success')}>
                    Success
                </Button>
                <Button colorPalette="secondary" onClick={() => handleClick('info')}>
                    Info
                </Button>
            </div>
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
                $styles={{
                    backgroundColor: '$white',
                    border: '1px solid',
                    borderColor: '$normal',
                    padding: '$200',
                }}
            >
                <Toast.ContentPrimitive>
                    <HStack $styles={{ gap: '$100' }}>
                        <Toast.IconPrimitive $styles={{ marginBlock: '3px' }} />

                        <VStack>
                            <Toast.TitlePrimitive $styles={{ color: '$normal-200' }} />
                            <Toast.DescriptionPrimitive $styles={{ color: '$normal-200' }} />
                        </VStack>
                    </HStack>
                    <Toast.ClosePrimitive
                        render={<IconButton aria-label="Close toast" size="sm" variant="ghost" />}
                        $styles={{
                            position: 'absolute',
                            color: '$normal-200',
                            right: '8px',
                            top: '8px',
                        }}
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
                toastManager.update(id, {
                    title: 'Updated',
                    data: { colorPalette: 'success' },
                });

            const id = toastManager.add({
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
            <Toast.Provider toastManager={toastManager} {...args} limit={6} timeout={9999999}>
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
