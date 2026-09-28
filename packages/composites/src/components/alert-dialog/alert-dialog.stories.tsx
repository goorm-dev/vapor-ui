import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@vapor-ui/core';

import { AlertDialog } from '.';

export default {
    title: 'Composites/AlertDialog',
    component: AlertDialog.Root,
    argTypes: {
        type: { control: 'inline-radio', options: ['critical', 'confirm'] },
        title: { control: 'text' },
        description: { control: 'text' },
    },
} satisfies Meta<typeof AlertDialog.Root>;

type Story = StoryObj<typeof AlertDialog.Root>;

export const Default: Story = {
    args: {
        type: 'critical',
        title: '이 항목을 삭제할까요?',
        description: '삭제하면 되돌릴 수 없습니다. 연결된 기록도 함께 사라집니다.',
    },
    render: ({
        action = <AlertDialog.Action>Remove</AlertDialog.Action>,
        cancel = <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>,
        ...args
    }) => {
        return (
            <AlertDialog.Root
                trigger={<Button>트리거</Button>}
                cancel={cancel}
                action={action}
                {...args}
            />
        );
    },
};
