import { markdownTable } from 'markdown-table';

import { BasicColorData, SemanticColorData } from '~/constants/colors';
import { BorderRadiusData, DimensionData, SpaceData } from '~/constants/size';
import {
    FontFamilyData,
    FontSizeData,
    FontWeightData,
    LetterSpacingData,
    LineHeightData,
} from '~/constants/typography';

export const getColorPrimitiveTokenDoc = () => {
    return markdownTable([
        ['token', 'value', 'Example'],
        ...[...BasicColorData, ...SemanticColorData].flatMap(({ colorShade }) => {
            return colorShade.map((shade) => [
                `${shade.name}`,
                `${shade.value}`,
                `<Box color="${shade.name}" bg="${shade.value}" />`,
            ]);
        }),
    ]);
};

export const getSizePrimitiveTokenDoc = () => {
    return markdownTable([
        ['token', 'value', 'Example'],
        ...[...BorderRadiusData, ...SpaceData, ...DimensionData].flatMap(({ name, value }) => {
            return [[name, value, `<Box size="${value}"/>`]];
        }),
    ]);
};

export const getTypographyPrimitiveTokenDoc = () => {
    return markdownTable([
        ['token', 'value', 'Example'],
        ...[
            ...FontFamilyData,
            ...FontSizeData,
            ...FontWeightData,
            ...LetterSpacingData,
            ...LineHeightData,
        ].flatMap(({ name, value, cssVariable }) => {
            return [[cssVariable, value, `<Text typography="${name}"/>`]];
        }),
    ]);
};
export const replaceFoundationDoc = (text: string) => {
    return text
        .replace('<FoundationColorTabs />', getColorPrimitiveTokenDoc())
        .replace('<FoundationSizeTabs />', getSizePrimitiveTokenDoc())
        .replace('<FoundationTypographyTabs />', getTypographyPrimitiveTokenDoc());
};
