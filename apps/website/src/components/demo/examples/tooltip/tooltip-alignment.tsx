import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipAlignment() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">하단 정렬</h4>
                <div className="flex gap-4">
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>시작</Button>} />
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive side="bottom" align="start" />
                            }
                        >
                            시작 위치에 정렬된 툴팁
                        </Tooltip.Popup>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>중앙</Button>} />
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive side="bottom" align="center" />
                            }
                        >
                            중앙에 정렬된 툴팁
                        </Tooltip.Popup>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>끝</Button>} />
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive side="bottom" align="end" />
                            }
                        >
                            끝 위치에 정렬된 툴팁
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-4">우측 정렬</h4>
                <div className="flex flex-col gap-4">
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>시작</Button>} />
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive side="right" align="start" />
                            }
                        >
                            상단 시작 위치
                        </Tooltip.Popup>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>중앙</Button>} />
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive side="right" align="center" />
                            }
                        >
                            중앙 위치
                        </Tooltip.Popup>
                    </Tooltip.Root>

                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>끝</Button>} />
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive side="right" align="end" />
                            }
                        >
                            하단 끝 위치
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </div>
            </div>
        </div>
    );
}
