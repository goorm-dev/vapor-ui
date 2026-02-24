import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs } from '.';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'Tabs',
    component: Tabs.Root,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        variant: { control: 'inline-radio', options: ['line', 'fill'] },
        orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
        disabled: { control: 'boolean' },
        activateOnFocus: { control: 'boolean' },
        loopFocus: { control: 'boolean' },
    },
} satisfies Meta<typeof Tabs.Root>;

export const Default: StoryObj<typeof Tabs.Root> = {
    render: (args) => {
        return (
            <>
                <Tabs.Root variant="line" defaultValue={'tab1'} activateOnFocus={false} {...args}>
                    <Tabs.List>
                        <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                        <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                        <Tabs.Button value="tab4">Tab 4</Tabs.Button>
                        <Tabs.Button value="tab5">Tab 5</Tabs.Button>
                        <Tabs.Button value="tab6">Tab 6</Tabs.Button>
                        <Tabs.Button value="tab7">Tab 7</Tabs.Button>
                        <Tabs.Button value="tab8">Tab 8</Tabs.Button>
                    </Tabs.List>
                    <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                    <Tabs.Panel value="tab2">Content for Tab 2</Tabs.Panel>
                    <Tabs.Panel value="tab3">Content for Tab 3</Tabs.Panel>
                    <Tabs.Panel value="tab4">Content for Tab 4</Tabs.Panel>
                    <Tabs.Panel value="tab5">Content for Tab 5</Tabs.Panel>
                    <Tabs.Panel value="tab6">Content for Tab 6</Tabs.Panel>
                    <Tabs.Panel value="tab7">Content for Tab 7</Tabs.Panel>
                    <Tabs.Panel value="tab8">Content for Tab 8</Tabs.Panel>
                </Tabs.Root>
            </>
        );
    },
};

export const TestBed: StoryObj<typeof Tabs.Root> = {
    render: (args) => {
        return (
            <VStack $css={{ gap: '$300' }}>
                <HStack>
                    <Tabs.Root
                        variant="line"
                        defaultValue={'tab1'}
                        activateOnFocus={false}
                        {...args}
                    >
                        <Tabs.List>
                            <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                            <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                            <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                        <Tabs.Panel value="tab2">Content for Tab 2</Tabs.Panel>
                        <Tabs.Panel value="tab3">Content for Tab 3</Tabs.Panel>
                    </Tabs.Root>

                    <Tabs.Root
                        variant="line"
                        defaultValue={'tab2'}
                        activateOnFocus={false}
                        {...args}
                    >
                        <Tabs.List>
                            <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                            <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                            <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                        <Tabs.Panel value="tab2">Content for Tab 2</Tabs.Panel>
                        <Tabs.Panel value="tab3">Content for Tab 3</Tabs.Panel>
                    </Tabs.Root>
                </HStack>

                <HStack $css={{ gap: '$200' }}>
                    <Tabs.Root size="sm" defaultValue={'tab1'} activateOnFocus={false} {...args}>
                        <Tabs.List>
                            <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                    </Tabs.Root>

                    <Tabs.Root size="md" defaultValue={'tab1'} activateOnFocus={false} {...args}>
                        <Tabs.List>
                            <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                    </Tabs.Root>

                    <Tabs.Root size="lg" defaultValue={'tab1'} activateOnFocus={false} {...args}>
                        <Tabs.List>
                            <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                    </Tabs.Root>

                    <Tabs.Root size="xl" defaultValue={'tab1'} activateOnFocus={false} {...args}>
                        <Tabs.List>
                            <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                    </Tabs.Root>
                </HStack>

                <Tabs.Root disabled defaultValue={'tab2'} activateOnFocus={false} {...args}>
                    <Tabs.List>
                        <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                        <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                        <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                    </Tabs.List>
                    <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                    <Tabs.Panel value="tab2">Content for Tab 2</Tabs.Panel>
                    <Tabs.Panel value="tab3">Content for Tab 3</Tabs.Panel>
                </Tabs.Root>

                <HStack $css={{ gap: '$200' }}>
                    <Tabs.Root
                        orientation="vertical"
                        defaultValue={'tab2'}
                        activateOnFocus={false}
                        {...args}
                    >
                        <Tabs.List>
                            <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                            <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                            <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                        <Tabs.Panel value="tab2">Content for Tab 2</Tabs.Panel>
                        <Tabs.Panel value="tab3">Content for Tab 3</Tabs.Panel>
                    </Tabs.Root>

                    <Tabs.Root
                        orientation="vertical"
                        variant="line"
                        defaultValue={'tab2'}
                        activateOnFocus={false}
                        {...args}
                    >
                        <Tabs.List>
                            <Tabs.Button value="tab1">Tab 1</Tabs.Button>
                            <Tabs.Button value="tab2">Tab 2</Tabs.Button>
                            <Tabs.Button value="tab3">Tab 3</Tabs.Button>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">Content for Tab 1</Tabs.Panel>
                        <Tabs.Panel value="tab2">Content for Tab 2</Tabs.Panel>
                        <Tabs.Panel value="tab3">Content for Tab 3</Tabs.Panel>
                    </Tabs.Root>
                </HStack>
            </VStack>
        );
    },
};
