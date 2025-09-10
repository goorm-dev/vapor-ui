import type { Meta, StoryObj } from '@storybook/react';

import { HStack } from '../h-stack';
import { Select } from './select';

export default {
    title: 'Select',
    component: Select.Root,
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
        invalid: { control: 'boolean' },
        disabled: { control: 'boolean' },
        readOnly: { control: 'boolean' },
    },
} satisfies Meta<typeof Select.Root>;

const fonts = [
    { label: 'Select Item', value: null },
    { label: 'Sans-serif', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

export const Default: StoryObj<typeof Select.Root> = {
    render: (args) => (
        <HStack>
            <Select.Root {...args} items={fonts}>
                <Select.Trigger>
                    <Select.DisplayValue />
                    <Select.TriggerIcon />
                </Select.Trigger>

                <Select.Content>
                    <Select.Group>
                        <Select.GroupLabel>Font</Select.GroupLabel>
                        {fonts.map((font) => (
                            <Select.Item key={font.value} value={font.value}>
                                {font.label}

                                <Select.ItemIndicator />
                            </Select.Item>
                        ))}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
            <Select.Root>
                <Select.Trigger>
                    <Select.Placeholder>sans</Select.Placeholder>

                    <Select.TriggerIcon />
                </Select.Trigger>
            </Select.Root>
        </HStack>
    ),
};
