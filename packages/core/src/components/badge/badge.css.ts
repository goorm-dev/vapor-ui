import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),

    defaultVariants: { color: 'primary', size: 'md', shape: 'square' },
    variants: {
        color: {
            primary: layerStyle('components', {
                color: vars.color.foreground['primary-darker'],
                backgroundColor: `rgba(${vars.color.background['rgb-primary']}, 0.16)`,
            }),
            hint: layerStyle('components', {
                color: vars.color.foreground['hint-darker'],
                backgroundColor: `rgba(${vars.color.background['rgb-hint']}, 0.16)`,
            }),
            danger: layerStyle('components', {
                color: vars.color.foreground['danger-darker'],
                backgroundColor: `rgba(${vars.color.background['rgb-danger']}, 0.16)`,
            }),
            success: layerStyle('components', {
                color: vars.color.foreground['success-darker'],
                backgroundColor: `rgba(${vars.color.background['rgb-success']}, 0.16)`,
            }),
            warning: layerStyle('components', {
                color: vars.color.foreground['warning-darker'],
                backgroundColor: `rgba(${vars.color.background['rgb-warning']}, 0.16)`,
            }),
            contrast: layerStyle('components', {
                color: vars.color.foreground['contrast-darker'],
                backgroundColor: `rgba(${vars.color.background['rgb-contrast']}, 0.16)`,
            }),
        },

        shape: {
            square: layerStyle('components', {
                borderRadius: vars.size.borderRadius['300'],
            }),
            pill: layerStyle('components', {
                borderRadius: '9999px',
            }),
        },

        size: {
            sm: layerStyle('components', {
                gap: vars.size.space['025'],
                padding: `0 ${vars.size.space['075']}`,
                height: vars.size.dimension[250],

                lineHeight: vars.typography.lineHeight['050'],
                letterSpacing: vars.typography.letterSpacing['000'],
                fontSize: vars.typography.fontSize['050'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            md: layerStyle('components', {
                gap: vars.size.space['050'],
                padding: `0 ${vars.size.space['100']}`,
                height: vars.size.dimension[300],

                lineHeight: vars.typography.lineHeight['050'],
                letterSpacing: vars.typography.letterSpacing['000'],
                fontSize: vars.typography.fontSize['050'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            lg: layerStyle('components', {
                gap: vars.size.space['075'],
                padding: `0 ${vars.size.space['150']}`,
                height: vars.size.dimension[400],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
        },
    },
});

export type BadgeVariants = NonNullable<RecipeVariants<typeof root>>;
