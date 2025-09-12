import type { Meta, StoryObj } from '@storybook/react';

import { Grid } from '../grid';
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
                <Select.DisplayValue placeholder="Select Font" />
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

export const TestBed = {
    render: () => {
        return (
            <Grid.Root
                gap="150px"
                templateColumns="repeat(auto-fit, 150px)"
                templateRows="repeat(auto-fit, minmax(150px, 1fr))"
            >
                <Grid.Item>
                    <Select.Root>
                        <Select.Trigger>
                            <Select.DisplayValue placeholder="Placeholder" />
                            <Select.TriggerIcon />
                        </Select.Trigger>
                    </Select.Root>
                </Grid.Item>

                <Grid.Item>
                    <Select.Root defaultOpen>
                        <Select.Trigger>
                            <Select.DisplayValue placeholder="Grouped" />
                            <Select.TriggerIcon />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                <Select.GroupLabel>Font Group</Select.GroupLabel>
                                {fonts.map((font) => (
                                    <Select.Item key={font.value} value={font.value}>
                                        {font.label}

                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Group>
                            <Select.Separator />
                            <Select.Group>
                                <Select.GroupLabel>Language Group</Select.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <Select.Item key={value} value={value}>
                                        {label}

                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </Grid.Item>

                <Grid.Item>
                    <Select.Root defaultOpen defaultValue={'mono'}>
                        <Select.Trigger>
                            <Select.DisplayValue placeholder="Placeholder" />
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
                </Grid.Item>

                <Grid.Item>
                    <Select.Root defaultOpen items={languages} defaultValue={'csharp'}>
                        <Select.Trigger>
                            <Select.DisplayValue placeholder="Select Font" />
                            <Select.TriggerIcon />
                        </Select.Trigger>

                        <Select.Content>
                            <Select.Group>
                                <Select.GroupLabel>Auto Label: </Select.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <Select.Item key={value} value={value}>
                                        {value} → {label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </Grid.Item>

                <Grid.Item>
                    <Select.Root items={fonts} defaultValue={'mono'} defaultOpen>
                        <Select.Trigger>
                            <Select.DisplayValue placeholder="Select Font" />
                            <Select.TriggerIcon />
                        </Select.Trigger>

                        <Select.Content>
                            <Select.Group>
                                <Select.GroupLabel>Auto Label:</Select.GroupLabel>
                                {fonts.map((font) => (
                                    <Select.Item key={font.value} value={font.value}>
                                        {font.value} → {font.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </Grid.Item>
            </Grid.Root>
        );
    },
};
