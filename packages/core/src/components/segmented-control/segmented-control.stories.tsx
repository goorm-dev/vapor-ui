import type { Meta, StoryObj } from '@storybook/react-vite';

import { SegmentedControl } from '.';
import { Box } from '../box';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'SegmentedControl',
} as Meta<typeof SegmentedControl>;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
    render: (args) => (
        <SegmentedControl.Root {...args}>
            <SegmentedControl.Item value="1">Item 1</SegmentedControl.Item>
            <SegmentedControl.Item value="2">Item 2</SegmentedControl.Item>
            <SegmentedControl.Item value="3">Item 3</SegmentedControl.Item>
        </SegmentedControl.Root>
    ),
};

export const TestBed: Story = {
    render: () => (
        <VStack $css={{ gap: '$300' }}>
            <VStack $css={{ gap: '$100' }}>
                <h3>Shape</h3>
                <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                    <SegmentedControl.Root>
                        <SegmentedControl.Item value="1">sadfasdf</SegmentedControl.Item>
                    </SegmentedControl.Root>
                    <SegmentedControl.Root>
                        <SegmentedControl.Item value="2">sadfasdf</SegmentedControl.Item>
                    </SegmentedControl.Root>
                    <SegmentedControl.Root>
                        <SegmentedControl.Item value="3">sadfasdf</SegmentedControl.Item>
                    </SegmentedControl.Root>
                </HStack>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <h3>Size</h3>
                <VStack $css={{ gap: '$075' }}>
                    <SegmentedControl.Root />
                    <SegmentedControl.Root />
                    <SegmentedControl.Root />
                    <SegmentedControl.Root />
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <h3>Animation</h3>
                <VStack $css={{ gap: '$075' }}>
                    <SegmentedControl.Root />
                    <SegmentedControl.Root />
                    <SegmentedControl.Root />
                </VStack>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <h3>Composition Example - Profile Card</h3>
                <Box
                    $css={{
                        padding: '$200',
                        border: '1px solid',
                        borderColor: '$border-normal',
                        borderRadius: '$100',
                        maxWidth: '320px',
                    }}
                >
                    <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                        <SegmentedControl.Root $css={{ width: '40px', height: '40px' }} />
                        <VStack $css={{ gap: '$075' }}>
                            <SegmentedControl.Root $css={{ width: '60%' }} />
                            <SegmentedControl.Root $css={{ width: '40%' }} />
                        </VStack>
                    </HStack>
                    <VStack $css={{ gap: '$075', marginTop: '$200' }}>
                        <SegmentedControl.Root />
                        <SegmentedControl.Root $css={{ width: '90%' }} />
                        <SegmentedControl.Root $css={{ width: '75%' }} />
                    </VStack>
                </Box>
            </VStack>
        </VStack>
    ),
};
