import { HStack, Text, Toggle, VStack } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function TogglePressed() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    unpressed
                </Text>
                <Toggle aria-label="즐겨찾기">
                    <HeartIcon />
                </Toggle>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-24" typography="body3" foreground="hint-100">
                    pressed
                </Text>
                <Toggle defaultPressed aria-label="즐겨찾기">
                    <HeartIcon />
                </Toggle>
            </HStack>
        </VStack>
    );
}
