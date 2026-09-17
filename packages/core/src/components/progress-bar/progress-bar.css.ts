import { createGlobalVar, keyframes } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

const INDETERMINATE_WIDTH = 40;
const INDETERMINATE_REST = `${(100 - INDETERMINATE_WIDTH) / 2}%`;

const sweep = keyframes({
    from: { transform: `translateX(-${INDETERMINATE_WIDTH + 10}cqw)` },
    // Well past the right edge, so each crossing is followed by a rest on an empty track.
    to: { transform: 'translateX(220cqw)' },
});

/**
 * Component tokens, mirroring the `progressbar/indicator` variables in the design library.
 * They are declared on the root so a consumer can retheme a single bar by overriding them there.
 */
const tokens = {
    indicatorPrimary: createGlobalVar('vapor-color-progressbar-indicator-background-primary'),
    gradientStart: createGlobalVar(
        'vapor-color-progressbar-indicator-background-primary-gradient-start',
    ),
    gradientMid1: createGlobalVar(
        'vapor-color-progressbar-indicator-background-primary-gradient-mid-1',
    ),
    gradientMid2: createGlobalVar(
        'vapor-color-progressbar-indicator-background-primary-gradient-mid-2',
    ),
    gradientMid3: createGlobalVar(
        'vapor-color-progressbar-indicator-background-primary-gradient-mid-3',
    ),
    gradientEnd: createGlobalVar(
        'vapor-color-progressbar-indicator-background-primary-gradient-end',
    ),
    indicatorDanger: createGlobalVar('vapor-color-progressbar-indicator-background-danger'),
};

// The gradient repeats every 50% of the image, which at 200% is exactly the indicator's width,
// so one pass of the background across it loops seamlessly.
const flow = keyframes({
    to: { backgroundPositionX: '0%' },
});

export const root = componentStyle({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    rowGap: 0,
    columnGap: vars.size.space['050'],
    width: '100%',

    vars: {
        [tokens.indicatorPrimary]: vars.color.background['primary'],
        [tokens.gradientStart]: vars.color.blue['600'],
        [tokens.gradientMid1]: vars.color.blue['300'],
        [tokens.gradientMid2]: vars.color.blue['600'],
        [tokens.gradientMid3]: vars.color.blue['300'],
        [tokens.gradientEnd]: vars.color.blue['600'],
        [tokens.indicatorDanger]: vars.color.background['danger'],
    },
});

export const label = componentStyle([
    typography({ style: 'subtitle1' }),
    {
        color: vars.color.foreground['normal'],
    },
]);

export const value = componentStyle([
    typography({ style: 'body2' }),
    {
        color: vars.color.foreground['hint'],
    },
]);

export const description = componentRecipe({
    base: [
        typography({ style: 'subtitle1' }),
        {
            gridColumn: '1 / -1',
            marginTop: vars.size.space['075'],
            minWidth: 0,
        },
    ],

    defaultVariants: { type: 'default' },
    variants: {
        /**
         * Tone of the description text.
         * @default 'default'
         */
        type: {
            default: { color: vars.color.foreground['secondary'] },
            error: { color: vars.color.foreground['danger'] },
        },
    },
});

export const track = componentRecipe({
    base: {
        position: 'relative',
        gridColumn: '1 / -1',
        borderRadius: vars.size.borderRadius['900'],
        backgroundColor: vars.color.background['secondary-200'],
        width: '100%',
        overflow: 'hidden',
        // Makes `1cqw` one percent of the track's width, for both animations below. A percentage
        // would resolve against the indicator instead, whose width moves with the value.
        containerType: 'inline-size',

        selectors: {
            '&:not(:first-child)': { marginTop: vars.size.space['100'] },
        },
    },

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * Size of the track. Controls its height.
         * @default 'md'
         */
        size: {
            sm: { height: vars.size.dimension['050'] },
            md: { height: vars.size.dimension['075'] },
            lg: { height: vars.size.dimension['150'] },
        },
    },
});

export const indicator = componentRecipe({
    base: {
        transition: 'width 0.2s linear',
        borderRadius: vars.size.borderRadius['900'],
        backgroundColor: tokens.indicatorPrimary,
        height: 'inherit',

        selectors: {
            '&[data-indeterminate]': {
                position: 'absolute',
                insetInlineStart: 0,
                width: `${INDETERMINATE_WIDTH}%`,
                animation: `${sweep} 1.5s linear infinite`,
            },
        },

        '@media': {
            '(prefers-reduced-motion: reduce)': {
                selectors: {
                    '&[data-indeterminate]': {
                        insetInlineStart: INDETERMINATE_REST,
                        animation: 'none',
                    },
                },
            },
        },
    },

    defaultVariants: { type: 'default' },
    variants: {
        /**
         * Tone of the indicator.
         * @default 'default'
         */
        type: {
            default: {
                selectors: {
                    // The indeterminate bar sweeps as a solid band, so it keeps the flat fill.
                    '&:not([data-indeterminate])': {
                        backgroundImage: `linear-gradient(90deg, ${tokens.gradientStart} 0%, ${tokens.gradientMid1} 25%, ${tokens.gradientMid2} 50%, ${tokens.gradientMid3} 75%, ${tokens.gradientEnd} 100%)`,
                        backgroundSize: '200% 100%',
                        animation: `${flow} 1.2s linear infinite`,
                        backgroundPositionX: '100%',
                    },
                },

                '@media': {
                    '(prefers-reduced-motion: reduce)': {
                        selectors: {
                            // Half a period in, so the fill rests mid-gradient rather than on a stop.
                            '&:not([data-indeterminate])': {
                                animation: 'none',
                                backgroundPositionX: '50%',
                            },
                        },
                    },
                },
            },
            // base-ui writes `width` inline, so the fill rides on `min-width`, which outranks it
            // without an `!important`.
            error: {
                backgroundColor: tokens.indicatorDanger,
                minWidth: '100%',
                selectors: {
                    '&[data-indeterminate]': { insetInlineStart: 0, animation: 'none' },
                },
            },
        },
    },
});

export type TrackVariants = NonNullable<RecipeVariants<typeof track>>;
export type DescriptionVariants = NonNullable<RecipeVariants<typeof description>>;
