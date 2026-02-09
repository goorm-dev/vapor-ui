import { Badge, HStack, Text, VStack } from '@vapor-ui/core';

export default function BadgeColor() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    primary
                </Text>
                <Badge colorPalette="primary">New</Badge>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    hint
                </Text>
                <Badge colorPalette="hint">New</Badge>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    danger
                </Text>
                <Badge colorPalette="danger">New</Badge>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    success
                </Text>
                <Badge colorPalette="success">New</Badge>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    warning
                </Text>
                <Badge colorPalette="warning">New</Badge>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    contrast
                </Text>
                <Badge colorPalette="contrast">New</Badge>
            </HStack>
        </VStack>
    );
}
