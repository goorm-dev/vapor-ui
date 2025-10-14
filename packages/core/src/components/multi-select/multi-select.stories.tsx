import type { Meta, StoryObj } from '@storybook/react';

import { MultiSelect } from '.';
import { Badge } from '../badge';
import { Grid } from '../grid';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'MultiSelect',
    component: MultiSelect.Root,
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
        invalid: { control: 'boolean' },
        disabled: { control: 'boolean' },
        readOnly: { control: 'boolean' },
    },
} satisfies Meta;

const fonts = [
    { label: 'Sans-serif', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

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

type Language = keyof typeof languages;

export const Default: StoryObj = {
    render: (args) => {
        return (
            <MultiSelect.Root placeholder="Select fonts" items={fonts} {...args}>
                <MultiSelect.Trigger>
                    <MultiSelect.Value />
                    <MultiSelect.TriggerIcon />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                    {fonts.map((font) => (
                        <MultiSelect.Item key={font.value} value={font.value}>
                            {font.label}
                            <MultiSelect.ItemIndicator />
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Content>
            </MultiSelect.Root>
        );
    },
};

export const ObjectItems: StoryObj = {
    render: (args) => {
        const renderValue = (value: Array<Language>) => {
            if (value.length === 0) {
                return <MultiSelect.Placeholder>Select languages</MultiSelect.Placeholder>;
            }

            const values = value.slice(0, 2);
            const rests = value.slice(2);

            return [
                ...values.map((v: Language) => <Badge key={v}>{languages[v]}</Badge>),
                rests.length ? <Badge key="more">+{rests.length} more</Badge> : null,
            ];
        };

        return (
            <HStack gap="$200">
                <VStack>
                    <span>Default</span>
                    <MultiSelect.Root {...args} items={languages}>
                        <MultiSelect.Trigger>
                            <MultiSelect.Value>{renderValue}</MultiSelect.Value>
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                        <MultiSelect.Content>
                            {Object.entries(languages).map(([value, label]) => (
                                <MultiSelect.Item key={value} value={value}>
                                    {label}
                                    <MultiSelect.ItemIndicator />
                                </MultiSelect.Item>
                            ))}
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </VStack>

                <VStack>
                    <span>Custom Value</span>
                    <MultiSelect.Root {...args} items={languages}>
                        <MultiSelect.Trigger>
                            <MultiSelect.Value>
                                {(value) =>
                                    value.length ? (
                                        value.join(', ')
                                    ) : (
                                        <MultiSelect.Placeholder>
                                            Select languages
                                        </MultiSelect.Placeholder>
                                    )
                                }
                            </MultiSelect.Value>
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                        <MultiSelect.Content>
                            {Object.entries(languages).map(([value, label]) => (
                                <MultiSelect.Item key={value} value={value}>
                                    {label}
                                    <MultiSelect.ItemIndicator />
                                </MultiSelect.Item>
                            ))}
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </VStack>
            </HStack>
        );
    },
};

export const ArrayItmes: StoryObj = {
    render: (args) => {
        const renderValue = (value: Array<string>) => {
            if (value.length === 0) {
                return <MultiSelect.Placeholder>Select fonts</MultiSelect.Placeholder>;
            }

            const values = value.slice(0, 2);
            const rests = value.slice(2);

            return [
                ...values.map((v: string) => <Badge key={v}>{v}</Badge>),
                rests.length ? <Badge key="more">+{rests.length} more</Badge> : null,
            ];
        };

        return (
            <HStack gap="$200">
                <VStack>
                    <span>Default</span>
                    <MultiSelect.Root {...args} items={fonts} defaultValue={null}>
                        <MultiSelect.Trigger>
                            <MultiSelect.Value>{renderValue}</MultiSelect.Value>
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                        <MultiSelect.Content>
                            {fonts.map(({ value, label }) => (
                                <MultiSelect.Item key={value} value={value}>
                                    {label}
                                    <MultiSelect.ItemIndicator />
                                </MultiSelect.Item>
                            ))}
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </VStack>

                <VStack>
                    <span>Custom Value</span>
                    <MultiSelect.Root {...args} items={fonts}>
                        <MultiSelect.Trigger>
                            <MultiSelect.Value>
                                {(value) =>
                                    value.length ? (
                                        value.join(', ')
                                    ) : (
                                        <MultiSelect.Placeholder>
                                            Select fonts
                                        </MultiSelect.Placeholder>
                                    )
                                }
                            </MultiSelect.Value>

                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                        <MultiSelect.Content>
                            {fonts.map(({ value, label }) => (
                                <MultiSelect.Item key={value} value={value}>
                                    {label}
                                    <MultiSelect.ItemIndicator />
                                </MultiSelect.Item>
                            ))}
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </VStack>
            </HStack>
        );
    },
};

export const TestBed = {
    render: () => {
        const renderValue = (value: Array<Language>) => {
            if (value.length === 0) {
                return 'Select languages';
            }

            const values = value.slice(0, 2);
            const rests = value.slice(2);

            return [
                ...values.map((v: Language) => <Badge key={v}>{languages[v]}</Badge>),
                rests.length ? <Badge key="more">+{rests.length} more</Badge> : null,
            ];
        };

        return (
            <Grid.Root
                templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                templateRows="repeat(auto-fit, minmax(150px, 1fr))"
            >
                <Grid.Item>
                    <MultiSelect.Root placeholder="Placeholder">
                        <MultiSelect.Trigger>
                            <MultiSelect.Value />
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root placeholder="Grouped" defaultOpen>
                        <MultiSelect.Trigger>
                            <MultiSelect.Value />
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                        <MultiSelect.Content>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Font Group</MultiSelect.GroupLabel>
                                {fonts.map((font) => (
                                    <MultiSelect.Item key={font.value} value={font.value}>
                                        {font.label}

                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                            <MultiSelect.Separator />
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Language Group</MultiSelect.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <MultiSelect.Item key={value} value={value}>
                                        {label}

                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root placeholder="Placeholder" defaultOpen defaultValue={['mono']}>
                        <MultiSelect.Trigger>
                            <MultiSelect.Value />
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                        <MultiSelect.Content>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Font</MultiSelect.GroupLabel>
                                {fonts.map((font) => (
                                    <MultiSelect.Item key={font.value} value={font.value}>
                                        {font.label}

                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root
                        placeholder="MultiSelect Font"
                        defaultOpen
                        items={languages}
                        defaultValue={['csharp']}
                    >
                        <MultiSelect.Trigger>
                            <MultiSelect.Value />
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>

                        <MultiSelect.Content>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Auto Label: </MultiSelect.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <MultiSelect.Item key={value} value={value}>
                                        {value} → {label}
                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root
                        placeholder="MultiSelect Font"
                        items={fonts}
                        defaultValue={['mono']}
                        defaultOpen
                    >
                        <MultiSelect.Trigger>
                            <MultiSelect.Value />
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>

                        <MultiSelect.Content>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Auto Label:</MultiSelect.GroupLabel>
                                {fonts.map((font) => (
                                    <MultiSelect.Item key={font.value} value={font.value}>
                                        {font.value} → {font.label}
                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root
                        items={languages}
                        defaultValue={['javascript', 'python', 'go', 'rust']}
                        defaultOpen
                    >
                        <MultiSelect.Trigger>
                            <MultiSelect.Value>{renderValue}</MultiSelect.Value>
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                        <MultiSelect.Content>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Truncated</MultiSelect.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <MultiSelect.Item key={value} value={value}>
                                        {label}
                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Content>
                    </MultiSelect.Root>
                </Grid.Item>
            </Grid.Root>
        );
    },
};
