import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';
import { Spinner } from './spinner';

export default {
    title: 'Spinner',
    argTypes: {
        size: {
            control: { type: 'inline-radio' },
            options: ['md', 'lg', 'xl'],
        },

        colorPalette: {
            control: { type: 'inline-radio' },
            options: ['primary', 'inverse'],
        },
    },
} as Meta<typeof Spinner>;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
    render: (args) => <Spinner {...args} />,
};

export const TestBed: Story = {
    render: () => (
        <VStack $css={{ gap: '$300' }}>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
            </HStack>

            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Button>
                    <Spinner colorPalette="inverse" />
                    Loading Button (fill)
                </Button>

                <Button colorPalette="success" variant="outline">
                    <Spinner colorPalette="inverse" />
                    Loading Button (outline)
                </Button>

                <Button colorPalette="warning" variant="ghost">
                    <Spinner colorPalette="inverse" />
                    Loading Button (ghost)
                </Button>
            </HStack>
        </VStack>
    ),
};
