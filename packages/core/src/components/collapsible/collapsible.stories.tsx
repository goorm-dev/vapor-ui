import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDownOutlineIcon, SourcecodeIcon } from '@vapor-ui/icons';

import { Box } from '../box';
import { Button } from '../button';
import { Flex } from '../flex';
import { Grid } from '../grid';
import { HStack } from '../h-stack';
import { IconButton } from '../icon-button';
import { VStack } from '../v-stack';
import { Collapsible } from './collapsible';

export default {
    title: 'Collapsible',
    component: Collapsible.Root,
} satisfies Meta<typeof Collapsible.Root>;

export const Default: StoryObj<typeof Collapsible.Root> = {
    render: (args) => (
        <Collapsible.Root {...args}>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Content>Content</Collapsible.Content>
        </Collapsible.Root>
    ),
};

export const TestBed: StoryObj<typeof Collapsible.Root> = {
    render: (args) => {
        const [open1, setOpen1] = useState(true);
        const [open2, setOpen2] = useState(true);
        const [open3, setOpen3] = useState(true);

        return (
            <Grid.Root height="100px" templateColumns="repeat(3, 14rem)" gap="$100">
                <Grid.Item>
                    <Collapsible.Root open={open1} onOpenChange={setOpen1} {...args}>
                        <HStack justifyContent={'space-between'} alignItems={'center'}>
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

                        <Collapsible.Content>
                            <Flex
                                marginTop={'$100'}
                                border="1px solid #e1e1e1"
                                borderRadius={'$300'}
                                paddingX="$200"
                                paddingY="$100"
                            >
                                Content
                            </Flex>
                        </Collapsible.Content>
                    </Collapsible.Root>
                </Grid.Item>

                <Grid.Item>
                    <Collapsible.Root
                        render={<VStack width="14rem" />}
                        open={open2}
                        onOpenChange={setOpen2}
                        {...args}
                    >
                        <Collapsible.Trigger
                            render={
                                <Button
                                    variant="fill"
                                    color="secondary"
                                    style={{ textAlign: 'start' }}
                                >
                                    Toggle
                                    <SourcecodeIcon style={{ transform: 'rotate(90deg)' }} />
                                </Button>
                            }
                        />

                        <Collapsible.Content>
                            <Flex
                                marginTop={'$100'}
                                borderRadius={'$300'}
                                paddingX="$200"
                                paddingY="$100"
                                backgroundColor={'$secondary'}
                            >
                                Content
                            </Flex>
                        </Collapsible.Content>
                    </Collapsible.Root>
                </Grid.Item>

                <Grid.Item>
                    <Collapsible.Root
                        open={open3}
                        onOpenChange={setOpen3}
                        render={
                            <VStack
                                borderRadius="$300"
                                justifyContent="start"
                                border="1px solid #e1e1e1"
                                paddingY="$150"
                                paddingX="$200"
                                height="fit-content"
                            />
                        }
                        {...args}
                    >
                        <HStack justifyContent={'space-between'} alignItems={'center'}>
                            Toggle
                            <Collapsible.Trigger
                                render={
                                    <IconButton
                                        aria-label="toggle collapsible"
                                        variant="outline"
                                        color="secondary"
                                    >
                                        <ChevronDownOutlineIcon />
                                    </IconButton>
                                }
                            />
                        </HStack>

                        <Collapsible.Content>
                            <Box>Content</Box>
                        </Collapsible.Content>
                    </Collapsible.Root>
                </Grid.Item>
            </Grid.Root>
        );
    },
};
