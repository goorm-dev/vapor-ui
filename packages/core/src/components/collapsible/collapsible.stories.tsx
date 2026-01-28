import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDownOutlineIcon, SourcecodeIcon } from '@vapor-ui/icons';

import { Collapsible } from '.';
import { Box } from '../box';
import { Button } from '../button';
import { Flex } from '../flex';
import { Grid } from '../grid';
import { HStack } from '../h-stack';
import { IconButton } from '../icon-button';
import { VStack } from '../v-stack';

export default {
    title: 'Collapsible',
    component: Collapsible.Root,
} satisfies Meta<typeof Collapsible.Root>;

export const Default: StoryObj<typeof Collapsible.Root> = {
    render: (args) => (
        <Collapsible.Root {...args}>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Panel keepMounted>Panel</Collapsible.Panel>
        </Collapsible.Root>
    ),
};

export const TestBed: StoryObj<typeof Collapsible.Root> = {
    render: (args) => {
        const [open1, setOpen1] = useState(true);
        const [open2, setOpen2] = useState(true);
        const [open3, setOpen3] = useState(true);

        return (
            <Grid.Root
                $styles={{ height: '100px' }}
                templateRows="1fr 1fr"
                templateColumns="repeat(3, 14rem)"
            >
                <Grid.Item
                    $styles={{ padding: '$200' }}
                    style={{
                        borderBottom: '1px solid',
                        borderRight: '1px solid',
                        borderColor: '#e1e1e1',
                    }}
                >
                    <Collapsible.Root open={open1} onOpenChange={setOpen1} {...args}>
                        <HStack $styles={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Collapsible.Trigger render={<Button />}>
                                <ChevronDownOutlineIcon
                                    style={{
                                        transform: open1 ? 'rotate(0deg)' : 'rotate(-90deg)',
                                        transition: 'transform 200ms ease-in-out',
                                    }}
                                />
                                Toggle
                            </Collapsible.Trigger>
                        </HStack>

                        <Collapsible.Panel>
                            <Flex
                                $styles={{
                                    marginTop: '$100',
                                    border: '1px solid #e1e1e1',
                                    borderRadius: '$300',
                                    paddingInline: '$200',
                                    paddingBlock: '$100',
                                }}
                            >
                                Panel
                            </Flex>
                        </Collapsible.Panel>
                    </Collapsible.Root>
                </Grid.Item>

                <Grid.Item
                    $styles={{ padding: '$200' }}
                    style={{
                        borderBottom: '1px solid',
                        borderRight: '1px solid',
                        borderColor: '#e1e1e1',
                    }}
                >
                    <Collapsible.Root
                        render={<VStack />}
                        open={open2}
                        onOpenChange={setOpen2}
                        {...args}
                    >
                        <Collapsible.Trigger
                            render={
                                <Button
                                    variant="fill"
                                    colorPalette="secondary"
                                    style={{ textAlign: 'start' }}
                                >
                                    Toggle
                                    <SourcecodeIcon style={{ transform: 'rotate(90deg)' }} />
                                </Button>
                            }
                        />

                        <Collapsible.Panel>
                            <Flex
                                $styles={{
                                    marginTop: '$100',
                                    borderRadius: '$300',
                                    paddingInline: '$200',
                                    paddingBlock: '$100',
                                    backgroundColor: '$secondary',
                                }}
                            >
                                Panel
                            </Flex>
                        </Collapsible.Panel>
                    </Collapsible.Root>
                </Grid.Item>

                <Grid.Item
                    $styles={{ padding: '$200' }}
                    style={{
                        borderBottom: '1px solid',
                        borderColor: '#e1e1e1',
                    }}
                >
                    <Collapsible.Root
                        open={open3}
                        onOpenChange={setOpen3}
                        render={
                            <VStack
                                $styles={{
                                    borderRadius: '$300',
                                    justifyContent: 'start',
                                    border: '1px solid #e1e1e1',
                                    paddingBlock: '$150',
                                    paddingInline: '$200',
                                    height: 'fit-content',
                                }}
                            />
                        }
                        {...args}
                    >
                        <HStack
                            $styles={{
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            Toggle
                            <Collapsible.Trigger
                                render={
                                    <IconButton
                                        aria-label="toggle collapsible"
                                        variant="outline"
                                        colorPalette="secondary"
                                    >
                                        <ChevronDownOutlineIcon />
                                    </IconButton>
                                }
                            />
                        </HStack>

                        <Collapsible.Panel>
                            <Box>Panel</Box>
                        </Collapsible.Panel>
                    </Collapsible.Root>
                </Grid.Item>

                <Grid.Item
                    $styles={{ padding: '$200' }}
                    style={{
                        borderRight: '1px solid',
                        borderColor: '#e1e1e1',
                    }}
                >
                    <Collapsible.Root {...args}>
                        <Collapsible.Trigger disabled render={<Button />}>
                            Disabled Toggle
                        </Collapsible.Trigger>

                        <Collapsible.Panel>
                            <Box>Panel</Box>
                        </Collapsible.Panel>
                    </Collapsible.Root>
                </Grid.Item>
            </Grid.Root>
        );
    },
};
