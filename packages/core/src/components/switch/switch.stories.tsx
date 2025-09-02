import type { Meta, StoryObj } from '@storybook/react';

import { Switch } from '.';
import { VStack } from '../v-stack';

export default {
    title: 'Switch',
    component: Switch.Root,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        disabled: { control: 'boolean' },
        visuallyHidden: { control: 'boolean' },
    },
} as Meta<typeof Switch.Root>;

type Story = StoryObj<typeof Switch.Root>;

export const Default: Story = {
    render: (args) => {
        return (
            <Switch.Root {...args}>
                <Switch.Control />
                Default
            </Switch.Root>
        );
    },
};

export const TestBed: Story = {
    render: () => {
        return (
            <VStack gap="$150">
                <Switch.Root size="sm">
                    <Switch.Control />
                    Test Bed
                </Switch.Root>
                <Switch.Root size="md">
                    <Switch.Control />
                    Test Bed
                </Switch.Root>
                <Switch.Root size="lg">
                    <Switch.Control />
                    Test Bed
                </Switch.Root>
            </VStack>
        );
    },
};
