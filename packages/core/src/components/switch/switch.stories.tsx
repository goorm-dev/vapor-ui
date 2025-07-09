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
                <Switch.Label>Default</Switch.Label>
            </Switch.Root>
        );
    },
};

export const TestBed: Story = {
    render: () => {
        return (
            <VStack style={{ gap: 'var(--vapor-size-dimension-150)' }}>
                <Switch.Root size="sm">
                    <Switch.Control />
                    <Switch.Label>Test Bed</Switch.Label>
                </Switch.Root>
                <Switch.Root size="md">
                    <Switch.Control />
                    <Switch.Label>Test Bed</Switch.Label>
                </Switch.Root>
                <Switch.Root size="lg">
                    <Switch.Control />
                    <Switch.Label>Test Bed</Switch.Label>
                </Switch.Root>

                <Switch.Root visuallyHidden>
                    <Switch.Control />
                    <Switch.Label>Test Bed</Switch.Label>
                </Switch.Root>
            </VStack>
        );
    },
};
