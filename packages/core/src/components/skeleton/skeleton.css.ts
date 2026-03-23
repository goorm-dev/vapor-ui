import { keyframes } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const shimmerKeyframes = keyframes({
    to: { backgroundPosition: 'right -6.25rem top 0' },
});

const pulseKeyframes = keyframes({
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
});

/**
 * Style variants for the Skeleton component.
 */
export const root = componentRecipe({
    base: {
        display: 'block',
        overflow: 'hidden',
        width: '100%',
        backgroundColor: vars.color.gray['100'],

        '@media': {
            '(prefers-reduced-motion: reduce)': {
                animation: 'none',
            },
        },
    },

    defaultVariants: { shape: 'rounded', size: 'md', animation: 'shimmer' },
    variants: {
        /**
         * Controls the border radius of the skeleton.
         */
        shape: {
            rounded: {
                borderRadius: '9999px',
            },
            square: {
                borderRadius: vars.size.borderRadius['300'],
            },
        },

        /**
         * Controls the height of the skeleton.
         */
        size: {
            sm: { height: vars.size.dimension['200'] },
            md: { height: vars.size.dimension['300'] },
            lg: { height: vars.size.dimension['400'] },
            xl: { height: vars.size.dimension['500'] },
        },

        /**
         * Controls the animation style of the skeleton.
         */
        animation: {
            shimmer: {
                backgroundImage: `linear-gradient(90deg, ${vars.color.gray['100']}, ${vars.color.gray['050']}, ${vars.color.gray['100']})`,
                backgroundPosition: 'left -6.25rem top 0',
                backgroundSize: '6.25rem 100%',
                backgroundRepeat: 'no-repeat',
                animation: `${shimmerKeyframes} 1s ease-in-out infinite`,
            },
            pulse: {
                animation: `${pulseKeyframes} 1.2s ease-in-out infinite`,
            },
            none: {
                animation: 'none',
            },
        },
    },
});

export type SkeletonVariants = NonNullable<RecipeVariants<typeof root>>;
