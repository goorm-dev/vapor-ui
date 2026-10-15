import { Button, HStack, Text, Tooltip, VStack } from '@vapor-ui/core';

export default function TooltipOffset() {
    return (
        <HStack $css={{ gap: '$400' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    Side Offset
                </Text>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        0px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive sideOffset={0}>
                                <Tooltip.PopupPrimitive>거리 0px</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        10px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>10px</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive sideOffset={10}>
                                <Tooltip.PopupPrimitive>거리 10px</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        20px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>20px</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive sideOffset={20}>
                                <Tooltip.PopupPrimitive>거리 20px</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    Align Offset
                </Text>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        -20px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>-20px</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive alignOffset={-20}>
                                <Tooltip.PopupPrimitive>정렬 오프셋 -20px</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        0px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>0px</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive alignOffset={0}>
                                <Tooltip.PopupPrimitive>정렬 오프셋 0px</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-12" typography="body3" foreground="hint-100">
                        +20px
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>+20px</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive alignOffset={20}>
                                <Tooltip.PopupPrimitive>정렬 오프셋 +20px</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
            </VStack>
        </HStack>
    );
}
