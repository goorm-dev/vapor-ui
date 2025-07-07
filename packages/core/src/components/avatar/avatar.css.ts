import { createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '~/styles/vars.css';
import { layerStyle } from '~/styles/utils/layer-style.css';

const radii = createVar('avatar-border-radius');

export const root = recipe({
    base: layerStyle('vapor-component', {
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: vars.size.space['000'],
        border: `1px solid ${vars.color.border.normal}`,
        padding: vars.size.space['000'],
        overflow: 'hidden',
    }),

    defaultVariants: { size: 'md', shape: 'square' },
    variants: {
        size: {
            sm: layerStyle('vapor-component', {
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
                vars: { [radii]: vars.size.borderRadius[200] },
            }),
            md: layerStyle('vapor-component', {
                width: vars.size.dimension[400],
                height: vars.size.dimension[400],
                vars: { [radii]: vars.size.borderRadius[300] },
            }),
            lg: layerStyle('vapor-component', {
                width: vars.size.dimension[500],
                height: vars.size.dimension[500],
                vars: { [radii]: vars.size.borderRadius[400] },
            }),
            xl: layerStyle('vapor-component', {
                width: vars.size.dimension[600],
                height: vars.size.dimension[600],
                vars: { [radii]: vars.size.borderRadius[400] },
            }),
        },
        shape: {
            square: layerStyle('vapor-component', { borderRadius: radii }),
            circle: layerStyle('vapor-component', { borderRadius: '50%' }),
        },
    },
});

export const fallbackBgVar = createVar('fallback-background-color');

export const fallback = recipe({
    base: layerStyle('vapor-component', {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',

        backgroundColor: fallbackBgVar,
        color: vars.color.foreground.accent,
    }),

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: layerStyle('vapor-component', {
                fontSize: vars.typography.fontSize['050'],
                lineHeight: vars.typography.lineHeight['050'],
                fontWeight: vars.typography.fontWeight['500'],
                letterSpacing: vars.typography.letterSpacing['000'],
            }),
            md: layerStyle('vapor-component', {
                fontSize: vars.typography.fontSize['075'],
                lineHeight: vars.typography.lineHeight['075'],
                fontWeight: vars.typography.fontWeight['500'],
                letterSpacing: vars.typography.letterSpacing['100'],
            }),
            lg: layerStyle('vapor-component', {
                fontSize: vars.typography.fontSize['200'],
                lineHeight: vars.typography.lineHeight['200'],
                fontWeight: vars.typography.fontWeight['700'],
                letterSpacing: vars.typography.letterSpacing['100'],
            }),
            xl: layerStyle('vapor-component', {
                fontSize: vars.typography.fontSize['300'],
                lineHeight: vars.typography.lineHeight['300'],
                fontWeight: vars.typography.fontWeight['700'],
                letterSpacing: vars.typography.letterSpacing['200'],
            }),
        },
    },
});

export const image = layerStyle('vapor-component', {
    display: 'inline',
    objectFit: 'cover',
    width: '100%',
    height: '100%',
});
