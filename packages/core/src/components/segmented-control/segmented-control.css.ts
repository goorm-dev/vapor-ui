import { createVar } from '@vanilla-extract/css';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const variables = {
    indicatorLeft: createVar('indicator-left'),
    indicatorWidth: createVar('indicator-width'),
} as const;

const padding = createVar('root-padding');

export const root = componentRecipe({
    base: {
        position: 'relative',

        display: 'flex',

        width: 'fit-content',
        padding: padding,

        border: '1px solid',
        borderColor: vars.color.border.secondary,
        borderRadius: vars.size.borderRadius['300'],

        backgroundColor: vars.color.gray['100'],
    },

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: {
                gap: vars.size.space['050'],
                vars: { [padding]: vars.size.space['025'] },
            },
            md: {
                gap: vars.size.space['050'],
                vars: { [padding]: vars.size.space['025'] },
            },
            lg: {
                gap: vars.size.space['050'],
                vars: { [padding]: vars.size.space['050'] },
            },
        },
    },
});

export const item = componentRecipe({
    base: [
        typography({ style: 'subtitle1' }),
        foregrounds({ color: 'secondary-200' }),
        {
            position: 'relative',
            zIndex: 1,

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

            height: vars.size.dimension['400'],
            padding: `0 ${vars.size.space['200']}`,

            borderRadius: vars.size.borderRadius['300'],

            backgroundColor: 'transparent',
            cursor: 'pointer',

            selectors: {
                [when.disabled()]: {
                    opacity: 0.32,
                    pointerEvents: 'none',
                },
            },
        },
    ],

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: {
                gap: vars.size.space['050'],
                height: vars.size.dimension['300'],
                paddingInline: vars.size.space['100'],
            },
            md: {
                gap: vars.size.space['075'],
                height: vars.size.dimension['400'],
                paddingInline: vars.size.space['150'],
            },
            lg: {
                gap: vars.size.space['100'],
                height: vars.size.dimension['500'],
                paddingInline: vars.size.space['200'],
            },
        },
    },
});

export const iconItem = componentRecipe({
    base: {
        padding: 0,
        aspectRatio: '1 / 1',
    },

    defaultVariants: { size: 'md' },
    variants: {
        size: {
            sm: { width: vars.size.dimension['300'] },
            md: { width: vars.size.dimension['400'] },
            lg: { width: vars.size.dimension['500'] },
        },
    },
});

export const indicator = componentStyle({
    position: 'absolute',
    top: padding,
    bottom: padding,
    left: 0,

    transform: `translateX(${variables.indicatorLeft})`,
    width: `${variables.indicatorWidth}`,

    transitionProperty: 'transform, width',
    transitionDuration: '200ms',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0.6, 1)',

    backgroundColor: vars.color.background.canvas['100'],
    borderRadius: vars.size.borderRadius['300'],
    boxShadow: `inset 0 0 0 0.0625rem ${vars.color.border.secondary}`,

    zIndex: 0,
    pointerEvents: 'none',
});

export type RootVariants = NonNullable<Parameters<typeof root>[0]>;
