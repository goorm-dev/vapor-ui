import { Button, HStack, Text, Tooltip, VStack } from '@vapor-ui/core';

export default function TooltipDelay() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    0ms
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger delay={0} render={<Button>즉시 표시</Button>} />
                    <Tooltip.Popup>지연 없이 바로 표시되는 툴팁</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    500ms
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger delay={500} render={<Button>0.5초 지연</Button>} />
                    <Tooltip.Popup>0.5초 후에 표시되는 툴팁</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    1000ms
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger delay={1000} render={<Button>1초 지연</Button>} />
                    <Tooltip.Popup>1초 후에 표시되는 툴팁</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    2000ms
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger delay={2000} render={<Button>2초 지연</Button>} />
                    <Tooltip.Popup>2초 후에 표시되는 툴팁</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
        </VStack>
    );
}
