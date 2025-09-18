import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { TextInput } from '../text-input';
import { Textarea } from '../textarea';
import { InputGroup } from './input-group';

const meta: Meta<typeof InputGroup.Root> = {
    title: 'InputGroup',
    component: InputGroup.Root,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TestBed: Story = {
    render: () => (
        <div className="space-y-4">
            <InputGroup.Root>
                <TextInput placeholder="Enter text..." maxLength={100} />
                <InputGroup.Counter />
            </InputGroup.Root>
            <InputGroup.Root>
                <Textarea placeholder="Enter text..." maxLength={1000} autoResize />
                <InputGroup.Counter />
            </InputGroup.Root>
        </div>
    ),
};

export const ControlledInput: Story = {
    render: () => {
        const [value, setValue] = useState('');

        return (
            <div className="space-y-4">
                <InputGroup.Root>
                    <TextInput
                        value={value}
                        onValueChange={setValue}
                        placeholder="Controlled input..."
                        maxLength={30}
                    />
                    <InputGroup.Counter />
                </InputGroup.Root>
                <div className="text-sm text-gray-600">Current value: "{value}"</div>
            </div>
        );
    },
};
