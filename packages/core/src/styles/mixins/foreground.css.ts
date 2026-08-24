import type { RecipeVariants } from '@vanilla-extract/recipes';

import { vars } from '~/styles/themes.css';

import { componentRecipe } from './layer-style.css';

export const foregroundVariants = {
    'primary-100': { color: vars.color.foreground['primary-100'] },
    'primary-200': { color: vars.color.foreground['primary-200'] },
    primary: { color: vars.color.foreground['primary'] },
    'primary-strong': { color: vars.color.foreground['primary-strong'] },

    'secondary-100': { color: vars.color.foreground['secondary-100'] },
    'secondary-200': { color: vars.color.foreground['secondary-200'] },
    secondary: { color: vars.color.foreground['secondary'] },

    'success-100': { color: vars.color.foreground['success-100'] },
    'success-200': { color: vars.color.foreground['success-200'] },
    success: { color: vars.color.foreground['success'] },
    'success-strong': { color: vars.color.foreground['success-strong'] },

    'warning-100': { color: vars.color.foreground['warning-100'] },
    'warning-200': { color: vars.color.foreground['warning-200'] },
    warning: { color: vars.color.foreground['warning'] },
    'warning-strong': { color: vars.color.foreground['warning-strong'] },

    'danger-100': { color: vars.color.foreground['danger-100'] },
    'danger-200': { color: vars.color.foreground['danger-200'] },
    danger: { color: vars.color.foreground['danger'] },
    'danger-strong': { color: vars.color.foreground['danger-strong'] },

    'hint-100': { color: vars.color.foreground['hint-100'] },
    'hint-200': { color: vars.color.foreground['hint-200'] },
    hint: { color: vars.color.foreground['hint'] },

    'contrast-100': { color: vars.color.foreground['contrast-100'] },
    'contrast-200': { color: vars.color.foreground['contrast-200'] },
    contrast: { color: vars.color.foreground['contrast'] },

    'normal-100': { color: vars.color.foreground['normal-100'] },
    'normal-200': { color: vars.color.foreground['normal-200'] },
    normal: { color: vars.color.foreground['normal'] },

    inverse: { color: vars.color.foreground.inverse },

    white: { color: vars.color.white },
    staticWhite: { color: vars.color.foreground.staticWhite },
    staticBlack: { color: vars.color.foreground.staticBlack },
};

export const foregrounds = componentRecipe({
    defaultVariants: { color: 'normal' },
    variants: { color: foregroundVariants },
});

export type Foregrounds = NonNullable<RecipeVariants<typeof foregrounds>>;
