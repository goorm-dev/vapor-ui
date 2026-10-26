import { HStack, Text, Toggle, VStack } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function ToggleVariant() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    default
                </Text>
                <Toggle variant="default" defaultPressed aria-label="즐겨찾기">
                    <HeartIcon />
                </Toggle>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    accent
                </Text>
                <Toggle variant="accent" defaultPressed aria-label="즐겨찾기">
                    <HeartIcon />
                </Toggle>
            </HStack>
        </VStack>
    );
}
