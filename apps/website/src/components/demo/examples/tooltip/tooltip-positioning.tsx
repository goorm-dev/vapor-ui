import { Button, HStack, Text, Tooltip, VStack } from '@vapor-ui/core';

export default function TooltipPositioning() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    top
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>상단</Button>} />
                    <Tooltip.PortalPrimitive>
                        <Tooltip.PositionerPrimitive side="top">
                            <Tooltip.PopupPrimitive>상단에 표시되는 툴팁</Tooltip.PopupPrimitive>
                        </Tooltip.PositionerPrimitive>
                    </Tooltip.PortalPrimitive>
                </Tooltip.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    right
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>우측</Button>} />
                    <Tooltip.PortalPrimitive>
                        <Tooltip.PositionerPrimitive side="right">
                            <Tooltip.PopupPrimitive>우측에 표시되는 툴팁</Tooltip.PopupPrimitive>
                        </Tooltip.PositionerPrimitive>
                    </Tooltip.PortalPrimitive>
                </Tooltip.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    bottom
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>하단</Button>} />
                    <Tooltip.PortalPrimitive>
                        <Tooltip.PositionerPrimitive side="bottom">
                            <Tooltip.PopupPrimitive>하단에 표시되는 툴팁</Tooltip.PopupPrimitive>
                        </Tooltip.PositionerPrimitive>
                    </Tooltip.PortalPrimitive>
                </Tooltip.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    left
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>좌측</Button>} />
                    <Tooltip.PortalPrimitive>
                        <Tooltip.PositionerPrimitive side="left">
                            <Tooltip.PopupPrimitive>좌측에 표시되는 툴팁</Tooltip.PopupPrimitive>
                        </Tooltip.PositionerPrimitive>
                    </Tooltip.PortalPrimitive>
                </Tooltip.Root>
            </HStack>
        </VStack>
    );
}
