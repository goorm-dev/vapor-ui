import type { StoryObj } from '@storybook/react-vite';

import { Radio } from '.';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'Radio',
    component: Radio,
    argTypes: {
        disabled: { control: 'boolean' },
        invalid: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        required: { control: 'boolean' },
        size: {
            control: 'inline-radio',
            options: ['md', 'lg'],
        },
    },
};

type Story = StoryObj<typeof Radio.Root>;

export const Default: Story = {
    render: (args) => <Radio.Root {...args} />,
};

export const TestBed: Story = {
    render: () => (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                <Radio.Root value="default" />
                <Radio.Root invalid value="invalid" />
                <Radio.Root disabled value="disabled" />
                <Radio.Root required value="required" />
                <Radio.Root readOnly value="readOnly" />
            </HStack>

            <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                <Radio.Root size="lg" value="default" />
                <Radio.Root size="lg" invalid value="invalid" />
                <Radio.Root size="lg" disabled value="disabled" />
                <Radio.Root size="lg" required value="required" />
                <Radio.Root size="lg" readOnly value="readOnly" />
            </HStack>
        </VStack>
    ),
};
