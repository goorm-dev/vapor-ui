/* eslint-disable jsx-a11y/label-has-associated-control */
import type { StoryObj } from '@storybook/react';

import { RadioGroup } from '.';
import { Radio } from '../radio/radio';

export default {
    title: 'RadioGroup',
    component: RadioGroup,
    argTypes: {
        disabled: { control: 'boolean' },
        invalid: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        required: { control: 'boolean' },
        orientation: {
            control: 'inline-radio',
            options: ['vertical', 'horizontal'],
        },
        size: {
            control: 'inline-radio',
            options: ['md', 'lg'],
        },
    },
};

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
    render: (args) => (
        <RadioGroup.Root {...args} name="asedf" defaultValue={'3'}>
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

export const TestBed: Story = {
    render: (args) => (
        <RadioGroup.Root {...args} defaultValue="3">
            <Radio.Root id="radio-1" value="1" />
            <Radio.Root id="radio-2" value="2" />
            <Radio.Root id="radio-3" value="3" />
            <Radio.Root id="radio-4" value="4" invalid />
            <Radio.Root id="radio-5" value="5" disabled />
        </RadioGroup.Root>
    ),
};
