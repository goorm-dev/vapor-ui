import { Button, HStack, Text, Tooltip, VStack } from '@vapor-ui/core';

export default function TooltipOffset() {
    return (
        <HStack gap="$400">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    Side Offset
                </Text>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        0px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive sideOffset={0} />}
                        >
                            거리 0px
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        10px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>10px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive sideOffset={10} />}
                        >
                            거리 10px
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        20px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>20px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive sideOffset={20} />}
                        >
                            거리 20px
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    Align Offset
                </Text>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        -20px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>-20px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive alignOffset={-20} />}
                        >
                            정렬 오프셋 -20px
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        0px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive alignOffset={0} />}
                        >
                            정렬 오프셋 0px
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        +20px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>+20px</Button>} />
                        <Tooltip.Popup
                            positionerElement={<Tooltip.PositionerPrimitive alignOffset={20} />}
                        >
                            정렬 오프셋 +20px
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
            </VStack>
        </HStack>
    );
}
