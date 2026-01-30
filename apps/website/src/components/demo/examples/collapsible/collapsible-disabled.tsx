import { Collapsible, Text, VStack } from '@vapor-ui/core';
import { ChevronRightOutlineIcon } from '@vapor-ui/icons';

export default function CollapsibleDisabled() {
    return (
        <VStack gap="$200">
            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    enabled
                </Text>
                <Collapsible.Root className="w-64">
                    <Collapsible.Trigger className="group flex w-full items-center gap-2 rounded-md bg-v-gray-100 px-3 py-2 text-sm font-medium hover:bg-v-gray-200">
                        <ChevronRightOutlineIcon className="size-3 transition-transform ease-out group-data-[panel-open]:rotate-90" />
                        Advanced Options
                    </Collapsible.Trigger>
                    <Collapsible.Panel>
                        <Text
                            typography="body3"
                            foreground="hint-100"
                            className="mt-2 rounded-md bg-v-gray-50 p-3"
                        >
                            Configure advanced settings for your project.
                        </Text>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>

            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <Collapsible.Root disabled className="w-64">
                    <Collapsible.Trigger className="group flex w-full items-center gap-2 rounded-md bg-v-gray-100 px-3 py-2 text-sm font-medium opacity-50">
                        <ChevronRightOutlineIcon className="size-3 transition-transform ease-out group-data-[panel-open]:rotate-90" />
                        Advanced Options
                    </Collapsible.Trigger>
                    <Collapsible.Panel>
                        <Text
                            typography="body3"
                            foreground="hint-100"
                            className="mt-2 rounded-md bg-v-gray-50 p-3"
                        >
                            Configure advanced settings for your project.
                        </Text>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </VStack>
        </VStack>
    );
}
