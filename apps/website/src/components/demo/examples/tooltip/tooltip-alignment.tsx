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
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive side="bottom" align="start" />
                            }
                        >
                            시작 위치에 정렬된 툴팁
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        center
                    </Text>
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
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        end
                    </Text>
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
                        <Tooltip.Popup
                            positionerElement={
                                <Tooltip.PositionerPrimitive side="right" align="start" />
                            }
                        >
                            상단 시작 위치
                        </Tooltip.Popup>
                    </Tooltip.Root>
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        center
                    </Text>
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
                </HStack>
                <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        end
                    </Text>
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
                </HStack>
            </VStack>
        </HStack>
    );
}
