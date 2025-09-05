import type { ComponentProps } from 'react';

import type { StoryObj } from '@storybook/react';

import { HStack } from '../h-stack';
import { VStack } from '../v-stack';
import { NavigationMenu } from './navigation-menu';

type RootProps = ComponentProps<typeof NavigationMenu.Root>;
type PositionerProps = ComponentProps<typeof NavigationMenu.Positioner>;

type SideAlignProps = Pick<PositionerProps, 'side' | 'align'>;

type StoryProps = RootProps & SideAlignProps;

export default {
    title: 'NavigationMenu',
    component: NavigationMenu.Root,
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
        },
        side: {
            control: { type: 'inline-radio' },
            options: ['top', 'right', 'bottom', 'left'],
        },
        align: {
            control: { type: 'inline-radio' },
            options: ['start', 'center', 'end'],
        },
        direction: {
            control: { type: 'inline-radio' },
            options: ['horizontal', 'vertical'],
        },
        stretch: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
    },
};

export const Default: StoryObj<StoryProps> = {
    render: ({ side, align, disabled, ...args }) => {
        return (
            <>
                <NavigationMenu.Root {...args} aria-label="Main" value="1">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={disabled} selected href="#">
                                Link 1
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item value="1">
                            <NavigationMenu.Trigger>
                                Overview
                                <NavigationMenu.TriggerIndicator />
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Panel>
                                <NavigationMenu.List render={<VStack gap="0" />}>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={disabled} href="#">
                                            Sub Link 1
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={disabled} href="#">
                                            Sub Link 2
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={disabled} href="#">
                                            Sub Link 3
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={disabled} href="#">
                                            Sub Link 4
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                </NavigationMenu.List>
                            </NavigationMenu.Panel>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Trigger>
                                Trigger 2
                                <NavigationMenu.TriggerIndicator />
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Panel>
                                <NavigationMenu.List render={<VStack gap="0" />}>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={disabled} href="#">
                                            Sub Link 1
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={disabled} href="#">
                                            Sub Link 2
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={disabled} href="#">
                                            Sub Link 3
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={disabled} href="#">
                                            Sub Link 4
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                </NavigationMenu.List>
                            </NavigationMenu.Panel>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={disabled} href="#">
                                23411234
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.LinkItem disabled={disabled} href="#">
                            213412341234
                        </NavigationMenu.LinkItem>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={disabled} href="#">
                                asdf
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>

                    <NavigationMenu.Portal>
                        <NavigationMenu.Positioner side={side} align={align}>
                            <NavigationMenu.Popup>
                                <NavigationMenu.Viewport />
                            </NavigationMenu.Popup>
                        </NavigationMenu.Positioner>
                    </NavigationMenu.Portal>
                </NavigationMenu.Root>
            </>
        );
    },
};

