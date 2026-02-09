import { Badge, HStack, Text, VStack } from '@vapor-ui/core';

export default function BadgeSize() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Badge size="sm">New</Badge>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Badge size="md">New</Badge>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Badge size="lg">New</Badge>
            </HStack>
        </VStack>
    );
}
