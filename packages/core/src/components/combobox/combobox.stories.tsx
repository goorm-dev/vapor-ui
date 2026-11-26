import type { Meta, StoryObj } from '@storybook/react-vite';

import { Combobox } from '.';
import { Box } from '../box';
import { Grid } from '../grid';

type ComboboxProps = Combobox.Root.Props<string>;

export default {
    title: 'Combobox',
    component: Combobox.Root,
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
} satisfies Meta<ComboboxProps>;

const fonts = ['Sans-serif', 'Serif', 'Monospace', 'Cursive'];
const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Rust', 'Go', 'Swift'];

const renderItem = (item: string) => (
    <Combobox.Item key={item} value={item}>
        {item}
    </Combobox.Item>
);

export const Default: StoryObj<ComboboxProps> = {
    render: (args) => (
        <Box $css={{ margin: '200px', width: '240px' }}>
            <Combobox.Root items={languages} placeholder="Select language" {...args}>
                <Combobox.InputGroup />

                <Combobox.Popup>
                    <Combobox.Empty>No results found</Combobox.Empty>
                    {renderItem}
                </Combobox.Popup>
            </Combobox.Root>
        </Box>
    ),
};

export const TestBed = {
    render: () => {
        return (
            <Grid.Root
                $css={{ gap: '150px' }}
                templateColumns="repeat(auto-fit, 240px)"
                templateRows="repeat(auto-fit, minmax(150px, 1fr))"
            >
                <Grid.Item>
                    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                        <Combobox.Root
                            key={size}
                            size={size}
                            items={fonts}
                            placeholder="Placeholder"
                        >
                            <Combobox.InputGroup />
                        </Combobox.Root>
                    ))}
                </Grid.Item>

                <Grid.Item>
                    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                        <Combobox.Root
                            key={size}
                            size={size}
                            items={fonts}
                            defaultValue="Serif"
                            placeholder="Placeholder"
                        >
                            <Combobox.InputGroup />
                        </Combobox.Root>
                    ))}
                </Grid.Item>

                <Grid.Item>
                    {['invalid', 'disabled', 'readOnly'].map((state) => (
                        <Combobox.Root
                            key={state}
                            items={fonts}
                            placeholder="Placeholder"
                            {...{ [state]: true }}
                        >
                            <Combobox.InputGroup />
                        </Combobox.Root>
                    ))}
                </Grid.Item>

                <Grid.Item>
                    {['invalid', 'disabled', 'readOnly'].map((state) => (
                        <Combobox.Root
                            key={state}
                            items={fonts}
                            defaultValue="Monospace"
                            {...{ [state]: true }}
                        >
                            <Combobox.InputGroup />
                        </Combobox.Root>
                    ))}
                </Grid.Item>

                <Grid.Item>
                    <Combobox.Root items={fonts} placeholder="Placeholder" defaultOpen>
                        <Combobox.InputGroup />
                        <Combobox.Popup>{renderItem}</Combobox.Popup>
                    </Combobox.Root>
                </Grid.Item>

                <Grid.Item>
                    <Combobox.Root
                        items={fonts}
                        placeholder="Placeholder"
                        defaultValue="Monospace"
                        defaultOpen
                    >
                        <Combobox.InputGroup />
                        <Combobox.Popup>{renderItem}</Combobox.Popup>
                    </Combobox.Root>
                </Grid.Item>

                <Grid.Item>
                    <Combobox.Root
                        items={fonts}
                        placeholder="Placeholder"
                        defaultInputValue="zzz"
                        defaultOpen
                    >
                        <Combobox.InputGroup />
                        <Combobox.Popup>
                            <Combobox.Empty>No results found</Combobox.Empty>
                            {renderItem}
                        </Combobox.Popup>
                    </Combobox.Root>
                </Grid.Item>

                <Grid.Item>
                    <Combobox.Root
                        items={[
                            { value: 'Font', items: fonts },
                            { value: 'Language', items: languages },
                        ]}
                        placeholder="Grouped"
                        defaultOpen
                    >
                        <Combobox.InputGroup />
                        <Combobox.Popup>
                            {(group: { value: string; items: string[] }) => (
                                <Combobox.Group key={group.value} items={group.items}>
                                    <Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
                                    {renderItem}
                                </Combobox.Group>
                            )}
                        </Combobox.Popup>
                    </Combobox.Root>
                </Grid.Item>
            </Grid.Root>
        );
    },
};
