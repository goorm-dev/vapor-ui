import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const fg = createVar();
const outlineFg = createVar();
const ghostFg = createVar();
const bg = createVar();
const border = createVar();

export const root = componentRecipe({
    base: [
        interaction(),

        {
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
        },
    ],

    defaultVariants: { colorPalette: 'primary', size: 'md', variant: 'fill' },
    variants: {
        /**
         * Size of the button, controlling height, padding, and typography. Default: `'md'`
         */
        size: {
            sm: [
                typography({ style: 'subtitle1' }),
                {
                    gap: vars.size.space['050'],
                    paddingInline: vars.size.space['100'],
                    height: vars.size.dimension['300'],
                },
            ],
            md: [
                typography({ style: 'subtitle1' }),
                {
                    gap: vars.size.space['075'],
                    paddingInline: vars.size.space['150'],
                    height: vars.size.dimension['400'],
                },
            ],
            lg: [
                typography({ style: 'subtitle1' }),
                {
                    gap: vars.size.space['100'],
                    paddingInline: vars.size.space['200'],
                    height: vars.size.dimension['500'],
                },
            ],
            xl: [
                typography({ style: 'heading6' }),
                {
                    gap: vars.size.space['100'],
                    paddingInline: vars.size.space['300'],
                    height: vars.size.dimension['600'],
                },
            ],
        },

        /**
         * Color palette applied to the button. Controls the background, text, and border colors for all visual variants. Default: `'primary'`
         */
        colorPalette: {
            primary: {
                vars: {
                    [fg]: vars.color.foreground.inverse,
                    [outlineFg]: vars.color.foreground.primary[200],
                    [ghostFg]: vars.color.foreground.primary[100],
                    [bg]: vars.color.background.primary[200],
                    [border]: vars.color.border.primary,
                },
            },
            secondary: {
                vars: {
                    [fg]: vars.color.foreground.secondary[200],
                    [outlineFg]: vars.color.foreground.secondary[200],
                    [ghostFg]: vars.color.foreground.secondary[100],
                    [bg]: vars.color.background.secondary[200],
                    [border]: vars.color.border.secondary,
                },
            },
            success: {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.success[200],
                    [ghostFg]: vars.color.foreground.success[100],
                    [bg]: vars.color.background.success[200],
                    [border]: vars.color.border.success,
                },
            },
            warning: {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.warning[200],
                    [ghostFg]: vars.color.foreground.warning[100],
                    [bg]: vars.color.background.warning[200],
                    [border]: vars.color.border.warning,
                },
            },
            danger: {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.danger[200],
                    [ghostFg]: vars.color.foreground.danger[100],
                    [bg]: vars.color.background.danger[200],
                    [border]: vars.color.border.danger,
                },
            },
            contrast: {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.contrast[200],
                    [ghostFg]: vars.color.foreground.contrast[100],
                    [bg]: vars.color.background.contrast[200],
                    [border]: vars.color.border.contrast,
                },
            },
        },

        /**
         * Visual style of the button. Default: `'fill'`
         */
        variant: {
            fill: {
                backgroundColor: bg,
                color: fg,
            },
            outline: {
                boxShadow: `inset 0 0 0 1px ${border}`,
                backgroundColor: vars.color.background.canvas[100],
                color: outlineFg,
            },
            ghost: {
                backgroundColor: 'transparent',
                color: ghostFg,
            },
        },
    },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof root>>;
