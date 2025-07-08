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

// const foregroundss = {
//     primary: { color: vars.color.foreground.primary },
//     'primary-darker': { color: vars.color.foreground['primary-darker'] },
//     secondary: { color: vars.color.foreground.secondary },
//     'secondary-darker': { color: vars.color.foreground['secondary-darker'] },
//     success: { color: vars.color.foreground.success },
//     'success-darker': { color: vars.color.foreground['success-darker'] },
//     warning: { color: vars.color.foreground.warning },
//     'warning-darker': { color: vars.color.foreground['warning-darker'] },
//     danger: { color: vars.color.foreground.danger },
//     'danger-darker': { color: vars.color.foreground['danger-darker'] },
//     hint: { color: vars.color.foreground.hint },
//     'hint-darker': { color: vars.color.foreground['hint-darker'] },
//     contrast: { color: vars.color.foreground.contrast },
//     'contrast-darker': { color: vars.color.foreground['contrast-darker'] },
//     normal: { color: vars.color.foreground.normal },
//     'normal-lighter': { color: vars.color.foreground['normal-lighter'] },
//     accent: { color: vars.color.foreground.accent },
// };

// const foregroundProperties = defineProperties({
//     properties: { foreground: foregroundss },
// });

// export const foregroundSprinkles = createSprinkles(foregroundProperties);
// export type Foreground = keyof typeof foregrounds;
