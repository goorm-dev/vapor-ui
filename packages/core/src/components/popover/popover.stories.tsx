import type { Meta, StoryObj } from '@storybook/react';

import { Popover } from '.';
import { Button } from '../button';
import { Flex } from '../flex';
import { HStack } from '../h-stack';

export default {
    title: 'Popover',
    component: Popover.Root,
    argTypes: {},
} satisfies Meta;

export const Default: StoryObj<Popover.Root.Props & Popover.Positioner.Props> = {
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

export const Customable: StoryObj<Popover.Root.Props & Popover.Positioner.Props> = {
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

                <Popover.Content positionerProps={{ side, align, sideOffset }}>
                    <Popover.Title>Notifications</Popover.Title>
                    <Popover.Description>
                        You have 3 new messages and 1 new notification.
                    </Popover.Description>
                </Popover.Content>
            </Popover.Root>
        </Flex>
    ),
};

export const TestBed: StoryObj<Popover.Root.Props & Popover.Positioner.Props> = {
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

                    <Popover.Content positionerProps={{ side: 'left' }}>
                        <Popover.Title>Left Popover</Popover.Title>
                        <Popover.Description>This is a left popover content.</Popover.Description>
                    </Popover.Content>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Top Popover</Button>} />

                    <Popover.Content positionerProps={{ side: 'top' }}>
                        <Popover.Title>Top Popover</Popover.Title>
                        <Popover.Description>This is a top popover content.</Popover.Description>
                    </Popover.Content>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Bottom Popover</Button>} />

                    <Popover.Content positionerProps={{ side: 'bottom' }}>
                        <Popover.Title>Bottom Popover</Popover.Title>
                        <Popover.Description>This is a bottom popover content.</Popover.Description>
                    </Popover.Content>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Right Popover</Button>} />

                    <Popover.Content positionerProps={{ side: 'right' }}>
                        <Popover.Title>Right Popover</Popover.Title>
                        <Popover.Description>This is a right popover content.</Popover.Description>
                    </Popover.Content>
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

                    <Popover.Content positionerProps={{ align: 'end' }}>
                        <Popover.Title>End Popover</Popover.Title>
                        <Popover.Description>This is a end popover content.</Popover.Description>
                    </Popover.Content>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Center Popover</Button>} />

                    <Popover.Content positionerProps={{ align: 'center' }}>
                        <Popover.Title>Center Popover</Popover.Title>
                        <Popover.Description>This is a center popover content.</Popover.Description>
                    </Popover.Content>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Start Popover</Button>} />

                    <Popover.Content positionerProps={{ align: 'start' }}>
                        <Popover.Title>Start Popover</Popover.Title>
                        <Popover.Description>This is a start popover content.</Popover.Description>
                    </Popover.Content>
                </Popover.Root>
            </HStack>

            <HStack padding="$800" border="1px solid" justifyContent={'space-between'}>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Fliped Popover</Button>} />

                    <Popover.Content positionerProps={{ side: 'left' }}>
                        <Popover.Title>Fliped Popover</Popover.Title>
                        <Popover.Description>
                            This is a left popover content. But it is flipped to the right side.
                        </Popover.Description>
                    </Popover.Content>
                </Popover.Root>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Shift Popover</Button>} />

                    <Popover.Content
                        positionerProps={{ side: 'right', collisionAvoidance: { side: 'shift' } }}
                    >
                        <Popover.Title>Shift Popover</Popover.Title>
                        <Popover.Description>
                            This is a left popover content. it is shifted inside.
                        </Popover.Description>
                    </Popover.Content>
                </Popover.Root>
            </HStack>

            <HStack padding="$200" border="1px solid" justifyContent={'space-between'}>
                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Fliped Popover</Button>} />

                    <Popover.Content
                        positionerProps={{
                            side: 'bottom',
                            align: 'end',
                            alignOffset: 100,
                            collisionAvoidance: { align: 'flip' },
                        }}
                    >
                        <Popover.Title>Fliped Popover</Popover.Title>
                        <Popover.Description>
                            This is a end popover content. But it is flipped to the start alignment.
                        </Popover.Description>
                    </Popover.Content>
                </Popover.Root>

                <Popover.Root {...args} open>
                    <Popover.Trigger render={<Button>Shift Popover</Button>} />
                    <Popover.Content
                        positionerProps={{
                            side: 'bottom',
                            align: 'start',
                            collisionAvoidance: { align: 'shift' },
                        }}
                    >
                        <Popover.Title>Shift Popover</Popover.Title>
                        <Popover.Description>
                            This is a start popover content. But it is shifted inside.
                        </Popover.Description>
                    </Popover.Content>
                </Popover.Root>
            </HStack>
        </>
    ),
};
