import { Button, Collapsible, HStack } from '@vapor-ui/core';

export default function CollapsibleKeepMounted() {
    return (
        <HStack gap="$500">
            <Collapsible.Root className="w-72 h-36">
                <h4 className="text-lg font-medium mb-3">기본 (DOM에서 제거됨)</h4>
                <Collapsible.Trigger render={<Button color="secondary" />}>
                    기본 동작
                </Collapsible.Trigger>
                <Collapsible.Panel>
                    <div className="mt-2 p-4 border border-v-gray-200 rounded bg-v-purple-50">
                        닫힌 상태에서는 DOM에서 제거됩니다.
                    </div>
                </Collapsible.Panel>
            </Collapsible.Root>

            <Collapsible.Root className="w-72 h-36">
                <h4 className="text-lg font-medium mb-3">keepMounted (DOM에 유지됨)</h4>
                <Collapsible.Trigger render={<Button color="warning" variant="outline" />}>
                    keepMounted 사용
                </Collapsible.Trigger>
                <Collapsible.Panel keepMounted>
                    <div className="mt-2 p-4 border border-v-gray-200 rounded bg-v-orange-50">
                        닫힌 상태에서도 DOM에 유지됩니다.
                    </div>
                </Collapsible.Panel>
            </Collapsible.Root>
        </HStack>
    );
}
