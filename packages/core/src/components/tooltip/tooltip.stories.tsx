import type { Meta, StoryObj } from '@storybook/react-vite';

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
                        <Tooltip.Content positionerProps={{ side, align, sideOffset, alignOffset }}>
                            Tooltip content
                        </Tooltip.Content>
                    </Tooltip.Root>
                </HStack>

                <HStack gap="20px" margin="100px" justifyContent="center" alignItems="center">
                    <Tooltip.Root delay={0}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Left Tooltip</Button>}
                        />
                        <Tooltip.Content positionerProps={{ side: 'left' }}>
                            Tooltip content
                        </Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root delay={0}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Top Tooltip</Button>}
                        />
                        <Tooltip.Content positionerProps={{ side: 'top' }}>
                            Tooltip content
                        </Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root delay={0}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Bottom Tooltip</Button>}
                        />
                        <Tooltip.Content positionerProps={{ side: 'bottom' }}>
                            Tooltip content
                        </Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root delay={0}>
                        <Tooltip.Trigger
                            render={<Button style={{ flexShrink: 0 }}>Right Tooltip</Button>}
                        />
                        <Tooltip.Content positionerProps={{ side: 'right' }}>
                            Tooltip content
                        </Tooltip.Content>
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
                            <Tooltip.Content positionerProps={{ side: 'left' }}>
                                Tooltip content
                            </Tooltip.Content>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Top Tooltip</Button>} />
                            <Tooltip.Content positionerProps={{ side: 'top' }}>
                                Tooltip content
                            </Tooltip.Content>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Bottom Tooltip</Button>} />
                            <Tooltip.Content positionerProps={{ side: 'bottom' }}>
                                Tooltip content
                            </Tooltip.Content>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Right Tooltip</Button>} />
                            <Tooltip.Content positionerProps={{ side: 'right' }}>
                                Tooltip content
                            </Tooltip.Content>
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
                            <Tooltip.Content positionerProps={{ align: 'start' }}>
                                Tooltip content
                            </Tooltip.Content>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Align Center Tooltip</Button>} />
                            <Tooltip.Content positionerProps={{ align: 'center' }}>
                                Tooltip content
                            </Tooltip.Content>
                        </Tooltip.Root>
                        <Tooltip.Root delay={0} open>
                            <Tooltip.Trigger render={<Button>Align End Tooltip</Button>} />
                            <Tooltip.Content positionerProps={{ align: 'end' }}>
                                Tooltip content
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </HStack>
                </VStack>

                <HStack margin="$800" padding="$200" border="1px solid black">
                    <Tooltip.Root delay={0} open>
                        <Tooltip.Trigger render={<Button>Left Collision</Button>} />
                        <Tooltip.Content positionerProps={{ side: 'left' }}>
                            Should flip to right when hitting container boundary
                        </Tooltip.Content>
                    </Tooltip.Root>
                </HStack>
            </>
        );
    },
};
