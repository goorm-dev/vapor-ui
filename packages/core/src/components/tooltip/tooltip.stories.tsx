import { Tooltip } from '.';
import { Button } from '../button';
import { HStack } from '../h-stack';
import { VStack } from '../v-stack';

export default {
    title: 'Tooltip',
    component: Tooltip,
};

export const Default = () => (
    <div
        style={{
            margin: '100px',
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>Left Tooltip</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Positioner side="left">
                        <Tooltip.Content>Tooltip content</Tooltip.Content>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>Top Tooltip</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Positioner side="top">
                        <Tooltip.Content>Tooltip content</Tooltip.Content>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>Bottom Tooltip</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Positioner side="bottom">
                        <Tooltip.Content>Tooltip content</Tooltip.Content>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>Right Tooltip</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Positioner side="right">
                        <Tooltip.Content>Tooltip content</Tooltip.Content>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    </div>
);

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
                    <Tooltip.Provider>
                        <Tooltip.Root open>
                            <Tooltip.Trigger render={<Button>Left Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner side="left">
                                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger render={<Button>Top Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner side="top">
                                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger render={<Button>Bottom Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner side="bottom">
                                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger render={<Button>Right Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner side="right">
                                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </Tooltip.Provider>
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
                    <Tooltip.Provider>
                        <Tooltip.Root open>
                            <Tooltip.Trigger render={<Button>Align Start Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner align="start">
                                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger render={<Button>Align Center Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner align="center">
                                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                        <Tooltip.Root open>
                            <Tooltip.Trigger render={<Button>Align End Tooltip</Button>} />
                            <Tooltip.Portal>
                                <Tooltip.Positioner align="end">
                                    <Tooltip.Content>Tooltip content</Tooltip.Content>
                                </Tooltip.Positioner>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                </HStack>
            </VStack>

            <HStack margin="$800" padding="$200" border="1px solid black">
                <Tooltip.Root open>
                    <Tooltip.Trigger render={<Button>Left Collision</Button>} />
                    <Tooltip.Portal>
                        <Tooltip.Positioner side="left">
                            <Tooltip.Content>
                                Should flip to right when hitting container boundary
                            </Tooltip.Content>
                        </Tooltip.Positioner>
                    </Tooltip.Portal>
                </Tooltip.Root>
            </HStack>
        </>
    );
};
