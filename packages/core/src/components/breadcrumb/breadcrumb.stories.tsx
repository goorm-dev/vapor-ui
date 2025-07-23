import type { Meta, StoryObj } from '@storybook/react';

import { Breadcrumb } from '.';
import { Dialog } from '../dialog';

export default {
    title: 'Breadcrumb',
    component: Breadcrumb.Root,
    subcomponents: {
        Item: Breadcrumb.Item,
        Link: Breadcrumb.Link,
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
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>

                        <Breadcrumb.Separator />

                        <Breadcrumb.Item>
                            <Dialog.Root>
                                <Dialog.Trigger>
                                    <Breadcrumb.Ellipsis />
                                </Dialog.Trigger>

                                <Dialog.Portal>
                                    <Dialog.Overlay />
                                    <Dialog.Content>
                                        <Dialog.Header></Dialog.Header>
                                    </Dialog.Content>
                                </Dialog.Portal>
                            </Dialog.Root>
                        </Breadcrumb.Item>

                        <Breadcrumb.Separator />

                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Products</Breadcrumb.Link>
                        </Breadcrumb.Item>

                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Electronics</Breadcrumb.Link>
                        </Breadcrumb.Item>

                        <Breadcrumb.Separator />

                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#" current>
                                Laptops
                            </Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </>
        );
    },
};
