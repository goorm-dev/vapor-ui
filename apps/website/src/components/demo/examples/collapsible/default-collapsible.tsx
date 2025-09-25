import * as React from 'react';

import { Collapsible, Text, VStack } from '@vapor-ui/core';
import { ChevronRightOutlineIcon } from '@vapor-ui/icons';

export default function DefaultCollapsible() {
    return (
        <Collapsible.Root className="flex min-h-36 w-64 flex-col justify-center text-v-gray-900">
            <Collapsible.Trigger className="group flex items-center gap-2 rounded-sm bg-v-blue-100 px-3 py-2 text-sm font-medium hover:bg-v-blue-200 focus-visible:outline-2 focus-visible:outline-v-blue-600 active:bg-v-blue-200">
                <ChevronRightOutlineIcon className="size-3 transition-all ease-out group-data-[panel-open]:rotate-90" />
                프로젝트 메뉴
            </Collapsible.Trigger>
            <Collapsible.Panel className="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-all ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
                <VStack
                    gap="$050"
                    backgroundColor="$blue-050"
                    paddingY="$150"
                    paddingLeft="$300"
                    marginTop="$050"
                    className="cursor-text rounded-sm"
                >
                    <Text foreground="normal">• 대시보드</Text>
                    <Text foreground="normal">• 작업 관리</Text>
                    <Text foreground="normal">• 팀원 초대</Text>
                </VStack>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
}
