import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

const fg = createVar();
const fgDarker = createVar();
const main = createVar();
const rgbMain = createVar();
const opacity08 = createVar();
const accent = createVar();

export const root = recipe({
    base: [
        interaction(),

        layerStyle('components', {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: vars.size.borderRadius['300'],

            selectors: {
                '&:is(:disabled, [data-disabled="true"])': {
                    opacity: 0.32,
                    pointerEvents: 'none',
                },
            },
        }),
    ],

    defaultVariants: {
        color: 'primary',
        size: 'md',
        variant: 'fill',
        stretch: false,
    },

    variants: {
        size: {
            sm: layerStyle('components', {
                gap: vars.size.space['050'],
                paddingInline: vars.size.space['050'],
                height: vars.size.dimension['300'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            md: layerStyle('components', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space['150'],
                height: vars.size.dimension['400'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight[500],
            }),
            lg: layerStyle('components', {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['200'],
                height: vars.size.dimension['500'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight[500],
            }),
            xl: layerStyle('components', {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['300'],
                height: vars.size.dimension['600'],

                lineHeight: vars.typography.lineHeight[100],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize[100],
                fontWeight: vars.typography.fontWeight[500],
            }),
        },

        color: {
            primary: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.primary,
                    [fgDarker]: vars.color.foreground['primary-darker'],
                    [main]: vars.color.background.primary,
                    [rgbMain]: vars.color.background['rgb-primary'],
                    [opacity08]: `rgb(${vars.color.background['rgb-primary']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
            secondary: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.secondary,
                    [fgDarker]: vars.color.foreground['secondary-darker'],
                    [main]: vars.color.background.secondary,
                    [rgbMain]: vars.color.background['rgb-secondary'],
                    [opacity08]: `rgb(${vars.color.background['rgb-secondary']}, 0.08)`,
                    [accent]: vars.color.foreground['secondary-darker'],
                },
            }),
            success: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.success,
                    [fgDarker]: vars.color.foreground['success-darker'],
                    [main]: vars.color.background.success,
                    [rgbMain]: vars.color.background['rgb-success'],
                    [opacity08]: `rgb(${vars.color.background['rgb-success']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
            warning: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.warning,
                    [fgDarker]: vars.color.foreground['warning-darker'],
                    [main]: vars.color.background.warning,
                    [rgbMain]: vars.color.background['rgb-warning'],
                    [opacity08]: `rgb(${vars.color.background['rgb-warning']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
            danger: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.danger,
                    [fgDarker]: vars.color.foreground['danger-darker'],
                    [main]: vars.color.background.danger,
                    [rgbMain]: vars.color.background['rgb-danger'],
                    [opacity08]: `rgb(${vars.color.background['rgb-danger']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
            contrast: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.contrast,
                    [fgDarker]: vars.color.foreground['contrast-darker'],
                    [main]: vars.color.background.contrast,
                    [rgbMain]: vars.color.background['rgb-contrast'],
                    [opacity08]: `rgb(${vars.color.background['rgb-contrast']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
        },

        variant: {
            fill: layerStyle('components', {
                backgroundColor: main,
                color: accent,
            }),
            outline: layerStyle('components', {
                boxShadow: `inset 0 0 0 1px ${main}`,
                backgroundColor: opacity08,
                color: fgDarker,
            }),
            ghost: [
                layerStyle('components', {
                    backgroundColor: 'transparent',
                    color: fg,
                }),
            ],
        },

        stretch: { true: layerStyle('components', { width: '100%' }) },
    },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof root>>;
