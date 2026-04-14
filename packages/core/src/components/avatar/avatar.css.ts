import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const radii = createVar('border-radius');

export const root = componentRecipe({
    base: {
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: vars.size.space['000'],
        border: `1px solid ${vars.color.border.normal}`,
        padding: vars.size.space['000'],
        overflow: 'hidden',
        verticalAlign: 'top',
    },

    defaultVariants: { size: 'md', shape: 'square' },
    variants: {
        /**
         * Size of the avatar. Controls the width, height, and border radius. Default: `'md'`
         */
        size: {
            sm: {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
                vars: { [radii]: vars.size.borderRadius[200] },
            },
            md: {
                width: vars.size.dimension[400],
                height: vars.size.dimension[400],
                vars: { [radii]: vars.size.borderRadius[300] },
            },
            lg: {
                width: vars.size.dimension[500],
                height: vars.size.dimension[500],
                vars: { [radii]: vars.size.borderRadius[400] },
            },
            xl: {
                width: vars.size.dimension[600],
                height: vars.size.dimension[600],
                vars: { [radii]: vars.size.borderRadius[400] },
            },
        },
        /**
         * Shape of the avatar border radius. Default: `'square'`
         */
        shape: {
            square: { borderRadius: radii },
            circle: { borderRadius: '50%' },
        },
    },
});

export const fallbackBgVar = createVar('fallback-background-color');

export const fallback = componentRecipe({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',

        backgroundColor: fallbackBgVar,
        color: vars.color.foreground.inverse,
    },

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * Size of the fallback content. Controls the font size, line height, font weight, and letter spacing. Default: `'md'`
         */
        size: {
            sm: {
                fontSize: vars.typography.fontSize['050'],
                lineHeight: vars.typography.lineHeight['050'],
                fontWeight: vars.typography.fontWeight['500'],
                letterSpacing: vars.typography.letterSpacing['000'],
            },
            md: {
                fontSize: vars.typography.fontSize['075'],
                lineHeight: vars.typography.lineHeight['075'],
                fontWeight: vars.typography.fontWeight['500'],
                letterSpacing: vars.typography.letterSpacing['100'],
            },
            lg: {
                fontSize: vars.typography.fontSize['200'],
                lineHeight: vars.typography.lineHeight['200'],
                fontWeight: vars.typography.fontWeight['700'],
                letterSpacing: vars.typography.letterSpacing['100'],
            },
            xl: {
                fontSize: vars.typography.fontSize['300'],
                lineHeight: vars.typography.lineHeight['300'],
                fontWeight: vars.typography.fontWeight['700'],
                letterSpacing: vars.typography.letterSpacing['200'],
            },
        },
    },
});

export const image = componentStyle({
    display: 'inline',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
export type FallbackVariants = NonNullable<RecipeVariants<typeof fallback>>;
