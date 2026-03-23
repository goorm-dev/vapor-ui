import { useState } from 'react';

import { Button, Collapsible, HStack, Text, VStack } from '@vapor-ui/core';

export default function CollapsibleOpenState() {
    const [open, setOpen] = useState(true);

    return (
        <HStack $css={{ gap: '$400', alignItems: 'flex-start' }}>
            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    defaultOpen
                </Text>
                <Collapsible.Root defaultOpen className="w-56">
                    <Collapsible.Trigger className="w-full rounded-md bg-v-gray-100 px-3 py-2 text-sm font-medium hover:bg-v-gray-200">
                        FAQ Section
                    </Collapsible.Trigger>
                    <Collapsible.Panel>
                        <Text
                            typography="body3"
                            foreground="hint-100"
                            className="mt-2 rounded-md bg-v-gray-50 p-3"
                        >
                            This panel starts open and manages its own state.
                        </Text>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    controlled
                </Text>
                <Collapsible.Root open={open} onOpenChange={setOpen} className="w-56">
                    <Collapsible.Trigger className="w-full rounded-md bg-v-blue-100 px-3 py-2 text-sm font-medium hover:bg-v-blue-200">
                        Release Notes
                    </Collapsible.Trigger>
                    <Collapsible.Panel>
                        <Text
                            typography="body3"
                            foreground="hint-100"
                            className="mt-2 rounded-md bg-v-blue-50 p-3"
                        >
                            This panel is controlled externally via state.
                        </Text>
                    </Collapsible.Panel>
                    <HStack $css={{ gap: '$100', marginTop: '$150' }}>
                        <Button size="sm" onClick={() => setOpen(true)}>
                            Open
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </HStack>
                </Collapsible.Root>
            </VStack>
        </HStack>
    );
}
