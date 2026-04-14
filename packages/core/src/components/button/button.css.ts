import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const variables = {
    foreground: createVar('foreground'),
    outlineForeground: createVar('outline-foreground'),
    ghostForeground: createVar('ghost-foreground'),
    background: createVar('background'),
    borderColor: createVar('border-color'),
};

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
                [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
            },
        },
    ],

    defaultVariants: { colorPalette: 'primary', size: 'md', variant: 'fill' },
    variants: {
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

        colorPalette: {
            primary: {
                vars: {
                    [variables.foreground]: vars.color.foreground.inverse,
                    [variables.outlineForeground]: vars.color.foreground.primary[200],
                    [variables.ghostForeground]: vars.color.foreground.primary[100],
                    [variables.background]: vars.color.background.primary[200],
                    [variables.borderColor]: vars.color.border.primary,
                },
            },
            secondary: {
                vars: {
                    [variables.foreground]: vars.color.foreground.secondary[200],
                    [variables.outlineForeground]: vars.color.foreground.secondary[200],
                    [variables.ghostForeground]: vars.color.foreground.secondary[100],
                    [variables.background]: vars.color.background.secondary[200],
                    [variables.borderColor]: vars.color.border.secondary,
                },
            },
            success: {
                vars: {
                    [variables.foreground]: vars.color.white,
                    [variables.outlineForeground]: vars.color.foreground.success[200],
                    [variables.ghostForeground]: vars.color.foreground.success[100],
                    [variables.background]: vars.color.background.success[200],
                    [variables.borderColor]: vars.color.border.success,
                },
            },
            warning: {
                vars: {
                    [variables.foreground]: vars.color.white,
                    [variables.outlineForeground]: vars.color.foreground.warning[200],
                    [variables.ghostForeground]: vars.color.foreground.warning[100],
                    [variables.background]: vars.color.background.warning[200],
                    [variables.borderColor]: vars.color.border.warning,
                },
            },
            danger: {
                vars: {
                    [variables.foreground]: vars.color.white,
                    [variables.outlineForeground]: vars.color.foreground.danger[200],
                    [variables.ghostForeground]: vars.color.foreground.danger[100],
                    [variables.background]: vars.color.background.danger[200],
                    [variables.borderColor]: vars.color.border.danger,
                },
            },
            contrast: {
                vars: {
                    [variables.foreground]: vars.color.white,
                    [variables.outlineForeground]: vars.color.foreground.contrast[200],
                    [variables.ghostForeground]: vars.color.foreground.contrast[100],
                    [variables.background]: vars.color.background.contrast[200],
                    [variables.borderColor]: vars.color.border.contrast,
                },
            },
        },

        variant: {
            fill: {
                backgroundColor: variables.background,
                color: variables.foreground,
            },
            outline: {
                boxShadow: `inset 0 0 0 1px ${variables.borderColor}`,
                backgroundColor: vars.color.background.canvas[100],
                color: variables.outlineForeground,
            },
            ghost: {
                backgroundColor: 'transparent',
                color: variables.ghostForeground,
            },
        },
    },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof root>>;
