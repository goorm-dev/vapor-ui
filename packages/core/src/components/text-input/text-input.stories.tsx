import { useState } from 'react';

import { TextInput } from '.';
import type { Meta, StoryObj } from '@storybook/react';

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
        visuallyHidden: { control: 'boolean' },
    },
} as Meta<typeof TextInput>;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
    render: (args) => (
        <TextInput placeholder="sadf" {...args}>
            <TextInput.Label>레이블</TextInput.Label>
            <TextInput.Field />
        </TextInput>
    ),
};

export const Controlled: Story = {
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <>
                value: {value}
                <TextInput placeholder="sadf" value={value} onValueChange={setValue} {...args}>
                    <TextInput.Label>레이블</TextInput.Label>
                    <TextInput.Field />
                </TextInput>
            </>
        );
    },
};

export const TestBed: Story = {
    render: (args) => (
        <TextInput placeholder="sadf" {...args}>
            <TextInput.Label>레이블</TextInput.Label>
            <TextInput.Field />
        </TextInput>
    ),
};
