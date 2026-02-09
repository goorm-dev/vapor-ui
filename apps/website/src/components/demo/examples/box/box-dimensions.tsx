import { Box } from '@vapor-ui/core';

export default function BoxDimensions() {
    return (
        <Box
            $styles={{
                width: '$800',
                height: '$800',
                backgroundColor: '$basic-blue-300',
                borderRadius: '$200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '$fg-contrast-100',
            }}
        >
            800x800
        </Box>
    );
}
