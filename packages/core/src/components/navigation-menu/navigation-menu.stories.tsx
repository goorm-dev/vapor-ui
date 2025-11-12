import type { ComponentProps } from 'react';

import type { StoryObj } from '@storybook/react-vite';

import { NavigationMenu } from '.';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

type RootProps = ComponentProps<typeof NavigationMenu.Root>;
type PositionerProps = ComponentProps<typeof NavigationMenu.PositionerPrimitive>;

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
    render: ({ side, align, ...args }) => {
        return (
            <HStack justifyContent={'start'} margin="-$200">
                <NavigationMenu.RootPrimitive {...args} defaultValue={'1'} aria-label="Main">
                    <NavigationMenu.ListPrimitive>
                        <NavigationMenu.ItemPrimitive value="1">
                            <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                            <NavigationMenu.Panel>
                                <VStack render={<ul style={{ listStyle: 'none' }} />}>
                                    <NavigationMenu.Item href="#">Sub Link 1</NavigationMenu.Item>
                                    <NavigationMenu.Item href="#">Sub Link 2</NavigationMenu.Item>
                                    <NavigationMenu.Item href="#">Sub Link 3</NavigationMenu.Item>
                                    <NavigationMenu.Item href="#">Sub Link 4</NavigationMenu.Item>
                                </VStack>
                            </NavigationMenu.Panel>
                        </NavigationMenu.ItemPrimitive>
                        <NavigationMenu.Item>
                            <NavigationMenu.Trigger>Trigger 2</NavigationMenu.Trigger>
                            <NavigationMenu.Panel>
                                <VStack render={<ul style={{ listStyle: 'none' }} />} gap="0">
                                    <NavigationMenu.Item href="#">
                                        TESTETSTSETSET 1
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item href="#">
                                        TESTETSTSETSET 2
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item href="#">
                                        TESTETSTSETSET 3
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item href="#">
                                        TESTETSTSETSET 4
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item href="#">
                                        TESTETSTSETSET 4
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item href="#">
                                        TESTETSTSETSET 4
                                    </NavigationMenu.Item>
                                </VStack>
                            </NavigationMenu.Panel>
                        </NavigationMenu.Item>

                        <NavigationMenu.Item selected href="#">
                            Link 1
                        </NavigationMenu.Item>
                    </NavigationMenu.ListPrimitive>

                    <NavigationMenu.Viewport
                        positionerElement={
                            <NavigationMenu.PositionerPrimitive side={side} align={align} />
                        }
                    />
                </NavigationMenu.RootPrimitive>
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
                    <NavigationMenu.Item href="#" selected>
                        Link 1
                    </NavigationMenu.Item>
                    <NavigationMenu.Item href="#">Link 2</NavigationMenu.Item>
                    <NavigationMenu.Item href="#">Link 3</NavigationMenu.Item>
                </NavigationMenu.Root>

                <HStack gap="$250">
                    {/* Left Navigation Menu */}
                    <NavigationMenu.RootPrimitive aria-label="Main" value="1">
                        <NavigationMenu.ListPrimitive>
                            <NavigationMenu.ItemPrimitive value="1">
                                <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
                                        <NavigationMenu.Item href="#">
                                            Sub Link 1
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item href="#">
                                            Sub Link 2
                                        </NavigationMenu.Item>
                                    </VStack>
                                </NavigationMenu.Panel>
                            </NavigationMenu.ItemPrimitive>
                        </NavigationMenu.ListPrimitive>

                        <NavigationMenu.Viewport
                            positionerElement={<NavigationMenu.PositionerPrimitive side="left" />}
                        />
                    </NavigationMenu.RootPrimitive>

                    {/* Top Navigation Menu */}
                    <NavigationMenu.RootPrimitive aria-label="Main" value="1">
                        <NavigationMenu.ListPrimitive>
                            <NavigationMenu.ItemPrimitive value="1">
                                <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
                                        <NavigationMenu.Item href="#">
                                            Sub Link 1
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item href="#">
                                            Sub Link 2
                                        </NavigationMenu.Item>
                                    </VStack>
                                </NavigationMenu.Panel>
                            </NavigationMenu.ItemPrimitive>
                        </NavigationMenu.ListPrimitive>

                        <NavigationMenu.Viewport
                            positionerElement={<NavigationMenu.PositionerPrimitive side="top" />}
                        />
                    </NavigationMenu.RootPrimitive>

                    {/* Bottom Navigation Menu */}
                    <NavigationMenu.RootPrimitive aria-label="Main" value="1">
                        <NavigationMenu.ListPrimitive>
                            <NavigationMenu.ItemPrimitive value="1">
                                <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
                                        <NavigationMenu.Item href="#">
                                            Sub Link 1
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item href="#">
                                            Sub Link 2
                                        </NavigationMenu.Item>
                                    </VStack>
                                </NavigationMenu.Panel>
                            </NavigationMenu.ItemPrimitive>
                        </NavigationMenu.ListPrimitive>

                        <NavigationMenu.Viewport />
                    </NavigationMenu.RootPrimitive>

                    {/* Right Navigation Menu */}
                    <NavigationMenu.RootPrimitive aria-label="Main" value="1">
                        <NavigationMenu.ListPrimitive>
                            <NavigationMenu.ItemPrimitive value="1">
                                <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
                                        <NavigationMenu.Item href="#">
                                            Sub Link 1
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item href="#">
                                            Sub Link 2
                                        </NavigationMenu.Item>
                                    </VStack>
                                </NavigationMenu.Panel>
                            </NavigationMenu.ItemPrimitive>
                        </NavigationMenu.ListPrimitive>

                        <NavigationMenu.Viewport
                            positionerElement={<NavigationMenu.PositionerPrimitive side="right" />}
                        />
                    </NavigationMenu.RootPrimitive>
                </HStack>

                <HStack gap="$250">
                    {/* Start Navigation Menu */}
                    <NavigationMenu.RootPrimitive aria-label="Main" value="1">
                        <NavigationMenu.ListPrimitive>
                            <NavigationMenu.ItemPrimitive value="1">
                                <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
                                        <NavigationMenu.Item href="#">
                                            Sub Link 1
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item href="#">
                                            Sub Link 2
                                        </NavigationMenu.Item>
                                    </VStack>
                                </NavigationMenu.Panel>
                            </NavigationMenu.ItemPrimitive>
                        </NavigationMenu.ListPrimitive>

                        <NavigationMenu.Viewport
                            positionerElement={<NavigationMenu.PositionerPrimitive align="start" />}
                        />
                    </NavigationMenu.RootPrimitive>

                    {/* Center Navigation Menu */}
                    <NavigationMenu.RootPrimitive aria-label="Main" value="1">
                        <NavigationMenu.ListPrimitive>
                            <NavigationMenu.ItemPrimitive value="1">
                                <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
                                        <NavigationMenu.Item href="#">
                                            Sub Link 1
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item href="#">
                                            Sub Link 2
                                        </NavigationMenu.Item>
                                    </VStack>
                                </NavigationMenu.Panel>
                            </NavigationMenu.ItemPrimitive>
                        </NavigationMenu.ListPrimitive>

                        <NavigationMenu.Viewport
                            positionerElement={
                                <NavigationMenu.PositionerPrimitive align="center" />
                            }
                        />
                    </NavigationMenu.RootPrimitive>

                    {/* End Navigation Menu */}
                    <NavigationMenu.RootPrimitive aria-label="Main" value="1">
                        <NavigationMenu.ListPrimitive>
                            <NavigationMenu.ItemPrimitive value="1">
                                <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
                                <NavigationMenu.Panel>
                                    <VStack
                                        render={<ul style={{ listStyle: 'none' }} />}
                                        gap="$000"
                                    >
                                        <NavigationMenu.Item href="#">
                                            Sub Link 1
                                        </NavigationMenu.Item>
                                        <NavigationMenu.Item href="#">
                                            Sub Link 2
                                        </NavigationMenu.Item>
                                    </VStack>
                                </NavigationMenu.Panel>
                            </NavigationMenu.ItemPrimitive>
                        </NavigationMenu.ListPrimitive>

                        <NavigationMenu.Viewport
                            positionerElement={<NavigationMenu.PositionerPrimitive align="end" />}
                        />
                    </NavigationMenu.RootPrimitive>
                </HStack>
            </VStack>
        );
    },
};
