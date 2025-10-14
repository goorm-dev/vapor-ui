import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from '.';

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
    render: (args) => <Badge {...args}>Badge</Badge>,
};

export const TestBed: Story = {
    render: (args) => <Badge {...args}>Badge</Badge>,
};
