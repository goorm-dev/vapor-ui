import { Collapsible, Text, VStack } from '@vapor-ui/core';
import { ChevronRightOutlineIcon } from '@vapor-ui/icons';

export default function DefaultCollapsible() {
    return (
        <Collapsible.Root defaultOpen className="w-64">
            <Collapsible.Trigger className="group flex w-full items-center gap-2 rounded-md bg-v-blue-100 px-3 py-2 text-sm font-medium text-v-gray-900 hover:bg-v-blue-200 focus-visible:outline-2 focus-visible:outline-v-blue-600 active:bg-v-blue-200">
                <ChevronRightOutlineIcon className="size-3 transition-transform ease-out group-data-[panel-open]:rotate-90" />
                Settings
            </Collapsible.Trigger>
            <Collapsible.Panel>
                <VStack
                    gap="$050"
                    backgroundColor="$blue-050"
                    paddingY="$150"
                    paddingLeft="$300"
                    marginTop="$050"
                    className="rounded-md"
                >
                    <Text foreground="normal-200">Account</Text>
                    <Text foreground="normal-200">Notifications</Text>
                    <Text foreground="normal-200">Privacy</Text>
                </VStack>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
}
