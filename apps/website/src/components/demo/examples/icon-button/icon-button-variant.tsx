import { HStack, IconButton, Text, VStack } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function IconButtonVariant() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    fill
                </Text>
                <IconButton variant="fill" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    outline
                </Text>
                <IconButton variant="outline" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    ghost
                </Text>
                <IconButton variant="ghost" aria-label="Like">
                    <HeartIcon />
                </IconButton>
            </HStack>
        </VStack>
    );
}
