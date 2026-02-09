import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select } from '.';
import { Box } from '../box';
import { Grid } from '../grid';
import { Toast } from '../toast';

type SelectProps = Select.Root.Props &
    Pick<Select.PositionerPrimitive.Props, 'side' | 'align' | 'sideOffset' | 'alignOffset'>;

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
        required: { control: 'boolean' },
        side: {
            control: { type: 'inline-radio' },
            options: ['top', 'right', 'bottom', 'left'],
        },
        align: {
            control: { type: 'inline-radio' },
            options: ['start', 'center', 'end'],
        },
        sideOffset: { control: { type: 'number' } },
        alignOffset: { control: { type: 'number' } },
    },
} satisfies Meta<SelectProps>;

export const Default: StoryObj<SelectProps> = {
    render: ({ side, align, sideOffset, alignOffset, ...args }) => (
        <Box $css={{ margin: '200px' }}>
            <Select.Root placeholder="Select Font" {...args}>
                <Select.Trigger />

                <Select.Popup
                    positionerElement={
                        <Select.PositionerPrimitive
                            side={side}
                            align={align}
                            sideOffset={sideOffset}
                            alignOffset={alignOffset}
                        />
                    }
                >
                    <Select.Group>
                        <Select.GroupLabel>Font</Select.GroupLabel>
                        <Select.Item value="sans">Sans-serif</Select.Item>
                        <Select.Item value="serif">Serif</Select.Item>
                        <Select.Item value="mono">Monospace</Select.Item>
                        <Select.Item value="cursive">Cursive</Select.Item>
                    </Select.Group>
                </Select.Popup>
            </Select.Root>
        </Box>
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
    render: (args) => {
        const toastManager = Toast.createToastManager();

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget as HTMLFormElement);
            const stringifiedFormData = new URLSearchParams(formData as never).toString();

            const [_name, value] = stringifiedFormData.split('=');

            const description = value ? `Selected Language: ${value}` : 'No data selected';

            toastManager.add({
                title: 'Form Submitted',
                description,
            });
        };

        return (
            <Toast.Provider toastManager={toastManager}>
                <form onSubmit={handleSubmit}>
                    <Select.Root
                        name="language"
                        placeholder="Select Font"
                        items={languages}
                        {...args}
                    >
                        <Select.Trigger />

                        <Select.Popup>
                            <Select.Group>
                                <Select.GroupLabel>Font</Select.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <Select.Item key={value} value={value}>
                                        {label}
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Popup>
                    </Select.Root>

                    <button>submit</button>
                </form>
            </Toast.Provider>
        );
    },
};

const fonts = [
    { label: 'Sans-serif', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

export const ArrayItems: StoryObj<typeof Select.Root> = {
    render: (args) => (
        <Select.Root placeholder="Select Font" items={fonts} {...args}>
            <Select.Trigger />

            <Select.Popup>
                <Select.Group>
                    <Select.GroupLabel>Font</Select.GroupLabel>
                    {fonts.map((font) => (
                        <Select.Item key={font.value} value={font.value}>
                            {font.label}
                        </Select.Item>
                    ))}
                </Select.Group>
            </Select.Popup>
        </Select.Root>
    ),
};

export const TestBed = {
    render: () => {
        return (
            <Grid.Root
                $css={{ gap: '150px' }}
                templateColumns="repeat(auto-fit, 150px)"
                templateRows="repeat(auto-fit, minmax(150px, 1fr))"
            >
                <Grid.Item>
                    <Select.Root placeholder="Placeholder">
                        <Select.Trigger />
                    </Select.Root>
                </Grid.Item>

                <Grid.Item>
                    <Select.Root placeholder="Grouped" defaultOpen>
                        <Select.Trigger />
                        <Select.Popup>
                            <Select.Group>
                                <Select.GroupLabel>Font Group</Select.GroupLabel>
                                {fonts.map((font) => (
                                    <Select.Item key={font.value} value={font.value}>
                                        {font.label}
                                    </Select.Item>
                                ))}
                            </Select.Group>
                            <Select.Separator />
                            <Select.Group>
                                <Select.GroupLabel>Language Group</Select.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <Select.Item key={value} value={value}>
                                        {label}
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Popup>
                    </Select.Root>
                </Grid.Item>

                <Grid.Item>
                    <Select.Root placeholder="Placeholder" defaultOpen defaultValue={'mono'}>
                        <Select.Trigger />
                        <Select.Popup>
                            <Select.Group>
                                <Select.GroupLabel>Font</Select.GroupLabel>
                                {fonts.map((font) => (
                                    <Select.Item key={font.value} value={font.value}>
                                        {font.label}
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Popup>
                    </Select.Root>
                </Grid.Item>

                <Grid.Item>
                    <Select.Root
                        placeholder="Select Font"
                        defaultOpen
                        items={languages}
                        defaultValue={'csharp'}
                    >
                        <Select.Trigger />

                        <Select.Popup>
                            <Select.Group>
                                <Select.GroupLabel>Auto Label: </Select.GroupLabel>
                                {Object.entries(languages).map(([value, label]) => (
                                    <Select.Item key={value} value={value}>
                                        {value} → {label}
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Popup>
                    </Select.Root>
                </Grid.Item>

                <Grid.Item>
                    <Select.Root
                        placeholder="Select Font"
                        items={fonts}
                        defaultValue={'mono'}
                        defaultOpen
                    >
                        <Select.Trigger />

                        <Select.Popup>
                            <Select.Group>
                                <Select.GroupLabel>Auto Label:</Select.GroupLabel>
                                {fonts.map((font) => (
                                    <Select.Item key={font.value} value={font.value}>
                                        {font.value} → {font.label}
                                    </Select.Item>
                                ))}
                            </Select.Group>
                        </Select.Popup>
                    </Select.Root>
                </Grid.Item>
            </Grid.Root>
        );
    },
};
