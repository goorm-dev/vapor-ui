import { IconButton, type IconButtonProps } from './icon-button';
import { HeartIcon } from '@vapor-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<IconButtonProps> = {
    title: 'IconButton',
    component: IconButton,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        color: {
            control: 'inline-radio',
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'contrast'],
        },
        variant: { control: 'inline-radio', options: ['fill', 'outline', 'ghost'] },
        rounded: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
};

type Story = StoryObj<IconButtonProps>;

export const Default: Story = {
    render: (args) => (
        <IconButton {...args}>
            <HeartIcon />
        </IconButton>
    ),
};

export default meta;
