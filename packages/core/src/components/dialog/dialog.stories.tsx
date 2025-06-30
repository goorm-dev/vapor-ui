import { Dialog } from '.';
import { Button } from '../button';
import type { StoryObj } from '@storybook/react';

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

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
    render: (args) => (
        <Dialog {...args}>
            <Dialog.Trigger>hihi</Dialog.Trigger>
            <Dialog.CombinedContent>
                <Dialog.Header>
                    <Dialog.Title>다이얼로그입니다.</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    <Dialog.Description>기본 형태의 다이얼로그입니다.</Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer>
                    <Dialog.Close asChild>
                        <Button color="contrast">닫기</Button>
                    </Dialog.Close>
                </Dialog.Footer>
            </Dialog.CombinedContent>
        </Dialog>
    ),
};
