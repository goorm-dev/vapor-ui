import * as React from 'react';

import { Collapsible, Text } from '@vapor-ui/core';
import { ChevronRightOutlineIcon } from '@vapor-ui/icons';

export default function DefaultCollapsible() {
    return (
        <Collapsible.Root className="flex min-h-36 w-64 flex-col justify-center text-v-gray-900">
            <Collapsible.Trigger className="group flex items-center gap-2 rounded-sm bg-v-blue-100 px-3 py-2 text-sm font-medium hover:bg-v-blue-200 focus-visible:outline-2 focus-visible:outline-v-blue-600 active:bg-v-blue-200">
                <ChevronRightOutlineIcon className="size-3 transition-all ease-out group-data-[panel-open]:rotate-90" />
                프로젝트 메뉴
            </Collapsible.Trigger>
            <Collapsible.Panel className="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-all ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
                <div className="mt-1 flex cursor-text flex-col gap-2 rounded-sm bg-v-blue-50 py-3 pl-6">
                    <Text foreground="normal-200">• 대시보드</Text>
                    <Text foreground="normal-200">• 작업 관리</Text>
                    <Text foreground="normal-200">• 팀원 초대</Text>
                </div>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
}
