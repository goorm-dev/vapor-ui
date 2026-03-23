import { HStack, Skeleton, Text, VStack } from '@vapor-ui/core';

export default function SkeletonShape() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '80px' }}>
                    rounded
                </Text>
                <Skeleton shape="rounded" $css={{ width: '200px' }} />
            </HStack>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Text typography="body3" foreground="hint-100" $css={{ width: '80px' }}>
                    square
                </Text>
                <Skeleton shape="square" $css={{ width: '200px' }} />
            </HStack>
        </VStack>
    );
}
