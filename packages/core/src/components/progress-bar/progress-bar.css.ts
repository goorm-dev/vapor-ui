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
    rowGap: vars.size.space['000'],
    columnGap: vars.size.space['050'],
    width: '100%',
});

/** `body2` — the label sits below the value in the hierarchy. */
export const label = componentStyle({
    minWidth: 0,
    lineHeight: vars.typography.lineHeight['075'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight['400'],
});

/** `heading6` — the value is the number the user is watching, so it leads. */
export const value = componentStyle({
    justifySelf: 'end',
    minWidth: 0,
    textAlign: 'right',
    lineHeight: vars.typography.lineHeight['100'],
    letterSpacing: vars.typography.letterSpacing['100'],
    color: vars.color.foreground['normal'],
    fontSize: vars.typography.fontSize['100'],
    fontWeight: vars.typography.fontWeight['500'],
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
    },

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * Size of the track. Controls its height. Default: `'md'`
         */
        size: {
            sm: { height: vars.size.dimension['100'] },
            md: { height: vars.size.dimension['150'] },
            lg: { height: vars.size.dimension['200'] },
        },
    },
});

export const indicator = componentRecipe({
    base: {
        borderRadius: 0,
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
    },

    defaultVariants: { type: 'default' },
    variants: {
        /**
         * Meaning carried by the filled portion. Default: `'default'`
         */
        type: {
            default: {
                backgroundImage: `linear-gradient(to right, ${vars.color.blue['200']}, ${vars.color.background['primary']})`,
            },
            warning: {
                backgroundImage: `linear-gradient(to right, ${vars.color.orange['200']}, ${vars.color.background['warning']})`,
            },
        },
    },
});

export type TrackVariants = NonNullable<RecipeVariants<typeof track>>;
export type IndicatorVariants = NonNullable<RecipeVariants<typeof indicator>>;
