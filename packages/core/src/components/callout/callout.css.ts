import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const root = componentRecipe({
    base: [
        typography({ style: 'subtitle1' }),
        {
            display: 'flex',
            alignItems: 'flex-start',
            gap: vars.size.space['075'],
            borderRadius: vars.size.borderRadius[300],
            padding: `${vars.size.space[150]} ${vars.size.space[200]}`,
            width: '100%',
        },
    ],

    defaultVariants: { colorPalette: 'primary' },
    variants: {
        colorPalette: {
            primary: {
                border: `.0625rem solid ${vars.color.border.primary}`,
                backgroundColor: vars.color.background['primary-weak'],
                color: vars.color.foreground['primary-strong'],
            },
            success: {
                border: `.0625rem solid ${vars.color.border.success}`,
                backgroundColor: vars.color.background['success-weak'],
                color: vars.color.foreground['success-strong'],
            },
            warning: {
                border: `.0625rem solid ${vars.color.border.warning}`,
                backgroundColor: vars.color.background['warning-weak'],
                color: vars.color.foreground['warning-strong'],
            },
            danger: {
                border: `.0625rem solid ${vars.color.border.danger}`,
                backgroundColor: vars.color.background['danger-weak'],
                color: vars.color.foreground['danger-strong'],
            },
            hint: {
                border: `.0625rem solid ${vars.color.border.hint}`,
                backgroundColor: vars.color.background['hint-weak'],
                color: vars.color.foreground['secondary'],
            },
            contrast: {
                border: `.0625rem solid ${vars.color.border.contrast}`,
                backgroundColor: vars.color.background['contrast-weak'],
                color: vars.color.foreground['inverse'],
            },
        },
    },
});

export const icon = componentStyle({
    display: 'flex',
    flex: '0 0 auto',
    alignItems: 'center',
    justifyContent: 'center',
    height: vars.typography.lineHeight['075'],
});

export type CalloutVariants = NonNullable<RecipeVariants<typeof root>>;
