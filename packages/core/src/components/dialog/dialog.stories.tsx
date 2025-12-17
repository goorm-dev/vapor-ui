import type { StoryObj } from '@storybook/react-vite';

import { Dialog } from '.';
import { Button } from '../button';

export default {
    title: 'Dialog',
    argTypes: {
        size: {
            control: 'inline-radio',
            options: ['md', 'lg', 'xl'],
        },
        closeOnClickOverlay: { control: 'boolean' },
    },
};

type Story = StoryObj<typeof Dialog.Root>;

export const Default: Story = {
    render: (args) => (
        <Dialog.Root {...args} onOpenChange={(open) => console.log(open)}>
            <Dialog.Trigger>hihi</Dialog.Trigger>
            <Dialog.Popup>
                <Dialog.Header>
                    <Dialog.Title>다이얼로그입니다.</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    <Dialog.Description>기본 형태의 다이얼로그입니다.</Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer>
                    <Dialog.Close render={<Button colorPalette="contrast">닫기</Button>} />
                </Dialog.Footer>
            </Dialog.Popup>
        </Dialog.Root>
    ),
};

export const TestBed: Story = {
    render: (args) => (
        <>
            {['xl', 'lg', 'md'].map((size) => (
                <Dialog.Root key={size} {...args} open size={size as 'md' | 'lg' | 'xl'}>
                    <Dialog.Trigger>hihi</Dialog.Trigger>
                    <Dialog.PortalPrimitive>
                        {size === 'xl' && <Dialog.OverlayPrimitive />}
                        <Dialog.PopupPrimitive>
                            <Dialog.Header>
                                <Dialog.Title>다이얼로그입니다.</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Dialog.Description>
                                    기본 형태의 다이얼로그입니다.
                                </Dialog.Description>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.Close
                                    render={<Button colorPalette="contrast">닫기</Button>}
                                />
                            </Dialog.Footer>
                        </Dialog.PopupPrimitive>
                    </Dialog.PortalPrimitive>
                </Dialog.Root>
            ))}
        </>
    ),
};
