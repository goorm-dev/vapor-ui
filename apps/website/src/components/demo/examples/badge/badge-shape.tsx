import { Badge, HStack, Text, VStack } from '@vapor-ui/core';

export default function BadgeShape() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-12" typography="body3" foreground="hint-100">
                    square
                </Text>
                <Badge shape="square">New</Badge>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-12" typography="body3" foreground="hint-100">
                    pill
                </Text>
                <Badge shape="pill">New</Badge>
            </HStack>
        </VStack>
    );
}
