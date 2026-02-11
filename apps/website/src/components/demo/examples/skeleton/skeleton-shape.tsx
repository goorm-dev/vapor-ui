import { HStack, Skeleton, Text, VStack } from '@vapor-ui/core';

export default function SkeletonShape() {
    return (
        <VStack gap="$150">
            <HStack gap="$200" alignItems="center">
                <Text width="80px" typography="body3" foreground="hint-100">
                    rounded
                </Text>
                <Skeleton shape="rounded" width="200px" />
            </HStack>
            <HStack gap="$200" alignItems="center">
                <Text width="80px" typography="body3" foreground="hint-100">
                    square
                </Text>
                <Skeleton shape="square" width="200px" />
            </HStack>
        </VStack>
    );
}
