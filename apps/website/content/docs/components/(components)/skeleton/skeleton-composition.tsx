import { Box, HStack, Skeleton, VStack } from '@vapor-ui/core';

export default function SkeletonComposition() {
    return (
        <Box
            $css={{
                border: '1px solid',
                borderColor: '$border-normal',
                borderRadius: '$100',
                padding: '$200',
                maxWidth: '320px',
            }}
        >
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Skeleton shape="rounded" $css={{ width: '40px', height: '40px' }} />
                <VStack $css={{ gap: '$075' }}>
                    <Skeleton shape="rounded" size="sm" $css={{ width: '120px' }} />
                    <Skeleton shape="rounded" size="sm" $css={{ width: '80px' }} />
                </VStack>
            </HStack>
            <VStack $css={{ gap: '$075', marginTop: '$200' }}>
                <Skeleton shape="square" size="sm" />
                <Skeleton shape="square" size="sm" $css={{ width: '90%' }} />
                <Skeleton shape="square" size="sm" $css={{ width: '75%' }} />
            </VStack>
        </Box>
    );
}
