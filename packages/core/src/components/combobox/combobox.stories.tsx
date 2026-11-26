import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeOutlineIcon } from '@vapor-ui/icons';

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
            <Combobox.Root
                items={languages}
                placeholder="Select language"
                aria-label="Language"
                {...args}
            >
                <Combobox.InputGroup />

                <Combobox.Popup>
                    <Combobox.Empty>No results found</Combobox.Empty>
                    {renderItem}
                </Combobox.Popup>
            </Combobox.Root>
        </Box>
    ),
};

const stack = { display: 'flex', flexDirection: 'column', gap: '16px' } as const;
const openCell = { height: '340px' } as const;

export const TestBed = {
    render: () => {
        return (
            <Box $css={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <Grid.Root $css={{ gap: '150px' }} templateColumns="repeat(auto-fit, 240px)">
                    <Grid.Item $css={stack}>
                        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                            <Combobox.Root
                                key={size}
                                size={size}
                                items={fonts}
                                placeholder="Placeholder"
                                aria-label={`Font ${size}`}
                            >
                                <Combobox.InputGroup />
                            </Combobox.Root>
                        ))}
                    </Grid.Item>

                    <Grid.Item $css={stack}>
                        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                            <Combobox.Root
                                key={size}
                                size={size}
                                items={fonts}
                                defaultValue="Serif"
                                placeholder="Placeholder"
                                aria-label={`Selected font ${size}`}
                            >
                                <Combobox.InputGroup />
                            </Combobox.Root>
                        ))}
                    </Grid.Item>

                    <Grid.Item $css={stack}>
                        {['invalid', 'disabled', 'readOnly'].map((state) => (
                            <Combobox.Root
                                key={state}
                                items={fonts}
                                placeholder="Placeholder"
                                aria-label={`Font ${state}`}
                                {...{ [state]: true }}
                            >
                                <Combobox.InputGroup />
                            </Combobox.Root>
                        ))}
                    </Grid.Item>

                    <Grid.Item $css={stack}>
                        {['invalid', 'disabled', 'readOnly'].map((state) => (
                            <Combobox.Root
                                key={state}
                                items={fonts}
                                defaultValue="Monospace"
                                aria-label={`Selected font ${state}`}
                                {...{ [state]: true }}
                            >
                                <Combobox.InputGroup />
                            </Combobox.Root>
                        ))}
                    </Grid.Item>
                </Grid.Root>

                <Grid.Root $css={{ gap: '150px' }} templateColumns="repeat(auto-fit, 240px)">
                    <Grid.Item $css={openCell}>
                        <Combobox.Root
                            items={fonts}
                            placeholder="Placeholder"
                            aria-label="Open font"
                            defaultOpen
                        >
                            <Combobox.InputGroup />
                            <Combobox.Popup>{renderItem}</Combobox.Popup>
                        </Combobox.Root>
                    </Grid.Item>

                    <Grid.Item $css={openCell}>
                        <Combobox.Root
                            items={fonts}
                            placeholder="Placeholder"
                            aria-label="Open selected font"
                            defaultValue="Monospace"
                            defaultOpen
                        >
                            <Combobox.InputGroup />
                            <Combobox.Popup>{renderItem}</Combobox.Popup>
                        </Combobox.Root>
                    </Grid.Item>

                    <Grid.Item $css={openCell}>
                        <Combobox.Root
                            items={fonts}
                            placeholder="Placeholder"
                            aria-label="Open empty font"
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

                    <Grid.Item $css={openCell}>
                        <Combobox.Root
                            items={[
                                { value: 'Font', items: fonts },
                                { value: 'Language', items: languages },
                            ]}
                            placeholder="Grouped"
                            aria-label="Open grouped"
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

                    <Grid.Item $css={openCell}>
                        <Combobox.Root
                            placeholder="Separator"
                            aria-label="Open separator"
                            defaultOpen
                        >
                            <Combobox.InputGroup />
                            <Combobox.Popup>
                                <Combobox.Group>
                                    <Combobox.GroupLabel>Font</Combobox.GroupLabel>
                                    {fonts.map(renderItem)}
                                </Combobox.Group>
                                <Combobox.Separator />
                                <Combobox.Group>
                                    <Combobox.GroupLabel>Language</Combobox.GroupLabel>
                                    {languages.slice(0, 2).map(renderItem)}
                                </Combobox.Group>
                            </Combobox.Popup>
                        </Combobox.Root>
                    </Grid.Item>

                    <Grid.Item $css={openCell}>
                        <Combobox.Root
                            placeholder="Disabled item"
                            aria-label="Open disabled item"
                            defaultOpen
                        >
                            <Combobox.InputGroup />
                            <Combobox.Popup>
                                <Combobox.Item value="Sans-serif">Sans-serif</Combobox.Item>
                                <Combobox.Item value="Serif" disabled>
                                    Serif
                                </Combobox.Item>
                                <Combobox.Item value="Monospace">Monospace</Combobox.Item>
                            </Combobox.Popup>
                        </Combobox.Root>
                    </Grid.Item>

                    <Grid.Item $css={openCell}>
                        <Combobox.Root
                            placeholder="Leading icon"
                            aria-label="Open leading icon"
                            defaultOpen
                        >
                            <Combobox.InputGroup />
                            <Combobox.Popup>
                                {fonts.map((font) => (
                                    <Combobox.Item key={font} value={font}>
                                        <HomeOutlineIcon width="16" height="16" />
                                        {font}
                                    </Combobox.Item>
                                ))}
                            </Combobox.Popup>
                        </Combobox.Root>
                    </Grid.Item>
                </Grid.Root>
            </Box>
        );
    },
};
