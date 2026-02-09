import { Box, Text } from '@vapor-ui/core';

import { SemanticColorData } from '~/constants/colors';
import { transformToColorSwatchItems } from '~/utils/color-generator-adapter';

import { ColorPalette } from '../color-swatch';

export const SemanticColor = () => {
    const sectionTitles: Record<string, string> = {
        background: 'Background Colors',
        foreground: 'Foreground Colors',
        border: 'Border Colors',
        logo: 'Logo Colors',
        button: 'Button Colors',
    };

    return (
        <Box $styles={{ paddingBlock: '$400' }}>
            {SemanticColorData.map(
                (colorGroup): JSX.Element => (
                    <Box key={colorGroup.title} $styles={{ marginBottom: '$600' }}>
                        <Text typography="heading5">
                            {sectionTitles[colorGroup.title] || colorGroup.title}
                        </Text>
                        <ColorPalette colors={transformToColorSwatchItems([colorGroup])} />
                    </Box>
                ),
            )}
        </Box>
    );
};
