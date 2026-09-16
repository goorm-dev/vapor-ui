import { keyframes } from '@vanilla-extract/css';
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

const SHIMMER_WIDTH = 'clamp(48px, 35cqw, 96px)';
/**
 * The band crosses the track at a constant 160px/s, so the period follows the track's width.
 * `tan(atan2(a, b))` yields the ratio a/b as a number; Firefox 153 still rejects the plain
 * `a / b`, which drops the declaration and leaves the duration at 0s.
 */
const SHIMMER_DURATION = `calc(tan(atan2(100cqw + ${SHIMMER_WIDTH}, 160px)) * 1s)`;
// Tinting with a blue from the scale would darken the fill in dark mode, where the scale inverts.
const SHIMMER_COLOR = `color-mix(in srgb, ${vars.color.foreground.staticWhite} 40%, transparent)`;

const shimmer = keyframes({
    from: { backgroundPositionX: `calc(-1 * ${SHIMMER_WIDTH})` },
    to: { backgroundPositionX: '100cqw' },
});

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
        borderRadius: vars.size.borderRadius['900'],
        backgroundColor: vars.color.background['primary'],
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
                '@media': {
                    '(prefers-reduced-motion: no-preference)': {
                        selectors: {
                            '&[data-progressing]': {
                                backgroundImage: `linear-gradient(90deg, transparent, ${SHIMMER_COLOR}, transparent)`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: `${SHIMMER_WIDTH} 100%`,
                                animation: `${shimmer} ${SHIMMER_DURATION} linear infinite`,
                            },
                        },
                    },
                },
            },
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
