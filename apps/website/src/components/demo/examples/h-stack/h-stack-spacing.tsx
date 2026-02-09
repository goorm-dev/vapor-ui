import { Box, HStack, Text, VStack } from '@vapor-ui/core';

export default function HStackSpacing() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $100
                </Text>
                <HStack $styles={{ gap: '$100' }}>
                    <Box
                        $styles={{
                            backgroundColor: '$red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$red-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </HStack>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $400
                </Text>
                <HStack $styles={{ gap: '$400' }}>
                    <Box
                        $styles={{
                            backgroundColor: '$orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$orange-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </HStack>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    $800
                </Text>
                <HStack $styles={{ gap: '$800' }}>
                    <Box
                        $styles={{
                            backgroundColor: '$teal-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        A
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$teal-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        B
                    </Box>
                    <Box
                        $styles={{
                            backgroundColor: '$teal-100',
                            padding: '$200',
                            borderRadius: '$200',
                        }}
                    >
                        C
                    </Box>
                </HStack>
            </HStack>
        </VStack>
    );
}
