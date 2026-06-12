import type { CSSProperties } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Interaction } from './interaction';

export default {
    title: 'Interaction',
    component: Interaction,
    argTypes: {
        scale: { control: 'inline-radio', options: ['normal', 'light'] },
        type: { control: 'inline-radio', options: ['default', 'form', 'roving'] },
    },
} as Meta<typeof Interaction>;

type Story = StoryObj<typeof Interaction>;

const buttonStyle: CSSProperties = {
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    background: '#fff',
    cursor: 'pointer',
};

const inputStyle: CSSProperties = {
    padding: '0.5rem 0.75rem',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    outline: 'none',
};

const itemStyle: CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    userSelect: 'none',
    cursor: 'pointer',
};

export const Default: Story = {
    render: (args) => (
        <Interaction {...args}>
            <button type="button" style={buttonStyle}>
                Interactive button
            </button>
        </Interaction>
    ),
};

export const ScaleLight: Story = {
    args: { scale: 'light' },
    render: (args) => (
        <Interaction {...args}>
            <button type="button" style={buttonStyle}>
                Light scale
            </button>
        </Interaction>
    ),
};

export const TypeForm: Story = {
    args: { type: 'form' },
    render: (args) => (
        <Interaction {...args}>
            <input type="text" placeholder="Form input" style={inputStyle} />
        </Interaction>
    ),
};

export const TypeRoving: Story = {
    args: { type: 'roving' },
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Interaction {...args}>
                <div data-highlighted style={itemStyle}>
                    Highlighted item
                </div>
            </Interaction>
            <Interaction {...args}>
                <div style={itemStyle}>Regular item</div>
            </Interaction>
        </div>
    ),
};

export const TestBed: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Interaction>
                <button type="button" style={buttonStyle}>
                    default / normal
                </button>
            </Interaction>
            <Interaction scale="light">
                <button type="button" style={buttonStyle}>
                    default / light
                </button>
            </Interaction>
            <Interaction type="form">
                <input type="text" placeholder="form / normal" style={inputStyle} />
            </Interaction>
            <Interaction type="roving">
                <div data-highlighted style={itemStyle}>
                    roving (highlighted)
                </div>
            </Interaction>
        </div>
    ),
};
