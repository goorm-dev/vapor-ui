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
 * Component tokens for the indicator. They are declared on the root so a consumer can retheme a
 * single bar by overriding them there. Names follow the token grammar in `.claude/rules/tokens.md`.
 */
const tokens = {
    background: createGlobalVar('vapor-color-progressbar-indicator-background'),
    gradientFrom: createGlobalVar('vapor-color-progressbar-indicator-background-gradientFrom'),
    gradientTo: createGlobalVar('vapor-color-progressbar-indicator-background-gradientTo'),
    error: createGlobalVar('vapor-color-progressbar-indicator-background-error'),
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
        [tokens.background]: vars.color.background['primary'],
        [tokens.gradientFrom]: vars.color.blue['600'],
        [tokens.gradientTo]: vars.color.blue['300'],
        [tokens.error]: vars.color.background['danger'],
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
        // Shows through for the indeterminate band; the determinate gradient paints over it.
        backgroundColor: tokens.background,
        height: 'inherit',

        selectors: {
            '&[data-indeterminate]': {
                position: 'absolute',
                insetInlineStart: 0,
                width: `${INDETERMINATE_WIDTH}%`,
                animation: `${sweep} 2.2s linear infinite`,
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
                        backgroundImage: `linear-gradient(90deg, ${tokens.gradientFrom} 0%, ${tokens.gradientTo} 25%, ${tokens.gradientFrom} 50%, ${tokens.gradientTo} 75%, ${tokens.gradientFrom} 100%)`,
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
                backgroundColor: tokens.error,
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
