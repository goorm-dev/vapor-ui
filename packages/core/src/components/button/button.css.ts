import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const fg = createVar();
const outlineFg = createVar();
const ghostFg = createVar();
const bg = createVar();
const border = createVar();

export const root = recipe({
    base: [
        interaction(),

        layerStyle('components', {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',

            border: 'none',
            borderRadius: vars.size.borderRadius['300'],
            flexWrap: 'nowrap',
            textWrap: 'nowrap',
            selectors: {
                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },
            },
        }),
    ],

    defaultVariants: { colorPalette: 'primary', size: 'md', variant: 'fill' },
    variants: {
        /**
         * Controls the button dimensions including height, padding, and gap.
         */
        size: {
            sm: [
                typography({ style: 'subtitle1' }),
                layerStyle('components', {
                    gap: vars.size.space['050'],
                    paddingInline: vars.size.space['100'],
                    height: vars.size.dimension['300'],
                }),
            ],
            md: [
                typography({ style: 'subtitle1' }),
                layerStyle('components', {
                    gap: vars.size.space['075'],
                    paddingInline: vars.size.space['150'],
                    height: vars.size.dimension['400'],
                }),
            ],
            lg: [
                typography({ style: 'subtitle1' }),
                layerStyle('components', {
                    gap: vars.size.space['100'],
                    paddingInline: vars.size.space['200'],
                    height: vars.size.dimension['500'],
                }),
            ],
            xl: [
                typography({ style: 'heading6' }),
                layerStyle('components', {
                    gap: vars.size.space['100'],
                    paddingInline: vars.size.space['300'],
                    height: vars.size.dimension['600'],
                }),
            ],
        },

        /**
         * Defines the color scheme applied to the button.
         */
        colorPalette: {
            primary: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.inverse,
                    [outlineFg]: vars.color.foreground.primary[200],
                    [ghostFg]: vars.color.foreground.primary[100],
                    [bg]: vars.color.background.primary[200],
                    [border]: vars.color.border.primary,
                },
            }),
            secondary: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.secondary[200],
                    [outlineFg]: vars.color.foreground.secondary[200],
                    [ghostFg]: vars.color.foreground.secondary[100],
                    [bg]: vars.color.background.secondary[200],
                    [border]: vars.color.border.secondary,
                },
            }),
            success: layerStyle('components', {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.success[200],
                    [ghostFg]: vars.color.foreground.success[100],
                    [bg]: vars.color.background.success[200],
                    [border]: vars.color.border.success,
                },
            }),
            warning: layerStyle('components', {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.warning[200],
                    [ghostFg]: vars.color.foreground.warning[100],
                    [bg]: vars.color.background.warning[200],
                    [border]: vars.color.border.warning,
                },
            }),
            danger: layerStyle('components', {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.danger[200],
                    [ghostFg]: vars.color.foreground.danger[100],
                    [bg]: vars.color.background.danger[200],
                    [border]: vars.color.border.danger,
                },
            }),
            contrast: layerStyle('components', {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.contrast[200],
                    [ghostFg]: vars.color.foreground.contrast[100],
                    [bg]: vars.color.background.contrast[200],
                    [border]: vars.color.border.contrast,
                },
            }),
        },
        /**
         * Determines the visual style of the button.
         */
        variant: {
            fill: layerStyle('components', {
                backgroundColor: bg,
                color: fg,
            }),
            outline: layerStyle('components', {
                boxShadow: `inset 0 0 0 1px ${border}`,
                backgroundColor: vars.color.background.canvas[100],
                color: outlineFg,
            }),
            ghost: layerStyle('components', {
                backgroundColor: 'transparent',
                color: ghostFg,
            }),
        },
    },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof root>>;
