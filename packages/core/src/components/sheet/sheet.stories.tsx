import type { Meta, StoryObj } from '@storybook/react';
import { CloseOutlineIcon } from '@vapor-ui/icons';

import { Sheet } from '.';
import { Box } from '../box';
import { Button } from '../button';
import { VStack } from '../v-stack';

export default {
    title: 'Sheet',
    component: Sheet.Root,

    argTypes: {
        side: {
            control: { type: 'inline-radio' },
            options: ['top', 'right', 'bottom', 'left'],
        },
    },
} satisfies Meta<typeof Sheet.Root>;

export const Default: StoryObj<typeof Sheet.Root> = {
    render: (args) => {
        return (
            <VStack height="1000vh">
                <Sheet.Root {...args}>
                    <Sheet.Trigger>Open Sheet</Sheet.Trigger>
                    <Sheet.Portal>
                        <Sheet.Overlay />
                        <Sheet.Content>
                            <Box
                                aria-label="Close sheet"
                                position="absolute"
                                display="flex"
                                style={{ top: '1rem', right: '1rem' }}
                                render={<Sheet.Close />}
                            >
                                <CloseOutlineIcon />
                            </Box>
                            <Sheet.Header>
                                <Sheet.Title>Sheet Title</Sheet.Title>
                            </Sheet.Header>
                            <Sheet.Body>
                                <Sheet.Description>Sheet content goes here.</Sheet.Description>
                            </Sheet.Body>
                            <Sheet.Footer>
                                <Sheet.Close>Close</Sheet.Close>
                            </Sheet.Footer>
                        </Sheet.Content>
                    </Sheet.Portal>
                </Sheet.Root>
            </VStack>
        );
    },
};

export const TestBed: StoryObj<typeof Sheet.Root> = {
    render: (args) => {
        return (
            <VStack>
                <Sheet.Root open={true} side="right" {...args}>
                    <Sheet.Trigger render={<Button variant="outline" />}>Open Sheet</Sheet.Trigger>
                    <Sheet.Portal>
                        <Sheet.Overlay />
                        <Sheet.Content>
                            <Box
                                aria-label="Close sheet"
                                position="absolute"
                                display="flex"
                                style={{ top: '1rem', right: '1rem' }}
                                render={<Sheet.Close />}
                            >
                                <CloseOutlineIcon />
                            </Box>
                            <Sheet.Header>
                                <h2>Sheet Title</h2>
                            </Sheet.Header>
                            <Sheet.Body>
                                <p>Sheet content goes here.</p>
                            </Sheet.Body>
                            <Sheet.Footer>
                                <Sheet.Close>Close</Sheet.Close>
                            </Sheet.Footer>
                        </Sheet.Content>
                    </Sheet.Portal>
                </Sheet.Root>
            </VStack>
        );
    },
};
