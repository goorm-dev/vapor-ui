import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const list = layerStyle('components', {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.size.space['025'],
});

export const item = layerStyle('components', {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
});

// Base style shared by all pagination elements
const baseElement = layerStyle('components', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.size.borderRadius[300],
    color: vars.color.foreground.normal[100],

    selectors: {
        '&[data-disabled]': { pointerEvents: 'none', opacity: 0.32 },
    },
});

// Shared size variants for button-like elements
const sizeVariants = {
    sm: [
        typography({ style: 'subtitle2' }),
        layerStyle('components', {
            width: vars.size.dimension[300],
            height: vars.size.dimension[300],
        }),
    ],
    md: [
        typography({ style: 'subtitle1' }),
        layerStyle('components', {
            width: vars.size.dimension[400],
            height: vars.size.dimension[400],
        }),
    ],
    lg: [
        typography({ style: 'subtitle1' }),
        layerStyle('components', {
            width: vars.size.dimension[500],
            height: vars.size.dimension[500],
        }),
    ],
    xl: [
        typography({ style: 'heading6' }),
        layerStyle('components', {
            width: vars.size.dimension[600],
            height: vars.size.dimension[600],
        }),
    ],
};

// Ellipsis component style
export const ellipsis = recipe({
    base: baseElement,
    defaultVariants: { size: 'md' },
    variants: { size: sizeVariants },
});

// Current page indicator style
export const currentPage = recipe({
    base: [
        baseElement,
        layerStyle('components', {
            backgroundColor: vars.color.background.primary[100],
            color: vars.color.foreground.primary[200],
        }),
    ],
    defaultVariants: { size: 'md' },
    variants: { size: sizeVariants },
});

// Interactive button style
export const button = recipe({
    base: [
        baseElement,
        interaction(),
        layerStyle('components', {
            selectors: {
                '&[data-current]': {
                    backgroundColor: vars.color.background.primary[100],
                    color: vars.color.foreground.primary[200],
                },
            },
        }),
    ],
    defaultVariants: { size: 'md' },
    variants: { size: sizeVariants },
});

export const icon = layerStyle('components', {
    selectors: {
        [`${button.classNames.base} > &:is(svg)`]: {
            width: 'max(16px, 50%)',
            height: 'max(16px, 50%)',
        },
    },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof button>>;
