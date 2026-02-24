import { Collapsible, HStack, Text, VStack } from '@vapor-ui/core';
import { ChevronRightOutlineIcon } from '@vapor-ui/icons';

export default function CollapsibleKeepMounted() {
    return (
        <HStack $css={{ gap: '$400', alignItems: 'flex-start' }}>
            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    default
                </Text>
                <Collapsible.Root className="w-56">
                    <Collapsible.Trigger className="group flex w-full items-center gap-2 rounded-md bg-v-gray-100 px-3 py-2 text-sm font-medium hover:bg-v-gray-200">
                        <ChevronRightOutlineIcon className="size-3 transition-transform ease-out group-data-[panel-open]:rotate-90" />
                        Help Section
                    </Collapsible.Trigger>
                    <Collapsible.Panel>
                        <Text
                            typography="body3"
                            foreground="hint-100"
                            className="mt-2 rounded-md bg-v-gray-50 p-3"
                        >
                            Removed from DOM when closed.
                        </Text>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>

            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    keepMounted
                </Text>
                <Collapsible.Root className="w-56">
                    <Collapsible.Trigger className="group flex w-full items-center gap-2 rounded-md bg-v-blue-100 px-3 py-2 text-sm font-medium hover:bg-v-blue-200">
                        <ChevronRightOutlineIcon className="size-3 transition-transform ease-out group-data-[panel-open]:rotate-90" />
                        Help Section
                    </Collapsible.Trigger>
                    <Collapsible.Panel keepMounted>
                        <Text
                            typography="body3"
                            foreground="hint-100"
                            className="mt-2 rounded-md bg-v-blue-50 p-3"
                        >
                            Stays in DOM when closed.
                        </Text>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>
        </HStack>
    );
}
