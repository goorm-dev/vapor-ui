import { Avatar, HStack } from '@vapor-ui/core';

export default function AvatarFallback() {
    return (
        <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
            <Avatar.Root alt="John Doe" />
            <Avatar.Root alt="Alice Kim" />
            <Avatar.Root alt="Mike Park" />
        </HStack>
    );
}
