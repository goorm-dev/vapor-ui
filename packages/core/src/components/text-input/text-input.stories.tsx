import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextInput } from '.';
import { Grid } from '../grid';

export default {
    title: 'TextInput',
    component: TextInput,
    argTypes: {
        type: {
            control: 'inline-radio',
            options: ['text', 'email', 'password', 'url', 'tel', 'search'],
        },
        invalid: { control: 'boolean' },
        disabled: { control: 'boolean' },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        readOnly: { control: 'boolean' },
        required: { control: 'boolean' },
    },
} as Meta<typeof TextInput>;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
    render: (args) => <TextInput placeholder="sadf" {...args} />,
};

export const Controlled: Story = {
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <>
                value: {value}
                <TextInput placeholder="sadf" value={value} onValueChange={setValue} {...args} />
            </>
        );
    },
};

export const TestBed: Story = {
    render: (args) => (
        <Grid.Root
            templateRows="repeat(3, 1fr)"
            templateColumns="repeat(3, 1fr)"
            $styles={{ gap: '$300' }}
        >
            <TextInput placeholder="default" {...args} />

            <TextInput placeholder="disabled" {...args} disabled />

            <TextInput placeholder="invalid" {...args} invalid />

            <TextInput placeholder="readOnly" {...args} readOnly />

            <TextInput placeholder="required" {...args} required />

            <TextInput value="has value" placeholder="has value" {...args} />
        </Grid.Root>
    ),
};
