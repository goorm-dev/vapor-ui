import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const list = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.size.space['025'],
});

export const item = componentStyle({
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
});

// Base style shared by all pagination elements
const baseElement = componentStyle({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.size.borderRadius[300],
    color: vars.color.foreground.normal[100],

    selectors: {
        [when.disabled()]: { pointerEvents: 'none', opacity: 0.32 },
    },
});

// Shared size variants for button-like elements
const sizeVariants = {
    sm: [
        typography({ style: 'subtitle2' }),
        {
            width: vars.size.dimension[300],
            height: vars.size.dimension[300],
        },
    ],
    md: [
        typography({ style: 'subtitle1' }),
        {
            width: vars.size.dimension[400],
            height: vars.size.dimension[400],
        },
    ],
    lg: [
        typography({ style: 'subtitle1' }),
        {
            width: vars.size.dimension[500],
            height: vars.size.dimension[500],
        },
    ],
    xl: [
        typography({ style: 'heading6' }),
        {
            width: vars.size.dimension[600],
            height: vars.size.dimension[600],
        },
    ],
};

// Ellipsis component style
export const ellipsis = componentRecipe({
    base: baseElement,
    defaultVariants: { size: 'md' },
    variants: { size: sizeVariants },
});

// Current page indicator style
export const currentPage = componentRecipe({
    base: [
        baseElement,
        {
            backgroundColor: vars.color.background.primary[100],
            color: vars.color.foreground.primary[200],
        },
    ],
    defaultVariants: { size: 'md' },
    variants: { size: sizeVariants },
});

// Interactive button style
export const button = componentRecipe({
    base: [
        baseElement,
        interaction(),
        {
            selectors: {
                '&[data-current]': {
                    backgroundColor: vars.color.background.primary[100],
                    color: vars.color.foreground.primary[200],
                },
            },
        },
    ],
    defaultVariants: { size: 'md' },
    variants: { size: sizeVariants },
});

export const icon = componentStyle({
    selectors: {
        [`${button.classNames.base} > &:is(svg)`]: {
            width: 'max(16px, 50%)',
            height: 'max(16px, 50%)',
        },
    },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof button>>;
