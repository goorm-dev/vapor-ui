import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeartIcon } from '@vapor-ui/icons';

import { Checkbox } from '.';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'Checkbox',
    component: Checkbox.Root,
} as Meta<typeof Checkbox.Root>;

type Story = StoryObj<typeof Checkbox.Root>;

export const Default: Story = {
    argTypes: {
        size: { control: 'inline-radio', options: ['md', 'lg'] },
        disabled: { control: 'boolean' },
        invalid: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        required: { control: 'boolean' },
        indeterminate: { control: 'boolean' },
    },
    args: { size: 'lg', defaultChecked: true },
    render: (args) => {
        return (
            <>
                <Checkbox.Root {...args} />

                <Checkbox.Root {...args}>
                    <Checkbox.IndicatorPrimitive>
                        <HeartIcon />
                    </Checkbox.IndicatorPrimitive>
                </Checkbox.Root>
            </>
        );
    },
};

export const TestBed: Story = {
    render: () => {
        return (
            <VStack $css={{ gap: '$200' }}>
                <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                    <Checkbox.Root size="md" />
                    <Checkbox.Root size="md" checked />
                    <Checkbox.Root size="md" indeterminate />
                    <Checkbox.Root size="md" disabled />
                    <Checkbox.Root size="md" checked disabled />
                    <Checkbox.Root size="md" indeterminate disabled />
                    <Checkbox.Root size="md" invalid />
                    <Checkbox.Root size="md" checked invalid />
                    <Checkbox.Root size="md" indeterminate invalid />
                    <Checkbox.Root size="md" required />
                    <Checkbox.Root size="md" checked required />
                    <Checkbox.Root size="md" indeterminate required />
                    <Checkbox.Root size="md" readOnly />
                    <Checkbox.Root size="md" checked readOnly />
                    <Checkbox.Root size="md" indeterminate readOnly />
                </HStack>

                <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                    <Checkbox.Root size="lg" />
                    <Checkbox.Root size="lg" checked />
                    <Checkbox.Root size="lg" indeterminate />
                    <Checkbox.Root size="lg" disabled />
                    <Checkbox.Root size="lg" checked disabled />
                    <Checkbox.Root size="lg" indeterminate disabled />
                    <Checkbox.Root size="lg" invalid />
                    <Checkbox.Root size="lg" checked invalid />
                    <Checkbox.Root size="lg" indeterminate invalid />
                    <Checkbox.Root size="lg" required />
                    <Checkbox.Root size="lg" checked required />
                    <Checkbox.Root size="lg" indeterminate required />
                    <Checkbox.Root size="lg" readOnly />
                    <Checkbox.Root size="lg" checked readOnly />
                    <Checkbox.Root size="lg" indeterminate readOnly />
                </HStack>
            </VStack>
        );
    },
};
