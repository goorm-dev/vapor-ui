import { useState } from 'react';

import { TextInput } from '.';
import { Grid } from '../grid';
import type { Meta, StoryObj } from '@storybook/react';

export default {
    title: 'TextInput',
    component: TextInput.Root,
    argTypes: {
        type: {
            control: 'inline-radio',
            options: ['text', 'email', 'password', 'url', 'tel', 'search'],
        },
        invalid: { control: 'boolean' },
        disabled: { control: 'boolean' },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        readOnly: { control: 'boolean' },
        visuallyHidden: { control: 'boolean' },
    },
} as Meta<typeof TextInput.Root>;

type Story = StoryObj<typeof TextInput.Root>;

export const Default: Story = {
    render: (args) => (
        <TextInput.Root placeholder="sadf" {...args}>
            <TextInput.Label>레이블</TextInput.Label>
            <TextInput.Field />
        </TextInput.Root>
    ),
};

export const Controlled: Story = {
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <>
                value: {value}
                <TextInput.Root placeholder="sadf" value={value} onValueChange={setValue} {...args}>
                    <TextInput.Label>레이블</TextInput.Label>
                    <TextInput.Field />
                </TextInput.Root>
            </>
        );
    },
};

export const TestBed: Story = {
    render: (args) => (
        <Grid.Root templateRows="repeat(3, 1fr)" templateColumns="repeat(3, 1fr)" gap="$300">
            <TextInput.Root placeholder="sadf" {...args}>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="sadf" {...args} disabled>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="sadf" {...args} invalid>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="sadf" {...args} readOnly>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="sadf" {...args} visuallyHidden>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="sadf" {...args}>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root value="value" placeholder="sadf" {...args}>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
        </Grid.Root>
    ),
};
