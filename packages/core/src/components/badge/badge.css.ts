import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = componentRecipe({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    defaultVariants: { colorPalette: 'primary', size: 'md', shape: 'square' },
    variants: {
        colorPalette: {
            primary: {
                backgroundColor: vars.color.background.primary[100],
                color: vars.color.foreground.primary[200],
            },
            hint: {
                backgroundColor: vars.color.background.hint[100],
                color: vars.color.foreground.hint[200],
            },
            danger: {
                backgroundColor: vars.color.background.danger[100],
                color: vars.color.foreground.danger[200],
            },
            success: {
                backgroundColor: vars.color.background.success[100],
                color: vars.color.foreground.success[200],
            },
            warning: {
                backgroundColor: vars.color.background.warning[100],
                color: vars.color.foreground.warning[200],
            },
            contrast: {
                backgroundColor: vars.color.background.contrast[100],
                color: vars.color.foreground.contrast[200],
            },
        },

        shape: {
            square: {
                borderRadius: vars.size.borderRadius['300'],
            },
            pill: {
                borderRadius: '9999px',
            },
        },

        size: {
            sm: {
                gap: vars.size.space['025'],
                padding: `0 ${vars.size.space['075']}`,
                height: vars.size.dimension[250],

                lineHeight: vars.typography.lineHeight['050'],
                letterSpacing: vars.typography.letterSpacing['000'],
                fontSize: vars.typography.fontSize['050'],
                fontWeight: vars.typography.fontWeight['500'],
            },
            md: {
                gap: vars.size.space['050'],
                padding: `0 ${vars.size.space['100']}`,
                height: vars.size.dimension[300],

                lineHeight: vars.typography.lineHeight['050'],
                letterSpacing: vars.typography.letterSpacing['000'],
                fontSize: vars.typography.fontSize['050'],
                fontWeight: vars.typography.fontWeight['500'],
            },
            lg: {
                gap: vars.size.space['075'],
                padding: `0 ${vars.size.space['150']}`,
                height: vars.size.dimension[400],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
            },
        },
    },
});

export type BadgeVariants = NonNullable<RecipeVariants<typeof root>>;
