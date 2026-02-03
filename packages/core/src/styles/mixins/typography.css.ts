import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '~/styles/themes.css';

import { layerStyle } from './layer-style.css';

export const typographyVariants = {
    display1: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['1000'],
        letterSpacing: vars.typography.letterSpacing['400'],
        fontSize: vars.typography.fontSize['1000'],
        fontWeight: vars.typography.fontWeight[800],
    }),
    display2: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['900'],
        letterSpacing: vars.typography.letterSpacing['400'],
        fontSize: vars.typography.fontSize['900'],
        fontWeight: vars.typography.fontWeight[800],
    }),
    display3: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['800'],
        letterSpacing: vars.typography.letterSpacing['400'],
        fontSize: vars.typography.fontSize['800'],
        fontWeight: vars.typography.fontWeight[800],
    }),
    display4: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['700'],
        letterSpacing: vars.typography.letterSpacing['400'],
        fontSize: vars.typography.fontSize['700'],
        fontWeight: vars.typography.fontWeight[800],
    }),
    heading1: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['600'],
        letterSpacing: vars.typography.letterSpacing['400'],
        fontSize: vars.typography.fontSize['600'],
        fontWeight: vars.typography.fontWeight[700],
    }),
    heading2: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['500'],
        letterSpacing: vars.typography.letterSpacing['400'],
        fontSize: vars.typography.fontSize['500'],
        fontWeight: vars.typography.fontWeight[700],
    }),
    heading3: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['400'],
        letterSpacing: vars.typography.letterSpacing['300'],
        fontSize: vars.typography.fontSize['400'],
        fontWeight: vars.typography.fontWeight[700],
    }),
    heading4: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['300'],
        letterSpacing: vars.typography.letterSpacing['200'],
        fontSize: vars.typography.fontSize['300'],
        fontWeight: vars.typography.fontWeight[700],
    }),
    heading5: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['200'],
        letterSpacing: vars.typography.letterSpacing['100'],
        fontSize: vars.typography.fontSize['200'],
        fontWeight: vars.typography.fontWeight[700],
    }),
    heading6: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['100'],
        letterSpacing: vars.typography.letterSpacing['100'],
        fontSize: vars.typography.fontSize['100'],
        fontWeight: vars.typography.fontWeight[500],
    }),
    subtitle1: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing['100'],
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight[500],
    }),
    subtitle2: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['050'],
        letterSpacing: vars.typography.letterSpacing['000'],
        fontSize: vars.typography.fontSize['050'],
        fontWeight: vars.typography.fontWeight[500],
    }),
    body1: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['100'],
        letterSpacing: vars.typography.letterSpacing['100'],
        fontSize: vars.typography.fontSize['100'],
        fontWeight: vars.typography.fontWeight[400],
    }),
    body2: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing['100'],
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight[400],
    }),
    body3: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['050'],
        letterSpacing: vars.typography.letterSpacing['100'],
        fontSize: vars.typography.fontSize['050'],
        fontWeight: vars.typography.fontWeight[400],
    }),
    body4: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['025'],
        letterSpacing: vars.typography.letterSpacing['000'],
        fontSize: vars.typography.fontSize['025'],
        fontWeight: vars.typography.fontWeight[400],
    }),
    code1: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing['000'],
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight[400],
    }),
    code2: layerStyle('components', {
        lineHeight: vars.typography.lineHeight['050'],
        letterSpacing: vars.typography.letterSpacing['000'],
        fontSize: vars.typography.fontSize['050'],
        fontWeight: vars.typography.fontWeight[400],
    }),
};

export const typography = recipe({
    defaultVariants: { style: 'body1' },
    variants: {
        style: typographyVariants,
    },
});

export type TypographyVariants = typeof typographyVariants;
export type Typography = NonNullable<RecipeVariants<typeof typography>>;
