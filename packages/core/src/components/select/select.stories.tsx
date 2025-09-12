import type { Meta, StoryObj } from '@storybook/react';

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

export const Default: StoryObj<typeof Select.Root> = {
    render: (args) => (
        <Select.Root {...args}>
            <Select.Trigger>
                <Select.DisplayValue />
                <Select.TriggerIcon />
            </Select.Trigger>

            <Select.Content>
                <Select.Group>
                    <Select.GroupLabel>Font</Select.GroupLabel>
                    <Select.Item value="sans">
                        Sans-serif
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="serif">
                        Serif
                        <Select.ItemIndicator />
                    </Select.Item>

                    <Select.Item value="mono">
                        Monospace
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="cursive">
                        Cursive
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Group>
            </Select.Content>
        </Select.Root>
    ),
};

const languages = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    php: 'PHP',
    cpp: 'C++',
    rust: 'Rust',
    go: 'Go',
    swift: 'Swift',
};

export const ObjectItems: StoryObj<typeof Select.Root> = {
    render: (args) => (
        <Select.Root items={languages} {...args}>
            <Select.Trigger>
                <Select.DisplayValue placeholder="Select Font" />
                <Select.TriggerIcon />
            </Select.Trigger>

            <Select.Content>
                <Select.Group>
                    <Select.GroupLabel>Font</Select.GroupLabel>
                    {Object.entries(languages).map(([value, label]) => (
                        <Select.Item key={value} value={value}>
                            {label}

                            <Select.ItemIndicator />
                        </Select.Item>
                    ))}
                </Select.Group>
            </Select.Content>
        </Select.Root>
    ),
};

const fonts = [
    { label: 'Sans-serif', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

export const ArrayItems: StoryObj<typeof Select.Root> = {
    render: (args) => (
        <Select.Root items={fonts} {...args}>
            <Select.Trigger>
                <Select.DisplayValue placeholder="Select Font" />
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
    ),
};
