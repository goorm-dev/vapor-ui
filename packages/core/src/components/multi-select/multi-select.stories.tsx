import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from '../badge';
import { Grid } from '../grid';
import { MultiSelect } from './multi-select';

export default {
    title: 'MultiSelect',
    component: MultiSelect.Root,
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['md', 'lg', 'xl'],
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
            <MultiSelect.Root items={fonts} {...args}>
                <MultiSelect.Trigger>
                    <MultiSelect.DisplayValue placeholder="Select fonts" />
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
            <MultiSelect.Root items={languages}>
                <MultiSelect.Trigger>
                    {/* <MultiSelect.DisplayValue placeholder="Select languages" /> */}
                    <MultiSelect.DisplayValue>{renderValue}</MultiSelect.DisplayValue>
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
        );
    },
};

export const ArrayItmes: StoryObj = {
    render: () => {
        const renderValue = (value: Array<string>) => {
            if (value.length === 0) {
                return 'Select fonts';
            }

            const values = value.slice(0, 2);
            const rests = value.slice(2);

            return [
                ...values.map((v: string) => <Badge key={v}>{v}</Badge>),
                rests.length ? <Badge key="more">+{rests.length} more</Badge> : null,
            ];
        };

        return (
            <MultiSelect.Root items={fonts} defaultValue={null}>
                <MultiSelect.Trigger>
                    {/* <MultiSelect.DisplayValue placeholder="Select fonts" /> */}
                    <MultiSelect.DisplayValue>{renderValue}</MultiSelect.DisplayValue>
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
                    <MultiSelect.Root>
                        <MultiSelect.Trigger>
                            <MultiSelect.DisplayValue placeholder="Placeholder" />
                            <MultiSelect.TriggerIcon />
                        </MultiSelect.Trigger>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root defaultOpen>
                        <MultiSelect.Trigger>
                            <MultiSelect.DisplayValue placeholder="Grouped" />
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
                    <MultiSelect.Root defaultOpen defaultValue={['mono']}>
                        <MultiSelect.Trigger>
                            <MultiSelect.DisplayValue placeholder="Placeholder" />
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
                    <MultiSelect.Root defaultOpen items={languages} defaultValue={['csharp']}>
                        <MultiSelect.Trigger>
                            <MultiSelect.DisplayValue placeholder="MultiSelect Font" />
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
                    <MultiSelect.Root items={fonts} defaultValue={['mono']} defaultOpen>
                        <MultiSelect.Trigger>
                            <MultiSelect.DisplayValue placeholder="MultiSelect Font" />
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
                            {/* <MultiSelect.DisplayValue placeholder="Select languages" /> */}
                            <MultiSelect.DisplayValue>{renderValue}</MultiSelect.DisplayValue>
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
