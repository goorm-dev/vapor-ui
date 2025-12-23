import { Box } from '@vapor-ui/core';

export default function BoxLayout() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h4 className="mb-2 text-sm font-medium">Flex Direction</h4>
                <div className="flex flex-col gap-4">
                    <Box
                        display="flex"
                        flexDirection="row"
                        gap="$200"
                        padding="$300"
                        backgroundColor="$gray-100"
                        borderRadius="$200"
                    >
                        <Box padding="$200" backgroundColor="$blue-300" borderRadius="$100">
                            1
                        </Box>
                        <Box padding="$200" backgroundColor="$blue-300" borderRadius="$100">
                            2
                        </Box>
                        <Box padding="$200" backgroundColor="$blue-300" borderRadius="$100">
                            3
                        </Box>
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="$200"
                        padding="$300"
                        backgroundColor="$gray-100"
                        borderRadius="$200"
                    >
                        <Box padding="$200" backgroundColor="$green-300" borderRadius="$100">
                            A
                        </Box>
                        <Box padding="$200" backgroundColor="$green-300" borderRadius="$100">
                            B
                        </Box>
                        <Box padding="$200" backgroundColor="$green-300" borderRadius="$100">
                            C
                        </Box>
                    </Box>
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Justify Content</h4>
                <div className="flex flex-col gap-2">
                    <Box
                        display="flex"
                        justifyContent="flex-start"
                        gap="$200"
                        padding="$300"
                        backgroundColor="$gray-100"
                        borderRadius="$200"
                    >
                        <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                            Start
                        </Box>
                        <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                            Items
                        </Box>
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="center"
                        gap="$200"
                        padding="$300"
                        backgroundColor="$gray-100"
                        borderRadius="$200"
                    >
                        <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                            Center
                        </Box>
                        <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                            Items
                        </Box>
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        gap="$200"
                        padding="$300"
                        backgroundColor="$gray-100"
                        borderRadius="$200"
                    >
                        <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                            Space
                        </Box>
                        <Box padding="$200" backgroundColor="$grape-300" borderRadius="$100">
                            Between
                        </Box>
                    </Box>
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Align Items</h4>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-around"
                    gap="$200"
                    padding="$300"
                    backgroundColor="$gray-100"
                    borderRadius="$200"
                    height="$800"
                >
                    <Box
                        padding="$200"
                        backgroundColor="$orange-300"
                        borderRadius="$100"
                        height="$500"
                    >
                        Small
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-300"
                        borderRadius="$100"
                        height="$600"
                    >
                        Medium
                    </Box>
                    <Box
                        padding="$200"
                        backgroundColor="$orange-300"
                        borderRadius="$100"
                        height="$700"
                    >
                        Aligned
                    </Box>
                </Box>
            </div>
        </div>
    );
}
