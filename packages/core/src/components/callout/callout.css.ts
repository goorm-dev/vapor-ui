import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const root = recipe({
    base: [
        typography({ style: 'subtitle1' }),
        layerStyle('components', {
            display: 'flex',
            alignItems: 'flex-start',
            gap: vars.size.space['075'],
            borderRadius: vars.size.borderRadius[300],
            padding: `${vars.size.space[150]} ${vars.size.space[200]}`,
            width: '100%',
        }),
    ],

    defaultVariants: { color: 'primary' },
    variants: {
        color: {
            primary: layerStyle('components', {
                border: `.0625rem solid ${vars.color.border.primary}`,
                backgroundColor: vars.color.background.primary[100],
                color: vars.color.foreground.primary[200],
            }),
            success: layerStyle('components', {
                border: `.0625rem solid ${vars.color.border.success}`,
                backgroundColor: vars.color.background.success[100],
                color: vars.color.foreground.success[200],
            }),
            warning: layerStyle('components', {
                border: `.0625rem solid ${vars.color.border.warning}`,
                backgroundColor: vars.color.background.warning[100],
                color: vars.color.foreground.warning[200],
            }),
            danger: layerStyle('components', {
                border: `.0625rem solid ${vars.color.border.danger}`,
                backgroundColor: vars.color.background.danger[100],
                color: vars.color.foreground.danger[200],
            }),
            hint: layerStyle('components', {
                border: `.0625rem solid ${vars.color.border.hint}`,
                backgroundColor: vars.color.background.hint[100],
                color: vars.color.foreground.hint[200],
            }),
            contrast: layerStyle('components', {
                border: `.0625rem solid ${vars.color.border.contrast}`,
                backgroundColor: vars.color.background.contrast[100],
                color: vars.color.foreground.contrast[200],
            }),
        },
    },
});

export const icon = layerStyle('components', {
    flex: '0 0 auto',
    height: vars.typography.lineHeight['075'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

export type CalloutVariants = NonNullable<RecipeVariants<typeof root>>;
