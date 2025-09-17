import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Grid } from '../grid';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea.Root> = {
    title: 'Textarea',
    component: Textarea.Root,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
        disabled: {
            control: { type: 'boolean' },
        },
        invalid: {
            control: { type: 'boolean' },
        },
        readOnly: {
            control: { type: 'boolean' },
        },
        resizing: {
            control: { type: 'boolean' },
        },
        autoResize: {
            control: { type: 'boolean' },
        },
        maxLength: {
            control: { type: 'number' },
        },
    },
} satisfies Meta<typeof Textarea.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <div style={{ width: '100%', maxWidth: '400px' }}>
            <Textarea.Root placeholder="Enter your text here..." {...args}>
                <Textarea.Input />
            </Textarea.Root>
        </div>
    ),
};

export const TestBed: Story = {
    render: (args) => (
        <Grid.Root templateRows="repeat(3, 1fr)" templateColumns="repeat(3, 1fr)" gap="$300">
            <Textarea.Root placeholder="Enter your text here..." {...args}>
                <Textarea.Input />
            </Textarea.Root>

            <Textarea.Root placeholder="Enter your text here..." {...args} disabled>
                <Textarea.Input />
            </Textarea.Root>

            <Textarea.Root placeholder="Enter your text here..." {...args} invalid>
                <Textarea.Input />
            </Textarea.Root>

            <Textarea.Root placeholder="Enter your text here..." {...args} readOnly>
                <Textarea.Input />
            </Textarea.Root>

            <Textarea.Root placeholder="Enter your text here..." {...args} autoResize>
                <Textarea.Input />
            </Textarea.Root>

            <Textarea.Root placeholder="Enter your text here..." {...args}>
                <Textarea.Input />
            </Textarea.Root>

            <Textarea.Root
                defaultValue="Sample text content"
                placeholder="Enter your text here..."
                {...args}
            >
                <Textarea.Input />
            </Textarea.Root>
            <Textarea.Root placeholder="Basic count..." maxLength={100} {...args}>
                <Textarea.Input />
                <Textarea.Count />
            </Textarea.Root>
        </Grid.Root>
    ),
};

export const Controlled: Story = {
    render: (args) => {
        const [value, setValue] = useState('Initial controlled value');

        return (
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <Textarea.Root
                    value={value}
                    onValueChange={setValue}
                    placeholder="This is a controlled textarea..."
                    {...args}
                >
                    <Textarea.Input />
                </Textarea.Root>
            </div>
        );
    },
};