export const TestBed: StoryObj<typeof NavigationMenu.Root> = {
    render: () => {
        return (
            <VStack
                padding="200px"
                gap="96px"
                justifyContent="center"
                alignItems="center"
                border="1px solid"
            >
                {/* Top Navigation Menu */}
                <NavigationMenu.Root aria-label="Main" value="1">
                    <NavigationMenu.List>
                        <NavigationMenu.Item value="1">
                            <NavigationMenu.Trigger>
                                Overview
                                <NavigationMenu.TriggerIndicator />
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Panel>
                                <NavigationMenu.List render={<VStack gap="0" />}>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            Sub Link 1
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            Sub Link 2
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                </NavigationMenu.List>
                            </NavigationMenu.Panel>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>

                    <NavigationMenu.Portal>
                        <NavigationMenu.Positioner side="top">
                            <NavigationMenu.Popup>
                                <NavigationMenu.Viewport />
                            </NavigationMenu.Popup>
                        </NavigationMenu.Positioner>
                    </NavigationMenu.Portal>
                </NavigationMenu.Root>

                <HStack gap="$250">
                    {/* Left Navigation Menu */}
                    <NavigationMenu.Root aria-label="Main" value="1">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="1">
                                <NavigationMenu.Trigger>
                                    Overview
                                    <NavigationMenu.TriggerIndicator />
                                </NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <NavigationMenu.List render={<VStack gap="0" />}>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 1
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 2
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                    </NavigationMenu.List>
                                </NavigationMenu.Panel>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>

                        <NavigationMenu.Portal>
                            <NavigationMenu.Positioner side="left">
                                <NavigationMenu.Popup>
                                    <NavigationMenu.Viewport />
                                </NavigationMenu.Popup>
                            </NavigationMenu.Positioner>
                        </NavigationMenu.Portal>
                    </NavigationMenu.Root>

                    {/* Bottom Navigation Menu */}
                    <NavigationMenu.Root aria-label="Main" value="1">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="1">
                                <NavigationMenu.Trigger>
                                    Overview
                                    <NavigationMenu.TriggerIndicator />
                                </NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <NavigationMenu.List render={<VStack gap="0" />}>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 1
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 2
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                    </NavigationMenu.List>
                                </NavigationMenu.Panel>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>

                        <NavigationMenu.Portal>
                            <NavigationMenu.Positioner side="bottom">
                                <NavigationMenu.Popup>
                                    <NavigationMenu.Viewport />
                                </NavigationMenu.Popup>
                            </NavigationMenu.Positioner>
                        </NavigationMenu.Portal>
                    </NavigationMenu.Root>

                    {/* Right Navigation Menu */}
                    <NavigationMenu.Root aria-label="Main" value="1">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="1">
                                <NavigationMenu.Trigger>
                                    Overview
                                    <NavigationMenu.TriggerIndicator />
                                </NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <NavigationMenu.List render={<VStack gap="0" />}>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 1
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 2
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                    </NavigationMenu.List>
                                </NavigationMenu.Panel>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>

                        <NavigationMenu.Portal>
                            <NavigationMenu.Positioner side="right">
                                <NavigationMenu.Popup>
                                    <NavigationMenu.Viewport />
                                </NavigationMenu.Popup>
                            </NavigationMenu.Positioner>
                        </NavigationMenu.Portal>
                    </NavigationMenu.Root>
                </HStack>

                <HStack gap="$250">
                    {/* Start Navigation Menu */}
                    <NavigationMenu.Root aria-label="Main" value="1">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="1">
                                <NavigationMenu.Trigger>
                                    Overview
                                    <NavigationMenu.TriggerIndicator />
                                </NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <NavigationMenu.List render={<VStack gap="0" />}>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 1
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 2
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                    </NavigationMenu.List>
                                </NavigationMenu.Panel>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>

                        <NavigationMenu.Portal>
                            <NavigationMenu.Positioner align="start">
                                <NavigationMenu.Popup>
                                    <NavigationMenu.Viewport />
                                </NavigationMenu.Popup>
                            </NavigationMenu.Positioner>
                        </NavigationMenu.Portal>
                    </NavigationMenu.Root>

                    {/* Center Navigation Menu */}
                    <NavigationMenu.Root aria-label="Main" value="1">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="1">
                                <NavigationMenu.Trigger>
                                    Overview
                                    <NavigationMenu.TriggerIndicator />
                                </NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <NavigationMenu.List render={<VStack gap="0" />}>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 1
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 2
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                    </NavigationMenu.List>
                                </NavigationMenu.Panel>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>

                        <NavigationMenu.Portal>
                            <NavigationMenu.Positioner align="center">
                                <NavigationMenu.Popup>
                                    <NavigationMenu.Viewport />
                                </NavigationMenu.Popup>
                            </NavigationMenu.Positioner>
                        </NavigationMenu.Portal>
                    </NavigationMenu.Root>

                    {/* End Navigation Menu */}
                    <NavigationMenu.Root aria-label="Main" value="1">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="1">
                                <NavigationMenu.Trigger>
                                    Overview
                                    <NavigationMenu.TriggerIndicator />
                                </NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <NavigationMenu.List render={<VStack gap="0" />}>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 1
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item>
                                            <NavigationMenu.Link href="#">
                                                Sub Link 2
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                    </NavigationMenu.List>
                                </NavigationMenu.Panel>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>

                        <NavigationMenu.Portal>
                            <NavigationMenu.Positioner align="end">
                                <NavigationMenu.Popup>
                                    <NavigationMenu.Viewport />
                                </NavigationMenu.Popup>
                            </NavigationMenu.Positioner>
                        </NavigationMenu.Portal>
                    </NavigationMenu.Root>
                </HStack>
            </VStack>
        );
    },
};
