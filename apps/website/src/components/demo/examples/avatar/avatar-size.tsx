import { Avatar, HStack, Text, VStack } from '@vapor-ui/core';

import { VAPOR_LOGO_URL } from '~/constants/image-urls';

export default function AvatarSize() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Avatar.Root size="sm" alt="Vapor" src={VAPOR_LOGO_URL} />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Avatar.Root size="md" alt="Vapor" src={VAPOR_LOGO_URL} />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Avatar.Root size="lg" alt="Vapor" src={VAPOR_LOGO_URL} />
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Avatar.Root size="xl" alt="Vapor" src={VAPOR_LOGO_URL} />
            </HStack>
        </VStack>
    );
}
