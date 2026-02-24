import { Avatar, HStack, Text, VStack } from '@vapor-ui/core';

export default function AvatarCustomFallback() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-28" typography="body3" foreground="hint-100">
                    auto initial
                </Text>
                <Avatar.Root alt="John Doe">
                    <Avatar.FallbackPrimitive />
                </Avatar.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-28" typography="body3" foreground="hint-100">
                    custom text
                </Text>
                <Avatar.Root alt="John Doe">
                    <Avatar.FallbackPrimitive>JD</Avatar.FallbackPrimitive>
                </Avatar.Root>
            </HStack>
        </VStack>
    );
}
