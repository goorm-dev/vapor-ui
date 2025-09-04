import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

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
        <Grid.Root templateRows="repeat(3, 1fr)" templateColumns="repeat(3, 1fr)" gap="$300">
            <TextInput placeholder="sadf" {...args} />

            <TextInput placeholder="sadf" {...args} disabled />

            <TextInput placeholder="sadf" {...args} invalid />

            <TextInput placeholder="sadf" {...args} readOnly />

            <TextInput placeholder="sadf" {...args} />

            <TextInput value="value" placeholder="sadf" {...args} />
        </Grid.Root>
    ),
};
