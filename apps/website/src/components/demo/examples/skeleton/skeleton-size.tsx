import { HStack, Skeleton, Text, VStack } from '@vapor-ui/core';

export default function SkeletonSize() {
    return (
        <VStack gap="$150">
            <HStack gap="$200" alignItems="center">
                <Text width="40px" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Skeleton size="sm" />
            </HStack>
            <HStack gap="$200" alignItems="center">
                <Text width="40px" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Skeleton size="md" />
            </HStack>
            <HStack gap="$200" alignItems="center">
                <Text width="40px" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Skeleton size="lg" />
            </HStack>
            <HStack gap="$200" alignItems="center">
                <Text width="40px" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Skeleton size="xl" />
            </HStack>
        </VStack>
    );
}
