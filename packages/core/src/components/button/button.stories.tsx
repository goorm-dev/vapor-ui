import type { Meta, StoryObj } from '@storybook/react-vite';

import { upperFirst } from '~/utils/string';

import { HStack } from '../h-stack';
import { VStack } from '../v-stack';
import { Button } from './button';

export default {
    title: 'Button',
    argTypes: {
        colorPalette: {
            control: 'inline-radio',
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'contrast'],
        },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        variant: { control: 'inline-radio', options: ['fill', 'outline', 'ghost'] },
        disabled: { control: 'boolean' },
    },
} as Meta<typeof Button>;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    render: (args) => (
        <HStack $css={{ gap: '$200' }}>
            <Button {...args}>Button</Button>
            <Button
                {...args}
                nativeButton={false}
                render={<a href="https://vapor-ui.goorm.io">Link Button(Polymorphic)</a>}
            />
        </HStack>
    ),
};

export const TestBed: Story = {
    render: () => (
        <VStack $css={{ gap: '$400' }}>
            <HStack $css={{ flexWrap: 'wrap', gap: '$200' }}>
                <VStack $css={{ gap: '$100' }}>
                    <Buttons colorPalette="primary" />
                    <Buttons colorPalette="primary" disabled />
                </VStack>
                <VStack $css={{ gap: '$100' }}>
                    <Buttons colorPalette="secondary" />
                    <Buttons colorPalette="secondary" disabled />
                </VStack>
                <VStack $css={{ gap: '$100' }}>
                    <Buttons colorPalette="success" />
                    <Buttons colorPalette="success" disabled />
                </VStack>
                <VStack $css={{ gap: '$100' }}>
                    <Buttons colorPalette="warning" />
                    <Buttons colorPalette="warning" disabled />
                </VStack>
                <VStack $css={{ gap: '$100' }}>
                    <Buttons colorPalette="danger" />
                    <Buttons colorPalette="danger" disabled />
                </VStack>
                <VStack $css={{ gap: '$100' }}>
                    <Buttons colorPalette="contrast" />
                    <Buttons colorPalette="contrast" disabled />
                </VStack>
            </HStack>

            <HStack $css={{ flexWrap: 'wrap', gap: '$200' }}>
                <Button size="sm">SM</Button>
                <Button size="md">MD</Button>
                <Button size="lg">LG</Button>
                <Button size="xl">XL</Button>
            </HStack>
        </VStack>
    ),
};

const Buttons = ({ colorPalette, disabled }: Button.Props) => {
    return (
        <HStack $css={{ gap: '$100' }}>
            <Button colorPalette={colorPalette} disabled={disabled} variant="fill">
                {upperFirst(`${colorPalette}`)}
            </Button>
            <Button colorPalette={colorPalette} disabled={disabled} variant="ghost">
                {upperFirst(`${colorPalette}`)}
            </Button>
            <Button colorPalette={colorPalette} disabled={disabled} variant="outline">
                {upperFirst(`${colorPalette}`)}
            </Button>
        </HStack>
    );
};
