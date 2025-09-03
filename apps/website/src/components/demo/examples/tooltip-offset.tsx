import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipOffset() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">Side Offset (거리 조정)</h4>
                <div className="flex gap-4">
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Positioner sideOffset={0}>
                                <Tooltip.Popup>거리 0px</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>10px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Positioner sideOffset={10}>
                                <Tooltip.Popup>거리 10px</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>20px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Positioner sideOffset={20}>
                                <Tooltip.Popup>거리 20px</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">Align Offset (정렬 오프셋)</h4>
                <div className="flex gap-4">
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>-20px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Positioner alignOffset={-20}>
                                <Tooltip.Popup>정렬 오프셋 -20px</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Positioner alignOffset={0}>
                                <Tooltip.Popup>정렬 오프셋 0px</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>+20px</Button>} />
                        <Tooltip.Portal>
                            <Tooltip.Positioner alignOffset={20}>
                                <Tooltip.Popup>정렬 오프셋 +20px</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </div>
            </div>
        </div>
    );
}
