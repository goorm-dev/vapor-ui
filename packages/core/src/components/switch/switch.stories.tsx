import type { Meta, StoryObj } from '@storybook/react';

import { Switch } from '.';
import { VStack } from '../v-stack';

export default {
    title: 'Switch',
    component: Switch.Root,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        disabled: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        invalid: { control: 'boolean' },
        visuallyHidden: { control: 'boolean' },
    },
} as Meta<typeof Switch.Root>;

type Story = StoryObj<typeof Switch.Root>;

export const Default: Story = {
    render: (args) => {
        return <Switch.Root {...args} />;
    },
};

export const TestBed: Story = {
    render: () => {
        return (
            <VStack gap="$150">
                <Switch.Root size="sm" />
                <Switch.Root size="md" />
                <Switch.Root size="lg" />

                <div>Custom Switch</div>
                <Switch.Root style={{ backgroundColor: 'black' }}>
                    <Switch.Thumb style={{ backgroundColor: 'red' }} />
                </Switch.Root>
            </VStack>
        );
    },
};
