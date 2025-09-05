import { Box } from '@vapor-ui/core';

export default function BoxSpacing() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Box padding="$400" backgroundColor="$blue-200" borderRadius="$200">
                    Padding
                </Box>
            </div>

            <div className="flex items-center gap-4">
                <Box margin="$400" padding="$300" backgroundColor="$green-200" borderRadius="$200">
                    Margin
                </Box>
            </div>

            <div className="flex items-center gap-4">
                <Box
                    paddingX="$500"
                    paddingY="$200"
                    backgroundColor="$grape-100"
                    borderRadius="$200"
                >
                    Horizontal Padding
                </Box>
                <Box
                    marginX="$300"
                    marginY="$100"
                    padding="$300"
                    backgroundColor="$grape-200"
                    borderRadius="$200"
                >
                    Asymmetric Margins
                </Box>
            </div>
        </div>
    );
}
