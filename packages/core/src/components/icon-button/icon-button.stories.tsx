import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeartIcon } from '@vapor-ui/icons';

import { IconButton, type IconButtonProps } from './icon-button';

export default {
    title: 'IconButton',
    component: IconButton,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        color: {
            control: 'inline-radio',
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'contrast'],
        },
        variant: { control: 'inline-radio', options: ['fill', 'outline', 'ghost'] },
        shape: { control: 'inline-radio', options: ['square', 'circle'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof IconButton>;

type Story = StoryObj<IconButtonProps>;

export const Default: Story = {
    render: (args) => (
        <IconButton {...args}>
            <HeartIcon />
        </IconButton>
    ),
};

export const TestBed: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex' }}>
                <IconButtons color="primary" />
                <IconButtons color="primary" disabled />
                <IconButtons color="secondary" />
                <IconButtons color="secondary" disabled />
                <IconButtons color="success" />
                <IconButtons color="success" disabled />
                <IconButtons color="warning" />
                <IconButtons color="warning" disabled />
                <IconButtons color="danger" />
                <IconButtons color="danger" disabled />
                <IconButtons color="contrast" />
                <IconButtons color="contrast" disabled />
            </div>

            <div>
                <IconButton aria-label="SM Label" size="sm">
                    <HeartIcon />
                </IconButton>
                <IconButton aria-label="MD Label" size="md">
                    <HeartIcon />
                </IconButton>
                <IconButton aria-label="LG Label" size="lg">
                    <HeartIcon />
                </IconButton>
                <IconButton aria-label="XL Label" size="xl">
                    <HeartIcon />
                </IconButton>
                <IconButton aria-label="Rounded Label" shape="circle">
                    <HeartIcon />
                </IconButton>
            </div>
        </div>
    ),
};
const IconButtons = ({ color, disabled }: Partial<IconButtonProps>) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <IconButton aria-label="Button Label" color={color} disabled={disabled} variant="fill">
                <HeartIcon />
            </IconButton>
            <IconButton aria-label="Button Label" color={color} disabled={disabled} variant="ghost">
                <HeartIcon />
            </IconButton>
            <IconButton
                aria-label="Button Label"
                color={color}
                disabled={disabled}
                variant="outline"
            >
                <HeartIcon />
            </IconButton>
        </div>
    );
};
