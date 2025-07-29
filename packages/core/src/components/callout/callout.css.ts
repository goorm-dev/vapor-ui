import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils/layer-style.css';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: layerStyle('components', {
        borderRadius: vars.size.borderRadius[300],
        padding: `${vars.size.space[150]} ${vars.size.space[200]}`,
        width: '100%',

        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing[100],
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight['500'],
        fontStyle: 'normal',
    }),

    defaultVariants: { color: 'primary' },
    variants: {
        color: {
            primary: layerStyle('components', {
                border: `.0625rem solid ${vars.color.background.primary}`,
                backgroundColor: `rgba(${vars.color.background['rgb-primary']}, 0.08)`,
                color: vars.color.foreground['primary-darker'],
            }),
            success: layerStyle('components', {
                border: `.0625rem solid ${vars.color.background['success']}`,
                backgroundColor: `rgba(${vars.color.background['rgb-success']}, 0.08)`,
                color: vars.color.foreground['success-darker'],
            }),
            warning: layerStyle('components', {
                border: `.0625rem solid ${vars.color.background['warning']}`,
                backgroundColor: `rgba(${vars.color.background['rgb-warning']}, 0.08)`,
                color: vars.color.foreground['warning-darker'],
            }),
            danger: layerStyle('components', {
                border: `.0625rem solid ${vars.color.background['danger']}`,
                backgroundColor: `rgba(${vars.color.background['rgb-danger']}, 0.08)`,
                color: vars.color.foreground['danger-darker'],
            }),
            hint: layerStyle('components', {
                border: `.0625rem solid ${vars.color.background['hint']}`,
                backgroundColor: `rgba(${vars.color.background['rgb-hint']}, 0.08)`,
                color: vars.color.foreground['hint-darker'],
            }),
            contrast: layerStyle('components', {
                border: `.0625rem solid ${vars.color.background['contrast']}`,
                backgroundColor: `rgba(${vars.color.background['rgb-contrast']}, 0.08)`,
                color: vars.color.foreground['contrast-darker'],
            }),
        },
    },
});

export type CalloutVariants = NonNullable<RecipeVariants<typeof root>>;
