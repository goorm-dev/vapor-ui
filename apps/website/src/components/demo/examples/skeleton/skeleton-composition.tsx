import { Box, HStack, Skeleton, VStack } from '@vapor-ui/core';

export default function SkeletonComposition() {
    return (
        <Box padding="$200" border="1px solid" borderColor="$normal" borderRadius="$100" maxWidth="320px">
            <HStack gap="$150" alignItems="center">
                <Skeleton shape="rounded" width="40px" height="40px" />
                <VStack gap="$075">
                    <Skeleton shape="rounded" size="sm" width="120px" />
                    <Skeleton shape="rounded" size="sm" width="80px" />
                </VStack>
            </HStack>
            <VStack gap="$075" marginTop="$200">
                <Skeleton shape="square" size="sm" />
                <Skeleton shape="square" size="sm" width="90%" />
                <Skeleton shape="square" size="sm" width="75%" />
            </VStack>
        </Box>
    );
}
