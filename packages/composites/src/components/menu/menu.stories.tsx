import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Button, Text, VStack } from '@vapor-ui/core';
import {
    ChevronDoubleRightOutlineIcon,
    HeartIcon,
    PlusOutlineIcon,
    TrashOutlineIcon,
} from '@vapor-ui/icons';

import { Regression } from '~/utils/regressions';

import { Menu } from '.';

export default {
    title: 'Composites/Menu',
    component: Menu.Root,
    argTypes: {
        open: { control: 'boolean' },
        modal: { control: 'boolean' },
        isDisabled: { control: 'boolean' },
        side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    },
} satisfies Meta<typeof Menu.Root>;

const Kbd = ({ children }: Box.Props) => {
    return (
        <Box $css={{ fontFamily: 'monospace', fontSize: '12px', color: '$fg-hint' }}>
            {children}
        </Box>
    );
};

type Story = StoryObj<typeof Menu.Root>;

export const Default: Story = {
    render: (args) => {
        const [single, setSingle] = useState<string>();
        const [multi, setMulti] = useState<string[]>();
        const [subMulti, setSubMulti] = useState<string[]>();

        return (
            <div style={{ width: '100%', textAlign: 'center' }}>
                <Menu.Root trigger={<Button>Menu Trigger</Button>} defaultOpen {...args}>
                    <Menu.Item
                        label="item 1"
                        trailing={<Kbd>⌘ K</Kbd>}
                        onClick={() => alert('clicked item 1')}
                    />
                    <Menu.Item
                        label="item 2"
                        trailing={<Kbd>⌥ ⌘ K</Kbd>}
                        onClick={() => alert('clicked item 2')}
                    />

                    <Menu.Root trigger={<Menu.SubmenuItem label="Submenu Item" />}>
                        <Menu.CheckGroup
                            mode="multiple"
                            label="multiple group"
                            value={subMulti}
                            onValueChange={setSubMulti}
                        >
                            <Menu.CheckItem label="multiple 1" value="multiple 1" />
                            <Menu.CheckItem label="multiple 2" value="multiple 2" />
                            <Menu.CheckItem label="multiple 3" value="multiple 3" />
                            <Menu.CheckItem label="multiple 4" value="multiple 4" />
                        </Menu.CheckGroup>
                    </Menu.Root>

                    <Menu.Group label="label">
                        <Menu.Item
                            leading={<HeartIcon />}
                            label="item 1"
                            onClick={() => alert('clicked item 1')}
                        />
                        <Menu.Item
                            leading={<HeartIcon />}
                            label="item 2"
                            onClick={() => alert('clicked item 2')}
                        />
                        <Menu.Item
                            leading={<HeartIcon />}
                            label="item 3"
                            trailing={<ChevronDoubleRightOutlineIcon />}
                            variant="critical"
                            onClick={() => alert('clicked item 3')}
                        />
                    </Menu.Group>

                    <Menu.CheckGroup
                        mode="single"
                        label="single group"
                        value={single}
                        onValueChange={setSingle}
                    >
                        <Menu.CheckItem label="single 1" value="single 1" />
                        <Menu.CheckItem label="single 2" value="single 2" />
                        <Menu.CheckItem label="single 3" value="single 3" />
                        <Menu.CheckItem label="single 4" value="single 4" />
                        <Menu.CheckItem label="single 5" value="single 5" leading={<HeartIcon />} />
                    </Menu.CheckGroup>

                    <Menu.CheckGroup
                        mode="multiple"
                        label="multiple group"
                        value={multi}
                        onValueChange={setMulti}
                    >
                        <Menu.CheckItem label="multiple 1" value="multiple 1" />
                        <Menu.CheckItem label="multiple 2" value="multiple 2" />
                        <Menu.CheckItem label="multiple 3" value="multiple 3" />
                        <Menu.CheckItem label="multiple 4" value="multiple 4" />
                    </Menu.CheckGroup>
                </Menu.Root>
            </div>
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

/* -----------------------------------------------------------------------------------------------
 * Test Bed
 * ---------------------------------------------------------------------------------------------- */

const checkGroupValues = ['옵션 1', '옵션 2', '옵션 3'] as const;

const TestBedRender = ({ open = true, ...props }: Menu.Root.Props) => {
    return (
        <Regression.Table
            conditions={[
                {
                    key: 'checkGroupMode',
                    label: 'checkGroup mode',
                    values: ['single', 'multiple'] as const,
                    format: (v) => `mode = ${v}`,
                },
                {
                    key: 'hasSelection',
                    label: 'selection',
                    values: [true, false],
                    format: (v) => `selection = ${v ? 'O' : 'X'}`,
                },
                {
                    key: 'isDisabled',
                    label: 'disabled',
                    values: [false, true],
                    format: (v) => `disabled = ${v ? 'O' : 'X'}`,
                },
            ]}
            render={(row, container) => (
                <Menu.Root
                    open={open}
                    onOpenChange={() => {}}
                    isDisabled={row.isDisabled}
                    container={container ?? undefined}
                    {...props}
                >
                    <Menu.Group label="액션">
                        <Menu.Item label="복사" onClick={() => {}} />
                        <Menu.Item
                            label="붙여넣기"
                            leading={<PlusOutlineIcon />}
                            onClick={() => {}}
                        />
                        <Menu.Item
                            label="링크 열기"
                            trailing={<ChevronDoubleRightOutlineIcon />}
                            onClick={() => {}}
                        />
                        <Menu.Item
                            label="삭제"
                            variant="critical"
                            leading={<TrashOutlineIcon />}
                            trailing={<ChevronDoubleRightOutlineIcon />}
                            onClick={() => {}}
                        />
                    </Menu.Group>

                    {row.checkGroupMode === 'single' ? (
                        <Menu.CheckGroup
                            mode="single"
                            label="옵션"
                            value={row.hasSelection ? checkGroupValues[0] : undefined}
                        >
                            {checkGroupValues.map((value) => (
                                <Menu.CheckItem key={value} label={value} value={value} />
                            ))}
                        </Menu.CheckGroup>
                    ) : (
                        <Menu.CheckGroup
                            mode="multiple"
                            label="옵션"
                            value={
                                row.hasSelection
                                    ? [checkGroupValues[0], checkGroupValues[1]]
                                    : undefined
                            }
                        >
                            {checkGroupValues.map((value) => (
                                <Menu.CheckItem key={value} label={value} value={value} />
                            ))}
                        </Menu.CheckGroup>
                    )}

                    <Menu.Root
                        trigger={<Menu.SubmenuItem label="중첩 메뉴" />}
                        open
                        onOpenChange={() => {}}
                    >
                        <Menu.CheckGroup mode="multiple" label="하위 옵션">
                            <Menu.CheckItem label="하위 1" value="하위 1" />
                            <Menu.CheckItem label="하위 2" value="하위 2" />
                        </Menu.CheckGroup>
                    </Menu.Root>
                </Menu.Root>
            )}
        />
    );
};

export const TestBed_Light: Story = {
    render: (args) => <TestBedRender {...args} />,
};

export const TestBed_Dark: Story = {
    globals: { appearance: 'dark' },
    render: (args) => <TestBedRender {...args} />,
};
