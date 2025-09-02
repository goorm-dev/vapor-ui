import type { StoryObj } from '@storybook/react';

import { RadioGroup } from '.';

export default {
    title: 'RadioGroup',
    component: RadioGroup,
    argTypes: {
        disabled: { control: 'boolean' },
        invalid: { control: 'boolean' },
        orientation: {
            control: 'inline-radio',
            options: ['vertical', 'horizontal'],
        },
        size: {
            control: 'inline-radio',
            options: ['md', 'lg'],
        },
        visuallyHidden: { control: 'boolean' },
    },
};

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
    render: (args) => (
        <RadioGroup.Root {...args}>
            <RadioGroup.Item value="1">
                <RadioGroup.Control />
                Item 1
            </RadioGroup.Item>
            <RadioGroup.Item value="2">
                <RadioGroup.Control />
                Item 2
            </RadioGroup.Item>
            <RadioGroup.Item value="3">
                <RadioGroup.Control />
                Item 3
            </RadioGroup.Item>
            <RadioGroup.Item value="4" invalid>
                <RadioGroup.Control />
                Item 4 (Each Invalid)
            </RadioGroup.Item>
            <RadioGroup.Item value="5" disabled>
                <RadioGroup.Control />
                Item 5 (Each Disabled)
            </RadioGroup.Item>
        </RadioGroup.Root>
    ),
};

export const TestBed: Story = {
    render: (args) => (
        <RadioGroup.Root {...args} defaultValue="3">
            <RadioGroup.Item value="1">
                <RadioGroup.Control />
                Item 1
            </RadioGroup.Item>
            <RadioGroup.Item value="2">
                <RadioGroup.Control />
                Item 2
            </RadioGroup.Item>
            <RadioGroup.Item value="3">
                <RadioGroup.Control />
                Item 3
            </RadioGroup.Item>
            <RadioGroup.Item value="4" invalid>
                <RadioGroup.Control />
                Item 4 (Each Invalid)
            </RadioGroup.Item>
            <RadioGroup.Item value="5" disabled>
                <RadioGroup.Control />
                Item 5 (Each Disabled)
            </RadioGroup.Item>
        </RadioGroup.Root>
    ),
};
