import { Button, HStack, Text, Tooltip, VStack } from '@vapor-ui/core';

export default function TooltipPositioning() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    top
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>상단</Button>} />
                    <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="top" />}>
                        상단에 표시되는 툴팁
                    </Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    right
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>우측</Button>} />
                    <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="right" />}>
                        우측에 표시되는 툴팁
                    </Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    bottom
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>하단</Button>} />
                    <Tooltip.Popup
                        positionerElement={<Tooltip.PositionerPrimitive side="bottom" />}
                    >
                        하단에 표시되는 툴팁
                    </Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    left
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>좌측</Button>} />
                    <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="left" />}>
                        좌측에 표시되는 툴팁
                    </Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
        </VStack>
    );
}
