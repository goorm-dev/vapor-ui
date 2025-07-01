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
    const escapePipes = (value: string | number | null | undefined) =>
        String(value ?? '').replace(/\|/g, '\\|');

    return markdownTable([
        ['token', 'value'],
        ...[...BasicColorData, ...SemanticColorData].flatMap(({ colorShade }) => {
            return colorShade.map((shade) => [escapePipes(shade.name), escapePipes(shade.value)]);
        }),
    ]);
};

export const getSizePrimitiveTokenDoc = () => {
    const escapePipes = (value: string | number | null | undefined) =>
        String(value ?? '').replace(/\|/g, '\\|');

    return markdownTable([
        ['token', 'value'],
        ...[...BorderRadiusData, ...SpaceData, ...DimensionData].flatMap(({ name, value }) => {
            return [[escapePipes(name), escapePipes(value)]];
        }),
    ]);
};

export const getTypographyPrimitiveTokenDoc = () => {
    const escapePipes = (value: string | number | null | undefined) =>
        String(value ?? '').replace(/\|/g, '\\|');

    return markdownTable([
        ['token', 'value'],
        ...[
            ...FontFamilyData,
            ...FontSizeData,
            ...FontWeightData,
            ...LetterSpacingData,
            ...LineHeightData,
        ].flatMap(({ value, cssVariable }) => {
            return [[escapePipes(cssVariable), escapePipes(value)]];
        }),
    ]);
};
export const replaceFoundationDoc = (text: string) => {
    return text
        .replace('<FoundationColorTabs />', getColorPrimitiveTokenDoc())
        .replace('<FoundationSizeTabs />', getSizePrimitiveTokenDoc())
        .replace('<FoundationTypographyTabs />', getTypographyPrimitiveTokenDoc());
};
