import { HStack, Skeleton, Text, VStack } from '@vapor-ui/core';

export default function SkeletonSize() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '40px' }}>
                    sm
                </Text>
                <Skeleton size="sm" />
            </HStack>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '40px' }}>
                    md
                </Text>
                <Skeleton size="md" />
            </HStack>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '40px' }}>
                    lg
                </Text>
                <Skeleton size="lg" />
            </HStack>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '40px' }}>
                    xl
                </Text>
                <Skeleton size="xl" />
            </HStack>
        </VStack>
    );
}
