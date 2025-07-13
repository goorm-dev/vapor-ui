import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '~/styles/vars.css';

import { layerStyle } from '../utils/layer-style.css';

export const foregrounds = recipe({
    defaultVariants: { color: 'normal' },
    variants: {
        color: {
            primary: layerStyle('vapor-component', {
                color: vars.color.foreground.primary,
            }),
            'primary-darker': layerStyle('vapor-component', {
                color: vars.color.foreground['primary-darker'],
            }),
            secondary: layerStyle('vapor-component', {
                color: vars.color.foreground.secondary,
            }),
            'secondary-darker': layerStyle('vapor-component', {
                color: vars.color.foreground['secondary-darker'],
            }),
            success: layerStyle('vapor-component', {
                color: vars.color.foreground.success,
            }),
            'success-darker': layerStyle('vapor-component', {
                color: vars.color.foreground['success-darker'],
            }),
            warning: layerStyle('vapor-component', {
                color: vars.color.foreground.warning,
            }),
            'warning-darker': layerStyle('vapor-component', {
                color: vars.color.foreground['warning-darker'],
            }),
            danger: layerStyle('vapor-component', {
                color: vars.color.foreground.danger,
            }),
            'danger-darker': layerStyle('vapor-component', {
                color: vars.color.foreground['danger-darker'],
            }),
            hint: layerStyle('vapor-component', {
                color: vars.color.foreground.hint,
            }),
            'hint-darker': layerStyle('vapor-component', {
                color: vars.color.foreground['hint-darker'],
            }),
            contrast: layerStyle('vapor-component', {
                color: vars.color.foreground.contrast,
            }),
            'contrast-darker': layerStyle('vapor-component', {
                color: vars.color.foreground['contrast-darker'],
            }),
            normal: layerStyle('vapor-component', {
                color: vars.color.foreground.normal,
            }),
            'normal-lighter': layerStyle('vapor-component', {
                color: vars.color.foreground['normal-lighter'],
            }),
            accent: layerStyle('vapor-component', {
                color: vars.color.foreground.accent,
            }),
        },
    },
});

export type Foregrounds = NonNullable<RecipeVariants<typeof foregrounds>>;
