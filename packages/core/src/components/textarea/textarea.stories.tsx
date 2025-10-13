import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Grid } from '../grid';
import { Textarea } from './textarea';

const meta: Meta<Textarea.Props> = {
    title: 'Textarea',
    component: Textarea,
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

        autoResize: {
            control: { type: 'boolean' },
        },
        maxLength: {
            control: { type: 'number' },
        },
    },
} satisfies Meta<Textarea.Props>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <div style={{ width: '100%', padding: '50px' }}>
            <Textarea placeholder="Enter your text here..." {...args} />
        </div>
    ),
};

export const TestBed: Story = {
    render: (args) => (
        <Grid.Root templateRows="repeat(3, 1fr)" templateColumns="repeat(3, 1fr)" gap="$300">
            <Textarea placeholder="Enter your text here..." {...args} />
            <Textarea placeholder="Enter your text here..." {...args} disabled />
            <Textarea placeholder="Enter your text here..." {...args} invalid />
            <Textarea placeholder="Enter your text here..." {...args} readOnly />
            <Textarea placeholder="Enter your text here..." {...args} autoResize />
            <Textarea placeholder="Enter your text here..." {...args} />
            <Textarea
                defaultValue="Sample text content"
                placeholder="Enter your text here..."
                {...args}
            />
            <Textarea placeholder="Basic input..." maxLength={100} {...args} />
        </Grid.Root>
    ),
};

export const Controlled: Story = {
    render: (args) => {
        const [value, setValue] = useState('Initial controlled value');

        return (
            <div style={{ width: '100%' }}>
                <Textarea
                    value={value}
                    onValueChange={setValue}
                    placeholder="This is a controlled textarea..."
                    {...args}
                />
            </div>
        );
    },
};
