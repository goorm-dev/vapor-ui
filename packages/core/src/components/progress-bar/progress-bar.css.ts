import { keyframes } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

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
            error: { opacity: 0.32 },
        },
    },
});

export const indicator = componentStyle({
    borderRadius: vars.size.borderRadius['900'],
    backgroundImage: `linear-gradient(to right, ${vars.color.blue['200']}, ${vars.color.background['primary']})`,
    height: 'inherit',

    selectors: {
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
