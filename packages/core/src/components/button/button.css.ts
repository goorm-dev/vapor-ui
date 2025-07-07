import { createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '~/styles/contract.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/utils';

const fg = createVar();
const fgDarker = createVar();
const main = createVar();
const rgbMain = createVar();
const opacity08 = createVar();
const accent = createVar();

export const root = recipe({
    base: [
        interaction(),

        layerStyle('component', {
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
            sm: layerStyle('component', {
                gap: vars.size.space['050'],
                paddingInline: vars.size.space['050'],
                height: vars.size.dimension['300'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
            }),
            md: layerStyle('component', {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space['150'],
                height: vars.size.dimension['400'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight[500],
            }),
            lg: layerStyle('component', {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['200'],
                height: vars.size.dimension['500'],

                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight[500],
            }),
            xl: layerStyle('component', {
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
            primary: layerStyle('component', {
                vars: {
                    [fg]: vars.color.foreground.primary,
                    [fgDarker]: vars.color.foreground['primary-darker'],
                    [main]: vars.color.background.primary,
                    [rgbMain]: vars.color.background['rgb-primary'],
                    [opacity08]: `rgb(${vars.color.background['rgb-primary']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
            secondary: layerStyle('component', {
                vars: {
                    [fg]: vars.color.foreground.secondary,
                    [fgDarker]: vars.color.foreground['secondary-darker'],
                    [main]: vars.color.background.secondary,
                    [rgbMain]: vars.color.background['rgb-secondary'],
                    [opacity08]: `rgb(${vars.color.background['rgb-secondary']}, 0.08)`,
                    [accent]: vars.color.foreground['secondary-darker'],
                },
            }),
            success: layerStyle('component', {
                vars: {
                    [fg]: vars.color.foreground.success,
                    [fgDarker]: vars.color.foreground['success-darker'],
                    [main]: vars.color.background.success,
                    [rgbMain]: vars.color.background['rgb-success'],
                    [opacity08]: `rgb(${vars.color.background['rgb-success']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
            warning: layerStyle('component', {
                vars: {
                    [fg]: vars.color.foreground.warning,
                    [fgDarker]: vars.color.foreground['warning-darker'],
                    [main]: vars.color.background.warning,
                    [rgbMain]: vars.color.background['rgb-warning'],
                    [opacity08]: `rgb(${vars.color.background['rgb-warning']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
            danger: layerStyle('component', {
                vars: {
                    [fg]: vars.color.foreground.danger,
                    [fgDarker]: vars.color.foreground['danger-darker'],
                    [main]: vars.color.background.danger,
                    [rgbMain]: vars.color.background['rgb-danger'],
                    [opacity08]: `rgb(${vars.color.background['rgb-danger']}, 0.08)`,
                    [accent]: vars.color.foreground.accent,
                },
            }),
            contrast: layerStyle('component', {
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
            fill: layerStyle('component', {
                backgroundColor: main,
                color: accent,
            }),
            outline: layerStyle('component', {
                boxShadow: `inset 0 0 0 1px ${main}`,
                backgroundColor: opacity08,
                color: fgDarker,
            }),
            ghost: [
                layerStyle('component', {
                    backgroundColor: 'transparent',
                    color: fg,
                }),
            ],
        },

        stretch: { true: layerStyle('component', { width: '100%' }) },
    },
});
