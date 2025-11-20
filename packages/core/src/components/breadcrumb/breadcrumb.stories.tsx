import type { Meta, StoryObj } from '@storybook/react-vite';

import { Breadcrumb } from '.';
import { Dialog } from '../dialog';

export default {
    title: 'Breadcrumb',
    component: Breadcrumb.Root,
    subcomponents: {
        Item: Breadcrumb.Item,
    },
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
    },
} satisfies Meta<typeof Breadcrumb.Root>;

type Story = StoryObj<typeof Breadcrumb.Root>;

export const Default: Story = {
    render: (args) => {
        return (
            <>
                <Breadcrumb.Root {...args}>
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>

                    <Breadcrumb.Separator />

                    <Breadcrumb.ItemPrimitive>
                        <Dialog.Root>
                            <Dialog.Trigger aria-label="More">
                                <Breadcrumb.EllipsisPrimitive />
                            </Dialog.Trigger>

                            <Dialog.Popup>
                                <Dialog.Header></Dialog.Header>
                            </Dialog.Popup>
                        </Dialog.Root>
                    </Breadcrumb.ItemPrimitive>

                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Electronics</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Laptops
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </>
        );
    },
};

export const TestBed: Story = {
    render: (args) => {
        return (
            <>
                <Breadcrumb.Root {...args}>
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.ItemPrimitive>
                        <Dialog.Root>
                            <Dialog.Trigger aria-label="More">
                                <Breadcrumb.EllipsisPrimitive />
                            </Dialog.Trigger>

                            <Dialog.Popup>
                                <Dialog.Header></Dialog.Header>
                            </Dialog.Popup>
                        </Dialog.Root>
                    </Breadcrumb.ItemPrimitive>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Electronics</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Laptops
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </>
        );
    },
};
