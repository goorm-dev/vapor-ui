import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '../box';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';
import { Skeleton } from './skeleton';

export default {
    title: 'Skeleton',
    argTypes: {
        shape: { control: 'inline-radio', options: ['rounded', 'square'] },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        animation: { control: 'inline-radio', options: ['shimmer', 'pulse', 'none'] },
    },
} as Meta<typeof Skeleton>;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
    render: (args) => <Skeleton {...args} width={'200px'} />,
};

export const TestBed: Story = {
    render: () => (
        <VStack gap="$300">
            <VStack gap="$100">
                <h3>Shape</h3>
                <HStack gap="$200" alignItems="center">
                    <Skeleton shape="rounded" width="200px" />
                    <Skeleton shape="square" width="200px" />
                    <Skeleton shape="rounded" width="40px" height="40px" />
                </HStack>
            </VStack>

            <VStack gap="$100">
                <h3>Size</h3>
                <VStack gap="$075">
                    <Skeleton size="sm" />
                    <Skeleton size="md" />
                    <Skeleton size="lg" />
                    <Skeleton size="xl" />
                </VStack>
            </VStack>

            <VStack gap="$100">
                <h3>Animation</h3>
                <VStack gap="$075">
                    <Skeleton animation="shimmer" />
                    <Skeleton animation="pulse" />
                    <Skeleton animation="none" />
                </VStack>
            </VStack>

            <VStack gap="$100">
                <h3>Composition Example - Profile Card</h3>
                <Box
                    padding="$200"
                    border="1px solid"
                    borderColor="$normal"
                    borderRadius="$100"
                    maxWidth="320px"
                >
                    <HStack gap="$150" alignItems="center">
                        <Skeleton shape="rounded" width="40px" height="40px" />
                        <VStack gap="$075">
                            <Skeleton shape="rounded" size="sm" width="60%" />
                            <Skeleton shape="rounded" size="sm" width="40%" />
                        </VStack>
                    </HStack>
                    <VStack gap="$075" marginTop="$200">
                        <Skeleton shape="square" size="sm" />
                        <Skeleton shape="square" size="sm" width="90%" />
                        <Skeleton shape="square" size="sm" width="75%" />
                    </VStack>
                </Box>
            </VStack>
        </VStack>
    ),
};
