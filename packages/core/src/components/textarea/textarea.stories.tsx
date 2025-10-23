import { useEffect, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Textarea } from '.';
import { Grid } from '../grid';

const meta: Meta<typeof Textarea> = {
    title: 'Textarea',
    component: Textarea,
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
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
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState('');
        const ref = useRef<HTMLTextAreaElement | null>(null);

        useEffect(() => {
            console.log(ref.current?.clientHeight);
        }, [ref, value]);

        return (
            <div style={{ width: '100%', padding: '50px' }}>
                <Textarea
                    ref={ref}
                    cols={5}
                    value={value}
                    onValueChange={setValue}
                    placeholder="Enter your text here..."
                    {...args}
                />
            </div>
        );
    },
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
