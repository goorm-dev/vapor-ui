import { Avatar, HStack, Text, VStack } from '@vapor-ui/core';

import { VAPOR_LOGO_URL } from '~/constants/image-urls';

export default function AvatarShape() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-14" typography="body3" foreground="hint-100">
                    square
                </Text>
                <Avatar.Root shape="square" alt="Vapor" src={VAPOR_LOGO_URL} />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-14" typography="body3" foreground="hint-100">
                    circle
                </Text>
                <Avatar.Root shape="circle" alt="Vapor" src={VAPOR_LOGO_URL} />
            </HStack>
        </VStack>
    );
}
