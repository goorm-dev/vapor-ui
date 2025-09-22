import { Collapsible } from '@vapor-ui/core';

export default function CollapsibleKeepMounted() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-medium mb-3">기본 (DOM에서 제거됨)</h4>
                <Collapsible.Root>
                    <Collapsible.Trigger className="px-4 py-2 bg-v-purple-500 text-v-white rounded hover:bg-v-purple-600 transition-colors">
                        기본 동작
                    </Collapsible.Trigger>
                    <Collapsible.Panel className="mt-2 p-4 border border-v-gray-200 rounded bg-v-purple-50">
                        닫힌 상태에서는 DOM에서 제거됩니다.
                    </Collapsible.Panel>
                </Collapsible.Root>
            </div>

            <div>
                <h4 className="text-lg font-medium mb-3">keepMounted (DOM에 유지됨)</h4>
                <Collapsible.Root>
                    <Collapsible.Trigger className="px-4 py-2 bg-v-orange-500 text-v-white rounded hover:bg-v-orange-600 transition-colors">
                        keepMounted 사용
                    </Collapsible.Trigger>
                    <Collapsible.Panel
                        keepMounted
                        className="mt-2 p-4 border border-v-gray-200 rounded bg-v-orange-50"
                    >
                        닫힌 상태에서도 DOM에 유지됩니다.
                    </Collapsible.Panel>
                </Collapsible.Root>
            </div>
        </div>
    );
}
