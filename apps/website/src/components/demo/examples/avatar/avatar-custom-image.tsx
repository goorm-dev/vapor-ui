import { Avatar, HStack, Text, VStack } from '@vapor-ui/core';

const IMAGE_URL = 'https://avatars.githubusercontent.com/u/217160984?v=4';

export default function AvatarCustomImage() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-40" typography="body3" foreground="hint-100">
                    ImagePrimitive
                </Text>
                <Avatar.Root src={IMAGE_URL} alt="User" crossOrigin="anonymous">
                    <Avatar.ImagePrimitive className="my-image" />
                    <Avatar.FallbackPrimitive />
                </Avatar.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-40" typography="body3" foreground="hint-100">
                    FallbackPrimitive
                </Text>
                <Avatar.Root alt="User">
                    <Avatar.ImagePrimitive />
                    <Avatar.FallbackPrimitive>JD</Avatar.FallbackPrimitive>
                </Avatar.Root>
            </HStack>
        </VStack>
    );
}
