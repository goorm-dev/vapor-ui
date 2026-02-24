import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function BoxSpacing() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-28" typography="body3" foreground="hint-100">
                    padding
                </Text>
                <Box
                    $css={{
                        padding: '$400',
                        backgroundColor: '$basic-blue-200',
                        borderRadius: '$200',
                    }}
                >
                    Content with padding
                </Box>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-28" typography="body3" foreground="hint-100">
                    margin
                </Text>
                <Box
                    $css={{
                        margin: '$400',
                        padding: '$300',
                        backgroundColor: '$basic-green-200',
                        borderRadius: '$200',
                    }}
                >
                    Content with margin
                </Box>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-28" typography="body3" foreground="hint-100">
                    paddingX/Y
                </Text>
                <Box
                    $css={{
                        paddingInline: '$500',
                        paddingBlock: '$200',
                        backgroundColor: '$basic-grape-100',
                        borderRadius: '$200',
                    }}
                >
                    Horizontal padding
                </Box>
            </HStack>

            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-28" typography="body3" foreground="hint-100">
                    marginX/Y
                </Text>
                <Box
                    $css={{
                        marginInline: '$300',
                        marginBlock: '$100',
                        padding: '$300',
                        backgroundColor: '$basic-grape-200',
                        borderRadius: '$200',
                    }}
                >
                    Asymmetric margins
                </Box>
            </HStack>
        </VStack>
    );
}
