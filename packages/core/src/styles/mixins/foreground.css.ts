import type { RecipeVariants } from '@vanilla-extract/recipes';

import { vars } from '~/styles/themes.css';

import { componentRecipe } from './layer-style.css';

export const foregroundVariants = {
    'primary-100': {
        color: vars.color.foreground.primary[100],
    },
    'primary-200': {
        color: vars.color.foreground.primary[200],
    },
    'secondary-100': {
        color: vars.color.foreground.secondary[100],
    },
    'secondary-200': {
        color: vars.color.foreground.secondary[200],
    },
    'success-100': {
        color: vars.color.foreground.success[100],
    },
    'success-200': {
        color: vars.color.foreground.success[200],
    },
    'warning-100': {
        color: vars.color.foreground.warning[100],
    },
    'warning-200': {
        color: vars.color.foreground.warning[200],
    },
    'danger-100': {
        color: vars.color.foreground.danger[100],
    },
    'danger-200': {
        color: vars.color.foreground.danger[200],
    },
    'hint-100': {
        color: vars.color.foreground.hint[100],
    },
    'hint-200': {
        color: vars.color.foreground.hint[200],
    },
    'contrast-100': {
        color: vars.color.foreground.contrast[100],
    },
    'contrast-200': {
        color: vars.color.foreground.contrast[200],
    },
    'normal-100': {
        color: vars.color.foreground.normal[100],
    },
    'normal-200': {
        color: vars.color.foreground.normal[200],
    },
    inverse: {
        color: vars.color.foreground.inverse,
    },
    white: {
        color: vars.color.white,
    },
};

export const foregrounds = componentRecipe({
    defaultVariants: { color: 'normal-200' },
    variants: {
        color: foregroundVariants,
    },
});

export type Foregrounds = NonNullable<RecipeVariants<typeof foregrounds>>;
