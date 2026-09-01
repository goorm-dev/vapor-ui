import { keyframes } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

/**
 * The segment only changes position — never brightness or hue — so no flash event
 * can occur (WCAG 2.3.1). See `reports/progressbar-design.md` §3.6.
 */
const sweep = keyframes({
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(333.33%)' },
});

/** Width of the indeterminate segment, as a share of the track. */
const SEGMENT_WIDTH = '30%';
/** Resting position of the segment when motion is reduced. */
const SEGMENT_REST = '35%';

export const root = componentStyle({
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    // The two row gaps differ (label area 8px, description 6px), so they are set on the
    // rows themselves instead of a single `rowGap`.
    rowGap: 0,
    columnGap: vars.size.space['050'],
    width: '100%',
});

/** `subtitle1` — the label and the value share one type style; only colour separates them. */
export const label = componentStyle({
    minWidth: 0,
    lineHeight: vars.typography.lineHeight['075'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight['500'],
});

/** `body2` — one step back from the label, so the task name reads first. */
export const value = componentStyle({
    justifySelf: 'end',
    minWidth: 0,
    textAlign: 'right',
    lineHeight: vars.typography.lineHeight['075'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['hint'],
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight['400'],
});

/**
 * `subtitle1`, spanning the full width under the track. The colour is the only thing the
 * `type` axis changes — the failure itself has to be said in the text (WCAG 2.2 SC 1.4.1).
 */
export const description = componentRecipe({
    base: {
        gridColumn: '1 / -1',
        marginTop: vars.size.space['075'],
        minWidth: 0,
        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing['100'],
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight['500'],
    },

    defaultVariants: { type: 'default' },
    variants: {
        /**
         * Tone of the description text. Default: `'default'`
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
        // Clips the moving indeterminate segment so it never escapes the track radius.
        overflow: 'hidden',

        selectors: {
            // Only a label area above it earns the gap — a track on its own starts at the top.
            '&:not(:first-child)': { marginTop: vars.size.space['100'] },
        },
    },

    defaultVariants: { size: 'md', type: 'default' },
    variants: {
        /**
         * Size of the track. Controls its height. Default: `'md'`
         */
        size: {
            sm: { height: vars.size.dimension['050'] },
            md: { height: vars.size.dimension['075'] },
            lg: { height: vars.size.dimension['150'] },
        },

        /**
         * Tone of the track. Default: `'default'`
         */
        type: {
            default: {},
            // The failure is over: the track dims and drops its indicator instead of
            // showing a fill that would still read as progress.
            error: { opacity: 0.32 },
        },
    },
});

export const indicator = componentStyle({
    borderRadius: vars.size.borderRadius['900'],
    backgroundImage: `linear-gradient(to right, ${vars.color.blue['200']}, ${vars.color.background['primary']})`,
    height: 'inherit',

    selectors: {
        // base-ui gives the indicator no inline width when the value is null,
        // which would otherwise render a full — and therefore complete-looking — bar.
        '&[data-indeterminate]': {
            position: 'absolute',
            insetInlineStart: 0,
            width: SEGMENT_WIDTH,
            animation: `${sweep} 1.5s ease-in-out infinite`,
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
});

export type TrackVariants = NonNullable<RecipeVariants<typeof track>>;
export type DescriptionVariants = NonNullable<RecipeVariants<typeof description>>;
