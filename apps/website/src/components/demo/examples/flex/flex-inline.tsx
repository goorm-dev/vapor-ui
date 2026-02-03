import { Box, Flex, Text, VStack } from '@vapor-ui/core';

export default function FlexInline() {
    return (
        <VStack gap="$200">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    inline flex
                </Text>
                <Box>
                    <Text render={<span />}>Text before </Text>
                    <Flex
                        inline
                        gap="$100"
                        padding="$200"
                        backgroundColor="$blue-100"
                        borderRadius="$200"
                    >
                        <Box
                            padding="$100"
                            backgroundColor="$blue-400"
                            borderRadius="$050"
                            color="$contrast-100"
                        >
                            Inline
                        </Box>
                        <Box
                            padding="$100"
                            backgroundColor="$green-400"
                            borderRadius="$050"
                            color="$contrast-100"
                        >
                            Flex
                        </Box>
                    </Flex>
                    <Text render={<span />}> text after</Text>
                </Box>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    block flex (default)
                </Text>
                <Flex gap="$200" padding="$300" backgroundColor="$gray-100" borderRadius="$200">
                    <Box
                        padding="$200"
                        backgroundColor="$blue-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        Block
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$green-400"
                        borderRadius="$100"
                        color="$contrast-100"
                    >
                        Flex
                    </Box>
                </Flex>
            </VStack>
        </VStack>
    );
}
