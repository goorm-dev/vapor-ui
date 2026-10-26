import { Button, HStack, Text, Tooltip, VStack } from '@vapor-ui/core';

export default function TooltipAlignment() {
    return (
        <HStack $css={{ gap: '$400' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    Bottom Alignment
                </Text>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        start
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>시작</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive side="bottom" align="start">
                                <Tooltip.PopupPrimitive>
                                    시작 위치에 정렬된 툴팁
                                </Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        center
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>중앙</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive side="bottom" align="center">
                                <Tooltip.PopupPrimitive>중앙에 정렬된 툴팁</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        end
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>끝</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive side="bottom" align="end">
                                <Tooltip.PopupPrimitive>
                                    끝 위치에 정렬된 툴팁
                                </Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    Right Alignment
                </Text>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        start
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>시작</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive side="right" align="start">
                                <Tooltip.PopupPrimitive>상단 시작 위치</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        center
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>중앙</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive side="right" align="center">
                                <Tooltip.PopupPrimitive>중앙 위치</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        end
                    </Text>
                    <Tooltip.Root>
                        <Tooltip.Trigger render={<Button>끝</Button>} />
                        <Tooltip.PortalPrimitive>
                            <Tooltip.PositionerPrimitive side="right" align="end">
                                <Tooltip.PopupPrimitive>하단 끝 위치</Tooltip.PopupPrimitive>
                            </Tooltip.PositionerPrimitive>
                        </Tooltip.PortalPrimitive>
                    </Tooltip.Root>
                </HStack>
            </VStack>
        </HStack>
    );
}
