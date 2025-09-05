import type { StoryObj } from '@storybook/react';

import { Radio } from '../radio/radio';

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
    render: (args) => (
        <>
            <Radio.Root {...args} />

            <label>
                <Radio.Root {...args} />
                With Label
            </label>
        </>
    ),
};

export const TestBed: Story = {
    render: () => (
        <>
            <Radio.Root value="default" />
            <Radio.Root invalid value="invalid" />
            <Radio.Root disabled value="disabled" />
            <Radio.Root required value="required" />
            <Radio.Root readOnly value="readOnly" />
        </>
    ),
};
