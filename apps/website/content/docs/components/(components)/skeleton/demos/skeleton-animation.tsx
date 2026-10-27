import { HStack, Skeleton, Text, VStack } from '@vapor-ui/core';

export default function SkeletonAnimation() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '80px' }}>
                    shimmer
                </Text>
                <Skeleton animation="shimmer" />
            </HStack>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '80px' }}>
                    pulse
                </Text>
                <Skeleton animation="pulse" />
            </HStack>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '80px' }}>
                    none
                </Text>
                <Skeleton animation="none" />
            </HStack>
        </VStack>
    );
}
