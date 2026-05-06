import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { DarkIcon, LightIcon, PcIcon } from '@vapor-ui/icons';

import { SegmentedControl } from '.';
import { Grid } from '../grid';
import { Text } from '../text';
import { VStack } from '../v-stack';

export default {
    title: 'SegmentedControl',
    component: SegmentedControl.Root,
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof SegmentedControl.Root>;
type Story = StoryObj<typeof SegmentedControl.Root>;

export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState('completed');

        return (
            <Grid.Root $css={{ gap: '$200' }}>
                <Grid.Item>
                    <Text typography="heading3">Filter</Text>
                    <SegmentedControl.Root {...args}>
                        <SegmentedControl.Item value="all">전체 보기</SegmentedControl.Item>
                        <SegmentedControl.Item disabled value="in-progress">
                            진행 중
                        </SegmentedControl.Item>
                        <SegmentedControl.Item value="completed">완료</SegmentedControl.Item>
                        <SegmentedControl.Item value="upcoming">예정</SegmentedControl.Item>
                    </SegmentedControl.Root>
                </Grid.Item>

                <Grid.Item>
                    <Text typography="heading3">Mode Switch</Text>
                    <SegmentedControl.Root defaultValue="light" {...args}>
                        <SegmentedControl.IconItem value="light">
                            <LightIcon />
                        </SegmentedControl.IconItem>
                        <SegmentedControl.IconItem value="dark">
                            <DarkIcon />
                        </SegmentedControl.IconItem>
                    </SegmentedControl.Root>
                </Grid.Item>

                <Grid.Item>
                    <Text typography="heading3">Controlled</Text>
                    <SegmentedControl.Root value={value} onValueChange={setValue} {...args}>
                        <SegmentedControl.Item value="all">전체</SegmentedControl.Item>
                        <SegmentedControl.Item disabled value="in-progress">
                            진행 중
                        </SegmentedControl.Item>
                        <SegmentedControl.Item value="completed">완료</SegmentedControl.Item>
                        <SegmentedControl.Item value="upcoming">예정</SegmentedControl.Item>
                    </SegmentedControl.Root>
                </Grid.Item>

                <Grid.Item>
                    <Text typography="heading3">Uncontrolled</Text>
                    <SegmentedControl.Root defaultValue="upcoming" {...args}>
                        <SegmentedControl.Item value="all">전체</SegmentedControl.Item>
                        <SegmentedControl.Item disabled value="in-progress">
                            진행 중
                        </SegmentedControl.Item>
                        <SegmentedControl.Item value="completed">완료</SegmentedControl.Item>
                        <SegmentedControl.Item value="upcoming">예정</SegmentedControl.Item>
                    </SegmentedControl.Root>
                </Grid.Item>
            </Grid.Root>
        );
    },
};

export const TestBed: Story = {
    render: () => (
        <VStack>
            <Text typography="heading3">size: With Item</Text>
            <VStack $css={{ gap: '$100', marginBottom: '$200' }}>
                <SegmentedControl.Root size="sm">
                    <SegmentedControl.Item value="a">AAA</SegmentedControl.Item>
                    <SegmentedControl.Item value="b">BBB</SegmentedControl.Item>
                    <SegmentedControl.Item value="c">CCC</SegmentedControl.Item>
                </SegmentedControl.Root>
                <SegmentedControl.Root size="md">
                    <SegmentedControl.Item value="a">AAA</SegmentedControl.Item>
                    <SegmentedControl.Item value="b">BBB</SegmentedControl.Item>
                    <SegmentedControl.Item value="c">CCC</SegmentedControl.Item>
                </SegmentedControl.Root>
                <SegmentedControl.Root size="lg">
                    <SegmentedControl.Item value="a">AAA</SegmentedControl.Item>
                    <SegmentedControl.Item value="b">BBB</SegmentedControl.Item>
                    <SegmentedControl.Item value="c">CCC</SegmentedControl.Item>
                </SegmentedControl.Root>
            </VStack>

            <Text typography="heading3">size: With IconItem</Text>
            <VStack $css={{ gap: '$100', marginBottom: '$200' }}>
                <SegmentedControl.Root defaultValue="light" size="sm">
                    <SegmentedControl.IconItem value="light">
                        <LightIcon />
                    </SegmentedControl.IconItem>
                    <SegmentedControl.IconItem value="dark">
                        <DarkIcon />
                    </SegmentedControl.IconItem>
                    <SegmentedControl.IconItem value="system">
                        <PcIcon />
                    </SegmentedControl.IconItem>
                </SegmentedControl.Root>
                <SegmentedControl.Root defaultValue="light" size="md">
                    <SegmentedControl.IconItem value="light">
                        <LightIcon />
                    </SegmentedControl.IconItem>
                    <SegmentedControl.IconItem value="dark">
                        <DarkIcon />
                    </SegmentedControl.IconItem>
                    <SegmentedControl.IconItem value="system">
                        <PcIcon />
                    </SegmentedControl.IconItem>
                </SegmentedControl.Root>
                <SegmentedControl.Root defaultValue="light" size="lg">
                    <SegmentedControl.IconItem value="light">
                        <LightIcon />
                    </SegmentedControl.IconItem>
                    <SegmentedControl.IconItem value="dark">
                        <DarkIcon />
                    </SegmentedControl.IconItem>
                    <SegmentedControl.IconItem value="system">
                        <PcIcon />
                    </SegmentedControl.IconItem>
                </SegmentedControl.Root>
            </VStack>

            <Text typography="heading3">disabled: With Item</Text>
            <VStack $css={{ gap: '$100', marginBottom: '$200' }}>
                <SegmentedControl.Root disabled>
                    <SegmentedControl.Item value="a">AAA</SegmentedControl.Item>
                    <SegmentedControl.Item value="b">BBB</SegmentedControl.Item>
                    <SegmentedControl.Item value="c">CCC</SegmentedControl.Item>
                </SegmentedControl.Root>
            </VStack>

            <Text typography="heading3">disabled: With IconItem</Text>
            <VStack $css={{ gap: '$100', marginBottom: '$200' }}>
                <SegmentedControl.Root disabled defaultValue="light">
                    <SegmentedControl.IconItem value="light">
                        <LightIcon />
                    </SegmentedControl.IconItem>
                    <SegmentedControl.IconItem value="dark">
                        <DarkIcon />
                    </SegmentedControl.IconItem>
                    <SegmentedControl.IconItem value="system">
                        <PcIcon />
                    </SegmentedControl.IconItem>
                </SegmentedControl.Root>
            </VStack>
        </VStack>
    ),
};
