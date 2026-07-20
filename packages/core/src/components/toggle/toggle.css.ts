import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

const variables = {
    backgroundColor: createVar('background-color'),
};

export const root = componentRecipe({
    base: [
        interaction({ scale: 'light' }),
        {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',

            aspectRatio: '1 / 1',

            backgroundColor: vars.color.background.canvas[100],
            borderRadius: vars.size.borderRadius['300'],

            selectors: {
                '&[data-pressed]': { backgroundColor: variables.backgroundColor },
                [when.disabled()]: { pointerEvents: 'none', opacity: 0.32 },
            },
        },
    ],

    defaultVariants: { size: 'md', variant: 'default' },
    variants: {
        size: {
            sm: { height: vars.size.dimension['300'], gap: vars.size.space['075'] },
            md: { height: vars.size.dimension['400'], gap: vars.size.space['075'] },
            lg: { height: vars.size.dimension['500'], gap: vars.size.space['075'] },
            xl: { height: vars.size.dimension['600'], gap: vars.size.space['100'] },
        },
        variant: {
            default: {
                color: vars.color.foreground.hint[200],

                vars: {
                    [variables.backgroundColor]: vars.color.background.hint[100],
                },
            },
            accent: {
                color: vars.color.foreground.primary[100],

                vars: {
                    [variables.backgroundColor]: vars.color.background.primary[100],
                },
            },
        },
    },
});

export const icon = componentStyle({
    selectors: {
        [`${root.classNames.base} > &:is(svg)`]: {
            width: 'max(16px, 50%)',
            height: 'max(16px, 50%)',
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
