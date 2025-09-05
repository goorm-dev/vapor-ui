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
        <RadioGroup.Root {...args}>
            <label>
                <Radio.Root value="1" />
                Item 1
            </label>
            <label>
                <Radio.Root value="2" />
                Item 2
            </label>
            <label>
                <Radio.Root value="3" />
                Item 3
            </label>
            <label>
                <Radio.Root value="4" />
                Item 4 (Each Invalid)
            </label>
            <label>
                <Radio.Root value="5" />
                Item 5 (Each Disabled)
            </label>
        </RadioGroup.Root>
    ),
};

export const TestBed: Story = {
    render: (args) => (
        <RadioGroup.Root {...args} defaultValue="3">
            <Radio.Root id="radio-1" value="1" />
            <label htmlFor="radio-1">Item 1</label>

            <Radio.Root id="radio-2" value="2" />
            <label htmlFor="radio-2">Item 2</label>

            <Radio.Root id="radio-3" value="3" />
            <label htmlFor="radio-3">Item 3</label>

            <Radio.Root id="radio-4" value="4" invalid />
            <label htmlFor="radio-4">Item 4 (Each Invalid)</label>

            <Radio.Root id="radio-5" value="5" disabled />
            <label htmlFor="radio-5">Item 5 (Each Disabled)</label>
        </RadioGroup.Root>
    ),
};
