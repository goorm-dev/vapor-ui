import type { StoryObj } from '@storybook/react';

import { VStack } from '../v-stack';
import { NavigationMenu } from './navigation-menu';

export default {
    title: 'NavigationMenu',
    component: NavigationMenu.Root,
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['sm', 'md', 'lg', 'xl'],
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

export const Default: StoryObj<typeof NavigationMenu.Root> = {
    render: (args) => {
        return (
            <>
                <NavigationMenu.Root {...args} aria-label="Main">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={args.disabled} selected href="#">
                                Link 1
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Trigger>
                                Overview
                                <NavigationMenu.TriggerIndicator />
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Panel>
                                <NavigationMenu.List render={<VStack gap="0" />}>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={args.disabled} href="#">
                                            Sub Link 1
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={args.disabled} href="#">
                                            Sub Link 2
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={args.disabled} href="#">
                                            Sub Link 3
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={args.disabled} href="#">
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
                                        <NavigationMenu.Link disabled={args.disabled} href="#">
                                            Sub Link 1
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={args.disabled} href="#">
                                            Sub Link 2
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={args.disabled} href="#">
                                            Sub Link 3
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link disabled={args.disabled} href="#">
                                            Sub Link 4
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                </NavigationMenu.List>
                            </NavigationMenu.Panel>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={args.disabled} href="#">
                                23411234
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.LinkItem disabled={args.disabled} href="#">
                            213412341234
                        </NavigationMenu.LinkItem>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={args.disabled} href="#">
                                asdf
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>

                    <NavigationMenu.Portal>
                        <NavigationMenu.Positioner>
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
    render: (args) => {
        return (
            <>
                <NavigationMenu.Root {...args} aria-label="Main">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={args.disabled} selected href="#">
                                Link 1
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={args.disabled} href="#">
                                23411234
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.LinkItem disabled={args.disabled} href="#">
                            213412341234
                        </NavigationMenu.LinkItem>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link disabled={args.disabled} href="#">
                                asdf
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </>
        );
    },
};
