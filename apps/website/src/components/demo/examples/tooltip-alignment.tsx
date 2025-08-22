import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipAlignment() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">하단 정렬</h4>
                <div className="flex gap-4">
                    <Tooltip.Root side="bottom" align="start">
                        <Tooltip.Trigger render={<Button>시작</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>시작 위치에 정렬된 툴팁</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root side="bottom" align="center">
                        <Tooltip.Trigger render={<Button>중앙</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>중앙에 정렬된 툴팁</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root side="bottom" align="end">
                        <Tooltip.Trigger render={<Button>끝</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>끝 위치에 정렬된 툴팁</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">우측 정렬</h4>
                <div className="flex flex-col gap-4">
                    <Tooltip.Root side="right" align="start">
                        <Tooltip.Trigger render={<Button>시작</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>상단 시작 위치</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root side="right" align="center">
                        <Tooltip.Trigger render={<Button>중앙</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>중앙 위치</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root side="right" align="end">
                        <Tooltip.Trigger render={<Button>끝</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>하단 끝 위치</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </div>
            </div>
        </div>
    );
}
