import type { Meta, StoryObj } from '@storybook/react';

import type { CalloutProps } from '.';
import { Callout } from '.';
import { Flex } from '../flex';

export default {
    title: 'Callout',
    component: Callout,
    argTypes: {
        color: {
            control: 'inline-radio',
            options: ['primary', 'success', 'warning', 'danger', 'hint', 'contrast'],
        },
    },
} satisfies Meta<CalloutProps>;

type Story = StoryObj<CalloutProps>;

export const Default: Story = {
    render: (args) => <Callout {...args}>Anyone can develop</Callout>,
};

export const TestBed: Story = {
    render: () => (
        <Flex style={{ flexDirection: 'column', gap: 'var(--vapor-size-dimension-150)' }}>
            <Callout color="primary">Anyone can develop</Callout>
            <Callout color="success">Anyone can develop</Callout>
            <Callout color="warning">Anyone can develop</Callout>
            <Callout color="danger">Anyone can develop</Callout>
            <Callout color="hint">Anyone can develop</Callout>
            <Callout color="contrast">Anyone can develop</Callout>
        </Flex>
    ),
};
