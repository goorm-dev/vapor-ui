import { Badge } from './badge';
import type { Meta, StoryObj } from '@storybook/react';

export default {
    title: 'Badge',
    argTypes: {
        color: {
            control: 'inline-radio',
            options: ['primary', 'success', 'warning', 'danger', 'contrast', 'hint'],
        },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        shape: { control: 'inline-radio', options: ['square', 'pill'] },
    },
} as Meta<typeof Badge>;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    render: (args) => <Badge {...args}>버튼</Badge>,
};
