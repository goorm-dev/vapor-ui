import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function VStackSpacing() {
    return (
        <HStack $styles={{ gap: '$400', alignItems: 'start' }}>
            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    $100
                </Text>
                <VStack $styles={{ gap: '$100' }}>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    $400
                </Text>
                <VStack $styles={{ gap: '$400' }}>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </VStack>
            </VStack>

            <VStack $styles={{ gap: '$150' }}>
                <Text typography="body3" foreground="hint-100">
                    $800
                </Text>
                <VStack $styles={{ gap: '$800' }}>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-teal-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-teal-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$basic-teal-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
}
