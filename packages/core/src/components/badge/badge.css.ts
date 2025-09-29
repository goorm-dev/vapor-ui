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
        /**
         * Badge 색상은 primary, success, warning, danger, contrast, hint 로 제공합니다.
         */
        color: {
            primary: layerStyle('components', {
                color: vars.color.foreground.primary[200],
                backgroundColor: vars.color.background.primary[100],
            }),
            hint: layerStyle('components', {
                color: vars.color.foreground.hint[200],
                backgroundColor: vars.color.background.hint[100],
            }),
            danger: layerStyle('components', {
                color: vars.color.foreground.danger[200],
                backgroundColor: vars.color.background.danger[100],
            }),
            success: layerStyle('components', {
                color: vars.color.foreground.success[200],
                backgroundColor: vars.color.background.success[100],
            }),
            warning: layerStyle('components', {
                color: vars.color.foreground.warning[200],
                backgroundColor: vars.color.background.warning[100],
            }),
            contrast: layerStyle('components', {
                color: vars.color.foreground.contrast[200],
                backgroundColor: vars.color.background.contrast[100],
            }),
        },

        /**
         * Badge의 모양은 square, pill 로 제공합니다.
         */
        shape: {
            square: layerStyle('components', {
                borderRadius: vars.size.borderRadius['300'],
            }),
            pill: layerStyle('components', {
                borderRadius: '9999px',
            }),
        },

        /**
         * Badge의 크기는 sm, md, lg 로 제공합니다.
         */
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
