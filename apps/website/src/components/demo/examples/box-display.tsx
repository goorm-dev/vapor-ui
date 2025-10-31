import { Box, Text } from '@vapor-ui/core';

export default function BoxDisplay() {
    return (
        <div className="flex flex-col gap-6">
            <Text typography="heading4" render={<h4 />}>
                Display Types
            </Text>
            <div className="flex flex-col gap-4">
                <div>
                    <Text>Block (default)</Text>
                    <Box
                        display="block"
                        padding="$300"
                        backgroundColor="$blue-200"
                        borderRadius="$200"
                    >
                        Block element takes full width
                    </Box>
                </div>

                <div>
                    <Text>Inline</Text>
                    <Box
                        display="inline"
                        padding="$200"
                        backgroundColor="$green-200"
                        borderRadius="$200"
                    >
                        Inline element
                    </Box>
                    <span className="mx-2">flows with text</span>
                    <Box
                        display="inline"
                        padding="$200"
                        backgroundColor="$green-200"
                        borderRadius="$200"
                    >
                        like this
                    </Box>
                </div>

                <div>
                    <Text>Flex Container</Text>
                    <Box
                        display="flex"
                        gap="$200"
                        padding="$300"
                        backgroundColor="$grape-200"
                        borderRadius="$200"
                    >
                        <Box
                            padding="$200"
                            backgroundColor="$grape-400"
                            borderRadius="$100"
                            textColor="$contrast-100"
                        >
                            Item 1
                        </Box>
                        <Box
                            padding="$200"
                            backgroundColor="$grape-400"
                            borderRadius="$100"
                            textColor="$contrast-100"
                        >
                            Item 2
                        </Box>
                        <Box
                            padding="$200"
                            backgroundColor="$grape-400"
                            borderRadius="$100"
                            textColor="$contrast-100"
                        >
                            Item 3
                        </Box>
                    </Box>
                </div>

                <div>
                    <Text>Grid Container</Text>
                    <Box
                        display="grid"
                        padding="$300"
                        backgroundColor="$orange-200"
                        borderRadius="$200"
                        gap="$200"
                        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                    >
                        <Box
                            padding="$200"
                            backgroundColor="$orange-400"
                            borderRadius="$100"
                            textColor="$contrast-100"
                        >
                            A
                        </Box>
                        <Box
                            padding="$200"
                            backgroundColor="$orange-400"
                            borderRadius="$100"
                            textColor="$contrast-100"
                        >
                            B
                        </Box>
                        <Box
                            padding="$200"
                            backgroundColor="$orange-400"
                            borderRadius="$100"
                            textColor="$contrast-100"
                        >
                            C
                        </Box>
                    </Box>
                </div>
            </div>
        </div>
    );
}
