import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

// import { interaction } from '~/styles/mixins/interactions.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const root = recipe({
    base: [
        // TODO: interaction 스타일 적용 검토
        // interaction(),
        layerStyle('components', {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center',
            border: `0.0625rem solid ${vars.color.border.secondary}`,
            borderRadius: vars.size.borderRadius[300],
            backgroundColor: vars.color.background.secondary[100],
            color: vars.color.foreground.secondary[200],
            cursor: 'pointer',
            transition: 'border-color 200ms',

            selectors: {
                '&[data-checked]': {
                    borderColor: vars.color.border.primary,
                    backgroundColor: vars.color.background.primary[100],
                    color: vars.color.foreground.primary[200],
                },
                '&:disabled': { opacity: 0.32, pointerEvents: 'none', cursor: 'not-allowed' },
            },
        }),
    ],

    defaultVariants: {
        invalid: false,
        size: 'md',
    },

    variants: {
        invalid: {
            true: layerStyle('components', {
                borderColor: vars.color.border.danger,
                selectors: {
                    '&[data-checked]': {
                        borderColor: vars.color.border.danger,
                    },
                },
            }),
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
                height: vars.size.dimension['400'],
                paddingInline: vars.size.space['150'],
                fontSize: vars.typography.fontSize['075'],
                fontWeight: vars.typography.fontWeight['500'],
                lineHeight: vars.typography.lineHeight['075'],
                letterSpacing: vars.typography.letterSpacing['100'],
            }),
        },
    },
});

export type RadioCardVariants = NonNullable<RecipeVariants<typeof root>>;
