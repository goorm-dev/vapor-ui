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
                backgroundColor: vars.color.background['primary-weak'],
                color: vars.color.foreground['primary-strong'],
            },
            hint: {
                backgroundColor: vars.color.background['hint-weak'],
                color: vars.color.foreground['secondary'],
            },
            danger: {
                backgroundColor: vars.color.background['danger-weak'],
                color: vars.color.foreground['danger-strong'],
            },
            success: {
                backgroundColor: vars.color.background['success-weak'],
                color: vars.color.foreground['success-strong'],
            },
            warning: {
                backgroundColor: vars.color.background['warning-weak'],
                color: vars.color.foreground['warning-strong'],
            },
            contrast: {
                backgroundColor: vars.color.background['contrast-weak'],
                color: vars.color.foreground['inverse'],
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
