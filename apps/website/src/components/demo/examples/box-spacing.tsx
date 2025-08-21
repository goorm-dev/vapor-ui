import { Box } from '@vapor-ui/core';

export default function BoxSpacing() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Box padding="$200" backgroundColor="blue-100" borderRadius="$200">
                    Small Padding
                </Box>
                <Box padding="$400" backgroundColor="blue-200" borderRadius="$200">
                    Medium Padding
                </Box>
                <Box padding="$600" backgroundColor="blue-300" borderRadius="$200">
                    Large Padding
                </Box>
            </div>
            
            <div className="flex items-center gap-4">
                <Box margin="$200" padding="$300" backgroundColor="green-100" borderRadius="$200">
                    Small Margin
                </Box>
                <Box margin="$400" padding="$300" backgroundColor="green-200" borderRadius="$200">
                    Medium Margin
                </Box>
                <Box margin="$600" padding="$300" backgroundColor="green-300" borderRadius="$200">
                    Large Margin
                </Box>
            </div>
            
            <div className="flex items-center gap-4">
                <Box paddingX="$500" paddingY="$200" backgroundColor="purple-100" borderRadius="$200">
                    Horizontal Padding
                </Box>
                <Box marginX="$300" marginY="$100" padding="$300" backgroundColor="purple-200" borderRadius="$200">
                    Asymmetric Margins
                </Box>
            </div>
        </div>
    );
}