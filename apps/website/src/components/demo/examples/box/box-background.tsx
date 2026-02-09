import { Box, HStack } from '@vapor-ui/core';

export default function BoxBackground() {
    return (
        <HStack $styles={{ gap: '$200' }} className="flex-wrap">
            <Box
                $styles={{
                    padding: '$400',
                    backgroundColor: '$bg-primary-200',
                    color: '$fg-primary-100',
                }}
            >
                Primary
            </Box>
            <Box
                $styles={{
                    padding: '$400',
                    backgroundColor: '$bg-secondary-200',
                    color: '$fg-contrast-100',
                }}
            >
                Secondary
            </Box>
            <Box
                $styles={{
                    padding: '$400',
                    backgroundColor: '$bg-success-200',
                    color: '$fg-contrast-100',
                }}
            >
                Success
            </Box>
            <Box
                $styles={{
                    padding: '$400',
                    backgroundColor: '$bg-warning-200',
                    color: '$fg-contrast-100',
                }}
            >
                Warning
            </Box>
            <Box
                $styles={{
                    padding: '$400',
                    backgroundColor: '$bg-danger-200',
                    color: '$fg-contrast-100',
                }}
            >
                Danger
            </Box>
            <Box
                $styles={{
                    padding: '$400',
                    backgroundColor: '$basic-gray-200',
                    color: '$fg-primary-100',
                }}
            >
                Gray
            </Box>
            <Box
                $styles={{
                    padding: '$400',
                    backgroundColor: '$basic-blue-500',
                    color: '$fg-contrast-100',
                }}
            >
                Blue
            </Box>
            <Box
                $styles={{
                    padding: '$400',
                    backgroundColor: '$basic-green-300',
                    color: '$fg-primary-100',
                }}
            >
                Green
            </Box>
        </HStack>
    );
}
