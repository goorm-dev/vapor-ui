import { keyframes } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

/** Width of the indeterminate segment, as a share of the track. */
const SEGMENT_WIDTH = 40;
/**
 * Where the segment's leading edge starts and ends a sweep, as a share of the track. It starts a
 * tenth of the track clear of the left edge and ends well past the right, so each crossing is
 * followed by a rest on an empty track.
 */
const SWEEP_FROM = -(SEGMENT_WIDTH + 10);
const SWEEP_TO = 220;
/** One sweep. Held constant so `SEGMENT_WIDTH` changes the distance covered, never the tempo. */
const SWEEP_DURATION = '1.5s';

// `translateX` resolves against the segment's own width, so a track-relative offset has to be
// divided by that share to survive a change to `SEGMENT_WIDTH`.
const toSegment = (track: number) => `${Number(((track / SEGMENT_WIDTH) * 100).toFixed(2))}%`;

const sweep = keyframes({
    '0%': { transform: `translateX(${toSegment(SWEEP_FROM)})` },
    '100%': { transform: `translateX(${toSegment(SWEEP_TO)})` },
});

/** Resting position of the segment when motion is reduced: centred in the track. */
const SEGMENT_REST = `${(100 - SEGMENT_WIDTH) / 2}%`;

export const root = componentStyle({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    rowGap: 0,
    columnGap: vars.size.space['050'],
    width: '100%',
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

        selectors: {
            '&:not(:first-child)': { marginTop: vars.size.space['100'] },
        },
    },

    defaultVariants: { size: 'md', type: 'default' },
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

        /**
         * Tone of the track.
         * @default 'default'
         */
        type: {
            default: {},
            error: {},
        },
    },
});

export const indicator = componentRecipe({
    base: {
        borderRadius: vars.size.borderRadius['900'],
        backgroundColor: vars.color.background['primary'],
        height: 'inherit',

        selectors: {
            '&[data-indeterminate]': {
                position: 'absolute',
                insetInlineStart: 0,
                width: `${SEGMENT_WIDTH}%`,
                animation: `${sweep} ${SWEEP_DURATION} linear infinite`,
            },
        },

        '@media': {
            '(prefers-reduced-motion: reduce)': {
                selectors: {
                    '&[data-indeterminate]': {
                        insetInlineStart: SEGMENT_REST,
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
            default: {},
            // base-ui writes `width` inline, so the fill rides on `min-width`, which outranks it
            // without an `!important`.
            error: {
                backgroundColor: vars.color.background['danger'],
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
export type IndicatorVariants = NonNullable<RecipeVariants<typeof indicator>>;
