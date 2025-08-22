import { Box } from '@vapor-ui/core';

export default function BoxDimensions() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h4 className="mb-2 text-sm font-medium">Fixed Sizes</h4>
                <div className="flex items-end gap-4">
                    <Box
                        width="$200"
                        height="$200"
                        backgroundColor="blue-300"
                        borderRadius="$200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        foregroundColor="$contrast"
                    >
                        200x200
                    </Box>
                    <Box
                        width="$400"
                        height="$300"
                        backgroundColor="green-300"
                        borderRadius="$200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        foregroundColor="$contrast"
                    >
                        400x300
                    </Box>
                    <Box
                        width="$300"
                        height="$500"
                        backgroundColor="purple-300"
                        borderRadius="$200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        foregroundColor="$contrast"
                    >
                        300x500
                    </Box>
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Min/Max Constraints</h4>
                <div className="flex flex-col gap-4">
                    <Box
                        minWidth="$400"
                        maxWidth="$600"
                        padding="$300"
                        backgroundColor="orange-200"
                        borderRadius="$200"
                    >
                        Min width 400, max width 600 - this box will grow and shrink within these
                        constraints
                    </Box>
                    <Box
                        minHeight="$200"
                        maxHeight="$400"
                        padding="$300"
                        backgroundColor="pink-200"
                        borderRadius="$200"
                        width="$500"
                    >
                        Min height 200, max height 400 - content determines actual height within
                        constraints
                    </Box>
                </div>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Responsive Sizing</h4>
                <div className="flex gap-4">
                    <Box
                        width="$300"
                        height="$300"
                        backgroundColor="red-300"
                        borderRadius="$200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        foregroundColor="$contrast"
                    >
                        Square
                    </Box>
                    <Box
                        width="$600"
                        height="$200"
                        backgroundColor="cyan-300"
                        borderRadius="$200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        foregroundColor="$contrast"
                    >
                        Rectangle
                    </Box>
                </div>
            </div>
        </div>
    );
}
