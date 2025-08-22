import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipOffset() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">Side Offset (거리 조정)</h4>
                <div className="flex gap-4">
                    <Tooltip.Root sideOffset={0}>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>거리 0px</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root sideOffset={10}>
                        <Tooltip.Trigger render={<Button>10px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>거리 10px</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root sideOffset={20}>
                        <Tooltip.Trigger render={<Button>20px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>거리 20px</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">Align Offset (정렬 오프셋)</h4>
                <div className="flex gap-4">
                    <Tooltip.Root alignOffset={-20}>
                        <Tooltip.Trigger render={<Button>-20px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>정렬 오프셋 -20px</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root alignOffset={0}>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>정렬 오프셋 0px</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root alignOffset={20}>
                        <Tooltip.Trigger render={<Button>+20px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Content>정렬 오프셋 +20px</Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </div>
            </div>
        </div>
    );
}
