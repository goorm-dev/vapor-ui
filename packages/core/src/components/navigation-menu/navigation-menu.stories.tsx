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
        orientation: {
            control: { type: 'inline-radio' },
            options: ['horizontal', 'vertical'],
        },
        stretch: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
    },
};

export const Default: StoryObj<StoryProps> = {
    render: ({ side, align, ...args }) => {
        return (
            <HStack justifyContent={'start'} margin="-$200">
                <NavigationMenu.Root {...args} defaultValue={'1'} aria-label="Main">
                    <NavigationMenu.List>
                        <NavigationMenu.Item value="1">
                            <NavigationMenu.Trigger>
                                Overview
                                <NavigationMenu.TriggerIndicator />
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Panel>
                                <VStack render={<ul style={{ listStyle: 'none' }} />}>
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
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            Sub Link 3
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            Sub Link 4
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                </VStack>
                            </NavigationMenu.Panel>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Trigger>
                                Trigger 2
                                <NavigationMenu.TriggerIndicator />
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Panel>
                                <VStack render={<ul style={{ listStyle: 'none' }} />} gap="0">
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            TESTETSTSETSET 1
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            TESTETSTSETSET 2
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            TESTETSTSETSET 3
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            TESTETSTSETSET 4
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            TESTETSTSETSET 4
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#">
                                            TESTETSTSETSET 4
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                </VStack>
                            </NavigationMenu.Panel>
                        </NavigationMenu.Item>

                        <NavigationMenu.Item>
                            <NavigationMenu.Link selected href="#">
                                Link 1
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>

                    <NavigationMenu.Portal keepMounted>
                        <NavigationMenu.Positioner side={side} align={align}>
                            <NavigationMenu.Popup>
                                <NavigationMenu.Viewport />
                            </NavigationMenu.Popup>
                        </NavigationMenu.Positioner>
                    </NavigationMenu.Portal>
                </NavigationMenu.Root>
            </HStack>
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
                <NavigationMenu.Root aria-label="Main">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" selected>
                                Link 1
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">Link 2</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">Link 3</NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
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
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
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
                                    </VStack>
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

                    {/* Top Navigation Menu */}
                    <NavigationMenu.Root aria-label="Main" value="1">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="1">
                                <NavigationMenu.Trigger>
                                    Overview
                                    <NavigationMenu.TriggerIndicator />
                                </NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
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
                                    </VStack>
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

                    {/* Bottom Navigation Menu */}
                    <NavigationMenu.Root aria-label="Main" value="1">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="1">
                                <NavigationMenu.Trigger>
                                    Overview
                                    <NavigationMenu.TriggerIndicator />
                                </NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
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
                                    </VStack>
                                </NavigationMenu.Panel>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>

                        <NavigationMenu.Content>
                            <NavigationMenu.Viewport />
                        </NavigationMenu.Content>
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
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
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
                                    </VStack>
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
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
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
                                    </VStack>
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
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
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
                                    </VStack>
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
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
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
                                    </VStack>
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
