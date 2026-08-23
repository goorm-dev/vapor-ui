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
            flexWrap: 'nowrap',
            alignItems: 'center',

            justifyContent: 'center',
            border: 'none',
            borderRadius: vars.size.borderRadius['300'],
            textWrap: 'nowrap',
            selectors: {
                [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
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
                    [variables.foreground]: vars.color.foreground.staticWhite,
                    [variables.outlineForeground]: vars.color.foreground['primary'],
                    [variables.ghostForeground]: vars.color.foreground['primary'],
                    [variables.background]: vars.color.background['primary'],
                    [variables.borderColor]: vars.color.border.primary,
                },
            },
            secondary: {
                vars: {
                    [variables.foreground]: vars.color.foreground['normal'],
                    [variables.outlineForeground]: vars.color.foreground['secondary'],
                    [variables.ghostForeground]: vars.color.foreground['secondary'],
                    [variables.background]: vars.color.background['secondary'],
                    [variables.borderColor]: vars.color.border.secondary,
                },
            },
            success: {
                vars: {
                    [variables.foreground]: vars.color.foreground.staticWhite,
                    [variables.outlineForeground]: vars.color.foreground['success'],
                    [variables.ghostForeground]: vars.color.foreground['success'],
                    [variables.background]: vars.color.background['success'],
                    [variables.borderColor]: vars.color.border.success,
                },
            },
            warning: {
                vars: {
                    [variables.foreground]: vars.color.foreground.staticWhite,
                    [variables.outlineForeground]: vars.color.foreground['warning'],
                    [variables.ghostForeground]: vars.color.foreground['warning'],
                    [variables.background]: vars.color.background['warning'],
                    [variables.borderColor]: vars.color.border.warning,
                },
            },
            danger: {
                vars: {
                    [variables.foreground]: vars.color.foreground.staticWhite,
                    [variables.outlineForeground]: vars.color.foreground['danger'],
                    [variables.ghostForeground]: vars.color.foreground['danger'],
                    [variables.background]: vars.color.background['danger'],
                    [variables.borderColor]: vars.color.border.danger,
                },
            },
            contrast: {
                vars: {
                    [variables.foreground]: vars.color.foreground.staticWhite,
                    [variables.outlineForeground]: vars.color.foreground['secondary'],
                    [variables.ghostForeground]: vars.color.foreground['secondary'],
                    [variables.background]: vars.color.background['contrast'],
                    [variables.borderColor]: vars.color.border.contrast,
                },
            },
        },

        /**
         * Visual style of the button. Default: `'fill'`
         */
        variant: {
            fill: {
                backgroundColor: variables.background,
                color: variables.foreground,
            },
            outline: {
                boxShadow: `inset 0 0 0 1px ${variables.borderColor}`,
                backgroundColor: vars.color.background['canvas-base'],
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
