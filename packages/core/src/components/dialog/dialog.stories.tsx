import type { StoryObj } from '@storybook/react';

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
        closeOnEscape: { control: 'boolean' },
    },
};

type Story = StoryObj<typeof Dialog.Root>;

export const Default: Story = {
    render: (args) => (
        <Dialog.Root {...args} onOpenChange={(open) => console.log(open)}>
            <Dialog.Trigger>hihi</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>다이얼로그입니다.</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Dialog.Description>기본 형태의 다이얼로그입니다.</Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close render={<Button color="contrast">닫기</Button>} />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    ),
};
