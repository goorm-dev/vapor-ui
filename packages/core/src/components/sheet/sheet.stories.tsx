import type { Meta, StoryObj } from '@storybook/react';
import { CloseOutlineIcon } from '@vapor-ui/icons';

import type { SheetPositionerProps, SheetRootProps } from '.';
import { Sheet } from '.';
import { Box } from '../box';
import { Button } from '../button';
import { VStack } from '../v-stack';

export default {
    title: 'Sheet',
    component: Sheet.Root,
} satisfies Meta<SheetRootProps>;

type SheetStory = StoryObj<SheetRootProps & Pick<SheetPositionerProps, 'side'>>;

export const Default: SheetStory = {
    argTypes: {
        side: {
            control: { type: 'inline-radio' },
            options: ['top', 'right', 'bottom', 'left'],
        },
    },
    render: ({ open, defaultOpen, side, ...args }) => {
        return (
            <VStack height="1000vh">
                <Sheet.Root {...args}>
                    <Sheet.Trigger>Open Sheet</Sheet.Trigger>
                    <Sheet.Portal keepMounted>
                        <Sheet.Overlay />
                        <Sheet.Positioner side={side}>
                            <Sheet.Popup>
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
                            </Sheet.Popup>
                        </Sheet.Positioner>
                    </Sheet.Portal>
                </Sheet.Root>
                <Sheet.Root {...args}>
                    <Sheet.Trigger>Open Sheet</Sheet.Trigger>
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
                </Sheet.Root>
            </VStack>
        );
    },
};

export const TestBed: StoryObj<SheetRootProps> = {
    render: ({ ...args }) => {
        return (
            <VStack>
                <Sheet.Root open={true} {...args}>
                    <Sheet.Trigger render={<Button variant="outline" />}>Open Sheet</Sheet.Trigger>
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
                </Sheet.Root>
            </VStack>
        );
    },
};
