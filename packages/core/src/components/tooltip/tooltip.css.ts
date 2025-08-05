import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const content = [
    typography({ style: 'body3' }),
    layerStyle('components', {
        paddingBlock: vars.size.space['075'],
        paddingInline: vars.size.space['100'],
        borderRadius: vars.size.borderRadius['300'],
        backgroundColor: vars.color.background.contrast,
        color: vars.color.white,
        boxShadow: vars.shadow.md,
    }),
];

export const arrow = recipe({
    base: layerStyle('components', {
        display: 'flex',
        color: vars.color.background.contrast,
    }),

    defaultVariants: { side: 'top' },
    variants: {
        side: {
            top: {
                bottom: 0,
                transform: 'translateY(50%) rotate(90deg)',
            },

            right: {
                left: 0,
                transform: 'translateX(-50%) rotate(180deg)',
            },

            bottom: {
                top: 0,
                transform: 'translateY(-50%) rotate(-90deg)',
            },

            left: {
                right: 0,
                transform: 'translateX(50%) rotate(0deg)',
            },
        },
    },
});

export type TooltipArrowVariants = NonNullable<RecipeVariants<typeof arrow>>;
