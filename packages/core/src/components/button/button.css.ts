import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const fg = createVar();
const outlineFg = createVar();
const ghostFg = createVar();
const bg = createVar();
const outlineBg = createVar();
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
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
                paddingInline: vars.size.space['100'],
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
                    [fg]: vars.color.button.foreground.primary,
                    [outlineFg]: vars.color.foreground.primary[200],
                    [ghostFg]: vars.color.foreground.primary[100],
                    [bg]: vars.color.background.primary[200],
                    [outlineBg]: vars.color.background.primary[100],
                    [border]: vars.color.border.primary,
                },
            }),
            secondary: layerStyle('components', {
                vars: {
                    [fg]: vars.color.foreground.secondary[100],
                    [outlineFg]: vars.color.foreground.secondary[200],
                    [ghostFg]: vars.color.foreground.secondary[100],
                    [bg]: vars.color.background.secondary[200],
                    [outlineBg]: vars.color.background.secondary[100],
                    [border]: vars.color.border.secondary,
                },
            }),
            success: layerStyle('components', {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.success[200],
                    [ghostFg]: vars.color.foreground.success[100],
                    [bg]: vars.color.background.success[200],
                    [outlineBg]: vars.color.background.success[100],
                    [border]: vars.color.border.success,
                },
            }),
            warning: layerStyle('components', {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.warning[200],
                    [ghostFg]: vars.color.foreground.warning[100],
                    [bg]: vars.color.background.warning[200],
                    [outlineBg]: vars.color.background.warning[100],
                    [border]: vars.color.border.warning,
                },
            }),
            danger: layerStyle('components', {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.danger[200],
                    [ghostFg]: vars.color.foreground.danger[100],
                    [bg]: vars.color.background.danger[200],
                    [outlineBg]: vars.color.background.danger[100],
                    [border]: vars.color.border.danger,
                },
            }),
            contrast: layerStyle('components', {
                vars: {
                    [fg]: vars.color.white,
                    [outlineFg]: vars.color.foreground.contrast[200],
                    [ghostFg]: vars.color.foreground.contrast[100],
                    [bg]: vars.color.background.contrast[200],
                    [outlineBg]: vars.color.background.contrast[100],
                    [border]: vars.color.border.contrast,
                },
            }),
        },

        variant: {
            fill: layerStyle('components', {
                backgroundColor: bg,
                color: fg,
            }),
            outline: layerStyle('components', {
                boxShadow: `inset 0 0 0 1px ${border}`,
                backgroundColor: outlineBg,
                color: outlineFg,
            }),
            ghost: [
                layerStyle('components', {
                    backgroundColor: 'transparent',
                    color: ghostFg,
                }),
            ],
        },

        stretch: { true: layerStyle('components', { width: '100%' }) },
    },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof root>>;
