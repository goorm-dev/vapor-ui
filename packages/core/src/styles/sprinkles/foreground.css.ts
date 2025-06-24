import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';

import { vars } from '~/styles/contract.css';

const foregrounds = {
    primary: { color: vars.color.foreground.primary },
    'primary-darker': { color: vars.color.foreground['primary-darker'] },
    secondary: { color: vars.color.foreground.secondary },
    'secondary-darker': { color: vars.color.foreground['secondary-darker'] },
    success: { color: vars.color.foreground.success },
    'success-darker': { color: vars.color.foreground['success-darker'] },
    warning: { color: vars.color.foreground.warning },
    'warning-darker': { color: vars.color.foreground['warning-darker'] },
    danger: { color: vars.color.foreground.danger },
    'danger-darker': { color: vars.color.foreground['danger-darker'] },
    hint: { color: vars.color.foreground.hint },
    'hint-darker': { color: vars.color.foreground['hint-darker'] },
    contrast: { color: vars.color.foreground.contrast },
    'contrast-darker': { color: vars.color.foreground['contrast-darker'] },
    normal: { color: vars.color.foreground.normal },
    'normal-lighter': { color: vars.color.foreground['normal-lighter'] },
    accent: { color: vars.color.foreground.accent },
    'accent-darker': { color: vars.color.foreground['accent-darker'] },
};

const foregroundProperties = defineProperties({
    properties: { foreground: foregrounds },
});

export const foregroundSprinkles = createSprinkles(foregroundProperties);
export type Foreground = keyof typeof foregrounds;
