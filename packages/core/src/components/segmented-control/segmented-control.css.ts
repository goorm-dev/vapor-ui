import { createVar } from '@vanilla-extract/css';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
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

        border: '1px solid',
        borderRadius: vars.size.borderRadius['300'],

        borderColor: vars.color.border.secondary,
        backgroundColor: vars.color.gray['100'],
        padding: padding,

        width: 'fit-content',
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
        interaction(),
        typography({ style: 'subtitle1' }),
        foregrounds({ color: 'secondary-200' }),
        {
            position: 'relative',
            zIndex: 1,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: 'transparent',

            cursor: 'pointer',

            padding: `0 ${vars.size.space['200']}`,
            height: vars.size.dimension['400'],

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
                paddingInline: vars.size.space['100'],
                height: vars.size.dimension['300'],
            },
            md: {
                gap: vars.size.space['075'],
                paddingInline: vars.size.space['150'],
                height: vars.size.dimension['400'],
            },
            lg: {
                gap: vars.size.space['100'],
                paddingInline: vars.size.space['200'],
                height: vars.size.dimension['500'],
            },
        },
    },
});

export const iconItem = componentRecipe({
    base: {
        aspectRatio: '1 / 1',
        padding: 0,
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
    zIndex: 0,
    top: padding,
    bottom: padding,

    left: 0,
    transform: `translateX(${variables.indicatorLeft})`,

    transitionDuration: '200ms',
    transitionProperty: 'transform, width',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0.6, 1)',

    borderRadius: vars.size.borderRadius['300'],
    boxShadow: `inset 0 0 0 0.0625rem ${vars.color.border.secondary}`,
    backgroundColor: vars.color.background.canvas['100'],

    pointerEvents: 'none',
    width: `${variables.indicatorWidth}`,
});

export type RootVariants = NonNullable<Parameters<typeof root>[0]>;
