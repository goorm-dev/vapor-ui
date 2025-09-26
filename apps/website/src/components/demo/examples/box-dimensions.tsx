import { Box } from '@vapor-ui/core';

export default function BoxDimensions() {
    return (
        <Box display="flex">
            <div>
                <div className="flex items-end gap-4">
                    <Box
                        width="$800"
                        height="$800"
                        backgroundColor="$blue-300"
                        borderRadius="$200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="$contrast-100"
                    >
                        800x800
                    </Box>
                </div>
            </div>
        </Box>
    );
}
