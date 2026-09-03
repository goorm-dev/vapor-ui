import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Text, VStack } from '@vapor-ui/core';
import { ChevronDoubleRightOutlineIcon, PlusOutlineIcon } from '@vapor-ui/icons';

import { Menu } from '.';

export default {
    title: 'Composites/Menu',
    component: Menu.Root,
} satisfies Meta<typeof Menu.Root>;

type Story = StoryObj<typeof Menu.Root>;

export const Default: Story = {
    render: (args) => {
        return (
            <Menu.Root trigger={<Button>Menu Trigger</Button>} open {...args}>
                <Menu.Group label="label">
                    <Menu.Item label="item 1" />
                    <Menu.Item label="item 2" leading={<PlusOutlineIcon />} />
                    <Menu.Item
                        label="item 3"
                        leading={<PlusOutlineIcon />}
                        trailing={<ChevronDoubleRightOutlineIcon />}
                    />
                    <Menu.Item label="item 4" trailing={<ChevronDoubleRightOutlineIcon />} />
                </Menu.Group>

                <Menu.CheckGroup mode="single" label="single group">
                    <Menu.CheckItem label="single 1" value="single 1" />
                    <Menu.CheckItem label="single 2" value="single 2" />
                    <Menu.CheckItem label="single 3" value="single 3" />
                    <Menu.CheckItem label="single 4" value="single 4" />
                </Menu.CheckGroup>

                <Menu.CheckGroup mode="multiple" label="multiple group">
                    <Menu.CheckItem label="multiple 1" value="multiple 1" />
                    <Menu.CheckItem label="multiple 2" value="multiple 2" />
                    <Menu.CheckItem label="multiple 3" value="multiple 3" />
                    <Menu.CheckItem label="multiple 4" value="multiple 4" />
                </Menu.CheckGroup>
            </Menu.Root>
        );
    },
};

export const Controlled: Story = {
    render: (args) => {
        const [singleValue, setSingleValue] = useState<string>();
        const [multipleValue, setMultipleValue] = useState<string[]>();

        return (
            <VStack $css={{ alignItems: 'flex-start' }}>
                <Text>1. Selected Single Value: {singleValue ?? <span>Not Selected</span>}</Text>
                <Text>
                    2. Selected Multiple Value:{' '}
                    {multipleValue ? multipleValue.join(', ') : <span>Not Selected</span>}
                </Text>

                <Menu.Root
                    trigger={
                        <Button
                            $css={{ marginTop: '$100' }}
                            colorPalette="secondary"
                            variant="outline"
                        >
                            Open Menu
                        </Button>
                    }
                    {...args}
                >
                    <Menu.CheckGroup
                        mode="single"
                        label="single group"
                        value={singleValue}
                        onValueChange={setSingleValue}
                    >
                        <Menu.CheckItem label="Single 1" value="single 1" />
                        <Menu.CheckItem label="Single 2" value="single 2" />
                        <Menu.CheckItem label="Single 3" value="single 3" />
                        <Menu.CheckItem label="Single 4" value="single 4" />
                    </Menu.CheckGroup>

                    <Menu.CheckGroup
                        mode="multiple"
                        label="multiple group"
                        value={multipleValue}
                        onValueChange={setMultipleValue}
                    >
                        <Menu.CheckItem label="Multiple 1" value="multiple 1" />
                        <Menu.CheckItem label="Multiple 2" value="multiple 2" />
                        <Menu.CheckItem label="Multiple 3" value="multiple 3" />
                        <Menu.CheckItem label="Multiple 4" value="multiple 4" />
                    </Menu.CheckGroup>
                </Menu.Root>
            </VStack>
        );
    },
};
