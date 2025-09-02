import type { StoryObj } from '@storybook/react';

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
