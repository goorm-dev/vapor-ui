import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipPositioning() {
    return (
        <div className="flex flex-wrap gap-4">
            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>상단</Button>} />
                <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="top" />}>
                    상단에 표시되는 툴팁
                </Tooltip.Popup>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>우측</Button>} />
                <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="right" />}>
                    우측에 표시되는 툴팁
                </Tooltip.Popup>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>하단</Button>} />
                <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="bottom" />}>
                    하단에 표시되는 툴팁
                </Tooltip.Popup>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>좌측</Button>} />
                <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="left" />}>
                    좌측에 표시되는 툴팁
                </Tooltip.Popup>
            </Tooltip.Root>
        </div>
    );
}
