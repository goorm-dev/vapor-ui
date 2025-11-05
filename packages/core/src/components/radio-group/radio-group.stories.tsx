/* eslint-disable jsx-a11y/label-has-associated-control */
import type { StoryObj } from '@storybook/react-vite';

import { RadioGroup } from '.';
import { HStack } from '../h-stack';
import { Radio } from '../radio';
import { RadioCard } from '../radio-card';

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
            <RadioGroup.Label>Options</RadioGroup.Label>

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
        <HStack gap="$400">
            <RadioGroup.Root {...args} defaultValue="3">
                <RadioGroup.Label>Options</RadioGroup.Label>
                <Radio.Root id="radio-1" value="1" />
                <Radio.Root id="radio-2" value="2" />
                <Radio.Root id="radio-3" value="3" />
                <Radio.Root id="radio-4" value="4" />
                <Radio.Root id="radio-5" value="5" />
            </RadioGroup.Root>

            <RadioGroup.Root {...args} defaultValue="3">
                <RadioGroup.Label>Options</RadioGroup.Label>
                <RadioCard id="radio-1" value="1">
                    Option 1
                </RadioCard>
                <RadioCard id="radio-2" value="2">
                    Option 2
                </RadioCard>
                <RadioCard id="radio-3" value="3">
                    Option 3
                </RadioCard>
                <RadioCard id="radio-4" value="4">
                    Option 4
                </RadioCard>
                <RadioCard id="radio-5" value="5">
                    Option 5
                </RadioCard>
            </RadioGroup.Root>
        </HStack>
    ),
};
