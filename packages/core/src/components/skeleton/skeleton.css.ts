import { keyframes } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

const shimmerKeyframes = keyframes({
    to: { backgroundPosition: 'right -6.25rem top 0' },
});

const pulseKeyframes = keyframes({
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
});

export const root = recipe({
    base: layerStyle('components', {
        display: 'block',
        overflow: 'hidden',
        width: '100%',
        backgroundColor: vars.color.gray['100'],

        '@media': {
            '(prefers-reduced-motion: reduce)': {
                animation: 'none',
            },
        },
    }),

    defaultVariants: { shape: 'rounded', size: 'md', animation: 'shimmer' },
    variants: {
        /**
         * Controls the border radius of the skeleton.
         */
        shape: {
            rounded: layerStyle('components', {
                borderRadius: '9999px',
            }),
            square: layerStyle('components', {
                borderRadius: '0.5rem',
            }),
        },

        /**
         * Controls the height of the skeleton.
         */
        size: {
            sm: layerStyle('components', { height: vars.size.dimension['200'] }),
            md: layerStyle('components', { height: vars.size.dimension['300'] }),
            lg: layerStyle('components', { height: vars.size.dimension['400'] }),
            xl: layerStyle('components', { height: vars.size.dimension['500'] }),
        },

        /**
         * Controls the animation style of the skeleton.
         */
        animation: {
            shimmer: layerStyle('components', {
                backgroundImage: `linear-gradient(90deg, ${vars.color.gray['100']}, ${vars.color.gray['050']}, ${vars.color.gray['100']})`,
                backgroundPosition: 'left -6.25rem top 0',
                backgroundSize: '6.25rem 100%',
                backgroundRepeat: 'no-repeat',
                animation: `${shimmerKeyframes} 1s ease infinite`,
            }),
            pulse: layerStyle('components', {
                animation: `${pulseKeyframes} 1.2s ease-in-out infinite`,
            }),
            none: layerStyle('components', {
                animation: 'none',
            }),
        },
    },
});

export type SkeletonVariants = NonNullable<RecipeVariants<typeof root>>;
