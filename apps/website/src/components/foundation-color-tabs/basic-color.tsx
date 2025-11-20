import { Box, Text } from '@vapor-ui/core';

import { BasicColorData } from '~/constants/colors';
import { transformToColorSwatchItems } from '~/utils/color-generator-adapter';

import { ColorPalette } from '../color-swatch';

export const BasicColor = () => {
    return (
        <Box paddingY="$400">
            {BasicColorData.map((colorGroup): JSX.Element => {
                const isStaticColor = colorGroup.title === 'white' || colorGroup.title === 'black';
                const sectionTitle = isStaticColor
                    ? 'Static Colors'
                    : `${colorGroup.title.charAt(0).toUpperCase() + colorGroup.title.slice(1)} Scales`;

                return (
                    <Box key={colorGroup.title} marginBottom="$600">
                        <Text typography="heading5">{sectionTitle}</Text>
                        <ColorPalette colors={transformToColorSwatchItems([colorGroup])} />
                    </Box>
                );
            })}
        </Box>
    );
};
