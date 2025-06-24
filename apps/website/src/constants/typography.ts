import fontFamilyData from '../../public/tokens/typography/font-family.json';
import fontSizeData from '../../public/tokens/typography/font-size.json';
import fontWeightData from '../../public/tokens/typography/font-weight.json';
import letterSpacingData from '../../public/tokens/typography/letter-spacing.json';
import lineHeightData from '../../public/tokens/typography/line-height.json';
import { sortByNumericKey } from '../utils/object';

export const FontFamilyData = Object.keys(fontFamilyData['font-family']).map((key) => ({
    name: `font-family-${key}`,
    value: `${fontFamilyData['font-family'][key as keyof (typeof fontFamilyData)['font-family']]}`,
    cssVariable: `--${key}`,
}));

export const FontSizeData = Object.keys(fontSizeData['font-size'])
    .map((key) => ({
        name: `font-size-${key}`,
        value: fontSizeData['font-size'][key as keyof (typeof fontSizeData)['font-size']],
        cssVariable: `--font-size-${key}`,
    }))
    .sort(sortByNumericKey);

export const FontWeightData = Object.keys(fontWeightData['font-weight'])
    .map((key) => ({
        name: `font-weight-${key}`,
        value: fontWeightData['font-weight'][key as keyof (typeof fontWeightData)['font-weight']],
        cssVariable: `--font-weight-${key}`,
    }))
    .sort(sortByNumericKey);

export const LetterSpacingData = Object.keys(letterSpacingData['letter-spacing'])
    .map((key) => ({
        name: `letter-spacing-${key}`,
        value: letterSpacingData['letter-spacing'][
            key as keyof (typeof letterSpacingData)['letter-spacing']
        ],
        cssVariable: `--letter-spacing-${key}`,
    }))
    .sort(sortByNumericKey);

export const LineHeightData = Object.keys(lineHeightData['line-height'])
    .map((key) => ({
        name: `line-height-${key}`,
        value: lineHeightData['line-height'][key as keyof (typeof lineHeightData)['line-height']],
        cssVariable: `--line-height-${key}`,
    }))
    .sort(sortByNumericKey);

// JSON 데이터 자체도 export
export { fontFamilyData, fontSizeData, fontWeightData, letterSpacingData, lineHeightData };
