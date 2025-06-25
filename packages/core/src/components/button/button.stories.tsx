import type { ButtonProps } from './button';
import { Button } from './button';
import type { Meta, StoryObj } from '@storybook/react';

import { upperFirst } from '~/utils/string';

export default {
    title: 'Button',
    argTypes: {
        color: {
            control: 'inline-radio',
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'contrast'],
        },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        variant: { control: 'inline-radio', options: ['fill', 'outline', 'ghost'] },
        disabled: { control: 'boolean' },
        stretch: { control: 'boolean' },
    },
} as Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
    render: (args) => (
        <>
            <Button {...args}>버튼</Button>,
            <Button {...args} asChild>
                <a href="https://vapor.goorm.io">Link Button(Polymorphic)</a>
            </Button>
        </>
    ),
};

export const TestBed: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex' }}>
                <Buttons color="primary" />
                <Buttons color="primary" disabled />
                <Buttons color="secondary" />
                <Buttons color="secondary" disabled />
                <Buttons color="success" />
                <Buttons color="success" disabled />
                <Buttons color="warning" />
                <Buttons color="warning" disabled />
                <Buttons color="danger" />
                <Buttons color="danger" disabled />
                <Buttons color="contrast" />
                <Buttons color="contrast" disabled />
            </div>

            <div>
                <Button size="sm">SM</Button>
                <Button size="md">MD</Button>
                <Button size="lg">LG</Button>
                <Button size="xl">XL</Button>
                <Button stretch>Stretch</Button>
            </div>
        </div>
    ),
};

const Buttons = ({ color, disabled }: ButtonProps) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Button color={color} disabled={disabled} variant="fill" gap="050">
                {upperFirst(`${color}`)}
            </Button>
            <Button color={color} disabled={disabled} variant="ghost">
                {upperFirst(`${color}`)}
            </Button>
            <Button color={color} disabled={disabled} variant="outline">
                {upperFirst(`${color}`)}
            </Button>
        </div>
    );
};
