import type { Meta, StoryObj } from '@storybook/react-vite';

import { Meter } from '.';
import { VStack } from '../v-stack';

export default {
    title: 'Meter',
    component: Meter.Root,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        type: { control: 'inline-radio', options: ['default', 'warning'] },
        value: { control: { type: 'range', min: 0, max: 100 } },
    },
} as Meta<typeof Meter.Root>;

type Story = StoryObj<typeof Meter.Root>;

const MeterExample = ({
    label = 'Storage used',
    ...args
}: Meter.Root.Props & { label?: string }) => (
    <Meter.Root {...args}>
        <Meter.Label>{label}</Meter.Label>
        <Meter.Value />
        <Meter.Track />
    </Meter.Root>
);

export const Default: Story = {
    args: { value: 42 },
    render: (args) => (
        <div style={{ maxWidth: '20rem' }}>
            <MeterExample {...args} />
        </div>
    ),
};
export const TestBed: Story = {
    render: () => (
        <VStack $css={{ gap: '$300', maxWidth: '24rem' }}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <VStack key={size} $css={{ gap: '$100' }}>
                    {(['default', 'warning'] as const).map((type) => (
                        <MeterExample
                            key={type}
                            size={size}
                            type={type}
                            value={42}
                            label={`${size} / ${type}`}
                        />
                    ))}
                </VStack>
            ))}
        </VStack>
    ),
};
