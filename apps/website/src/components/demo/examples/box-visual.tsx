import { Box } from '@vapor-ui/core';

export default function BoxVisual() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h4 className="mb-2 text-sm font-medium">Border Radius</h4>
                <div className="flex items-center gap-4">
                    <Box padding="$400" backgroundColor="blue-200" borderRadius="$100">
                        Small Radius
                    </Box>
                    <Box padding="$400" backgroundColor="blue-300" borderRadius="$300">
                        Medium Radius
                    </Box>
                    <Box padding="$400" backgroundColor="blue-400" borderRadius="$600">
                        Large Radius
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="blue-500"
                        borderRadius="$900"
                        foregroundColor="$contrast"
                    >
                        Extra Large
                    </Box>
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Opacity Levels</h4>
                <div className="flex items-center gap-4">
                    <Box
                        padding="$400"
                        backgroundColor="green-500"
                        opacity="0.3"
                        borderRadius="$200"
                    >
                        30% Opacity
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="green-500"
                        opacity="0.6"
                        borderRadius="$200"
                    >
                        60% Opacity
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="green-500"
                        opacity="0.9"
                        borderRadius="$200"
                    >
                        90% Opacity
                    </Box>
                    <Box padding="$400" backgroundColor="green-500" borderRadius="$200">
                        Full Opacity
                    </Box>
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Text Alignment</h4>
                <div className="flex flex-col gap-2">
                    <Box
                        padding="$400"
                        backgroundColor="purple-100"
                        borderRadius="$200"
                        textAlign="left"
                        width="$600"
                    >
                        Left aligned text content
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="purple-200"
                        borderRadius="$200"
                        textAlign="center"
                        width="$600"
                    >
                        Center aligned text content
                    </Box>
                    <Box
                        padding="$400"
                        backgroundColor="purple-300"
                        borderRadius="$200"
                        textAlign="right"
                        width="$600"
                    >
                        Right aligned text content
                    </Box>
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Overflow Behavior</h4>
                <div className="flex gap-4">
                    <Box
                        width="$400"
                        height="$300"
                        padding="$300"
                        backgroundColor="orange-200"
                        borderRadius="$200"
                        overflow="hidden"
                    >
                        This is a long text that will be clipped when it overflows the container
                        bounds because overflow is set to hidden.
                    </Box>
                    <Box
                        width="$400"
                        height="$300"
                        padding="$300"
                        backgroundColor="orange-300"
                        borderRadius="$200"
                        overflow="scroll"
                    >
                        This is a long text that will show scrollbars when it overflows the
                        container bounds because overflow is set to scroll. You can scroll to see
                        the full content.
                    </Box>
                </div>
            </div>
        </div>
    );
}
