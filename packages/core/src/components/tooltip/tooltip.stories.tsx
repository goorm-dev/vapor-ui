import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from '.';
import { Button } from '../button';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'Tooltip',
    component: Tooltip.Root,
    argTypes: {
        side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
        sideOffset: { control: 'number' },
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
        alignOffset: { control: 'number' },
    },
} satisfies Meta<typeof Tooltip.Root>;

export const Default: StoryObj<typeof Tooltip.Root> = {
    render: (args) => (
        <div
            style={{
                margin: '100px',
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Tooltip.Root side="left" {...args}>
                <Tooltip.Trigger render={<Button>Left Tooltip</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root side="top" {...args}>
                <Tooltip.Trigger render={<Button>Top Tooltip</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root side="bottom" {...args}>
                <Tooltip.Trigger render={<Button>Bottom Tooltip</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root side="right" {...args}>
                <Tooltip.Trigger render={<Button>Right Tooltip</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </div>
    ),
};

export const TestBed = () => {
    return (
        <>
            <VStack
                margin="$800"
                gap="$400"
                justifyContent="center"
                alignItems="center"
                border="1px solid"
            >
                <HStack margin="$800" gap="$400" justifyContent="center" alignItems="center">
                    <Tooltip.Root open side="left">
                        <Tooltip.Trigger render={<Button>Left Tooltip</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>Tooltip content</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root open side="top">
                        <Tooltip.Trigger render={<Button>Top Tooltip</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>Tooltip content</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root open side="bottom">
                        <Tooltip.Trigger render={<Button>Bottom Tooltip</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>Tooltip content</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root open side="right">
                        <Tooltip.Trigger render={<Button>Right Tooltip</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>Tooltip content</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </HStack>
            </VStack>

            <VStack
                margin="$800"
                gap="$400"
                justifyContent="center"
                alignItems="center"
                border="1px solid"
            >
                <HStack margin="$800" gap="$400" justifyContent="center" alignItems="center">
                    <Tooltip.Root open align="start">
                        <Tooltip.Trigger render={<Button>Align Start Tooltip</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>Tooltip content</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root open align="center">
                        <Tooltip.Trigger render={<Button>Align Center Tooltip</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>Tooltip content</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root open align="end">
                        <Tooltip.Trigger render={<Button>Align End Tooltip</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>Tooltip content</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </HStack>
            </VStack>

            <HStack margin="$800" padding="$200" border="1px solid black">
                <Tooltip.Root open side="left">
                    <Tooltip.Trigger render={<Button>Left Collision</Button>} />
                    <Tooltip.Portal>
                        <Tooltip.Content>
                            Should flip to right when hitting container boundary
                        </Tooltip.Content>
                    </Tooltip.Portal>
                </Tooltip.Root>
            </HStack>
        </>
    );
};
