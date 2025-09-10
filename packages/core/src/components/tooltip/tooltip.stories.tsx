import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from '.';
import { Button } from '../button';
import { HStack } from '../h-stack';
import { Text } from '../text';
import { VStack } from '../v-stack';

type TooltipRootProps = React.ComponentProps<typeof Tooltip.Root>;
type TooltipPositionerProps = React.ComponentProps<typeof Tooltip.Positioner>;
type PositionerProps = Pick<
    TooltipPositionerProps,
    'side' | 'align' | 'sideOffset' | 'alignOffset'
>;

export default {
    title: 'Tooltip',
    component: Tooltip.Root,
    argTypes: {
        open: { control: 'boolean' },
        side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
        sideOffset: { control: 'number' },
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
        alignOffset: { control: 'number' },
    },
} satisfies Meta<TooltipRootProps & PositionerProps>;

export const Default: StoryObj<TooltipRootProps & PositionerProps> = {
    render: ({ side, align, sideOffset, alignOffset, ...args }) => {
        return (
            <>
                <HStack gap="20px" margin="100px" justifyContent="center" alignItems="center">
                    <Tooltip.Root delay={0} {...args}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Left Tooltip</Button>}
                        />
                        <Tooltip.Portal>
                            <Tooltip.Positioner
                                side={side}
                                align={align}
                                sideOffset={sideOffset}
                                alignOffset={alignOffset}
                            >
                                <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </HStack>

                <HStack gap="20px" margin="100px" justifyContent="center" alignItems="center">
                    <Tooltip.Root delay={0}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Left Tooltip</Button>}
                        />
                        <Tooltip.Portal>
                            <Tooltip.Positioner side="left">
                                <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root delay={0}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Top Tooltip</Button>}
                        />
                        <Tooltip.Portal>
                            <Tooltip.Positioner side="top">
                                <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root delay={0}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Bottom Tooltip</Button>}
                        />
                        <Tooltip.Portal>
                            <Tooltip.Positioner side="bottom">
                                <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root delay={0}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Right Tooltip</Button>}
                        />
                        <Tooltip.Portal>
                            <Tooltip.Positioner align="start" side="right">
                                <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </HStack>

                <VStack gap="20px" margin="100px" justifyContent="center" alignItems="center">
                    <Text>Wait for 0.5s </Text>

                    <Tooltip.Root delay={500}>
                        <Tooltip.Trigger render={<Button>Delayed Tooltip</Button>} />
                        <Tooltip.Content>Tooltip content</Tooltip.Content>
                    </Tooltip.Root>
                </VStack>
            </>
        );
    },
};

export const TestBed: StoryObj = {
    argTypes: {
        side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
        sideOffset: { control: 'number' },
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
        alignOffset: { control: 'number' },
    },
    render: () => {
        return (
            <>
                <VStack
                    margin="$800"
                    gap="$400"
                    justifyContent="center"
                    alignItems="center"
                    border="1px solid"
                >
                    <HStack margin="$800" gap="$400" justifyContent="center" alignItems="center">
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Left Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner side="left">
                                    <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Top Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner side="top">
                                    <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Bottom Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner side="bottom">
                                    <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Right Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner side="right">
                                    <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </HStack>
                </VStack>

                <VStack
                    margin="$800"
                    gap="$400"
                    justifyContent="center"
                    alignItems="center"
                    border="1px solid"
                >
                    <HStack margin="$800" gap="$400" justifyContent="center" alignItems="center">
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Align Start Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner align="start">
                                    <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Align Center Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner align="center">
                                    <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Align End Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner align="end">
                                    <Tooltip.Popup>Tooltip content</Tooltip.Popup>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </HStack>
                </VStack>

                <HStack margin="$800" padding="$200" border="1px solid black">
                    <Tooltip.Root delay={0} open>
                        <Tooltip.Trigger render={<Button>Left Collision</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Positioner side="left">
                                <Tooltip.Popup>
                                    Should flip to right when hitting container boundary
                                </Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </HStack>
            </>
        );
    },
};
