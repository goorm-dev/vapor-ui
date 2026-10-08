/* eslint-disable jsx-a11y/label-has-associated-control */
import type { StoryObj } from '@storybook/react-vite';

import { RadioGroup } from '.';
import { HStack } from '../h-stack';
import { Radio } from '../radio';
import { RadioCard } from '../radio-card';
import { VStack } from '../v-stack';

export default {
    title: 'RadioGroup',
    component: RadioGroup,
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

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
    render: (args) => (
        <RadioGroup.Root {...args} name="radio-group" defaultValue="3">
            <RadioGroup.Label id="radio-group-label">
                Options
                <RadioGroup.RequiredSymbol />
            </RadioGroup.Label>

            <label
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--vapor-size-space-050)',
                }}
            >
                <Radio.Root value="1" />
                Option 1
            </label>
            <label
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--vapor-size-space-050)',
                }}
            >
                <Radio.Root value="2" />
                Option 2
            </label>
            <label
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--vapor-size-space-050)',
                }}
            >
                <Radio.Root value="3" />
                Option 3
            </label>
            <label
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--vapor-size-space-050)',
                }}
            >
                <Radio.Root value="4" />
                Option 4
            </label>
        </RadioGroup.Root>
    ),
};

export const WithRadioCard: Story = {
    render: (args) => (
        <RadioGroup.Root {...args} name="radio-card-group" defaultValue="3">
            <RadioGroup.Label>Options</RadioGroup.Label>
            <RadioCard value="1">value 1</RadioCard>
            <RadioCard value="2">value 2</RadioCard>
            <RadioCard value="3">value 3</RadioCard>
            <RadioCard value="4">value 4</RadioCard>
            <RadioCard value="5">value 5</RadioCard>
        </RadioGroup.Root>
    ),
};

export const TestBed: Story = {
    render: (args) => (
        <VStack $css={{ gap: '$400' }}>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <RadioGroup.Root {...args} defaultValue="radio-1">
                    <RadioGroup.Label>
                        Default
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <Radio.Root value="radio-1" size="md" />
                    <Radio.Root value="radio-2" size="md" />
                </RadioGroup.Root>
                <RadioGroup.Root {...args} defaultValue="radio-4" disabled>
                    <RadioGroup.Label>
                        Disabled
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <Radio.Root value="radio-4" size="md" />
                    <Radio.Root value="radio-5" size="md" />
                </RadioGroup.Root>
                <RadioGroup.Root {...args} defaultValue="radio-7" invalid>
                    <RadioGroup.Label>
                        Invalid
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <Radio.Root value="radio-7" size="md" />
                    <Radio.Root value="radio-8" size="md" />
                </RadioGroup.Root>
                <RadioGroup.Root {...args} defaultValue="radio-10" required>
                    <RadioGroup.Label>
                        Required
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <Radio.Root value="radio-10" size="md" />
                    <Radio.Root value="radio-11" size="md" />
                </RadioGroup.Root>
                <RadioGroup.Root {...args} defaultValue="radio-13" readOnly>
                    <RadioGroup.Label>
                        ReadOnly
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <Radio.Root value="radio-13" size="md" />
                    <Radio.Root value="radio-14" size="md" />
                </RadioGroup.Root>
            </HStack>

            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <RadioGroup.Root {...args} defaultValue="radio-1">
                    <RadioGroup.Label>
                        Default
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <RadioCard value="radio-1">radio-1</RadioCard>
                    <RadioCard value="radio-2">radio-2</RadioCard>
                </RadioGroup.Root>
                <RadioGroup.Root {...args} defaultValue="radio-4" disabled>
                    <RadioGroup.Label>
                        Disabled
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <RadioCard value="radio-4">radio-4</RadioCard>
                    <RadioCard value="radio-5">radio-5</RadioCard>
                </RadioGroup.Root>
                <RadioGroup.Root {...args} defaultValue="radio-7" invalid>
                    <RadioGroup.Label>
                        Invalid
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <RadioCard value="radio-7">radio-7</RadioCard>
                    <RadioCard value="radio-8">radio-8</RadioCard>
                </RadioGroup.Root>
                <RadioGroup.Root {...args} defaultValue="radio-10" required>
                    <RadioGroup.Label>
                        Required
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <RadioCard value="radio-10">radio-10</RadioCard>
                    <RadioCard value="radio-11">radio-11</RadioCard>
                </RadioGroup.Root>
                <RadioGroup.Root {...args} defaultValue="radio-13" readOnly>
                    <RadioGroup.Label>
                        ReadOnly
                        <RadioGroup.RequiredSymbol />
                    </RadioGroup.Label>
                    <RadioCard value="radio-13">radio-13</RadioCard>
                    <RadioCard value="radio-14">radio-14</RadioCard>
                </RadioGroup.Root>
            </HStack>
        </VStack>
    ),
};
