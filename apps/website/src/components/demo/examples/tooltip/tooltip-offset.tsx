import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipOffset() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">Side Offset (거리 조정)</h4>
                <div className="flex gap-4">
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive sideOffset={0} />}
                        >
                            거리 0px
                        </Tooltip.Popup>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>10px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive sideOffset={10} />}
                        >
                            거리 10px
                        </Tooltip.Popup>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>20px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive sideOffset={20} />}
                        >
                            거리 20px
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">Align Offset (정렬 오프셋)</h4>
                <div className="flex gap-4">
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>-20px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive alignOffset={-20} />}
                        >
                            정렬 오프셋 -20px
                        </Tooltip.Popup>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive alignOffset={0} />}
                        >
                            정렬 오프셋 0px
                        </Tooltip.Popup>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>+20px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive alignOffset={20} />}
                        >
                            정렬 오프셋 +20px
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </div>
            </div>
        </div>
    );
}
