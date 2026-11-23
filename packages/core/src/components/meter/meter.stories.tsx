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
        min: { control: { type: 'range' } },
        max: { control: { type: 'range' } },
    },
} as Meta<typeof Meter.Root>;

type Story = StoryObj<typeof Meter.Root>;

const MeterExample = ({
    label = 'Storage used',
    description = 'Description',
    hideValue,
    ...args
}: Meter.Root.Props & { label?: string; description?: string; hideValue?: boolean }) => (
    <Meter.Root {...args}>
        <Meter.Label>{label}</Meter.Label>
        {!hideValue && <Meter.Value />}
        <Meter.Track />
        <Meter.Description>{description}</Meter.Description>
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
                    {(['default', 'warning'] as const).flatMap((type) =>
                        [0, 50, 100].map((value) => (
                            <MeterExample
                                key={`${type}-${value}`}
                                size={size}
                                type={type}
                                value={value}
                                label={`${size} / ${type} / ${value}`}
                            />
                        )),
                    )}
                </VStack>
            ))}
            <VStack $css={{ gap: '$100' }}>
                <MeterExample value={42} label="without description" description="" />
                <MeterExample value={42} label="without value" hideValue />
                <MeterExample value={42} label="" description="without label" />
                <MeterExample value={42} label="track only" description="" hideValue />
            </VStack>
            <VStack $css={{ gap: '$100' }}>
                {(['default', 'warning'] as const).map((type) => (
                    <MeterExample
                        key={type}
                        type={type}
                        value={42}
                        label="Storage used by all of your team workspaces and shared attachments this billing cycle"
                        description="Storage is almost full. Remove old files or upgrade your plan to free up space before uploads stop."
                    />
                ))}
            </VStack>
        </VStack>
    ),
};
