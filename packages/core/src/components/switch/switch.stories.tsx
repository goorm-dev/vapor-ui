import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeartIcon } from '@vapor-ui/icons';

import { Switch } from '.';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'Switch',
    component: Switch.Root,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        disabled: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        required: { control: 'boolean' },
        invalid: { control: 'boolean' },
    },
} as Meta<typeof Switch.Root>;

type Story = StoryObj<typeof Switch.Root>;

export const Default: Story = {
    render: (args) => {
        const [checked, setChecked] = useState(false);
        return (
            <>
                <Switch.Root checked={checked} onCheckedChange={setChecked} {...args} />
                <br />
                <br />
                <br />
                <Switch.Root checked={checked} onCheckedChange={setChecked} {...args}>
                    <Switch.ThumbPrimitive>
                        <HeartIcon />
                    </Switch.ThumbPrimitive>
                </Switch.Root>
                <br />
                <br />
                <br />
                <Switch.Root {...args} />
            </>
        );
    },
};

export const TestBed: Story = {
    render: () => {
        return (
            <VStack $css={{ gap: '$200' }}>
                <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                    <Switch.Root size="md" />
                    <Switch.Root size="md" checked />
                    <Switch.Root size="md" disabled />
                    <Switch.Root size="md" checked disabled />
                    <Switch.Root size="md" required />
                    <Switch.Root size="md" checked required />
                    <Switch.Root size="md" readOnly />
                    <Switch.Root size="md" checked readOnly />
                    <Switch.Root size="md" invalid />
                    <Switch.Root size="md" checked invalid />
                </HStack>

                <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                    <Switch.Root size="lg" />
                    <Switch.Root size="lg" checked />
                    <Switch.Root size="lg" disabled />
                    <Switch.Root size="lg" checked disabled />
                    <Switch.Root size="lg" required />
                    <Switch.Root size="lg" checked required />
                    <Switch.Root size="lg" readOnly />
                    <Switch.Root size="lg" checked readOnly />
                    <Switch.Root size="lg" invalid />
                    <Switch.Root size="lg" checked invalid />
                </HStack>
            </VStack>
        );
    },
};
