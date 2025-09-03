'use client';

import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipContent() {
    return (
        <div className="flex flex-wrap gap-4">
            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>간단한 텍스트</Button>} />
                <Tooltip.Content>간단한 툴팁 메시지</Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>긴 텍스트</Button>} />
                <Tooltip.Content>
                    이것은 더 긴 툴팁 메시지입니다. 여러 줄에 걸쳐 표시될 수 있으며 유용한 정보를
                    제공합니다.
                </Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>포맷된 텍스트</Button>} />
                <Tooltip.Content>
                    <div className="space-y-1">
                        <div className="font-bold">제목</div>
                        <div className="text-sm">설명 텍스트가 여기에 있습니다.</div>
                        <div className="text-xs text-gray-600">추가 정보</div>
                    </div>
                </Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>키보드 단축키</Button>} />
                <Tooltip.Content>
                    <div className="flex items-center gap-2">
                        <span>저장하기</span>
                        <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 rounded">Ctrl+S</kbd>
                    </div>
                </Tooltip.Content>
            </Tooltip.Root>
        </div>
    );
}
