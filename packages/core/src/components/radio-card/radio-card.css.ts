import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/mixins/layer-style.css';
import { vars } from '~/styles/themes.css';

export const root = recipe({
    base: [
        interaction(),
        layerStyle('components', {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: `0.0625rem solid ${vars.color.border.normal}`,
            borderRadius: vars.size.borderRadius[300],
            color: vars.color.foreground.normal[200],
            cursor: 'pointer',

            selectors: {
                '&[data-checked]': {
                    borderColor: vars.color.border.primary,
                },
                '&[data-readonly]': {
                    backgroundColor: vars.color.gray['200'],
                },
                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none', cursor: 'not-allowed' },
                '&[data-invalid]': {
                    borderColor: vars.color.border.danger,
                },
            },
        }),
    ],

    defaultVariants: {
        invalid: false,
        size: 'md',
    },

    variants: {
        invalid: {
            true: {},
        },
        size: {
            md: layerStyle('components', {
                height: vars.size.dimension['400'],
                paddingInline: vars.size.space['150'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
            }),
            lg: layerStyle('components', {
                height: vars.size.dimension['500'],
                paddingInline: vars.size.space['200'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
            }),
        },
    },
});

export type RadioCardVariants = NonNullable<RecipeVariants<typeof root>>;
