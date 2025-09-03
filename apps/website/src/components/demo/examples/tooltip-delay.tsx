import { Button, Tooltip } from '@vapor-ui/core';

export default function TooltipDelay() {
    return (
        <div className="flex gap-4">
            <Tooltip.Root delay={0}>
                <Tooltip.Trigger render={<Button>즉시 표시</Button>} />
                <Tooltip.Content>지연 없이 바로 표시되는 툴팁</Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root delay={500}>
                <Tooltip.Trigger render={<Button>0.5초 지연</Button>} />
                <Tooltip.Content>0.5초 후에 표시되는 툴팁</Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root delay={1000}>
                <Tooltip.Trigger render={<Button>1초 지연</Button>} />
                <Tooltip.Content>1초 후에 표시되는 툴팁</Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root delay={2000}>
                <Tooltip.Trigger render={<Button>2초 지연</Button>} />
                <Tooltip.Content>2초 후에 표시되는 툴팁</Tooltip.Content>
            </Tooltip.Root>
        </div>
    );
}
