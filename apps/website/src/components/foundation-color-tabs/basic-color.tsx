import { Box, Text } from '@vapor-ui/core';

import { ColorPalette } from '../color-swatch';

export const BasicColor = () => {
    return (
        <Box paddingY="$400">
            <Text typography="heading5">Static Colors</Text>

            <ColorPalette
                colors={[
                    { name: 'Black', variable: 'black' },
                    { name: 'White', variable: 'white' },
                ]}
            />

            <Text typography="heading5">Gray Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Gray 050', variable: 'gray-050', foreground: 'gray-900' },
                    { name: 'Gray 100', variable: 'gray-100', foreground: 'gray-900' },
                    { name: 'Gray 200', variable: 'gray-200', foreground: 'gray-900' },
                    { name: 'Gray 300', variable: 'gray-300', foreground: 'gray-900' },
                    { name: 'Gray 400', variable: 'gray-400', foreground: 'gray-900' },
                    { name: 'Gray 500', variable: 'gray-500', foreground: 'gray-050' },
                    { name: 'Gray 600', variable: 'gray-600', foreground: 'gray-050' },
                    { name: 'Gray 700', variable: 'gray-700', foreground: 'gray-050' },
                    { name: 'Gray 800', variable: 'gray-800', foreground: 'gray-050' },
                    { name: 'Gray 900', variable: 'gray-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Red Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Red 050', variable: 'red-050', foreground: 'gray-900' },
                    { name: 'Red 100', variable: 'red-100', foreground: 'gray-900' },
                    { name: 'Red 200', variable: 'red-200', foreground: 'gray-900' },
                    { name: 'Red 300', variable: 'red-300', foreground: 'gray-900' },
                    { name: 'Red 400', variable: 'red-400', foreground: 'gray-900' },
                    { name: 'Red 500', variable: 'red-500', foreground: 'gray-050' },
                    { name: 'Red 600', variable: 'red-600', foreground: 'gray-050' },
                    { name: 'Red 700', variable: 'red-700', foreground: 'gray-050' },
                    { name: 'Red 800', variable: 'red-800', foreground: 'gray-050' },
                    { name: 'Red 900', variable: 'red-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Pink Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Pink 050', variable: 'pink-050', foreground: 'gray-900' },
                    { name: 'Pink 100', variable: 'pink-100', foreground: 'gray-900' },
                    { name: 'Pink 200', variable: 'pink-200', foreground: 'gray-900' },
                    { name: 'Pink 300', variable: 'pink-300', foreground: 'gray-900' },
                    { name: 'Pink 400', variable: 'pink-400', foreground: 'gray-900' },
                    { name: 'Pink 500', variable: 'pink-500', foreground: 'gray-050' },
                    { name: 'Pink 600', variable: 'pink-600', foreground: 'gray-050' },
                    { name: 'Pink 700', variable: 'pink-700', foreground: 'gray-050' },
                    { name: 'Pink 800', variable: 'pink-800', foreground: 'gray-050' },
                    { name: 'Pink 900', variable: 'pink-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Grape Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Grape 050', variable: 'grape-050', foreground: 'gray-900' },
                    { name: 'Grape 100', variable: 'grape-100', foreground: 'gray-900' },
                    { name: 'Grape 200', variable: 'grape-200', foreground: 'gray-900' },
                    { name: 'Grape 300', variable: 'grape-300', foreground: 'gray-900' },
                    { name: 'Grape 400', variable: 'grape-400', foreground: 'gray-900' },
                    { name: 'Grape 500', variable: 'grape-500', foreground: 'gray-050' },
                    { name: 'Grape 600', variable: 'grape-600', foreground: 'gray-050' },
                    { name: 'Grape 700', variable: 'grape-700', foreground: 'gray-050' },
                    { name: 'Grape 800', variable: 'grape-800', foreground: 'gray-050' },
                    { name: 'Grape 900', variable: 'grape-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Violet Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Violet 050', variable: 'violet-050', foreground: 'gray-900' },
                    { name: 'Violet 100', variable: 'violet-100', foreground: 'gray-900' },
                    { name: 'Violet 200', variable: 'violet-200', foreground: 'gray-900' },
                    { name: 'Violet 300', variable: 'violet-300', foreground: 'gray-900' },
                    { name: 'Violet 400', variable: 'violet-400', foreground: 'gray-900' },
                    { name: 'Violet 500', variable: 'violet-500', foreground: 'gray-050' },
                    { name: 'Violet 600', variable: 'violet-600', foreground: 'gray-050' },
                    { name: 'Violet 700', variable: 'violet-700', foreground: 'gray-050' },
                    { name: 'Violet 800', variable: 'violet-800', foreground: 'gray-050' },
                    { name: 'Violet 900', variable: 'violet-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Blue Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Blue 050', variable: 'blue-050', foreground: 'gray-900' },
                    { name: 'Blue 100', variable: 'blue-100', foreground: 'gray-900' },
                    { name: 'Blue 200', variable: 'blue-200', foreground: 'gray-900' },
                    { name: 'Blue 300', variable: 'blue-300', foreground: 'gray-900' },
                    { name: 'Blue 400', variable: 'blue-400', foreground: 'gray-900' },
                    { name: 'Blue 500', variable: 'blue-500', foreground: 'gray-050' },
                    { name: 'Blue 600', variable: 'blue-600', foreground: 'gray-050' },
                    { name: 'Blue 700', variable: 'blue-700', foreground: 'gray-050' },
                    { name: 'Blue 800', variable: 'blue-800', foreground: 'gray-050' },
                    { name: 'Blue 900', variable: 'blue-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Cyan Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Cyan 050', variable: 'cyan-050', foreground: 'gray-900' },
                    { name: 'Cyan 100', variable: 'cyan-100', foreground: 'gray-900' },
                    { name: 'Cyan 200', variable: 'cyan-200', foreground: 'gray-900' },
                    { name: 'Cyan 300', variable: 'cyan-300', foreground: 'gray-900' },
                    { name: 'Cyan 400', variable: 'cyan-400', foreground: 'gray-900' },
                    { name: 'Cyan 500', variable: 'cyan-500', foreground: 'gray-050' },
                    { name: 'Cyan 600', variable: 'cyan-600', foreground: 'gray-050' },
                    { name: 'Cyan 700', variable: 'cyan-700', foreground: 'gray-050' },
                    { name: 'Cyan 800', variable: 'cyan-800', foreground: 'gray-050' },
                    { name: 'Cyan 900', variable: 'cyan-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Green Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Green 050', variable: 'green-050', foreground: 'gray-900' },
                    { name: 'Green 100', variable: 'green-100', foreground: 'gray-900' },
                    { name: 'Green 200', variable: 'green-200', foreground: 'gray-900' },
                    { name: 'Green 300', variable: 'green-300', foreground: 'gray-900' },
                    { name: 'Green 400', variable: 'green-400', foreground: 'gray-900' },
                    { name: 'Green 500', variable: 'green-500', foreground: 'gray-050' },
                    { name: 'Green 600', variable: 'green-600', foreground: 'gray-050' },
                    { name: 'Green 700', variable: 'green-700', foreground: 'gray-050' },
                    { name: 'Green 800', variable: 'green-800', foreground: 'gray-050' },
                    { name: 'Green 900', variable: 'green-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Lime Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Lime 050', variable: 'lime-050', foreground: 'gray-900' },
                    { name: 'Lime 100', variable: 'lime-100', foreground: 'gray-900' },
                    { name: 'Lime 200', variable: 'lime-200', foreground: 'gray-900' },
                    { name: 'Lime 300', variable: 'lime-300', foreground: 'gray-900' },
                    { name: 'Lime 400', variable: 'lime-400', foreground: 'gray-900' },
                    { name: 'Lime 500', variable: 'lime-500', foreground: 'gray-050' },
                    { name: 'Lime 600', variable: 'lime-600', foreground: 'gray-050' },
                    { name: 'Lime 700', variable: 'lime-700', foreground: 'gray-050' },
                    { name: 'Lime 800', variable: 'lime-800', foreground: 'gray-050' },
                    { name: 'Lime 900', variable: 'lime-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Yellow Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Yellow 050', variable: 'yellow-050', foreground: 'gray-900' },
                    { name: 'Yellow 100', variable: 'yellow-100', foreground: 'gray-900' },
                    { name: 'Yellow 200', variable: 'yellow-200', foreground: 'gray-900' },
                    { name: 'Yellow 300', variable: 'yellow-300', foreground: 'gray-900' },
                    { name: 'Yellow 400', variable: 'yellow-400', foreground: 'gray-900' },
                    { name: 'Yellow 500', variable: 'yellow-500', foreground: 'gray-050' },
                    { name: 'Yellow 600', variable: 'yellow-600', foreground: 'gray-050' },
                    { name: 'Yellow 700', variable: 'yellow-700', foreground: 'gray-050' },
                    { name: 'Yellow 800', variable: 'yellow-800', foreground: 'gray-050' },
                    { name: 'Yellow 900', variable: 'yellow-900', foreground: 'gray-050' },
                ]}
            />

            <Text typography="heading5">Orange Scales</Text>

            <ColorPalette
                colors={[
                    { name: 'Orange 050', variable: 'orange-050', foreground: 'gray-900' },
                    { name: 'Orange 100', variable: 'orange-100', foreground: 'gray-900' },
                    { name: 'Orange 200', variable: 'orange-200', foreground: 'gray-900' },
                    { name: 'Orange 300', variable: 'orange-300', foreground: 'gray-900' },
                    { name: 'Orange 400', variable: 'orange-400', foreground: 'gray-900' },
                    { name: 'Orange 500', variable: 'orange-500', foreground: 'gray-050' },
                    { name: 'Orange 600', variable: 'orange-600', foreground: 'gray-050' },
                    { name: 'Orange 700', variable: 'orange-700', foreground: 'gray-050' },
                    { name: 'Orange 800', variable: 'orange-800', foreground: 'gray-050' },
                    { name: 'Orange 900', variable: 'orange-900', foreground: 'gray-050' },
                ]}
            />
        </Box>
    );
};
