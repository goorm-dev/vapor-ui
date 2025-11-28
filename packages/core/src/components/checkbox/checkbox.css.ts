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
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            gap: vars.size.space[100],

            border: '0.0625rem solid',
            borderColor: vars.color.border.normal,

            backgroundColor: vars.color.background.canvas[100],
            padding: vars.size.space['000'],
            overflow: 'hidden',

            selectors: {
                '&[data-checked], &[data-indeterminate]': {
                    backgroundColor: vars.color.background.primary[200],
                },

                // NOTE: Prevents interaction styles from being applied when hovering over the label of a disabled radio button.
                '&::before': { borderRadius: '0' },

                '&[data-disabled]::before': { opacity: 0 },
                '&[data-disabled]': { opacity: 0.32, pointerEvents: 'none' },

                '&[data-readonly]': { backgroundColor: vars.color.gray['200'] },
                '&[data-readonly]:active::before': { opacity: 0.08 },

                '&[data-invalid]': { borderColor: vars.color.border.danger },
            },
        }),
    ],

    defaultVariants: { invalid: false, size: 'md' },

    variants: {
        /**
         * 유효성 검사 실패 상태
         * @default false
         */
        invalid: { true: {}, false: {} },

        /**
         * 체크박스 크기
         * @default 'md'
         */
        size: {
            md: layerStyle('components', {
                borderRadius: vars.size.borderRadius[100],
                width: vars.size.dimension[200],
                height: vars.size.dimension[200],
            }),
            lg: layerStyle('components', {
                borderRadius: vars.size.borderRadius[200],
                width: vars.size.dimension[300],
                height: vars.size.dimension[300],
            }),
        },
    },
});

export const indicator = recipe({
    base: layerStyle('components', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: vars.color.white,
        selectors: {
            '&[data-readonly]': {
                color: vars.color.foreground.hint['100'],
            },
        },
    }),

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * 인디케이터 크기
         * @default 'md'
         */
        size: {
            md: layerStyle('components', {
                width: vars.size.dimension[100],
                height: vars.size.dimension[100],
            }),
            lg: layerStyle('components', {
                width: vars.size.dimension[150],
                height: vars.size.dimension[150],
            }),
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
