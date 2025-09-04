import type { Meta, StoryObj } from '@storybook/react';

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
    },
} satisfies Meta<typeof Textarea.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <Textarea.Root placeholder="Enter your text here..." {...args}>
            <Textarea.Field />
        </Textarea.Root>
    ),
};

export const Size: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
            <Textarea.Root size="sm" placeholder="Small textarea">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root size="md" placeholder="Medium textarea">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root size="lg" placeholder="Large textarea">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root size="xl" placeholder="Extra large textarea">
                <Textarea.Field />
            </Textarea.Root>
        </div>
    ),
};

export const States: Story = {
    render: () => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                width: '600px',
            }}
        >
            <Textarea.Root placeholder="Normal state">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root disabled placeholder="Disabled state">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root invalid placeholder="Invalid state">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root readOnly defaultValue="This is read-only content">
                <Textarea.Field />
            </Textarea.Root>
        </div>
    ),
};

export const CustomRows: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
            <Textarea.Root rows={3} placeholder="3 rows">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root rows={6} placeholder="6 rows">
                <Textarea.Field />
            </Textarea.Root>
        </div>
    ),
};

export const ResizeOptions: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
            <Textarea.Root resizing={true} placeholder="Resizable (both width and height)">
                <Textarea.Field />
            </Textarea.Root>
            <Textarea.Root resizing={false} placeholder="Non-resizable">
                <Textarea.Field />
            </Textarea.Root>
        </div>
    ),
};
