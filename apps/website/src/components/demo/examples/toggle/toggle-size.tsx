import { HStack, Text, Toggle, VStack } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function ToggleSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Toggle size="sm" aria-label="즐겨찾기">
                    <HeartIcon />
                </Toggle>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Toggle size="md" aria-label="즐겨찾기">
                    <HeartIcon />
                </Toggle>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Toggle size="lg" aria-label="즐겨찾기">
                    <HeartIcon />
                </Toggle>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Toggle size="xl" aria-label="즐겨찾기">
                    <HeartIcon />
                </Toggle>
            </HStack>
        </VStack>
    );
}
