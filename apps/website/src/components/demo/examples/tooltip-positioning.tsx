import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipPositioning() {
    return (
        <div className="flex flex-wrap gap-4">
            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>상단</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Positioner side="top">
                        <Tooltip.Popup>상단에 표시되는 툴팁</Tooltip.Popup>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>우측</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Positioner side="right">
                        <Tooltip.Popup>우측에 표시되는 툴팁</Tooltip.Popup>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>하단</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Positioner side="bottom">
                        <Tooltip.Popup>하단에 표시되는 툴팁</Tooltip.Popup>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger render={<Button>좌측</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Positioner side="left">
                        <Tooltip.Popup>좌측에 표시되는 툴팁</Tooltip.Popup>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>
        </div>
    );
}
