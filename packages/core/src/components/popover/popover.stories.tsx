import type { Meta, StoryObj } from '@storybook/react';

import { Popover } from '.';
import { Button } from '../button';
import { Flex } from '../flex';
import { HStack } from '../h-stack';

export default {
    title: 'Popover',
    component: Popover.Root,
    argTypes: {
        side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
        sideOffset: { control: 'number' },
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
        alignOffset: { control: 'number' },
    },
} satisfies Meta<typeof Popover.Root>;

export const Default: StoryObj<typeof Popover.Root> = {
    render: (args) => (
        <Flex gap="$400" marginTop="200px" justifyContent="center" alignItems="center">
            <Popover.Root {...args} open>
                <Popover.Trigger render={<Button>Open Popover</Button>} />
                <Popover.Portal>
                    <Popover.Positioner>
                        <Popover.Content>
                            <Popover.Title>Notifications</Popover.Title>
                            <Popover.Description>
                                You have 3 new messages and 1 new notification.
                            </Popover.Description>
                        </Popover.Content>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </Flex>
    ),
};

export const TestBed: StoryObj<typeof Popover.Root> = {
    render: (args) => (
        <>
            <HStack
                padding="100px"
                gap="$400"
                justifyContent="center"
                alignItems="center"
                border="1px solid"
            >
                <Popover.Root {...args} open side="left">
                    <Popover.Trigger render={<Button>Left Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Content>
                                <Popover.Title>Left Popover</Popover.Title>
                                <Popover.Description>
                                    This is a left popover content.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open side="top">
                    <Popover.Trigger render={<Button>Top Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Content>
                                <Popover.Title>Top Popover</Popover.Title>
                                <Popover.Description>
                                    This is a top popover content.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open side="bottom">
                    <Popover.Trigger render={<Button>Bottom Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Content>
                                <Popover.Title>Bottom Popover</Popover.Title>
                                <Popover.Description>
                                    This is a bottom popover content.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open side="right">
                    <Popover.Trigger render={<Button>Right Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Content>
                                <Popover.Title>Right Popover</Popover.Title>
                                <Popover.Description>
                                    This is a right popover content.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            </HStack>

            <HStack
                padding="$800"
                gap="$900"
                justifyContent="center"
                alignItems="center"
                border="1px solid"
            >
                <Popover.Root {...args} open align="end">
                    <Popover.Trigger render={<Button>End Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Content>
                                <Popover.Title>End Popover</Popover.Title>
                                <Popover.Description>
                                    This is a end popover content.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open align="center">
                    <Popover.Trigger render={<Button>Center Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Content>
                                <Popover.Title>Center Popover</Popover.Title>
                                <Popover.Description>
                                    This is a center popover content.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open align="start">
                    <Popover.Trigger render={<Button>Start Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Content>
                                <Popover.Title>Start Popover</Popover.Title>
                                <Popover.Description>
                                    This is a start popover content.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            </HStack>

            <HStack padding="$800" border="1px solid" justifyContent={'space-between'}>
                <Popover.Root {...args} open side="left">
                    <Popover.Trigger render={<Button>Fliped Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Content>
                                <Popover.Title>Fliped Popover</Popover.Title>
                                <Popover.Description>
                                    This is a left popover content. But it is flipped to the right
                                    side.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open side="right">
                    <Popover.Trigger render={<Button>Shift Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner collisionAvoidance={{ side: 'shift' }}>
                            <Popover.Content>
                                <Popover.Title>Shift Popover</Popover.Title>
                                <Popover.Description>
                                    This is a left popover content. it is shifted inside.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            </HStack>

            <HStack padding="$200" border="1px solid" justifyContent={'space-between'}>
                <Popover.Root {...args} open side="bottom" align="end" alignOffset={100}>
                    <Popover.Trigger render={<Button>Fliped Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner collisionAvoidance={{ align: 'flip' }}>
                            <Popover.Content>
                                <Popover.Title>Fliped Popover</Popover.Title>
                                <Popover.Description>
                                    This is a end popover content. But it is flipped to the start
                                    alignment.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>

                <Popover.Root {...args} open side="bottom" align="start">
                    <Popover.Trigger render={<Button>Shift Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner collisionAvoidance={{ align: 'shift' }}>
                            <Popover.Content>
                                <Popover.Title>Shift Popover</Popover.Title>
                                <Popover.Description>
                                    This is a start popover content. But it is shifted inside.
                                </Popover.Description>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            </HStack>
        </>
    ),
};
