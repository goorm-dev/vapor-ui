import type { Meta, StoryObj } from '@storybook/react';

import type { PopoverPositionerProps, PopoverRootProps } from '.';
import { Popover } from '.';
import { Button } from '../button';
import { Flex } from '../flex';
import { HStack } from '../h-stack';

export default {
    title: 'Popover',
    component: Popover.Root,
    argTypes: {},
} satisfies Meta;

export const Default: StoryObj<PopoverRootProps & PopoverPositionerProps> = {
    render: (args) => (
        <Flex gap="$400" marginTop="200px" justifyContent="center" alignItems="center">
            <Popover.Root {...args}>
                <Popover.Trigger render={<Button>Open Popover</Button>} />

                <Popover.Content>
                    <Popover.Title>Notifications</Popover.Title>
                    <Popover.Description>
                        You have 3 new messages and 1 new notification.
                    </Popover.Description>
                </Popover.Content>
            </Popover.Root>
        </Flex>
    ),
};

export const Customable: StoryObj<PopoverRootProps & PopoverPositionerProps> = {
    argTypes: {
        side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
        sideOffset: { control: 'number' },
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
        alignOffset: { control: 'number' },
    },
    render: ({ side, align, sideOffset = 8, ...args }) => (
        <Flex gap="$400" marginTop="200px" justifyContent="center" alignItems="center">
            <Popover.Root {...args}>
                <Popover.Trigger render={<Button>Open Popover</Button>} />

                <Popover.Portal>
                    <Popover.Positioner side={side} align={align} sideOffset={sideOffset}>
                        <Popover.Popup>
                            <Popover.Title>Notifications</Popover.Title>
                            <Popover.Description>
                                You have 3 new messages and 1 new notification.
                            </Popover.Description>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </Flex>
    ),
};

export const TestBed: StoryObj<PopoverRootProps & PopoverPositionerProps> = {
    render: (args) => (
        <>
            <HStack
                padding="100px"
                gap="$400"
                justifyContent="center"
                alignItems="center"
                border="1px solid"
            >
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Left Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner side="left">
                            <Popover.Popup>
                                <Popover.Title>Left Popover</Popover.Title>
                                <Popover.Description>
                                    This is a left popover content.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Top Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner side="top">
                            <Popover.Popup>
                                <Popover.Title>Top Popover</Popover.Title>
                                <Popover.Description>
                                    This is a top popover content.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Bottom Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner side="bottom">
                            <Popover.Popup>
                                <Popover.Title>Bottom Popover</Popover.Title>
                                <Popover.Description>
                                    This is a bottom popover content.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Right Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner side="right">
                            <Popover.Popup>
                                <Popover.Title>Right Popover</Popover.Title>
                                <Popover.Description>
                                    This is a right popover content.
                                </Popover.Description>
                            </Popover.Popup>
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
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>End Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner align="end">
                            <Popover.Popup>
                                <Popover.Title>End Popover</Popover.Title>
                                <Popover.Description>
                                    This is a end popover content.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Center Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner align="center">
                            <Popover.Popup>
                                <Popover.Title>Center Popover</Popover.Title>
                                <Popover.Description>
                                    This is a center popover content.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Start Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner align="start">
                            <Popover.Popup>
                                <Popover.Title>Start Popover</Popover.Title>
                                <Popover.Description>
                                    This is a start popover content.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            </HStack>

            <HStack padding="$800" border="1px solid" justifyContent={'space-between'}>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Fliped Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner side="left">
                            <Popover.Popup>
                                <Popover.Title>Fliped Popover</Popover.Title>
                                <Popover.Description>
                                    This is a left popover content. But it is flipped to the right
                                    side.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Shift Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner side="right" collisionAvoidance={{ side: 'shift' }}>
                            <Popover.Popup>
                                <Popover.Title>Shift Popover</Popover.Title>
                                <Popover.Description>
                                    This is a left popover content. it is shifted inside.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            </HStack>

            <HStack padding="$200" border="1px solid" justifyContent={'space-between'}>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Fliped Popover</Button>} />

                    <Popover.Portal>
                        <Popover.Positioner
                            side="bottom"
                            align="end"
                            alignOffset={100}
                            collisionAvoidance={{ align: 'flip' }}
                        >
                            <Popover.Popup>
                                <Popover.Title>Fliped Popover</Popover.Title>
                                <Popover.Description>
                                    This is a end popover content. But it is flipped to the start
                                    alignment.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>

                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Shift Popover</Button>} />
                    <Popover.Portal>
                        <Popover.Positioner
                            side="bottom"
                            align="start"
                            collisionAvoidance={{ align: 'shift' }}
                        >
                            <Popover.Popup>
                                <Popover.Title>Shift Popover</Popover.Title>
                                <Popover.Description>
                                    This is a start popover content. But it is shifted inside.
                                </Popover.Description>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            </HStack>
        </>
    ),
};
