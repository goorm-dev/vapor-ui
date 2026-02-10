import type { ReactElement } from 'react';

import { Box, Text } from '@vapor-ui/core';

import { BasicColorData } from '~/constants/colors';
import { transformToColorSwatchItems } from '~/utils/color-generator-adapter';

import { ColorPalette } from '../color-swatch';

export const BasicColor = () => {
    return (
        <Box paddingY="$400">
            {BasicColorData.map((colorGroup): ReactElement => {
                const sectionTitle =
                    colorGroup.title === 'base'
                        ? 'Base Colors'
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
