import type { Meta, StoryObj } from '@storybook/react';

import { TextInput } from '../text-input';
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
                <InputGroup.Count />
            </InputGroup.Root>
        </div>
    ),
};
