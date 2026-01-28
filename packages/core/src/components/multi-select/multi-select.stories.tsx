import type { Meta, StoryObj } from '@storybook/react-vite';

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
        required: { control: 'boolean' },
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
                <MultiSelect.Trigger />
                <MultiSelect.Popup>
                    {fonts.map((font) => (
                        <MultiSelect.Item key={font.value} value={font.value}>
                            {font.label}
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Popup>
            </MultiSelect.Root>
        );
    },
};

export const ObjectItems: StoryObj = {
    render: (args) => {
        const renderValue = (value: Array<Language>) => {
            if (value.length === 0) {
                return (
                    <MultiSelect.PlaceholderPrimitive>
                        Select languages
                    </MultiSelect.PlaceholderPrimitive>
                );
            }

            const values = value.slice(0, 2);
            const rests = value.slice(2);

            return [
                ...values.map((v: Language) => <Badge key={v}>{languages[v]}</Badge>),
                rests.length ? <Badge key="more">+{rests.length} more</Badge> : null,
            ];
        };

        return (
            <HStack $styles={{ gap: '$200' }}>
                <VStack>
                    <span>Default</span>
                    <MultiSelect.Root {...args} items={languages}>
                        <MultiSelect.TriggerPrimitive>
                            <MultiSelect.ValuePrimitive>{renderValue}</MultiSelect.ValuePrimitive>
                            <MultiSelect.TriggerIconPrimitive />
                        </MultiSelect.TriggerPrimitive>
                        <MultiSelect.Popup>
                            {Object.entries(languages).map(([value, label]) => (
                                <MultiSelect.Item key={value} value={value}>
                                    {label}
                                </MultiSelect.Item>
                            ))}
                        </MultiSelect.Popup>
                    </MultiSelect.Root>
                </VStack>

                <VStack>
                    <span>Custom Value</span>
                    <MultiSelect.Root {...args} items={languages}>
                        <MultiSelect.TriggerPrimitive>
                            <MultiSelect.ValuePrimitive>
                                {(value) =>
                                    value.length ? (
                                        value.join(', ')
                                    ) : (
                                        <MultiSelect.PlaceholderPrimitive>
                                            Select languages
                                        </MultiSelect.PlaceholderPrimitive>
                                    )
                                }
                            </MultiSelect.ValuePrimitive>
                            <MultiSelect.TriggerIconPrimitive />
                        </MultiSelect.TriggerPrimitive>
                        <MultiSelect.Popup>
                            {Object.entries(languages).map(([value, label]) => (
                                <MultiSelect.Item key={value} value={value}>
                                    {label}
                                </MultiSelect.Item>
                            ))}
                        </MultiSelect.Popup>
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
                return (
                    <MultiSelect.PlaceholderPrimitive>
                        Select fonts
                    </MultiSelect.PlaceholderPrimitive>
                );
            }

            const values = value.slice(0, 2);
            const rests = value.slice(2);

            return [
                ...values.map((v: string) => <Badge key={v}>{v}</Badge>),
                rests.length ? <Badge key="more">+{rests.length} more</Badge> : null,
            ];
        };

        return (
            <HStack $styles={{ gap: '$200' }}>
                <VStack>
                    <span>Default</span>
                    <MultiSelect.Root {...args} items={fonts} defaultValue={null}>
                        <MultiSelect.TriggerPrimitive>
                            <MultiSelect.ValuePrimitive>{renderValue}</MultiSelect.ValuePrimitive>
                            <MultiSelect.TriggerIconPrimitive />
                        </MultiSelect.TriggerPrimitive>
                        <MultiSelect.Popup>
                            {fonts.map(({ value, label }) => (
                                <MultiSelect.Item key={value} value={value}>
                                    {label}
                                </MultiSelect.Item>
                            ))}
                        </MultiSelect.Popup>
                    </MultiSelect.Root>
                </VStack>

                <VStack>
                    <span>Custom Value</span>
                    <MultiSelect.Root {...args} items={fonts}>
                        <MultiSelect.TriggerPrimitive>
                            <MultiSelect.ValuePrimitive>
                                {(value) =>
                                    value.length ? (
                                        value.join(', ')
                                    ) : (
                                        <MultiSelect.PlaceholderPrimitive>
                                            Select fonts
                                        </MultiSelect.PlaceholderPrimitive>
                                    )
                                }
                            </MultiSelect.ValuePrimitive>

                            <MultiSelect.TriggerIconPrimitive />
                        </MultiSelect.TriggerPrimitive>
                        <MultiSelect.Popup>
                            {fonts.map(({ value, label }) => (
                                <MultiSelect.Item key={value} value={value}>
                                    {label}
                                </MultiSelect.Item>
                            ))}
                        </MultiSelect.Popup>
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
                        <MultiSelect.Trigger />
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root placeholder="Grouped" defaultOpen>
                        <MultiSelect.Trigger />
                        <MultiSelect.Popup>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Font Group</MultiSelect.GroupLabel>
                                {fonts.map((font) => (
                                    <MultiSelect.Item key={font.value} value={font.value}>
                                        {font.label}
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                            <MultiSelect.Separator />
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Language Group</MultiSelect.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <MultiSelect.Item key={value} value={value}>
                                        {label}
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Popup>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root placeholder="Placeholder" defaultOpen defaultValue={['mono']}>
                        <MultiSelect.Trigger />
                        <MultiSelect.Popup>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Font</MultiSelect.GroupLabel>
                                {fonts.map((font) => (
                                    <MultiSelect.Item key={font.value} value={font.value}>
                                        {font.label}
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Popup>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root
                        placeholder="MultiSelect Font"
                        defaultOpen
                        items={languages}
                        defaultValue={['csharp']}
                    >
                        <MultiSelect.Trigger />

                        <MultiSelect.Popup>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Auto Label: </MultiSelect.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <MultiSelect.Item key={value} value={value}>
                                        {value} → {label}
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Popup>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root
                        placeholder="MultiSelect Font"
                        items={fonts}
                        defaultValue={['mono']}
                        defaultOpen
                    >
                        <MultiSelect.Trigger />

                        <MultiSelect.Popup>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Auto Label:</MultiSelect.GroupLabel>
                                {fonts.map((font) => (
                                    <MultiSelect.Item key={font.value} value={font.value}>
                                        {font.value} → {font.label}
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Popup>
                    </MultiSelect.Root>
                </Grid.Item>

                <Grid.Item>
                    <MultiSelect.Root
                        items={languages}
                        defaultValue={['javascript', 'python', 'go', 'rust']}
                        defaultOpen
                    >
                        <MultiSelect.TriggerPrimitive>
                            <MultiSelect.ValuePrimitive>{renderValue}</MultiSelect.ValuePrimitive>
                            <MultiSelect.TriggerIconPrimitive />
                        </MultiSelect.TriggerPrimitive>
                        <MultiSelect.Popup>
                            <MultiSelect.Group>
                                <MultiSelect.GroupLabel>Truncated</MultiSelect.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <MultiSelect.Item key={value} value={value}>
                                        {label}
                                    </MultiSelect.Item>
                                ))}
                            </MultiSelect.Group>
                        </MultiSelect.Popup>
                    </MultiSelect.Root>
                </Grid.Item>
            </Grid.Root>
        );
    },
};
