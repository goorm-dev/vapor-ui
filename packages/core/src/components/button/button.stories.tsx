import type { Meta, StoryObj } from '@storybook/react-vite';

import { upperFirst } from '~/utils/string';

import { HStack } from '../h-stack';
import { Button } from './button';

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
        <HStack gap="$200">
            <Button {...args}>Button</Button>
            <Button
                {...args}
                render={<a href="https://vapor-ui.goorm.io">Link Button(Polymorphic)</a>}
            />
        </HStack>
    ),
};

export const TestBed: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex' }}>
                <Buttons colorPalette="primary" />
                <Buttons colorPalette="primary" disabled />
                <Buttons colorPalette="secondary" />
                <Buttons colorPalette="secondary" disabled />
                <Buttons colorPalette="success" />
                <Buttons colorPalette="success" disabled />
                <Buttons colorPalette="warning" />
                <Buttons colorPalette="warning" disabled />
                <Buttons colorPalette="danger" />
                <Buttons colorPalette="danger" disabled />
                <Buttons colorPalette="contrast" />
                <Buttons colorPalette="contrast" disabled />
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

const Buttons = ({ colorPalette, disabled }: Button.Props) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Button colorPalette={colorPalette} disabled={disabled} variant="fill">
                {upperFirst(`${colorPalette}`)}
            </Button>
            <Button colorPalette={colorPalette} disabled={disabled} variant="ghost">
                {upperFirst(`${colorPalette}`)}
            </Button>
            <Button colorPalette={colorPalette} disabled={disabled} variant="outline">
                {upperFirst(`${colorPalette}`)}
            </Button>
        </div>
    );
};
