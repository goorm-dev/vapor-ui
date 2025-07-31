import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '~/styles/vars.css';

import { layerStyle } from '../utils/layer-style.css';

export const foregrounds = recipe({
    defaultVariants: { color: 'normal' },
    variants: {
        color: {
            primary: layerStyle('components', {
                color: vars.color.foreground.primary,
            }),
            'primary-darker': layerStyle('components', {
                color: vars.color.foreground['primary-darker'],
            }),
            secondary: layerStyle('components', {
                color: vars.color.foreground.secondary,
            }),
            'secondary-darker': layerStyle('components', {
                color: vars.color.foreground['secondary-darker'],
            }),
            success: layerStyle('components', {
                color: vars.color.foreground.success,
            }),
            'success-darker': layerStyle('components', {
                color: vars.color.foreground['success-darker'],
            }),
            warning: layerStyle('components', {
                color: vars.color.foreground.warning,
            }),
            'warning-darker': layerStyle('components', {
                color: vars.color.foreground['warning-darker'],
            }),
            danger: layerStyle('components', {
                color: vars.color.foreground.danger,
            }),
            'danger-darker': layerStyle('components', {
                color: vars.color.foreground['danger-darker'],
            }),
            hint: layerStyle('components', {
                color: vars.color.foreground.hint,
            }),
            'hint-darker': layerStyle('components', {
                color: vars.color.foreground['hint-darker'],
            }),
            contrast: layerStyle('components', {
                color: vars.color.foreground.contrast,
            }),
            'contrast-darker': layerStyle('components', {
                color: vars.color.foreground['contrast-darker'],
            }),
            normal: layerStyle('components', {
                color: vars.color.foreground.normal,
            }),
            'normal-lighter': layerStyle('components', {
                color: vars.color.foreground['normal-lighter'],
            }),
            accent: layerStyle('components', {
                color: vars.color.foreground.accent,
            }),
        },
    },
});

export type Foregrounds = NonNullable<RecipeVariants<typeof foregrounds>>;
