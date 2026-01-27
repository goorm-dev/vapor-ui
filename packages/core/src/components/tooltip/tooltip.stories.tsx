import React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tooltip } from '.';
import { Button } from '../button';
import { HStack } from '../h-stack';
import { Text } from '../text';
import { VStack } from '../v-stack';

type TooltipRootProps = React.ComponentProps<typeof Tooltip.Root>;
type TooltipPositionerProps = React.ComponentProps<typeof Tooltip.PositionerPrimitive>;
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
                    <Tooltip.Root {...args}>
                        <Tooltip.Trigger
                            delay={0}
                            render={<Button style={{ flexShrink: 0 }}>Left Tooltip</Button>}
                        />
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive
                                    side={side}
                                    align={align}
                                    sideOffset={sideOffset}
                                    alignOffset={alignOffset}
                                />
                            }
                        >
                            Tooltip content
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>

                <HStack gap="20px" margin="100px" justifyContent="center" alignItems="center">
                    <Tooltip.Root>
                        <Tooltip.Trigger
                            delay={0}
                            render={<Button style={{ flexShrink: 0 }}>Left Tooltip</Button>}
                        />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive side="left" />}
                        >
                            Tooltip content
                        </Tooltip.Popup>
                    </Tooltip.Root>
                    <Tooltip.Root>
                        <Tooltip.Trigger
                            delay={0}
                            render={<Button style={{ flexShrink: 0 }}>Top Tooltip</Button>}
                        />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive side="top" />}
                        >
                            Tooltip content
                        </Tooltip.Popup>
                    </Tooltip.Root>
                    <Tooltip.Root>
                        <Tooltip.Trigger
                            delay={0}
                            render={<Button style={{ flexShrink: 0 }}>Bottom Tooltip</Button>}
                        />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive side="bottom" />}
                        >
                            Tooltip content
                        </Tooltip.Popup>
                    </Tooltip.Root>
                    <Tooltip.Root>
                        <Tooltip.Trigger
                            delay={0}
                            render={<Button style={{ flexShrink: 0 }}>Right Tooltip</Button>}
                        />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive side="right" />}
                        >
                            Tooltip content
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>

                <VStack gap="20px" margin="100px" justifyContent="center" alignItems="center">
                    <Text>Wait for 0.5s </Text>

                    <Tooltip.Root>
                        <Tooltip.Trigger delay={500} render={<Button>Delayed Tooltip</Button>} />
                        <Tooltip.Popup>Tooltip content</Tooltip.Popup>
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
                        <Tooltip.Root open>
                            <Tooltip.Trigger delay={0} render={<Button>Left Tooltip</Button>} />
                            <Tooltip.Popup
                                positionerElement={<Tooltip.PositionerPrimitive side="left" />}
                            >
                                Tooltip content
                            </Tooltip.Popup>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger delay={0} render={<Button>Top Tooltip</Button>} />
                            <Tooltip.Popup
                                positionerElement={<Tooltip.PositionerPrimitive side="top" />}
                            >
                                Tooltip content
                            </Tooltip.Popup>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger delay={0} render={<Button>Bottom Tooltip</Button>} />
                            <Tooltip.Popup
                                positionerElement={<Tooltip.PositionerPrimitive side="bottom" />}
                            >
                                Tooltip content
                            </Tooltip.Popup>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger delay={0} render={<Button>Right Tooltip</Button>} />
                            <Tooltip.Popup
                                positionerElement={<Tooltip.PositionerPrimitive side="right" />}
                            >
                                Tooltip content
                            </Tooltip.Popup>
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
                        <Tooltip.Root open>
                            <Tooltip.Trigger delay={0} render={<Button>Align Start Tooltip</Button>} />
                            <Tooltip.Popup
                                positionerElement={<Tooltip.PositionerPrimitive align="start" />}
                            >
                                Tooltip content
                            </Tooltip.Popup>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger delay={0} render={<Button>Align Center Tooltip</Button>} />
                            <Tooltip.Popup
                                positionerElement={<Tooltip.PositionerPrimitive align="center" />}
                            >
                                Tooltip content
                            </Tooltip.Popup>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger delay={0} render={<Button>Align End Tooltip</Button>} />
                            <Tooltip.Popup
                                positionerElement={<Tooltip.PositionerPrimitive align="end" />}
                            >
                                Tooltip content
                            </Tooltip.Popup>
                        </Tooltip.Root>
                    </HStack>
                </VStack>

                <HStack margin="$800" padding="$200" border="1px solid black">
                    <Tooltip.Root open>
                        <Tooltip.Trigger delay={0} render={<Button>Left Collision</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive side="left" />}
                        >
                            Should flip to right when hitting container boundary
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
            </>
        );
    },
};
