import fontFamilyData from '../../public/tokens/typography/font-family.json';
import fontSizeData from '../../public/tokens/typography/font-size.json';
import fontWeightData from '../../public/tokens/typography/font-weight.json';
import letterSpacingData from '../../public/tokens/typography/letter-spacing.json';
import lineHeightData from '../../public/tokens/typography/line-height.json';
import { sortByNumericKey } from '../utils/object';

export const FontFamilyData = Object.keys(fontFamilyData['font-family']).map((key) => ({
    name: `--vapor-typography-fontFamily-${key}`,
    value: `${fontFamilyData['font-family'][key as keyof (typeof fontFamilyData)['font-family']]}`,
    cssVariable: `--vapor-typography-fontFamily-${key}`,
}));

export const FontSizeData = Object.keys(fontSizeData['font-size'])
    .map((key) => ({
        name: `--vapor-typography-fontSize-${key}`,
        value: fontSizeData['font-size'][key as keyof (typeof fontSizeData)['font-size']],
        cssVariable: `--vapor-typography-fontSize-${key}`,
    }))
    .sort(sortByNumericKey);

export const FontWeightData = Object.keys(fontWeightData['font-weight'])
    .map((key) => ({
        name: `--vapor-typography-fontWeight-${key}`,
        value: fontWeightData['font-weight'][key as keyof (typeof fontWeightData)['font-weight']],
        cssVariable: `--vapor-typography-fontWeight-${key}`,
    }))
    .sort(sortByNumericKey);

export const LetterSpacingData = Object.keys(letterSpacingData['letter-spacing'])
    .map((key) => ({
        name: `--vapor-typography-letterSpacing-${key}`,
        value: letterSpacingData['letter-spacing'][
            key as keyof (typeof letterSpacingData)['letter-spacing']
        ],
        cssVariable: `--vapor-typography-letterSpacing-${key}`,
    }))
    .sort(sortByNumericKey);

export const LineHeightData = Object.keys(lineHeightData['line-height'])
    .map((key) => ({
        name: `--vapor-typography-lineHeight-${key}`,
        value: lineHeightData['line-height'][key as keyof (typeof lineHeightData)['line-height']],
        cssVariable: `--vapor-typography-lineHeight-${key}`,
    }))
    .sort(sortByNumericKey);

// JSON 데이터 자체도 export
export { fontFamilyData, fontSizeData, fontWeightData, letterSpacingData, lineHeightData };
