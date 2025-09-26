import { useState } from 'react';

import { Button, Collapsible, HStack } from '@vapor-ui/core';

export default function CollapsibleOpenState() {
    const [open, setOpen] = useState(false);

    return (
        <HStack gap="$300">
            <Collapsible.Root defaultOpen className="w-72 h-48">
                <h4 className="text-lg font-medium mb-3">Uncontrolled (defaultOpen)</h4>
                <Collapsible.Trigger className="px-4 py-2 bg-v-green-500 text-v-white rounded hover:bg-v-green-600 transition-colors">
                    기본적으로 열려있음
                </Collapsible.Trigger>
                <Collapsible.Panel>
                    <div className="p-4 border border-v-gray-200 rounded bg-v-green-50 mt-2">
                        이 패널은 처음에 열린 상태로 시작합니다.
                    </div>
                </Collapsible.Panel>
            </Collapsible.Root>

            <Collapsible.Root open={open} onOpenChange={setOpen} className="w-72 h-48">
                <h4 className="text-lg font-medium mb-3">Controlled</h4>

                <Collapsible.Trigger className="px-4 py-2 bg-v-blue-500 text-v-white rounded hover:bg-v-blue-600 transition-colors">
                    제어되는 Collapsible
                </Collapsible.Trigger>
                <Collapsible.Panel className=" ">
                    <div className="p-4 border border-v-gray-200 rounded mt-2 bg-v-blue-50">
                        이 패널의 상태는 외부에서 제어됩니다.
                    </div>
                </Collapsible.Panel>

                <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => setOpen(true)}>
                        열기
                    </Button>
                    <Button size="sm" onClick={() => setOpen(false)}>
                        닫기
                    </Button>
                    <span className="text-sm text-v-gray-600 flex items-center">
                        현재 상태: {open ? '열림' : '닫힘'}
                    </span>
                </div>
            </Collapsible.Root>
        </HStack>
    );
}
