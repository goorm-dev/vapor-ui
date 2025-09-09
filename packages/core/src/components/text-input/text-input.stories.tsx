import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { TextInput } from '.';
import { Grid } from '../grid';

export default {
    title: 'TextInput',
    component: TextInput.Root,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
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
        maxLength: { control: { type: 'number' } },
    },
} as Meta<typeof TextInput.Root>;

type Story = StoryObj<typeof TextInput.Root>;

export const Default: Story = {
    render: (args) => (
        <TextInput.Root placeholder="Enter your text here..." {...args}>
            <TextInput.Label>Label</TextInput.Label>
            <TextInput.Field />
        </TextInput.Root>
    ),
};

export const Controlled: Story = {
    render: (args) => {
        const [value, setValue] = useState('Initial controlled value');

        return (
            <TextInput.Root
                value={value}
                onValueChange={setValue}
                placeholder="This is a controlled text input..."
                {...args}
            >
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
        );
    },
};

export const TestBed: Story = {
    render: (args) => (
        <Grid.Root templateRows="repeat(3, 1fr)" templateColumns="repeat(3, 1fr)" gap="$300">
            <TextInput.Root placeholder="Enter your text here..." {...args}>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="Enter your text here..." {...args} disabled>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="Enter your text here..." {...args} invalid>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="Enter your text here..." {...args} readOnly>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="Enter your text here..." {...args} visuallyHidden>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="Enter your text here..." {...args}>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root
                defaultValue="Sample text content"
                placeholder="Enter your text here..."
                {...args}
            >
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>

            <TextInput.Root placeholder="Basic count..." maxLength={100} {...args}>
                <TextInput.Label>Label</TextInput.Label>
                <TextInput.Field />
                <TextInput.Count />
            </TextInput.Root>
        </Grid.Root>
    ),
};
