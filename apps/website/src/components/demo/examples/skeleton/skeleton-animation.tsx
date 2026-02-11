import { HStack, Skeleton, Text, VStack } from '@vapor-ui/core';

export default function SkeletonAnimation() {
    return (
        <VStack gap="$150">
            <HStack gap="$200" alignItems="center">
                <Text width="80px" typography="body3" foreground="hint-100">
                    shimmer
                </Text>
                <Skeleton animation="shimmer" />
            </HStack>
            <HStack gap="$200" alignItems="center">
                <Text width="80px" typography="body3" foreground="hint-100">
                    pulse
                </Text>
                <Skeleton animation="pulse" />
            </HStack>
            <HStack gap="$200" alignItems="center">
                <Text width="80px" typography="body3" foreground="hint-100">
                    none
                </Text>
                <Skeleton animation="none" />
            </HStack>
        </VStack>
    );
}
