import { HStack, IconButton, Text, VStack } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonSize() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <IconButton size="sm" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    md
                </Text>
                <IconButton size="md" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <IconButton size="lg" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-8" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <IconButton size="xl" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
        </VStack>
    );
}
