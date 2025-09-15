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

export const Default: Story = {
    render: () => (
        <div className="space-y-4">
            <InputGroup.Root>
                <TextInput placeholder="Enter text..." maxLength={100} />
                <InputGroup.Count />
            </InputGroup.Root>
        </div>
    ),
};

export const WithoutMaxLength: Story = {
    render: () => (
        <InputGroup.Root>
            <TextInput placeholder="Enter text without maxLength..." />
            <InputGroup.Count />
        </InputGroup.Root>
    ),
};

export const CustomCountDisplay: Story = {
    render: () => (
        <div className="space-y-4">
            <InputGroup.Root>
                <TextInput placeholder="Default format..." maxLength={50} />
                <InputGroup.Count />
            </InputGroup.Root>

            <InputGroup.Root>
                <TextInput placeholder="Current only..." maxLength={50} />
                <InputGroup.Count>
                    {({ current }) => `${current} characters`}
                </InputGroup.Count>
            </InputGroup.Root>

            <InputGroup.Root>
                <TextInput placeholder="Remaining..." maxLength={50} />
                <InputGroup.Count>
                    {({ current, max }) => max ? `${max - current} left` : `${current} chars`}
                </InputGroup.Count>
            </InputGroup.Root>

            <InputGroup.Root>
                <TextInput placeholder="Custom format..." maxLength={50} />
                <InputGroup.Count>
                    {({ max, value }) => 
                        `Length: ${value.length} | Limit: ${max || 'none'}`
                    }
                </InputGroup.Count>
            </InputGroup.Root>
        </div>
    ),
};

export const StandaloneTextInput: Story = {
    render: () => <TextInput placeholder="Standalone input without InputGroup" maxLength={50} />,
};
