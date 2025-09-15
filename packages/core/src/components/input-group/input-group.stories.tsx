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
        <>
            <InputGroup.Root maxLength={100} defaultValue="Initial text">
                <TextInput placeholder="Enter text..." />
                <InputGroup.Count />
            </InputGroup.Root>
            <InputGroup.Root defaultValue="Initial text">
                <TextInput placeholder="Enter text..." maxLength={1001} />
                <InputGroup.Count />
            </InputGroup.Root>
        </>
    ),
};

export const WithoutMax: Story = {
    render: () => (
        <InputGroup.Root defaultValue="Some text">
            <InputGroup.Input placeholder="Enter text..." />
            <InputGroup.Count />
        </InputGroup.Root>
    ),
};

export const CountFormats: Story = {
    render: () => (
        <div className="space-y-4">
            <InputGroup.Root maxLength={50} defaultValue="Hello">
                <InputGroup.Input placeholder="Default format..." />
                <InputGroup.Count />
            </InputGroup.Root>

            <InputGroup.Root maxLength={50} defaultValue="Hello">
                <InputGroup.Input placeholder="Current only..." />
                <InputGroup.Count>{({ current }) => current}</InputGroup.Count>
            </InputGroup.Root>

            <InputGroup.Root maxLength={50} defaultValue="Hello">
                <InputGroup.Input placeholder="Remaining..." />
                <InputGroup.Count>
                    {({ current, max }) => (max ? max - current : current)}
                </InputGroup.Count>
            </InputGroup.Root>

            <InputGroup.Root maxLength={50} defaultValue="Hello">
                <InputGroup.Input placeholder="Custom format..." />
                <InputGroup.Count>
                    {({ current, max, value }) =>
                        `${value.length} chars (${max ? max - current : 0} left)`
                    }
                </InputGroup.Count>
            </InputGroup.Root>
        </div>
    ),
};

export const StandaloneTextInput: Story = {
    render: () => <TextInput placeholder="Standalone input without InputGroup" maxLength={50} />,
};

export const CustomCount: Story = {
    render: () => (
        <InputGroup.Root maxLength={200}>
            <InputGroup.Input placeholder="Enter text..." />
            <InputGroup.Count>{({ current, max }) => `Custom: ${current}/${max}`}</InputGroup.Count>
        </InputGroup.Root>
    ),
};

export const InputPropsOverride: Story = {
    render: () => (
        <div className="space-y-4">
            <div>
                <p className="text-sm mb-2">Root maxLength=50, Input maxLength=100 (Input wins)</p>
                <InputGroup.Root maxLength={50}>
                    <InputGroup.Input placeholder="Input maxLength=100" maxLength={100} />
                    <InputGroup.Count />
                </InputGroup.Root>
            </div>

            <div>
                <p className="text-sm mb-2">
                    Root defaultValue="Root", Input defaultValue="Input" (Input wins)
                </p>
                <InputGroup.Root defaultValue="Root">
                    <InputGroup.Input placeholder="Should show 'Input'" defaultValue="Input" />
                    <InputGroup.Count />
                </InputGroup.Root>
            </div>

            <div>
                <p className="text-sm mb-2">Input onValueChange overrides Root onValueChange</p>
                <InputGroup.Root onValueChange={(v) => console.log('Root:', v)}>
                    <InputGroup.Input
                        placeholder="Check console..."
                        onValueChange={(v) => console.log('Input:', v)}
                    />
                    <InputGroup.Count />
                </InputGroup.Root>
            </div>
        </div>
    ),
};
