import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipPositioning() {
    return (
        <div className="flex flex-wrap gap-4">
            <Tooltip.Root side="top">
                <Tooltip.Trigger render={<Button>상단</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Content>상단에 표시되는 툴팁</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root side="right">
                <Tooltip.Trigger render={<Button>우측</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Content>우측에 표시되는 툴팁</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root side="bottom">
                <Tooltip.Trigger render={<Button>하단</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Content>하단에 표시되는 툴팁</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root side="left">
                <Tooltip.Trigger render={<Button>좌측</Button>} />
                <Tooltip.Portal>
                    <Tooltip.Content>좌측에 표시되는 툴팁</Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </div>
    );
}
